import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  handleSearchRequest,
  parseSearchApiQuery,
  readSearchServiceConfig,
} from './search-api.server';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
const empty = { hits: [], totalHits: 0, totalPages: 0, page: 1 };
const request = (query: string) =>
  new Request(`https://docs.example/api/search?${query}`);

describe('Start search API', () => {
  it.each([
    ['cloud-transcoding', 'transcoding'],
    ['signaling', 'rtm'],
  ])(
    'uses the canonical filter for saved product links with %s',
    async (alias, canonical) => {
      vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
      vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
      vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json(empty));
      await handleSearchRequest(request(`q=资源&product=${alias}`));
      const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
      expect(body.filter).toContain(
        `(product = "${canonical}" OR products = "${canonical}")`,
      );
    },
  );
  it('filters all product memberships of a FAQ and exposes product facets without losing the primary label', async () => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
    const hit = {
      id: 'faq',
      url: '/zh-CN/reference/faq/account/billing_basis',
      pageTitle: '计时方式',
      sectionTitle: '计时方式',
      content: 'FAQ 正文',
      headingPath: ['计时方式'],
      locale: 'zh-CN',
      hidden: false,
      status: 'published',
      docType: 'docs',
      audience: ['developer'],
      product: 'local-server-recording',
      products: ['local-server-recording', 'rtc', 'analytics'],
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ...empty,
        hits: [hit],
        totalHits: 1,
        totalPages: 1,
        facetDistribution: { products: { rtc: 1, analytics: 1 } },
      }),
    );
    const response = await handleSearchRequest(request('q=计时&product=rtc'));
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body.filter).toContain('(product = "rtc" OR products = "rtc")');
    const data = await response.json();
    expect(data.groups[0].sections[0].products).toEqual([
      'local-server-recording',
      'rtc',
      'analytics',
    ]);
    expect(data.facets.product).toEqual({ rtc: 1, analytics: 1 });
  });
  it('rejects arbitrary engine filters, duplicate parameters and unbounded input', () => {
    for (const query of [
      'filter=hidden%3Dtrue',
      'q=a&q=b',
      'page=501',
      'page=-1',
      'type=internal',
      'platform=nope',
      'product=x%22%20OR%20hidden%3Dtrue',
      `q=${'a'.repeat(501)}`,
    ]) {
      expect(() => parseSearchApiQuery(new URLSearchParams(query))).toThrow(
        'Invalid search parameters',
      );
    }
    expect(
      parseSearchApiQuery(
        new URLSearchParams('q=Token&tab=ai&platform=web&page=2'),
      ),
    ).toMatchObject({ q: 'Token', tab: 'ai', platform: 'web', page: 2 });
  });

  it('requires private service configuration without falling back to browser or admin keys', async () => {
    expect(
      readSearchServiceConfig({
        VITE_MEILI_HOST: 'https://meili.example',
        VITE_MEILI_INDEX_UID: 'cn',
        VITE_MEILI_SEARCH_API_KEY: 'old-public',
        MEILI_MASTER_KEY: 'master',
      }),
    ).toBeNull();
    vi.stubEnv('MEILI_HOST', '');
    const response = await handleSearchRequest(request('q=Token'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Search service unavailable',
    });
  });

  it('keeps credentials server side and applies fixed public filters plus a typed scope', async () => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json(empty));
    const response = await handleSearchRequest(request('q=Token&tab=ai'));
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://meili.internal:7700/indexes/docs_cn/search');
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer private-read-key',
    });
    expect(JSON.parse(options?.body as string).filter).toBe(
      'locale = "zh-CN" AND hidden = false AND status = "published" AND tab = "ai"',
    );
    expect(await response.text()).not.toMatch(
      /private-read-key|meili.internal/,
    );
  });

  it('returns 400 before fetching and hides upstream failures in a 502 response', async () => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new Error('upstream private-read-key at meili.internal'),
      );
    expect((await handleSearchRequest(request('page=999'))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    const response = await handleSearchRequest(request('q=Token'));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Search service unavailable',
    });
  });
});
