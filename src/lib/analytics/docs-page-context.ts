import type { DocsPageType } from './docs-page-type';

const NAV_SECTION_TITLES = {
  'api-reference': 'API reference',
  build: 'Build',
  faq: 'FAQ',
  'get-started': 'Get started',
  introduction: 'Introduction',
  overview: 'Overview',
  recipes: 'Recipes',
  reference: 'Reference',
  sdks: 'SDKs',
  unknown: 'unknown',
} as const;

export type DocsNavSection = keyof typeof NAV_SECTION_TITLES;

export type DocsJourneyStage =
  | 'build'
  | 'faq'
  | 'get-started'
  | 'overview'
  | 'pricing'
  | 'reference'
  | 'release-notes'
  | 'unknown';

type DocsPageTaxonomy = {
  journeyStage: DocsJourneyStage;
  navSection: DocsNavSection;
  product: string;
};

const TARGET_PAGE_TAXONOMY = {
  ai: {
    journeyStage: 'overview',
    navSection: 'overview',
    product: 'voice-agent',
  },
  'ai/build/start-stop-agent': {
    journeyStage: 'build',
    navSection: 'build',
    product: 'voice-agent',
  },
  'ai/get-started/quickstart': {
    journeyStage: 'get-started',
    navSection: 'get-started',
    product: 'voice-agent',
  },
  'api-reference': {
    journeyStage: 'overview',
    navSection: 'overview',
    product: 'api-reference',
  },
  'api-reference/api-ref/rtc': {
    journeyStage: 'reference',
    navSection: 'api-reference',
    product: 'rtc',
  },
  'api-reference/faq/integration/mirror_mode': {
    journeyStage: 'faq',
    navSection: 'faq',
    product: 'api-reference',
  },
  'api-reference/recipes': {
    journeyStage: 'build',
    navSection: 'recipes',
    product: 'api-reference',
  },
  'api-reference/sdks': {
    journeyStage: 'reference',
    navSection: 'sdks',
    product: 'api-reference',
  },
  introduction: {
    journeyStage: 'overview',
    navSection: 'introduction',
    product: 'introduction',
  },
  'introduction/core-concepts': {
    journeyStage: 'overview',
    navSection: 'introduction',
    product: 'introduction',
  },
  'realtime-media/iot/reference/licensing': {
    journeyStage: 'reference',
    navSection: 'reference',
    product: 'iot',
  },
  'realtime-media/overview': {
    journeyStage: 'overview',
    navSection: 'overview',
    product: 'realtime-media',
  },
  'realtime-media/video': {
    journeyStage: 'overview',
    navSection: 'overview',
    product: 'video',
  },
  'realtime-media/video/build/capture-and-render-video/screen-sharing': {
    journeyStage: 'build',
    navSection: 'build',
    product: 'video',
  },
  'realtime-media/video/get-started-sdk': {
    journeyStage: 'get-started',
    navSection: 'get-started',
    product: 'video',
  },
  'realtime-media/voice': {
    journeyStage: 'overview',
    navSection: 'overview',
    product: 'voice',
  },
  'realtime-media/voice/quickstart': {
    journeyStage: 'get-started',
    navSection: 'get-started',
    product: 'voice',
  },
  'realtime-media/voice/reference/pricing-legacy': {
    journeyStage: 'pricing',
    navSection: 'reference',
    product: 'voice',
  },
  'realtime-media/voice/reference/release-notes': {
    journeyStage: 'release-notes',
    navSection: 'reference',
    product: 'voice',
  },
} as const satisfies Record<string, DocsPageTaxonomy>;

const UNKNOWN_PAGE_TAXONOMY = {
  journeyStage: 'unknown',
  navSection: 'unknown',
  product: 'unknown',
} as const satisfies DocsPageTaxonomy;

export type DocsPageAnalyticsContext = {
  contentId: string;
  journeyStage: DocsJourneyStage;
  navSection: DocsNavSection;
  navSectionTitle: string;
  pageType: DocsPageType;
  pathname: string;
  product: string;
  title: string;
  version: string;
};

export function createDocsPageAnalyticsContext({
  pageType,
  pathname,
  sourcePath,
  title,
  version,
}: {
  pageType: DocsPageType;
  pathname: string;
  sourcePath: string;
  title: string;
  version?: string;
}): DocsPageAnalyticsContext {
  const contentId = normalizeContentId(sourcePath);
  const taxonomy =
    TARGET_PAGE_TAXONOMY[contentId as keyof typeof TARGET_PAGE_TAXONOMY] ??
    UNKNOWN_PAGE_TAXONOMY;

  return {
    contentId,
    journeyStage: taxonomy.journeyStage,
    navSection: taxonomy.navSection,
    navSectionTitle: NAV_SECTION_TITLES[taxonomy.navSection],
    pageType,
    pathname,
    product: taxonomy.product,
    title,
    version: version ?? 'current',
  };
}

function normalizeContentId(sourcePath: string) {
  const segments = sourcePath.split('/').filter(Boolean);
  const localeNeutralPath = segments.slice(1).join('/');

  return localeNeutralPath
    .replace(/\.(?:md|mdx)$/i, '')
    .replace(/\/index$/i, '');
}
