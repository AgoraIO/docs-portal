// @vitest-environment node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  declaredRedirectTarget,
  loadBuiltSite,
  validateLocalTarget,
} from './lib/cn-link-audit/built.mjs';
import { resolveOccurrence } from './lib/cn-link-audit/inventory.mjs';

const roots: string[] = [];
function fixture(
  routes: unknown = [
    { url: '/zh-CN/guide/start', canonicalPath: '/zh-CN/guide/start' },
  ],
) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cn-links-built-'));
  roots.push(repoRoot);
  const write = (file: string, value: string) => {
    const target = path.join(repoRoot, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, value);
  };
  write('public/__static/docs-routes.json', JSON.stringify(routes));
  return { repoRoot, write };
}
const body = (content: string) =>
  `<html><body><article><div data-static-docs-body>${content}</div></article></body></html>`;
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});

describe('built CN HTML evidence', () => {
  it('loads isolated routes and actual anchors, body references, and content digest', () => {
    const { repoRoot, write } = fixture();
    const html = body(
      '<h2 id="中文">正文</h2><a name="legacy"></a><a href="/guide/next?q=1#part">next</a><img src="/a.png" srcset="/b.png 1x, /c.png 2x"><video poster="/poster.jpg"></video><div style="background-image:url(\'/bg.png\')"></div>',
    ).replace('<body>', '<body><script src="/tracking.js"></script>');
    write('dist/client/zh-CN/guide/start/index.html', html);
    const site = loadBuiltSite({ repoRoot });
    const page = site.pages.get('/guide/start');
    expect(site.gaps).toEqual([]);
    expect(page).toMatchObject({
      pageUrl: '/guide/start',
      hasDocsBody: true,
      digest: createHash('sha256').update(html).digest('hex'),
    });
    expect([...page.anchors]).toEqual(['中文', 'legacy']);
    expect(site.links.map((link: { href: string }) => link.href)).toEqual([
      '/guide/next?q=1#part',
      '/a.png',
      '/b.png',
      '/c.png',
      '/poster.jpg',
      '/bg.png',
    ]);
    expect(site.links[0]).toMatchObject({
      source: 'rendered',
      sourcePath: page.filePath,
      attribute: 'href',
      kind: 'link',
    });
  });

  it('reports missing HTML, SPA shells, empty bodies, skeletons, and expected routes absent from the manifest', () => {
    const routes = ['missing', 'shell', 'empty', 'skeleton'].map((name) => ({
      url: `/zh-CN/guide/${name}`,
      canonicalPath: `/zh-CN/guide/${name}`,
    }));
    const { repoRoot, write } = fixture(routes);
    write(
      'dist/client/zh-CN/guide/shell/index.html',
      '<html><body><div id="root"></div></body></html>',
    );
    write(
      'dist/client/zh-CN/guide/empty/index.html',
      body('<!-- comment --><script>text</script>'),
    );
    write(
      'dist/client/zh-CN/guide/skeleton/index.html',
      body('<div data-testid="docs-content-skeleton">Loading</div>'),
    );
    const site = loadBuiltSite({
      repoRoot,
      expectedRoutes: new Map([['/guide/unlisted', {}]]),
    });
    expect(site.gaps.map((gap) => gap.reason)).toEqual(
      expect.arrayContaining([
        'missing-built-html',
        'missing-docs-body',
        'empty-docs-body',
        'docs-body-skeleton',
        'expected-route-not-in-manifest',
      ]),
    );
    expect(site.pages.get('/guide/empty').hasDocsBody).toBe(false);
  });

  it.each(['[]', '{}', '{bad'])(
    'treats absent, empty, or invalid manifests as incomplete (%s)',
    (value) => {
      const { repoRoot, write } = fixture();
      write('public/__static/docs-routes.json', value);
      expect(loadBuiltSite({ repoRoot }).gaps.length).toBeGreaterThan(0);
      fs.unlinkSync(path.join(repoRoot, 'public/__static/docs-routes.json'));
      expect(loadBuiltSite({ repoRoot }).gaps[0].reason).toBe(
        'missing-route-manifest',
      );
    },
  );

  it('retains distinct platform route evidence and excludes English routes', () => {
    const { repoRoot, write } = fixture([
      { url: '/zh-CN/guide/start', canonicalPath: '/zh-CN/guide/start' },
      {
        url: '/zh-CN/guide/start/android',
        canonicalPath: '/zh-CN/guide/start',
        platform: 'android',
      },
      { url: '/en/guide/start', canonicalPath: '/en/guide/start' },
      { url: '/guide/public', canonicalPath: '/guide/public' },
      { url: '/search', canonicalPath: '/search' },
    ]);
    for (const name of [
      'zh-CN/guide/start',
      'zh-CN/guide/start/android',
      'guide/public',
    ])
      write(`dist/client/${name}/index.html`, body('正文'));
    const site = loadBuiltSite({ repoRoot });
    expect([...site.pages.keys()]).toEqual([
      '/guide/start',
      '/guide/start/android',
      '/guide/public',
    ]);
    expect(site.gaps).toEqual([]);
  });

  it('includes docs navigation links outside the article without collecting global scripts', () => {
    const { repoRoot, write } = fixture();
    write(
      'dist/client/zh-CN/guide/start/index.html',
      body('正文').replace(
        '<body>',
        '<body><aside data-sidebar="sidebar"><a href="/guide/sidebar">Sidebar</a><script src="/global.js"></script></aside><nav aria-label="Pagination"><a rel="next" href="/guide/next">Next</a></nav>',
      ),
    );
    const site = loadBuiltSite({ repoRoot });
    expect(site.links.map((link: { href: string }) => link.href)).toEqual([
      '/guide/sidebar',
      '/guide/next',
    ]);
  });
});

