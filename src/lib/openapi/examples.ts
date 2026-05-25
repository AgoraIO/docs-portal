import type {
  NormalizedOpenApiMedia,
  NormalizedOpenApiOperation,
  OpenApiExamples,
} from './payload';
import type { OpenApiJsonValue } from './json';

export function createOpenApiExamples(
  operation: NormalizedOpenApiOperation,
): OpenApiExamples {
  const serverUrl = operation.servers[0]?.url ?? '';
  const requestMedia = operation.requestBody?.content['application/json'];
  const requestBodyJson = toExampleJsonValue(
    getMediaExample(requestMedia) ??
      generateSchemaExample(requestMedia?.schema, { mode: 'request' }),
  );
  const [responseStatus, responseMedia] =
    getPreferredJsonResponse(operation) ?? [];
  const responseBodyJson = toExampleJsonValue(
    getMediaExample(responseMedia) ??
      generateSchemaExample(responseMedia?.schema, { mode: 'response' }),
  );

  return {
    curl: buildCurlExample({ operation, requestBodyJson, serverUrl }),
    javascript: buildJavaScriptFetchExample({
      operation,
      requestBodyJson,
      serverUrl,
    }),
    ...(requestBodyJson !== undefined ? { requestBodyJson } : {}),
    ...(responseBodyJson !== undefined ? { responseBodyJson } : {}),
    ...(responseStatus ? { responseStatus } : {}),
  };
}

function getMediaExample(media: NormalizedOpenApiMedia | undefined) {
  if (!media) {
    return undefined;
  }

  const namedExample = Object.values(media.examples ?? {}).find(
    (example) => example.value !== undefined,
  );

  if (namedExample?.value !== undefined) {
    return namedExample.value;
  }

  if (media.example !== undefined) {
    return media.example;
  }

  return getSchemaExample(media.schema);
}

function getSchemaExample(schema: unknown): unknown {
  if (!isRecord(schema)) {
    return undefined;
  }

  if (schema.example !== undefined) {
    return schema.example;
  }

  return undefined;
}

function getPreferredJsonResponse(
  operation: NormalizedOpenApiOperation,
): [string, NormalizedOpenApiMedia] | undefined {
  const success = Object.entries(operation.responses).find(
    ([status, response]) =>
      status.startsWith('2') && response.content?.['application/json'],
  );
  const fallback = Object.entries(operation.responses).find(
    ([, response]) => response.content?.['application/json'],
  );
  const selected = success ?? fallback;

  if (!selected) {
    return undefined;
  }

  return [selected[0], selected[1].content?.['application/json'] ?? {}];
}

function generateSchemaExample(
  schema: unknown,
  { mode }: { mode: 'request' | 'response' },
): unknown {
  if (!isRecord(schema)) {
    return undefined;
  }

  if (schema.example !== undefined) {
    return schema.example;
  }

  if (schema.default !== undefined) {
    return schema.default;
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  const type = getSchemaType(schema);

  if (type === 'object') {
    const properties = isRecord(schema.properties) ? schema.properties : {};
    const required = new Set(arrayOfStrings(schema.required));
    const entries = Object.entries(properties).filter(([, child]) => {
      if (!isRecord(child)) {
        return true;
      }

      return mode === 'request' ? child.readOnly !== true : child.writeOnly !== true;
    });
    const requiredEntries = entries.filter(([name]) => required.has(name));
    const selected =
      requiredEntries.length > 0
        ? requiredEntries
        : entries.slice(0, mode === 'request' ? 5 : 8);
    const value = Object.fromEntries(
      selected.flatMap(([name, child]) => {
        const example = generateSchemaExample(child, { mode });
        return example === undefined ? [] : [[name, example]];
      }),
    );

    return Object.keys(value).length > 0 ? value : undefined;
  }

  if (type === 'array') {
    const item = generateSchemaExample(schema.items, { mode });
    return item === undefined ? [] : [item];
  }

  if (type.includes('integer') || type.includes('number')) {
    return 0;
  }

  if (type.includes('boolean')) {
    return true;
  }

  return getStringPlaceholder(schema);
}

function buildCurlExample({
  operation,
  requestBodyJson,
  serverUrl,
}: {
  operation: NormalizedOpenApiOperation;
  requestBodyJson?: OpenApiJsonValue;
  serverUrl: string;
}) {
  const lines = [
    `curl -X ${operation.method} "${joinUrl(serverUrl, operation.path)}" \\`,
    '  -H "Content-Type: application/json" \\',
    '  -H "Authorization: agora token=\\"<your-token>\\""',
  ];

  if (requestBodyJson !== undefined) {
    lines[lines.length - 1] = `${lines.at(-1)} \\`;
    lines.push(`  -d '${JSON.stringify(requestBodyJson, null, 2)}'`);
  }

  return lines.join('\n');
}

function buildJavaScriptFetchExample({
  operation,
  requestBodyJson,
  serverUrl,
}: {
  operation: NormalizedOpenApiOperation;
  requestBodyJson?: OpenApiJsonValue;
  serverUrl: string;
}) {
  const hasBody = requestBodyJson !== undefined;
  const body = hasBody
    ? `,\n    body: JSON.stringify(${JSON.stringify(requestBodyJson, null, 6).replace(
        /\n/g,
        '\n    ',
      )}),`
    : '';

  return `const response = await fetch(
  '${joinUrl(serverUrl, operation.path)}',
  {
    method: '${operation.method}',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'agora token="<your-token>"',
    }${body}
  },
);

const data = await response.json();`;
}

function joinUrl(serverUrl: string, operationPath: string) {
  return `${serverUrl.replace(/\/$/, '')}/${operationPath.replace(/^\//, '')}`;
}

function getSchemaType(schema: Record<string, unknown>) {
  if (typeof schema.type === 'string') {
    return schema.type;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(' | ');
  }

  if (isRecord(schema.properties)) {
    return 'object';
  }

  if (isRecord(schema.items)) {
    return 'array';
  }

  return 'string';
}

function getStringPlaceholder(schema: Record<string, unknown>) {
  if (schema.format === 'uri') {
    return 'https://example.com';
  }

  if (schema.format === 'email') {
    return 'user@example.com';
  }

  if (schema.format === 'date-time') {
    return '2026-01-01T00:00:00Z';
  }

  return 'string';
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toExampleJsonValue(value: unknown): OpenApiJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const normalized = toExampleJsonValue(item);
      return normalized === undefined ? [] : [normalized];
    });
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) => {
        const normalized = toExampleJsonValue(item);
        return normalized === undefined ? [] : [[key, normalized]];
      }),
    );
  }

  return undefined;
}
