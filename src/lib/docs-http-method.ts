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
  const existingUrls = new Set<string>();
  function collect(nodes: DocsSidebarNode[]) {
    for (const node of nodes) {
      if (node.type === 'section') collect(node.children);
      else existingUrls.add(node.url);
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
            ...(platform ? { href: `${pageUrl}/${platform}${item.url}` } : {}),
            method: data.httpMethods?.[fragment],
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
    const method = fragment
      ? data?.httpMethods && Object.hasOwn(data.httpMethods, fragment)
        ? data.httpMethods[fragment]
        : undefined
      : data?.httpMethod;
    return method ? { ...node, method } : node;
  }

  return nodes.map(visit);
}
