import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  unlink,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { type KbTarget, parseKbTarget, targetIdentity } from './bailian-config';
import { assertKbPath } from './corpus';
import { type KbSuccessfulState, parseKbSuccessfulState } from './plan';

export type RemoteDocument = {
  fileId: string;
  documentId: string;
  jobId: string;
};
export type PendingOperation = {
  id: string;
  sourceId: string;
  desiredHash: string;
  phase:
    | 'prepared'
    | 'uploading'
    | 'registered'
    | 'importing'
    | 'verifying'
    | 'cleanup-pending'
    | 'done'
    | 'needs-reconciliation';
  intent?: 'lease' | 'put' | 'register' | 'create' | 'import' | 'delete';
  fileId?: string;
  jobId?: string;
  deleted?: boolean;
  oldRemote: RemoteDocument[];
  newRemote: RemoteDocument[];
};
export type SyncSnapshot = {
  schema: 1;
  target: KbTarget;
  identity: string;
  generation: number;
  indexId?: string;
  bootstrap?: { operationId: string; jobId: string };
  entries: { sourceId: string; hash: string; remote: RemoteDocument[] }[];
  pending: PendingOperation[];
};
const clone = <T>(value: T): T => structuredClone(value);
function validId(v: unknown) {
  if (typeof v !== 'string' || !/^[a-zA-Z0-9_.:-]{1,256}$/.test(v))
    throw new Error('Invalid state ID');
}
function hash(v: unknown) {
  if (typeof v !== 'string' || !/^[a-f0-9]{64}$/.test(v))
    throw new Error('Invalid state hash');
}
function keys(v: object, allowed: string[]) {
  if (Object.keys(v).some((k) => !allowed.includes(k)))
    throw new Error('Unknown state field');
}
function remote(v: RemoteDocument) {
  keys(v, ['fileId', 'documentId', 'jobId']);
  validId(v.fileId);
  validId(v.documentId);
  validId(v.jobId);
}
function validate(s: SyncSnapshot): SyncSnapshot {
  try {
    keys(s, [
      'schema',
      'target',
      'identity',
      'generation',
      'indexId',
      'bootstrap',
      'entries',
      'pending',
    ]);
    if (
      s.schema !== 1 ||
      JSON.stringify(s.target) !== JSON.stringify(parseKbTarget(s.target)) ||
      s.identity !== targetIdentity(s.target) ||
      !Number.isSafeInteger(s.generation) ||
      s.generation < 0
    )
      throw new Error();
    if (s.indexId !== undefined) validId(s.indexId);
    if (s.bootstrap) {
      keys(s.bootstrap, ['operationId', 'jobId']);
      validId(s.bootstrap.operationId);
      validId(s.bootstrap.jobId);
      if (!s.indexId) throw new Error();
    }
    if (!Array.isArray(s.entries) || !Array.isArray(s.pending))
      throw new Error();
    const owned = new Set<string>();
    for (const e of s.entries) {
      keys(e, ['sourceId', 'hash', 'remote']);
      assertKbPath(e.sourceId);
      hash(e.hash);
      if (!e.remote.length) throw new Error();
      for (const r of e.remote) {
        remote(r);
        if (owned.has(r.documentId)) throw new Error();
        owned.add(r.documentId);
      }
    }
    if (new Set(s.entries.map((e) => e.sourceId)).size !== s.entries.length)
      throw new Error();
    const active = new Set<string>();
    const opIds = new Set<string>();
    for (const p of s.pending) {
      keys(p, [
        'id',
        'sourceId',
        'desiredHash',
        'phase',
        'intent',
        'fileId',
        'jobId',
        'deleted',
        'oldRemote',
        'newRemote',
      ]);
      validId(p.id);
      assertKbPath(p.sourceId);
      hash(p.desiredHash);
      if (active.has(p.sourceId) || opIds.has(p.id)) throw new Error();
      active.add(p.sourceId);
      opIds.add(p.id);
      if (
        ![
          'prepared',
          'uploading',
          'registered',
          'importing',
          'verifying',
          'cleanup-pending',
          'done',
          'needs-reconciliation',
        ].includes(p.phase)
      )
        throw new Error();
      if (
        p.intent !== undefined &&
        !['lease', 'put', 'register', 'create', 'import', 'delete'].includes(
          p.intent,
        )
      )
        throw new Error();
      if (p.fileId !== undefined) validId(p.fileId);
      if (p.jobId !== undefined) validId(p.jobId);
      if (p.deleted !== undefined && p.deleted !== true) throw new Error();
      p.oldRemote.forEach(remote);
      p.newRemote.forEach(remote);
      const old =
        s.entries.find((e) => e.sourceId === p.sourceId)?.remote ?? [];
      if (JSON.stringify(old) !== JSON.stringify(p.oldRemote))
        throw new Error();
      for (const r of p.newRemote)
        if (owned.has(r.documentId)) throw new Error();
    }
    parseKbSuccessfulState(projection(s));
    return clone(s);
  } catch {
    throw new Error('Invalid sync state');
  }
}
function projection(s: SyncSnapshot): KbSuccessfulState {
  return {
    schema: 1,
    scope: s.target.scope,
    generation: s.generation,
    ...(s.target.selection ? { selection: s.target.selection } : {}),
    entries: s.entries.map((e) => ({
      sourceId: e.sourceId,
      hash: e.hash,
      remoteIds: e.remote.map((r) => r.documentId),
    })),
  };
}
async function safeDirectory(directory: string) {
  const absolute = resolve(directory);
  let current = absolute;
  while (true) {
    try {
      if ((await lstat(current)).isSymbolicLink())
        throw new Error('State symlink rejected');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  await mkdir(absolute, { recursive: true, mode: 0o700 });
  // Callers must supply canonical paths, including macOS /private/var temporary paths.
  return realpath(absolute);
}
export async function openSyncStore(input: {
  directory: string;
  target: KbTarget;
}) {
  const target = parseKbTarget(input.target);
  const identity = targetIdentity(target);
  const directory = await safeDirectory(input.directory);
  const lockPath = join(directory, 'writer.lock');
  const statePath = join(directory, 'state.json');
  let lock: Awaited<ReturnType<typeof open>>;
  try {
    lock = await open(
      lockPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
  } catch {
    throw new Error(
      'State writer lock unavailable; inspect owner before manual recovery',
    );
  }
  const token = randomUUID();
  let closed = false;
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, token }));
    await lock.sync();
    let snapshot: SyncSnapshot;
    try {
      const handle = await open(
        statePath,
        constants.O_RDONLY | constants.O_NOFOLLOW,
      );
      let data: string;
      try {
        data = await handle.readFile('utf8');
      } finally {
        await handle.close();
      }
      try {
        snapshot = validate(JSON.parse(data));
      } catch {
        throw new Error('Invalid sync state');
      }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      if (target.indexId)
        throw new Error('Cannot adopt existing index without owned state');
      snapshot = {
        schema: 1,
        target,
        identity,
        generation: 0,
        entries: [],
        pending: [],
      };
    }
    if (snapshot.identity !== identity)
      throw new Error('State target mismatch');
    const store = {
      get snapshot() {
        return clone(snapshot);
      },
      successful() {
        return clone(projection(snapshot));
      },
      async save(next: SyncSnapshot, expectedGeneration: number) {
        if (closed) throw new Error('Store closed');
        if (
          expectedGeneration !== snapshot.generation ||
          next.generation !== expectedGeneration + 1
        )
          throw new Error('State generation conflict');
        const checked = validate(next);
        if (
          checked.identity !== identity ||
          (snapshot.indexId && checked.indexId !== snapshot.indexId) ||
          (!snapshot.indexId && checked.indexId && !checked.bootstrap)
        )
          throw new Error('State target binding conflict');
        const temp = join(directory, `.state-${randomUUID()}.tmp`);
        const file = await open(
          temp,
          constants.O_WRONLY |
            constants.O_CREAT |
            constants.O_EXCL |
            constants.O_NOFOLLOW,
          0o600,
        );
        try {
          await file.writeFile(`${JSON.stringify(checked, null, 2)}\n`);
          await file.sync();
        } finally {
          await file.close();
        }
        try {
          await rename(temp, statePath);
          const dir = await open(directory, constants.O_RDONLY);
          try {
            await dir.sync();
          } finally {
            await dir.close();
          }
        } catch (e) {
          closed = true;
          throw e;
        }
        snapshot = checked;
      },
      async close() {
        if (closed) {
          await lock.close();
          return;
        }
        closed = true;
        await lock.close();
        const data = JSON.parse(await readFile(lockPath, 'utf8'));
        if (data.token !== token) throw new Error('Lock ownership changed');
        await unlink(lockPath);
      },
    };
    return store;
  } catch (e) {
    await lock.close();
    await unlink(lockPath);
    throw e;
  }
}
export type SyncStore = Awaited<ReturnType<typeof openSyncStore>>;
