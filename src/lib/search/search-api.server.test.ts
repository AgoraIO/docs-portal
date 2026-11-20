import { afterEach, describe, expect, it, vi } from 'vitest';
import { cnSearchPlatformOptions } from './cn-search-platforms';
import {
  handleHealthRequest,
  handleSearchRequest,
  parseSearchApiQuery,
  readSearchServiceConfig,
} from './search-api.server';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
const empty = { hits: [], totalHits: 0, totalPages: 0, page: 1 };
const request = (query: string) => {
  const params = new URLSearchParams(query);
  if (!params.has('type')) params.set('type', 'docs');
  return new Request(`https://docs.example/api/search?${params}`);
};

it('returns the request identity and logs redacted completion facts independently of browser visibility', async () => {
  vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
  vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
  vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
  vi.stubEnv('DOCS_SEARCH_INDEX_REVISION', 'a'.repeat(40));
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(empty));
  const logs: string[] = [];
  vi.spyOn(console, 'info').mockImplementation((message) =>
    logs.push(String(message)),
  );
  const requestId = crypto.randomUUID();
  const searchId = crypto.randomUUID();
  const incoming = request('q=token%3Dprivate-value&platform=web');
  incoming.headers.set('X-Docs-Request-Id', requestId);
  incoming.headers.set('X-Docs-Search-Id', searchId);
  const response = await handleSearchRequest(incoming);
  expect(response.headers.get('X-Docs-Request-Id')).toBe(requestId);
  expect(await response.json()).toMatchObject({
    indexRevision: 'a'.repeat(40),
  });
  expect(JSON.parse(logs[0])).toMatchObject({
    event: 'docs_search_request_completed',
    event_source: 'server',
    request_id: requestId,
    search_id: searchId,
    query_redacted: '[redacted]',
    filter_platform: 'web',
    http_status: 200,
    total_hits: 0,
    server_group_count: 0,
    index_revision: 'a'.repeat(40),
  });
  expect(logs.join('')).not.toMatch(
    /private-value|private-read-key|meili.internal/,
  );
});

it('records an upstream failure as a failure rather than a zero-result response', async () => {
  vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
  vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
  vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
    new Error('private upstream'),
  );
  const logs: string[] = [];
  vi.spyOn(console, 'info').mockImplementation((message) =>
    logs.push(String(message)),
  );
  const response = await handleSearchRequest(request('q=Token'));
  expect(response.status).toBe(502);
  expect(JSON.parse(logs[0])).toMatchObject({
    http_status: 502,
    total_hits: null,
    server_group_count: null,
    error_code: 'search_upstream_failure',
    index_revision: null,
  });
});

describe('search request interruption diagnostics', () => {
  it.each([
    'before_fetch',
    'during_fetch',
    'timeout',
    'timeout_then_cancel',
    'upstream_abort_error',
  ])('classifies %s without inventing empty results', async (scenario) => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
    const caller = new AbortController();
    const deadline = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal);
    if (scenario === 'before_fetch') caller.abort();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const signal = init?.signal;
      if (!signal) throw new Error('Missing upstream signal');
      if (scenario === 'upstream_abort_error') {
        throw new DOMException('Upstream aborted independently', 'AbortError');
      }
      if (scenario === 'during_fetch') caller.abort();
      if (scenario.startsWith('timeout')) {
        deadline.abort(new DOMException('Deadline reached', 'TimeoutError'));
        if (scenario === 'timeout_then_cancel') caller.abort();
      }
      signal.throwIfAborted();
      return Response.json(empty);
    });
    const logs: string[] = [];
    vi.spyOn(console, 'info').mockImplementation((message) =>
      logs.push(String(message)),
    );
    const response = await handleSearchRequest(
      new Request(request('q=Token'), { signal: caller.signal }),
    );
    const cancelled =
      scenario === 'before_fetch' || scenario === 'during_fetch';
    const timedOut = scenario.startsWith('timeout');
    const status = cancelled ? 499 : timedOut ? 504 : 502;
    expect(response.status).toBe(status);
    expect(logs).toHaveLength(1);
    expect(JSON.parse(logs[0])).toMatchObject({
      http_status: status,
      error_code: cancelled
        ? 'search_cancelled'
        : timedOut
          ? 'search_timeout'
          : 'search_upstream_failure',
      total_hits: null,
      server_group_count: null,
    });
    expect(await response.json()).toEqual({
      error: cancelled
        ? 'Search request cancelled'
        : timedOut
          ? 'Search request timed out'
          : 'Search service unavailable',
    });
  });
});

