import { describe, expect, it } from 'vitest';
import {
  formatCsv,
  formatMarkdown,
  summarizeReport,
  writeReport,
} from './lib/cn-link-audit/report.mjs';

describe('CN audit completeness gate', () => {
  it('never treats skipped or empty coverage as all links valid', () => {
    expect(
      summarizeReport([], [], { expectedPages: 0, checkedPages: 0 }).status,
    ).toBe('INCOMPLETE');
    expect(
      summarizeReport([{ status: 'valid' }, { status: 'unverified' }], [], {
        expectedPages: 2,
        checkedPages: 2,
      }).status,
    ).toBe('INCOMPLETE');
    expect(
      summarizeReport([{ status: 'valid' }], [], {
        expectedPages: 2,
        checkedPages: 1,
      }).status,
    ).toBe('INCOMPLETE');
  });
  it('reports confirmed failure separately from uncertainty and non HTTP links', () => {
    expect(
      summarizeReport([{ status: 'valid' }, { status: 'not-applicable' }], [], {
        expectedPages: 1,
        checkedPages: 1,
      }).status,
    ).toBe('PASS');
    const result = summarizeReport(
      [{ status: 'broken' }, { status: 'unverified' }],
      [{ reason: 'parse-error' }],
      { expectedPages: 1, checkedPages: 0 },
    );
    expect(result).toMatchObject({
      status: 'FAIL',
      broken: 1,
      unverified: 1,
      gaps: 1,
    });
  });
  it('keeps every affected occurrence and safely escapes Markdown and CSV', () => {
    const report = {
      mode: 'static',
      match: 'content',
      commit: 'abc',
      checkedAt: '2026-10-26',
      summary: { status: 'FAIL', broken: 2 },
      coverage: {},
      gaps: [],
      records: [
        {
          sourcePath: 'a.mdx',
          line: 3,
          href: '=bad,"value"',
          target: '/a|b',
          reason: 'missing-route',
          status: 'broken',
        },
        {
          sourcePath: 'b.mdx',
          line: 5,
          href: '/a|b',
          target: '/a|b',
          reason: 'missing-route',
          status: 'broken',
        },
      ],
    };
    expect(formatMarkdown(report)).toContain('- HTML 匹配：content');
    expect(formatMarkdown(report)).toContain('a.mdx:3');
    expect(formatMarkdown(report)).toContain('b.mdx:5');
    expect(formatCsv(report)).toContain("'=bad");
    expect(formatCsv(report).split('\n').length).toBe(4);
  });
});

// Integration fixtures keep source enumeration, rendering and HTTP evidence
// independent, so omissions cannot be hidden by deriving one from another.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach } from 'vitest';
import {
  buildForAudit,
  fingerprintArtifacts,
  fingerprintSources,
  runAudit,
} from './audit-cn-doc-links.mjs';
import { docsContentEvidence } from './lib/cn-link-audit/content-evidence.mjs';

