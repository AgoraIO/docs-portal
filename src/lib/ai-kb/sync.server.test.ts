// @vitest-environment node
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { BailianError } from './bailian-client.server';
import { createKbDocument, type KbCorpus } from './corpus';
import { runKbSync as executeSync, type SyncAdapter } from './sync.server';
import { openSyncStore, type SyncStore } from './sync-state.server';

const runKbSync = (input: Parameters<typeof executeSync>[0]) =>
  executeSync({ verifyRevision: async () => true, ...input });
const roots: string[] = [];
const stores: SyncStore[] = [];
afterEach(async () => {
  for (const s of stores.splice(0)) await s.close();
  await Promise.all(
    roots.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});
const doc = (content = 'first', path = '/zh-CN/ai/a') =>
  createKbDocument({
    content,
    metadata: {
      url: path,
      canonicalUrl: path,
      title: 'A',
      locale: 'zh-CN',
      products: ['rtc'],
      platforms: ['web'],
      docType: 'docs',
      sections: [],
    },
  });
const corpus = (docs = [doc()]): KbCorpus => ({
  schema: 1,
  scope: 'test',
  revision:
    docs.length === 1 && docs[0].hash === doc().hash
      ? 'rev'
      : docs.map((d) => d.hash).join('-'),
  complete: true,
  documents: docs,
});
async function store() {
  const d = await realpath(await mkdtemp(join(tmpdir(), 'kb-executor-')));
  roots.push(d);
  const s = await openSyncStore({
    directory: join(d, 'state'),
    target: {
      schema: 1,
      environment: 'local-demo',
      region: 'cn-beijing',
      workspaceId: 'llm-test',
      categoryId: 'cat',
      name: 'demo',
      origin: 'https://doc.shengwang.cn',
      scope: 'test',
    },
  });
  stores.push(s);
  return s;
}
function fake() {
  let next = 0;
  const writes: string[] = [];
  const live = new Set<string>();
  let rejectDelete = false,
    unknownCreate = false,
    notFinished = false,
    ignoreDelete = false;
  const adapter: SyncAdapter = {
    async lease() {
      writes.push('lease');
      return {
        leaseId: 'lease',
        url: 'https://bucket.aliyuncs.com/temporary',
        headers: {},
      };
    },
    async putFile() {
      writes.push('put');
    },
    async registerFile() {
      const id = `file-${++next}`;
      writes.push(id);
      return id;
    },
    async createIndex({ fileIds }) {
      writes.push('create');
      fileIds.forEach((id) => {
        live.add(id);
      });
      if (unknownCreate) throw new BailianError('TRANSPORT');
      return { indexId: 'kb', jobId: 'job-1' };
    },
    async submitImport({ fileIds }) {
      writes.push('import');
      fileIds.forEach((id) => {
        live.add(id);
      });
      return `job-${next}`;
    },
    async completedJob({ fileIds, jobId }) {
      return notFinished
        ? null
        : fileIds.map((documentId) => ({
            documentId,
            jobId,
            code: 'FINISH',
            status: 'FINISH',
          }));
    },
    async documents() {
      return [...live].map((documentId) => ({
        documentId,
        code: 'FINISH',
        status: 'FINISH',
      }));
    },
    async deleteDocuments({ documentIds }) {
      writes.push('delete');
      if (rejectDelete) {
        rejectDelete = false;
        throw new BailianError('HTTP_429');
      }
      if (!ignoreDelete)
        documentIds.forEach((id) => {
          live.delete(id);
        });
      return [];
    },
  };
  return {
    adapter,
    writes,
    live,
    set rejectDelete(v: boolean) {
      rejectDelete = v;
    },
    set unknownCreate(v: boolean) {
      unknownCreate = v;
    },
    set notFinished(v: boolean) {
      notFinished = v;
    },
    set ignoreDelete(v: boolean) {
      ignoreDelete = v;
    },
  };
}
const verify = async () => true;
it('imports once, skips unchanged content and revision-only changes with zero writes', async () => {
  const s = await store(),
    f = fake();
  expect(
    (
      await runKbSync({
        corpus: corpus(),
        store: s,
        adapter: f.adapter,
        verify,
      })
    ).status,
  ).toBe('complete');
  expect(s.successful().entries[0].remoteIds).toEqual(['file-1']);
  const writes = [...f.writes];
  await runKbSync({
    corpus: { ...corpus(), revision: 'new' },
    store: s,
    adapter: f.adapter,
    verify,
  });
  expect(f.writes).toEqual(writes);
});
it('resumes rejected old-version cleanup without uploading the new version again', async () => {
  const s = await store(),
    f = fake();
  await runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify });
  f.rejectDelete = true;
  await expect(
    runKbSync({
      corpus: corpus([doc('changed')]),
      store: s,
      adapter: f.adapter,
      verify,
    }),
  ).rejects.toThrow();
  expect(s.snapshot.pending[0].phase).toBe('cleanup-pending');
  expect([...f.live]).toEqual(['file-1', 'file-2']);
  const uploads = f.writes.filter((w) => w === 'put').length;
  await runKbSync({
    corpus: corpus([doc('changed')]),
    store: s,
    adapter: f.adapter,
    verify,
  });
  expect(f.writes.filter((w) => w === 'put')).toHaveLength(uploads);
  expect([...f.live]).toEqual(['file-2']);
  expect(s.successful().entries[0].hash).toBe(doc('changed').hash);
});
it('does not advance successful state without retrieval evidence even after indexing', async () => {
  const s = await store(),
    f = fake();
  expect(
    (await runKbSync({ corpus: corpus(), store: s, adapter: f.adapter }))
      .status,
  ).toBe('verifying');
  expect(s.successful().entries).toEqual([]);
  const writes = [...f.writes];
  await runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify });
  expect(f.writes).toEqual(writes);
  expect(s.successful().entries).toHaveLength(1);
});
it('retains import work when task is pending and refuses a changed corpus during resume', async () => {
  const s = await store(),
    f = fake();
  f.notFinished = true;
  expect(
    (
      await runKbSync({
        corpus: corpus(),
        store: s,
        adapter: f.adapter,
        verify,
      })
    ).status,
  ).toBe('indexing');
  const writes = [...f.writes];
  await expect(
    runKbSync({
      corpus: corpus([doc('other')]),
      store: s,
      adapter: f.adapter,
      verify,
    }),
  ).rejects.toThrow(/pending/i);
  expect(f.writes).toEqual(writes);
  f.notFinished = false;
  await runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify });
  expect(f.writes).toEqual(writes);
});
it('never retries unknown creation or guesses ownership from a name', async () => {
  const s = await store(),
    f = fake();
  f.unknownCreate = true;
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow();
  const writes = [...f.writes];
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow(/reconciliation/i);
  expect(f.writes).toEqual(writes);
  expect(s.successful().entries).toEqual([]);
});
it('requires an exact reviewed deletion set and verifies absence rather than a delete receipt', async () => {
  const s = await store(),
    f = fake();
  const both = corpus([doc(), doc('B', '/zh-CN/ai/b')]);
  await runKbSync({ corpus: both, store: s, adapter: f.adapter, verify });
  const reduced = corpus();
  await expect(
    runKbSync({ corpus: reduced, store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow(/deletion/i);
  const deletionApproval = {
    identity: s.snapshot.identity,
    generation: s.snapshot.generation,
    sourceIds: ['/zh-CN/ai/b'],
  };
  f.ignoreDelete = true;
  await expect(
    runKbSync({
      corpus: reduced,
      store: s,
      adapter: f.adapter,
      verify,
      deletionApproval,
    }),
  ).rejects.toThrow(/absence/i);
  expect(s.successful().entries).toHaveLength(2);
});
it('journals before writes and stops remote effects if persistence fails', async () => {
  const s = await store(),
    f = fake();
  const broken = {
    ...s,
    save: async () => {
      throw new Error('disk full');
    },
  };
  await expect(
    runKbSync({ corpus: corpus(), store: broken, adapter: f.adapter, verify }),
  ).rejects.toThrow('disk full');
  expect(f.writes).toEqual([]);
});
it('reopens an interrupted registration intent without repeating remote writes', async () => {
  const s = await store(),
    f = fake();
  f.adapter.registerFile = async () => {
    f.writes.push('register-unknown');
    throw new BailianError('TRANSPORT');
  };
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow();
  const pending = s.snapshot.pending[0];
  expect(pending.intent).toBe('register');
  expect(s.successful().entries).toEqual([]);
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow(/reconciliation/i);
  expect(f.writes.filter((w) => w === 'register-unknown')).toHaveLength(1);
});
it('rejects empty, incomplete and mismatched scopes before any remote write', async () => {
  const s = await store(),
    f = fake();
  for (const bad of [
    { ...corpus(), documents: [] },
    { ...corpus(), complete: false },
    { ...corpus(), scope: 'wrong' },
  ])
    await expect(
      runKbSync({
        corpus: bad as KbCorpus,
        store: s,
        adapter: f.adapter,
        verify,
      }),
    ).rejects.toThrow();
  expect(f.writes).toEqual([]);
});
it('rejects a superseded corpus and same-revision artifact mutation before writes', async () => {
  const s = await store(),
    f = fake();
  const first = corpus();
  const second = { ...corpus([doc('next')]), revision: 'new-revision' };
  await runKbSync({ corpus: first, store: s, adapter: f.adapter, verify });
  await runKbSync({
    corpus: second,
    store: s,
    adapter: f.adapter,
    verify,
    verifyRevision: async (previous, next) =>
      previous === 'rev' && next === 'new-revision',
  });
  const writes = [...f.writes];
  await expect(
    runKbSync({
      corpus: first,
      store: s,
      adapter: f.adapter,
      verify,
      verifyRevision: async () => false,
    }),
  ).rejects.toThrow(/revision/i);
  await expect(
    runKbSync({
      corpus: { ...second, documents: [doc('mutated')] },
      store: s,
      adapter: f.adapter,
      verify,
      verifyRevision: async () => true,
    }),
  ).rejects.toThrow(/revision/i);
  expect(f.writes).toEqual(writes);
});
it('persists safe remote error and request ID without raw exception text', async () => {
  const s = await store(),
    f = fake();
  f.adapter.registerFile = async () => {
    throw new BailianError('HTTP_429', 'request-safe');
  };
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow();
  expect(s.snapshot.pending[0]).toMatchObject({
    errorCode: 'HTTP_429',
    requestId: 'request-safe',
  });
  await expect(
    runKbSync({ corpus: corpus(), store: s, adapter: f.adapter, verify }),
  ).rejects.toThrow(/reconciliation/i);
  expect(s.snapshot.pending[0].errorCode).toBe('HTTP_429');
});
