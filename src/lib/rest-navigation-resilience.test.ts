import { afterEach, expect, it, vi } from 'vitest';
import type { DocsSidebarNode } from './docs-tree';

const fault = vi.hoisted(() => ({ enabled: false, hits: 0 }));
vi.mock('fumadocs-core/content/toc', async (original) => {
  const actual = await original<typeof import('fumadocs-core/content/toc')>();
  return {
    ...actual,
    getTableOfContents: (
      ...args: Parameters<typeof actual.getTableOfContents>
    ) => {
      if (fault.enabled && String(args[0]).includes('Create a push label')) {
        fault.hits++;
        throw new Error('Temporary sibling TOC failure');
      }
      return actual.getTableOfContents(...args);
    },
  };
});

import { loadDocsPagePayload } from './docs-page.server';
import { withProductSidebar } from './product-rest-sidebar';

async function load(path: string) {
  const [locale, tab, ...slug] = path.slice(1).split('/');
  const page = await loadDocsPagePayload(locale, tab, slug);
  if (!page || 'redirectUrl' in page) throw new Error(`Missing ${path}`);
  return page;
}
function links(
  nodes: DocsSidebarNode[],
): Extract<DocsSidebarNode, { type: 'page' }>[] {
  return nodes.flatMap((n) => (n.type === 'page' ? [n] : links(n.children)));
}
afterEach(() => {
  fault.enabled = false;
});
const push = '/en/api-reference/api-ref/im/push-notification-management';

it('keeps overview body and ordinary sibling links available on TOC failure, then retries', async () => {
  fault.enabled = true;
  const failed = await load('/en/realtime-media/im');
  expect(fault.hits).toBeGreaterThan(0);
  expect(failed.body).toBeTruthy();
  expect(links(failed.sidebar).some((n) => n.url === push)).toBe(true);
  fault.enabled = false;
  const recovered = await load('/en/realtime-media/im');
  expect(
    links(recovered.sidebar).some(
      (n) => n.url.startsWith(push + '#') && n.method,
    ),
  ).toBe(true);
  expect((await load('/en/realtime-media/media-pull')).body).toBeTruthy();
}, 30000);

it('retains the original reference navigation alongside local operations', async () => {
  const page = await load(
    '/en/api-reference/api-ref/broadcast-streaming/stream-transfer',
  );
  const destinations = links(page.sidebar);
  expect(destinations.length).toBeGreaterThan(70);
  expect(destinations.some((n) => n.url === '/en/api-reference')).toBe(true);
  expect(
    destinations.some((n) => n.url.includes('stream-transfer#') && n.method),
  ).toBe(true);
});

it('does not import Android operations into a Web article', async () => {
  const page = await load(push + '/web');
  expect(
    links(page.sidebar).filter((n) => n.url.startsWith(push + '#') && n.method),
  ).toEqual([]);
});

it('keeps the selected iOS platform when restoring a product sidebar', async () => {
  const api = await load(push + '/ios');
  const product = await load('/en/realtime-media/im');
  const result = await withProductSidebar(
    api,
    '/en/realtime-media/im',
    ({ locale, tab, slugSegments }) =>
      loadDocsPagePayload(locale, tab, slugSegments),
  );
  const operations = links(result.sidebar).filter(
    (n) => n.url.startsWith(push + '#') && n.method,
  );
  expect(operations.length).toBeGreaterThan(0);
  expect(operations.every((n) => n.href?.startsWith(push + '/ios#'))).toBe(
    true,
  );
  expect(
    operations.every((n) => n.search?.from === '/en/realtime-media/im'),
  ).toBe(true);
  const unrelated = (nodes: DocsSidebarNode[]) =>
    links(nodes)
      .filter((n) => n.url.split('#')[0] !== push)
      .map((n) => n.url)
      .sort();
  expect(unrelated(result.sidebar)).toEqual(unrelated(product.sidebar));
});