const scratch: string[] = [];
afterEach(() => {
  for (const dir of scratch.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});
function fixture(href = '#heading', rendered = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cn-audit-integration-'));
  scratch.push(root);
  const link = {
    sourcePath: 'content/docs/zh-CN/ai/index.mdx',
    pageUrl: '/ai',
    href,
    kind: 'link',
    source: 'source',
    line: 3,
  };
  const page = {
    pageUrl: '/ai',
    filePath: 'dist/client/zh-CN/ai/index.html',
    digest: 'expected',
    anchors: new Set(['heading']),
    hasDocsBody: true,
    interactive: false,
  };
  return {
    repoRoot: root,
    output: 'report',
    requireProvenance: false,
    browser: false,
    inventory: {
      links: [link],
      documents: [{ pageUrl: '/ai', states: [] }],
      gaps: [],
      excluded: [],
      routes: new Map([['/ai', { sourcePath: link.sourcePath }]]),
      counts: { sourceFiles: 1 },
    },
    site: {
      pages: new Map([['/ai', page]]),
      routes: new Map([['/ai', {}]]),
      links: rendered ? [{ ...link, source: 'rendered' }] : [],
      gaps: [],
      docsRoots: new Set(['ai']),
      buildRoot: root,
    },
  };
}
const successfulProbe = async (urls: string[]) =>
  new Map(
    urls.map((url) => [
      url,
      {
        status: 'valid',
        reason: 'http-success',
        finalUrl: url,
        digest: 'expected',
        httpStatus: 200,
        hasDocsBody: true,
        checkedAt: 'now',
        contentType: 'text/html',
      },
    ]),
  );

describe('audit integration', () => {
  it.each(['static', 'built'])(
    'cannot certify complete reachability without network checks in %s mode',
    async (mode) => {
      const report = await runAudit({ ...fixture('/ai'), mode });
      expect(report.summary.status).toBe('INCOMPLETE');
      expect(report.coverage.networkTargets).toBe(0);
      expect(report.gaps).toContainEqual(
        expect.objectContaining({ reason: 'network-not-checked' }),
      );
    },
  );

  it.each([
    ['/assets/deleted.png', 'missing-local-resource'],
    ['/assets/%2e%2e%2fsecret.png', 'unsafe-local-path'],
  ])(
    'retains the deterministic build failure %s despite successful HTTP evidence',
    async (href, reason) => {
      const setup = fixture(href);
      setup.inventory.links[0].kind = 'resource';
      setup.site.links[0].kind = 'resource';
      const report = await runAudit({
        ...setup,
        mode: 'full',
        origin: 'https://preview.example',
        networkProbe: async (urls: string[]) => {
          const rows = await successfulProbe(urls);
          for (const [url, row] of rows)
            if (url.endsWith('.png'))
              Object.assign(row, {
                contentType: 'image/png',
                reason: 'reachable-resource',
                hasDocsBody: false,
              });
          return rows;
        },
      });
      expect(report.summary.status).toBe('FAIL');
      expect(report.records[0]).toMatchObject({
        status: 'broken',
        reason,
        httpStatus: 200,
        networkStatus: 'valid',
        networkReason: 'reachable-resource',
      });
    },
  );

  it.each([
    { body: '', reason: 'empty-local-resource' },
    {
      body: '<!doctype html><html><body>Fallback</body></html>',
      reason: 'html-in-local-resource',
    },
  ])(
    'retains $reason despite successful HTTP evidence',
    async ({ body, reason }) => {
      const setup = fixture('/assets/example.png');
      setup.inventory.links[0].kind = 'resource';
      setup.site.links[0].kind = 'resource';
      fs.mkdirSync(path.join(setup.site.buildRoot, 'assets'));
      fs.writeFileSync(path.join(setup.site.buildRoot, 'assets/example.png'), body);

      const report = await runAudit({
        ...setup,
        mode: 'full',
        origin: 'https://preview.example',
        networkProbe: async (urls: string[]) => {
          const rows = await successfulProbe(urls);
          for (const [url, row] of rows)
            if (url.endsWith('.png'))
              Object.assign(row, {
                contentType: 'image/png',
                reason: 'reachable-resource',
                hasDocsBody: false,
              });
          return rows;
        },
      });

      expect(report.summary.status).toBe('INCOMPLETE');
      const resources = report.records.filter((row) => row.resourceTarget);
      expect(resources).toHaveLength(2);
      for (const row of resources)
        expect(row).toMatchObject({
          status: 'unverified',
          reason,
          httpStatus: 200,
          networkStatus: 'valid',
          networkReason: 'reachable-resource',
        });
    },
  );

  it('retains a missing built resource even when HTTP evidence is unavailable', async () => {
    const setup = fixture('/assets/deleted.png');
    setup.inventory.links[0].kind = 'resource';
    setup.site.links[0].kind = 'resource';
    const report = await runAudit({
      ...setup,
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: async () => new Map(),
    });
    expect(report.summary.status).toBe('FAIL');
    expect(report.records[0]).toMatchObject({
      status: 'broken',
      reason: 'missing-local-resource',
      networkReason: 'network-evidence-missing',
    });
  });

  it('rejects 200 stale or SPA output even when URLs respond', async () => {
    const report = await runAudit({
      ...fixture(),
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: async (urls: string[]) => {
        const rows = await successfulProbe(urls);
        for (const row of rows.values()) row.digest = 'wrong';
        return rows;
      },
    });
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(
      report.records.every(
        (row) => row.reason === 'public-html-differs-from-build',
      ),
    ).toBe(true);
  });
  it('cannot pass with unobserved source links despite successful HTTP checks', async () => {
    const report = await runAudit({
      ...fixture('#heading', false),
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: successfulProbe,
    });
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.gaps).toContainEqual(
      expect.objectContaining({ reason: 'source-link-not-observed' }),
    );
  });
  it('passes a complete known source, built page and matching HTTP result', async () => {
    const report = await runAudit({
      ...fixture(),
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: successfulProbe,
    });
    expect(report.summary.status).toBe('PASS');
    expect(report.coverage.checkedPages).toBe(1);
  });
  it('reports malformed URLs without aborting the report or probing them', async () => {
    const report = await runAudit({
      ...fixture('http://[invalid'),
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: successfulProbe,
    });
    expect(report.summary.status).toBe('FAIL');
    expect(report.records[0].reason).toBe('malformed-url');
  });
});

