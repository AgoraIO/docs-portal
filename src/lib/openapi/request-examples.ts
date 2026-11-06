import type { CodeUsageGenerator } from 'fumadocs-openapi/requests/generators';
import { curl } from 'fumadocs-openapi/requests/generators/curl';
import { resolveLocalOpenApiReference } from './schema-tree';

type RecordValue = Record<string, unknown>;
type GeneratedRequest = Parameters<CodeUsageGenerator['generate']>[0];

/** Preserve literal auth values such as agora token="..." when copied into a shell. */
export const documentationCurl: CodeUsageGenerator = {
  ...curl,
  generate(data, options) {
    const quotedUrl = `'${data.url.replaceAll("'", "'\\''")}'`;
    const prefix = `curl -X ${data.method.toUpperCase()} ${quotedUrl}`;
    const generated = curl.generate({ ...data, header: {} }, options);
    if (!generated.startsWith(prefix))
      throw new Error('Unexpected cURL generator prefix');
    const url = `"${data.url.replace(/(["\\$`])/g, '\\$1')}"`;
    const headers = Object.entries(data.header).map(([name, parameter]) => {
      const value = `${name}: ${parameter.value}`.replaceAll("'", "'\\''");
      return `  --header '${value}'`;
    });
    return (
      [
        `curl --request ${data.method.toUpperCase()}`,
        `  --url ${url}`,
        ...headers,
      ].join(' \\\n') + generated.slice(prefix.length)
    );
  },
};

export type RequestExampleContext = {
  headers: Record<string, string>;
  query: Record<string, string>;
  cookies: Record<string, string>;
  omitBody?: boolean;
  urlTemplate?: string;
};

function record(value: unknown): RecordValue | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : undefined;
}

/** Presentation-only samples: do not change source schemas or parameter required flags. */
export function buildRequestExampleContext(
  document: RecordValue,
  pathItem: RecordValue,
  operation: RecordValue,
  method: string,
  authoredBodyOnly = false,
): RequestExampleContext {
  const result: RequestExampleContext = { headers: {}, query: {}, cookies: {} };
  const resolve = (value: unknown) =>
    record(resolveLocalOpenApiReference(document, value));
  const servers = operation.servers ?? pathItem.servers ?? document.servers;
  const server = Array.isArray(servers) ? record(servers[0]) : undefined;
  if (typeof server?.url === 'string' && typeof operation.__path === 'string') {
    const variables = record(server.variables);
    const base = server.url.replace(/\{([^{}]+)\}/g, (_, name: string) => {
      const defaultValue = record(variables?.[name])?.default;
      return typeof defaultValue === 'string' && defaultValue
        ? defaultValue
        : `:${name}`;
    });
    result.urlTemplate = `${base.replace(/\/+$/, '')}/${operation.__path.replace(/^\/+/, '').replace(/\{([^{}]+)\}/g, ':$1')}`;
  }
  const security = operation.security ?? document.security;
  const requirement = Array.isArray(security) ? record(security[0]) : undefined;
  const schemes = record(record(document.components)?.securitySchemes);
  for (const name of Object.keys(requirement ?? {})) {
    const scheme = resolve(schemes?.[name]);
    if (!scheme) continue;
    if (scheme.type === 'http' && scheme.scheme === 'basic')
      result.headers.Authorization = 'Basic <credentials>';
    else if (
      (scheme.type === 'http' && scheme.scheme === 'bearer') ||
      scheme.type === 'oauth2' ||
      scheme.type === 'openIdConnect'
    )
      result.headers.Authorization = 'Bearer <token>';
    else if (scheme.type === 'apiKey' && typeof scheme.name === 'string') {
      const target =
        scheme.in === 'query'
          ? result.query
          : scheme.in === 'cookie'
            ? result.cookies
            : result.headers;
      target[scheme.name] = '<api-key>';
    }
  }
  const parameters = new Map<string, RecordValue>();
  for (const value of [
    ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation.parameters) ? operation.parameters : []),
  ]) {
    const parameter = resolve(value);
    if (parameter?.in === 'header' && typeof parameter.name === 'string')
      parameters.set(parameter.name.toLowerCase(), parameter);
  }
  for (const parameter of parameters.values()) {
    const name = String(parameter.name);
    const schema = resolve(parameter.schema);
    const examples = record(parameter.examples);
    const firstExample = examples
      ? resolve(Object.values(examples)[0])?.value
      : undefined;
    const example = [
      parameter.example,
      firstExample,
      schema?.example,
      schema?.default,
      Array.isArray(schema?.enum) ? schema.enum[0] : undefined,
    ].find((value) => value !== undefined);
    const existing = Object.keys(result.headers).find(
      (key) => key.toLowerCase() === name.toLowerCase(),
    );
    if (existing && example === undefined) continue;
    if (existing) delete result.headers[existing];
    result.headers[name] =
      example === undefined
        ? `<${typeof schema?.type === 'string' ? schema.type : 'string'}>`
        : typeof example === 'string'
          ? example
          : JSON.stringify(example);
  }

  const body = resolve(operation.requestBody);
  const content = record(body?.content);
  const mediaType =
    content &&
    ('application/json' in content
      ? 'application/json'
      : Object.keys(content)[0]);
  const media = mediaType ? resolve(content?.[mediaType]) : undefined;
  const hasAuthoredBody =
    media &&
    ('example' in media ||
      Object.keys(record(media.examples) ?? {}).length > 0);
  // Legacy Chinese pages only supplied authored bodies, never schema-generated values.
  result.omitBody = authoredBodyOnly && (method === 'get' || !hasAuthoredBody);
  return result;
}

/** Complete each language's input before formatting; retain explicit example payloads. */
export function completeRequestExample(
  data: GeneratedRequest,
  context: RequestExampleContext,
): GeneratedRequest {
  const header = { ...data.header };
  const body = context.omitBody ? undefined : data.body;
  for (const [name, value] of Object.entries(context.headers)) {
    const previous = Object.keys(header).find(
      (key) => key.toLowerCase() === name.toLowerCase(),
    );
    if (previous) delete header[previous];
    header[name] = { value };
  }
  // All three upstream clients add the selected body media type themselves.
  // Leaving a documented Content-Type parameter here emits duplicate/conflicting headers.
  if (data.bodyMediaType) {
    for (const name of Object.keys(header))
      if (name.toLowerCase() === 'content-type') delete header[name];
    if (!body) header['Content-Type'] = { value: data.bodyMediaType };
  }
  const [generatedPath, generatedQuery] = data.url.split('?', 2);
  const path = context.urlTemplate ?? generatedPath;
  const query = new URLSearchParams(generatedQuery);
  for (const [name, value] of Object.entries(context.query))
    if (!query.has(name)) query.set(name, value);
  return {
    ...data,
    url: query.size ? `${path}?${query}` : path,
    header,
    cookie: {
      ...Object.fromEntries(
        Object.entries(context.cookies).map(([name, value]) => [
          name,
          { value },
        ]),
      ),
      ...data.cookie,
    },
    body,
  };
}
