import { getTableOfContents } from 'fumadocs-core/content/toc';
import type { TOCItemType } from 'fumadocs-core/toc';
import { getSourceSlugs } from './docs-routing';
import {
  type DocsSidebarNode,
  getFirstChildPageUrl,
  getFirstTabPageUrl,
  getPrevNextLinks,
  getSidebarBreadcrumb,
  getSidebarNodes,
  getTabSummaries,
} from './docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  CONVERSATIONAL_AI_OPERATION_TITLES,
  getConversationalAiEndpointUrl,
  getConversationalAiOperationIds,
  type ConversationalAiOperationId,
} from './openapi/conversational-ai';
import {
  loadOpenApiEndpointPage,
  type OpenApiEndpointPagePayload,
} from './openapi/docs-page.server';
import {
  getPageMarkdownUrl,
  source as docsSource,
  type PageWithSource,
} from './source.server';

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
    const openApiPage = await loadOpenApiEndpointPage(
      locale,
      tab,
      slugSegments,
    );

    if (openApiPage) {
      const openApiLocale = toSupportedLocale(locale);
      if (!openApiLocale) {
        return null;
      }

      const pageTree = source.getPageTree(locale);
      const pages = source.getPages(locale).map((item) => ({
        description: item.data.description,
        title: item.data.title ?? item.slugs.at(-1) ?? item.url,
        url: item.url,
      }));

      return buildOpenApiDocsPagePayload({
        locale: openApiLocale,
        openApiPage,
        pageTree,
        pages,
        tab,
      });
    }

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
  const processedText = await readProcessedText(page);
  const toc = await resolvePageToc(page, processedText);
  const sidebar = getSidebarNodes(pageTree, tab);
  const title = page.data.title ?? page.slugs.at(-1) ?? page.url;
  const breadcrumb = getSidebarBreadcrumb(sidebar, page.url);

  return {
    activePath: page.url,
    activeTab: tab,
    body: {
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
        `/${targetLocale}/introduction/about-agora`;

      return {
        href: targetUrl,
        isActive: targetLocale === locale,
        locale: targetLocale,
      };
    }),
    navigation: getPrevNextLinks(pageTree, page.url),
    pages: source.getPages(locale).map((item) => ({
      description: item.data.description,
      title: item.data.title ?? item.slugs.at(-1) ?? item.url,
      url: item.url,
    })),
    sidebar,
    slug: page.slugs.at(-1),
    tabs: getTabSummaries(pageTree),
    title: page.data.title,
    toc,
  };
}

export type DocsPagePayload = Exclude<
  Awaited<ReturnType<typeof loadDocsPagePayload>>,
  null | { redirectUrl: string }
>;

async function readProcessedText(page: PageWithSource) {
  try {
    return await page.data.getText('processed');
  } catch {
    return '';
  }
}

async function resolvePageToc(page: PageWithSource, processedText: string) {
  const directToc = normalizeToc(page.data.toc);

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

function toSupportedLocale(locale: string): AppLocale | null {
  return SUPPORTED_LOCALES.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : null;
}

function buildOpenApiDocsPagePayload({
  locale,
  openApiPage,
  pageTree,
  pages,
  tab,
}: {
  locale: AppLocale;
  openApiPage: OpenApiEndpointPagePayload;
  pageTree: ReturnType<typeof docsSource.getPageTree>;
  pages: {
    description?: string;
    title: string;
    url: string;
  }[];
  tab: string;
}) {
  const sidebar = addConversationalAiEndpointSidebarItems(
    getSidebarNodes(pageTree, tab),
    locale,
  );
  const breadcrumb = getSidebarBreadcrumb(sidebar, openApiPage.activePath);

  return {
    ...openApiPage,
    activeTab: tab,
    breadcrumb:
      breadcrumb.length > 0
        ? breadcrumb
        : [
            {
              title: openApiPage.title,
              url: openApiPage.activePath,
            },
          ],
    localeLinks: SUPPORTED_LOCALES.map((targetLocale) => ({
      href: getConversationalAiEndpointUrl(
        targetLocale,
        openApiPage.operationId,
      ),
      isActive: targetLocale === locale,
      locale: targetLocale,
    })),
    navigation: getOpenApiPrevNextLinks(locale, openApiPage.operationId),
    pages: [
      ...pages,
      ...getConversationalAiOperationIds().map((operationId) => ({
        title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId],
        url: getConversationalAiEndpointUrl(locale, operationId),
      })),
    ],
    sidebar,
    tabs: getTabSummaries(pageTree),
  };
}

function addConversationalAiEndpointSidebarItems(
  sidebar: DocsSidebarNode[],
  locale: AppLocale,
): DocsSidebarNode[] {
  return sidebar.map((node) =>
    appendEndpointPagesToAgentSection(node, locale),
  );
}

function appendEndpointPagesToAgentSection(
  node: DocsSidebarNode,
  locale: AppLocale,
): DocsSidebarNode {
  if (node.type !== 'section') {
    return node;
  }

  if (isConversationalAiAgentSection(node, locale)) {
    const existingUrls = new Set(
      node.children.flatMap((child) => (child.type === 'page' ? [child.url] : [])),
    );
    const endpointPages: DocsSidebarNode[] = getConversationalAiOperationIds()
      .map((operationId) => ({
        id: getConversationalAiEndpointUrl(locale, operationId),
        title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId],
        type: 'page' as const,
        url: getConversationalAiEndpointUrl(locale, operationId),
      }))
      .filter((item) => !existingUrls.has(item.url));

    return {
      ...node,
      children: [...node.children, ...endpointPages],
    };
  }

  return {
    ...node,
    children: node.children.map((child) =>
      appendEndpointPagesToAgentSection(child, locale),
    ),
  };
}

function isConversationalAiAgentSection(
  node: Extract<DocsSidebarNode, { type: 'section' }>,
  locale: AppLocale,
) {
  const agentIndexUrl = `/${locale}/api-reference/conversational-ai/rest-api/agent`;

  return (
    node.id ===
      'folder-api-reference-conversational-ai-rest-api-agent-folder' ||
    node.id === agentIndexUrl ||
    node.children.some(
      (child) => child.type === 'page' && child.url === agentIndexUrl,
    )
  );
}

function getOpenApiPrevNextLinks(
  locale: AppLocale,
  operationId: ConversationalAiOperationId,
) {
  const operationIds = getConversationalAiOperationIds();
  const index = operationIds.indexOf(operationId);
  const previous = operationIds[index - 1];
  const next = operationIds[index + 1];

  return {
    next: next
      ? {
          title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][next],
          url: getConversationalAiEndpointUrl(locale, next),
        }
      : undefined,
    previous: previous
      ? {
          title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][previous],
          url: getConversationalAiEndpointUrl(locale, previous),
        }
      : undefined,
  };
}