it('does not accept HTML disguised as a PNG resource', async () => {
  const setup = fixture('/fake.png');
  fs.writeFileSync(path.join(setup.repoRoot, 'fake.png'), 'PNG');
  setup.inventory.links[0].kind = 'resource';
  setup.site.links[0].kind = 'resource';
  const report = await runAudit({
    ...setup,
    mode: 'full',
    origin: 'https://preview.example',
    networkProbe: async (urls: string[]) => {
      const rows = await successfulProbe(urls);
      for (const [url, row] of rows)
        if (url.endsWith('.png'))
          Object.assign(row, { contentType: 'image/png', detectedHtml: true });
      return rows;
    },
  });
  expect(report.summary.status).not.toBe('PASS');
  expect(report.records[0].reason).toBe('html-returned-for-resource');
});
it('reports malformed same-origin encoded paths rather than aborting', async () => {
  const report = await runAudit({
    ...fixture('https://preview.example/%zz'),
    mode: 'full',
    origin: 'https://preview.example',
    networkProbe: successfulProbe,
  });
  expect(report.records[0].reason).toBe('malformed-url');
});

it('accepts a real download anchor as a resource after checking HTTP evidence', async () => {
  const setup = fixture('/file.zip');
  fs.writeFileSync(path.join(setup.repoRoot, 'file.zip'), 'PK');
  const report = await runAudit({
    ...setup,
    mode: 'full',
    origin: 'https://preview.example',
    networkProbe: async (urls: string[]) => {
      const rows = await successfulProbe(urls);
      for (const [url, row] of rows)
        if (url.endsWith('.zip'))
          Object.assign(row, {
            contentType: 'application/zip',
            hasDocsBody: false,
            digest: undefined,
          });
      return rows;
    },
  });
  expect(report.summary.status).toBe('PASS');
});

it('binds build evidence to public assets, build scripts, and actual output bytes', () => {
  const { repoRoot } = fixture();
  fs.mkdirSync(path.join(repoRoot, 'public/assets'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'public/assets/image.png'), 'first');
  const before = fingerprintSources(repoRoot);
  fs.writeFileSync(path.join(repoRoot, 'public/assets/image.png'), 'second');
  expect(fingerprintSources(repoRoot)).not.toBe(before);
  const afterImage = fingerprintSources(repoRoot);
  fs.writeFileSync(path.join(repoRoot, 'scripts/build.mjs'), 'changed');
  expect(fingerprintSources(repoRoot)).not.toBe(afterImage);
  fs.mkdirSync(path.join(repoRoot, 'public/__static'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'dist/client'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'public/__static/docs-routes.json'),
    '[]',
  );
  fs.writeFileSync(path.join(repoRoot, 'dist/client/index.html'), 'first');
  const outputBefore = fingerprintArtifacts(repoRoot);
  fs.writeFileSync(path.join(repoRoot, 'dist/client/index.html'), 'second');
  expect(fingerprintArtifacts(repoRoot)).not.toBe(outputBefore);
});
it('refuses to certify a custom output directory using the standard build', async () => {
  await expect(buildForAudit(fixture().repoRoot, 'dist/old')).rejects.toThrow(
    'only supports',
  );
});

