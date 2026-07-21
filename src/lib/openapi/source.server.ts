import SwaggerParser from '@apidevtools/swagger-parser';
import yaml from 'js-yaml';
import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { type AppLocale, DEFAULT_LOCALE } from '../i18n/i18n-config';
import { type OpenApiJsonValue, toOpenApiJsonValue } from './json';
import type { OpenApiLane } from './lanes';
import { getOpenApiSourceText } from './source-text.server';

export type OpenApiHttpMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export type OpenApiParameterLocation = 'cookie' | 'header' | 'path' | 'query';

export type OpenApiParameter = {
  description?: string;
  docsCallouts?: OpenApiDocsFragment[];
  example?: OpenApiJsonValue;
  examples?: Record<string, { value?: OpenApiJsonValue }>;
  in: OpenApiParameterLocation;
  name: string;
  required: boolean;
  schema?: OpenApiJsonValue;
};

export type OpenApiDocsFragment = {
  markdown: string;
  position?: string;
  title?: string;
  type?: string;
};

export type OpenApiCodeSample = {
  label?: string;
  lang?: string;
  source: string;
};

export type NormalizedOpenApiMedia = {
  example?: OpenApiJsonValue;
  examples?: Record<string, { value?: OpenApiJsonValue }>;
  schema?: OpenApiJsonValue;
};

export type OpenApiResponse = {
  content?: Record<string, NormalizedOpenApiMedia>;
  description?: string;
};

export type NormalizedOpenApiOperation = {
  codeSamples: OpenApiCodeSample[];
  description?: string;
  docsCallouts: OpenApiDocsFragment[];
  docsSections: OpenApiDocsFragment[];
  method: OpenApiHttpMethod;
  operationId: string;
  parameters: OpenApiParameter[];
  path: string;
  requestBody?: {
    content: Record<string, NormalizedOpenApiMedia>;
    contentTypes: string[];
    description?: string;
    required: boolean;
  };
  responses: Record<string, OpenApiResponse>;
  security?: OpenApiJsonValue;
  servers: { description?: string; url: string }[];
  summary?: string;
};

const HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]) as Set<string>;

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
  security?: unknown;
  servers?: { description?: string; url: string }[];
};

const operationCache = new Map<string, Promise<NormalizedOpenApiOperation[]>>();
const documentCache = new Map<string, Promise<OpenApiDocument>>();

