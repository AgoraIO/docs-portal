import { resolveLocalOpenApiReference } from './schema-tree';

export type OpenApiResponseHeaderView = {
  description?: string;
  deprecated?: boolean;
  name: string;
  schema?: unknown;
  source: Record<string, unknown>;
};

export type OpenApiResponseMediaView = {
  mediaType: string;
  schema?: unknown;
  source: Record<string, unknown>;
};

export type OpenApiResponseView = {
  description?: string;
  hasContent: boolean;
  headers: OpenApiResponseHeaderView[];
  mediaTypes: OpenApiResponseMediaView[];
  source: Record<string, unknown>;
  statusCode: string;
};

export function buildOpenApiResponseViews(
  responses: unknown,
  document: unknown,
): OpenApiResponseView[] {
  if (!isRecord(responses)) {
    return [];
  }

  return Object.entries(responses).map(([statusCode, rawResponse]) => {
    const rawRecord = isRecord(rawResponse) ? rawResponse : undefined;
    const resolvedResponse = resolveLocalOpenApiReference(
      document,
      rawResponse,
    );
    const response = isRecord(resolvedResponse)
      ? resolvedResponse
      : resolvedResponse === undefined
        ? (rawRecord ?? {})
        : {};

    // biome-ignore lint/suspicious/noPrototypeBuiltins: Support the project's target runtime.
    const hasContent = Object.prototype.hasOwnProperty.call(
      response,
      'content',
    );
    const content = isRecord(response.content) ? response.content : {};

    return {
      ...(typeof response.description === 'string'
        ? { description: response.description }
        : {}),
      hasContent,
      headers: buildHeaders(response.headers, document),
      mediaTypes: buildMediaTypes(content),
      source: response,
      statusCode,
    };
  });
}

export function getDefaultOpenApiResponseStatus(
  views: OpenApiResponseView[],
): string {
  return (
    views.find((view) => /^(?:2[0-9]{2}|2xx)$/i.test(view.statusCode))
      ?.statusCode ??
    views[0]?.statusCode ??
    ''
  );
}

export function getDefaultOpenApiMediaType(view: OpenApiResponseView): string {
  return (
    view.mediaTypes.find((media) => media.mediaType === 'application/json')
      ?.mediaType ??
    view.mediaTypes[0]?.mediaType ??
    ''
  );
}

function buildHeaders(
  headers: unknown,
  document: unknown,
): OpenApiResponseHeaderView[] {
  if (!isRecord(headers)) {
    return [];
  }

  return Object.entries(headers).flatMap(([name, rawHeader]) => {
    const rawRecord = isRecord(rawHeader) ? rawHeader : undefined;
    if (!rawRecord) {
      return [];
    }
    const resolvedHeader = resolveLocalOpenApiReference(document, rawHeader);
    if (!isRecord(resolvedHeader) && resolvedHeader !== undefined) {
      return [];
    }
    const header = isRecord(resolvedHeader)
      ? resolvedHeader
      : (rawRecord ?? {});

    return [
      {
        ...(typeof header.description === 'string'
          ? { description: header.description }
          : {}),
        ...(header.deprecated === true ? { deprecated: true } : {}),
        name,
        // biome-ignore lint/suspicious/noPrototypeBuiltins: Support the project's target runtime.
        ...(Object.prototype.hasOwnProperty.call(header, 'schema')
          ? { schema: header.schema }
          : {}),
        source: header,
      },
    ];
  });
}

function buildMediaTypes(
  content: Record<string, unknown>,
): OpenApiResponseMediaView[] {
  return Object.entries(content).map(([mediaType, rawMedia]) => {
    const source = isRecord(rawMedia) ? rawMedia : {};
    return {
      mediaType,
      // biome-ignore lint/suspicious/noPrototypeBuiltins: Support the project's target runtime.
      ...(Object.prototype.hasOwnProperty.call(source, 'schema')
        ? { schema: source.schema }
        : {}),
      source,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
