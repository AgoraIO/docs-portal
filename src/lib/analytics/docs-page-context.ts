import type { DocsPageType } from './docs-page-type';

export type DocsPageAnalyticsContext = {
  contentId: string;
  journeyStage: string;
  navSection: string;
  navSectionTitle: string;
  pageType: DocsPageType;
  pathname: string;
  title: string;
  version: string;
};

const NAV_SECTION_TITLES: Record<string, string> = {
  build: 'Build',
  'get-started': 'Get started',
  learn: 'Learn',
  overview: 'Overview',
  reference: 'Reference',
  troubleshoot: 'Troubleshooting',
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
  const navSection = inferCanonicalNavSection(pathname, pageType);

  return {
    contentId: normalizeContentId(sourcePath),
    journeyStage: navSection,
    navSection,
    navSectionTitle: NAV_SECTION_TITLES[navSection] ?? navSection,
    pageType,
    pathname,
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

function inferCanonicalNavSection(pathname: string, pageType: DocsPageType) {
  const normalized = pathname.toLowerCase();

  if (
    /(^|\/)(get-started|start-here)(\/|$)/.test(normalized) ||
    /(^|\/)(?:[a-z-]*quickstart|get-started-sdk)(\/|$)/.test(normalized)
  ) {
    return 'get-started';
  }

  if (/(^|\/)build(\/|$)/.test(normalized)) {
    return 'build';
  }

  if (
    /(^|\/)(faq|troubleshoot(?:ing)?|common-errors?)(\/|$)/.test(normalized) ||
    pageType === 'faq-troubleshooting'
  ) {
    return 'troubleshoot';
  }

  if (
    /(^|\/)(api-reference|api-ref|reference|sdks)(\/|$)/.test(normalized) ||
    pageType === 'sdk-api-reference' ||
    pageType === 'release-download'
  ) {
    return 'reference';
  }

  if (pageType === 'navigation-landing') {
    return 'overview';
  }

  return pageType === 'concept-explanation' ? 'learn' : 'build';
}
