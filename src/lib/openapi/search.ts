import type { SortedResult } from 'fumadocs-core/search';
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
} from './lanes';
import { buildOpenApiSchemaTree } from './schema-tree';
import { getOpenApiOperations } from './source.server';

export type OpenApiSearchDocument = SortedResult<string>;

export async function getOpenApiSearchDocuments(): Promise<
  OpenApiSearchDocument[]
> {
  const laneOperations = await Promise.all(
    getOpenApiLanes().map(async (lane) => ({
      lane,
      operations: await getOpenApiOperations(lane),
    })),
  );

  return laneOperations.flatMap(({ lane, operations }) =>
    (['en', 'zh-CN'] as const).flatMap((locale) =>
      getOpenApiOperationIds(lane).flatMap((operationId) => {
        const operation = operations.find(
          (item) => item.operationId === operationId,
        );

        if (!operation) {
          return [];
        }

        const url = getOpenApiEndpointUrl(lane, locale, operationId);
        const title = lane.operations[operationId].title[locale];
        const content = [
          title,
          operation.operationId,
          operation.method,
          operation.path,
          operation.summary,
          operation.description,
          ...operation.parameters.map((parameter) =>
            [parameter.name, parameter.in, parameter.description]
              .filter(Boolean)
              .join(' '),
          ),
          ...schemaFieldPaths(
            operation.requestBody?.content['application/json']?.schema,
          ),
          ...Object.keys(operation.responses),
        ]
          .filter(Boolean)
          .join('\n');

        return [
          {
            breadcrumbs: [
              locale === 'zh-CN' ? 'API 参考' : 'API Reference',
              lane.parentUrl[locale],
            ],
            content,
            id: `${locale}-${operation.operationId}`,
            type: 'page' as const,
            url,
          },
        ];
      }),
    ),
  );
}

export async function searchOpenApiDocuments(
  query: string,
  locale?: string | null,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return (await getOpenApiSearchDocuments())
    .filter((document) => !locale || document.id.startsWith(`${locale}-`))
    .filter((document) =>
      `${document.content}\n${document.url}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
}

function schemaFieldPaths(schema: unknown) {
  return buildOpenApiSchemaTree(schema).flatMap(flattenSchemaNode);
}

function flattenSchemaNode(node: {
  children: (typeof node)[];
  path: string;
}): string[] {
  return [node.path, ...node.children.flatMap(flattenSchemaNode)];
}
