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

type DocsFilesystemIndex = {
  contentUrls: Set<string>;
  routeToFile: Map<string, string>;
};

const manualLegacyUrls = new Set([
  'https://docs.agora.io/en/Voice/autoplay_policy_web_ng',
  'https://docs.agora.io/en/ai/reference/release-notes',
  'https://docs.agora.io/en/cloud-recording/get-started/getstarted',
  'https://docs.agora.io/en/flexible-classroom/overview/supported-platforms',
  'https://docs.agora.io/en/help/account-and-billing/console_account_faq',
  'https://docs.agora.io/en/help/integration-issues/recording_mode',
  'https://docs.agora.io/en/help/integration-issues/system_volume',
  'https://docs.agora.io/help/account-and-billing/billing_account',
  'https://docs.agora.io/help/integration-issues/agora_class_custom_properties',
  'https://docs.agora.io/help/integration-issues/token_cohost',
  'https://docs.agora.io/help/integration-issues/token_related_issues',
  'https://docs.agora.io/en/help/integration-issues/acquire_file_directory',
  'https://docs.agora.io/en/help/other-issues/android_noaudio',
  'https://docs.agora.io/en/help/quality-issues/track_ended',
  'https://docs.agora.io/en/interactive-whiteboard/develop/authentication-workflow',
  'https://docs.agora.io/en/sdks',
  'https://docs.agora.io/en/solutions/interactive-live-streaming/product-overview',
]);
const apiRefRedirectAuditEvidence =
  'API Reference link audit row marked add-301/high in docs/agents/reports/2026-08-03-api-ref-docs-redirect-triage.md';

const reviewedHelpFaqRedirectTargets = [
  {
    legacyUrl: 'https://docs.agora.io/en/help/integration-issues/recording_mode',
    target: '/en/api-reference/faq/integration/recording_mode',
  },
  {
    legacyUrl: 'https://docs.agora.io/en/help/integration-issues/system_volume',
    target: '/en/api-reference/faq/integration/system_volume',
  },
  {
    legacyUrl: 'https://docs.agora.io/help/account-and-billing/billing_account',
    target: '/en/api-reference/faq/account/billing_account',
  },
  {
    legacyUrl:
      'https://docs.agora.io/help/integration-issues/agora_class_custom_properties',
    target: '/en/api-reference/faq/integration/agora_class_custom_properties',
  },
  {
    legacyUrl: 'https://docs.agora.io/help/integration-issues/token_cohost',
    target: '/en/api-reference/faq/integration/token_cohost',
  },
  {
    legacyUrl:
      'https://docs.agora.io/help/integration-issues/token_related_issues',
    target: '/en/api-reference/faq/integration/token_related_issues',
  },
];

