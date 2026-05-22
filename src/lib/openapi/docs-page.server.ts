import type { DocsContentBody } from '@/components/docs-shell/DocsContent';
import type {
  DocsBreadcrumbItem,
  DocsSidebarNode,
  TabSummary,
} from '@/lib/docs-tree';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import {
  CONVERSATIONAL_AI_OPERATION_ROUTES,
  CONVERSATIONAL_AI_OPERATION_TITLES,
  CONVERSATIONAL_AI_PUBLIC_OPENAPI_URL,
  getConversationalAiEndpointUrl,
  getConversationalAiOperationIdByRouteLeaf,
  getConversationalAiOperationIds,
} from './conversational-ai';
import { buildOpenApiSchemaTree } from './schema-tree';
import { getConversationalAiOperation } from './source.server';

const API_TAB = 'api-reference';
const ROUTE_PREFIX_SEGMENTS = ['conversational-ai', 'rest-api', 'agent'];

export async function loadOpenApiEndpointPage(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (!isSupportedLocale(locale) || tab !== API_TAB) {
    return null;
  }

  if (!matchesRoutePrefix(slugSegments)) {
    return null;
  }

  const routeLeaf = slugSegments[ROUTE_PREFIX_SEGMENTS.length];
  const operationId = routeLeaf
    ? getConversationalAiOperationIdByRouteLeaf(routeLeaf)
    : undefined;

  if (!operationId) {
    return null;
  }

  const operation = await getConversationalAiOperation(operationId);
  const url = getConversationalAiEndpointUrl(locale, operationId);
  const title =
    CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId] ??
    operation.summary ??
    operation.operationId;
  const description = operation.summary ?? operation.description;
  const requestSchema = operation.requestBody?.content['application/json']?.schema;
  const responseSchemaTrees = Object.fromEntries(
    Object.entries(operation.responses).map(([status, response]) => [
      status,
      buildOpenApiSchemaTree(response.content?.['application/json']?.schema),
    ]),
  );
  const body: DocsContentBody = {
    kind: 'openapi',
    operationPayload: {
      operation,
      publicSourceUrl: CONVERSATIONAL_AI_PUBLIC_OPENAPI_URL,
      requestSchemaTree: buildOpenApiSchemaTree(requestSchema),
      responseSchemaTrees,
    },
  };

  return {
    activePath: url,
    activeTab: API_TAB,
    body,
    breadcrumb: getEndpointBreadcrumb(locale, title),
    contentPath: `${locale}/${API_TAB}/${slugSegments.join('/')}.md`,
    description: description ?? undefined,
    localeLinks: SUPPORTED_LOCALES.map((targetLocale) => ({
      href: getConversationalAiEndpointUrl(targetLocale, operationId),
      isActive: targetLocale === locale,
      locale: targetLocale,
    })),
    markdownUrl: `/llms.mdx/docs/${locale}/${API_TAB}/${slugSegments.join('/')}.md`,
    navigation: getEndpointNavigation(locale, operationId),
    pages: getEndpointPages(locale),
    sidebar: getApiReferenceSidebar(locale),
    slug: routeLeaf,
    tabs: getTabs(locale),
    title,
    toc: getOpenApiToc(operation),
  };
}

function matchesRoutePrefix(slugSegments: string[]) {
  if (slugSegments.length !== ROUTE_PREFIX_SEGMENTS.length + 1) {
    return false;
  }

  return ROUTE_PREFIX_SEGMENTS.every(
    (segment, index) => slugSegments[index] === segment,
  );
}

function getEndpointBreadcrumb(
  locale: AppLocale,
  title: string,
): DocsBreadcrumbItem[] {
  if (locale === 'zh-CN') {
    return [
      { title: 'API 参考', url: '/zh-CN/api-reference' },
      {
        title: '对话式 AI',
        url: '/zh-CN/api-reference/conversational-ai',
      },
      {
        title: 'REST API',
        url: '/zh-CN/api-reference/conversational-ai/rest-api',
      },
      {
        title: '智能体管理',
        url: '/zh-CN/api-reference/conversational-ai/rest-api/agent',
      },
      { title },
    ];
  }

  return [
    { title: 'API Reference', url: '/en/api-reference' },
    {
      title: 'Conversational AI',
      url: '/en/api-reference/conversational-ai',
    },
    {
      title: 'REST API',
      url: '/en/api-reference/conversational-ai/rest-api',
    },
    {
      title: 'Agent management',
      url: '/en/api-reference/conversational-ai/rest-api/agent',
    },
    { title },
  ];
}

function getEndpointNavigation(
  locale: AppLocale,
  operationId: keyof typeof CONVERSATIONAL_AI_OPERATION_ROUTES,
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

function getEndpointPages(locale: AppLocale) {
  return getConversationalAiOperationIds().map((operationId) => ({
    title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId],
    url: getConversationalAiEndpointUrl(locale, operationId),
  }));
}

function getApiReferenceSidebar(locale: AppLocale): DocsSidebarNode[] {
  const isZh = locale === 'zh-CN';

  return [
    {
      children: [
        {
          id: `/${locale}/api-reference/conversational-ai`,
          title: isZh ? '总览' : 'Overview',
          type: 'page',
          url: `/${locale}/api-reference/conversational-ai`,
        },
        {
          children: [
            {
              id: `/${locale}/api-reference/conversational-ai/rest-api`,
              title: isZh ? '总览' : 'Overview',
              type: 'page',
              url: `/${locale}/api-reference/conversational-ai/rest-api`,
            },
            {
              children: [
                {
                  id: `/${locale}/api-reference/conversational-ai/rest-api/agent`,
                  title: isZh ? '总览' : 'Overview',
                  type: 'page',
                  url: `/${locale}/api-reference/conversational-ai/rest-api/agent`,
                },
                ...getConversationalAiOperationIds().map((operationId) => ({
                  id: getConversationalAiEndpointUrl(locale, operationId),
                  title: CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId],
                  type: 'page' as const,
                  url: getConversationalAiEndpointUrl(locale, operationId),
                })),
              ],
              collapsible: true,
              id: `/${locale}/api-reference/conversational-ai/rest-api/agent`,
              title: isZh ? '智能体管理' : 'Agent management',
              type: 'section',
            },
          ],
          collapsible: true,
          id: `/${locale}/api-reference/conversational-ai/rest-api`,
          title: 'REST API',
          type: 'section',
        },
      ],
      collapsible: true,
      id: `/${locale}/api-reference/conversational-ai`,
      title: isZh ? '对话式 AI' : 'Conversational AI',
      type: 'section',
    },
  ];
}

function getTabs(locale: AppLocale): TabSummary[] {
  return [
    {
      id: API_TAB,
      title: locale === 'zh-CN' ? 'API 参考' : 'API Reference',
      url: `/${locale}/${API_TAB}`,
    },
  ];
}

function getOpenApiToc(operation: { requestBody?: unknown }) {
  const toc: { depth: number; title: string; url: string }[] = [
    { depth: 2, title: 'Servers', url: '#servers' },
    { depth: 2, title: 'Parameters', url: '#parameters' },
  ];

  if (operation.requestBody) {
    toc.push({ depth: 2, title: 'Request body', url: '#request-body' });
  }

  toc.push({ depth: 2, title: 'Responses', url: '#responses' });

  return toc;
}

function isSupportedLocale(locale: string): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}
