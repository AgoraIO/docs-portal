import { describe, expect, it, vi } from 'vitest';
import {
  browserNavigationFailure,
  collectDomEvidence,
} from './lib/cn-link-audit/browser.mjs';

describe('browser evidence', () => {
  it('separates visible anchors from hidden tab targets and records actual hrefs', () => {
    document.body.innerHTML =
      '<article data-static-docs-body><h1>Doc</h1><a href="/ai/start">Start</a><div hidden><h2 id="hidden">Hidden</h2></div><h2 id="visible">Visible</h2><button role="tab" aria-selected="true" aria-controls="one">One</button><button role="tab" aria-selected="false" aria-controls="two">Two</button></article>';
    const result = collectDomEvidence();
    expect(result.anchors).toContain('hidden');
    expect(result.visibleAnchors).not.toContain('hidden');
    expect(result.visibleAnchors).toContain('visible');
    expect(result.links[0].href).toBe('/ai/start');
    expect(result.controls).toHaveLength(2);
    expect(result.hasDocsBody).toBe(true);
  });
  it('does not treat SPA skeleton as page content', () => {
    document.body.innerHTML =
      '<article data-static-docs-body><div data-testid="docs-content-skeleton"></div></article>';
    expect(collectDomEvidence().hasDocsBody).toBe(false);
  });
});