export async function getOpenApiOperations(
  lane: OpenApiLane,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<NormalizedOpenApiOperation[]> {
  const cacheKey = getCacheKey(lane, locale);
  let cachedOperations = operationCache.get(cacheKey);

  if (!cachedOperations) {
    cachedOperations = loadOpenApiOperations(lane, locale);
    operationCache.set(cacheKey, cachedOperations);
  }

  return cachedOperations;
}

export async function getOpenApiOperation(
  lane: OpenApiLane,
  operationId: string,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<NormalizedOpenApiOperation> {
  const operation = (await getOpenApiOperations(lane, locale)).find(
    (item) => item.operationId === operationId,
  );

  if (!operation) {
    throw new Error(
      `Unknown OpenAPI operation "${operationId}" for lane "${lane.id}"`,
    );
  }

  return operation;
}

async function loadOpenApiOperations(lane: OpenApiLane, locale: AppLocale) {
  const document = await getOpenApiDocument(lane, locale);
  const operations: NormalizedOpenApiOperation[] = [];

  for (const [operationPath, pathItem] of Object.entries(
    document.paths ?? {},
  )) {
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
        codeSamples: normalizeCodeSamples(operation['x-codeSamples']),
        description: stringValue(operation.description),
        docsCallouts: normalizeDocsFragments(operation['x-docs-callouts']),
        docsSections: normalizeDocsFragments(operation['x-docs-sections']),
        method: method.toUpperCase() as NormalizedOpenApiOperation['method'],
        operationId,
        parameters: arrayValue(operation.parameters).flatMap((parameter) =>
          normalizeParameter(resolveReference(parameter, document), document),
        ),
        path: operationPath,
        requestBody: normalizeRequestBody(
          resolveReference(operation.requestBody, document),
          document,
        ),
        responses: normalizeResponses(operation.responses, document),
        security:
          operation.security === undefined && document.security === undefined
            ? undefined
            : toOpenApiJsonValue(operation.security ?? document.security),
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

async function getOpenApiDocument(
  lane: OpenApiLane,
  locale: AppLocale,
): Promise<OpenApiDocument> {
  const cacheKey = getCacheKey(lane, locale);
  const cached = documentCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const next = loadDereferencedOpenApiDocument(lane, locale);
  documentCache.set(cacheKey, next);
  return next;
}

async function loadDereferencedOpenApiDocument(
  lane: OpenApiLane,
  locale: AppLocale,
): Promise<OpenApiDocument> {
  const document = yaml.load(getOpenApiSourceText(lane, locale));

  return (await SwaggerParser.dereference(
    document as OpenAPIV3.Document | OpenAPIV3_1.Document,
    {
      dereference: {
        circular: 'ignore',
      },
    },
  )) as OpenApiDocument;
}

function getCacheKey(lane: OpenApiLane, locale: AppLocale) {
  return `${lane.id}:${locale}`;
}

function normalizeRequestBody(value: unknown, document: OpenApiDocument) {
  if (!isRecord(value) || !isRecord(value.content)) {
    return undefined;
  }

  const content = normalizeContent(value.content, document);

  return {
    content,
    contentTypes: Object.keys(content),
    ...(typeof value.description === 'string'
      ? { description: value.description }
      : {}),
    required: value.required === true,
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
): Record<string, NormalizedOpenApiMedia> {
  return Object.fromEntries(
    Object.entries(value).map(([contentType, media]) => {
      if (!isRecord(media)) {
        return [contentType, {}];
      }

      return [
        contentType,
        {
          example:
            media.example === undefined
              ? undefined
              : toOpenApiJsonValue(media.example),
          examples: isRecord(media.examples)
            ? normalizeExamples(media.examples)
            : undefined,
          schema:
            media.schema === undefined
              ? undefined
              : toOpenApiJsonValue(resolveSchema(media.schema, document)),
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

function normalizeParameter(
  value: unknown,
  document: OpenApiDocument,
): OpenApiParameter[] {
  if (!isRecord(value)) {
    return [];
  }

  const name = stringValue(value.name);
  const location = normalizeParameterLocation(value.in);

  if (!name || !location) {
    return [];
  }

  const docsCallouts = normalizeDocsFragments(value['x-docs-callouts']);

  return [
    {
      ...(typeof value.description === 'string'
        ? { description: value.description }
        : {}),
      ...(docsCallouts.length > 0 ? { docsCallouts } : {}),
      ...(value.example !== undefined
        ? { example: toOpenApiJsonValue(value.example) }
        : {}),
      ...(isRecord(value.examples)
        ? { examples: normalizeExamples(value.examples) }
        : {}),
      in: location,
      name,
      required: value.required === true,
      ...(value.schema === undefined
        ? {}
        : {
            schema: toOpenApiJsonValue(resolveSchema(value.schema, document)),
          }),
    },
  ];
}

function normalizeDocsFragments(value: unknown): OpenApiDocsFragment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.markdown !== 'string') {
      return [];
    }

    return [
      {
        markdown: item.markdown,
        ...(typeof item.position === 'string'
          ? { position: item.position }
          : {}),
        ...(typeof item.title === 'string' ? { title: item.title } : {}),
        ...(typeof item.type === 'string' ? { type: item.type } : {}),
      },
    ];
  });
}

function normalizeCodeSamples(value: unknown): OpenApiCodeSample[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.source !== 'string') {
      return [];
    }

    return [
      {
        source: item.source,
        ...(typeof item.label === 'string' ? { label: item.label } : {}),
        ...(typeof item.lang === 'string' ? { lang: item.lang } : {}),
      },
    ];
  });
}

function normalizeExamples(
  examples: Record<string, unknown>,
): Record<string, { value?: OpenApiJsonValue }> {
  return Object.fromEntries(
    Object.entries(examples).map(([name, value]) => {
      if (isRecord(value) && value.value !== undefined) {
        return [name, { value: toOpenApiJsonValue(value.value) }];
      }

      return [name, {}];
    }),
  );
}

function normalizeParameterLocation(
  value: unknown,
): OpenApiParameterLocation | undefined {
  if (
    value === 'cookie' ||
    value === 'header' ||
    value === 'path' ||
    value === 'query'
  ) {
    return value;
  }

  return undefined;
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
