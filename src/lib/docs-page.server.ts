import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import { resolveDocsLastUpdatedMetadata } from './docs-last-updated.server';
import type { DocsLayoutMode } from './docs-layout';
import { resolveMovedDocsRedirect } from './docs-moved-redirects';
import {
  type DocsNavScopeResolution,
  getNavScopeSidebarNodes,
  getNavScopeVersionLinks,
  getScopedNavScopeSidebarNodes,
  getSharedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { getSourceSlugs } from './docs-routing';
import { getSearchEntryMetadata } from './docs-search';
import {
  type DocsSidebarNode,
  type DocsSidebarSectionNode,
  filterSidebarNodes,
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinksFromNode,
  getProductScopes,
  getSidebarBreadcrumb,
  getTabSummaries,
} from './docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from './i18n/i18n-config';
import { resolveLegacySitemapRedirectPath } from './legacy-sitemap/redirects';
import { getLegacySolutionsRedirectUrl } from './legacy-solutions-routing';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
  isOpenApiTab,
  type OpenApiLane,
  resolveOpenApiEndpointRoute,
  resolveOpenApiLaneRoute,
} from './openapi/lanes';
import { getOpenApiMarkdownPages } from './openapi/markdown';
import { getOpenApiOperation } from './openapi/source.server';
import {
  filterPlatformGroupPanelNodes,
  getCanonicalSourcePages,
  getPlatformGroupPanelUrls,
  isPlatformGroupPanelPage,
  resolvePlatformGroupDefinition,
  resolvePlatformGroupParentPage,
} from './platforms/platform-group-pages';
import {
  buildCanonicalPlatformTocText,
  buildPlatformMarkdownText,
  extractStructuredPlatformTabs,
} from './platforms/processed-text';
import type { PlatformKey } from './platforms/registry';
import { resolvePlatformRoutePage } from './platforms/route';
import { isPublishedDocsLocale, PUBLISHED_DOCS_LOCALES } from './site-region';
import {
  type source as docsSource,
  getPageMarkdownUrl,
  type PageWithSource,
} from './source.server';
import { resolveZhCnProductIaRedirect } from './zh-cn-product-ia-redirects';

const OPENAPI_TAB = 'api-reference';
const DEVICE_KIT_PATH_ENTRY_SLUG = 'quickstart-device-kit';
const CONVERSATIONAL_AI_PATH_ENTRY_SLUG = 'quickstart-coding';
const RECIPES_PATH_ENTRY_SLUG = 'voice-ai-recipes';
const RECIPES_ROOT_SLUG = 'recipes';
const SDKS_ROOT_SLUG = 'sdks';
const ZH_CN_SHARED_CONCEPT_SLUGS = new Set([
  'mcp-integrate',
  'skills-integrate',
]);

type DocsSidebarPageNode = Extract<DocsSidebarNode, { type: 'page' }>;

const LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES: Record<string, string> = {
  history: 'history',
  interrupt: 'interrupt',
  join: 'join',
  leave: 'leave',
  list: 'list',
  query: 'query',
  speak: 'speak',
  think: 'think',
  turns: 'turns',
  update: 'update',
};

const LEGACY_BEST_PRACTICES_REDIRECTS: Record<
  string,
  Partial<Record<AppLocale, string>>
> = {
  'audio-settings': {
    'zh-CN': '/zh-CN/ai/best-practices/audio-settings',
  },
  'opt-latency': {
    'zh-CN': '/zh-CN/ai/best-practices/optimize-latency',
  },
  geofencing: {
    en: '/en/ai/best-practices/regional-restrictions',
    'zh-CN': '/zh-CN/ai/best-practices/regional-restrictions',
  },
  'http-basic-auth': {
    'zh-CN': '/zh-CN/api-reference/api-ref/conversational-ai/authentication',
  },
  'release-notes': {
    'zh-CN': '/zh-CN/ai/release-notes',
  },
};

export async function loadDocsTabIndex(locale: string, tab: string) {
  if (locale === 'en' && tab === SDKS_ROOT_SLUG) {
    return {
      locale,
      tab,
      url: `/${locale}/${OPENAPI_TAB}/${SDKS_ROOT_SLUG}`,
    };
  }

  const { source } = await import('./source.server');
  const pageTree = getCanonicalPageTree(source, locale);
  const tabSummaries = getTabSummaries(pageTree);
  const tabSummary = tabSummaries.find((item) => item.id === tab);

  const tabUrl = `/${locale}/${tab}`;
  if (tabSummary?.url === tabUrl && hasDocsPageForUrl(source, tabUrl)) {
    return {
      locale,
      url: tabSummary.url,
      tab,
    };
  }

  const indexedPageUrl = getFirstTabPageUrl(pageTree, tab);
  const firstDescendantPageUrl = getFirstChildPageUrl(pageTree, tab, []);
  const firstPageUrl =
    indexedPageUrl === tabUrl && !hasDocsPageForUrl(source, tabUrl)
      ? firstDescendantPageUrl
      : (indexedPageUrl ?? firstDescendantPageUrl);

  if (!firstPageUrl) {
    return null;
  }

  return {
    locale,
    url: firstPageUrl,
    tab,
  };
}

