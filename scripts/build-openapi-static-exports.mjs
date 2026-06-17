import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import SwaggerParser from '@apidevtools/swagger-parser';
import yaml from 'js-yaml';

const repoRoot = process.cwd();
const generatedRoot = path.join(repoRoot, 'public/generated/openapi');

const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

await main();

async function main() {
  const OPENAPI_LANES = readOpenApiLanes();
  const result = {
    markdownByContentPath: {},
    markdownPages: [],
    pagePayloads: {},
    searchDocuments: [],
  };

  for (const lane of OPENAPI_LANES) {
    for (const locale of ['en', 'zh-CN']) {
      const document = await loadOpenApiDocument(
        path.join(repoRoot, lane.sourcePath[locale]),
      );
      const operations = collectOperations(document);

      for (const [operationId, meta] of Object.entries(lane.operations)) {
        const operation = operations.find((item) => item.operationId === operationId);

        if (!operation) {
          throw new Error(
            `Missing operation "${operationId}" for lane "${lane.id}" locale "${locale}"`,
          );
        }

        const url = getOpenApiEndpointUrl(lane, locale, operationId);
        const title = meta.title[locale];
        const markdown = serializeOpenApiOperationMarkdown({
          operation,
          publicSourceUrl: lane.publicSourceUrl[locale],
          title,
          url,
        });
        const contentPath = `${locale}/${lane.routePrefix}/${meta.routeLeaf}.md`;

        result.markdownByContentPath[contentPath] = markdown;
        result.markdownPages.push({
          markdown,
          title,
          url,
        });
        result.pagePayloads[`${locale}/${lane.id}/${operationId}.json`] = {
          document: `${lane.id}-${locale}`,
          operations: [
            {
              method: operation.method.toLowerCase(),
              path: operation.path,
            },
          ],
          payload: {
            bundled: {
              ...(document.openapi ? { openapi: document.openapi } : {}),
              ...(document.info ? { info: document.info } : {}),
              ...(document.servers ? { servers: document.servers } : {}),
              paths: {
                [operation.path]: {
                  [operation.method.toLowerCase()]: materializeOperationDocument(
                    operation,
                  ),
                },
              },
            },
          },
          showDescription: true,
        };
        result.searchDocuments.push({
          breadcrumbs: [locale === 'zh-CN' ? 'API 参考' : 'API Reference', lane.parentUrl[locale]],
          content: [
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
            ...schemaFieldPaths(operation.requestBody?.content?.['application/json']?.schema),
            ...Object.keys(operation.responses),
          ]
            .filter(Boolean)
            .join('\n'),
          id: `${locale}-${operation.operationId}`,
          type: 'page',
          url,
        });
      }
    }
  }

  fs.rmSync(generatedRoot, { force: true, recursive: true });
  fs.mkdirSync(generatedRoot, { recursive: true });
  fs.writeFileSync(
    path.join(generatedRoot, 'search-documents.json'),
    JSON.stringify(result.searchDocuments),
  );
  fs.writeFileSync(
    path.join(generatedRoot, 'markdown-pages.json'),
    JSON.stringify(result.markdownPages),
  );
  for (const [relativePath, payload] of Object.entries(result.pagePayloads)) {
    const outputPath = path.join(generatedRoot, 'page-payloads', relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(payload));
  }
  for (const [contentPath, markdown] of Object.entries(result.markdownByContentPath)) {
    const outputPath = path.join(generatedRoot, 'llms-mdx-docs', contentPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown);
  }
}

async function loadOpenApiDocument(filePath) {
  const document = yaml.load(fs.readFileSync(filePath, 'utf8'));
  return SwaggerParser.dereference(document, {
    dereference: {
      circular: 'ignore',
    },
  });
}

function collectOperations(document) {
  const operations = [];

  for (const [operationPath, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, rawOperation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method) || !isRecord(rawOperation)) {
        continue;
      }

      const operationId = stringValue(rawOperation.operationId);
      if (!operationId) {
        continue;
      }

      operations.push({
        description: stringValue(rawOperation.description),
        method: method.toUpperCase(),
        operationId,
        parameters: normalizeParameters(rawOperation.parameters),
        path: operationPath,
        requestBody: normalizeRequestBody(rawOperation.requestBody),
        responses: normalizeResponses(rawOperation.responses),
        servers: normalizeServers(rawOperation.servers) ?? normalizeServers(pathItem.servers) ?? normalizeServers(document.servers) ?? [],
        summary: stringValue(rawOperation.summary),
      });
    }
  }

  return operations.sort((left, right) =>
    left.operationId.localeCompare(right.operationId),
  );
}

function normalizeParameters(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((parameter) => {
    if (!isRecord(parameter)) {
      return [];
    }

    const name = stringValue(parameter.name);
    const location = stringValue(parameter.in);

    if (!name || !location) {
      return [];
    }

    return [
      {
        description: stringValue(parameter.description),
        in: location,
        name,
        required: parameter.required === true,
        schema: isRecord(parameter.schema) ? parameter.schema : undefined,
      },
    ];
  });
}

function normalizeRequestBody(value) {
  if (!isRecord(value) || !isRecord(value.content)) {
    return undefined;
  }

  const content = normalizeContent(value.content);

  return {
    content,
    contentTypes: Object.keys(content),
    description: stringValue(value.description),
    required: value.required === true,
  };
}

function normalizeResponses(value) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([status, response]) => [
      status,
      normalizeResponse(response),
    ]),
  );
}

function normalizeResponse(value) {
  if (!isRecord(value)) {
    return {};
  }

  return {
    content: isRecord(value.content) ? normalizeContent(value.content) : undefined,
    description: stringValue(value.description),
  };
}

