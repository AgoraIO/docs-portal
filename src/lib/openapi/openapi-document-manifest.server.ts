import { type AppLocale } from '../i18n/i18n-config';
import { toOpenApiJsonValue, type OpenApiJsonValue } from './json';
import { findOpenApiLaneBySourcePath, type OpenApiLane } from './lanes';
import { OPENAPI_DOCUMENTS_MANIFEST } from './openapi-documents.generated';

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
  example?: OpenApiJsonValue;
  examples?: Record<string, { value?: OpenApiJsonValue }>;
  in: OpenApiParameterLocation;
  name: string;
  required: boolean;
  schema?: OpenApiJsonValue;
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
  description?: string;
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

type OpenApiDocumentManifest = Record<string, Partial<Record<AppLocale, OpenApiJsonValue>>>;
type OpenApiDocumentPayload = {
  base?: OpenApiJsonObject;
  operations?: Record<
    string,
    {
      method?: string;
      operation?: OpenApiJsonObject;
      path?: string;
    }
  >;
};

const manifest =
  OPENAPI_DOCUMENTS_MANIFEST as unknown as OpenApiDocumentManifest;

export function getOpenApiDocumentManifestEntry(
  lane: OpenApiLane,
  locale: AppLocale,
) {
  const document = getRawOpenApiDocumentManifestEntry(lane, locale);
  const payload = getOpenApiDocumentPayloadFromValue(document);

  if (payload) {
    return {
      ...(payload.base ?? {}),
      paths: Object.fromEntries(
        Object.values(payload.operations ?? {}).flatMap((operationEntry) => {
          const operationPath = getOptionalString(operationEntry?.path);
          const method = getOptionalString(operationEntry?.method)?.toLowerCase();
          const operationDocument = operationEntry?.operation;

          if (
            !operationPath ||
            !method ||
            !operationDocument ||
            !isOpenApiDocument(operationDocument)
          ) {
            return [];
          }

          return [[operationPath, { [method]: operationDocument }]];
        }),
      ),
    };
  }

  if (!document || !isOpenApiDocument(document)) {
    throw new Error(
      `Missing OpenAPI document manifest for lane "${lane.id}" and locale "${locale}"`,
    );
  }

  return document;
}

export function getOpenApiOperationDocumentManifestEntry(
  lane: OpenApiLane,
  operationId: string,
  locale: AppLocale,
) {
  const payload = getOpenApiDocumentPayload(lane, locale);
  const operationEntry = payload.operations?.[operationId];
  const operationPath = getOptionalString(operationEntry?.path);
  const method = getOptionalString(operationEntry?.method)?.toLowerCase();
  const operationDocument = operationEntry?.operation;

  if (
    !operationPath ||
    !method ||
    !operationDocument ||
    !isOpenApiDocument(operationDocument)
  ) {
    throw new Error(
      `Missing OpenAPI operation document manifest for lane "${lane.id}", operation "${operationId}", and locale "${locale}"`,
    );
  }

  return {
    ...(payload.base ?? {}),
    paths: {
      [operationPath]: {
        [method]: operationDocument,
      },
    },
  };
}

export function extractNormalizedOpenApiOperations(document: OpenApiJsonObject) {
  const operations: NormalizedOpenApiOperation[] = [];

  for (const [documentPath, rawPathItem] of Object.entries(document.paths ?? {})) {
    if (!isOpenApiJsonObject(rawPathItem)) {
      continue;
    }

    for (const [methodName, rawOperation] of Object.entries(rawPathItem)) {
      const method = normalizeHttpMethod(methodName);
      if (!method || !isOpenApiJsonObject(rawOperation)) {
        continue;
      }

      const operationId = getOptionalString(rawOperation.operationId);
      if (!operationId) {
        continue;
      }

      operations.push({
        description: getOptionalString(rawOperation.description),
        method,
        operationId,
        parameters: normalizeParameters(rawOperation.parameters),
        path: documentPath,
        ...(normalizeRequestBody(rawOperation.requestBody)
          ? { requestBody: normalizeRequestBody(rawOperation.requestBody) }
          : {}),
        responses: normalizeResponses(rawOperation.responses),
        ...(rawOperation.security !== undefined
          ? { security: toOpenApiJsonValue(rawOperation.security) }
          : {}),
        servers: normalizeServers(document.servers),
        ...(getOptionalString(rawOperation.summary)
          ? { summary: getOptionalString(rawOperation.summary) }
          : {}),
      });
    }
  }

  return operations;
}

type OpenApiJsonObject = {
  [key: string]: unknown;
};

