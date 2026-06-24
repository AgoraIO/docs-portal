import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import {
  type DocsNavScopeResolution,
  getNavScopeSidebarNodes,
  getNavScopeVersionLinks,
  getScopedNavScopeSidebarNodes,
  getSharedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { getSourceSlugs } from './docs-routing';
import {
  type DocsSidebarNode,
  type DocsSidebarSectionNode,
  filterSidebarNodes,
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinksFromNode,
  getSidebarBreadcrumb,
  getTabSummaries,
} from './docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  getOpenApiLaneLocales,
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
  isOpenApiTab,
  type OpenApiLane,
  resolveOpenApiEndpointRoute,
} from './openapi/lanes';
import { getOpenApiOperation } from './openapi/source.server';
import {
  buildCanonicalPlatformTocText,
  extractStructuredPlatformTabs,
} from './platforms/processed-text';
import {
  type source as docsSource,
  getPageMarkdownUrl,
  type PageWithSource,
} from './source.server';

const OPENAPI_TAB = 'api-reference';
const DEVICE_KIT_PATH_ENTRY_SLUG = 'quickstart-device-kit';
const CONVERSATIONAL_AI_PATH_ENTRY_SLUG = 'quickstart-coding';
const RECIPES_PATH_ENTRY_SLUG = 'voice-ai-recipes';
const RECIPES_ROOT_SLUG = 'recipes';

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
    en: '/en/ai/apps/best-practices/regional-restrictions',
    'zh-CN': '/zh-CN/ai/best-practices/regional-restrictions',
  },
  'http-basic-auth': {
    'zh-CN': '/zh-CN/api-reference/conversational-ai/rest-api/authentication',
  },
  'release-notes': {
    'zh-CN': '/zh-CN/ai/release-notes',
  },
};

