import fs from 'node:fs/promises';
import path from 'node:path';
import type { Document } from 'fumadocs-openapi';
import yaml from 'js-yaml';
import {
  CONVERSATIONAL_AI_OPENAPI_SOURCE_PATH,
  type ConversationalAiOperationId,
} from './conversational-ai';

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

export type NormalizedOpenApiOperation = {
  description?: string;
  method: string;
  operationId: string;
  parameters: unknown[];
  path: string;
  requestBody?: {
    contentTypes: string[];
    content: Record<string, OpenApiMediaContent>;
  };
  responses: Record<string, OpenApiResponse>;
  security?: unknown;
  servers: { description?: string; url: string }[];
  summary?: string;
};

export type OpenApiMediaContent = {
  examples?: Record<string, unknown>;
  schema?: unknown;
};

export type OpenApiResponse = {
  content?: Record<string, OpenApiMediaContent>;
  description?: string;
};

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
  servers?: { description?: string; url: string }[];
};

let cachedOperations: Promise<NormalizedOpenApiOperation[]> | undefined;

export async function getConversationalAiOperations(): Promise<
  NormalizedOpenApiOperation[]
> {
  cachedOperations ??= loadConversationalAiOperations();
  return cachedOperations;
}

export async function getConversationalAiOperation(
  operationId: string,
): Promise<NormalizedOpenApiOperation> {
  const operation = (await getConversationalAiOperations()).find(
    (item) => item.operationId === operationId,
  );

  if (!operation) {
    throw new Error(`Unknown Conversational AI OpenAPI operation: ${operationId}`);
  }

  return operation;
}

async function loadConversationalAiOperations() {
  const sourcePath = path.join(process.cwd(), CONVERSATIONAL_AI_OPENAPI_SOURCE_PATH);
  const document = await loadOpenApiDocument(sourcePath);
  const operations: NormalizedOpenApiOperation[] = [];

  for (const [operationPath, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, rawOperation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || !isRecord(rawOperation)) {
        continue;
      }

      const operation = resolveReference(rawOperation, document);
      if (!isRecord(operation)) {
        continue;
      }

      const operationId = stringValue(operation.operationId);
      if (!operationId) {
        continue;
      }

      operations.push({
        description: stringValue(operation.description),
        method: method.toUpperCase(),
        operationId,
        parameters: arrayValue(operation.parameters).map((parameter) =>
          resolveReference(parameter, document),
        ),
        path: operationPath,
        requestBody: normalizeRequestBody(
          resolveReference(operation.requestBody, document),
          document,
        ),
        responses: normalizeResponses(operation.responses, document),
        security: operation.security,
        servers:
          normalizeServers(operation.servers) ??
          normalizeServers(pathItem.servers) ??
          normalizeServers(document.servers) ??
          [],
        summary: stringValue(operation.summary),
      });
    }
  }

  return operations.sort((left, right) =>
    left.operationId.localeCompare(right.operationId),
  );
}

async function loadOpenApiDocument(sourcePath: string): Promise<OpenApiDocument> {
  const source = await fs.readFile(sourcePath, 'utf8');
  const parsed = yaml.load(source) as Document;

  return parsed as OpenApiDocument;
}

function normalizeRequestBody(value: unknown, document: OpenApiDocument) {
  if (!isRecord(value) || !isRecord(value.content)) {
    return undefined;
  }

  const content = normalizeContent(value.content, document);

  return {
    content,
    contentTypes: Object.keys(content),
  };
}

function normalizeResponses(
  value: unknown,
  document: OpenApiDocument,
): Record<string, OpenApiResponse> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([status, response]) => [
      status,
      normalizeResponse(resolveReference(response, document), document),
    ]),
  );
}

function normalizeResponse(
  value: unknown,
  document: OpenApiDocument,
): OpenApiResponse {
  if (!isRecord(value)) {
    return {};
  }

  const response: OpenApiResponse = {};
  const description = stringValue(value.description);
  if (description) {
    response.description = description;
  }

  if (isRecord(value.content)) {
    response.content = normalizeContent(value.content, document);
  }

  return response;
}

function normalizeContent(
  value: Record<string, unknown>,
  document: OpenApiDocument,
): Record<string, OpenApiMediaContent> {
  return Object.fromEntries(
    Object.entries(value).map(([contentType, media]) => {
      if (!isRecord(media)) {
        return [contentType, {}];
      }

      return [
        contentType,
        {
          examples: isRecord(media.examples) ? media.examples : undefined,
          schema: resolveSchema(media.schema, document),
        },
      ];
    }),
  );
}

function normalizeServers(value: unknown) {
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

    const description = stringValue(server.description);

    return [
      {
        ...(description ? { description } : {}),
        url,
      },
    ];
  });
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveSchema(value: unknown, document: OpenApiDocument): unknown {
  const resolved = resolveReference(value, document);

  if (!isRecord(resolved)) {
    return resolved;
  }

  return Object.fromEntries(
    Object.entries(resolved).map(([key, nested]) => {
      if (key === '$ref') {
        return [key, nested];
      }

      if (Array.isArray(nested)) {
        return [
          key,
          nested.map((item) =>
            isRecord(item) ? resolveSchema(item, document) : item,
          ),
        ];
      }

      if (isRecord(nested)) {
        return [key, resolveSchema(nested, document)];
      }

      return [key, nested];
    }),
  );
}

function resolveReference(value: unknown, document: OpenApiDocument) {
  if (!isRecord(value) || typeof value.$ref !== 'string') {
    return value;
  }

  const ref = value.$ref;
  const target = resolveJsonPointer(document, ref);

  if (!isRecord(target)) {
    throw new Error(`Failed to resolve OpenAPI reference: ${ref}`);
  }

  const { $ref: _ref, ...overrides } = value;

  return {
    ...target,
    ...overrides,
  };
}

function resolveJsonPointer(document: OpenApiDocument, ref: string) {
  if (!ref.startsWith('#/')) {
    throw new Error(`Unsupported external OpenAPI reference: ${ref}`);
  }

  return ref
    .slice(2)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<unknown>(
      (current, segment) =>
        isRecord(current) || Array.isArray(current)
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      document,
    );
}

export function assertConversationalAiOperationId(
  operationId: string,
): asserts operationId is ConversationalAiOperationId {
  if (!operationId) {
    throw new Error('Expected a Conversational AI operation ID');
  }
}
