import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import {
  type DocsNavScopeResolution,
  getNavScopeSidebarNodes,
  getScopedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { getSourceSlugs } from './docs-routing';
import {
  type DocsSidebarNode,
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinksFromNode,
  getSidebarBreadcrumb,
  getTabSummaries,
} from './docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
} from './openapi/lanes';
import { getOpenApiOperation } from './openapi/source.server';
import {
  type source as docsSource,
  getPageMarkdownUrl,
  type PageWithSource,
} from './source.server';

const OPENAPI_TAB = 'api-reference';
const DEVICE_KIT_PATH_ENTRY_SLUG = 'quickstart-device-kit';
const RECIPES_PATH_ENTRY_SLUG = 'voice-ai-recipes';
const RECIPES_ROOT_SLUG = 'recipes';

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
  const processedText = isOpenApiPage ? '' : await readProcessedText(page);
  const toc = isOpenApiPage
    ? normalizeToc(getPageToc(page))
    : await resolvePageToc(page, processedText);
  const layoutMode = isOpenApiPage ? ('openapi' as const) : ('docs' as const);
  const sidebar = await getDocsSidebarNodes({
    activePath: page.url,
    locale: supportedLocale,
    pageTree,
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
  const sidebarHeader = navScope?.header;

  return {
    activePath: page.url,
    activeTab: tab,
    body: isOpenApiPage
      ? {
          kind: 'openapi' as const,
          pageProps: await page.data.getClientAPIPageProps(),
        }
      : {
          contentPath: page.path,
          kind: 'mdx' as const,
        },
    breadcrumb:
      breadcrumb.length > 0
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
    navigation: getPrevNextLinksFromNode(
      navScope?.sidebarRoot ?? pageTree,
      page.url,
    ),
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

  if (normalizedPath === `choose-your-path/${DEVICE_KIT_PATH_ENTRY_SLUG}`) {
    return `/${locale}/ai/device-kit`;
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
    'device-kit/overview/pricing': `/${locale}/ai/device-kit/plan-rollout/pricing`,
    'device-kit/overview/release-notes': `/${locale}/ai/device-kit/plan-rollout/release-notes`,
    'device-kit/start-here/enable-services': `/${locale}/ai/device-kit/reference/enable-services`,
  };

  return redirects[normalizedPath] ?? null;
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

  if (normalizedPath === RECIPES_PATH_ENTRY_SLUG) {
    return `/${locale}/${OPENAPI_TAB}/${RECIPES_ROOT_SLUG}`;
  }

  return null;
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
    'build/code-first-architecture': `/${locale}/ai/build/architecture`,
    'build/event-types': `/${locale}/ai/reference/event-types`,
    'reference/code-first-architecture': `/${locale}/ai/build/architecture`,
    'reference/architecture': `/${locale}/ai/build/architecture`,
    'best-practices/filler-words': `/${locale}/ai/build/filler-words`,
  };

  return redirects[normalizedPath] ?? null;
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
    return normalizeToc(await getTableOfContents(processedText));
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
  source,
  tab,
}: {
  activePath?: string;
  locale: AppLocale | null;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  source: typeof docsSource;
  tab: string;
}) {
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

  if (tab !== OPENAPI_TAB || !locale) {
    return sidebar;
  }

  return addOpenApiEndpointSidebarItems(sidebar, locale, tab);
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
  if (tab !== OPENAPI_TAB || !locale) {
    return pages;
  }

  const existingUrls = new Set(pages.map((page) => page.url));
  const endpointPages = getOpenApiLanes()
    .filter((lane) => lane.tab === tab)
    .flatMap((lane) =>
      getOpenApiOperationIds(lane).map((operationId) => ({
        title: lane.operations[operationId].title[locale],
        url: getOpenApiEndpointUrl(lane, locale, operationId),
      })),
    )
    .filter((page) => !existingUrls.has(page.url));

  return [...pages, ...endpointPages];
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
    return node;
  }

  const lane = getOpenApiLanes().find(
    (item) =>
      item.tab === tab &&
      node.children.some(
        (child) =>
          child.type === 'page' && child.url === item.parentUrl[locale],
      ),
  );

  if (lane) {
    const existingUrls = new Set(
      node.children.flatMap((child) =>
        child.type === 'page' ? [child.url] : [],
      ),
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
      children: [...node.children, ...endpointPages],
    };
  }

  return {
    ...node,
    children: await Promise.all(
      node.children.map((child) =>
        appendEndpointPagesToOpenApiParent(child, locale, tab),
      ),
    ),
  };
}