it('reconciles platform-route output with its canonical source page', async () => {
  const setup = fixture('/ai');
  setup.site.links[0].pageUrl = '/ai/ios';
  setup.site.routes.set('/ai/ios', {
    canonicalPath: '/zh-CN/ai',
    platform: 'ios',
  });
  const report = await runAudit({ ...setup, mode: 'built' });
  expect(
    report.gaps.filter((gap) => gap.reason === 'source-link-not-observed'),
  ).toEqual([]);
});

it('verifies a declared redirect against its expected destination HTML', async () => {
  const oldPath =
    '/realtime-media/rtsa/build/implement-core-features/string-uid';
  const target =
    '/realtime-media/rtsa/build/media-and-signaling-transmission/string-uid';
  const setup = fixture(oldPath);
  setup.site.routes.set(target, { canonicalPath: `/zh-CN${target}` });
  setup.site.pages.set(target, {
    ...(setup.site.pages.get('/ai') ?? {
      pageUrl: '/ai',
      filePath: '',
      digest: 'expected',
      anchors: new Set<string>(),
      hasDocsBody: true,
      interactive: false,
    }),
    pageUrl: target,
  });
  const report = await runAudit({
    ...setup,
    mode: 'full',
    origin: 'https://preview.example',
    networkProbe: async (urls: string[]) => {
      const rows = await successfulProbe(urls);
      const redirect = rows.get(`https://preview.example${oldPath}`);
      if (redirect) redirect.finalUrl = `https://preview.example${target}`;
      return rows;
    },
  });
  expect(report.summary.status).toBe('PASS');
});

it('writes every record across streaming report chunk boundaries', () => {
  const { repoRoot } = fixture();
  const records = Array.from({ length: 2001 }, (_, index) => ({
    status: 'valid',
    href: `/page-${index}`,
    sourcePath: 'a.mdx',
  }));
  writeReport(
    {
      mode: 'static',
      commit: 'test',
      checkedAt: 'now',
      coverage: {},
      summary: { status: 'INCOMPLETE' },
      gaps: [],
      records,
    },
    repoRoot,
  );
  const saved = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'report.json'), 'utf8'),
  );
  expect(saved.records).toEqual(records);
  expect(
    fs
      .readFileSync(path.join(repoRoot, 'links.csv'), 'utf8')
      .trim()
      .split('\n'),
  ).toHaveLength(2002);
});