export async function loadDocsPagePayload(
  locale: string,
  tab: string,
  slugSegments: string[],
  search?: string,
) {
  const movedDocsRedirect = resolveMovedDocsRedirect(locale, tab, slugSegments);
  if (movedDocsRedirect) {
    return {
      redirectUrl: movedDocsRedirect,
    };
  }

  const apiReferenceRedirect = resolveApiReferenceRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (apiReferenceRedirect) {
    return {
      redirectUrl: apiReferenceRedirect,
    };
  }

  const deviceKitRedirect = resolveDeviceKitRedirect(locale, tab, slugSegments);
  if (deviceKitRedirect) {
    return {
      redirectUrl: deviceKitRedirect,
    };
  }

  const aiRedirect = resolveAiDocsRedirect(locale, tab, slugSegments);
  if (aiRedirect) {
    return {
      redirectUrl: aiRedirect,
    };
  }

  const legacyConversationalAiReferenceRedirect =
    resolveLegacyConversationalAiReferenceRedirect(locale, tab, slugSegments);
  if (legacyConversationalAiReferenceRedirect) {
    return {
      redirectUrl: legacyConversationalAiReferenceRedirect,
    };
  }

  const legacyProductRedirect = resolveLegacyProductRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (legacyProductRedirect) {
    return {
      redirectUrl: legacyProductRedirect,
    };
  }

  const legacySitemapRedirect = resolveLegacySitemapRedirect(
    locale,
    tab,
    slugSegments,
    search,
  );
  if (legacySitemapRedirect) {
    return legacySitemapRedirect;
  }

  const legacyRedirect = resolveLegacyBestPracticesRedirect(
    locale,
    tab,
    slugSegments,
  );

  if (legacyRedirect) {
    return {
      redirectUrl: legacyRedirect,
    };
  }

  const sharedConceptRedirect = resolveZhCnSharedConceptRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (sharedConceptRedirect) {
    return {
      redirectUrl: sharedConceptRedirect,
    };
  }

  const zhCnProductIaRedirect = resolveZhCnProductIaRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (zhCnProductIaRedirect) {
    return {
      redirectUrl: zhCnProductIaRedirect,
    };
  }

  const realtimeMediaApiReferenceRedirect =
    resolveRealtimeMediaApiReferenceRedirect(locale, tab, slugSegments);
  if (realtimeMediaApiReferenceRedirect) {
    return {
      redirectUrl: realtimeMediaApiReferenceRedirect,
    };
  }

  const solutionsApiReferenceRedirect = resolveSolutionsApiReferenceRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (solutionsApiReferenceRedirect) {
    return {
      redirectUrl: solutionsApiReferenceRedirect,
    };
  }

  const legacySolutionsRedirect = getLegacySolutionsRedirectUrl({
    locale,
    slugSegments,
    tab,
  });
  if (legacySolutionsRedirect) {
    return {
      preserveSearch: true,
      redirectUrl: legacySolutionsRedirect,
    };
  }

  const { source } = await import('./source.server');
  const realtimeMediaRedirect = resolveRealtimeMediaRedirect(
    locale,
    tab,
    slugSegments,
  );
  if (
    realtimeMediaRedirect &&
    hasDocsPageForUrl(source, realtimeMediaRedirect)
  ) {
    return {
      redirectUrl: realtimeMediaRedirect,
    };
  }

  const requestedSlug = slugSegments.at(-1) ?? 'index';
  let slug = requestedSlug;
  let resolvedSlugSegments = slugSegments;
  let page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  let requestedPlatform: PlatformKey | undefined;
  let platformResolvedProcessedText: string | undefined;

  if (!page) {
    const platformRoute = await resolvePlatformRoutePage({
      extractPlatformTabs: extractStructuredPlatformTabs,
      locale,
      readProcessedText,
      slugSegments,
      source,
      tab,
    });

    if (platformRoute) {
      page = platformRoute.page;
      requestedPlatform = platformRoute.platform;
      platformResolvedProcessedText = platformRoute.processedText;
      resolvedSlugSegments = platformRoute.slugSegments;
      slug = resolvedSlugSegments.at(-1) ?? 'index';
    }
  }

  if (!page) {
    const pageTree = getCanonicalPageTree(source, locale);
    const fallbackUrl = getFirstChildPageUrl(pageTree, tab, slugSegments);

    if (fallbackUrl) {
      return {
        redirectUrl: fallbackUrl,
      };
    }

    return null;
  }

  const localePages = source.getPages(locale);
  const platformGroupParent = resolvePlatformGroupParentPage(page, localePages);

  if (platformGroupParent) {
    const panelPage = page;
    const platformGroup = resolvePlatformGroupDefinition(
      platformGroupParent,
      localePages,
    );
    const panelPlatform = platformGroup?.panels.find(
      (panel) => panel.contentPath === panelPage.path,
    )?.platform;

    if (!panelPlatform) {
      return {
        redirectUrl: platformGroupParent.url,
      };
    }

    const parentPage = source.getPage(
      platformGroupParent.slugs.slice(1),
      locale,
    );
    if (!parentPage) {
      return {
        redirectUrl: platformGroupParent.url,
      };
    }

    page = parentPage;
    requestedPlatform = panelPlatform;
  }

  const pageTree = getCanonicalPageTree(source, locale);
  const supportedLocale = toSupportedLocale(locale);
  const openApiPage = isOpenApiPageWithClientProps(page) ? page : null;
  const isOpenApiPage = openApiPage !== null;
  const openApiRoute =
    isOpenApiPage && supportedLocale
      ? resolveOpenApiEndpointRoute(supportedLocale, tab, resolvedSlugSegments)
      : null;
  const openApiLaneRoute =
    supportedLocale && isOpenApiTab(tab)
      ? resolveOpenApiLaneRoute(supportedLocale, tab, resolvedSlugSegments)
      : null;
  const processedText = isOpenApiPage
    ? ''
    : (platformResolvedProcessedText ?? (await readProcessedText(page)));
  const structuredPlatformTabs = extractStructuredPlatformTabs(processedText);
  const defaultStructuredPlatform = structuredPlatformTabs?.defaultPlatform;
  const artifactPlatform = requestedPlatform ?? defaultStructuredPlatform;
  const toc = isOpenApiPage
    ? normalizeToc(getPageToc(page))
    : await resolvePageToc(page, processedText, artifactPlatform);
  const layoutMode: DocsLayoutMode =
    isOpenApiPage || openApiLaneRoute !== null ? 'openapi' : 'docs';
  const sidebar = await getDocsSidebarNodes({
    activePath: page.url,
    locale: supportedLocale,
    pageTree,
    pageUrl: page.url,
    source,
    tab,
  });
  const title = page.data.title ?? page.slugs.at(-1) ?? page.url;
  const navScope = getDocsNavScope({
    activePath: page.url,
    locale,
    pageTree,
    source,
    tab,
  });
  const sidebarHeader = resolveDocsSidebarHeader({
    activePath: page.url,
    hidePlatformTabs:
      'hidePlatformTabs' in page.data ? page.data.hidePlatformTabs : undefined,
    locale,
    navScope,
    pageTree,
    source,
    tab,
  });
  const breadcrumb = getSidebarBreadcrumb(sidebar, page.url);
  const platformGroup = resolvePlatformGroupDefinition(page, localePages);
  const mdxBody = platformGroup
    ? {
        canonicalPlatform: platformGroup.canonicalPlatform,
        contentPath: page.path,
        kind: 'platform-group' as const,
        panels: platformGroup.panels,
        platformTabs: {
          canonicalPlatform: platformGroup.canonicalPlatform,
          defaultPlatform: platformGroup.canonicalPlatform,
          initialPlatform: requestedPlatform,
          platforms: JSON.stringify(platformGroup.platforms),
        },
        platforms: platformGroup.platforms,
      }
    : {
        contentPath: page.path,
        ...('hidePlatformTabs' in page.data && page.data.hidePlatformTabs
          ? { hidePlatformTabs: true }
          : {}),
        kind: 'mdx' as const,
        ...(structuredPlatformTabs
          ? {
              platformTabs: {
                canonicalPlatform: structuredPlatformTabs.canonicalPlatform,
                defaultPlatform: defaultStructuredPlatform,
                initialPlatform: requestedPlatform,
                platforms: JSON.stringify(structuredPlatformTabs.platforms),
              },
            }
          : {}),
      };
  const body = isOpenApiPage
    ? {
        kind: 'openapi' as const,
        pageProps: await openApiPage.data.getClientAPIPageProps(),
      }
    : mdxBody;
  const lastUpdated = await resolveDocsLastUpdatedMetadata(
    Array.from(
      new Set([
        `content/docs/${page.path}`,
        ...(openApiRoute && supportedLocale
          ? [openApiRoute.lane.sourcePath[supportedLocale]]
          : []),
        ...(openApiLaneRoute && supportedLocale
          ? [openApiLaneRoute.sourcePath[supportedLocale]]
          : []),
      ]),
    ),
  );

  return {
    activePath: page.url,
    activeTab: tab,
    body,
    breadcrumb:
      navScope?.scope.meta.sidebarIndexTitle &&
      page.url === navScope.scope.node.index?.url
        ? [
            {
              title,
              url: page.url,
            },
          ]
        : breadcrumb.length > 0
          ? breadcrumb
          : [
              {
                title,
                url: page.url,
              },
            ],
    contentPath: page.path,
    description: page.data.description,
    markdownUrl: getPageMarkdownUrl(page, artifactPlatform).url,
    lastUpdated,
    layoutMode,
    hideToc: ('hideToc' in page.data ? page.data.hideToc : undefined) ?? false,
    localeLinks: PUBLISHED_DOCS_LOCALES.map((targetLocale) => {
      const targetPage = source.getPage(page.slugs.slice(1), targetLocale);
      const targetTabEntry = getFirstTabPageUrl(
        getCanonicalPageTree(source, targetLocale),
        tab,
      );
      const targetUrl =
        targetPage?.url ??
        (targetTabEntry?.startsWith(`/${targetLocale}/`)
          ? targetTabEntry
          : undefined) ??
        `/${targetLocale}/introduction`;

      return {
        href: targetUrl,
        isActive: targetLocale === locale,
        locale: targetLocale,
      };
    }),
    navigation:
      openApiRoute && supportedLocale
        ? getOpenApiPrevNextLinks(
            openApiRoute.lane,
            supportedLocale,
            openApiRoute.operationId,
          )
        : getPrevNextLinksFromNode(navScope?.sidebarRoot ?? pageTree, page.url),
    productScopes: getProductScopes(pageTree),
    sidebar,
    sidebarHeader,
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
}

export async function loadDocsSearchIndex(locale: string) {
  const supportedLocale = toSupportedLocale(locale);

  if (!supportedLocale || !isPublishedDocsLocale(supportedLocale)) {
    return [];
  }

  const { source } = await import('./source.server');
  const pages = await Promise.all(
    getCanonicalSourcePages(source.getPages(locale)).map(async (item) => {
      const content = await readSearchText(item);

      return {
        content,
        description: item.data.description,
        ...getSearchEntryMetadata(item.url, content),
        title: item.data.title ?? item.slugs.at(-1) ?? item.url,
        url: item.url,
      };
    }),
  );
  const existingUrls = new Set(pages.map((page) => page.url));
  const openApiPages = (await getOpenApiMarkdownPages())
    .filter(
      (page) =>
        page.url.startsWith(`/${supportedLocale}/`) &&
        !existingUrls.has(page.url),
    )
    .map((page) => ({
      content: page.markdown,
      ...getSearchEntryMetadata(page.url, page.markdown, 'openapi'),
      title: page.title,
      url: page.url,
    }));

  return [...pages, ...openApiPages];
}

function getCanonicalPageTree(source: typeof docsSource, locale?: string) {
  const pages = source.getPages(locale);

  return filterPlatformGroupPanelNodes(
    source.getPageTree(locale),
    getPlatformGroupPanelUrls(pages),
  );
}

function resolveLegacyBestPracticesRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'best-practices') {
    return null;
  }

  const supportedLocale = toSupportedLocale(locale);
  if (!supportedLocale) {
    return null;
  }

  const slug =
    slugSegments.length === 0 ? 'index' : (slugSegments.at(-1) ?? 'index');
  const redirect =
    LEGACY_BEST_PRACTICES_REDIRECTS[slug]?.[supportedLocale] ?? null;

  return redirect;
}

function resolveZhCnSharedConceptRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'zh-CN') {
    return null;
  }

  const leafSlug = slugSegments.at(-1);
  if (!leafSlug || !ZH_CN_SHARED_CONCEPT_SLUGS.has(leafSlug)) {
    return null;
  }

  if (tab === 'introduction' && slugSegments.length === 1) {
    return null;
  }

  return `/zh-CN/introduction/${leafSlug}`;
}

function resolveDeviceKitRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  if (normalizedPath === 'device-kit') {
    return `/${locale}/ai/device-kit/start-here/quickstart`;
  }

  if (normalizedPath === `choose-your-path/${DEVICE_KIT_PATH_ENTRY_SLUG}`) {
    return `/${locale}/ai/device-kit/start-here/quickstart`;
  }

  const redirects: Record<string, string> = {
    'device-kit/get-started': `/${locale}/ai/device-kit/start-here/quickstart`,
    'device-kit/get-started/quickstart': `/${locale}/ai/device-kit/start-here/quickstart`,
    'device-kit/get-started/enable-services': `/${locale}/ai/device-kit/reference/enable-services`,
    'device-kit/get-started/run-the-demo': `/${locale}/ai/device-kit/build/run-the-r1-demo`,
    'device-kit/overview': `/${locale}/ai/device-kit/build/architecture-overview`,
    'device-kit/overview/architecture': `/${locale}/ai/device-kit/build/architecture-overview`,
    'device-kit/reference': `/${locale}/ai/device-kit/build/device-controls`,
    'device-kit/reference/device-controls': `/${locale}/ai/device-kit/build/device-controls`,
    'device-kit/overview/pricing': `/${locale}/ai/device-kit/reference/pricing`,
    'device-kit/overview/release-notes': `/${locale}/ai/device-kit/reference/release-notes`,
    'device-kit/start-here/enable-services': `/${locale}/ai/device-kit/reference/enable-services`,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveLegacyConversationalAiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en' || tab !== 'conversational-ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const toolkitPrefix = 'reference/toolkot';

  if (normalizedPath === toolkitPrefix) {
    return '/en/api-reference/api-ref/conversational-ai/client-toolkit';
  }

  if (!normalizedPath.startsWith(`${toolkitPrefix}/`)) {
    return null;
  }

  const routeLeaf = normalizedPath.slice(`${toolkitPrefix}/`.length);
  return ['android', 'ios', 'web'].includes(routeLeaf)
    ? `/en/api-reference/api-ref/conversational-ai/client-toolkit/${routeLeaf}`
    : null;
}

function resolveApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== OPENAPI_TAB) {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const legacyClientToolkitRedirect =
    resolveLegacyConversationalAiClientToolkitRedirect(locale, normalizedPath);
  if (legacyClientToolkitRedirect) {
    return legacyClientToolkitRedirect;
  }

  const legacyConversationalAiRestRedirect =
    resolveLegacyConversationalAiRestRedirect(locale, normalizedPath);
  if (legacyConversationalAiRestRedirect) {
    return legacyConversationalAiRestRedirect;
  }

  if (normalizedPath === RECIPES_PATH_ENTRY_SLUG) {
    return `/${locale}/${OPENAPI_TAB}/${RECIPES_ROOT_SLUG}`;
  }

  if (
    locale === 'en' &&
    CONSOLE_API_REFERENCE_DUPLICATE_PATHS.has(normalizedPath)
  ) {
    return '/en/api-reference/api-ref/console/solutions-agora-console-rest-api';
  }

  const legacyFlattenedApiRefRedirect =
    LEGACY_FLATTENED_API_REF_REDIRECTS[normalizedPath];
  if (locale === 'en' && legacyFlattenedApiRefRedirect) {
    return legacyFlattenedApiRefRedirect;
  }

  if (
    locale === 'en' &&
    (normalizedPath === 'api-ref/video' || normalizedPath === 'api-ref/voice')
  ) {
    return '/en/api-reference/api-ref/rtc';
  }

  if (
    locale === 'en' &&
    isLegacyEnglishApiReferenceProductPath(normalizedPath)
  ) {
    if (normalizedPath === 'video' || normalizedPath === 'voice') {
      return '/en/api-reference/api-ref/rtc';
    }

    return `/en/${getApiReferenceProductRoot(locale)}/${normalizedPath}`;
  }

  return null;
}

function getApiReferenceProductRoot(locale: string) {
  return locale === 'en' ? 'api-reference/api-ref' : 'api-reference';
}

function resolveLegacyConversationalAiClientToolkitRedirect(
  locale: string,
  normalizedPath: string,
) {
  if (locale !== 'en') {
    return null;
  }

  const prefix = 'conversational-ai/client-toolkit';

  if (normalizedPath === prefix) {
    return `/${locale}/api-reference/api-ref/conversational-ai/client-toolkit`;
  }

  if (!normalizedPath.startsWith(`${prefix}/`)) {
    return null;
  }

  const routeLeaf = normalizedPath.slice(`${prefix}/`.length);
  return ['android', 'ios', 'web'].includes(routeLeaf)
    ? `/${locale}/api-reference/api-ref/conversational-ai/client-toolkit/${routeLeaf}`
    : null;
}

function isLegacyEnglishApiReferenceProductPath(path: string) {
  if (!path || path.startsWith('api-ref/')) {
    return false;
  }

  if (path === 'video' || path === 'voice') {
    return true;
  }

  return API_REFERENCE_PRODUCT_SLUGS.includes(path);
}

const API_REFERENCE_PRODUCT_SLUGS = [
  'cloud-recording',
  'cloud-transcoding',
  'conversational-ai',
  'broadcast-streaming',
  'im',
  'media-pull',
  'media-push',
  'on-premise-recording',
  'rtc',
  'signaling',
  'speech-to-text',
];

const CONSOLE_API_REFERENCE_DUPLICATE_PATHS = new Set([
  'api-ref/broadcast-streaming/agora-console-rest-api',
  'api-ref/video/agora-console-rest-api',
  'api-ref/voice/agora-console-rest-api',
]);

const LEGACY_FLATTENED_API_REF_REDIRECTS: Record<string, string> = {
  'api-ref/analytics-rest-api':
    '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
  'api-ref/analytics-restful-authentication':
    '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
  'api-ref/classroom-rest-api':
    '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
  'api-ref/solutions-agora-console-rest-api':
    '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
};

