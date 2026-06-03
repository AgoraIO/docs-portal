import type { AppLocale } from '@/lib/i18n/i18n-config';
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
  resolveOpenApiEndpointRoute,
} from './lanes';
import {
  buildOpenApiSchemaTree,
  type OpenApiSchemaTreeNode,
} from './schema-tree';
import {
  getOpenApiOperation,
  getOpenApiOperations,
  type NormalizedOpenApiOperation,
} from './source.server';

export function serializeOpenApiOperationMarkdown({
  operation,
  publicSourceUrl,
  title,
  url,
}: {
  locale: AppLocale;
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
  title: string;
  url: string;
}) {
  const lines = [
    `# ${title} (${url})`,
    '',
    operation.description ?? operation.summary ?? '',
    '',
    `- OpenAPI: ${publicSourceUrl}`,
    `- Operation ID: ${operation.operationId}`,
    `- Method: ${operation.method}`,
    `- Path: ${operation.path}`,
  ].filter((line, index, array) => line.length > 0 || array[index - 1] !== '');

  if (operation.servers.length > 0) {
    lines.push('', '## Servers', '');
    for (const server of operation.servers) {
      lines.push(`- ${server.url}`);
    }
  }

  lines.push('', '## Parameters', '');
  if (operation.parameters.length > 0) {
    for (const parameter of operation.parameters) {
      lines.push(parameterToMarkdown(parameter));
    }
  } else {
    lines.push('No parameters.');
  }

  lines.push('', '## Request body', '');
  const requestSchema =
    operation.requestBody?.content['application/json']?.schema;
  if (requestSchema) {
    lines.push(...schemaTreeToMarkdown(buildOpenApiSchemaTree(requestSchema)));
  } else {
    lines.push('No request body.');
  }

  lines.push('', '## Responses', '');
  for (const [status, response] of Object.entries(operation.responses)) {
    lines.push(`### ${status}`, '');
    if (response.description) {
      lines.push(response.description, '');
    }
    lines.push(
      ...schemaTreeToMarkdown(
        buildOpenApiSchemaTree(response.content?.['application/json']?.schema),
      ),
    );
  }

  return `${lines.join('\n').trim()}\n`;
}

export async function getOpenApiMarkdownPages() {
  const pages = await Promise.all(
    getOpenApiLanes().flatMap((lane) =>
      (['en', 'zh-CN'] as const).map(async (locale) => {
        const operations = await getOpenApiOperations(lane, locale);

        return { lane, locale, operations };
      }),
    ),
  );

  return pages.flatMap(({ lane, locale, operations }) =>
    getOpenApiOperationIds(lane).flatMap((operationId) => {
      const operation = operations.find(
        (item) => item.operationId === operationId,
      );

      if (!operation) {
        return [];
      }

      const url = getOpenApiEndpointUrl(lane, locale, operationId);
      const title = lane.operations[operationId].title[locale];

      return [
        {
          markdown: serializeOpenApiOperationMarkdown({
            locale,
            operation,
            publicSourceUrl: lane.publicSourceUrl[locale],
            title,
            url,
          }),
          title,
          url,
        },
      ];
    }),
  );
}

export async function getOpenApiMarkdownByContentPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (
    (locale !== 'en' && locale !== 'zh-CN') ||
    tab !== 'api-reference' ||
    fileName?.endsWith('.md') !== true
  ) {
    return null;
  }

  const slugSegments = rest.slice(0, -1).concat(fileName.replace(/\.md$/, ''));
  const route = resolveOpenApiEndpointRoute(locale, tab, slugSegments);

  if (!route) {
    return null;
  }

  const operation = await getOpenApiOperation(
    route.lane,
    route.operationId,
    locale,
  );
  const title = route.lane.operations[route.operationId].title[locale];

  return serializeOpenApiOperationMarkdown({
    locale,
    operation,
    publicSourceUrl: route.lane.publicSourceUrl[locale],
    title,
    url: route.url,
  });
}

function parameterToMarkdown(parameter: Record<string, unknown>) {
  const name =
    typeof parameter.name === 'string' ? parameter.name : 'parameter';
  const location = typeof parameter.in === 'string' ? parameter.in : 'unknown';
  const required = parameter.required === true ? 'required' : 'optional';
  const description =
    typeof parameter.description === 'string'
      ? ` - ${parameter.description}`
      : '';

  return `- \`${name}\` (${location}, ${required})${description}`;
}

function schemaTreeToMarkdown(
  nodes: OpenApiSchemaTreeNode[],
  depth = 0,
): string[] {
  if (nodes.length === 0) {
    return ['No schema.'];
  }

  return nodes.flatMap((node) => {
    const indent = '  '.repeat(depth);
    const required = node.required ? ', required' : '';
    const description = node.description ? ` - ${node.description}` : '';

    return [
      `${indent}- \`${node.path}\` (${node.type}${required})${description}`,
      ...schemaTreeToMarkdown(node.children, depth + 1),
    ];
  });
}
