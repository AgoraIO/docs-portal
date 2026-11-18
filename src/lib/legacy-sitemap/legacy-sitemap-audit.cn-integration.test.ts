import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveZhCnProductIaRedirect,
  ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS,
} from '../zh-cn-product-ia-redirects';
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
  'https://docs.agora.io/en/cloud-recording/get-started/getstarted',
]);
const currentDocsIaMigrationRedirects = new Map(
  Object.entries(ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS).map(
    ([sourcePath, target]) => [
      `https://docs.agora.io/zh-CN/${sourcePath}`,
      target,
    ],
  ),
);

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

  it('allows the current zh-CN small Build migration redirects outside the sitemap snapshot', () => {
    expect(currentDocsIaMigrationRedirects.size).toBe(83);

    for (const [legacyUrl, target] of currentDocsIaMigrationRedirects) {
      expect(
        legacySitemapRedirectConfig.rules.find(
          (rule) => rule.legacyUrl === legacyUrl,
        ),
      ).toEqual(
        expect.objectContaining({
          target,
        }),
      );
    }
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

function getDocsPortalUrls(docsFilesystemIndex: DocsFilesystemIndex) {
  const urls = new Set(docsFilesystemIndex.contentUrls);
  const missingTargets = new Set(
    legacySitemapRedirectConfig.rules
      .map((rule) => rule.target)
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
