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

export type DocsHttpMethodMetadata = {
  httpMethod?: HttpMethod;
  httpMethods?: Record<string, HttpMethod>;
};

// Decorate the completed sidebar so product embeds and article fragments use
// the same metadata as direct API links. OpenAPI remains authoritative.
export function withDocsHttpMethods(
  nodes: DocsSidebarNode[],
  pages: { url: string; data: DocsHttpMethodMetadata }[],
): DocsSidebarNode[] {
  const metadata = new Map(pages.map((page) => [page.url, page.data]));

  function visit(node: DocsSidebarNode): DocsSidebarNode {
    if (node.type === 'section') {
      return { ...node, children: node.children.map(visit) };
    }
    if (node.method || node.external) return node;

    const [pageUrl, fragment] = node.url.split('#');
    const data = metadata.get(pageUrl);
    const method = fragment
      ? data?.httpMethods && Object.hasOwn(data.httpMethods, fragment)
        ? data.httpMethods[fragment]
        : undefined
      : data?.httpMethod;
    return method ? { ...node, method } : node;
  }

  return nodes.map(visit);
}
