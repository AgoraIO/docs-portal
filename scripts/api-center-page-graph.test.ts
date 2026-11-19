import { describe, expect, it } from 'vitest';
import {
  crawlManifestEntries,
  crawlBodyLinkClosure,
  finalizeBodyClosure,
  parseBodyPageEvidence,
  parseCurlOutput,
  parseLegacyPageHtml,
  routeScopeRoot,
} from './lib/api-center/page-graph.mjs';

function pageHtml() {
  return `<!doctype html><html><head><title>Fallback</title></head><body>
  <aside><nav class="menu"><ul class="theme-doc-sidebar-menu menu__list">
    <li class="theme-doc-sidebar-item-category menu__list-item">
      <div class="menu__list-item-collapsible"><a class="menu__link" href="/api-ref/rtc/web/overview">API 参考</a></div>
      <ul class="menu__list">
        <li class="theme-doc-sidebar-item-link menu__list-item"><a class="menu__link" href="/api-ref/rtc/web/overview">概览</a></li>
        <li class="theme-doc-sidebar-item-category menu__list-item">
          <div class="menu__list-item-collapsible"><span class="menu__link">类</span></div>
          <ul class="menu__list"><li class="menu__list-item"><a class="menu__link" href="/api-ref/rtc/web/classes/client">Client</a></li></ul>
        </li>
      </ul>
    </li>
    <li class="menu__list-item custom-return-link"><a class="menu__link" href="/doc/rtc/web/landing">回到普通文档</a></li>
  </ul></nav></aside>
  <main><article><h1 id="api-overview">API 概览</h1><p>正文内容足够长，用来确认页面不是空壳。</p><a href="/api-ref/rtc/web/classes/client#join">Client</a><a href="https://example.com">External</a></article></main>
  </body></html>`;
}