describe('browser collector safety and states', () => {
  it('checks hidden ancestors, collapsed details, and named anchors', () => {
    document.body.innerHTML = `<article data-static-docs-body><h1>Doc</h1>
      <details><summary id="summary">Read</summary><div><h2 id="collapsed">Hidden</h2></div></details>
      <div aria-hidden="true"><a name="aria-hidden">Hidden</a></div>
      <div style="display:none"><span id="css-hidden">Hidden</span></div>
      <a name="legacy">Visible</a></article>`;
    const result = collectDomEvidence();
    expect(result.anchors).toEqual(
      expect.arrayContaining([
        'collapsed',
        'aria-hidden',
        'css-hidden',
        'legacy',
      ]),
    );
    expect(result.visibleAnchors).toEqual(['summary', 'legacy']);
    expect(result.controls[0]).toMatchObject({
      kind: 'details',
      safe: true,
      expanded: 'false',
    });
  });

  it('does not authorize submission, linked controls, or arbitrary dropdowns', () => {
    document.body.innerHTML = `<article data-static-docs-body><h1>Doc</h1>
      <button type="submit" role="tab">Submit</button>
      <form><button role="tab">Form</button></form>
      <a href="/mutate" role="tab">Navigate</a>
      <button aria-expanded="false" aria-haspopup="menu">Menu</button>
      <button aria-expanded="false" aria-controls="content">Read more</button>
      <button>Copy</button></article>`;
    expect(collectDomEvidence().controls.map((entry) => entry.safe)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('records assets in article content, ignores scripts and global UI', () => {
    document.body.innerHTML = `<nav><a href="/global">Global</a></nav><article data-static-docs-body>
      <h1>Doc</h1><img src="one.png" srcset="two.png 2x, three.png 3x">
      <video poster="cover.png" src="video.mp4"></video>
      <div style="background-image:url('back.png')"></div>
      <script type="application/json" src="app.js"></script><template><a href="/template">Template</a></template></article>`;
    expect(
      collectDomEvidence()
        .links.map((entry) => entry.href)
        .sort(),
    ).toEqual(
      [
        'one.png',
        'two.png',
        'three.png',
        'cover.png',
        'video.mp4',
        'back.png',
      ].sort(),
    );
  });

  it('changes state signature when a details panel opens', () => {
    document.body.innerHTML =
      '<article data-static-docs-body><details><summary>Expand</summary><a id="target" href="/nested">Nested</a></details></article>';
    const before = collectDomEvidence();
    const details = document.querySelector('details');
    if (details) details.open = true;
    const after = collectDomEvidence();
    expect(after.stateSignature).not.toBe(before.stateSignature);
    expect(after.visibleAnchors).toContain('target');
  });
});

it('permits only the known platform overflow menu and its choices', () => {
  document.body.innerHTML =
    '<article data-static-docs-body><h1>Doc</h1><div data-platform-header-tabs><button aria-haspopup="menu" aria-expanded="true">More</button><div role="menu"><button role="menuitem">Web</button></div></div></article>';
  expect(
    collectDomEvidence().controls.map((entry) => ({
      safe: entry.safe,
      kind: entry.kind,
    })),
  ).toEqual([
    { safe: true, kind: 'platform-menu' },
    { safe: true, kind: 'platform-menu' },
  ]);
});

it('preserves commas inside srcset URL tokens and their resource kind', () => {
  document.body.innerHTML =
    '<article><div data-static-docs-body><div class="docs-body"><p>Hydrated content</p><img srcset="data:image/png;base64,AAAA 1x, https://cdn.example/a,b.png 2x"></div></div></article>';
  const result = collectDomEvidence();
  expect(result.hasDocsBody).toBe(true);
  expect(result.links).toEqual([
    {
      href: 'data:image/png;base64,AAAA',
      attribute: 'srcset',
      kind: 'resource',
      visible: true,
    },
    {
      href: 'https://cdn.example/a,b.png',
      attribute: 'srcset',
      kind: 'resource',
      visible: true,
    },
  ]);
});

it('does not let an article heading hide a loading or empty hydrated body', () => {
  document.body.innerHTML =
    '<article><header><h1>Already loaded title</h1></header><div data-static-docs-body><div class="docs-body"></div><div data-testid="docs-content-skeleton">Loading</div></div></article>';
  expect(collectDomEvidence().hasDocsBody).toBe(false);
  document.querySelector('[data-testid="docs-content-skeleton"]')?.remove();
  expect(collectDomEvidence().hasDocsBody).toBe(false);
  const content = document.querySelector('.docs-body');
  if (content) content.textContent = 'Loaded documentation';
  expect(collectDomEvidence().hasDocsBody).toBe(true);
});

it('limits state controls to docs content and platform header without dropping article links', () => {
  document.body.innerHTML = `<article><header><h1>Doc</h1>
    <a href="/breadcrumb">Breadcrumb</a>
    <button aria-expanded="false" aria-haspopup="menu">Copy menu</button>
    <div data-platform-header-tabs><button role="tab" aria-selected="false">Web</button></div>
    </header><div data-static-docs-body><p>Loaded</p>
      <button aria-expanded="false" aria-controls="release">Release accordion</button>
      <section id="release" hidden>Release</section>
      <div class="openapi-schema-tree"><button aria-expanded="false">Schema fields</button></div>
    </div><aside><button aria-expanded="false">Mobile TOC</button></aside></article>`;
  const result = collectDomEvidence();
  expect(
    result.controls.map((control) => [control.label, control.safe]),
  ).toEqual([
    ['Web', true],
    ['Release accordion', true],
    ['Schema fields', true],
  ]);
  expect(result.links.map((link) => link.href)).toContain('/breadcrumb');
});

it('collects links in the documentation version menu without navigating them', () => {
  document.body.innerHTML =
    '<aside><button aria-label="选择文档版本" aria-haspopup="menu" aria-expanded="true">4.0</button></aside><article data-static-docs-body><h1>Doc</h1></article><div role="menu" aria-label="文档版本"><a role="menuitem" href="https://archive.example/3">3.0</a></div>';
  const evidence = collectDomEvidence();
  expect(
    evidence.links.some((link) => link.href === 'https://archive.example/3'),
  ).toBe(true);
  expect(evidence.controls).toHaveLength(1);
  expect(evidence.controls[0].safe).toBe(true);
});

it('does not promote an HTTP error page to reachable merely because it has text', async () => {
  const { browserNavigationFailure } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  expect(
    browserNavigationFailure({ responseStatus: 405, title: '405 Not Allowed' }),
  ).toEqual({ status: 'unverified', reason: 'browser-http-405' });
  expect(
    browserNavigationFailure({ responseStatus: 403, title: 'Cloud service' }),
  ).toEqual({ status: 'unverified', reason: 'browser-http-403' });
  expect(
    browserNavigationFailure({ responseStatus: 404, title: 'Docs' }),
  ).toEqual({ status: 'broken', reason: 'browser-http-404' });
  expect(
    browserNavigationFailure({ responseStatus: 200, title: 'Docs' }),
  ).toBeUndefined();
});

describe('timed out browser navigation evidence', () => {
  const target = 'https://docs.example/guide#ready';
  const before = { url: 'about:blank', timeOrigin: 100 };
  const loaded = {
    url: target,
    navigationUrl: 'https://docs.example/guide',
    documentUrl: target,
    timeOrigin: 200,
    responseStatus: 200,
    hasReadableBody: true,
    browserErrorPage: false,
  };

  it('can continue after a load timeout when a fresh 200 document is readable', async () => {
    const { canRecoverTimedOutNavigation } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    expect(
      canRecoverTimedOutNavigation(
        before,
        loaded,
        target,
        new Error('Timeout 1000ms exceeded waiting for load'),
      ),
    ).toBe(true);
  });

  it.each([
    { timeOrigin: 100 },
    { timeOrigin: undefined },
    { url: 'https://docs.example/previous' },
    { navigationUrl: undefined },
    { navigationUrl: 'https://docs.example/previous' },
    { responseStatus: 0 },
    { responseStatus: 403 },
    { hasReadableBody: false },
    { documentUrl: 'chrome-error://chromewebdata/' },
    { browserErrorPage: true },
  ])(
    'does not recover without fresh target document proof (%j)',
    async (changes) => {
      const { canRecoverTimedOutNavigation } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      expect(
        canRecoverTimedOutNavigation(
          before,
          { ...loaded, ...changes },
          target,
          new Error('Timeout 1000ms exceeded'),
        ),
      ).toBe(false);
    },
  );

  it('does not swallow arbitrary open errors even if a readable page exists', async () => {
    const { canRecoverTimedOutNavigation } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    expect(
      canRecoverTimedOutNavigation(
        before,
        loaded,
        target,
        new Error('net::ERR_NAME_NOT_RESOLVED'),
      ),
    ).toBe(false);
  });

  it('collects readable body and navigation identity separately from docs body', () => {
    document.body.innerHTML =
      '<h1>External docs</h1><p>Readable documentation.</p>';
    const evidence = collectDomEvidence();
    expect(evidence.hasDocsBody).toBe(false);
    expect(evidence.hasReadableBody).toBe(true);
    expect(evidence.timeOrigin).toBeGreaterThan(0);
    expect(evidence.documentUrl).toBe(document.documentURI);
  });

  it('rejects Chromium network error documents even when they contain text', async () => {
    document.body.innerHTML =
      '<div id="main-frame-error"><div class="error-code">ERR_CONNECTION_RESET</div></div>';
    const evidence = collectDomEvidence();
    expect(evidence.browserErrorPage).toBe(true);
    const { browserNavigationFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    expect(browserNavigationFailure(evidence)).toEqual({
      status: 'unverified',
      reason: 'browser-network-error',
    });
  });
});

it('recognizes the application error boundary rather than waiting for an absent docs body', () => {
  document.body.innerHTML =
    '<div><strong>Something went wrong!</strong><button>Show Error</button></div>';
  const evidence = collectDomEvidence();
  expect(evidence.appRenderError).toBe(true);
  expect(browserNavigationFailure(evidence)).toEqual({
    status: 'broken',
    reason: 'browser-render-error',
  });
});

describe('best-effort storage reset before target navigation', () => {
  const target = 'https://docs.example/next#ready';
  const blank = { url: 'about:blank', timeOrigin: 100 };
  const loaded = {
    url: target,
    documentUrl: target,
    navigationUrl: target,
    timeOrigin: 200,
    responseStatus: 200,
    hasReadableBody: true,
  };

  it('still opens blank and then the target when the previous document cannot clear storage', async () => {
    const { navigateBrowserTarget } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    const calls: string[][] = [];
    const snapshots = [blank, loaded];
    const result: Record<string, unknown> = {};
    const evidence = await navigateBrowserTarget(
      {
        evaluate: async () => {
          throw new Error('Old execution context unavailable');
        },
        run: async (...args: string[]) => {
          calls.push(args);
        },
        navigationSnapshot: async () => snapshots.shift(),
      },
      target,
      result,
    );
    expect(calls).toEqual([
      ['open', 'about:blank'],
      ['open', target],
    ]);
    expect(result).toMatchObject({
      storageResetFailed: true,
      storageResetError: 'Old execution context unavailable',
    });
    expect(evidence).toEqual(loaded);
  });

  it('does not recover a target timeout using an unchanged previous document after cleanup fails', async () => {
    const { navigateBrowserTarget } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    const calls: string[][] = [];
    const result: Record<string, unknown> = {};
    const stale = { ...loaded, timeOrigin: 100 };
    const snapshots = [blank, stale];
    await expect(
      navigateBrowserTarget(
        {
          evaluate: async () => {
            throw new Error('Old page is hung');
          },
          run: async (...args: string[]) => {
            calls.push(args);
            if (args[1] === target) throw new Error('Operation timed out');
          },
          navigationSnapshot: async () => snapshots.shift(),
        },
        target,
        result,
      ),
    ).rejects.toThrow('Operation timed out');
    expect(calls).toContainEqual(['open', target]);
    expect(result).toMatchObject({
      storageResetFailed: true,
      status: 'unverified',
      reason: 'browser-navigation-not-proven',
    });
    expect(result.navigationRecovered).toBeUndefined();
  });
});

describe('lightweight navigation evidence', () => {
  it('decodes the requested fragment exactly once and reads only its target', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><h1>Doc</h1><h2 id="中文">Target</h2><h2 id="a%20b">Literal percent</h2><a name="legacy">Legacy</a></main>';
    expect(collectNavigationEvidence('#%E4%B8%AD%E6%96%87')).toMatchObject({
      anchors: ['中文'],
      visibleAnchors: ['中文'],
      hasDocsBody: true,
    });
    expect(collectNavigationEvidence('#a%2520b').visibleAnchors).toEqual([
      'a%20b',
    ]);
    expect(collectNavigationEvidence('#a%20b').anchors).toEqual([]);
    expect(collectNavigationEvidence('#legacy').visibleAnchors).toEqual([
      'legacy',
    ]);
    expect(collectNavigationEvidence().anchors).toEqual([]);
  });

  it.each(['hidden', 'aria-hidden="true"', 'style="display:none"'])(
    'checks the requested target ancestors (%s)',
    async (attribute) => {
      const { collectNavigationEvidence } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      document.body.innerHTML = `<main data-static-docs-body><p>Doc</p><section ${attribute}><h2 id="target">Target</h2></section></main>`;
      expect(collectNavigationEvidence('#target')).toMatchObject({
        anchors: ['target'],
        visibleAnchors: [],
      });
    },
  );

  it('keeps closed details targets hidden', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><details><summary id="summary">Read</summary><h2 id="target">Target</h2></details></main>';
    expect(collectNavigationEvidence('#target').visibleAnchors).toEqual([]);
    expect(collectNavigationEvidence('#summary').visibleAnchors).toEqual([
      'summary',
    ]);
  });

  it('does not enumerate unrelated links or IDs in a large document', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><h1 id="target">Doc</h1>' +
      '<a href="/other" id="unrelated">Other</a>'.repeat(2000) +
      '</main>';
    // happy-dom implements innerText with its own stylesheet scans; isolate
    // that browser primitive from the collector's explicit DOM enumeration.
    const readable = vi
      .spyOn(document.body, 'innerText', 'get')
      .mockReturnValue('Doc Other');
    const query = vi.spyOn(document, 'querySelectorAll');
    const styles = vi.spyOn(globalThis, 'getComputedStyle');
    try {
      const result = collectNavigationEvidence('#target');
      expect(result.anchors).toEqual(['target']);
      expect(result.visibleAnchors).toEqual(['target']);
      expect(result).not.toHaveProperty('links');
      expect(result).not.toHaveProperty('controls');
      expect(
        query.mock.calls.filter(
          ([selector]) => selector !== 'style,link[rel="stylesheet"]',
        ),
      ).toEqual([
        ['[id="target"], a[name="target"]'],
        [
          '[data-platform-header-tabs] [data-platform-tab][aria-selected="true"]',
        ],
        ['[data-platform-panel]'],
      ]);
      expect(readable).toHaveBeenCalledTimes(1);
      expect(styles.mock.calls.length).toBeLessThan(10);
    } finally {
      query.mockRestore();
      styles.mockRestore();
      readable.mockRestore();
    }
  });

  it.each([
    '<script>bootstrap()</script>',
    '<style>body {color:red}</style>',
    '<div data-testid="docs-content-skeleton">Loading</div>',
    '',
  ])('retains empty and skeleton docs-body rejection (%s)', async (html) => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML = `<main data-static-docs-body>${html}</main>`;
    expect(collectNavigationEvidence().hasDocsBody).toBe(false);
  });

  it('retains navigation identity, authentication and application error evidence', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML = '<h1>Sign in</h1><input type="password">';
    expect(collectNavigationEvidence()).toMatchObject({
      url: location.href,
      documentUrl: document.documentURI,
      timeOrigin: performance.timeOrigin,
      hasReadableBody: true,
      accessChallenge: true,
    });
    document.body.innerHTML =
      '<strong>Something went wrong!</strong><button>Show Error</button>';
    expect(browserNavigationFailure(collectNavigationEvidence())).toMatchObject(
      { status: 'broken', reason: 'browser-render-error' },
    );
    document.body.innerHTML =
      '<div id="main-frame-error"><div class="error-code">ERR_CONNECTION_RESET</div></div>';
    expect(browserNavigationFailure(collectNavigationEvidence())).toMatchObject(
      { status: 'unverified', reason: 'browser-network-error' },
    );
    expect(
      browserNavigationFailure({
        ...collectNavigationEvidence(),
        browserErrorPage: false,
        responseStatus: 403,
      }),
    ).toMatchObject({ status: 'unverified', reason: 'browser-http-403' });
  });
});

