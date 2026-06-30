import { describe, expect, it } from 'vitest';
import {
  buildApiReferenceRail,
  getApiReferenceNodeMeta,
} from './api-reference-sidebar.testkit';
import { resolveDocsNavScope } from './docs-nav-scope';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';
import { source } from './source.server';

function flattenSidebarNodes(nodes: DocsSidebarNode[]): DocsSidebarNode[] {
  return nodes.flatMap((node) =>
    node.type === 'section'
      ? [node, ...flattenSidebarNodes(node.children)]
      : [node],
  );
}

describe('api reference archive removed from sidebar', () => {
  it('omits the "All SDK versions" archive entry from the rail', () => {
    const rail = buildApiReferenceRail();
    const flat = flattenSidebarNodes(rail);

    expect(flat.find((n) => n.title === 'All SDK versions')).toBeUndefined();
    expect(
      flat.find(
        (n) => (n as { url?: string }).url === '/en/api-reference/api-ref',
      ),
    ).toBeUndefined();

    // The api-ref folder must not be expanded inline as a scoped REST submenu:
    // no "RESTful API" section and no lane leaves like "Conversational AI".
    expect(flat.find((n) => n.title === 'RESTful API')).toBeUndefined();
    expect(flat.find((n) => n.title === 'Conversational AI')).toBeUndefined();
  });

  it('keeps a lane navScope-resolvable (focused endpoint sidebar still works)', () => {
    const root = source.getPageTree('en');
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/api-ref/rtc',
      getNodeMeta: getApiReferenceNodeMeta,
      root,
      tab: 'api-reference',
    });
    expect(scope).not.toBeNull();
  });

  it('renders the catalog page with the unified product rail, not the scoped REST submenu', async () => {
    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
    ]);

    const sidebar = (payload as { sidebar?: DocsSidebarNode[] }).sidebar ?? [];
    const flat = flattenSidebarNodes(sidebar);

    expect(flat.find((n) => n.title === 'Voice & Video')).toBeDefined();
    expect(flat.find((n) => n.title === 'RESTful API')).toBeUndefined();
  });

  it('keeps the single-page Console REST API in the unified product rail', async () => {
    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'console',
      'solutions-agora-console-rest-api',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected an api-reference docs page payload');
    }

    const flat = flattenSidebarNodes(payload.sidebar);
    const consoleSection = flat.find(
      (n) => n.type === 'section' && n.title === 'Console',
    ) as Extract<DocsSidebarNode, { type: 'section' }> | undefined;

    expect(payload.sidebarHeader).toBeUndefined();
    expect(consoleSection).toBeDefined();
    expect(consoleSection?.children).toEqual([
      expect.objectContaining({
        title: 'REST API',
        type: 'page',
        url: '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
      }),
    ]);
    expect(
      flat.find((n) => n.type === 'section' && n.title === 'Agora Console'),
    ).toBeUndefined();
  });
});