function normalizeParameters(value: unknown): OpenApiParameter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isOpenApiJsonObject(item)) {
      return [];
    }

    const name = getOptionalString(item.name);
    const location = normalizeParameterLocation(item.in);

    if (!name || !location) {
      return [];
    }

    return [
      {
        ...(getOptionalString(item.description)
          ? { description: getOptionalString(item.description) }
          : {}),
        ...(item.example !== undefined
          ? { example: toOpenApiJsonValue(item.example) }
          : {}),
        ...(isExamplesObject(item.examples)
          ? { examples: normalizeExamples(item.examples) }
          : {}),
        in: location,
        name,
        required: item.required === true,
        ...(isOpenApiJsonObject(item.schema)
          ? { schema: toOpenApiJsonValue(item.schema) }
          : {}),
      },
    ];
  });
}

function normalizeRequestBody(value: unknown): NormalizedOpenApiOperation['requestBody'] | undefined {
  if (!isOpenApiJsonObject(value)) {
    return undefined;
  }

  const content = normalizeContent(value.content);

  return {
    content,
    contentTypes: Object.keys(content),
    ...(getOptionalString(value.description)
      ? { description: getOptionalString(value.description) }
      : {}),
    required: value.required === true,
  };
}

function normalizeResponses(value: unknown): Record<string, OpenApiResponse> {
  if (!isOpenApiJsonObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([status, rawResponse]) => {
      if (!isOpenApiJsonObject(rawResponse)) {
        return [];
      }

      return [
        [
          status,
          {
            ...(normalizeContent(rawResponse.content)
              ? { content: normalizeContent(rawResponse.content) }
              : {}),
            ...(getOptionalString(rawResponse.description)
              ? { description: getOptionalString(rawResponse.description) }
              : {}),
          } satisfies OpenApiResponse,
        ],
      ];
    }),
  );
}

function normalizeContent(value: unknown): Record<string, NormalizedOpenApiMedia> {
  if (!isOpenApiJsonObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([contentType, rawMedia]) => {
      if (!isOpenApiJsonObject(rawMedia)) {
        return [];
      }

      return [
        [
          contentType,
          {
            ...(rawMedia.example !== undefined
              ? { example: toOpenApiJsonValue(rawMedia.example) }
              : {}),
            ...(isExamplesObject(rawMedia.examples)
              ? { examples: normalizeExamples(rawMedia.examples) }
              : {}),
            ...(isOpenApiJsonObject(rawMedia.schema)
              ? { schema: toOpenApiJsonValue(rawMedia.schema) }
              : {}),
          } satisfies NormalizedOpenApiMedia,
        ],
      ];
    }),
  );
}

function normalizeExamples(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, rawExample]) => {
      if (!isOpenApiJsonObject(rawExample)) {
        return [];
      }

      return [[key, { ...(rawExample.value !== undefined ? { value: toOpenApiJsonValue(rawExample.value) } : {}) }]];
    }),
  );
}

function normalizeServers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isOpenApiJsonObject(item)) {
      return [];
    }

    const url = getOptionalString(item.url);
    if (!url) {
      return [];
    }

    return [
      {
        ...(getOptionalString(item.description)
          ? { description: getOptionalString(item.description) }
          : {}),
        url,
      },
    ];
  });
}

function normalizeHttpMethod(methodName: string): OpenApiHttpMethod | null {
  switch (methodName.toUpperCase()) {
    case 'DELETE':
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
    case 'PATCH':
    case 'POST':
    case 'PUT':
    case 'TRACE':
      return methodName.toUpperCase() as OpenApiHttpMethod;
    default:
      return null;
  }
}

function normalizeParameterLocation(value: unknown): OpenApiParameterLocation | null {
  switch (value) {
    case 'cookie':
    case 'header':
    case 'path':
    case 'query':
      return value;
    default:
      return null;
  }
}

function getOptionalString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isExamplesObject(value: unknown): value is Record<string, unknown> {
  return isOpenApiJsonObject(value);
}

function isOpenApiJsonObject(value: unknown): value is OpenApiJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOpenApiDocument(value: unknown): value is OpenApiJsonObject & {
  paths?: Record<string, unknown>;
  servers?: unknown[];
} {
  return isOpenApiJsonObject(value);
}

function getOpenApiDocumentPayload(
  lane: OpenApiLane,
  locale: AppLocale,
): OpenApiDocumentPayload {
  return getOpenApiDocumentPayloadFromValue(getRawOpenApiDocumentManifestEntry(lane, locale)) ?? {
    operations: undefined,
  };
}

function getRawOpenApiDocumentManifestEntry(
  lane: OpenApiLane,
  locale: AppLocale,
) {
  const manifestLane =
    manifest[lane.id] === undefined
      ? findOpenApiLaneBySourcePath(lane.sourcePath[locale]) ?? lane
      : lane;

  return manifest[manifestLane.id]?.[locale];
}

function getOpenApiDocumentPayloadFromValue(
  value: unknown,
): OpenApiDocumentPayload | null {
  if (
    isOpenApiJsonObject(value) &&
    (value.base !== undefined || value.operations !== undefined)
  ) {
    return value as OpenApiDocumentPayload;
  }

  return null;
}
