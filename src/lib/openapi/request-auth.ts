import type { CodeUsageGenerator } from 'fumadocs-openapi/requests/generators';
import { resolveLocalOpenApiReference } from './schema-tree';

type RecordValue = Record<string, unknown>;
type Request = Parameters<CodeUsageGenerator['generate']>[0];

/** Apply one complete security alternative to static examples, without changing
 * the source contract or overwriting explicit parameter examples. */
export function withOpenApiRequestAuth(
  data: Request,
  operation: RecordValue,
  document: RecordValue,
): Request {
  const security = operation.security ?? document.security;
  if (!Array.isArray(security) || security.length === 0) return data;
  // An empty alternative explicitly permits anonymous requests.
  if (security.some((item) => Object.keys(item).length === 0)) return data;
  const components = document.components as RecordValue | undefined;
  const schemes = components?.securitySchemes as RecordValue | undefined;
  const requirements = Object.keys(security[0]);
  const next = {
    ...data,
    header: { ...data.header },
    cookie: { ...data.cookie },
    query: { ...data.query },
  };
  for (const key of requirements) {
    const scheme = resolveLocalOpenApiReference(document, schemes?.[key]) as
      | RecordValue
      | undefined;
    if (!scheme) continue;
    let name: string;
    let value: string;
    let location: string;
    if (scheme.type === 'http') {
      const protocol = String(scheme.scheme).toLowerCase();
      if (protocol !== 'basic' && protocol !== 'bearer') continue;
      name = 'Authorization';
      location = 'header';
      value = protocol === 'basic' ? 'Basic <credentials>' : 'Bearer <token>';
    } else if (scheme.type === 'oauth2' || scheme.type === 'openIdConnect') {
      name = 'Authorization';
      location = 'header';
      value = 'Bearer <token>';
    } else if (scheme.type === 'apiKey' && typeof scheme.name === 'string') {
      name = scheme.name;
      location = String(scheme.in);
      value = `<${key}>`;
    } else {
      continue;
    }
    if (location === 'header') {
      if (
        !Object.keys(next.header).some(
          (item) => item.toLowerCase() === name.toLowerCase(),
        )
      )
        next.header[name] = { value };
    } else if (location === 'cookie') {
      next.cookie[name] ??= { value };
    } else if (location === 'query') {
      // Generators receive an already assembled URL.
      const url = new URL(next.url);
      if (!url.searchParams.has(name)) url.searchParams.set(name, value);
      next.url = url.href;
      next.query[name] ??= { values: [value] };
    }
  }
  return next;
}
