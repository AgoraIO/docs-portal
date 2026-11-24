import type { DocsPagePayload, DocsRedirectPayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';

const productPathPattern =
  /^\/en\/(?:ai(?:\/[\w-]+)*|realtime-media(?:\/[\w-]+)+)$/;

export function getProductSidebarSource(value: unknown) {
  return typeof value === 'string' && productPathPattern.test(value)
    ? value
    : undefined;
}

export async function withProductSidebar(
  api: DocsPagePayload,
  from: string | undefined,
  loadProduct: (input: {
    locale: string;
    tab: string;
    slugSegments: string[];
  }) => Promise<DocsPagePayload | DocsRedirectPayload | null>,
): Promise<DocsPagePayload> {
  if (
    api.activeTab !== 'api-reference' ||
    !api.activePath.startsWith('/en/api-reference/') ||
    !from
  )
    return api;
  const [locale, tab, ...slugSegments] = from.slice(1).split('/');
  const product = await loadProduct({ locale, tab, slugSegments });
  if (!product || 'redirectUrl' in product || product.activePath !== from)
    return api;

  // Only restore this product if its REST menu actually contains the destination.
  function ownsPage(nodes: DocsSidebarNode[]): boolean {
    return nodes.some((node) =>
      node.type === 'section'
        ? ownsPage(node.children)
        : node.search?.from === from &&
          node.url.split('#', 1)[0] === api.activePath,
    );
  }
  return ownsPage(product.sidebar)
    ? {
        ...api,
        activeTab: product.activeTab,
        sidebar: restoreArticleNavigation(product.sidebar, api, from),
        sidebarHeader: product.sidebarHeader,
      }
    : api;
}

// Product overviews have no selected SDK platform. The article's verified menu
// is authoritative when restoring ?from= context on a platform route.
function restoreArticleNavigation(
  nodes: DocsSidebarNode[],
  api: DocsPagePayload,
  from: string,
): DocsSidebarNode[] {
  if (api.body.kind === 'openapi' || !api.body.platformTabs) return nodes;
  const article = api.activePath;
  const { initialPlatform } = api.body.platformTabs;
  function isArticleMenu(node: DocsSidebarNode) {
    return (
      node.type === 'section' &&
      node.children.length > 0 &&
      node.children.every(
        (child) => child.type === 'page' && child.url.split('#')[0] === article,
      ) &&
      node.children.some(
        (child) => child.type === 'page' && child.url === article,
      )
    );
  }
  function findMenu(nodes: DocsSidebarNode[]): DocsSidebarNode | undefined {
    for (const node of nodes) {
      if (node.type !== 'section') continue;
      if (isArticleMenu(node)) return node;
      const found = findMenu(node.children);
      if (found) return found;
    }
  }
  const menu = findMenu(api.sidebar);
  function withContext(node: DocsSidebarNode): DocsSidebarNode {
    return node.type === 'section'
      ? { ...node, children: node.children.map(withContext) }
      : {
          ...node,
          ...(node.url === article && initialPlatform
            ? { href: `${article}/${initialPlatform}` }
            : {}),
          search: { ...node.search, from },
        };
  }
  function restore(node: DocsSidebarNode): DocsSidebarNode {
    if (node.type === 'section') {
      if (isArticleMenu(node)) {
        if (menu) return withContext(menu);
        // A platform without REST operations still retains its article link.
        const overview = node.children.find(
          (child) => child.type === 'page' && child.url === article,
        );
        if (overview) return withContext(overview);
      }
      return { ...node, children: node.children.map(restore) };
    }
    if (node.url === article) return withContext(menu ?? node);
    return node;
  }
  return nodes.map(restore);
}
