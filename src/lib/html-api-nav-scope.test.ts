import type { Folder, Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import {
  getScopedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';
import { source } from './source.server';

const affectedRoutes = [
  {
    root: '/zh-CN/api-reference/rtc/android',
    route: '/zh-CN/api-reference/rtc/android/class-videocanvas',
  },
  {
    root: '/zh-CN/api-reference/rtc/web',
    route: '/zh-CN/api-reference/rtc/web/interfaces/iagora-rtc',
  },
  {
    root: '/zh-CN/api-reference/iot-apaas/android',
    route:
      '/zh-CN/api-reference/iot-apaas/android/interfacecom-1-1agora-1-1iotsdk20-1-1-i-agora-iot-app-sdk',
  },
  {
    root: '/zh-CN/api-reference/local-server-recording/cpp',
    route:
      '/zh-CN/api-reference/local-server-recording/cpp/classagora-1-1recording-1-1-i-recording-engine',
  },
  {
    root: '/zh-CN/api-reference/local-server-recording/java',
    route:
      '/zh-CN/api-reference/local-server-recording/java/classio-1-1agora-1-1recording-1-1-recording-s-d-k',
  },
  {
    root: '/zh-CN/api-reference/rtc-server-sdk/cpp-api',
    route:
      '/zh-CN/api-reference/rtc-server-sdk/cpp-api/classagora-1-1base-1-1-i-agora-service',
  },
  {
    root: '/zh-CN/api-reference/rtc-server-sdk/java-api',
    route:
      '/zh-CN/api-reference/rtc-server-sdk/java-api/classio-1-1agora-1-1rtc-1-1-agora-service',
  },
  {
    root: '/zh-CN/api-reference/rtsa/c',
    route: '/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h',
  },
];

function getZhNodeMeta(node: Folder | Root) {
  // Fumadocs exposes different internal Folder generics for the tree and
  // metadata lookup even though they represent the same generated node.
  // biome-ignore lint/suspicious/noExplicitAny: bridge Fumadocs loader generics
  return source.getNodeMeta(node as any, 'zh-CN')?.data;
}

function collectPageUrls(nodes: DocsSidebarNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.type === 'section') return collectPageUrls(node.children);
    return node.type === 'page' ? [node.url] : [];
  });
}

describe('migrated HTML API navigation scopes', () => {
  it.each(affectedRoutes)('uses the generated local sidebar for $root', async ({
    root: routeRoot,
    route,
  }) => {
    const navScope = resolveDocsNavScope({
      activePath: route,
      getNodeMeta: getZhNodeMeta,
      root: source.getPageTree('zh-CN'),
      tab: 'api-reference',
    });

    if (route.endsWith('/class-videocanvas')) {
      expect(source.getPages('zh-CN').map((page) => page.url)).toContain(route);
      expect(
        source.getPage(
          ['api-reference', 'rtc', 'android', 'class-videocanvas'],
          'zh-CN',
        ),
      ).toBeDefined();
      const payload = await loadDocsPagePayload('zh-CN', 'api-reference', [
        'rtc',
        'android',
        'class-videocanvas',
      ]);
      expect(
        payload && 'activePath' in payload ? payload.activePath : null,
      ).toBe(route);
    }

    expect(navScope).not.toBeNull();
    if (!navScope) return;

    const urls = collectPageUrls(
      getScopedNavScopeSidebarNodes({
        getNodeMeta: getZhNodeMeta,
        navScope,
      }),
    );
    expect(urls.length).toBeGreaterThan(1);
    expect(urls.every((url) => url.startsWith(routeRoot))).toBe(true);
    expect(urls.some((url) => /doxygen-crawl|-members/.test(url))).toBe(false);
  });
});
