import { describe, expect, it } from 'vitest';
import type { AlgoliaDocsRecord } from './algolia-records.server';
import { applyNavModel } from './nav-model';

const baseRecord = (url: string): AlgoliaDocsRecord => ({
  _id: `docs:${url}`,
  breadcrumbs: ['api-reference', 'api-ref', 'server-sdk'],
  structured: { contents: [], headings: [] },
  title: 'Python',
  url,
  extra_data: {
    category: 'default',
    locale: 'en',
    objectType: 'docs',
    platform: [],
    product: 'api-reference',
    tab: 'api-reference',
  },
});

describe('applyNavModel', () => {
  const url = '/en/api-reference/api-ref/server-sdk/python';

  it('overrides breadcrumbs and platform from the nav model', () => {
    const [record] = applyNavModel([baseRecord(url)], {
      breadcrumbsByUrl: new Map([[url, ['API Reference', 'Voice Agents']]]),
      platformsByUrl: new Map([[url, ['python']]]),
      externalEntries: [],
      locale: 'en',
    });

    expect(record.breadcrumbs).toEqual(['API Reference', 'Voice Agents']);
    expect(record.extra_data.platform).toEqual(['python']);
  });

  it('appends external records', () => {
    const records = applyNavModel([baseRecord(url)], {
      breadcrumbsByUrl: new Map(),
      platformsByUrl: new Map(),
      externalEntries: [
        {
          title: 'Android',
          href: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
          ancestry: ['API Reference', 'Voice & Video'],
          restAlias: 'rtc',
        },
      ],
      locale: 'en',
    });

    const external = records.find((r) => r.extra_data.objectType === 'external');
    expect(external?.url).toBe('https://api-ref.agora.io/en/video-sdk/android/4.x/index.html');
    expect(external?.extra_data.platform).toEqual(['android']);
    expect(external?.breadcrumbs).toEqual(['API Reference', 'Voice & Video']);
  });

  it('leaves records untouched when the nav model has no entry for them', () => {
    const [record] = applyNavModel([baseRecord(url)], {
      breadcrumbsByUrl: new Map(),
      platformsByUrl: new Map(),
      externalEntries: [],
      locale: 'en',
    });
    expect(record.breadcrumbs).toEqual(['api-reference', 'api-ref', 'server-sdk']);
  });

  it('applies a breadcrumb-only override without touching platform', () => {
    const [record] = applyNavModel([baseRecord(url)], {
      breadcrumbsByUrl: new Map([[url, ['API Reference', 'Voice Agents']]]),
      platformsByUrl: new Map(),
      externalEntries: [],
      locale: 'en',
    });
    expect(record.breadcrumbs).toEqual(['API Reference', 'Voice Agents']);
    expect(record.extra_data.platform).toEqual([]); // unchanged from baseRecord
  });

  it('applies a platform-only override without touching breadcrumbs', () => {
    const [record] = applyNavModel([baseRecord(url)], {
      breadcrumbsByUrl: new Map(),
      platformsByUrl: new Map([[url, ['python']]]),
      externalEntries: [],
      locale: 'en',
    });
    expect(record.extra_data.platform).toEqual(['python']);
    expect(record.breadcrumbs).toEqual(['api-reference', 'api-ref', 'server-sdk']); // unchanged
  });
});