describe('explicit deployment matching policy', () => {
  const html = (
    origin: string,
    bundle: string,
    content = '<p id="heading"><a href="/ai">正文</a></p>',
    heading = '文档',
  ) =>
    `<html><head><title>文档 | Docs</title><link rel="canonical" href="${origin}/ai"><script src="/assets/${bundle}.js"></script></head><body><article><h1>${heading}</h1><div data-static-docs-body>${content}</div></article></body></html>`;
  async function audit(
    remoteHtml: string,
    options: Record<string, unknown> = {},
    finalUrl?: string,
  ) {
    const setup = fixture('/ai');
    const local = html('https://local.example', 'local');
    const localPage = setup.site.pages.get('/ai');
    if (!localPage) throw new Error('Missing fixture page');
    Object.assign(localPage, docsContentEvidence(local), {
      digest: createHash('sha256').update(local).digest('hex'),
    });
    return runAudit({
      ...setup,
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: async (urls: string[]) =>
        new Map(
          urls.map((url) => [
            url,
            {
              status: 'valid',
              reason: 'reachable-html',
              httpStatus: 200,
              finalUrl: finalUrl ?? url,
              checkedAt: 'now',
              contentType: 'text/html',
              digest: createHash('sha256').update(remoteHtml).digest('hex'),
              ...docsContentEvidence(remoteHtml),
            },
          ]),
        ),
      ...options,
    });
  }

  it('accepts only content identity when explicitly selected and keeps artifact mismatch visible', async () => {
    const report = await audit(html('https://preview.example', 'remote'), {
      match: 'content',
    });
    expect(report.match).toBe('content');
    expect(report.summary.status).toBe('PASS');
    expect(report.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'page',
          artifactMatches: false,
          contentMatches: true,
          reason: 'public-content-matches-build',
          status: 'valid',
        }),
      ]),
    );
  });

  it('defaults to exact artifact matching even when document content is identical', async () => {
    const report = await audit(html('https://preview.example', 'remote'));
    expect(report.match).toBe('artifact');
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.records[0]).toMatchObject({
      artifactMatches: false,
      contentMatches: true,
      reason: 'public-html-differs-from-build',
    });
  });

  it.each([
    '<p id="heading"><a href="/ai">不同正文</a></p>',
    '<p id="heading"><a href="/other">正文</a></p>',
    '<p id="changed"><a href="/ai">正文</a></p>',
    '',
  ])(
    'refuses changed or empty document content in content mode (%s)',
    async (content) => {
      const report = await audit(
        html('https://preview.example', 'remote', content),
        { match: 'content' },
      );
      expect(report.summary.status).toBe('INCOMPLETE');
      expect(report.records[0]).toMatchObject({
        contentMatches: false,
        status: 'unverified',
      });
    },
  );

  it('refuses a changed article heading', async () => {
    const report = await audit(
      html('https://preview.example', 'remote', undefined, '其他文档'),
      { match: 'content' },
    );
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.records[0].contentMatches).toBe(false);
  });

  it.each(['https://preview.example/other', 'https://another.example/ai'])(
    'refuses matching content returned at an unexpected destination (%s)',
    async (finalUrl) => {
      const report = await audit(
        html('https://preview.example', 'remote'),
        { match: 'content' },
        finalUrl,
      );
      expect(report.summary.status).toBe('INCOMPLETE');
      expect(report.records[0]).toMatchObject({
        contentMatches: true,
        pathMatches: false,
        reason: 'unexpected-redirect-target',
      });
    },
  );

  it('refuses a different canonical route even with identical body and heading', async () => {
    const remote = html('https://preview.example', 'remote').replace(
      'href="https://preview.example/ai"',
      'href="https://preview.example/other"',
    );
    const report = await audit(remote, { match: 'content' });
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.records[0].contentMatches).toBe(false);
  });

  it('retains missing build provenance in content mode', async () => {
    const report = await audit(html('https://preview.example', 'remote'), {
      match: 'content',
      requireProvenance: true,
    });
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.gaps).toContainEqual(
      expect.objectContaining({ reason: 'build-provenance-missing' }),
    );
  });

  it('rejects unsupported policies', async () => {
    await expect(
      audit(html('https://preview.example', 'remote'), { match: 'anything' }),
    ).rejects.toThrow('match must be artifact or content');
  });
});

