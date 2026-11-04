// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addAccordionHeadingsToTocText } from '../mdx/accordion-toc';
import { exportPublishedCnRecords } from './cn-records.server';
import { queryCnSearch } from './cn-search.server';
import type { SearchSection } from './kb-record';
import {
  createSearchIndexClient,
  prepareSearchIndex,
} from './meilisearch-index.server';
import { parseSearchPageState } from './search-page-state';

// Opt-in integration tests use a disposable index on a local engine only.
const host = process.env.MEILI_INTEGRATION_URL;
const key = process.env.MEILI_INTEGRATION_KEY ?? 'local-integration-key';

describe.skipIf(!host)('CN search against Meilisearch', () => {
  let stagedUid: string | undefined;
  let config: { host: string; indexUid: string; searchOnlyKey: string };
  const base = '/realtime-media/rtc/guide';
  const section: SearchSection = {
    id: 'section',
    url: `${base}/android#shared`,
    canonicalUrl: base,
    pageTitle: 'Guide',
    sectionTitle: 'Shared',
    headingPath: ['Guide', 'Shared'],
    content: 'sharedMarker content',
    locale: 'zh-CN',
    product: 'rtc',
    products: ['rtc'],
    platform: ['android'],
    defaultPlatform: 'android',
    isDefaultPlatform: true,
    docType: 'docs',
    audience: ['developer'],
    status: 'published',
    hidden: false,
  };

  beforeAll(async () => {
    if (
      !host ||
      !['localhost', '127.0.0.1', '[::1]'].includes(new URL(host).hostname)
    ) {
      throw new Error('Integration tests require a local Meilisearch instance');
    }
    const records: SearchSection[] = Array.from({ length: 25 }, (_, index) =>
      ['android', 'ios', 'web'].map((platform) => ({
        ...section,
        id: `${platform}-${index}`,
        url: `${base}/${platform}#shared-${index}`,
        sectionTitle: `Shared ${index}`,
        headingPath: ['Guide', `Shared ${index}`],
        content: `sharedMarker content ${index}`,
        platform: [platform],
        isDefaultPlatform: platform === 'android',
      })),
    ).flat();
    records.push(
      ...['android', 'web'].map((platform) => ({
        ...section,
        id: `${platform}-setup`,
        url: `${base}/${platform}#setup`,
        sectionTitle: 'Setup',
        headingPath: ['Guide', 'Setup'],
        content: `setupMarker ${platform === 'web' ? 'npm' : 'Gradle'}`,
        platform: [platform],
        isDefaultPlatform: platform === 'android',
      })),
    );
    const releaseUrl = '/zh-CN/realtime-media/rtc/releases';
    records.push(
      ...(await exportPublishedCnRecords({
        pages: [{ url: releaseUrl, title: '发版说明', objectType: 'docs' }],
        routes: [
          {
            url: `${releaseUrl}/web`,
            canonicalPath: releaseUrl,
            markdownPath: `${releaseUrl}/web.md`,
            platform: 'web',
            defaultPlatform: 'android',
          },
          {
            url: `${releaseUrl}/android`,
            canonicalPath: releaseUrl,
            markdownPath: `${releaseUrl}/android.md`,
            platform: 'android',
            defaultPlatform: 'android',
          },
        ],
        readMarkdown: async (path) =>
          path.endsWith('/android.md')
            ? '# 发版说明\n\n## Android [#android]\n\n其他更新。'
            : addAccordionHeadingsToTocText(`# 发版说明

<Accordions>
<Accordion title="v3.2" id="v32" headingLevel={2}>

新版本。

### 新增特性 [#feature]

#### 自动接收 [#receive]

enableBrowserAudio 支持自动接收音频。

</Accordion>
<Accordion title="v3.1" id="v31" headingLevel={2}>

历史版本。

### 问题修复 [#fixes]

enableLegacyAudio 修复。

</Accordion>
</Accordions>`),
        readRenderedHtml: async () =>
          '<h2 id="android">Android</h2><h2 id="v32">v3.2</h2><h3 id="feature">新增特性</h3><h4 id="receive">自动接收</h4><h2 id="v31">v3.1</h2><h3 id="fixes">问题修复</h3>',
      })),
    );
    const receipt = await prepareSearchIndex({
      client: createSearchIndexClient({ host, writeKey: key }),
      indexUid: 'docs_search_integration',
      revision: 'integration',
      records,
    });
    stagedUid = receipt.stagedUid;
    config = { host, indexUid: stagedUid, searchOnlyKey: key };
  }, 30_000);

  afterAll(async () => {
    if (host && stagedUid) {
      const response = await fetch(`${host}/indexes/${stagedUid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!response.ok) throw new Error('Failed to remove integration index');
      await createSearchIndexClient({ host, writeKey: key }).wait(
        (await response.json()).taskUid,
      );
    }
  });

  const search = (q: string, page = 1, platform?: string) =>
    queryCnSearch(
      config,
      parseSearchPageState({ q, type: 'docs', page, platform }),
    );

  it('includes non-default platform content in full and quick-search overview queries', async () => {
    const full = await search('enableBrowserAudio');
    const overview = await queryCnSearch(
      config,
      parseSearchPageState({ q: 'enableBrowserAudio' }),
    );
    for (const result of [full, overview]) {
      expect(result.totalHits).toBe(1);
      expect(result.groups[0]).toMatchObject({
        pageUrl: '/realtime-media/rtc/releases/web',
        sections: [
          {
            url: '/realtime-media/rtc/releases/web#receive',
            headingPath: ['发版说明', 'v3.2', '新增特性', '自动接收'],
          },
        ],
      });
    }
    expect((await search('enableBrowserAudio', 1, 'android')).totalHits).toBe(
      0,
    );
    expect((await search('enableBrowserAudio', 1, 'web')).totalHits).toBe(1);
  });

  it('deduplicates equivalent platform chapters before counting and pagination', async () => {
    const first = await search('sharedMarker');
    const second = await search('sharedMarker', 2);
    expect(first.totalHits).toBe(25);
    expect(first.totalPages).toBe(2);
    const firstSections = first.groups.flatMap((group) => group.sections);
    const secondSections = second.groups.flatMap((group) => group.sections);
    expect(firstSections).toHaveLength(20);
    expect(secondSections).toHaveLength(5);
    expect(
      new Set(
        [...firstSections, ...secondSections].map((hit) => hit.sectionTitle),
      ).size,
    ).toBe(25);
    expect((await search('sharedMarker', 1, 'web')).totalHits).toBe(25);
  });

  it('preserves same-name platform chapters with different instructions', async () => {
    const result = await search('setupMarker');
    expect(result.totalHits).toBe(2);
    expect(result.groups[0].sections.map((hit) => hit.url).sort()).toEqual([
      `${base}/android#setup`,
      `${base}/web#setup`,
    ]);
  });

  it('matches the release and identifier together without silently dropping query terms', async () => {
    expect((await search('v3.2 enableBrowserAudio')).totalHits).toBe(1);
    expect((await search('3.2 enableBrowserAudio')).totalHits).toBe(1);
    expect((await search('v3.2 nonexistentIdentifier')).totalHits).toBe(0);
  });
});
