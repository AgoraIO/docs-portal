import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  legacySitemapRedirectConfig,
  resolveLegacySitemapRedirectPath,
} from './redirects';
import reviewReport from './review-report.json';

type LegacySitemapReviewItem = {
  appliedRuleType: string;
  legacyUrl: string;
};

type LegacySitemapReviewReport = {
  items: LegacySitemapReviewItem[];
  summary: typeof reviewReport.summary;
};

type LegacySitemapUrl = {
  href: string;
  path: string;
  search: string;
};

describe('legacy sitemap compatibility audit', () => {
  const sitemapUrls = readLegacySitemapUrls();
  const typedReviewReport = reviewReport as LegacySitemapReviewReport;

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
    const pathSearchTargets = new Map<string, string>();

    for (const rule of legacySitemapRedirectConfig.rules) {
      expect(legacyUrls.has(rule.legacyUrl)).toBe(false);
      legacyUrls.add(rule.legacyUrl);

      const pathSearchKey = `${rule.legacyPath}${rule.legacySearch ?? ''}`;
      const existingTarget = pathSearchTargets.get(pathSearchKey);

      expect(existingTarget && existingTarget !== rule.target).toBeFalsy();
      pathSearchTargets.set(pathSearchKey, rule.target);
    }
  });

  it('classifies every legacy sitemap URL with zero broken URLs', () => {
    const docsPaths = getDocsContentUrls();
    const broken = sitemapUrls.filter((url) => {
      if (docsPaths.has(url.path)) {
        return false;
      }

      return !resolveLegacySitemapRedirectPath(url.path, url.search);
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
      redirectedUrls.every((url) =>
        resolveLegacySitemapRedirectPath(url.path, url.search),
      ),
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
    const docsPaths = getDocsPortalUrls();
    const missingTargets = legacySitemapRedirectConfig.rules
      .map((rule) => rule.target)
      .filter((target) => !docsPaths.has(target));

    expect(missingTargets).toEqual([]);
  });

  it('preserves query strings for rules that opt into preserveSearch', () => {
    const queryUrl = sitemapUrls.find((url) => url.search);

    expect(queryUrl).toBeDefined();

    const rule = queryUrl
      ? resolveLegacySitemapRedirectPath(queryUrl.path, queryUrl.search)
      : undefined;

    expect(rule?.preserveSearch).toBe(true);
  });

  it('maps reviewed legacy URLs to their inspected article-level targets', () => {
    for (const { legacyUrl, target } of reviewedRedirectTargets) {
      const url = new URL(legacyUrl);

      expect(
        resolveLegacySitemapRedirectPath(url.pathname, url.search),
      ).toEqual(
        expect.objectContaining({
          confidence: 'high',
          target,
          type: 'semantic-page-match',
        }),
      );
    }
  });

  it('keeps the human review report aligned with the audit summary', () => {
    expect(typedReviewReport.summary).toEqual({
      broken: 0,
      exactPath: 478,
      exactSlug: 1941,
      native: 0,
      productFallback: 0,
      renamedPage: 39,
      semanticPageMatch: 658,
      totalLegacyUrls: sitemapUrls.length,
      unavailable: 0,
    });
    const reportUrls = new Set(
      typedReviewReport.items.map((item) => item.legacyUrl),
    );
    const fallbackOrUnavailableUrls = legacySitemapRedirectConfig.rules
      .filter(
        (rule) =>
          rule.type === 'product-fallback' ||
          rule.type === 'unavailable' ||
          rule.confidence !== 'high',
      )
      .map((rule) => rule.legacyUrl);

    expect(typedReviewReport.items).toHaveLength(
      fallbackOrUnavailableUrls.length,
    );
    expect(reportUrls.size).toBe(fallbackOrUnavailableUrls.length);
    expect(
      fallbackOrUnavailableUrls.every((legacyUrl) => reportUrls.has(legacyUrl)),
    ).toBe(true);
    expect(
      typedReviewReport.items.every(
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

const reviewedRedirectTargets = [
  {
    legacyUrl:
      'https://docs.agora.io/en/agora-chat/restful-api/user-system-registration',
    target: '/en/api-reference/api-ref/im/user-system-registration',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=android',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/android',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=ios',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/ios',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=macos',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/macos',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=web',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/web',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=windows',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/windows',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=electron',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/electron',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=flutter',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/flutter',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=react-native',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/react-native',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=react-js',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/javascript',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=unity',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/unity',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=unreal',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/unreal',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=blueprint',
    target:
      '/en/realtime-media/broadcast-streaming/reference/release-notes/blueprint',
  },
  {
    legacyUrl: 'https://docs.agora.io/en/conversational-ai/develop/presets',
    target: '/en/ai/build/custom-model-integration/managed-mode',
  },
  {
    legacyUrl: 'https://docs.agora.io/en/conversational-ai/models/asr/amazon',
    target: '/en/ai/models/asr/openai',
  },
  {
    legacyUrl: 'https://docs.agora.io/en/conversational-ai/overview/pricing',
    target: '/en/ai/reference/pricing',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/account-settlement',
    target: '/en/realtime-media/whiteboard/reference/account-settlement',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/core-concepts',
    target: '/en/realtime-media/whiteboard',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes-uikit?platform=android',
    target: '/en/realtime-media/whiteboard/reference/release-notes-uikit',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes-uikit?platform=ios',
    target: '/en/realtime-media/whiteboard/reference/release-notes-uikit',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes-uikit?platform=web',
    target: '/en/realtime-media/whiteboard/reference/release-notes-uikit',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes?platform=android',
    target: '/en/realtime-media/whiteboard/reference/release-notes',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes?platform=ios',
    target: '/en/realtime-media/whiteboard/reference/release-notes',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/release-notes?platform=web',
    target: '/en/realtime-media/whiteboard/reference/release-notes',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/supported-platforms?platform=android',
    target: '/en/realtime-media/whiteboard/reference/supported-platforms',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/supported-platforms?platform=ios',
    target: '/en/realtime-media/whiteboard/reference/supported-platforms',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/supported-platforms?platform=web',
    target: '/en/realtime-media/whiteboard/reference/supported-platforms',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/interactive-whiteboard/overview/whiteboard-fastboard',
    target: '/en/realtime-media/whiteboard/whiteboard-fastboard',
  },
];

function getDocsContentUrls() {
  return getDocsPortalUrls({ includePlatformRoutes: false });
}

function getDocsPortalUrls({
  includePlatformRoutes = true,
}: {
  includePlatformRoutes?: boolean;
} = {}) {
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

      if (includePlatformRoutes) {
        const text = readFileSync(fullPath, 'utf8');
        for (const match of text.matchAll(
          /<PlatformStructured\s+platform=["']([^"']+)["']/g,
        )) {
          const platform = normalizePlatform(match[1]);
          urls.add(`/${contentPath}/${platform}`);
        }
      }
    }
  };

  visit(docsRoot);

  return urls;
}

function normalizePlatform(platform: string) {
  return platform === 'react-js' ? 'javascript' : platform;
}
