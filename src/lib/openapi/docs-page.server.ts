import type { DocsContentBody } from '@/components/docs-shell/DocsContent';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import { resolveOpenApiEndpointRoute } from './lanes';
import { buildOpenApiSchemaTree } from './schema-tree';
import { getOpenApiOperation } from './source.server';

export async function loadOpenApiEndpointPage(
  locale: string,
  tab: string,
  slugSegments: string[],
) {
  if (!isSupportedLocale(locale)) {
    return null;
  }

  const route = resolveOpenApiEndpointRoute(locale, tab, slugSegments);
  if (!route) {
    return null;
  }

  const operation = await getOpenApiOperation(route.lane, route.operationId);
  const title =
    route.lane.operations[route.operationId].title[locale] ??
    operation.summary ??
    operation.operationId;
  const description = operation.summary ?? operation.description;
  const requestSchema =
    operation.requestBody?.content['application/json']?.schema;
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
      publicSourceUrl: route.lane.publicSourceUrl,
      requestSchemaTree: buildOpenApiSchemaTree(requestSchema),
      responseSchemaTrees,
    },
  };

  return {
    activePath: route.url,
    body,
    contentPath: `${locale}/${tab}/${slugSegments.join('/')}.md`,
    description: description ?? undefined,
    lane: route.lane,
    markdownUrl: `/llms.mdx/docs/${locale}/${tab}/${slugSegments.join('/')}.md`,
    operationId: route.operationId,
    slug: route.routeLeaf,
    title,
    toc: getOpenApiToc(operation),
  };
}

export type OpenApiEndpointPagePayload = Exclude<
  Awaited<ReturnType<typeof loadOpenApiEndpointPage>>,
  null
>;

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