export async function loadDocsTabIndex(locale: string, tab: string) {
  const { source } = await import('./source.server');
  const pageTree = source.getPageTree(locale);
  const tabSummaries = getTabSummaries(pageTree);
  const tabSummary = tabSummaries.find((item) => item.id === tab);

  if (tabSummary?.url === `/${locale}/${tab}`) {
    return {
      locale,
      url: tabSummary.url,
      tab,
    };
  }

  const firstPageUrl = getFirstTabPageUrl(pageTree, tab);

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
) {
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

  const slug = slugSegments.at(-1) ?? 'index';
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug,
      slugSegments,
      tab,
    }),
    locale,
  );

  if (!page) {
    const pageTree = source.getPageTree(locale);
    const fallbackUrl = getFirstChildPageUrl(pageTree, tab, slugSegments);

    if (fallbackUrl) {
      return {
        redirectUrl: fallbackUrl,
      };
    }

    return null;
  }

  const pageTree = source.getPageTree(locale);
  const supportedLocale = toSupportedLocale(locale);
  const isOpenApiPage = isOpenApiPageWithClientProps(page);
  const openApiRoute =
    isOpenApiPage && supportedLocale
      ? resolveOpenApiEndpointRoute(supportedLocale, tab, slugSegments)
      : null;
  const processedText = isOpenApiPage ? '' : await readProcessedText(page);
  const structuredPlatformTabs = extractStructuredPlatformTabs(processedText);
  const toc = isOpenApiPage
    ? normalizeToc(getPageToc(page))
    : await resolvePageToc(page, processedText);
  const layoutMode = isOpenApiPage ? ('openapi' as const) : ('docs' as const);
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
  const pages = getDocsPages({
    locale: supportedLocale,
    pages: source.getPages(locale).map((item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    })),
    tab,
  });
  const mdxBody = {
    contentPath: page.path,
    kind: 'mdx' as const,
    ...(structuredPlatformTabs
      ? {
          platformTabs: {
            canonicalPlatform: structuredPlatformTabs.canonicalPlatform,
            platforms: JSON.stringify(structuredPlatformTabs.platforms),
          },
        }
      : {}),
  };

  return {
    activePath: page.url,
    activeTab: tab,
    body: isOpenApiPage
      ? {
          kind: 'openapi' as const,
          pageProps: await page.data.getClientAPIPageProps(),
        }
      : mdxBody,
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
    markdownUrl: getPageMarkdownUrl(page).url,
    layoutMode,
    localeLinks: SUPPORTED_LOCALES.map((targetLocale) => {
      const targetPage = source.getPage(page.slugs.slice(1), targetLocale);
      const targetTabEntry = getFirstTabPageUrl(
        source.getPageTree(targetLocale),
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
    pages,
    sidebar,
    sidebarHeader,
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
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

  const buildRedirects: Record<string, string> = {
    'device-kit/build/run-the-r1-demo':
      `/${locale}/ai/device-kit/build/baseline-bring-up/run-the-r1-demo`,
    'device-kit/build/run-the-demo-server':
      `/${locale}/ai/device-kit/build/baseline-bring-up/run-the-demo-server`,
    'device-kit/build/demo-server-apis':
      `/${locale}/ai/device-kit/build/baseline-bring-up/demo-server-apis`,
    'device-kit/build/configure-device-network':
      `/${locale}/ai/device-kit/build/device-setup/configure-device-network`,
    'device-kit/build/device-controls':
      `/${locale}/ai/device-kit/build/device-setup/device-controls`,
    'device-kit/build/build-and-flash-firmware':
      `/${locale}/ai/device-kit/build/firmware-integration/build-and-flash-firmware`,
    'device-kit/build/architecture-overview':
      `/${locale}/ai/device-kit/build/system-architecture/architecture-overview`,
    'device-kit/build/specifications-and-compatibility':
      `/${locale}/ai/device-kit/build/system-architecture/specifications-and-compatibility`,
  };

  if (buildRedirects[normalizedPath]) {
    return buildRedirects[normalizedPath];
  }

  return null;
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
  const legacyConversationalAiRestRedirect =
    resolveLegacyConversationalAiRestRedirect(locale, normalizedPath);
  if (legacyConversationalAiRestRedirect) {
    return legacyConversationalAiRestRedirect;
  }

  if (normalizedPath === RECIPES_PATH_ENTRY_SLUG) {
    return `/${locale}/${OPENAPI_TAB}/${RECIPES_ROOT_SLUG}`;
  }

  return null;
}

function resolveLegacyConversationalAiRestRedirect(
  locale: string,
  normalizedPath: string,
) {
  const prefix = 'conversational-ai/rest-api';

  if (normalizedPath === prefix) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai`
      : null;
  }

  if (normalizedPath === `${prefix}/authentication`) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai/authentication`
      : null;
  }

  if (normalizedPath === `${prefix}/status-codes`) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai/status-codes`
      : null;
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
    'build/event-types': `/${locale}/ai/reference/event-types`,
  };

  return redirects[normalizedPath] ?? null;
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

  const redirects: Record<string, string> = {
    'rtc/quick-start': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/integrate-with-ai-tools': `/${locale}/realtime-media/rtc/quick-start/android/integrate-with-ai-tools`,
    'rtc/quick-start/build-from-scratch': `/${locale}/realtime-media/rtc/quick-start/android/build-from-scratch`,
  };

  return redirects[normalizedPath] ?? null;
}

function hasDocsPageForUrl(source: typeof docsSource, url: string) {
  const [locale, tab, ...slugSegments] = url.split('/').filter(Boolean);
  const slug = slugSegments.at(-1) ?? 'index';

  if (!locale || !tab) {
    return false;
  }

  return Boolean(
    source.getPage(
      getSourceSlugs({
        locale,
        slug,
        slugSegments,
        tab,
      }),
      locale,
    ),
  );
}

export type DocsPagePayload = Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | { redirectUrl: string }
>;

async function readProcessedText(page: PageWithSource) {
  try {
    if (!hasProcessedText(page)) {
      return '';
    }

    return await page.data.getText('processed');
  } catch {
    return '';
  }
}

async function resolvePageToc(page: PageWithSource, processedText: string) {
  const directToc = normalizeToc(getPageToc(page));

  if (directToc.length > 0) {
    return directToc;
  }

  try {
    return normalizeToc(
      await getTableOfContents(buildCanonicalPlatformTocText(processedText)),
    );
  } catch {
    return [];
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

function hasProcessedText(page: PageWithSource): page is PageWithSource & {
  data: { getText: (kind: 'processed') => Promise<string> };
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

  if (!isOpenApiTab(tab) || !locale) {
    return sidebar;
  }

  const openApiSidebar = await addOpenApiEndpointSidebarItems(
    sidebar,
    locale,
    tab,
  );

  if (
    activePath?.startsWith('/en/api-reference/recipes') ||
    activePath?.startsWith('/zh-CN/api-reference/recipes')
  ) {
    return restoreRecipesSidebarSections(openApiSidebar);
  }

  return openApiSidebar;
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

function getDocsPages({
  locale,
  pages,
  tab,
}: {
  locale: AppLocale | null;
  pages: {
    description?: string;
    title: string;
    url: string;
  }[];
  tab: string;
}) {
  if (!isOpenApiTab(tab) || !locale) {
    return pages;
  }

  const existingUrls = new Set(pages.map((page) => page.url));
  const endpointPages = getOpenApiLanes()
    .filter(
      (lane) =>
        lane.tab === tab &&
        getOpenApiLaneLocales(lane).includes(locale as AppLocale),
    )
    .flatMap((lane) =>
      getOpenApiOperationIds(lane).map((operationId) => ({
        title: lane.operations[operationId].title[locale],
        url: getOpenApiEndpointUrl(lane, locale, operationId),
      })),
    )
    .filter((page) => !existingUrls.has(page.url));

  return [...pages, ...endpointPages];
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
      children.some(
        (child) =>
          child.type === 'page' && child.url === item.parentUrl[locale],
      ),
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