describe('built local targets', () => {
  function setup(content = '<h2 id="中文">正文</h2>') {
    const result = fixture();
    result.write('dist/client/zh-CN/guide/start/index.html', body(content));
    const site = loadBuiltSite({ repoRoot: result.repoRoot });
    const check = (href: string, kind = 'link') => {
      const occurrence = {
        pageUrl: '/guide/start',
        sourcePath: 'fixture.html',
        source: 'rendered',
        href,
        kind,
      };
      return validateLocalTarget(
        occurrence,
        resolveOccurrence(occurrence),
        site,
        { repoRoot: result.repoRoot },
      );
    };
    return { ...result, site, check };
  }

  it('checks encoded anchors and trailing slashes without losing the query', () => {
    const { check } = setup();
    expect(check('/guide/start/?mode=2#%E4%B8%AD%E6%96%87')).toMatchObject({
      status: 'valid',
      target: '/guide/start/?mode=2#%E4%B8%AD%E6%96%87',
    });
    expect(check('#absent')).toMatchObject({
      status: 'broken',
      reason: 'missing-anchor',
    });
  });

  it('keeps interactive missing anchors and runtime locale aliases unverified', () => {
    const { check, site } = setup(
      '<h2>正文</h2><button role="tab">Tab</button><details><summary>More</summary></details>',
    );
    expect(site.pages.get('/guide/start').interactive).toBe(true);
    expect(check('#client-anchor')).toMatchObject({
      status: 'unverified',
      reason: 'interactive-anchor-needs-browser',
    });
    expect(check('/zh-CN/guide/start')).toMatchObject({
      status: 'unverified',
      reason: 'locale-route-needs-http',
    });
    expect(check('/search?q=sdk')).toMatchObject({
      status: 'unverified',
      reason: 'route-needs-http',
    });
  });

  it('requires browser proof for an existing ID inside a hidden platform panel', () => {
    const { check, site } = setup(
      '<div data-platform-panel="android" hidden><h2 id="hidden">正文</h2></div>',
    );
    expect(site.pages.get('/guide/start').interactive).toBe(true);
    expect(check('#hidden')).toMatchObject({
      status: 'unverified',
      reason: 'interactive-anchor-needs-browser',
    });
  });

  it('requires assets in the build, rejects traversal, and identifies missing routes', () => {
    const { check, write, site, repoRoot } = setup();
    write('dist/client/assets/exists.png', 'PNG');
    write('public/assets/not-built.png', 'PNG');
    expect(check('/assets/exists.png?v=2', 'resource').status).toBe('valid');
    expect(check('/assets/missing.png', 'resource')).toMatchObject({
      status: 'broken',
      reason: 'missing-local-resource',
    });
    expect(check('/assets/not-built.png', 'resource').status).toBe('broken');
    expect(check('/guide/missing').status).toBe('broken');
    expect(
      validateLocalTarget(
        { kind: 'resource' },
        { pathname: '/../secret.txt', target: '/../secret.txt' },
        site,
        { repoRoot },
      ),
    ).toMatchObject({ status: 'broken', reason: 'unsafe-local-path' });
    expect(check('mailto:hello@example.com').status).toBe('not-applicable');
    expect(check('https://example.com').status).toBe('not-applicable');
  });

  it('does not certify resource files containing HTML or symlinks outside the build', () => {
    const { check, write, repoRoot } = setup();
    write(
      'dist/client/assets/fake.png',
      '<!doctype html><html><body>SPA fallback</body></html>',
    );
    write('secret.txt', 'secret');
    fs.symlinkSync(
      path.join(repoRoot, 'secret.txt'),
      path.join(repoRoot, 'dist/client/assets/escape.png'),
    );
    expect(check('/assets/fake.png', 'resource')).toMatchObject({
      status: 'unverified',
      reason: 'html-in-local-resource',
    });
    expect(check('/assets/escape.png', 'resource')).toMatchObject({
      status: 'broken',
      reason: 'unsafe-local-path',
    });
  });

  it('keeps expected pages missing from the manifest unverified rather than calling them nonexistent', () => {
    const { repoRoot } = fixture([]);
    const site = loadBuiltSite({
      repoRoot,
      expectedRoutes: new Map([['/guide/unlisted', {}]]),
    });
    const occurrence = {
      pageUrl: '/guide/start',
      href: '/guide/unlisted',
      source: 'rendered',
      kind: 'link',
    };
    expect(
      validateLocalTarget(occurrence, resolveOccurrence(occurrence), site, {
        repoRoot,
      }),
    ).toMatchObject({ status: 'unverified', reason: 'missing-built-html' });
  });
});

