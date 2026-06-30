import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  legacySitemapRedirectConfig,
  resolveLegacySitemapRedirectPath,
} from './redirects';
import reviewReport from './review-report.json';

type LegacySitemapUrl = {
  href: string;
  path: string;
  search: string;
};

describe('legacy sitemap compatibility audit', () => {
  const sitemapUrls = readLegacySitemapUrls();

  it('keeps traceable metadata for the persisted sitemap snapshot', () => {
    expect(legacySitemapRedirectConfig.sourceSitemapUrl).toBe(
      'https://docs.agora.io/sitemap.xml',
    );
    expect(legacySitemapRedirectConfig.snapshotPath).toBe(
      'src/lib/legacy-sitemap/sitemap.xml',
    );
    expect(legacySitemapRedirectConfig.snapshotDownloadedAt).toBe('2026-06-29');
    expect(sitemapUrls).toHaveLength(3116);
  });

  it('has no duplicate or conflicting redirect rules', () => {
    const legacyUrls = new Set<string>();
    const pathTargets = new Map<string, string>();

    for (const rule of legacySitemapRedirectConfig.rules) {
      expect(legacyUrls.has(rule.legacyUrl)).toBe(false);
      legacyUrls.add(rule.legacyUrl);

      const existingTarget = pathTargets.get(rule.legacyPath);

      expect(existingTarget && existingTarget !== rule.target).toBeFalsy();
      pathTargets.set(rule.legacyPath, rule.target);
    }
  });

  it('classifies every legacy sitemap URL with zero broken URLs', () => {
    const docsPaths = getDocsContentUrls();
    const broken = sitemapUrls.filter((url) => {
      if (docsPaths.has(url.path)) {
        return false;
      }

      return !resolveLegacySitemapRedirectPath(url.path);
    });

    expect(broken).toEqual([]);
  });

  it('stores only non-native redirect rules in redirects.json', () => {
    const docsPaths = getDocsContentUrls();
    const nativeUrls = sitemapUrls.filter((url) => docsPaths.has(url.path));
    const redirectedUrls = sitemapUrls.filter(
      (url) => !docsPaths.has(url.path),
    );

    expect(nativeUrls).toHaveLength(reviewReport.summary.native);
    expect(redirectedUrls).toHaveLength(
      reviewReport.summary.exactPath +
        reviewReport.summary.exactSlug +
        reviewReport.summary.renamedPage +
        reviewReport.summary.semanticPageMatch +
        reviewReport.summary.productFallback +
        reviewReport.summary.unavailable,
    );
    expect(
      redirectedUrls.every((url) => resolveLegacySitemapRedirectPath(url.path)),
    ).toBe(true);
  });

  it('has a redirect record for every non-native sitemap URL', () => {
    const docsPaths = getDocsContentUrls();
    const redirectLegacyUrls = new Set(
      legacySitemapRedirectConfig.rules.map((rule) => rule.legacyUrl),
    );
    const missingRedirects = sitemapUrls
      .filter((url) => !docsPaths.has(url.path))
      .filter((url) => !redirectLegacyUrls.has(url.href));

    expect(missingRedirects).toEqual([]);
  });

  it('does not keep stale redirect records outside the sitemap snapshot', () => {
    const sitemapHrefs = new Set(sitemapUrls.map((url) => url.href));
    const staleRules = legacySitemapRedirectConfig.rules.filter(
      (rule) => !sitemapHrefs.has(rule.legacyUrl),
    );

    expect(staleRules).toEqual([]);
  });

  it('targets existing new docs portal pages', () => {
    const docsPaths = getDocsContentUrls();
    const missingTargets = legacySitemapRedirectConfig.rules
      .map((rule) => rule.target)
      .filter((target) => !docsPaths.has(target));

    expect(missingTargets).toEqual([]);
  });

  it('preserves query strings for rules that opt into preserveSearch', () => {
    const queryUrl = sitemapUrls.find((url) => url.search);

    expect(queryUrl).toBeDefined();

    const rule = queryUrl
      ? resolveLegacySitemapRedirectPath(queryUrl.path)
      : undefined;

    expect(rule?.preserveSearch).toBe(true);
  });

  it('maps manually reviewed legacy sitemap URLs to precise replacement pages', () => {
    const preciseTargets = {
      '/en/agora-chat/restful-api/user-system-registration':
        '/en/api-reference/api-ref/im/user-system-registration',
      '/en/broadcast-streaming/overview/release-notes':
        '/en/realtime-media/broadcast-streaming/reference/release-notes',
      '/en/conversational-ai/models/asr/amazon': '/en/ai/models/asr/deepgram',
      '/en/conversational-ai/overview/pricing': '/en/ai/reference/pricing',
    };

    for (const [legacyPath, target] of Object.entries(preciseTargets)) {
      expect(resolveLegacySitemapRedirectPath(legacyPath)).toMatchObject({
        confidence: 'high',
        target,
      });
    }
  });

  it('keeps the human review report aligned with the audit summary', () => {
    expect(reviewReport.summary).toEqual({
      broken: 0,
      exactPath: 490,
      exactSlug: 1942,
      native: 0,
      productFallback: 0,
      renamedPage: 39,
      semanticPageMatch: 645,
      totalLegacyUrls: sitemapUrls.length,
      unavailable: 0,
    });
    const reportUrls = new Set(
      reviewReport.items.map((item) => item.legacyUrl),
    );
    const fallbackOrUnavailableUrls = legacySitemapRedirectConfig.rules
      .filter(
        (rule) =>
          rule.type === 'product-fallback' ||
          rule.type === 'unavailable' ||
          rule.confidence !== 'high',
      )
      .map((rule) => rule.legacyUrl);

    expect(reviewReport.items).toHaveLength(fallbackOrUnavailableUrls.length);
    expect(reportUrls.size).toBe(fallbackOrUnavailableUrls.length);
    expect(
      fallbackOrUnavailableUrls.every((legacyUrl) => reportUrls.has(legacyUrl)),
    ).toBe(true);
    expect(
      reviewReport.items.every(
        (item) => item.appliedRuleType === 'product-fallback',
      ),
    ).toBe(true);
  });
});

function readLegacySitemapUrls(): LegacySitemapUrl[] {
  const sitemapPath = join(process.cwd(), 'src/lib/legacy-sitemap/sitemap.xml');
  const xml = readFileSync(sitemapPath, 'utf8');

  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
    const url = new URL(match[1]);

    return {
      href: match[1],
      path: url.pathname,
      search: url.search,
    };
  });
}

function getDocsContentUrls() {
  const docsRoot = join(process.cwd(), 'content/docs');
  const urls = new Set<string>();
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const fullPath = `${directory}/${entry}`;
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (!/\.(md|mdx)$/.test(entry)) {
        continue;
      }

      const contentPath = fullPath
        .slice(docsRoot.length + 1)
        .replace(/\.(md|mdx)$/, '')
        .replace(/\/index$/, '');

      urls.add(`/${contentPath}`);
    }
  };

  visit(docsRoot);

  return urls;
}
