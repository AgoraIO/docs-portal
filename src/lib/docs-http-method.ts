import type { DocsSidebarNode } from './docs-tree';

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export function parseHttpMethod(value: unknown): HttpMethod | undefined {
  return typeof value === 'string' && HTTP_METHODS.includes(value as HttpMethod)
    ? (value as HttpMethod)
    : undefined;
}

export function parseHttpMethods(
  value: unknown,
): Record<string, HttpMethod> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, value]) => {
      const method = parseHttpMethod(value);
      return key && method ? [[key, method]] : [];
    }),
  );
}

// Authoring checks retain file/key diagnostics; runtime metadata is optional.
export function validateHttpMethodMetadata(
  value: Record<string, unknown>,
  file: string,
): string[] {
  const errors: string[] = [];
  if (value.httpMethod !== undefined && !parseHttpMethod(value.httpMethod))
    errors.push(`${file}: httpMethod must be an uppercase HTTP method`);
  if (value.httpMethods !== undefined) {
    if (
      !value.httpMethods ||
      typeof value.httpMethods !== 'object' ||
      Array.isArray(value.httpMethods)
    )
      errors.push(
        `${file}: httpMethods must map heading fragments to HTTP methods`,
      );
    else
      for (const [key, method] of Object.entries(value.httpMethods))
        if (!key || !parseHttpMethod(method))
          errors.push(
            `${file}: httpMethods.${key} must be an uppercase HTTP method`,
          );
  }
  return errors;
}

export type RestMethodTocItem = {
  title: string;
  url: string;
  search?: Record<string, string>;
};

export type DocsHttpMethodPage = {
  url: string;
  data: DocsHttpMethodMetadata;
  toc?: RestMethodTocItem[];
};

export type DocsHttpMethodMetadata = {
  httpMethod?: HttpMethod;
  httpMethods?: Record<string, HttpMethod>;
};

// Decorate the completed sidebar so product embeds and article fragments use
// the same metadata as direct API links. OpenAPI remains authoritative.
export function withDocsHttpMethods(
  nodes: DocsSidebarNode[],
  pages: DocsHttpMethodPage[],
): DocsSidebarNode[] {
  const metadata = new Map(pages.map((page) => [page.url, page]));
  function targetFor(node: Extract<DocsSidebarNode, { type: 'page' }>) {
    const [pageUrl, fragment] = node.url.split('#');
    const toc = metadata.get(pageUrl)?.toc;
    return fragment
      ? (toc?.find((item) => item.url === `#${fragment}`) ??
          toc?.find((item) => item.title === node.title))
      : undefined;
  }
  const existingUrls = new Set<string>();
  function collect(nodes: DocsSidebarNode[]) {
    for (const node of nodes) {
      if (node.type === 'section') collect(node.children);
      else {
        const target = targetFor(node);
        existingUrls.add(
          target ? node.url.split('#')[0] + target.url : node.url,
        );
      }
    }
  }
  collect(nodes);

  function visit(node: DocsSidebarNode): DocsSidebarNode {
    if (node.type === 'section') {
      return { ...node, children: node.children.map(visit) };
    }
    if (node.method || node.external) return node;

    const [pageUrl, fragment] = node.url.split('#');
    const page = metadata.get(pageUrl);
    const data = page?.data;
    if (!fragment && data?.httpMethods && page?.toc) {
      const operations = page.toc.flatMap((item) => {
        const fragment = item.url.slice(1);
        if (!Object.hasOwn(data.httpMethods ?? {}, fragment)) return [];
        const url = pageUrl + item.url;
        if (existingUrls.has(url)) return [];
        existingUrls.add(url);
        const { platform, ...search } = { ...node.search, ...item.search };
        return [
          {
            ...node,
            id: url,
            href: platform ? `${pageUrl}/${platform}${item.url}` : url,
            method: data.httpMethods?.[fragment],
            methodSource: 'authored' as const,
            search,
            title: item.title,
            url,
          },
        ];
      });
      if (operations.length > 0) {
        return {
          id: `${node.id}-http-operations`,
          title: node.title,
          type: 'section',
          collapsible: true,
          children: [{ ...node, title: 'Overview' }, ...operations],
        };
      }
    }
    const target = targetFor(node);
    const methodFragment = target?.url.slice(1) ?? fragment;
    const method = methodFragment
      ? data?.httpMethods && Object.hasOwn(data.httpMethods, methodFragment)
        ? data.httpMethods[methodFragment]
        : undefined
      : data?.httpMethod;
    if (fragment && page?.toc && !target) {
      // Keep the old article entrance, but never link into an absent platform heading.
      return { ...node, url: pageUrl, href: pageUrl, method: undefined };
    }
    const { platform, ...search } = { ...node.search, ...target?.search };
    return method
      ? {
          ...node,
          method,
          methodSource: 'authored',
          ...(target
            ? {
                title: target.title,
                url: pageUrl + target.url,
                search,
                href: platform
                  ? `${pageUrl}/${platform}${target.url}`
                  : pageUrl + target.url,
              }
            : {}),
        }
      : node;
  }

  return nodes.map(visit);
}