describe('Start search API', () => {
  it.each(cnSearchPlatformOptions)(
    'accepts the selectable $label platform through the public handler',
    async ({ value }) => {
      vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
      vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
      vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(empty));

      const response = await handleSearchRequest(
        request(`q=Token&platform=${value}`),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ groups: [], totalHits: 0 });
    },
  );

  it.each([
    ['general', 'console', 'all'],
    ['general', 'console', 'docs'],
    ['iot', 'smart-doorbell', 'all'],
    ['iot', 'smart-doorbell', 'docs'],
  ])(
    'returns %s category results through API validation and the %s product filter (%s)',
    async (platform, product, type) => {
      vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
      vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
      vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
      const url =
        product === 'console'
          ? '/zh-CN/reference/console/token'
          : '/zh-CN/solutions/smart-doorbell/token';
      const match = {
        ...empty,
        hits: [
          {
            id: product,
            url,
            pageTitle: 'Token 配置',
            sectionTitle: 'Token 配置',
            content: 'Token 配置说明',
            headingPath: ['Token 配置'],
            locale: 'zh-CN',
            product,
            products: [product],
            docType: 'docs',
            audience: ['developer'],
            status: 'published',
            hidden: false,
          },
        ],
        totalHits: 1,
        totalPages: 1,
      };
      const upstream = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          Response.json(
            type === 'all' ? { results: [match, empty, empty] } : match,
          ),
        );

      const response = await handleSearchRequest(
        request(`q=Token&platform=${platform}&type=${type}`),
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.groups).toHaveLength(1);
      expect(data.groups[0].pageUrl).toBe(url);
      expect(data.groups[0].sections[0].products).toEqual([product]);
      const body = JSON.parse(upstream.mock.calls[0][1]?.body as string);
      for (const query of type === 'all' ? body.queries : [body]) {
        expect(query.filter).toContain(`products = "${product}"`);
        expect(query.filter).not.toContain('platform NOT EXISTS');
      }
    },
  );

  it('exposes the deployed full revision without changing the health contract', async () => {
    const revision = 'a'.repeat(40);
    const response = handleHealthRequest({ DOCS_RELEASE_REVISION: revision });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ status: 'ok', revision });
  });

  it.each([undefined, 'feature-branch', 'private-value'])(
    'omits missing or invalid health revision: %s',
    async (revision) => {
      expect(
        await handleHealthRequest({ DOCS_RELEASE_REVISION: revision }).json(),
      ).toEqual({ status: 'ok' });
    },
  );

  it.each([
    ['api', 'api'],
    ['faq', 'faq'],
    ['openapi', 'api'],
  ])(
    'accepts the public %s filter and searches the %s family',
    async (type, family) => {
      vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
      vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
      vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json(empty));

      const response = await handleSearchRequest(
        request(`q=joinChannel&type=${type}`),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        groups: [],
        totalHits: 0,
        page: 1,
      });
      expect(
        JSON.parse(fetchMock.mock.calls[0][1]?.body as string).filter,
      ).toContain(`searchFamily = "${family}"`);
    },
  );

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
        `(product = "${canonical}" OR products = "${canonical}"`,
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
    const response = await handleSearchRequest(
      request('q=计时&product=rtc&type=faq'),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body.filter).toContain('(product = "rtc" OR products = "rtc")');
    expect(body.filter).toContain('searchFamily = "faq"');
    const data = await response.json();
    expect(data.groups[0].sections[0].products).toEqual([
      'local-server-recording',
      'rtc',
      'analytics',
    ]);
    expect(data.facets.product).toEqual({ rtc: 1, analytics: 1 });
  });
  it('merges legacy product facets and removes Danmaku-only hits', async () => {
    vi.stubEnv('MEILI_HOST', 'http://meili.internal:7700');
    vi.stubEnv('MEILI_INDEX_UID', 'docs_cn');
    vi.stubEnv('MEILI_SEARCH_API_KEY', 'private-read-key');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        ...empty,
        hits: [
          {
            id: 'danmaku',
            url: '/zh-CN/realtime-media/danmaku/reference/response-code',
            pageTitle: '响应状态码',
            sectionTitle: '响应状态码',
            content: '弹幕错误码',
            headingPath: ['响应状态码'],
            locale: 'zh-CN',
            product: 'danmaku',
            products: ['danmaku'],
            docType: 'docs',
            audience: ['developer'],
            status: 'published',
            hidden: false,
          },
        ],
        totalHits: 1,
        totalPages: 1,
        facetDistribution: {
          products: {
            'ppt-conversion-service': 2,
            'ppt-transcoding': 3,
            danmaku: 4,
          },
        },
      }),
    );

    const response = await handleSearchRequest(request('q=Token'));
    const data = await response.json();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(data.groups).toEqual([]);
    expect(data.facets.product).toEqual({ 'ppt-transcoding': 5 });
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
      'locale = "zh-CN" AND hidden = false AND status = "published" AND tab = "ai" AND searchFamily = "docs"',
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
