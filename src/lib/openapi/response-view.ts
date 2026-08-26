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
    const resolvedResponse = resolveLocalOpenApiReference(
      document,
      rawResponse,
    );
    if (!isRecord(resolvedResponse)) {
      return emptyResponseView(statusCode);
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: Support the project's target runtime.
    const hasContent = Object.prototype.hasOwnProperty.call(
      resolvedResponse,
      'content',
    );
    const content = isRecord(resolvedResponse.content)
      ? resolvedResponse.content
      : {};

    return {
      ...(typeof resolvedResponse.description === 'string'
        ? { description: resolvedResponse.description }
        : {}),
      hasContent,
      headers: buildHeaders(resolvedResponse.headers, document),
      mediaTypes: buildMediaTypes(content),
      source: resolvedResponse,
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
    const resolvedHeader = resolveLocalOpenApiReference(document, rawHeader);
    if (!isRecord(resolvedHeader)) {
      return [];
    }

    return [
      {
        ...(typeof resolvedHeader.description === 'string'
          ? { description: resolvedHeader.description }
          : {}),
        ...(resolvedHeader.deprecated === true ? { deprecated: true } : {}),
        name,
        // biome-ignore lint/suspicious/noPrototypeBuiltins: Support the project's target runtime.
        ...(Object.prototype.hasOwnProperty.call(resolvedHeader, 'schema')
          ? { schema: resolvedHeader.schema }
          : {}),
        source: resolvedHeader,
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

function emptyResponseView(statusCode: string): OpenApiResponseView {
  return {
    hasContent: false,
    headers: [],
    mediaTypes: [],
    source: {},
    statusCode,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
