import type { SortedResult } from 'fumadocs-core/search';
import {
  CONVERSATIONAL_AI_OPERATION_TITLES,
  getConversationalAiEndpointUrl,
  getConversationalAiOperationIds,
} from './conversational-ai';
import { buildOpenApiSchemaTree } from './schema-tree';
import { getConversationalAiOperations } from './source.server';

export type OpenApiSearchDocument = SortedResult<string>;

export async function getOpenApiSearchDocuments(): Promise<
  OpenApiSearchDocument[]
> {
  const operations = await getConversationalAiOperations();

  return (['en', 'zh-CN'] as const).flatMap((locale) =>
    getConversationalAiOperationIds().flatMap((operationId) => {
      const operation = operations.find(
        (item) => item.operationId === operationId,
      );

      if (!operation) {
        return [];
      }

      const url = getConversationalAiEndpointUrl(locale, operationId);
      const title = CONVERSATIONAL_AI_OPERATION_TITLES[locale][operationId];
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
        ...schemaFieldPaths(operation.requestBody?.content['application/json']?.schema),
        ...Object.keys(operation.responses),
      ]
        .filter(Boolean)
        .join('\n');

      return [
        {
          breadcrumbs: [
            locale === 'zh-CN' ? 'API 参考' : 'API Reference',
            locale === 'zh-CN' ? '对话式 AI' : 'Conversational AI',
            'REST API',
            locale === 'zh-CN' ? '智能体管理' : 'Agent management',
          ],
          content,
          id: `${locale}-${operation.operationId}`,
          type: 'page' as const,
          url,
        },
      ];
    }),
  );
}

export async function searchOpenApiDocuments(query: string, locale?: string | null) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return (await getOpenApiSearchDocuments())
    .filter((document) => !locale || document.id.startsWith(`${locale}-`))
    .filter((document) =>
      `${document.content}\n${document.url}`.toLowerCase().includes(normalizedQuery),
    );
}

function schemaFieldPaths(schema: unknown) {
  return buildOpenApiSchemaTree(schema).flatMap(flattenSchemaNode);
}

function flattenSchemaNode(node: { children: typeof node[]; path: string }): string[] {
  return [node.path, ...node.children.flatMap(flattenSchemaNode)];
}