it('requires browser visibility evidence for ordinary hidden fragment targets', () => {
  const { repoRoot, write } = fixture();
  write(
    'dist/client/zh-CN/guide/start/index.html',
    body('<h1>Doc</h1><h2 id="secret" hidden>Hidden</h2>'),
  );
  const site = loadBuiltSite({ repoRoot });
  const link = {
    href: '#secret',
    kind: 'link',
    source: 'rendered',
    pageUrl: '/guide/start',
  };
  expect(validateLocalTarget(link, resolveOccurrence(link), site).status).toBe(
    'unverified',
  );
});

it('recognizes declared CN migration redirects without pretending HTTP was checked', () => {
  const target =
    '/realtime-media/rtsa/build/media-and-signaling-transmission/string-uid';
  const { repoRoot, write } = fixture([
    { url: `/zh-CN${target}`, canonicalPath: `/zh-CN${target}` },
  ]);
  write(`dist/client/zh-CN${target}/index.html`, body('<h1>String UID</h1>'));
  const site = loadBuiltSite({ repoRoot });
  const link = {
    href: '/realtime-media/rtsa/build/implement-core-features/string-uid',
    pageUrl: '/ai',
    kind: 'link',
    source: 'rendered',
  };
  expect(
    validateLocalTarget(link, resolveOccurrence(link), site),
  ).toMatchObject({
    status: 'unverified',
    reason: 'declared-redirect-needs-http',
    expectedPath: target,
  });
});

it('ignores article copy-menu controls but detects document tabs and header platform tabs', () => {
  const { repoRoot, write } = fixture();
  const file = 'dist/client/zh-CN/guide/start/index.html';
  const plain = body('<h2 id="start">正文</h2>').replace(
    '<article>',
    '<article><header><button aria-expanded="false" data-state="closed">Copy menu</button></header>',
  );
  write(file, plain);
  const first = loadBuiltSite({ repoRoot }).pages.get('/guide/start');
  expect(first.interactive).toBe(false);
  expect(first.contentDigest).toMatch(/^[a-f0-9]{64}$/);
  write(file, plain.replace('</h2>', '</h2><button role="tab">Tab</button>'));
  expect(
    loadBuiltSite({ repoRoot }).pages.get('/guide/start').interactive,
  ).toBe(true);
  write(
    file,
    plain.replace(
      '</header>',
      '</header><div data-platform-header-tabs><button role="tab">Android</button></div>',
    ),
  );
  expect(
    loadBuiltSite({ repoRoot }).pages.get('/guide/start').interactive,
  ).toBe(true);
});

