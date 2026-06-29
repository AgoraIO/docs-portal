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
    const ids = new Set<string>();
    const matchKeys = new Map<string, string>();

    for (const rule of legacySitemapRedirectConfig.rules) {
      expect(ids.has(rule.id)).toBe(false);
      ids.add(rule.id);

      const matchKey = JSON.stringify(rule.match);
      const existingTarget = matchKeys.get(matchKey);

      expect(existingTarget && existingTarget !== rule.target).toBeFalsy();
      matchKeys.set(matchKey, rule.target);
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
      reviewReport.summary.exactPage +
        reviewReport.summary.semanticPageMatch +
        reviewReport.summary.productFallback,
    );
    expect(
      redirectedUrls.every((url) => resolveLegacySitemapRedirectPath(url.path)),
    ).toBe(true);
  });

  it('uses every executable redirect rule from redirects.json', () => {
    const usedRuleIds = new Set(
      sitemapUrls
        .map((url) => resolveLegacySitemapRedirectPath(url.path)?.id)
        .filter(Boolean),
    );
    const unusedRuleIds = legacySitemapRedirectConfig.rules
      .map((rule) => rule.id)
      .filter((id) => !usedRuleIds.has(id));

    expect(unusedRuleIds).toEqual([]);
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

  it('keeps the human review report aligned with the audit summary', () => {
    expect(reviewReport.summary).toEqual({
      broken: 0,
      exactPage: 0,
      native: 0,
      productFallback: sitemapUrls.length,
      semanticPageMatch: 0,
      totalLegacyUrls: sitemapUrls.length,
    });
    expect(reviewReport.items).toHaveLength(sitemapUrls.length);

    const reportUrls = new Set(
      reviewReport.items.map((item) => item.legacyUrl),
    );

    expect(reportUrls.size).toBe(sitemapUrls.length);
    expect(sitemapUrls.every((url) => reportUrls.has(url.href))).toBe(true);
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