describe('API Center page graph', () => {
  it('preserves recursive sidebar order and excludes return links from pages', () => {
    const graph = parseLegacyPageHtml({
      html: pageHtml(),
      requestedUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
      finalUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
      status: 200,
    });

    expect(graph.status).toBe('resolved');
    expect(graph.navigation[0]).toMatchObject({
      kind: 'category',
      label: 'API 参考',
      items: [
        { kind: 'link', label: '概览' },
        {
          kind: 'category',
          label: '类',
          items: [{ kind: 'link', label: 'Client' }],
        },
      ],
    });
    expect(graph.pages.map((page) => page.path)).toEqual([
      '/api-ref/rtc/web/overview',
      '/api-ref/rtc/web/classes/client',
    ]);
    expect(graph.navigation[1]).toMatchObject({
      excludedReason: 'return-to-guide',
    });
    expect(graph.fragments).toContain('api-overview');
    expect(graph.landingPageLinks.internal[0]).toMatchObject({
      path: '/api-ref/rtc/web/classes/client',
      fragment: 'join',
    });
  });

  it('marks redirects, missing sidebars, and empty articles explicitly', () => {
    const graph = parseLegacyPageHtml({
      html: '<html><head><title>Moved</title></head><body></body></html>',
      requestedUrl: 'https://doc.shengwang.cn/api-ref/old',
      finalUrl: 'https://doc.shengwang.cn/api-ref/new',
      status: 200,
    });

    expect(graph.status).toBe('failed');
    expect(graph.warnings.map((warning) => warning.code)).toEqual([
      'entry-redirect',
      'empty-or-missing-article',
      'missing-sidebar',
    ]);
  });

  it('crawls only current entries and retains external entries', async () => {
    const manifest: any = {
      counts: {},
      entries: [
        {
          id: 'current',
          scope: 'current',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
          pageGraph: { status: 'pending', pages: [], warnings: [] },
        },
        {
          id: 'external',
          scope: 'external-entry',
          legacyUrl: 'https://example.com',
          pageGraph: { status: 'not-applicable', pages: [], warnings: [] },
        },
      ],
    };
    const fetchImpl: any = async (url: string) => ({
      status: 200,
      url,
      text: async () => pageHtml(),
    });

    await crawlManifestEntries(manifest, { fetchImpl });

    expect(manifest.entries[0].pageGraph.status).toBe('resolved');
    expect(manifest.entries[1].pageGraph.status).toBe('not-applicable');
    expect(manifest.pageGraphSummary).toMatchObject({
      entryCount: 1,
      uniquePageCount: 2,
    });
  });

  it('parses curl status, final URL, and response text', async () => {
    const response = parseCurlOutput(
      '<article>fixture</article>\n__API_CENTER_CURL_META__\t200\thttps://doc.shengwang.cn/api-ref/fixture',
      'https://doc.shengwang.cn/api-ref/fixture',
    );
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain('<article>fixture</article>');
  });

  it('derives product/platform route scope roots', () => {
    expect(
      routeScopeRoot(
        'https://doc.shengwang.cn/api-ref/rtc/android/API/overview',
      ),
    ).toBe('/api-ref/rtc/android/');
    expect(
      routeScopeRoot('https://doc.shengwang.cn/doc/online-ktv/ios/api'),
    ).toBe('/doc/online-ktv/ios/');
  });

  it('builds a body-link closure within each product/platform scope', async () => {
    const first = pageHtml().replace(
      '</article>',
      '<a href="/api-ref/rtc/web/classes/extra#member">Extra</a></article>',
    );
    const second = `<!doctype html><article><h1 id="member">Extra</h1><div id="join"></div><p>Second page body with enough substantive text.</p></article>`;
    const pages = new Map([
      ['https://doc.shengwang.cn/api-ref/rtc/web/overview', first],
      ['https://doc.shengwang.cn/api-ref/rtc/web/classes/client', second],
      ['https://doc.shengwang.cn/api-ref/rtc/web/classes/extra', second],
    ]);
    const manifest: any = {
      counts: {},
      pageGraphSummary: { entryCount: 1, uniquePageCount: 2 },
      entries: [
        {
          id: 'current',
          scope: 'current',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
          pageGraph: {
            status: 'resolved',
            warnings: [],
            pages: [
              {
                path: '/api-ref/rtc/web/overview',
                url: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
              },
              {
                path: '/api-ref/rtc/web/classes/client',
                url: 'https://doc.shengwang.cn/api-ref/rtc/web/classes/client',
              },
            ],
          },
        },
      ],
    };
    const fetchImpl: any = async (url: string) => ({
      status: pages.has(url) ? 200 : 404,
      url,
      text: async () => pages.get(url) ?? '<html><body>not found</body></html>',
    });

    await crawlBodyLinkClosure(manifest, { fetchImpl, concurrency: 2 });

    expect(
      manifest.pageEvidence.map((page: any) => page.requestedUrl),
    ).toContain(
      'https://doc.shengwang.cn/api-ref/rtc/web/classes/extra',
    );
    expect(manifest.entries[0].pageGraph.closure).toMatchObject({
      status: 'resolved',
      scopeRoot: '/api-ref/rtc/web/',
      pageCount: 3,
    });
    expect(manifest.pageGraphSummary).toMatchObject({
      closurePageCount: 3,
      closureLogicalPageCount: 3,
      closureFailedCount: 0,
      fragmentWarningCount: 0,
    });
  });

  it('records broken body links as source warnings while seed failures remain failed', () => {
    const manifest = {
      entries: [
        {
          id: 'entry',
          scope: 'current',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
          pageGraph: {
            pages: [
              {
                url: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
              },
            ],
          },
        },
      ],
      pageGraphSummary: {},
      pageEvidence: [
        {
          requestedUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
          finalUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
          scopeRoot: '/api-ref/rtc/web/',
          status: 'resolved',
          httpStatus: 200,
          bodyHash: 'one',
          fragments: [],
          internalLinks: [],
          warnings: [],
        },
        {
          requestedUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/missing',
          finalUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/missing',
          scopeRoot: '/api-ref/rtc/web/',
          status: 'failed',
          httpStatus: 404,
          bodyHash: null,
          fragments: [],
          internalLinks: [],
          warnings: [{ code: 'http-error', severity: 'error' }],
        },
      ],
    };

    finalizeBodyClosure(manifest);

    expect(
      manifest.pageEvidence.find((page) => page.httpStatus === 404),
    ).toMatchObject({
      status: 'warning',
      discoveredFrom: 'body-link',
      warnings: [{ code: 'broken-live-body-link', severity: 'warning' }],
    });
    expect(manifest.pageGraphSummary).toMatchObject({
      closureFailedCount: 0,
      closureWarningCount: 1,
    });
  });

  it('parses body evidence without retaining repeated sidebars', () => {
    const evidence = parseBodyPageEvidence({
      html: pageHtml(),
      requestedUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
      finalUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/overview',
      status: 200,
    });
    expect(evidence).toMatchObject({
      status: 'resolved',
      title: 'API 概览',
    });
    expect(evidence).not.toHaveProperty('navigation');
  });
});