describe('source platform route context', () => {
  function platformFixture(
    platform: string | string[] = 'android',
    href = '#heading',
  ) {
    const setup = fixture(href);
    const source = {
      ...setup.inventory.links[0],
      pageUrl: '/guide',
      sourcePath: 'content/docs/zh-CN/guide.mdx',
      platform,
    };
    const basePage = setup.site.pages.get('/ai');
    if (!basePage) throw new Error('Missing fixture page');
    const routes = new Map<
      string,
      { canonicalPath: string; platform?: string; defaultPlatform?: string }
    >([
      ['/guide', { canonicalPath: '/zh-CN/guide', defaultPlatform: 'ios' }],
      ['/guide/ios', { canonicalPath: '/zh-CN/guide', platform: 'ios' }],
      [
        '/guide/android',
        { canonicalPath: '/zh-CN/guide', platform: 'android' },
      ],
      ['/guide/csharp', { canonicalPath: '/zh-CN/guide', platform: 'csharp' }],
    ]);
    return {
      ...setup,
      inventory: {
        ...setup.inventory,
        links: [source],
        documents: [],
        routes: new Map([['/guide', { sourcePath: source.sourcePath }]]),
      },
      site: {
        ...setup.site,
        routes,
        pages: new Map(
          [...routes.keys()].map((pageUrl) => [
            pageUrl,
            { ...basePage, pageUrl },
          ]),
        ),
        docsRoots: new Set(['guide']),
        links: ['android', 'ios', 'csharp'].map((platformContext) => ({
          ...source,
          source: 'rendered',
          pageUrl: `/guide/${platformContext}`,
          platformContext,
        })),
      },
    };
  }

  it('resolves Android source hashes from the published Android route rather than the default iOS page', async () => {
    const setup = platformFixture();
    const report = await runAudit({ ...setup, mode: 'built' });
    expect(report.records[0]).toMatchObject({
      sourcePageUrl: '/guide',
      pageUrl: '/guide/android',
      href: '#heading',
      target: '/guide/android#heading',
      platformContext: 'android',
      platformContextStatus: 'published-route',
      sourcePath: 'content/docs/zh-CN/guide.mdx',
      line: 3,
      observedInRenderedContent: true,
    });
    expect(report.coverage).toMatchObject({
      physicalSourceLinks: 1,
      sourceContextLinks: 1,
      sourceLinks: 1,
      sourceLinksObserved: 1,
    });
    expect(setup.inventory.links[0].pageUrl).toBe('/guide');
  });

  it('normalizes a known platform alias without changing explicit target URLs', async () => {
    const report = await runAudit({
      ...platformFixture('cscript', 'https://example.com/guide/ios#heading'),
      mode: 'built',
    });
    expect(report.records[0]).toMatchObject({
      pageUrl: '/guide/csharp',
      platform: 'cscript',
      platformContext: 'csharp',
      href: 'https://example.com/guide/ios#heading',
      target: 'https://example.com/guide/ios#heading',
    });
  });

  it('preserves separate source contexts and counts them against the observed denominator', async () => {
    const report = await runAudit({
      ...platformFixture(['android', 'ios']),
      mode: 'built',
    });
    const sources = report.records.filter((row) => row.source === 'source');
    expect(sources.map((row) => row.target)).toEqual([
      '/guide/android#heading',
      '/guide/ios#heading',
    ]);
    expect(report.coverage).toMatchObject({
      physicalSourceLinks: 1,
      sourceContextLinks: 2,
      sourceLinks: 2,
      sourceLinksObserved: 2,
    });
  });

  it('does not certify source context from another platform merely because an explicit target matches', async () => {
    const setup = platformFixture('android', 'https://example.com/docs');
    setup.site.links = setup.site.links.filter(
      (link) => link.platformContext === 'ios',
    );
    const report = await runAudit({ ...setup, mode: 'built' });
    expect(report.records[0].observedInRenderedContent).toBe(false);
    expect(report.coverage.sourceLinksObserved).toBe(0);
    expect(report.gaps).toContainEqual(
      expect.objectContaining({
        reason: 'source-link-not-observed',
        pageUrl: '/guide/android',
      }),
    );
  });

  it('does not use hidden browser links as proof of the source platform state', async () => {
    const setup = platformFixture('android', 'https://example.com/docs');
    setup.site.links = setup.site.links.filter(
      (link) => link.platformContext === 'android',
    );
    Object.assign(setup.site.links[0], {
      visible: false,
      sourcePath: 'browser:https://preview.example/guide/android',
    });
    const report = await runAudit({ ...setup, mode: 'built' });
    expect(report.records[0].observedInRenderedContent).toBe(false);
    expect(report.coverage.sourceLinksObserved).toBe(0);
  });

  it('preserves a source occurrence with an empty platform declaration as unresolved', async () => {
    const report = await runAudit({ ...platformFixture([]), mode: 'built' });
    expect(
      report.records.filter((row) => row.source === 'source'),
    ).toHaveLength(1);
    expect(report.records[0]).toMatchObject({
      pageUrl: '/guide',
      platformContext: 'unknown',
      status: 'unverified',
    });
    expect(report.coverage).toMatchObject({
      physicalSourceLinks: 1,
      sourceContextLinks: 1,
    });
  });

  it('keeps query-relative and root-absolute targets distinct after binding', async () => {
    const relative = await runAudit({
      ...platformFixture('android', '?mode=compact#heading'),
      mode: 'built',
    });
    expect(relative.records[0]).toMatchObject({
      pageUrl: '/guide/android',
      href: '?mode=compact#heading',
      target: '/guide/android?mode=compact#heading',
    });
    const absolute = await runAudit({
      ...platformFixture('android', '/guide/ios#heading'),
      mode: 'built',
    });
    expect(absolute.records[0]).toMatchObject({
      pageUrl: '/guide/android',
      href: '/guide/ios#heading',
      target: '/guide/ios#heading',
    });
  });

  it('does not call an unknown-platform local fragment broken based on the default page', async () => {
    const report = await runAudit({
      ...platformFixture('unknown', '#not-in-default-page'),
      mode: 'built',
    });
    expect(report.records[0]).toMatchObject({
      status: 'unverified',
      reason: 'source-platform-context-unresolved',
      href: '#not-in-default-page',
    });
  });

  it('retains unknown platform contexts as unverified even after successful HTTP evidence', async () => {
    const setup = platformFixture('unknown', '/guide/ios');
    const report = await runAudit({
      ...setup,
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: successfulProbe,
    });
    expect(report.records[0]).toMatchObject({
      sourcePageUrl: '/guide',
      pageUrl: '/guide',
      platformContext: 'unknown',
      platformContextStatus: 'unpublished-platform',
      href: '/guide/ios',
      status: 'unverified',
      reason: 'source-platform-context-unresolved',
    });
    expect(report.gaps).toContainEqual(
      expect.objectContaining({
        reason: 'source-platform-context-unresolved',
        platformContext: 'unknown',
      }),
    );
    expect(setup.site.routes.has('/guide/unknown')).toBe(false);
    expect(report.summary.status).toBe('INCOMPLETE');
  });

  it('does not choose between multiple manifest routes for the same platform', async () => {
    const setup = platformFixture();
    setup.site.routes.set('/guide/android-alias', {
      canonicalPath: '/zh-CN/guide',
      platform: 'android',
    });
    const report = await runAudit({ ...setup, mode: 'built' });
    expect(report.records[0]).toMatchObject({
      pageUrl: '/guide',
      platformContextStatus: 'ambiguous-platform-route',
      status: 'unverified',
    });
  });

  it('keeps source context unverified in static mode without inventing platform paths', async () => {
    const report = await runAudit({ ...platformFixture(), mode: 'static' });
    expect(report.records[0]).toMatchObject({
      sourcePageUrl: '/guide',
      pageUrl: '/guide',
      platformContextStatus: 'not-checked',
      status: 'unverified',
    });
    expect(report.coverage).toMatchObject({
      physicalSourceLinks: 1,
      sourceContextLinks: 1,
      sourceLinksObserved: 0,
    });
  });
});

it.each(['all', 'fragment'])(
  'never passes when network evidence is missing (%s)',
  async (missing) => {
    const report = await runAudit({
      ...fixture(),
      mode: 'full',
      origin: 'https://preview.example',
      networkProbe: async (urls: string[]) => {
        const evidence = await successfulProbe(urls);
        for (const url of urls)
          if (missing === 'all' || new URL(url).hash) evidence.delete(url);
        return evidence;
      },
    });
    expect(report.summary.status).toBe('INCOMPLETE');
    expect(report.records[0]).toMatchObject({
      target: '/ai#heading',
      status: 'unverified',
      reason: 'network-evidence-missing',
    });
    expect(report.coverage.checkedPages).toBe(missing === 'all' ? 0 : 1);
  },
);
