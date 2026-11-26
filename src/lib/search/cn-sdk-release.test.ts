import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportPublishedCnRecords } from './cn-records.server';
import { createCnSdkPublicationPolicy } from './cn-sdk-publication';
import { queryCnSearch } from './cn-search.server';
import { createCnDocsSearchClient } from './cn-search-client';
import { searchCnDocsPage } from './cn-search-page';
import { parseSearchPageState } from './search-page-state';

afterEach(() => vi.restoreAllMocks());

describe('SDK release search snapshot', () => {
  it('replaces the published snapshot for both search clients while preserving overloads and independent SDK versions', async () => {
    const android = '/zh-CN/api-reference/rtc/android';
    const rtm = '/zh-CN/api-reference/rtm/web';
    const metadata = (version: string) =>
      createCnSdkPublicationPolicy([
        {
          scopeUrl: android,
          navScope: {
            versions: [
              { id: 'current', label: `v${version}`, path: '(current)' },
              {
                id: '4.6.0',
                label: 'v4.6.0',
                path: '4.6.0',
                href: 'https://archive.example/4.6.0',
              },
            ],
          },
        },
        {
          scopeUrl: rtm,
          navScope: {
            versions: [{ id: 'current', label: 'v2.3.0', path: '.' }],
          },
        },
      ]);
    const urls = [
      `${android}/channel`,
      `${android}/4.6.0/channel`,
      `${android}/4.7.0/channel`,
      `${rtm}/client`,
    ];
    const snapshot = async (version: string) => {
      const resolve = metadata(version);
      const pages = urls
        .filter((url) => resolve(url).searchable)
        .map((url) => ({ url, title: 'API' }));
      return exportPublishedCnRecords({
        pages,
        routes: urls.map((url) => ({
          url,
          canonicalPath: url,
          markdownPath: `${url}.md`,
          version: resolve(url).version,
        })),
        readMarkdown: async (artifactPath) =>
          artifactPath.startsWith(android)
            ? `# 频道相关\n\n## joinChannel [1/2] [#joinchannel-12]\n\n${version} 加入频道。\n\n## joinChannel [2/2] [#joinchannel-22]\n\n${version} 另一个重载。\n\n## leaveChannel [#leavechannel]\n\n${version} 离开频道。`
            : '# RTM API\n\n## publish [#publish]\n\n2.3.0 发布消息。',
      });
    };
    const previous = await snapshot('4.7.0');
    const next = await snapshot('4.7.1');
    expect(
      previous
        .filter((record) => record.product === 'rtc')
        .every((record) => record.version === '4.7.0'),
    ).toBe(true);
    expect(next.filter((record) => record.product === 'rtc')).toHaveLength(3);
    expect(
      next
        .filter((record) => record.product === 'rtc')
        .every(
          (record) =>
            record.version === '4.7.1' && record.content.includes('4.7.1'),
        ),
    ).toBe(true);
    expect(
      next.some(
        (record) =>
          record.url.includes('/4.6.0/') || record.url.includes('/4.7.0/'),
      ),
    ).toBe(false);
    expect(next.find((record) => record.product === 'rtm')?.version).toBe(
      '2.3.0',
    );

    // The engine boundary returns only the new full snapshot. Exercise the
    // real server grouping and both browser transports; engine swap itself is
    // covered by meilisearch-index.server.test.ts.
    const engineFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        hits: next,
        totalHits: next.length,
        totalPages: 1,
        page: 1,
        facetDistribution: { version: { '4.7.1': 3, '2.3.0': 1 } },
      }),
    );
    const state = parseSearchPageState({
      q: 'joinChannel',
      platform: 'android',
      type: 'api',
    });
    const response = await queryCnSearch(
      {
        host: 'http://engine.test',
        indexUid: 'cn',
        searchOnlyKey: 'test-only',
      },
      state,
    );
    engineFetch.mockImplementation(async () => Response.json(response));
    const full = await searchCnDocsPage(state);
    const quick = await createCnDocsSearchClient({
      platform: 'android',
    }).search('joinChannel');
    expect(full.facets.version).toEqual({ '4.7.1': 3, '2.3.0': 1 });
    expect(quick.map((entry) => entry.url)).toEqual(
      full.groups
        .flatMap((group) => group.sections.map((section) => section.url))
        .slice(0, 3),
    );
    expect(quick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'joinChannel [1/2]',
          url: '/api-reference/rtc/android/channel#joinchannel-12',
          version: '4.7.1',
          product: 'rtc',
          platform: ['android'],
        }),
        expect.objectContaining({
          title: 'joinChannel [2/2]',
          url: '/api-reference/rtc/android/channel#joinchannel-22',
          version: '4.7.1',
        }),
        expect.objectContaining({ title: 'leaveChannel', version: '4.7.1' }),
      ]),
    );
  });
});
