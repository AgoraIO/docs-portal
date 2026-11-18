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
        sidebar: product.sidebar,
        sidebarHeader: product.sidebarHeader,
      }
    : api;
}