it('binds page-platform content and outside local fragments to published routes while preserving explicit targets', () => {
  const { repoRoot, write } = fixture(
    ['ios', 'android'].map((platform) => ({
      url: `/zh-CN/guide/${platform}`,
      canonicalPath: '/zh-CN/guide',
      platform,
    })),
  );
  const html =
    body(`<div data-platform-group="structured" data-platforms="ios android unknown">
    <section data-platform-panel="ios"><h2 id="ios-heading">iOS</h2></section>
    <section data-platform-panel="android" hidden inert>
      <h2 id="android-heading">Android</h2><a href="#android-heading">Local</a>
      <a href="/guide/ios#android-heading">Explicit</a>
      <a href="https://example.com/guide/ios#android-heading">Absolute</a>
      <div role="tabpanel"><details><a href="#nested">Nested</a><h3 id="nested">Nested heading</h3></details></div>
      <div data-platform-group="inline"><section data-platform-panel="ios"><a href="#nested-platform">Nested platform</a></section></div>
    </section>
    <section data-platform-panel="unknown" hidden><a href="#unknown">Unknown</a></section>
  </div>`)
      .replace(
        'data-static-docs-body',
        'data-static-docs-body data-platform-header-tabs="true"',
      )
      .replace(
        '</article>',
        '<nav><a href="#android-heading">TOC outside panel</a></nav></article>',
      );
  for (const platform of ['ios', 'android'])
    write(`dist/client/zh-CN/guide/${platform}/index.html`, html);
  const site = loadBuiltSite({ repoRoot });
  const links: Array<{
    href: string;
    pageUrl: string;
    platformContext?: string;
    platformContextSource?: string;
    [key: string]: unknown;
  }> = site.pages.get('/guide/ios').links;
  const local = links.filter((link) => link.href === '#android-heading');
  expect(local).toHaveLength(2);
  for (const link of local) {
    expect(link).toMatchObject({
      pageUrl: '/guide/android',
      renderedAt: '/guide/ios',
      platformContext: 'android',
      platformContextStatus: 'published-route',
      href: '#android-heading',
    });
    expect(resolveOccurrence(link).target).toBe(
      '/guide/android#android-heading',
    );
  }
  expect(local.map((link) => link.platformContextSource)).toEqual([
    'enclosing-panel',
    'fragment-target',
  ]);
  for (const href of [
    '/guide/ios#android-heading',
    'https://example.com/guide/ios#android-heading',
  ]) {
    const link = links.find((link) => link.href === href);
    expect(link).toMatchObject({ href, platformContext: 'android' });
    expect(resolveOccurrence(link).target).toBe(href);
  }
  for (const href of ['#nested', '#nested-platform'])
    expect(links.find((link) => link.href === href)).toMatchObject({
      pageUrl: '/guide/android',
      platformContext: 'android',
    });
  expect(links.find((link) => link.href === '#unknown')).toMatchObject({
    pageUrl: '/guide/ios',
    renderedAt: '/guide/ios',
    platformContext: 'unknown',
    platformContextStatus: 'unpublished-platform',
  });
  expect(site.routes.has('/guide/unknown')).toBe(false);
  expect(site.gaps).toContainEqual(
    expect.objectContaining({
      reason: 'platform-context-route-unresolved',
      platformContext: 'unknown',
    }),
  );
});

it('does not promote ordinary nested tabs or inline platform groups into page routes', () => {
  const { repoRoot, write } = fixture(
    ['ios', 'android'].map((platform) => ({
      url: `/zh-CN/guide/${platform}`,
      canonicalPath: '/zh-CN/guide',
      platform,
    })),
  );
  const html = body(
    '<div role="tablist"><button role="tab">Android</button></div><div role="tabpanel" data-platform="android"><a href="#ordinary">Ordinary tab</a></div><div data-platform-group="inline"><section data-platform-panel="android"><a href="#inline">Inline platform</a></section></div>',
  );
  for (const platform of ['ios', 'android'])
    write(`dist/client/zh-CN/guide/${platform}/index.html`, html);
  const links = loadBuiltSite({ repoRoot }).pages.get('/guide/ios').links;
  for (const link of links) {
    expect(link.pageUrl).toBe('/guide/ios');
    expect(link.platformContext).toBeUndefined();
  }
});

it('uses the same hash-specific API destination as the router', () => {
  expect(
    declaredRedirectTarget(
      '/api-reference/whiteboard/fastboard/fastboard-api#appintoolbar',
    ),
  ).toBe('/api-reference/whiteboard/fastboard/web');
  expect(
    declaredRedirectTarget(
      '/zh-CN/api-reference/rtm/toc-storage/storage#metadataitem',
    ),
  ).toBe('/api-reference/rtm/flutter/storage');
});

it('retains declared redirect query and hash semantics separately from its pathname', async () => {
  const { declaredRedirectUrl } = await import('./lib/cn-link-audit/built.mjs');
  const source =
    '/realtime-media/rtsa/build/implement-core-features/string-uid?mode=compact&tag=a&tag=a#heading';
  expect(declaredRedirectUrl(source)).toBe(
    '/realtime-media/rtsa/build/media-and-signaling-transmission/string-uid?mode=compact&tag=a&tag=a#heading',
  );
  expect(declaredRedirectTarget(source)).toBe(
    '/realtime-media/rtsa/build/media-and-signaling-transmission/string-uid',
  );
});
