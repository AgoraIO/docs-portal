import type { DocsContentBody } from '@/components/docs-shell/DocsContent';
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
    body,
    contentPath: `${locale}/${API_TAB}/${slugSegments.join('/')}.md`,
    description: description ?? undefined,
    markdownUrl: `/llms.mdx/docs/${locale}/${API_TAB}/${slugSegments.join('/')}.md`,
    operationId,
    slug: routeLeaf,
    title,
    toc: getOpenApiToc(operation),
  };
}

export type OpenApiEndpointPagePayload = Exclude<
  Awaited<ReturnType<typeof loadOpenApiEndpointPage>>,
  null
>;

function matchesRoutePrefix(slugSegments: string[]) {
  if (slugSegments.length !== ROUTE_PREFIX_SEGMENTS.length + 1) {
    return false;
  }

  return ROUTE_PREFIX_SEGMENTS.every(
    (segment, index) => slugSegments[index] === segment,
  );
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
