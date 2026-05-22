import type { DocsContentBody } from '@/components/docs-shell/DocsContent';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import { buildOpenApiSchemaRows } from './schema-tree';
import { createOpenApiExamples } from './examples';
import { resolveOpenApiEndpointRoute } from './lanes';
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
  const responseSchemaRows = Object.fromEntries(
    Object.entries(operation.responses).map(([status, response]) => [
      status,
      buildOpenApiSchemaRows(response.content?.['application/json']?.schema, {
        usage: 'response',
      }),
    ]),
  );
  const body: DocsContentBody = {
    kind: 'openapi',
    operationPayload: {
      examples: createOpenApiExamples(operation),
      operation,
      publicSourceUrl: route.lane.publicSourceUrl,
      requestSchemaRows: buildOpenApiSchemaRows(requestSchema, {
        usage: 'request',
      }),
      responseSchemaRows,
    },
  };

  return {
    activePath: route.url,
    body,
    contentPath: `${locale}/${tab}/${slugSegments.join('/')}.md`,
    description: description ?? undefined,
    lane: route.lane,
    layoutMode: 'openapi' as const,
    markdownUrl: `/llms.mdx/docs/${locale}/${tab}/${slugSegments.join('/')}.md`,
    operationId: route.operationId,
    slug: route.routeLeaf,
    title,
    toc: [],
  };
}

export type OpenApiEndpointPagePayload = Exclude<
  Awaited<ReturnType<typeof loadOpenApiEndpointPage>>,
  null
>;

function isSupportedLocale(locale: string): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}