function resolveLegacyConversationalAiRestRedirect(
  locale: string,
  normalizedPath: string,
) {
  const prefix = 'conversational-ai/rest-api';

  if (normalizedPath === prefix) {
    return `/${locale}/api-reference/api-ref/conversational-ai`;
  }

  if (normalizedPath === `${prefix}/authentication`) {
    return `/${locale}/api-reference/api-ref/conversational-ai/authentication`;
  }

  if (normalizedPath === `${prefix}/status-codes`) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai/status-codes`
      : `/${locale}/api-reference/response-code`;
  }

  if (!normalizedPath.startsWith(`${prefix}/agent/`)) {
    return null;
  }

  const routeLeaf =
    LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES[
      normalizedPath.slice(`${prefix}/agent/`.length)
    ];

  return routeLeaf
    ? `/${locale}/api-reference/api-ref/conversational-ai/${routeLeaf}`
    : null;
}

function resolveAiDocsRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'ai') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  const redirects: Record<string, string> = {
    'conversational-ai': `/${locale}/ai/get-started/quickstart`,
    [`choose-your-path/${CONVERSATIONAL_AI_PATH_ENTRY_SLUG}`]: `/${locale}/ai/get-started/quickstart`,
    'build/code-first-architecture': `/${locale}/ai/build/architecture`,
    'build/event-types': `/${locale}/ai/reference/event-types`,
    pricing: `/${locale}/ai/reference/pricing`,
    'reference/code-first-architecture': `/${locale}/ai/build/architecture`,
    'reference/architecture': `/${locale}/ai/build/architecture`,
    create_asr_extension: `/${locale}/ai/reference/ten-agent/create-asr-extension`,
    create_tts_extension: `/${locale}/ai/reference/ten-agent/create-tts-extension`,
    'ten-agent/develop/create-asr-extension-project': `/${locale}/ai/reference/ten-agent/create-asr-extension`,
    'ten-agent/architecture/tts-implementation-modes': `/${locale}/ai/reference/ten-agent/create-tts-extension`,
    'best-practices/filler-words': `/${locale}/ai/build/filler-words`,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveLegacyProductRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const redirects: Record<string, string> = {
    'flexible-classroom/client-api/classroom-sdk':
      '/en/api-reference/api-ref/flexible-classroom/classroom-sdk',
    'flexible-classroom/client-api/edu-context-sdk':
      '/en/api-reference/api-ref/flexible-classroom/classroom-sdk',
    'flexible-classroom/client-api/proctor-sdk':
      '/en/api-reference/api-ref/flexible-classroom/proctor-sdk',
    'flexible-classroom/client-api/ui-scene':
      '/en/api-reference/api-ref/flexible-classroom/ui-scene',
    'flexible-classroom/reference/restful-authentication':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'interactive-whiteboard/develop/generate-token-rest':
      '/en/realtime-media/whiteboard/build/generate-token-rest',
    'iot/reference/restful-authentication':
      '/en/api-reference/api-ref/rtc/authentication',
    'media-gateway/reference/restful-authentication':
      '/en/api-reference/api-ref/rtmp-gateway/authentication',
    'solutions/flexible-classroom/reference/restful-authentication':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'solutions/iot/reference/restful-authentication':
      '/en/api-reference/api-ref/rtc/authentication',
  };

  return redirects[`${tab}/${normalizedPath}`] ?? null;
}

export function resolveLegacySitemapRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
  search?: string,
) {
  const legacyPath = `/${[locale, tab, ...slugSegments].join('/')}`;
  const rule = resolveLegacySitemapRedirectPath(legacyPath, search);

  return rule
    ? {
        preserveSearch: rule.preserveSearch,
        redirectUrl: rule.target,
      }
    : null;
}

function resolveRealtimeMediaRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (tab !== 'realtime-media') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');

  const zhCnSpeechToTextRedirects: Record<string, string> =
    locale === 'zh-CN'
      ? {
          'speech-to-text/overview': `/${locale}/realtime-media/speech-to-text`,
          'speech-to-text/overview/product-overview': `/${locale}/realtime-media/speech-to-text`,
          'speech-to-text/overview/release-notes': `/${locale}/realtime-media/speech-to-text/reference/release-notes`,
          'speech-to-text/overview/billing': `/${locale}/realtime-media/speech-to-text/reference/billing`,
          'speech-to-text/get-started/enable-service': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service`,
          'speech-to-text/user-guides': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service`,
          'speech-to-text/user-guides/http-basic-auth': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/http-basic-auth`,
          'speech-to-text/user-guides/transcribe-specified-hosts': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/transcribe-specified-hosts`,
          'speech-to-text/user-guides/translation': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/translation`,
          'speech-to-text/user-guides/update-service': `/${locale}/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service`,
          'speech-to-text/user-guides/how-to-use-protobuf': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/how-to-use-protobuf`,
          'speech-to-text/user-guides/render-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/render-captions`,
          'speech-to-text/user-guides/record-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/record-captions`,
          'speech-to-text/user-guides/encrypt-captions': `/${locale}/realtime-media/speech-to-text/build/process-transcription-data/encrypt-captions`,
          'speech-to-text/best-practices': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client`,
          'speech-to-text/best-practices/enable-from-client': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client`,
          'speech-to-text/best-practices/optimize-quality': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/optimize-quality`,
          'speech-to-text/audio-modality': `/${locale}/realtime-media/speech-to-text/build/extend-and-optimize/audio-modality`,
          'speech-to-text/api': `/${locale}/realtime-media/speech-to-text/reference/response-code`,
          'speech-to-text/api/supported-languages': `/${locale}/realtime-media/speech-to-text/reference/supported-languages`,
          'speech-to-text/api/response-code': `/${locale}/realtime-media/speech-to-text/reference/response-code`,
          'speech-to-text/webhook': `/${locale}/realtime-media/speech-to-text/build/monitor-events/receive-webhook`,
          'speech-to-text/webhook/receive-webhook': `/${locale}/realtime-media/speech-to-text/build/monitor-events/receive-webhook`,
          'speech-to-text/webhook/ncs-events': `/${locale}/realtime-media/speech-to-text/reference/ncs-events`,
        }
      : {};

  const redirects: Record<string, string> = {
    'rtc/quick-start': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/integrate-with-ai-tools': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/build-from-scratch': `/${locale}/realtime-media/rtc/quick-start/android/build-from-scratch`,
    'video/quickstart': `/${locale}/realtime-media/video/get-started-sdk`,
    'cloud-recording/pricing-webpage-recording': `/${locale}/realtime-media/cloud-recording/reference/pricing-webpage-recording`,
    'whiteboard/overview': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/account-settlement': `/${locale}/realtime-media/whiteboard/reference/account-settlement`,
    'whiteboard/overview/core-concepts': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/pricing': `/${locale}/realtime-media/whiteboard/reference/pricing`,
    'whiteboard/overview/product-overview': `/${locale}/realtime-media/whiteboard`,
    'whiteboard/overview/release-notes': `/${locale}/realtime-media/whiteboard/reference/release-notes`,
    'whiteboard/overview/release-notes-uikit': `/${locale}/realtime-media/whiteboard/reference/release-notes-uikit`,
    'whiteboard/overview/supported-platforms': `/${locale}/realtime-media/whiteboard/reference/supported-platforms`,
    'whiteboard/overview/whiteboard-fastboard': `/${locale}/realtime-media/whiteboard/whiteboard-fastboard`,
    ...zhCnSpeechToTextRedirects,
  };

  return redirects[normalizedPath] ?? null;
}

function resolveRealtimeMediaApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en' || tab !== 'realtime-media') {
    return null;
  }

  const normalizedPath = slugSegments.join('/');
  const exactRedirects: Record<string, string> = {
    'broadcast-streaming/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'broadcast-streaming/reference/api-sunset':
      '/en/api-reference/api-ref/broadcast-streaming/api-sunset',
    'broadcast-streaming/reference/restful-api':
      '/en/api-reference/api-ref/broadcast-streaming',
    'cloud-recording/reference/rest-api-overview':
      '/en/api-reference/api-ref/cloud-recording/api-callback-service',
    'cloud-recording/reference/restful-api':
      '/en/api-reference/api-ref/cloud-recording',
    'cloud-recording/reference/restful-authentication':
      '/en/api-reference/api-ref/cloud-recording/authentication',
    'im/reference/server-api': '/en/api-reference/api-ref/im',
    'im/reference/http-status-codes':
      '/en/api-reference/api-ref/im/http-status-codes',
    'im/reference/limitations': '/en/api-reference/api-ref/im/limitations',
    'im/reference/server-api/restful-overview': '/en/api-reference/api-ref/im',
    'media-pull/reference/restful-api': '/en/api-reference/api-ref/media-pull',
    'media-pull/reference/restful-authentication':
      '/en/api-reference/api-ref/media-pull/restful-authentication',
    'media-push/build/restful-api': '/en/api-reference/api-ref/media-push',
    'media-push/reference/restful-authentication':
      '/en/api-reference/api-ref/media-push/restful-authentication',
    'media-push/reference/restful-type-definition':
      '/en/api-reference/api-ref/media-push/restful-type-definition',
    'on-premise-recording/reference/api-reference':
      '/en/api-reference/api-ref/on-premise-recording',
    'rtm/reference/rest-api': '/en/api-reference/api-ref/signaling',
    'rtmp-gateway/reference/rest-api': '/en/api-reference/api-ref/rtmp-gateway',
    'rtmp-gateway/reference/restful-authentication':
      '/en/api-reference/api-ref/rtmp-gateway/authentication',
    'speech-to-text/reference/api-callback-service':
      '/en/api-reference/api-ref/speech-to-text/api-callback-service',
    'speech-to-text/reference/rest-api':
      '/en/api-reference/api-ref/speech-to-text',
    'speech-to-text/reference/restful-authentication':
      '/en/api-reference/api-ref/speech-to-text/restful-authentication',
    'video/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'video/reference/api-sunset': '/en/api-reference/api-ref/rtc',
    'voice/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'voice/reference/api-sunset': '/en/api-reference/api-ref/rtc',
    'whiteboard/reference/rest-api': '/en/api-reference/api-ref/whiteboard',
    'whiteboard/reference/rest-api/overview':
      '/en/api-reference/api-ref/whiteboard',
    'whiteboard/reference/uikit-sdk': '/en/api-reference/api-ref/uikit-sdk',
  };

  if (exactRedirects[normalizedPath]) {
    return exactRedirects[normalizedPath];
  }

  const prefixRedirects: [string, string][] = [
    [
      'broadcast-streaming/reference/restful-api/',
      '/en/api-reference/api-ref/broadcast-streaming/',
    ],
    ['im/reference/server-api/', '/en/api-reference/api-ref/im/'],
    [
      'rtmp-gateway/reference/rest-api/',
      '/en/api-reference/api-ref/rtmp-gateway/',
    ],
    [
      'speech-to-text/reference/rest-api-v5/',
      '/en/api-reference/api-ref/speech-to-text/rest-api-v5/',
    ],
    [
      'speech-to-text/reference/rest-api-v6/',
      '/en/api-reference/api-ref/speech-to-text/rest-api-v6/',
    ],
    ['whiteboard/reference/rest-api/', '/en/api-reference/api-ref/whiteboard/'],
  ];

  for (const [oldPrefix, newPrefix] of prefixRedirects) {
    if (normalizedPath.startsWith(oldPrefix)) {
      return `${newPrefix}${normalizedPath.slice(oldPrefix.length)}`;
    }
  }

  return null;
}

function resolveSolutionsApiReferenceRedirect(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (locale !== 'en' || tab !== 'solutions') {
    return null;
  }

  const redirects: Record<string, string> = {
    'agora-analytics/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'agora-analytics/reference/api':
      '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    'agora-analytics/reference/restful-authentication':
      '/en/api-reference/api-ref/agora-analytics/analytics-restful-authentication',
    'flexible-classroom/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'flexible-classroom/reference/classroom-rest-api':
      '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
    'interactive-live-streaming/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'interactive-live-streaming/reference/api-sunset':
      '/en/api-reference/api-ref/rtc/api-sunset',
    'iot/reference/agora-console-rest-api':
      '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
    'iot/reference/channel-management-rest-api':
      '/en/api-reference/api-ref/iot-channel-management-rest-api',
  };

  return redirects[slugSegments.join('/')] ?? null;
}

function hasDocsPageForUrl(source: typeof docsSource, url: string) {
  const [locale, tab, ...slugSegments] = url.split('/').filter(Boolean);
  const slug = slugSegments.at(-1) ?? 'index';

  if (!locale || !tab) {
    return false;
  }

  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  return Boolean(
    page &&
      page.url === url &&
      !isPlatformGroupPanelPage(page, source.getPages(locale)),
  );
}

export type DocsPagePayload = Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | DocsRedirectPayload
>;

export type DocsRedirectPayload = {
  preserveSearch?: boolean;
  redirectUrl: string;
};

async function readProcessedText(page: PageWithSource) {
  return readPageText(page, 'processed');
}

async function readSearchText(page: PageWithSource) {
  return readPageText(page, 'raw');
}

async function readPageText(page: PageWithSource, kind: 'processed' | 'raw') {
  try {
    if (!hasPageText(page)) {
      return '';
    }

    return await page.data.getText(kind);
  } catch {
    return '';
  }
}

async function resolvePageToc(
  page: PageWithSource,
  processedText: string,
  platform?: PlatformKey,
) {
  const directToc = normalizeToc(getPageToc(page));

  if (directToc.length > 0 && !platform) {
    return directToc;
  }

  try {
    const tocText = platform
      ? buildPlatformMarkdownText(processedText, platform)
      : buildCanonicalPlatformTocText(processedText);

    return normalizeToc(await getTableOfContents(tocText));
  } catch {
    try {
      return normalizeToc(
        await getTableOfContents(buildCanonicalPlatformTocText(processedText)),
      );
    } catch {
      return directToc;
    }
  }
}

function normalizeToc(toc: TOCItemType[] | undefined) {
  return (toc ?? []).flatMap((item) => {
    if (
      typeof item.title !== 'string' ||
      item.title.trim().length === 0 ||
      typeof item.url !== 'string' ||
      item.url.length === 0
    ) {
      return [];
    }

    return [
      {
        depth: item.depth,
        title: item.title,
        url: item.url,
      },
    ];
  });
}

function hasPageText(page: PageWithSource): page is PageWithSource & {
  data: { getText: (kind: 'processed' | 'raw') => Promise<string> };
} {
  return 'getText' in page.data && typeof page.data.getText === 'function';
}

function isOpenApiPageWithClientProps(
  page: PageWithSource,
): page is PageWithSource & {
  data: { getClientAPIPageProps: () => Promise<ClientApiPageProps> };
} {
  return (
    page.type === 'openapi' &&
    'getClientAPIPageProps' in page.data &&
    typeof page.data.getClientAPIPageProps === 'function'
  );
}

function getPageToc(page: PageWithSource) {
  return 'toc' in page.data && Array.isArray(page.data.toc)
    ? page.data.toc
    : undefined;
}

function toSupportedLocale(locale: string): AppLocale | null {
  return SUPPORTED_LOCALES.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : null;
}

async function getDocsSidebarNodes({
  activePath,
  locale,
  pageTree,
  pageUrl,
  source,
  tab,
}: {
  activePath?: string;
  locale: AppLocale | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  pageUrl?: string;
  source: typeof docsSource;
  tab: string;
}) {
  if (tab === 'ai') {
    const aiNodes = getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
    const apiReferenceNodes =
      locale === null
        ? []
        : getNavScopeSidebarNodes({
            getNodeMeta: (node) =>
              getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
            root: pageTree,
            tab: OPENAPI_TAB,
          });

    return buildAiProductSidebar(aiNodes, apiReferenceNodes);
  }

  if (
    shouldUseSharedPlatformSidebar(
      tab,
      activePath ?? pageUrl,
      locale,
      pageTree,
      source,
    )
  ) {
    return getSharedRtcSidebarNodes({
      locale,
      pageTree,
      source,
      tab,
      activePath,
    });
  }

  const navScope = activePath
    ? getDocsNavScope({
        activePath,
        locale,
        pageTree,
        source,
        tab,
      })
    : null;
  const sidebar = navScope
    ? getScopedSidebarNodes({
        locale,
        navScope,
        source,
      })
    : getNavScopeSidebarNodes({
        getNodeMeta: (node) =>
          getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
        root: pageTree,
        tab,
      });
  const scopedReferenceProductSidebar =
    Boolean(navScope) && isReferenceProductSidebarPath(activePath ?? pageUrl);
  const sidebarWithoutReferenceProductIcons = scopedReferenceProductSidebar
    ? stripSidebarSectionIcons(sidebar)
    : sidebar;

  const sidebarWithRealtimeMediaApiReference =
    addRealtimeMediaApiReferenceSidebarItem(
      sidebarWithoutReferenceProductIcons,
      activePath,
    );

  if (!isOpenApiTab(tab) || !locale) {
    return sidebarWithRealtimeMediaApiReference;
  }

  const openApiSidebar = await addOpenApiEndpointSidebarItems(
    sidebarWithRealtimeMediaApiReference,
    locale,
    tab,
  );

  if (isRecipesApiReferencePath(activePath)) {
    return restoreRecipesSidebarSections(openApiSidebar);
  }

  return openApiSidebar;
}

const REALTIME_MEDIA_API_REFERENCE_LINKS = [
  {
    productSlug: 'broadcast-streaming',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    productSlug: 'cloud-recording',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/cloud-recording',
  },
  {
    productSlug: 'im',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/im',
  },
  {
    productSlug: 'media-pull',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/media-pull',
  },
  {
    productSlug: 'media-push',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/media-push',
  },
  {
    productSlug: 'on-premise-recording',
    title: 'API reference',
    url: '/en/api-reference/api-ref/on-premise-recording',
  },
  {
    productSlug: 'rtm',
    title: 'Signaling REST API',
    url: '/en/api-reference/api-ref/signaling',
  },
  {
    productSlug: 'rtmp-gateway',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtmp-gateway',
  },
  {
    productSlug: 'speech-to-text',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/speech-to-text',
  },
  {
    productSlug: 'video',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    productSlug: 'voice',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/rtc',
  },
  {
    productSlug: 'whiteboard',
    title: 'RESTful API',
    url: '/en/api-reference/api-ref/whiteboard',
  },
] as const;

function addRealtimeMediaApiReferenceSidebarItem(
  nodes: DocsSidebarNode[],
  activePath?: string,
): DocsSidebarNode[] {
  const link = getRealtimeMediaApiReferenceLink(activePath);

  if (!link) {
    return nodes;
  }

  const pageNode = {
    id: link.url,
    linked: true,
    title: link.title,
    type: 'page',
    url: link.url,
  } satisfies DocsSidebarPageNode;

  const existingUrls = new Set([
    link.url,
    ...getRealtimeMediaLegacyApiReferenceUrls(link.productSlug),
  ]);

  return nodes.map((node) => {
    if (node.type !== 'section' || node.title !== 'Reference') {
      return node;
    }

    return {
      ...node,
      children: [
        pageNode,
        ...filterSidebarNodes(
          node.children,
          (child) => child.type !== 'page' || !existingUrls.has(child.url),
        ),
      ],
    };
  });
}

function getRealtimeMediaApiReferenceLink(activePath?: string) {
  if (!activePath?.startsWith('/en/realtime-media/')) {
    return null;
  }

  const productSlug = activePath.split('/').filter(Boolean)[2];

  return (
    REALTIME_MEDIA_API_REFERENCE_LINKS.find(
      (link) => link.productSlug === productSlug,
    ) ?? null
  );
}

function getRealtimeMediaLegacyApiReferenceUrls(productSlug: string) {
  const prefix = `/en/realtime-media/${productSlug}`;

  switch (productSlug) {
    case 'broadcast-streaming':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
        `${prefix}/reference/restful-api`,
      ];
    case 'cloud-recording':
      return [
        `${prefix}/reference/rest-api-overview`,
        `${prefix}/reference/restful-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'im':
      return [`${prefix}/reference/server-api`];
    case 'media-pull':
      return [
        `${prefix}/reference/restful-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'media-push':
      return [
        `${prefix}/build/restful-api`,
        `${prefix}/reference/restful-authentication`,
        `${prefix}/reference/restful-type-definition`,
      ];
    case 'on-premise-recording':
      return [`${prefix}/reference/api-reference`];
    case 'rtm':
      return [`${prefix}/reference/rest-api`];
    case 'rtmp-gateway':
      return [
        `${prefix}/reference/rest-api`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'speech-to-text':
      return [
        `${prefix}/reference/api-callback-service`,
        `${prefix}/reference/rest-api`,
        `${prefix}/reference/rest-api-v5`,
        `${prefix}/reference/rest-api-v6`,
        `${prefix}/reference/restful-authentication`,
      ];
    case 'video':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
      ];
    case 'voice':
      return [
        `${prefix}/reference/agora-console-rest-api`,
        `${prefix}/reference/api-sunset`,
      ];
    case 'whiteboard':
      return [`${prefix}/reference/rest-api`, `${prefix}/reference/uikit-sdk`];
    default:
      return [];
  }
}

function isRecipesApiReferencePath(path?: string) {
  return (
    path?.startsWith('/en/api-reference/recipes') ||
    path?.startsWith('/zh-CN/api-reference/recipes') ||
    false
  );
}

function isReferenceProductSidebarPath(path?: string) {
  const [, locale, tab, scopeRoot] = path?.split('/') ?? [];

  return (
    SUPPORTED_LOCALES.includes(locale as AppLocale) &&
    tab === OPENAPI_TAB &&
    Boolean(scopeRoot) &&
    !['faq', 'recipes', 'sdks'].includes(scopeRoot)
  );
}

function stripSidebarSectionIcons(nodes: DocsSidebarNode[]): DocsSidebarNode[] {
  return nodes.map((node) => {
    if (node.type === 'page') {
      return node;
    }

    const { icon: _icon, ...section } = node;

    return {
      ...section,
      children: stripSidebarSectionIcons(node.children),
    };
  });
}

function restoreRecipesSidebarSections(
  nodes: DocsSidebarNode[],
): DocsSidebarNode[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const [indexNode, ...rest] = nodes;
  const pageNodes = rest.filter(
    (node): node is DocsSidebarPageNode => node.type === 'page',
  );

  if (pageNodes.length === 0) {
    return nodes;
  }

  const quickstarts = pageNodes.filter((node) =>
    ['Python Quickstart', 'Golang Quickstart', 'NextJS Quickstart'].includes(
      node.title,
    ),
  );
  const integrationPatterns = pageNodes.filter((node) =>
    ['Custom LLM', 'Custom Modalities'].includes(node.title),
  );
  const useCases = pageNodes.filter((node) =>
    ['Wellness Coach', 'Thymia Biomarkers'].includes(node.title),
  );

  if (
    quickstarts.length + integrationPatterns.length + useCases.length !==
    pageNodes.length
  ) {
    return nodes;
  }

  return [
    indexNode,
    {
      children: quickstarts,
      collapsible: false,
      id: 'recipes-quickstarts',
      title: 'Quickstarts',
      type: 'section',
    },
    {
      children: integrationPatterns,
      collapsible: false,
      id: 'recipes-integration-patterns',
      title: 'Integration patterns',
      type: 'section',
    },
    {
      children: useCases,
      collapsible: false,
      id: 'recipes-use-cases',
      title: 'Use cases',
      type: 'section',
    },
  ];
}

function buildAiProductSidebar(
  nodes: DocsSidebarNode[],
  apiReferenceNodes: DocsSidebarNode[] = [],
): DocsSidebarNode[] {
  const aiOverview =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai');
  const conversationalAiQuickstart =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/get-started/quickstart') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai/get-started/quickstart');
  const conversationalAiReleaseNotes =
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/release-notes') ??
    findSidebarPageByExactUrlInNodes(nodes, '/zh-CN/ai/release-notes') ??
    findSidebarPageByExactUrlInNodes(nodes, '/en/ai/reference/release-notes') ??
    findSidebarPageByExactUrlInNodes(
      nodes,
      '/zh-CN/ai/reference/release-notes',
    );
  const buildSection = findTopLevelSidebarSection(nodes, ['Build', '构建']);
  const bestPracticesSection = findTopLevelSidebarSection(nodes, [
    'Best practices',
    '最佳实践',
  ]);
  const modelsSection = findTopLevelSidebarSection(nodes, ['Models', '模型']);
  const referenceSection = findTopLevelSidebarSection(nodes, [
    'Reference',
    '参考',
  ]);
  const deviceKitSection = findTopLevelSidebarSection(nodes, [
    'Convo AI Device Kit',
  ]);
  const _deviceKitTopLevelSection = findTopLevelSidebarSection(nodes, [
    'Convo AI Device Kit',
  ]);

  if (
    !aiOverview ||
    !conversationalAiQuickstart ||
    !buildSection ||
    !bestPracticesSection ||
    !modelsSection ||
    !referenceSection ||
    !deviceKitSection
  ) {
    return filterSidebarNodes(nodes, (node) => {
      if (node.type !== 'page') {
        return true;
      }

      return !node.url.includes('/ai/choose-your-path/');
    });
  }

  const conversationalAiApiReferenceSection = findTopLevelSidebarSection(
    apiReferenceNodes,
    ['Conversational AI'],
  );
  const _conversationalAiRestApiSection = conversationalAiApiReferenceSection
    ? (findNestedSidebarSectionByExactUrl(
        conversationalAiApiReferenceSection,
        '/en/api-reference/conversational-ai/rest-api',
      ) ??
      findNestedSidebarSectionByExactUrl(
        conversationalAiApiReferenceSection,
        '/zh-CN/api-reference/conversational-ai/rest-api',
      ))
    : null;

  const isZhCn = aiOverview.url.startsWith('/zh-CN/');
  const aiLocalePrefix = isZhCn ? '/zh-CN' : '/en';
  const restApiUrl = isZhCn
    ? `${aiLocalePrefix}/api-reference/conversational-ai/rest-api/authentication`
    : `${aiLocalePrefix}/api-reference/api-ref/conversational-ai/authentication`;

  const restApiPage = {
    id: restApiUrl,
    linked: true,
    title: isZhCn ? 'REST API' : 'RESTful API',
    type: 'page',
    url: restApiUrl,
  } satisfies DocsSidebarPageNode;
  const serverSdkTypescriptUrl = isZhCn
    ? `${aiLocalePrefix}/api-reference/conversational-ai/server-sdk/typescript`
    : `${aiLocalePrefix}/api-reference/api-ref/server-sdk/typescript`;
  const serverSdkTypescriptPage = {
    id: serverSdkTypescriptUrl,
    linked: true,
    title: isZhCn ? 'Agora Agent SDK' : 'Agora Agent SDK',
    type: 'page',
    url: serverSdkTypescriptUrl,
  } satisfies DocsSidebarPageNode;

  const referenceLeadingChildren = referenceSection.children.filter(
    (child) =>
      child.type === 'page' &&
      (child.url === '/en/ai/reference/event-types' ||
        child.url === '/zh-CN/ai/reference/event-types'),
  );
  const referenceTrailingChildren = referenceSection.children.filter(
    (child) =>
      !(
        child.type === 'page' &&
        (child.url === '/en/ai/reference/event-types' ||
          child.url === '/zh-CN/ai/reference/event-types' ||
          child.url === '/en/ai/reference/restful-api' ||
          child.url === '/zh-CN/ai/reference/restful-api' ||
          child.url === '/en/ai/reference/server-sdk' ||
          child.url === '/en/ai/reference/client-toolkit' ||
          child.url === '/zh-CN/ai/reference/server-sdk' ||
          child.url === '/zh-CN/ai/reference/client-toolkit' ||
          child.url === '/en/ai/release-notes' ||
          child.url === '/zh-CN/ai/release-notes' ||
          child.url === '/en/ai/reference/release-notes' ||
          child.url === '/zh-CN/ai/reference/release-notes')
      ),
  );

  const mergedReferenceSection: DocsSidebarSectionNode = {
    ...stripSidebarSectionMeta(referenceSection),
    children: [
      restApiPage,
      serverSdkTypescriptPage,
      ...referenceLeadingChildren,
      ...stripSidebarSectionMetaFromNodes(referenceTrailingChildren),
    ],
  };

  const mergedBuildSection: DocsSidebarSectionNode = {
    ...stripSidebarSectionMeta(buildSection),
    children: stripSidebarSectionMetaFromNodes([
      ...buildSection.children,
      {
        ...stripSidebarSectionMeta(bestPracticesSection),
        children: stripSidebarSectionMetaFromNodes(
          bestPracticesSection.children,
        ),
        title:
          buildSection.title === '构建' ? '优化与加固' : 'Harden and optimize',
      },
    ]),
  };

  return [
    {
      ...aiOverview,
      title: isZhCn ? '概览' : aiOverview.title,
    },
    {
      children: stripSidebarSectionMetaFromNodes([
        ...(conversationalAiReleaseNotes ? [conversationalAiReleaseNotes] : []),
        {
          ...conversationalAiQuickstart,
          title: isZhCn ? 'Quickstart' : 'Quickstart',
        },
        mergedBuildSection,
        modelsSection,
        mergedReferenceSection,
      ]),
      icon: 'Bot',
      id: 'ai-product-software-clients',
      title: isZhCn ? 'Voice Agent in apps' : 'Voice agent in apps',
      type: 'section',
    },
    {
      ...stripSidebarSectionMeta(deviceKitSection),
      children: [
        ...stripSidebarSectionMetaFromNodes(
          flattenDeviceKitSidebarChildren(deviceKitSection.children),
        ),
      ],
      icon: 'Cpu',
      id: 'ai-product-dedicated-devices',
      title: isZhCn
        ? 'Voice Agent on dedicated devices'
        : 'Voice agent on dedicated devices',
      type: 'section',
    },
  ];
}

function flattenDeviceKitSidebarChildren(
  children: DocsSidebarNode[],
): DocsSidebarNode[] {
  const flattened: DocsSidebarNode[] = [];
  let hasPushedReleaseNotes = false;
  const releaseNotes =
    findSidebarPageByExactUrlInNodes(
      children,
      '/en/ai/device-kit/reference/release-notes',
    ) ??
    findSidebarPageByExactUrlInNodes(
      children,
      '/zh-CN/ai/device-kit/reference/release-notes',
    );

  for (const child of children) {
    if (child.type === 'page') {
      if (
        child.url === '/en/ai/device-kit' ||
        child.url === '/zh-CN/ai/device-kit'
      ) {
        continue;
      }

      if (
        child.url === '/en/ai/device-kit/reference/release-notes' ||
        child.url === '/zh-CN/ai/device-kit/reference/release-notes'
      ) {
        hasPushedReleaseNotes = true;
      }
      flattened.push(child);
      continue;
    }

    if (child.title === 'Start here' || child.title === '从这里开始') {
      const quickstart =
        findSidebarPageByExactUrl(
          child,
          '/en/ai/device-kit/start-here/quickstart',
        ) ??
        findSidebarPageByExactUrl(
          child,
          '/zh-CN/ai/device-kit/start-here/quickstart',
        );

      if (quickstart) {
        if (releaseNotes && !hasPushedReleaseNotes) {
          flattened.push(releaseNotes);
          hasPushedReleaseNotes = true;
        }
        flattened.push({
          ...quickstart,
          title: quickstart.url.startsWith('/zh-CN/')
            ? 'Quickstart'
            : 'Quickstart',
        });
      }
      continue;
    }

    if (
      child.title === 'Reference' ||
      child.title === '参考' ||
      child.title === 'Plan rollout'
    ) {
      flattened.push(
        stripSidebarSectionMetaFromNode({
          ...child,
          children: child.children.filter(
            (node) =>
              !(
                node.type === 'page' &&
                (node.url === '/en/ai/device-kit/reference/enable-services' ||
                  node.url ===
                    '/zh-CN/ai/device-kit/reference/enable-services' ||
                  node.url === '/en/ai/device-kit/reference/release-notes' ||
                  node.url === '/zh-CN/ai/device-kit/reference/release-notes')
              ),
          ),
        }),
      );
      continue;
    }

    flattened.push(stripSidebarSectionMetaFromNode(child));
  }

  return flattened;
}

function findSidebarPageByExactUrlInNodes(
  nodes: DocsSidebarNode[],
  url: string,
): DocsSidebarPageNode | null {
  for (const node of nodes) {
    const match = findSidebarPageByExactUrl(node, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findSidebarPageByExactUrl(
  node: DocsSidebarNode,
  url: string,
): DocsSidebarPageNode | null {
  if (node.type === 'page') {
    return node.url === url ? node : null;
  }

  for (const child of node.children) {
    const match = findSidebarPageByExactUrl(child, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findNestedSidebarSectionByExactUrl(
  node: DocsSidebarNode,
  url: string,
): DocsSidebarSectionNode | null {
  if (node.type === 'page') {
    return null;
  }

  if (node.url === url) {
    return node;
  }

  for (const child of node.children) {
    const match = findNestedSidebarSectionByExactUrl(child, url);
    if (match) {
      return match;
    }
  }

  return null;
}

function findTopLevelSidebarSection(
  nodes: DocsSidebarNode[],
  titles: string[],
): DocsSidebarSectionNode | null {
  for (const node of nodes) {
    if (node.type === 'section' && titles.includes(node.title)) {
      return node;
    }
  }

  return null;
}

function stripSidebarSectionMetaFromNodes(
  nodes: DocsSidebarNode[],
): DocsSidebarNode[] {
  return nodes.map((node) => stripSidebarSectionMetaFromNode(node));
}

function stripSidebarSectionMetaFromNode(
  node: DocsSidebarNode,
): DocsSidebarNode {
  if (node.type === 'page') {
    return node;
  }

  return {
    ...stripSidebarSectionMeta(node),
    children: stripSidebarSectionMetaFromNodes(node.children),
  };
}

function stripSidebarSectionMeta(
  node: DocsSidebarSectionNode,
): DocsSidebarSectionNode {
  const { icon: _icon, url: _url, ...rest } = node;

  return rest;
}

function resolveDocsSidebarHeader({
  activePath,
  hidePlatformTabs,
  locale,
  navScope,
  pageTree,
  source,
  tab,
}: {
  activePath: string;
  hidePlatformTabs?: boolean;
  locale: AppLocale | string | null;
  navScope: DocsNavScopeResolution | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  if (tab === 'ai') {
    return undefined;
  }

  if (!navScope) {
    return undefined;
  }

  if (hidePlatformTabs) {
    return {
      ...navScope.header,
      versionSwitcher: undefined,
    };
  }

  if (!shouldUseSharedPlatformSidebar(tab, activePath)) {
    return navScope.header;
  }

  const versionLinks = getNavScopeVersionLinks({
    activePath,
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    root: pageTree,
    tab,
  }).filter((link) => isSharedPlatformTabUrl(activePath, link.href));

  if (
    versionLinks.length === 0 ||
    !versionLinks.some((link) => link.href === activePath)
  ) {
    return {
      ...navScope.header,
      versionSwitcher: undefined,
    };
  }

  return {
    ...navScope.header,
    versionSwitcher: {
      currentId:
        versionLinks.find((item) => item.href === activePath)?.id ??
        navScope.header.versionSwitcher?.currentId ??
        versionLinks[0].id,
      presentation: 'tabs' as const,
      versions: versionLinks,
    },
  };
}

function shouldUseSharedPlatformSidebar(
  tab: string,
  activePath: string | undefined,
  locale?: AppLocale | null,
  pageTree?: ReturnType<typeof docsSource.getPageTree>,
  source?: typeof docsSource,
) {
  if (tab !== 'realtime-media' || typeof activePath !== 'string') {
    return false;
  }

  if (!pageTree || !source) {
    return true;
  }

  const navScope = getDocsNavScope({
    activePath,
    locale: locale ?? null,
    pageTree,
    source,
    tab,
  });

  return Boolean(
    navScope?.scope.meta.navScope?.sharedSidebar &&
      navScope.scope.meta.navScope?.platformTabs &&
      navScope.scope.meta.navScope?.versions?.length,
  );
}

function getSharedRtcSidebarNodes({
  activePath,
  locale,
  pageTree,
  source,
  tab,
}: {
  activePath?: string;
  locale: AppLocale | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  if (!activePath) {
    return getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
  }

  const navScope = getDocsNavScope({
    activePath,
    locale,
    pageTree,
    source,
    tab,
  });

  if (!navScope) {
    return getNavScopeSidebarNodes({
      getNodeMeta: (node) =>
        getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
      root: pageTree,
      tab,
    });
  }

  return getSharedNavScopeSidebarNodes({
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    navScope,
  });
}

function isSharedPlatformTabUrl(activePath: string, targetHref: string) {
  if (!activePath.includes('/realtime-media/')) {
    return true;
  }

  const activeSegments = activePath.split('/').filter(Boolean);
  const targetSegments = targetHref.split('/').filter(Boolean);

  const isActiveScopeIndex = activeSegments.length <= 4;
  const isTargetScopeIndex = targetSegments.length <= 4;

  if (isActiveScopeIndex || isTargetScopeIndex) {
    if (isActiveScopeIndex && isTargetScopeIndex) {
      return true;
    }

    return false;
  }

  if (activeSegments.length <= 4 || targetSegments.length <= 4) {
    return true;
  }

  return activeSegments[4] !== targetSegments[4]
    ? activeSegments.slice(5).join('/') === targetSegments.slice(5).join('/')
    : activeSegments.slice(4).join('/') === targetSegments.slice(4).join('/');
}

function getDocsNavScope({
  activePath,
  locale,
  pageTree,
  source,
  tab,
}: {
  activePath: string;
  locale: AppLocale | string | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
  return resolveDocsNavScope({
    activePath,
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    root: pageTree,
    tab,
  });
}

function getScopedSidebarNodes({
  locale,
  navScope,
  source,
}: {
  locale: AppLocale | null;
  navScope: DocsNavScopeResolution;
  source: typeof docsSource;
}) {
  return getScopedNavScopeSidebarNodes({
    getNodeMeta: (node) =>
      getDocsMetaData(source.getNodeMeta(node, locale ?? undefined)),
    navScope,
  });
}

function getDocsMetaData(meta: ReturnType<typeof docsSource.getNodeMeta>) {
  return meta?.data;
}

async function addOpenApiEndpointSidebarItems(
  sidebar: DocsSidebarNode[],
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode[]> {
  return Promise.all(
    sidebar.map((node) =>
      appendEndpointPagesToOpenApiParent(node, locale, tab),
    ),
  );
}

async function appendEndpointPagesToOpenApiParent(
  node: DocsSidebarNode,
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode> {
  if (node.type !== 'section') {
    return decorateOpenApiEndpointSidebarPage(node, locale, tab);
  }

  const children = await Promise.all(
    node.children.map((child) =>
      appendEndpointPagesToOpenApiParent(child, locale, tab),
    ),
  );
  const lane = getOpenApiLanes().find(
    (item) =>
      item.tab === tab &&
      getOpenApiLaneLocales(item).includes(locale) &&
      // Only a section that genuinely REPRESENTS the lane gets its endpoint
      // pages appended. A linked-header section (rule 2 from docs-tree) carries
      // the lane's parent URL on node.url. We deliberately do NOT match a
      // section that merely *links* to the lane via a child page (e.g. a
      // product group whose "REST API" cross-link points at the lane landing),
      // otherwise that group would absorb the whole lane's endpoints inline.
      node.url === item.parentUrl[locale],
  );

  if (lane) {
    const existingUrls = new Set(
      children.flatMap((child) => (child.type === 'page' ? [child.url] : [])),
    );
    const endpointPages: DocsSidebarNode[] = (
      await Promise.all(
        getOpenApiOperationIds(lane).map(async (operationId) => ({
          id: getOpenApiEndpointUrl(lane, locale, operationId),
          method: (await getOpenApiOperation(lane, operationId, locale)).method,
          title: lane.operations[operationId].title[locale],
          type: 'page' as const,
          url: getOpenApiEndpointUrl(lane, locale, operationId),
        })),
      )
    ).filter((item) => !existingUrls.has(item.url));

    return {
      ...node,
      children: [...children, ...endpointPages],
    };
  }

  return {
    ...node,
    children,
  };
}

async function decorateOpenApiEndpointSidebarPage(
  node: DocsSidebarNode,
  locale: AppLocale,
  tab: string,
): Promise<DocsSidebarNode> {
  if (node.type !== 'page') {
    return node;
  }

  const slugSegments = node.url.split('/').filter(Boolean).slice(2);
  const route = resolveOpenApiEndpointRoute(locale, tab, slugSegments);

  if (!route) {
    return node;
  }

  return {
    ...node,
    id: route.url,
    method: (await getOpenApiOperation(route.lane, route.operationId, locale))
      .method,
    title: route.lane.operations[route.operationId].title[locale],
    url: route.url,
  };
}

function getOpenApiPrevNextLinks(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string,
) {
  const operationIds = getOpenApiOperationIds(lane);
  const currentIndex = operationIds.indexOf(operationId);

  if (currentIndex < 0) {
    return {};
  }

  return {
    next: getOpenApiNavigationLink(
      lane,
      locale,
      operationIds[currentIndex + 1],
    ),
    previous: getOpenApiNavigationLink(
      lane,
      locale,
      operationIds[currentIndex - 1],
    ),
  };
}

function getOpenApiNavigationLink(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string | undefined,
) {
  if (!operationId) {
    return undefined;
  }

  return {
    title: lane.operations[operationId].title[locale],
    url: getOpenApiEndpointUrl(lane, locale, operationId),
  };
}