function normalizeContent(value) {
  return Object.fromEntries(
    Object.entries(value).map(([contentType, media]) => {
      if (!isRecord(media)) {
        return [contentType, {}];
      }

      return [
        contentType,
        {
          schema: isRecord(media.schema) ? media.schema : undefined,
        },
      ];
    }),
  );
}

function normalizeServers(value) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.flatMap((server) => {
    if (!isRecord(server)) {
      return [];
    }

    const url = stringValue(server.url);
    if (!url) {
      return [];
    }

    return [
      {
        description: stringValue(server.description),
        url,
      },
    ];
  });
}

function serializeOpenApiOperationMarkdown({ operation, publicSourceUrl, title, url }) {
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
  const requestSchema = operation.requestBody?.content?.['application/json']?.schema;
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

function materializeOperationDocument(operation) {
  return {
    ...(operation.description ? { description: operation.description } : {}),
    ...(operation.operationId ? { operationId: operation.operationId } : {}),
    ...(operation.parameters.length > 0 ? { parameters: operation.parameters } : {}),
    ...(operation.requestBody ? { requestBody: operation.requestBody } : {}),
    responses: operation.responses,
    ...(operation.summary ? { summary: operation.summary } : {}),
  };
}

function schemaFieldPaths(schema) {
  return buildOpenApiSchemaTree(schema).flatMap(flattenSchemaNode);
}

function flattenSchemaNode(node) {
  return [node.path, ...node.children.flatMap(flattenSchemaNode)];
}

function parameterToMarkdown(parameter) {
  const required = parameter.required === true ? 'required' : 'optional';
  const description = parameter.description ? ` - ${parameter.description}` : '';
  return `- \`${parameter.name}\` (${parameter.in}, ${required})${description}`;
}

function schemaTreeToMarkdown(nodes, depth = 0) {
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

function buildOpenApiSchemaTree(schema) {
  return buildSchemaChildren(schema, {
    depth: 0,
    pathPrefix: '',
    requiredNames: new Set(),
    seen: new WeakSet(),
  });
}

function buildSchemaChildren(schema, context) {
  if (!isRecord(schema) || context.depth > 12) {
    return [];
  }

  if (context.seen.has(schema)) {
    return [];
  }

  context.seen.add(schema);
  const merged = mergeComposedSchemas(schema);
  const properties = isRecord(merged.properties) ? merged.properties : {};
  const requiredNames = new Set(arrayOfStrings(merged.required));
  const nodes = Object.entries(properties).map(([name, childSchema]) =>
    buildSchemaNode(name, childSchema, {
      depth: context.depth + 1,
      pathPrefix: context.pathPrefix,
      requiredNames,
      seen: context.seen,
    }),
  );

  if (isRecord(merged.items)) {
    nodes.push(
      buildSchemaNode('items', merged.items, {
        depth: context.depth + 1,
        pathPrefix: context.pathPrefix,
        requiredNames: new Set(),
        seen: context.seen,
      }),
    );
  }

  return nodes;
}

function buildSchemaNode(name, schema, context) {
  const value = isRecord(schema) ? mergeComposedSchemas(schema) : {};
  const path = context.pathPrefix ? `${context.pathPrefix}.${name}` : name;
  const required = context.requiredNames.has(name);

  return {
    children: buildSchemaChildren(value, {
      depth: context.depth,
      pathPrefix: path,
      requiredNames: new Set(arrayOfStrings(value.required)),
      seen: context.seen,
    }),
    description: stringValue(value.description),
    name,
    path,
    required,
    type: getSchemaType(value),
  };
}

function mergeComposedSchemas(schema) {
  const merged = { ...schema };

  for (const key of ['allOf', 'oneOf', 'anyOf']) {
    const items = schema[key];
    if (!Array.isArray(items)) {
      continue;
    }

    for (const item of items) {
      if (!isRecord(item)) {
        continue;
      }

      const child = mergeComposedSchemas(item);
      Object.assign(merged, child, {
        properties: {
          ...(isRecord(merged.properties) ? merged.properties : {}),
          ...(isRecord(child.properties) ? child.properties : {}),
        },
        required: [...arrayOfStrings(merged.required), ...arrayOfStrings(child.required)],
      });
    }
  }

  return merged;
}

function getSchemaType(schema) {
  if (typeof schema.type === 'string') {
    return schema.type;
  }
  if (Array.isArray(schema.type)) {
    return schema.type.join(' | ');
  }
  if (Array.isArray(schema.enum)) {
    return 'enum';
  }
  if (isRecord(schema.properties)) {
    return 'object';
  }
  if (isRecord(schema.items)) {
    return 'array';
  }
  if (Array.isArray(schema.oneOf)) {
    return 'oneOf';
  }
  if (Array.isArray(schema.anyOf)) {
    return 'anyOf';
  }
  if (Array.isArray(schema.allOf)) {
    return 'allOf';
  }
  return 'unknown';
}

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function stringValue(value) {
  return typeof value === 'string' ? value : undefined;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOpenApiLanes() {
  const lanesSource = fs.readFileSync(
    path.join(repoRoot, 'src/lib/openapi/lanes.ts'),
    'utf8',
  );
  const match = lanesSource.match(
    /export const OPENAPI_LANES = (\[[\s\S]*?\]) as const satisfies OpenApiLane\[];/,
  );

  if (!match) {
    throw new Error('Failed to extract OPENAPI_LANES from src/lib/openapi/lanes.ts');
  }

  return new Function(`return ${match[1]};`)();
}

function getOpenApiEndpointUrl(lane, locale, operationId) {
  const operation = lane.operations[operationId];

  if (!operation) {
    throw new Error(
      `Unknown OpenAPI operation "${operationId}" for lane "${lane.id}"`,
    );
  }

  return `/${locale}/${lane.routePrefix}/${operation.routeLeaf}`;
}