describe('navigation fragment protocols and duplicate targets', () => {
  it.each(['id="shared"', 'name="shared"'])(
    'uses a visible duplicate after a hidden first anchor (%s)',
    async (attribute) => {
      const { collectNavigationEvidence } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      document.body.innerHTML = `<main data-static-docs-body><p>Doc</p><div hidden><a ${attribute}>Hidden</a></div><a ${attribute}>Visible</a></main>`;
      expect(collectNavigationEvidence('#shared').visibleAnchors).toEqual([
        'shared',
      ]);
    },
  );

  it('requires real visible GitHub heading and both line-range endpoints', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    vi.stubGlobal(
      'location',
      new URL('https://github.com/org/repo/blob/main/file'),
    );
    try {
      document.body.innerHTML =
        '<h2 id="user-content-安装">Install</h2><span id="LC36">First</span><span id="LC40">Last</span>';
      expect(
        collectNavigationEvidence('#%E5%AE%89%E8%A3%85').visibleAnchors,
      ).toEqual(['安装']);
      expect(collectNavigationEvidence('#L36-L40').visibleAnchors).toEqual([
        'L36-L40',
      ]);
      expect(collectNavigationEvidence('#L36').visibleAnchors).toEqual(['L36']);
      expect(collectNavigationEvidence('#L36-L41').anchors).toEqual([]);
      expect(collectNavigationEvidence('#L40-L36').anchors).toEqual([]);
      const lastLine = document.getElementById('LC40');
      if (!lastLine) throw new Error('Expected final line anchor');
      lastLine.hidden = true;
      expect(collectNavigationEvidence('#L36-L40')).toMatchObject({
        anchors: ['L36-L40'],
        visibleAnchors: [],
      });
      vi.stubGlobal('location', new URL('https://example.com/org/repo'));
      expect(collectNavigationEvidence('#安装').anchors).toEqual([]);
      expect(collectNavigationEvidence('#L36').anchors).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps SPA routes unverified even if an identically named DOM ID exists', async () => {
    const { browserFragmentFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    expect(
      browserFragmentFailure('/guide', {
        anchors: ['/guide'],
        visibleAnchors: ['/guide'],
      }),
    ).toEqual({
      status: 'unverified',
      reason: 'spa-route-needs-content-verification',
    });
    expect(
      browserFragmentFailure('missing', { anchors: [], visibleAnchors: [] }),
    ).toEqual({
      status: 'unverified',
      reason: 'fragment-not-in-browser',
    });
  });
});

describe('OpenAPI legacy-anchor query rewrites', () => {
  const expected =
    'https://docs.example/api/join?from=%2Fzh-CN%2Fai&mode=one&mode=two#llm-max_history';
  const actual =
    'https://docs.example/api/join?from=%2Fzh-CN%2Fai&mode=one&mode=two&path=encoded-schema-path&s-highlight=max_history#request-body';
  const markup =
    '<main data-static-docs-body><p>Doc</p><div class="openapi-schema-field-row" id="field" data-openapi-schema-highlighted><code>max_history</code><span id="llm-max_history" aria-hidden="true"></span></div></main>';

  it('accepts only a visible original anchor inside its highlighted field while preserving business query', async () => {
    const { collectNavigationEvidence, matchesBrowserPage } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    vi.stubGlobal('location', new URL(actual));
    try {
      document.body.innerHTML = markup;
      const evidence = collectNavigationEvidence('#llm-max_history');
      expect(evidence.visibleAnchors).toContain('llm-max_history');
      expect(evidence.openApiLegacyTarget).toMatchObject({
        fragment: 'llm-max_history',
        fieldName: 'max_history',
        rowId: 'field',
      });
      expect(matchesBrowserPage(evidence, expected)).toBe(true);
      expect(
        matchesBrowserPage(evidence, expected, { requireHash: true }),
      ).toBe(true);
      for (const url of [
        actual.replace('mode=one', 'mode=changed'),
        actual.replace('&mode=two', ''),
        `${actual.split('#')[0]}&extra=1#request-body`,
        actual.replace('docs.example', 'other.example'),
        actual.replace('/api/join', '/api/other'),
        actual.replace('s-highlight=max_history', 's-highlight=other'),
        actual.replace('&path=encoded-schema-path', ''),
        actual.replace('&path=encoded-schema-path', '&path='),
        actual.replace('&path=encoded-schema-path', '&path=a&path=b'),
      ])
        expect(matchesBrowserPage({ ...evidence, url }, expected)).toBe(false);
      expect(
        matchesBrowserPage(
          evidence,
          expected.replace('#llm-max_history', '&path=old#llm-max_history'),
        ),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([
    markup.replace(' data-openapi-schema-highlighted', ''),
    markup.replace('<code>max_history', '<code>other'),
    markup.replace('id="field"', 'id="field" hidden'),
    markup.replace('id="llm-max_history"', 'id="llm-max_history" hidden'),
    markup.replace(
      'id="llm-max_history"',
      'id="llm-max_history" style="display:none"',
    ),
    `${markup.replace(
      '<span id="llm-max_history" aria-hidden="true"></span>',
      '',
    )}<span id="llm-max_history"></span>`,
  ])(
    'does not relax query identity without matching highlighted target evidence (%s)',
    async (html) => {
      const { collectNavigationEvidence, matchesBrowserPage } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      vi.stubGlobal('location', new URL(actual));
      try {
        document.body.innerHTML = html;
        const evidence = collectNavigationEvidence('#llm-max_history');
        expect(evidence.openApiLegacyTarget).toBeUndefined();
        expect(matchesBrowserPage(evidence, expected)).toBe(false);
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );
});

describe('GitHub line-number and code-cell aliases', () => {
  it.each([
    ['L36', 'L40'],
    ['L36', 'LC40'],
    ['LC36', 'L40'],
  ])('accepts real endpoint IDs %s and %s', async (start, end) => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    vi.stubGlobal(
      'location',
      new URL('https://github.com/org/repo/blob/main/file'),
    );
    try {
      document.body.innerHTML = `<span id="${start}">First</span><span id="${end}">Last</span>`;
      expect(collectNavigationEvidence('#L36').visibleAnchors).toEqual(['L36']);
      expect(collectNavigationEvidence('#L36-L40').visibleAnchors).toEqual([
        'L36-L40',
      ]);
      const endAnchor = document.getElementById(end);
      if (!endAnchor) throw new Error('Expected end anchor');
      endAnchor.hidden = true;
      expect(collectNavigationEvidence('#L36-L40')).toMatchObject({
        anchors: ['L36-L40'],
        visibleAnchors: [],
      });
      endAnchor.remove();
      expect(collectNavigationEvidence('#L36-L40').anchors).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('requested SDK platform evidence', () => {
  const expected =
    'https://docs.example/zh-CN/realtime-media/rtc/guide/ios#api-%E6%97%B6%E5%BA%8F%E5%9B%BE';
  const fragment = 'api-时序图';
  const panels =
    '<main data-static-docs-body><p>Doc</p><section data-platform-panel="android"><h2 id="api-时序图">Android API</h2></section><section data-platform-panel="ios" hidden><h2 id="api-时序图">iOS API</h2></section></main>';

  it('does not validate an iOS deep link using an Android-only visible duplicate', async () => {
    const { collectNavigationEvidence, browserFragmentFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML = panels;
    const evidence = collectNavigationEvidence(new URL(expected).hash);
    expect(evidence).toMatchObject({
      hasPlatformPanels: true,
      targetPlatforms: ['android'],
      sharedTarget: false,
    });
    expect(browserFragmentFailure(fragment, evidence, expected)).toEqual({
      status: 'unverified',
      reason: 'fragment-platform-mismatch',
    });
    const ios = document.querySelector<HTMLElement>(
      '[data-platform-panel="ios"]',
    );
    if (!ios) throw new Error('Expected iOS panel');
    ios.hidden = false;
    expect(
      browserFragmentFailure(
        fragment,
        collectNavigationEvidence(new URL(expected).hash),
        expected,
      ),
    ).toBeUndefined();
  });

  it('accepts visible shared-body targets even with hidden duplicate platform IDs', async () => {
    const { collectNavigationEvidence, browserFragmentFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML = `${panels}<h2 id="api-时序图">Shared API</h2>`;
    const evidence = collectNavigationEvidence(new URL(expected).hash);
    expect(evidence).toMatchObject({
      sharedTarget: true,
      targetPlatforms: ['android'],
    });
    expect(
      browserFragmentFailure(fragment, evidence, expected),
    ).toBeUndefined();
  });

  it('uses the closest visible platform and ignores hidden shared candidates', async () => {
    const { collectNavigationEvidence, browserFragmentFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><section data-platform-panel="ios"><section data-platform-panel="android"><a name="api-时序图">Android</a></section></section><h2 id="api-时序图" hidden>Shared hidden</h2></main>';
    const evidence = collectNavigationEvidence(new URL(expected).hash);
    expect(evidence).toMatchObject({
      targetPlatforms: ['android'],
      sharedTarget: false,
    });
    expect(browserFragmentFailure(fragment, evidence, expected)).toMatchObject({
      reason: 'fragment-platform-mismatch',
    });
  });

  it('does not constrain URLs without a registered platform suffix or pages without platform panels', async () => {
    const { collectNavigationEvidence, browserFragmentFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML = panels;
    const evidence = collectNavigationEvidence(new URL(expected).hash);
    expect(
      browserFragmentFailure(
        fragment,
        evidence,
        expected.replace('/ios#', '#'),
      ),
    ).toBeUndefined();
    expect(
      browserFragmentFailure(
        fragment,
        evidence,
        expected.replace('/ios#', '/release-notes#'),
      ),
    ).toBeUndefined();
    document.body.innerHTML =
      '<main data-static-docs-body><h2 id="api-时序图">API</h2></main>';
    const standalone = collectNavigationEvidence(new URL(expected).hash);
    expect(standalone).toMatchObject({
      hasPlatformPanels: false,
      targetPlatforms: [],
      sharedTarget: true,
    });
    expect(
      browserFragmentFailure(
        fragment,
        standalone,
        'https://docs.example/api-reference/fastboard/ios#api-时序图',
      ),
    ).toBeUndefined();
  });
});

it('checks a query-selected platform and lets an explicit path platform take precedence', async () => {
  const { browserFragmentFailure } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  const evidence = {
    anchors: ['target'],
    visibleAnchors: ['target'],
    hasPlatformPanels: true,
    targetPlatforms: ['android'],
    sharedTarget: false,
  };
  expect(
    browserFragmentFailure(
      'target',
      evidence,
      'https://docs.test/guide?platform=ios',
    ),
  ).toMatchObject({ reason: 'fragment-platform-mismatch' });
  expect(
    browserFragmentFailure(
      'target',
      evidence,
      'https://docs.test/guide/android?platform=ios',
    ),
  ).toBeUndefined();
  expect(
    browserFragmentFailure(
      'target',
      { ...evidence, targetPlatforms: ['ios'] },
      'https://docs.test/guide?platform=ios',
    ),
  ).toBeUndefined();
});

describe('GitHub visible code layer accessibility markup', () => {
  const fixture =
    '<div id="outer"><div class="react-code-file-contents" aria-hidden="true"><div><div><div id="LC2948" class="react-file-line">export declare type BroadcastState = {</div></div></div></div></div>';

  it('accepts a positive-size GitHub code cell in its accessibility-hidden visual layer', async () => {
    const { collectNavigationEvidence } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    vi.stubGlobal(
      'location',
      new URL(
        'https://github.com/Nero-Hu/Whiteboard-Docs/blob/commit/index-zh.d.ts#L2948',
      ),
    );
    document.body.innerHTML = fixture;
    const lineElement = document.getElementById('LC2948');
    if (!lineElement) throw new Error('Expected GitHub code line');
    const rect = vi
      .spyOn(lineElement, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 352, 284, 20));
    try {
      expect(collectNavigationEvidence('#L2948')).toMatchObject({
        anchors: ['L2948'],
        visibleAnchors: ['L2948'],
      });
    } finally {
      rect.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it.each([
    { change: 'layer hidden', layer: 'hidden' },
    { change: 'layer display none', layer: 'style="display:none"' },
    { change: 'layer visibility hidden', layer: 'style="visibility:hidden"' },
    {
      change: 'layer content visibility hidden',
      layer: 'style="content-visibility:hidden"',
    },
    { change: 'outer aria hidden', outer: 'aria-hidden="true"' },
    { change: 'line aria hidden', line: 'aria-hidden="true"' },
    { change: 'line hidden', line: 'hidden' },
    { change: 'non GitHub', host: 'example.com' },
    { change: 'zero width', width: 0 },
    { change: 'zero height', height: 0 },
    { change: 'wrong line class', className: 'other-line' },
    { change: 'line number instead of code cell', id: 'L2948' },
    { change: 'unrelated aria hidden container', layerClass: 'other-contents' },
  ])(
    'does not waive real hiding or missing code-cell evidence ($change)',
    async (options) => {
      const { collectNavigationEvidence } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      vi.stubGlobal(
        'location',
        new URL(`https://${options.host ?? 'github.com'}/org/repo`),
      );
      document.body.innerHTML = fixture
        .replace('id="outer"', `id="outer" ${options.outer ?? ''}`)
        .replace(
          'class="react-code-file-contents"',
          `class="${options.layerClass ?? 'react-code-file-contents'}" ${options.layer ?? ''}`,
        )
        .replace(
          'id="LC2948" class="react-file-line"',
          `id="${options.id ?? 'LC2948'}" class="${options.className ?? 'react-file-line'}" ${options.line ?? ''}`,
        );
      const id = options.id ?? 'LC2948';
      const lineElement = document.getElementById(id);
      if (!lineElement) throw new Error('Expected GitHub code line');
      const rect = vi
        .spyOn(lineElement, 'getBoundingClientRect')
        .mockReturnValue(
          new DOMRect(0, 352, options.width ?? 284, options.height ?? 20),
        );
      const hash = options.host ? '#LC2948' : '#L2948';
      try {
        expect(collectNavigationEvidence(hash)).toMatchObject({
          anchors: [hash.slice(1)],
          visibleAnchors: [],
        });
      } finally {
        rect.mockRestore();
        vi.unstubAllGlobals();
      }
    },
  );
});

describe('page platform evidence without fragments', () => {
  const index = {
    targets: { '/guide': { ios: '/guide/ios', android: '/guide/android' } },
    platforms: { '/guide/ios': 'ios', '/guide/android': 'android' },
  };
  it('rejects a wrong selected platform even when the page body exists', async () => {
    const { collectNavigationEvidence, browserPlatformFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><div data-platform-header-tabs><button data-platform-tab="android" aria-selected="true">Android</button><button data-platform-tab="ios" aria-selected="false">iOS</button></div><section data-platform-panel="android">Android</section><section data-platform-panel="ios" hidden>iOS</section></main>';
    expect(
      browserPlatformFailure(
        collectNavigationEvidence(''),
        'https://docs.test/guide?platform=ios',
        index,
      ),
    ).toMatchObject({ status: 'unverified', reason: 'page-platform-mismatch' });
  });
  it('accepts independently selected groups when the requested platform is visible in its own group', async () => {
    const { collectNavigationEvidence, browserPlatformFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><div data-platform-group><section data-platform-panel="ios">iOS</section><section data-platform-panel="android" hidden>Android</section></div><div data-platform-group><section data-platform-panel="web">Web</section><section data-platform-panel="windows" hidden>Windows</section></div></main>';
    expect(
      browserPlatformFailure(
        collectNavigationEvidence(''),
        'https://docs.test/guide/ios',
        index,
      ),
    ).toBeUndefined();
  });
  it('does not certify unknown or unsupported queries as selected platforms', async () => {
    const { collectNavigationEvidence, browserPlatformFailure } = await import(
      './lib/cn-link-audit/browser.mjs'
    );
    document.body.innerHTML =
      '<main data-static-docs-body><section data-platform-panel="android">Android</section></main>';
    for (const platform of ['unknown', 'web'])
      expect(
        browserPlatformFailure(
          collectNavigationEvidence(''),
          `https://docs.test/guide?platform=${platform}`,
          index,
        ),
      ).toMatchObject({
        status: 'unverified',
        reason: 'unsupported-platform-query',
      });
  });
});

it('opens the original query entry and checks the final canonical identity and platform', async () => {
  const { createPlatformQueryIndex } = await import(
    '../src/lib/platforms/query-route'
  );
  const { verifyBrowserTargets } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  const entry = 'https://docs.test/ai?platform=ios&mode=compact';
  const canonical = 'https://docs.test/ai/ios?mode=compact';
  const index = createPlatformQueryIndex([
    { canonicalPath: '/zh-CN/ai', url: '/zh-CN/ai/ios', platform: 'ios' },
  ]);
  const evidence = {
    url: canonical,
    documentUrl: canonical,
    responseStatus: 200,
    hasDocsBody: true,
    hasReadableBody: true,
    anchors: [],
    visibleAnchors: [],
    selectedPlatforms: ['ios'],
    platformGroups: [],
  };
  const driver = {
    run: vi.fn(),
    evaluate: vi.fn(),
    navigationSnapshot: vi.fn().mockResolvedValue(evidence),
    navigationSettle: vi.fn().mockResolvedValue(evidence),
    close: vi.fn(),
  };
  const options = {
    driver,
    origin: 'https://docs.test',
    platformIndex: index,
    expectedUrls: new Map([[entry, canonical]]),
    timeoutMs: 1,
  };
  expect(
    (await verifyBrowserTargets([entry], options)).get(entry),
  ).toMatchObject({ status: 'valid' });
  expect(driver.run).toHaveBeenCalledWith('open', entry);
  expect(driver.run).not.toHaveBeenCalledWith('open', canonical);
  driver.navigationSettle.mockResolvedValue({ ...evidence, url: entry });
  expect(
    (await verifyBrowserTargets([entry], options)).get(entry),
  ).toMatchObject({
    status: 'unverified',
    reason: 'browser-page-identity-or-body-missing',
  });
  driver.navigationSettle.mockResolvedValue({
    ...evidence,
    selectedPlatforms: ['android'],
  });
  driver.navigationSnapshot.mockResolvedValue({
    ...evidence,
    selectedPlatforms: ['android'],
  });
  expect(
    (await verifyBrowserTargets([entry], options)).get(entry),
  ).toMatchObject({ status: 'unverified', reason: 'page-platform-mismatch' });
});

it('ignores an entirely hidden platform group when proving the visible page selection', async () => {
  const { collectNavigationEvidence, browserPlatformFailure } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  document.body.innerHTML =
    '<main data-static-docs-body><div data-platform-group><section data-platform-panel="ios">iOS</section><section data-platform-panel="android" hidden>Android</section></div><div data-platform-group hidden><section data-platform-panel="ios">Collapsed iOS example</section></div></main>';
  const index = { targets: {}, platforms: { '/guide/ios': 'ios' } };
  expect(
    browserPlatformFailure(
      collectNavigationEvidence(''),
      'https://docs.test/guide/ios',
      index,
    ),
  ).toBeUndefined();
});

it('does not require a selected platform for SDK business filters outside the variant index', async () => {
  const { browserPlatformFailure } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  const index = {
    targets: { '/zh-CN/ai': { ios: '/zh-CN/ai/ios' } },
    platforms: { '/zh-CN/ai/ios': 'ios' },
  };
  for (const prefix of ['', '/zh-CN']) {
    expect(
      browserPlatformFailure(
        { selectedPlatforms: [], platformGroups: [] },
        `https://docs.test${prefix}/reference/sdks?product=video&platform=android`,
        index,
      ),
    ).toBeUndefined();
    expect(
      browserPlatformFailure(
        { selectedPlatforms: [], platformGroups: [] },
        `https://docs.test${prefix}/ai?platform=android`,
        index,
      ),
    ).toMatchObject({
      status: 'unverified',
      reason: 'unsupported-platform-query',
    });
  }
});

it('rejects a platform query redirect that drops its hash even when the original anchor remains visible', async () => {
  const { verifyBrowserTargets } = await import(
    './lib/cn-link-audit/browser.mjs'
  );
  const entry = 'https://docs.test/ai?platform=ios#heading';
  const canonical = 'https://docs.test/ai/ios#heading';
  const evidence = {
    url: canonical.split('#')[0],
    documentUrl: canonical,
    responseStatus: 200,
    hasDocsBody: true,
    hasReadableBody: true,
    anchors: ['heading'],
    visibleAnchors: ['heading'],
    selectedPlatforms: ['ios'],
    platformGroups: [],
  };
  const driver = {
    run: vi.fn(),
    evaluate: vi.fn(),
    navigationSnapshot: vi.fn().mockResolvedValue(evidence),
    navigationSettle: vi.fn().mockResolvedValue(evidence),
    close: vi.fn(),
  };
  const index = {
    targets: { '/zh-CN/ai': { ios: '/zh-CN/ai/ios' } },
    platforms: { '/zh-CN/ai/ios': 'ios' },
  };
  const results = await verifyBrowserTargets([entry], {
    driver,
    origin: 'https://docs.test',
    platformIndex: index,
    expectedUrls: new Map([[entry, canonical]]),
    timeoutMs: 1,
  });
  expect(results.get(entry)).toMatchObject({
    status: 'unverified',
    reason: 'browser-page-identity-or-body-missing',
  });
});
