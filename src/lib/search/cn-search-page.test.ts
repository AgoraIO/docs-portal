import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryCnSearch } from './cn-search.server';
import { cleanSearchSnippet, isPublicCnSearchUrl } from './cn-search-page';
import { parseSearchPageState } from './search-page-state';

const config = {
  host: 'http://127.0.0.1:7700/',
  indexUid: 'cn-kb-demo-v1',
  searchOnlyKey: 'public-search-only',
};
const hit = {
  id: 'one',
  url: '/zh-CN/api-reference/conversational-ai/web/api#token',
  pageTitle: 'API 参考',
  sectionTitle: 'Token',
  content: '调用 Token',
  headingPath: ['API 参考', 'Token'],
  locale: 'zh-CN',
  product: 'conversational-ai',
  platform: ['web'],
  version: '4.6.0',
  docType: 'docs',
  status: 'published',
  hidden: false,
};
afterEach(() => vi.restoreAllMocks());

describe('full CN search adapter', () => {
  it('cleans source syntax from snippets while retaining search highlights', () => {
    expect(cleanSearchSnippet('<#Your <mark>Token</mark>#>')).toBe(
      '<#Your <mark>Token</mark>#>',
    );
    expect(
      cleanSearchSnippet(
        '点击 **[生成 <mark>Token</mark>](/zh-CN/guide)**，调用 `renewToken`。<a id="token"></a>',
      ),
    ).toBe('点击 生成 <mark>Token</mark>，调用 renewToken。');
    expect(cleanSearchSnippet('参考[生成 Token](/zh-CN/a/cropped')).toBe(
      '参考生成 Token',
    );
  });
  it('uses exact pagination and filters, groups sections in ranking order, and discards non-public results', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            hit,
            {
              ...hit,
              id: 'two',
              url: hit.url.replace('#token', '#renew'),
              sectionTitle: '续期',
            },
            { ...hit, id: 'duplicate' },
            { ...hit, id: 'hidden', hidden: true },
            { ...hit, id: 'draft', status: 'draft' },
            { ...hit, id: 'en', locale: 'en' },
            { ...hit, id: 'external', url: 'https://evil.example/' },
          ],
          totalHits: 24,
          totalPages: 2,
          page: 2,
          facetDistribution: { product: { 'conversational-ai': 24 } },
        }),
      ),
    );
    const signal = new AbortController().signal;
    const result = await queryCnSearch(
      config,
      parseSearchPageState({
        q: '#Token',
        product: 'conversational-ai',
        platform: 'web',
        version: '4.6.0',
        type: 'docs',
        page: 2,
      }),
      signal,
    );
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:7700/indexes/cn-kb-demo-v1/search');
    expect(request?.signal).toBe(signal);
    expect(JSON.parse(request?.body as string)).toMatchObject({
      q: 'Token',
      page: 2,
      hitsPerPage: 20,
      filter:
        'locale = "zh-CN" AND hidden = false AND status = "published" AND product = "conversational-ai" AND platform = "web" AND version = "4.6.0" AND docType = "docs"',
    });
    expect(result.groups).toHaveLength(1);
    expect(
      result.groups[0].sections.map((section) => section.sectionTitle),
    ).toEqual(['Token', '续期']);
    expect(result.totalHits).toBe(24);
  });

  it('distinguishes a server failure from a successful empty response', async () => {
    const mock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ hits: [], totalHits: 0, totalPages: 0, page: 1 }),
        ),
      );
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'Token' })),
    ).rejects.toThrow('503');
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'none' })),
    ).resolves.toMatchObject({ groups: [], totalHits: 0 });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed engine responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ hits: [] })),
    );
    await expect(
      queryCnSearch(config, parseSearchPageState({ q: 'Token' })),
    ).rejects.toThrow('Invalid search response');
  });

  it('only accepts same-site CN document URLs, including section anchors', () => {
    expect(isPublicCnSearchUrl(hit.url)).toBe(true);
    for (const url of [
      'javascript:alert(1)',
      '//evil.example',
      '/en/guide',
      '/zh-CN/../private',
      '/zh-CN/\\evil',
      '/zh-CN/a\n',
    ])
      expect(isPublicCnSearchUrl(url)).toBe(false);
  });
});