describe('legacy sitemap compatibility audit', () => {
  const sitemapUrls = readLegacySitemapUrls();
  const compatibilityUrls = [
    ...sitemapUrls,
    ...Array.from(manualLegacyUrls, parseLegacyUrl),
  ];
  const typedReviewReport = reviewReport as LegacySitemapReviewReport;
  const docsFilesystemIndex = buildDocsFilesystemIndex();
  const docsContentUrls = docsFilesystemIndex.contentUrls;
  const docsPortalUrls = getDocsPortalUrls(docsFilesystemIndex);
  const redirectLegacyUrls = new Set(
    legacySitemapRedirectConfig.rules.map((rule) => rule.legacyUrl),
  );

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
    const broken = sitemapUrls.filter((url) => {
      if (docsContentUrls.has(url.path)) {
        return false;
      }

      return !redirectLegacyUrls.has(url.href);
    });

    expect(broken).toEqual([]);
  });

  it('stores only non-native redirect rules in redirects.json', () => {
    const nativeUrls = compatibilityUrls.filter((url) =>
      docsContentUrls.has(url.path),
    );
    const redirectedUrls = compatibilityUrls.filter(
      (url) => !docsContentUrls.has(url.path),
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
      redirectedUrls.every((url) => redirectLegacyUrls.has(url.href)),
    ).toBe(true);
  });

  it('has a redirect record for every non-native sitemap URL', () => {
    const missingRedirects = sitemapUrls
      .filter((url) => !docsContentUrls.has(url.path))
      .filter((url) => !redirectLegacyUrls.has(url.href));

    expect(missingRedirects).toEqual([]);
  });

  it('has redirect records for reviewed legacy Help and FAQ URLs', () => {
    for (const { legacyUrl, target } of reviewedHelpFaqRedirectTargets) {
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

  it('does not keep stale redirect records outside the sitemap snapshot', () => {
    const sitemapHrefs = new Set(sitemapUrls.map((url) => url.href));
    const staleRules = legacySitemapRedirectConfig.rules.filter(
      (rule) =>
        !sitemapHrefs.has(rule.legacyUrl) &&
        !manualLegacyUrls.has(rule.legacyUrl) &&
        !rule.evidence.includes(apiRefRedirectAuditEvidence),
    );

    expect(staleRules).toEqual([]);
  });

  it('targets existing new docs portal pages', () => {
    const missingTargets = legacySitemapRedirectConfig.rules
      .map((rule) => stripHash(rule.target))
      .filter((target) => !docsPortalUrls.has(target));

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
      exactSlug: 1934,
      native: 0,
      productFallback: 8,
      renamedPage: 39,
      semanticPageMatch: 674,
      totalLegacyUrls: compatibilityUrls.length,
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

function parseLegacyUrl(href: string): LegacySitemapUrl {
  const url = new URL(href);

  return {
    href,
    path: url.pathname,
    search: url.search,
  };
}

function readLegacySitemapUrls(): LegacySitemapUrl[] {
  const sitemapPath = join(process.cwd(), 'src/lib/legacy-sitemap/sitemap.xml');
  const xml = readFileSync(sitemapPath, 'utf8');

  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) =>
    parseLegacyUrl(match[1]),
  );
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
      '/en/realtime-media/rtc/reference/release-notes/android',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=ios',
    target:
      '/en/realtime-media/rtc/reference/release-notes/ios',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=macos',
    target:
      '/en/realtime-media/rtc/reference/release-notes/macos',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=web',
    target:
      '/en/realtime-media/rtc/reference/release-notes/web',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=windows',
    target:
      '/en/realtime-media/rtc/reference/release-notes/windows',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=electron',
    target:
      '/en/realtime-media/rtc/reference/release-notes/electron',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=flutter',
    target:
      '/en/realtime-media/rtc/reference/release-notes/flutter',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=react-native',
    target:
      '/en/realtime-media/rtc/reference/release-notes/react-native',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=react-js',
    target:
      '/en/realtime-media/rtc/reference/release-notes/javascript',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=unity',
    target:
      '/en/realtime-media/rtc/reference/release-notes/unity',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=unreal',
    target:
      '/en/realtime-media/rtc/reference/release-notes/unreal',
  },
  {
    legacyUrl:
      'https://docs.agora.io/en/broadcast-streaming/overview/release-notes?platform=blueprint',
    target:
      '/en/realtime-media/rtc/reference/release-notes/blueprint',
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
    legacyUrl:
      'https://docs.agora.io/en/conversational-ai/overview/release-notes',
    target: '/en/ai/release-notes',
  },
  {
    legacyUrl: 'https://docs.agora.io/en/conversational-ai/overview/pricing',
    target: '/en/ai/reference/pricing',
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

function buildDocsFilesystemIndex(): DocsFilesystemIndex {
  const docsRoot = join(process.cwd(), 'content/docs');
  const contentUrls = new Set<string>();
  const routeToFile = new Map<string, string>();
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
      const routePath = `/${contentPath}`;

      contentUrls.add(routePath);
      routeToFile.set(routePath, fullPath);
    }
  };

  visit(docsRoot);

  return { contentUrls, routeToFile };
}

function stripHash(url: string) {
  return url.split('#', 1)[0];
}

function getDocsPortalUrls(docsFilesystemIndex: DocsFilesystemIndex) {
  const urls = new Set(docsFilesystemIndex.contentUrls);
  const missingTargets = new Set(
    legacySitemapRedirectConfig.rules
      .map((rule) => stripHash(rule.target))
      .filter((target) => !urls.has(target)),
  );

  for (const target of missingTargets) {
    const parentRoute = target.split('/').slice(0, -1).join('/');
    const sourceFilePath = docsFilesystemIndex.routeToFile.get(parentRoute);

    if (!sourceFilePath) {
      continue;
    }

    const platform = target.split('/').at(-1);
    if (!platform) {
      continue;
    }

    const text = readFileSync(sourceFilePath, 'utf8');
    const hasPlatformRoute = Array.from(
      text.matchAll(/<PlatformStructured\s+platform=["']([^"']+)["']/g),
      (match) => normalizePlatform(match[1] ?? ''),
    ).includes(platform);

    if (hasPlatformRoute) {
      urls.add(target);
    }
  }

  return urls;
}

function normalizePlatform(platform: string) {
  return platform === 'react-js' ? 'javascript' : platform;
}
