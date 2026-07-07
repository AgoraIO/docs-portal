import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  applyLegacyHiddenColumnToPathMap,
  createLegacyRenderedVisibilityMatcher,
  createVisibleRouteMatcher,
  hidePagesInMeta,
  normalizeLegacyRoute,
  resolveLegacySourceRenderedRoutes,
  resolveTargetMetaEntry,
} from './sync-legacy-sidebar-hidden-pages.mjs';

describe('sync legacy sidebar hidden pages', () => {
  it('normalizes legacy docs and API reference URLs', () => {
    expect(normalizeLegacyRoute('/doc/rtc/javascript/overview.html')).toBe(
      'rtc/javascript/overview',
    );
    expect(normalizeLegacyRoute('/api-ref/rtc/android/API/foo.html#bar')).toBe(
      'rtc/android/API/foo',
    );
    expect(normalizeLegacyRoute('https://docs.example.com/doc/rtc/foo.html')).toBe(
      '',
    );
  });

  it('treats the legacy platform template as an optional route segment', () => {
    const isVisible = createVisibleRouteMatcher(
      new Set(['aigc/{{platform}}/landing-page']),
    );

    expect(isVisible('/doc/aigc/landing-page.html')).toBe(true);
    expect(isVisible('/doc/aigc/android/landing-page.html')).toBe(true);
    expect(isVisible('/doc/aigc/android/other.html')).toBe(false);
  });

  it('adds bang-prefixed hidden entries without removing the page record', () => {
    const { changed, nextRaw } = hidePagesInMeta(
      `${JSON.stringify({ title: 'API', pages: ['overview', 'hidden'] }, null, 2)}\n`,
      ['hidden'],
    );

    expect(changed).toBe(true);
    expect(JSON.parse(nextRaw).pages).toEqual(['overview', '!hidden']);
  });

  it('adds a legacy hidden column to migration rows', () => {
    const raw = [
      'source_path,target_path,old_url,redirect_status',
      'docs/a.mdx,content/docs/zh-CN/ai/a.mdx,/doc/ai/a.html,redirect',
      'docs/b.mdx,content/docs/zh-CN/ai/b.mdx,/doc/ai/b.html,redirect',
      '',
    ].join('\n');
    const result = applyLegacyHiddenColumnToPathMap({
      isVisibleLegacyRoute: (url: string) => url.includes('/b.html'),
      raw,
    });

    expect(result.columnAdded).toBe(true);
    expect(result.hiddenRows).toBe(1);
    expect(result.changedRows).toBe(1);
    expect(result.nextRaw.split('\n').slice(0, 3)).toEqual([
      'source_path,target_path,old_url,redirect_status,旧文档已隐藏',
      'docs/a.mdx,content/docs/zh-CN/ai/a.mdx,/doc/ai/a.html,redirect,是',
      'docs/b.mdx,content/docs/zh-CN/ai/b.mdx,/doc/ai/b.html,redirect,',
    ]);
  });

  it('resolves a target document to its owner meta file and page key', () => {
    expect(
      resolveTargetMetaEntry(
        '/repo/content/docs/zh-CN/api-reference/rtc/response.go.mdx',
        '/repo/content/docs/zh-CN',
      ),
    ).toEqual({
      metaPath: '/repo/content/docs/zh-CN/api-reference/rtc/meta.json',
      page: 'response.go',
    });
  });

  it('uses legacy rendering routes rather than treating platform as optional', () => {
    const legacyRoot = mkdtempSync(join(tmpdir(), 'legacy-rendered-'));
    const productRoot = join(legacyRoot, 'docs', 'aigc');
    const require = createRequire(import.meta.url);

    mkdirSync(productRoot, { recursive: true });
    writeFileSync(
      join(productRoot, '_platforms_.meta.js'),
      "module.exports = [{ value: 'android' }, { value: 'ios' }];\n",
    );

    try {
      expect(
        resolveLegacySourceRenderedRoutes({
          legacyRoot,
          require,
          sourcePath: 'docs/aigc/landing-page.mdx',
        }).map((route) => route.route),
      ).toEqual(['aigc/android/landing-page', 'aigc/ios/landing-page']);

      const hiddenMatcher = createLegacyRenderedVisibilityMatcher({
        legacyRoot,
        require,
        routes: new Set(['convoai/restful/landing-page']),
      });
      expect(
        hiddenMatcher({
          old_url: '/doc/aigc/landing-page.html',
          source_path: 'docs/aigc/landing-page.mdx',
        }),
      ).toBe(false);

      const visibleMatcher = createLegacyRenderedVisibilityMatcher({
        legacyRoot,
        require,
        routes: new Set(['aigc/android/landing-page']),
      });
      expect(
        visibleMatcher({
          old_url: '/doc/aigc/landing-page.html',
          source_path: 'docs/aigc/landing-page.mdx',
        }),
      ).toBe(true);
    } finally {
      rmSync(legacyRoot, { recursive: true, force: true });
    }
  });
});
