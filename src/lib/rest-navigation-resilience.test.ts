import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

import { type DocsPagePayload, loadDocsPagePayload } from './docs-page.server';
import { withProductSidebar } from './product-rest-sidebar';
import { source } from './source.server';

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

it('keeps ordinary navigation available and retries both failed document reads and failed TOC parsing', async () => {
  fault.enabled = true;
  const failedToc = await load('/en/realtime-media/im');
  expect(fault.hits).toBeGreaterThan(0);
  expect(links(failedToc.sidebar).some((n) => n.url === push)).toBe(true);
  fault.enabled = false;

  const article = source.getPages('en').find((page) => page.url === push);
  if (article?.type !== 'docs') throw new Error('Missing push reference');
  const messageManagement = '/en/api-reference/api-ref/im/message-management';
  const getText = vi
    .spyOn(article.data, 'getText')
    .mockRejectedValueOnce(new Error('Temporary processed document failure'));
  try {
    const failed = await load('/en/realtime-media/im');
    expect(getText).toHaveBeenCalledWith('processed');
    expect(failed.body).toBeTruthy();
    expect(links(failed.sidebar).some((node) => node.url === push)).toBe(true);
    expect(
      links(failed.sidebar).some((node) => node.url === messageManagement),
    ).toBe(true);
  } finally {
    getText.mockRestore();
  }

  const recovered = await load('/en/realtime-media/im');
  expect(
    links(recovered.sidebar).some(
      (n) => n.url.startsWith(push + '#') && n.method,
    ),
  ).toBe(true);
  expect((await load(messageManagement)).body).toBeTruthy();
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

it('writes platform-specific static REST payloads instead of inheriting Android navigation', async () => {
  const { writeAuthoredRestPlatformPayloads } = await import(
    '../../scripts/generate-static-docs-payload.worker.mjs'
  );
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rest-static-'));
  try {
    await writeAuthoredRestPlatformPayloads(root, {
      locale: 'en',
      tab: 'api-reference',
      slugSegments: ['api-ref', 'im', 'push-notification-management'],
      platforms: ['web', 'ios'],
    });
    vi.stubGlobal('fetch', async (url: string) => {
      try {
        const json = JSON.parse(
          await fs.readFile(
            path.join(root, url.replace('/__static/docs/', '')),
            'utf8',
          ),
        );
        return { ok: true, json: async () => json };
      } catch {
        return { ok: false, status: 404 };
      }
    });
    const { resolvePlatformStaticDocsPayload } = await import(
      './docs-static-manifest'
    );
    for (const platform of ['web', 'ios']) {
      const api = await resolvePlatformStaticDocsPayload<DocsPagePayload>({
        locale: 'en',
        tab: 'api-reference',
        slugSegments: [
          'api-ref',
          'im',
          'push-notification-management',
          platform,
        ],
      });
      expect(api).toBeTruthy();
      if (!api) throw new Error(`Missing static ${platform} payload`);
      const result = await withProductSidebar(
        api,
        '/en/realtime-media/im',
        ({ locale, tab, slugSegments }) =>
          loadDocsPagePayload(locale, tab, slugSegments),
      );
      expect(
        links(result.sidebar).find((node) => node.url === push),
      ).toMatchObject({
        href: `${push}/${platform}`,
        search: { from: '/en/realtime-media/im' },
      });
      const operations = links(result.sidebar).filter(
        (n) => n.url.startsWith(push + '#') && n.method,
      );
      if (platform === 'web') expect(operations).toEqual([]);
      else {
        expect(operations.length).toBeGreaterThan(0);
        expect(
          operations.every((n) => n.href?.startsWith(push + '/ios#')),
        ).toBe(true);
      }
      expect(links(result.sidebar).some((n) => !n.url.startsWith(push))).toBe(
        true,
      );
    }
  } finally {
    vi.unstubAllGlobals();
    await fs.rm(root, { recursive: true, force: true });
  }
}, 30000);
