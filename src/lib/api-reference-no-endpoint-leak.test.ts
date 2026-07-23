import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type SidebarNode = {
  type: string;
  title?: string;
  url?: string;
  method?: string;
  children?: SidebarNode[];
};

function findSection(
  nodes: SidebarNode[],
  title: string,
): SidebarNode | undefined {
  for (const node of nodes) {
    if (node.type === 'section' && node.title === title) {
      return node;
    }
    if (node.children) {
      const found = findSection(node.children, title);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function flattenUrls(nodes: SidebarNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.url ? [node.url] : []),
    ...(node.children ? flattenUrls(node.children) : []),
  ]);
}

describe('api reference sidebar does not leak REST endpoint pages', () => {
  it('keeps the Voice & Video product group to platform/REST leaves only', async () => {
    const payload = await loadDocsPagePayload('en', 'api-reference', []);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected an api-reference docs page payload');
    }

    const voiceVideo = findSection(
      payload.sidebar as SidebarNode[],
      'Voice & Video',
    );
    expect(voiceVideo).toBeDefined();
    const children = voiceVideo?.children ?? [];

    // No leaked OpenAPI endpoint pages: none should carry an HTTP method, and
    // none should point at a sub-path beyond the rtc lane landing page.
    expect(children.every((child) => child.type === 'page')).toBe(true);
    expect(children.some((child) => child.method !== undefined)).toBe(false);
    expect(
      children.filter((child) =>
        child.url?.startsWith('/en/api-reference/api-ref/rtc/'),
      ),
    ).toHaveLength(0);

    // The in-portal REST API leaf (lane landing page) must still be present.
    expect(
      children.some((child) => child.url === '/en/api-reference/api-ref/rtc'),
    ).toBe(true);

    // The product group should stay small (13 platform links + 1 REST leaf).
    expect(children.length).toBeLessThanOrEqual(15);
  }, 15_000);

  it('still lists endpoint pages in the focused rtc lane view', async () => {
    const payload = await loadDocsPagePayload('en', 'api-reference', [
      'api-ref',
      'rtc',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected an api-reference docs page payload');
    }

    const urls = flattenUrls(payload.sidebar as SidebarNode[]);
    expect(
      urls.some((url) => url.endsWith('/api-ref/rtc/query-channel-list')),
    ).toBe(true);
  });

  it('lists localized Conversational AI endpoint pages in the focused Chinese lane view', async () => {
    const payload = await loadDocsPagePayload('zh-CN', 'api-reference', [
      'api-ref',
      'conversational-ai',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a Chinese conversational AI lane payload');
    }

    const urls = flattenUrls(payload.sidebar as SidebarNode[]);
    expect(urls).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/conversational-ai',
        '/zh-CN/api-reference/api-ref/conversational-ai/join',
        '/zh-CN/api-reference/api-ref/conversational-ai/leave',
        '/zh-CN/api-reference/api-ref/conversational-ai/turns',
      ]),
    );
  });

  it('lists localized RTC endpoint pages in the focused Chinese lane view', async () => {
    const payload = await loadDocsPagePayload('zh-CN', 'api-reference', [
      'api-ref',
      'rtc',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a Chinese RTC lane payload');
    }

    const urls = flattenUrls(payload.sidebar as SidebarNode[]);
    expect(urls).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/rtc',
        '/zh-CN/api-reference/api-ref/rtc/authentication',
        '/zh-CN/api-reference/api-ref/rtc/query-channel-list',
        '/zh-CN/api-reference/api-ref/rtc/query-user-list',
        '/zh-CN/api-reference/api-ref/rtc/query-ip-address',
      ]),
    );
    expect(urls).not.toContain('/zh-CN/api-reference/overview');
  });

  it('keeps the Chinese Speech-to-Text lane out of root navigation and lists focused endpoints', async () => {
    const overviewPayload = await loadDocsPagePayload(
      'zh-CN',
      'api-reference',
      ['overview'],
    );

    if (!overviewPayload || 'redirectUrl' in overviewPayload) {
      throw new Error('expected a Chinese api-reference overview payload');
    }

    const overviewUrls = flattenUrls(overviewPayload.sidebar as SidebarNode[]);
    expect(
      findSection(overviewPayload.sidebar as SidebarNode[], '实时转录翻译'),
    ).toBeUndefined();
    expect(overviewUrls).not.toContain(
      '/zh-CN/api-reference/api-ref/speech-to-text',
    );

    const focusedPayload = await loadDocsPagePayload('zh-CN', 'api-reference', [
      'api-ref',
      'speech-to-text',
    ]);

    if (!focusedPayload || 'redirectUrl' in focusedPayload) {
      throw new Error('expected a Chinese Speech-to-Text lane payload');
    }

    const urls = flattenUrls(focusedPayload.sidebar as SidebarNode[]);
    expect(urls).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/speech-to-text',
        '/zh-CN/api-reference/api-ref/speech-to-text/join',
        '/zh-CN/api-reference/api-ref/speech-to-text/query',
        '/zh-CN/api-reference/api-ref/speech-to-text/leave',
        '/zh-CN/api-reference/api-ref/speech-to-text/update',
        '/zh-CN/api-reference/api-ref/speech-to-text/list',
      ]),
    );
  });

  it('does not list English Signaling REST endpoints in the focused Chinese RTM REST view', async () => {
    const payload = await loadDocsPagePayload('zh-CN', 'api-reference', [
      'api-ref',
      'signaling',
      'publish',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a Chinese RTM REST payload');
    }

    const urls = flattenUrls(payload.sidebar as SidebarNode[]);
    const restApiSection = findSection(
      payload.sidebar as SidebarNode[],
      'RESTful API',
    );

    expect(restApiSection).toBeDefined();
    expect(urls).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/signaling/publish',
        '/zh-CN/api-reference/api-ref/signaling/receive',
      ]),
    );
    expect(urls).not.toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/signaling/peer-to-peer-message',
        '/zh-CN/api-reference/api-ref/signaling/channel-message',
        '/zh-CN/api-reference/api-ref/signaling/message-history',
        '/zh-CN/api-reference/api-ref/signaling/user-events',
        '/zh-CN/api-reference/api-ref/signaling/channel-events',
      ]),
    );
  });
});
