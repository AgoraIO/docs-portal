import { spawnSync } from 'node:child_process';
// @vitest-environment node
import {
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import type { KbTarget } from './bailian-config';
import { openSyncStore } from './sync-state.server';

const roots: string[] = [];
const target: KbTarget = {
  schema: 1,
  environment: 'local-demo',
  region: 'cn-beijing',
  workspaceId: 'llm-test',
  categoryId: 'cat',
  name: 'demo',
  origin: 'https://doc.shengwang.cn',
  scope: 'test',
};
async function directory() {
  const d = await realpath(await mkdtemp(join(tmpdir(), 'kb-store-')));
  roots.push(d);
  return join(d, 'state');
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});
it('excludes a second process and persists immutable snapshots across reopen', async () => {
  const d = await directory();
  const a = await openSyncStore({ directory: d, target });
  const previous = a.snapshot;
  const child = spawnSync(
    'bun',
    [
      '-e',
      "import { openSyncStore } from './src/lib/ai-kb/sync-state.server.ts'; try { await openSyncStore(JSON.parse(process.env.KB_TEST_INPUT)); process.exit(2); } catch { process.exit(0); }",
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        KB_TEST_INPUT: JSON.stringify({ directory: d, target }),
      },
    },
  );
  expect(child.status).toBe(0);
  await expect(openSyncStore({ directory: d, target })).rejects.toThrow(
    /lock/i,
  );
  await a.save({ ...previous, generation: 1 }, 0);
  expect(previous.generation).toBe(0);
  await expect(a.save({ ...a.snapshot, generation: 2 }, 0)).rejects.toThrow(
    /generation/i,
  );
  await a.close();
  const b = await openSyncStore({ directory: d, target });
  expect(b.snapshot.generation).toBe(1);
  expect((await stat(join(d, 'state.json'))).mode & 0o777).toBe(0o600);
  await b.close();
});
it('rejects target or selection changes and existing index adoption', async () => {
  const d = await directory();
  const a = await openSyncStore({ directory: d, target });
  await a.save({ ...a.snapshot, generation: 1 }, 0);
  await a.close();
  for (const change of [
    { indexId: 'other' },
    { categoryId: 'other' },
    { selection: ['/zh-CN/ai/a'] },
  ])
    await expect(
      openSyncStore({ directory: d, target: { ...target, ...change } }),
    ).rejects.toThrow(/target/i);
  const fresh = await directory();
  await expect(
    openSyncStore({
      directory: fresh,
      target: { ...target, indexId: 'existing' },
    }),
  ).rejects.toThrow(/adopt/i);
});
it('binds a newly created index once and refuses replacement', async () => {
  const d = await directory();
  const a = await openSyncStore({ directory: d, target });
  await a.save(
    {
      ...a.snapshot,
      generation: 1,
      indexId: 'new',
      bootstrap: { operationId: 'operation', jobId: 'job' },
    },
    0,
  );
  await expect(
    a.save({ ...a.snapshot, generation: 2, indexId: 'other' }, 1),
  ).rejects.toThrow(/binding/i);
  await a.close();
});
it('fails closed on partial JSON, unknown fields, and symlink paths without stealing crash locks', async () => {
  const d = await directory();
  const a = await openSyncStore({ directory: d, target });
  await a.save({ ...a.snapshot, generation: 1 }, 0);
  await a.close();
  const saved = await readFile(join(d, 'state.json'), 'utf8');
  await writeFile(join(d, 'state.json'), '{');
  await expect(openSyncStore({ directory: d, target })).rejects.toThrow(
    /state/i,
  );
  await writeFile(
    join(d, 'state.json'),
    JSON.stringify({ ...JSON.parse(saved), apiKey: 'never persist' }),
  );
  await expect(openSyncStore({ directory: d, target })).rejects.toThrow(
    /state/i,
  );
  await writeFile(join(d, 'state.json'), saved);
  await writeFile(join(d, 'writer.lock'), 'crashed');
  await expect(openSyncStore({ directory: d, target })).rejects.toThrow(
    /lock/i,
  );
  const alias = join(d, '..', 'alias');
  await symlink(d, alias);
  await expect(openSyncStore({ directory: alias, target })).rejects.toThrow(
    /symlink/i,
  );
});
it('retains write intent on disk and excludes unfinished entries from successful projection', async () => {
  const d = await directory();
  const a = await openSyncStore({ directory: d, target });
  await a.save(
    {
      ...a.snapshot,
      generation: 1,
      pending: [
        {
          id: 'op',
          sourceId: '/zh-CN/ai/a',
          desiredHash: 'a'.repeat(64),
          phase: 'uploading',
          intent: 'register',
          oldRemote: [],
          newRemote: [],
        },
      ],
    },
    0,
  );
  await a.close();
  const b = await openSyncStore({ directory: d, target });
  expect(b.snapshot.pending[0].intent).toBe('register');
  expect(b.successful().entries).toEqual([]);
  await b.close();
});
