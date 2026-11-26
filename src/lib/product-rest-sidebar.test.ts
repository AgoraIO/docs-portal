import { describe, expect, it, vi } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';
import {
  getProductSidebarSource,
  withProductSidebar,
} from './product-rest-sidebar';
import { realtimeMediaApiReferenceLinks } from './realtime-media-api-reference-links';

async function load(path: string) {
  const [locale, tab, ...slug] = path.slice(1).split('/');
  const page = await loadDocsPagePayload(locale, tab, slug);
  if (!page || 'redirectUrl' in page)
    throw new Error('Missing document: ' + path);
  return page;
}

function flatten(nodes: DocsSidebarNode[]): DocsSidebarNode[] {
  return nodes.flatMap((n) =>
    n.type === 'page' ? [n] : [n, ...flatten(n.children)],
  );
}

describe('English product REST menus', () => {
  it.each(realtimeMediaApiReferenceLinks.filter((p) => 'restUrl' in p))(
    'embeds the existing reference for $productSlug',
    async (product) => {
      const deep = ['iot', 'agora-analytics', 'flexible-classroom'].includes(
        product.productSlug,
      );
      const path =
        '/en/realtime-media/' +
        product.productSlug +
        (deep ? '/product-overview' : '');
      const page = await load(path);
      const menu = flatten(page.sidebar).find((n) => n.title === 'RESTful API');
      if (menu?.type !== 'section') throw new Error('Missing menu for ' + path);
      expect(menu.collapsible).toBe(true);
      const children = flatten(menu.children);
      const urls = children.filter((n) => n.type === 'page').map((n) => n.url);
      expect(urls).toContain(product.restUrl);
      expect(new Set(urls).size).toBe(urls.length);
      expect(
        children.every((n) =>
          n.type === 'section'
            ? n.collapsible
            : n.search?.from === path && !n.external,
        ),
      ).toBe(true);
      if (product.productSlug === 'iot')
        expect(urls).toContain(
          '/en/api-reference/api-ref/rtc/query-channel-list',
        );
      if (product.productSlug === 'im')
        expect(
          menu.children.some(
            (n) =>
              n.type === 'section' && n.title === 'Manage messaging and users',
          ),
        ).toBe(true);
      if (product.productSlug === 'media-pull')
        expect(urls).toContain(product.restUrl + '#create-api');
      if (product.productSlug === 'flexible-classroom')
        expect(urls).toContain(product.restUrl + '#create-a-classroom');
      if (product.productSlug === 'agora-analytics')
        expect(urls).toContain(product.restUrl + '#get-call-list');
    },
  );

  it('keeps Preview groups, method labels, and the product sidebar on its own endpoints only', async () => {
    const product = await load('/en/ai/platform');
    const api = await load(
      '/en/api-reference/api-ref/conversational-ai/platform/create-agent',
    );
    const groups = flatten(product.sidebar).filter(
      (n) => n.title === 'Agents' && n.type === 'section',
    );
    expect(groups).toHaveLength(1);
    const links = flatten(product.sidebar).filter(
      (n) => n.type === 'page' && n.url === api.activePath,
    );
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      method: 'POST',
      search: { from: product.activePath },
    });
    const fetchProduct = vi.fn(async () => product);
    expect(await withProductSidebar(api, undefined, fetchProduct)).toBe(api);
    expect(fetchProduct).not.toHaveBeenCalled();
    expect(
      await withProductSidebar(api, product.activePath, fetchProduct),
    ).toMatchObject({
      activePath: api.activePath,
      activeTab: 'ai',
      sidebar: product.sidebar,
      body: api.body,
    });
    const unrelated = await load(
      '/en/api-reference/api-ref/rtc/create-ban-rule',
    );
    expect(
      await withProductSidebar(unrelated, product.activePath, fetchProduct),
    ).toBe(unrelated);
    expect(getProductSidebarSource('//example.com')).toBeUndefined();
    expect(
      getProductSidebarSource('/en/ai/../../api-reference'),
    ).toBeUndefined();
  });
  it('shows one Main edition REST menu without Preview endpoints', async () => {
    const page = await load('/en/ai');
    const entries = flatten(page.sidebar).filter((n) =>
      /^REST(ful)? API$/.test(n.title),
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('section');
    const nodes = flatten(page.sidebar);
    expect(
      nodes.some(
        (n) => n.type === 'page' && n.url.endsWith('/conversational-ai/join'),
      ),
    ).toBe(true);
    expect(
      nodes.some(
        (n) => n.type === 'page' && n.url.endsWith('/platform/create-agent'),
      ),
    ).toBe(false);
  });
});
