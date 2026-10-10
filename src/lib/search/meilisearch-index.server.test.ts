import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchSection } from './kb-record';
import {
  createSearchIndexClient,
  prepareSearchIndex,
  promoteSearchIndex,
  type SearchIndexClient,
} from './meilisearch-index.server';
import * as settingsModule from './meilisearch-settings';

const record: SearchSection = {
  id: 'one',
  url: '/zh-CN/ai/guide#token',
  pageTitle: '指南',
  sectionTitle: 'Token',
  content: 'Token 说明',
  headingPath: ['指南', 'Token'],
  locale: 'zh-CN',
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
};
function fakeClient() {
  const indexes = new Map<string, Map<string, Record<string, unknown>>>();
  const events: string[] = [];
  let pendingSwap: (() => void) | undefined;
  const client: SearchIndexClient = {
    hostHash: 'test-host',
    async getRelease(uid) {
      const stored = indexes.get(uid)?.get('_docs_release');
      return stored
        ? {
            release: String(stored.release),
            revision: String(stored.revision),
            checksum: String(stored.checksum),
            count: Number(stored.count),
          }
        : null;
    },
    async ensureIndex(uid) {
      if (!indexes.has(uid)) indexes.set(uid, new Map());
    },
    async createIndex(uid) {
      events.push('create');
      indexes.set(uid, new Map());
    },
    async settings() {
      events.push('settings');
    },
    async documents(uid, documents) {
      events.push('documents');
      for (const document of documents)
        indexes.get(uid)?.set(document.id, document);
    },
    async count(uid) {
      return indexes.get(uid)?.size ?? 0;
    },
    async swap(live, staged) {
      events.push('swap');
      pendingSwap = () => {
        const old = indexes.get(live);
        indexes.set(live, indexes.get(staged) ?? new Map());
        indexes.set(staged, old ?? new Map());
      };
      return 1;
    },
    async wait() {
      events.push('wait');
      pendingSwap?.();
      pendingSwap = undefined;
    },
  };
  return { client, indexes, events };
}
describe('search index release jobs', () => {
  it('changes the release checksum when the search policy changes with identical source records', async () => {
    const { client } = fakeClient();
    const input = {
      client,
      indexUid: 'docs_cn',
      revision: 'same-source',
      records: [record],
    };
    const first = await prepareSearchIndex(input);
    const settings = settingsModule.buildPublishedCnSearchSettings();
    vi.spyOn(settingsModule, 'buildPublishedCnSearchSettings').mockReturnValue({
      ...settings,
      synonyms: { ...settings.synonyms, 自定义别名: ['Token'] },
    });
    const second = await prepareSearchIndex(input);
    expect(first.checksum).not.toBe(second.checksum);
  });
  it('regenerates API tokens and normalized ordering fields when preparing a fresh snapshot', async () => {
    const { client, indexes } = fakeClient();
    const receipt = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'strategy-test',
      records: [
        {
          ...record,
          url: '/zh-CN/api-reference/rtc/web/overview#removehandler',
          sectionTitle: 'removeHandler',
          pageTitle: 'RTCEngine API',
          headingPath: ['RTCEngine API', 'removeHandler'],
          product: 'rtm',
          platform: ['web'],
        },
      ],
    });
    const documents = [...(indexes.get(receipt.stagedUid)?.values() ?? [])];
    expect(
      documents.find((document) => document.sourceId === 'one'),
    ).toMatchObject({
      nameSplit: 'remove Handler',
      groupNameSplit: 'RTC Engine API',
      products: ['rtm'],
      productSeq: 2,
      platformSeq: 4,
      typeSeq: 1000,
    });
  });

  it('normalizes legacy product IDs when publishing previously exported records', async () => {
    const { client, indexes } = fakeClient();
    const receipt = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'product-normalization',
      records: [
        {
          ...record,
          product: 'cloud-transcoding',
          products: ['cloud-transcoding', 'transcoding', 'cloud-recording'],
        },
      ],
    });
    expect(
      [...indexes.get(receipt.stagedUid)!.values()].find(
        (doc) => doc.sourceId === 'one',
      ),
    ).toMatchObject({
      product: 'transcoding',
      products: ['transcoding', 'cloud-recording'],
    });
  });

  it('configures synonyms and conservative technical-word tolerance on each new index', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ taskUid: 7 }))
      .mockResolvedValueOnce(Response.json({ status: 'succeeded' }));
    await createSearchIndexClient({
      host: 'http://meili.test',
      writeKey: 'scoped-write',
    }).settings('docs_cn');
    const settings = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(settings.synonyms['发布消息']).toEqual(['发送消息']);
    expect(settings.typoTolerance.disableOnWords).toContain('屏幕共享');
    expect(settings.searchableAttributes).toContain('nameSplit');
    expect(settings.filterableAttributes).toContain('products');
    expect(settings.sortableAttributes).toEqual(
      expect.arrayContaining(['productSeq', 'platformSeq', 'typeSeq']),
    );
  });
  it('indexes the product entry title separately from incidental subsection mentions', async () => {
    const { client, indexes } = fakeClient();
    const receipt = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'entry-title',
      records: [
        {
          ...record,
          id: 'overview',
          url: '/zh-CN/realtime-media/cloud-recording',
          pageTitle: '云端录制概览',
          sectionTitle: '云端录制概览',
          headingPath: ['云端录制概览'],
          product: 'cloud-recording',
        },
        {
          ...record,
          id: 'incidental',
          url: '/zh-CN/solutions/teleoperation#cloud-recording',
          pageTitle: '远程操控',
          sectionTitle: '云端录制',
          headingPath: ['远程操控', '云端录制'],
        },
      ],
    });
    const documents = [...(indexes.get(receipt.stagedUid)?.values() ?? [])];
    expect(
      documents.find((document) => document.sourceId === 'overview')
        ?.entryTitle,
    ).toEqual(expect.arrayContaining(['云端录制', '云录制']));
    expect(
      documents.find((document) => document.sourceId === 'incidental')
        ?.entryTitle,
    ).toBeUndefined();
  });
  afterEach(() => vi.restoreAllMocks());
  it('uses a separate read-only task key without expanding the index write key', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ uid: 'docs_cn' }))
      .mockResolvedValueOnce(Response.json({ status: 'succeeded' }));
    const client = createSearchIndexClient({
      host: 'http://meili.test:7700',
      writeKey: 'scoped-write',
      taskKey: 'read-only-tasks',
    });
    await client.ensureIndex('docs_cn');
    await client.wait(42);
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer scoped-write',
    });
    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({
      Authorization: 'Bearer read-only-tasks',
    });
  });
  it('rejects empty, hidden, duplicate and non-CN snapshots before making any write', async () => {
    for (const records of [
      [],
      [{ ...record, hidden: true }],
      [record, record],
      [{ ...record, locale: 'en' }],
    ]) {
      const { client, events } = fakeClient();
      await expect(
        prepareSearchIndex({
          client,
          indexUid: 'docs_cn',
          revision: 'commit-a',
          records,
        }),
      ).rejects.toThrow();
      expect(events).toEqual([]);
    }
  });
  it('prepares without changing the active index, persists the task before waiting, and safely retries promotion', async () => {
    const { client, events } = fakeClient();
    const receipt = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'commit-a',
      records: [record],
    });
    expect(await client.getRelease('docs_cn')).toBeNull();
    expect(events).toEqual(['create', 'settings', 'documents', 'documents']);
    const save = vi.fn(async (taskUid: number) => {
      events.push('save');
      receipt.promotionTaskUid = taskUid;
    });
    expect(await promoteSearchIndex(client, receipt, save)).toBe('promoted');
    expect(events.slice(-3)).toEqual(['swap', 'save', 'wait']);
    expect(await promoteSearchIndex(client, receipt, save)).toBe(
      'already-active',
    );
    expect(events.filter((event) => event === 'swap')).toHaveLength(1);
  });
  it('replaces the full snapshot so deleted pages disappear and the previous index remains available', async () => {
    const { client, indexes } = fakeClient();
    const first = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'a',
      records: [
        record,
        { ...record, id: 'deleted', url: '/zh-CN/ai/deleted#token' },
      ],
    });
    await promoteSearchIndex(client, first, async () => {});
    const second = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'b',
      records: [record],
    });
    await promoteSearchIndex(client, second, async () => {});
    expect(await client.count('docs_cn')).toBe(2);
    expect(await client.count(second.stagedUid)).toBe(3);
    expect(
      [...(indexes.get('docs_cn')?.values() ?? [])].some(
        (document) => document.sourceId === 'deleted',
      ),
    ).toBe(false);
  });
  it('rejects tampering and a stale release instead of swapping the wrong snapshot', async () => {
    const { client } = fakeClient();
    const first = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'a',
      records: [record],
    });
    const stale = await prepareSearchIndex({
      client,
      indexUid: 'docs_cn',
      revision: 'b',
      records: [record],
    });
    await expect(
      promoteSearchIndex(client, { ...first, checksum: 'bad' }, async () => {}),
    ).rejects.toThrow('does not match');
    await promoteSearchIndex(client, first, async () => {});
    await expect(
      promoteSearchIndex(client, stale, async () => {}),
    ).rejects.toThrow('different search release');
  });
});
