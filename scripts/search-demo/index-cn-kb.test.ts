import { describe, expect, it } from 'vitest';
import type { SearchSection } from '../../src/lib/search/kb-record';
import { cnKbManifest } from './cn-kb-manifest';
import {
  indexCnKb,
  type MeiliDocument,
  type MeiliIndexClient,
} from './index-cn-kb';
import { buildMeilisearchSettings } from './meilisearch-settings';

const record: SearchSection = {
  id: 'sample:method',
  url: `${cnKbManifest[0].route}#method`,
  pageTitle: '产品概述',
  sectionTitle: '加入频道',
  aliases: ['joinChannel'],
  content: '调用方法加入频道',
  headingPath: ['产品概述', '加入频道'],
  locale: 'zh-CN',
  product: 'conversational-ai',
  platform: ['web'],
  version: '1.0',
  docType: 'docs',
  audience: ['developer'],
  status: 'published',
  hidden: false,
};

function fakeClient() {
  const stored = new Map<string, MeiliDocument>();
  const events: string[] = [];
  const client: MeiliIndexClient = {
    async createIndex(uid) {
      events.push(`create:${uid}`);
      return 1;
    },
    async updateSettings(_uid, settings) {
      events.push(`settings:${settings.searchableAttributes.join(',')}`);
      return 2;
    },
    async addDocuments(_uid, documents) {
      events.push('documents');
      for (const document of documents) stored.set(document.id, document);
      return 3;
    },
    async waitForTask(uid) {
      events.push(`wait:${uid}`);
    },
  };
  return { client, stored, events };
}

describe('CN KB indexing', () => {
  it('prioritizes section, aliases, page title, then content and filters metadata', () => {
    const settings = buildMeilisearchSettings();
    expect(settings.searchableAttributes).toEqual([
      'sectionTitle',
      'aliases',
      'pageTitle',
      'content',
    ]);
    expect(settings.filterableAttributes).toEqual(
      expect.arrayContaining([
        'locale',
        'product',
        'platform',
        'version',
        'docType',
        'audience',
        'status',
        'hidden',
      ]),
    );
    expect(settings.displayedAttributes).toEqual(
      expect.arrayContaining([
        'id',
        'url',
        'headingPath',
        'sectionTitle',
        'content',
      ]),
    );
  });

  it('waits for settings before upload and upserts repeated records by ID', async () => {
    const { client, stored, events } = fakeClient();
    const first = await indexCnKb([record], client);
    await indexCnKb([record], client);
    expect(first).toEqual({ indexUid: 'cn-kb-demo-v1', taskUid: 3 });
    expect(stored.size).toBe(1);
    expect(events.slice(0, 6)).toEqual([
      'create:cn-kb-demo-v1',
      'wait:1',
      'settings:sectionTitle,aliases,pageTitle,content',
      'wait:2',
      'documents',
      'wait:3',
    ]);
  });

  it('uses a stable Meilisearch-safe ID while preserving the source section ID', async () => {
    const { client, stored } = fakeClient();
    const unicodeRecord = { ...record, id: 'zh-CN:示例:method' };
    await indexCnKb([unicodeRecord], client);
    expect(stored.size).toBe(1);
    const uploaded = [...stored.values()][0];
    expect(uploaded.id).toMatch(/^[a-f0-9]{64}$/);
    expect(uploaded.sourceId).toBe(unicodeRecord.id);
    await indexCnKb([unicodeRecord], client);
    expect(stored.size).toBe(1);
  });

  it('rejects empty, hidden, duplicate, or out-of-manifest inputs before upload', async () => {
    const { client, events } = fakeClient();
    await expect(indexCnKb([], client)).rejects.toThrow(/empty/);
    await expect(
      indexCnKb([{ ...record, hidden: true }], client),
    ).rejects.toThrow(/hidden/);
    await expect(indexCnKb([record, record], client)).rejects.toThrow(
      /duplicate/,
    );
    await expect(
      indexCnKb([{ ...record, url: '/zh-CN/other#method' }], client),
    ).rejects.toThrow(/manifest/);
    expect(events).toEqual([]);
  });

  it('aborts document upload if the settings task fails', async () => {
    const { client, events } = fakeClient();
    client.waitForTask = async (uid) => {
      events.push(`wait:${uid}`);
      if (uid === 2) throw new Error('settings task failed');
    };
    await expect(indexCnKb([record], client)).rejects.toThrow(
      'settings task failed',
    );
    expect(events).not.toContain('documents');
  });
});
