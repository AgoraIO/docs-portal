import { describe, expect, it } from 'vitest';
import {
  getDocVersionCatalogPages,
  getDocVersionCatalogScope,
  hasDocVersionCatalog,
} from './doc-version-navigation';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';

function sidebarUrls(nodes: DocsSidebarNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === 'page' ? [node.url] : sidebarUrls(node.children),
  );
}

describe('real ConvoAI edition sidebars', () => {
  it.each([[], ['api-ref', 'server-sdk', 'platform', 'go']])(
    'has a version-aware Voice Agents catalog for %s',
    async (...slug) => {
      const payload = await loadDocsPagePayload('en', 'api-reference', slug);
      if (!payload || 'redirectUrl' in payload)
        throw new Error('Expected Reference content');
      expect(hasDocVersionCatalog(payload.sidebar, payload.activePath)).toBe(
        true,
      );
      const catalog = payload.sidebar.find(
        (node) =>
          node.type === 'section' &&
          getDocVersionCatalogScope(payload.activePath, node.id),
      );
      if (catalog?.type !== 'section')
        throw new Error('Missing Voice Agents section');
      const scope = getDocVersionCatalogScope(payload.activePath, catalog.id);
      if (!scope) throw new Error('Missing catalog registration');
      const urls = sidebarUrls(
        getDocVersionCatalogPages(catalog.children, scope, 'v2'),
      );
      for (const language of ['python', 'typescript', 'go'])
        expect(urls).toContain(
          `/en/api-reference/api-ref/server-sdk/platform/${language}`,
        );
      expect(urls).toContain(
        '/en/api-reference/api-ref/conversational-ai/platform',
      );
    },
  );
  it.each([{ slug: [] }, { slug: ['build', 'managed-mode'] }])(
    'preserves the complete Main catalog for $slug',
    async ({ slug }) => {
      const payload = await loadDocsPagePayload('en', 'ai', slug);
      if (!payload || 'redirectUrl' in payload)
        throw new Error('Expected a Main guide');
      expect(payload.sidebar.map((node) => node.title)).toEqual([
        'Voice Agent overview',
        'Voice agent in apps',
        'Agent Studio',
        'Voice agent on dedicated devices',
      ]);
      expect(payload.sidebarHeader).toBeUndefined();
      const urls = sidebarUrls(payload.sidebar);
      expect(urls).toContain('/en/ai/studio/quickstart');
      expect(urls).toContain('/en/ai/device-kit/build/device-controls');
      expect(urls).not.toContain('/en/ai/platform');
      expect(
        urls.filter((url) => url === '/en/ai/reference/pricing'),
      ).toHaveLength(1);
      expect(urls.some((url) => url.includes('/platform/'))).toBe(false);
    },
  );

  it('keeps Preview SDK links and excludes deferred content and independent products', async () => {
    const payload = await loadDocsPagePayload('en', 'ai', ['platform']);
    if (!payload || 'redirectUrl' in payload)
      throw new Error('Expected a Preview guide');
    const urls = sidebarUrls(payload.sidebar);
    for (const language of ['python', 'typescript', 'go']) {
      expect(urls).toContain(
        `/en/api-reference/api-ref/server-sdk/platform/${language}`,
      );
    }
    expect(urls).toContain(
      '/en/api-reference/api-ref/conversational-ai/platform',
    );
    expect(urls).not.toContain('/en/ai/platform/get-started/quickstart');
    expect(urls).not.toContain('/en/ai/platform/models/tts/generic-http');
    expect(urls.some((url) => url.startsWith('/en/ai/studio'))).toBe(false);
    expect(urls.some((url) => url.startsWith('/en/ai/device-kit'))).toBe(false);
    expect(payload.sidebarHeader).not.toHaveProperty('backHref');
  });

  it('keeps the API selector context while removing retired operations', async () => {
    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'conversational-ai',
      'platform',
      'start-session',
    ]);
    if (!payload || 'redirectUrl' in payload)
      throw new Error('Expected a Preview API page');
    const urls = sidebarUrls(payload.sidebar);
    expect(urls).toContain(
      '/en/api-reference/api-ref/conversational-ai/platform/start-session',
    );
    for (const operation of ['speak', 'inject-context', 'interrupt']) {
      expect(urls).not.toContain(
        `/en/api-reference/api-ref/conversational-ai/platform/${operation}`,
      );
    }
    expect(payload.sidebarHeader).not.toHaveProperty('backHref');
  });
});
