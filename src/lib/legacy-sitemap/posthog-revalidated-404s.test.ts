import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import posthogRules from './posthog-revalidated-404s.json';
import redirectsConfig from './redirects.json';
import staticRedirects from './static-redirects.json';

type Inventory = {
  routes: Array<{ routePath: string }>;
};

const inventory = JSON.parse(
  readFileSync('src/lib/legacy-sitemap/new-docs-inventory.json', 'utf8'),
) as Inventory;
const existingTargetPaths = new Set(
  redirectsConfig.rules
    .map((rule) => rule.target)
    .filter((target) => target.startsWith('/')),
);

function normalizePath(pathname: string) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  try {
    return decodeURI(path).replace(/\/+$/, '').replace(/_/g, '-').toLowerCase();
  } catch {
    return path.replace(/\/+$/, '').replace(/_/g, '-').toLowerCase();
  }
}

function contentPathExists(routePath: string) {
  const withoutLocale = routePath.replace(/^\/en\//, '');
  const candidates = [
    `content/docs/en/${withoutLocale}.md`,
    `content/docs/en/${withoutLocale}.mdx`,
    `content/docs/en/${withoutLocale}/index.md`,
    `content/docs/en/${withoutLocale}/index.mdx`,
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

describe('PostHog revalidated 404 redirects', () => {
  it('contains only unique sources with complete evidence', () => {
    const sources = posthogRules.map((rule) => normalizePath(rule.legacyPath));

    expect(new Set(sources).size).toBe(sources.length);
    expect(posthogRules.length).toBe(51);

    for (const rule of posthogRules) {
      expect(rule.legacyUrl).toContain(rule.legacyPath);
      expect(rule.evidence.length).toBeGreaterThanOrEqual(3);
      expect(rule.preserveSearch).toBe(true);
      expect(['exact-slug', 'semantic-page-match']).toContain(rule.type);
      expect(rule.confidence).toBe('high');
    }
  });

  it('does not duplicate an existing legacy source rule', () => {
    const existing = new Set(
      redirectsConfig.rules.map((rule) => normalizePath(rule.legacyPath)),
    );

    for (const rule of posthogRules) {
      expect(existing.has(normalizePath(rule.legacyPath))).toBe(false);
    }
  });

  it('points every internal target to a current English inventory route', () => {
    const routes = new Set(inventory.routes.map((route) => route.routePath));

    for (const rule of posthogRules) {
      if (rule.target.startsWith('/')) {
        expect(
          routes.has(rule.target) ||
            existingTargetPaths.has(rule.target) ||
            contentPathExists(rule.target),
          rule.target,
        ).toBe(true);
      }
    }
  });

  it('publishes every approved source to the generated redirect artifacts', () => {
    const bulk = JSON.parse(
      readFileSync('vercel-legacy-redirects.json', 'utf8'),
    ) as Array<{ source: string }>;
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
      redirects?: Array<{ source: string }>;
    };
    const staticSources = new Set(
      staticRedirects.map((rule) => normalizePath(rule.p)),
    );
    const publishedSources = new Set([
      ...bulk.map((rule) => normalizePath(rule.source)),
      ...(vercel.redirects ?? []).map((rule) => normalizePath(rule.source)),
    ]);

    for (const rule of posthogRules) {
      expect(staticSources.has(normalizePath(rule.legacyPath))).toBe(true);
      expect(publishedSources.has(normalizePath(rule.legacyPath))).toBe(true);
    }
  });
});
