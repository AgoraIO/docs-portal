import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type SidebarNode = {
  children?: SidebarNode[];
  linked?: boolean;
  search?: Record<string, string>;
  title?: string;
  type: string;
  url?: string;
};

function findSection(
  nodes: SidebarNode[],
  titles: string[],
): SidebarNode | undefined {
  for (const node of nodes) {
    if (node.type === 'section' && node.title && titles.includes(node.title)) {
      return node;
    }

    if (node.children) {
      const found = findSection(node.children, titles);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function findSections(nodes: SidebarNode[], titles: string[]): SidebarNode[] {
  const sections: SidebarNode[] = [];

  for (const node of nodes) {
    if (node.type === 'section' && node.title && titles.includes(node.title)) {
      sections.push(node);
    }

    if (node.children) {
      sections.push(...findSections(node.children, titles));
    }
  }

  return sections;
}

function findTopLevelSection(
  nodes: SidebarNode[],
  titles: string[],
): SidebarNode | undefined {
  return nodes.find(
    (node) =>
      node.type === 'section' && node.title && titles.includes(node.title),
  );
}

function findPage(
  nodes: SidebarNode[],
  title: string,
  url: string,
): SidebarNode | undefined {
  for (const node of nodes) {
    if (node.type === 'page' && node.title === title && node.url === url) {
      return node;
    }

    if (node.children) {
      const found = findPage(node.children, title, url);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

async function loadSidebar(
  locale: 'en' | 'zh-CN',
  tab: string,
  slugs: string[],
) {
  const payload = await loadDocsPagePayload(locale, tab, slugs);

  if (!payload || 'redirectUrl' in payload) {
    throw new Error(
      `expected docs payload for /${locale}/${tab}/${slugs.join('/')}`,
    );
  }

  return payload.sidebar as SidebarNode[];
}

describe('product API reference sidebar links', () => {
  it.each([
    ['rtc', '/zh-CN/api-reference/api-ref/rtc'],
    ['rtm', '/zh-CN/api-reference/api-ref/signaling/publish'],
    ['speech-to-text', '/zh-CN/api-reference/api-ref/speech-to-text'],
    ['cloud-recording', '/zh-CN/api-reference/api-ref/cloud-recording'],
    ['transcoding', '/zh-CN/api-reference/api-ref/cloud-transcoding'],
    ['usage-analytics', '/zh-CN/api-reference/api-ref/agora-analytics'],
    ['media-push', '/zh-CN/api-reference/api-ref/media-push'],
    ['media-pull', '/zh-CN/api-reference/api-ref/media-pull'],
    ['rtmp-gateway', '/zh-CN/api-reference/api-ref/rtmp-gateway'],
    ['fusion-cdn', '/zh-CN/api-reference/api-ref/fusion-cdn'],
  ])(
    'reads the service API leaf from the Chinese %s realtime-media metadata',
    async (productSlug, url) => {
      const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
        productSlug,
      ]);
      const reference = findSection(sidebar, ['参考', '参考信息']);

      const restApiNode = reference?.children?.find(
        (child) => child.title === '服务端 API',
      );

      expect(restApiNode).toMatchObject({
        title: '服务端 API',
        type: 'page',
        url,
      });
    },
  );

  it.each([
    ['ai', [], 'conversational-ai'],
    ['realtime-media', ['rtc'], 'rtc'],
    ['realtime-media', ['rtm'], 'rtm'],
    ['realtime-media', ['rtsa'], 'rtsa'],
    ['realtime-media', ['whiteboard', 'whiteboard-sdk'], 'whiteboard'],
    ['solutions', ['flexible-classroom'], 'flexible-classroom'],
    ['realtime-media', ['meeting'], 'meeting'],
    ['solutions', ['art-class'], 'online-art-teaching'],
    ['solutions', ['online-ktv', 'online-ktv-sdk'], 'online-ktv'],
    ['solutions', ['online-music-class'], 'online-music-teaching'],
    ['solutions', ['one-to-one-live', 'rtm'], 'private-room'],
    ['solutions', ['teleoperation'], 'teleoperation'],
  ])('adds the %s/%s client API link for %s', async (tab, slugs, productId) => {
    const sidebar = await loadSidebar('zh-CN', tab, slugs);
    const reference = findSection(sidebar, ['参考', '参考信息']);
    const clientApiNode = reference?.children?.find(
      (child) => child.title === '客户端 API',
    );

    expect(clientApiNode).toMatchObject({
      linked: true,
      search: {
        apiType: 'client',
        product: productId,
      },
      title: '客户端 API',
      type: 'page',
      url: '/zh-CN/api-reference/api',
    });
  });

  it('replaces both one-to-one live legacy API links with the filtered client API link', async () => {
    const sidebar = await loadSidebar('zh-CN', 'solutions', [
      'one-to-one-live',
      'rtm',
    ]);
    const references = findSections(sidebar, ['参考', '参考信息']);

    expect(references).toHaveLength(2);
    for (const reference of references) {
      expect(
        reference.children?.filter((child) => child.title === '客户端 API'),
      ).toHaveLength(1);
      expect(
        reference.children?.some(
          (child) => child.title === '1v1 私密房 API 参考',
        ),
      ).toBe(false);
    }
  });

  it('adds the RTC client API link before its metadata service API link', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', ['rtc']);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    expect(reference?.children?.slice(0, 2)).toMatchObject([
      {
        linked: true,
        search: {
          apiType: 'client',
          product: 'rtc',
        },
        title: '客户端 API',
        type: 'page',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '服务端 API',
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/rtc',
      },
    ]);
  });

  it('does not add a client API link to products without a client API', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
      'speech-to-text',
    ]);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    expect(
      reference?.children?.some((child) => child.title === '客户端 API'),
    ).toBe(false);
  });

  it.each(['whiteboard-sdk', 'fastboard-sdk'])(
    'reads the service API leaf from Chinese whiteboard %s metadata',
    async (sdkSlug) => {
      const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
        'whiteboard',
        sdkSlug,
      ]);
      const url = '/zh-CN/api-reference/api-ref/whiteboard/restful';
      const restApiNode = findPage(sidebar, '服务端 API', url);

      expect(restApiNode).toMatchObject({
        title: '服务端 API',
        type: 'page',
        url,
      });
    },
  );

  it.each([
    [
      ['ppt-transcoding'],
      '/zh-CN/api-reference/api-ref/ppt-conversion-service',
    ],
    [
      ['flexible-classroom'],
      '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
    ],
    [['meeting'], '/zh-CN/api-reference/meeting/restful/api/create-room'],
    [
      ['online-ktv', 'ktv-scenario'],
      '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/music-content-center',
    ],
    [
      ['online-ktv', 'online-ktv-sdk'],
      '/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center',
    ],
  ])(
    'reads the service API leaf from the Chinese %s product metadata',
    async (slugs, url) => {
      const tab = slugs[0] === 'meeting' ? 'realtime-media' : 'solutions';
      const sidebar = await loadSidebar('zh-CN', tab, slugs);
      const restApiNode = findPage(sidebar, '服务端 API', url);

      expect(restApiNode).toMatchObject({
        title: '服务端 API',
        type: 'page',
        url,
      });
    },
  );

  it('reads the two VoIP service API leaves from product metadata', async () => {
    const sidebar = await loadSidebar('zh-CN', 'solutions', ['voip-call']);
    const reference = findSection(sidebar, ['参考']);

    expect(reference?.children?.slice(0, 2)).toMatchObject([
      {
        title: '呼叫小程序 API',
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/voip-callkit/call-mini-app',
      },
      {
        title: 'License 管理 API',
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/voip-callkit/activate-license',
      },
    ]);
  });

  it('keeps the existing English realtime-media RESTful API injection', async () => {
    const sidebar = await loadSidebar('en', 'realtime-media', ['voice']);
    const reference = findSection(sidebar, ['Reference']);

    expect(reference?.children?.[0]).toMatchObject({
      title: 'RESTful API',
      type: 'page',
      url: '/en/api-reference/api-ref/rtc',
    });
  });

  it('reads the service API leaf from Chinese AI engine metadata only', async () => {
    const sidebar = await loadSidebar('zh-CN', 'ai', []);
    const engineSection = findTopLevelSection(sidebar, ['对话式 AI 引擎']);
    const reference = engineSection?.children
      ? findSection(engineSection.children, ['参考'])
      : undefined;

    expect(reference?.children?.[0]).toMatchObject({
      linked: true,
      search: {
        apiType: 'client',
        product: 'conversational-ai',
      },
      title: '客户端 API',
      type: 'page',
      url: '/zh-CN/api-reference/api',
    });
    expect(reference?.children?.[1]).toMatchObject({
      title: '服务端 API',
      type: 'page',
      url: '/zh-CN/api-reference/api-ref/conversational-ai',
    });

    const deviceKitSection = findTopLevelSection(sidebar, [
      '对话式 AI 开发套件',
    ]);
    const deviceKitReference = deviceKitSection?.children
      ? findSection(deviceKitSection.children, ['参考'])
      : undefined;

    expect(
      deviceKitReference?.children?.some(
        (child) =>
          child.type === 'page' &&
          (child.url === '/zh-CN/api-reference/api-ref/conversational-ai' ||
            child.title === '客户端 API'),
      ) ?? false,
    ).toBe(false);
  });

  it.each([
    [
      'content/docs/zh-CN/ai/reference/meta.json',
      '/zh-CN/api-reference/api-ref/conversational-ai',
    ],
    [
      'content/docs/zh-CN/realtime-media/rtc/reference/meta.json',
      '/zh-CN/api-reference/api-ref/rtc',
    ],
    [
      'content/docs/zh-CN/realtime-media/rtm/reference/meta.json',
      '/zh-CN/api-reference/api-ref/signaling/publish',
    ],
    [
      'content/docs/zh-CN/realtime-media/speech-to-text/reference/meta.json',
      '/zh-CN/api-reference/api-ref/speech-to-text',
    ],
    [
      'content/docs/zh-CN/realtime-media/cloud-recording/reference/meta.json',
      '/zh-CN/api-reference/api-ref/cloud-recording',
    ],
    [
      'content/docs/zh-CN/realtime-media/transcoding/reference/meta.json',
      '/zh-CN/api-reference/api-ref/cloud-transcoding',
    ],
    [
      'content/docs/zh-CN/realtime-media/usage-analytics/reference/meta.json',
      '/zh-CN/api-reference/api-ref/agora-analytics',
    ],
    [
      'content/docs/zh-CN/realtime-media/media-push/reference/meta.json',
      '/zh-CN/api-reference/api-ref/media-push',
    ],
    [
      'content/docs/zh-CN/realtime-media/media-pull/reference/meta.json',
      '/zh-CN/api-reference/api-ref/media-pull',
    ],
    [
      'content/docs/zh-CN/realtime-media/rtmp-gateway/reference/meta.json',
      '/zh-CN/api-reference/api-ref/rtmp-gateway',
    ],
    [
      'content/docs/zh-CN/realtime-media/fusion-cdn/reference/meta.json',
      '/zh-CN/api-reference/api-ref/fusion-cdn',
    ],
    [
      'content/docs/zh-CN/realtime-media/danmaku/reference/meta.json',
      '/zh-CN/api-reference/api-ref/danmaku',
    ],
    [
      'content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/reference/meta.json',
      '/zh-CN/api-reference/api-ref/whiteboard/restful',
    ],
    [
      'content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/reference/meta.json',
      '/zh-CN/api-reference/api-ref/whiteboard/restful',
    ],
    [
      'content/docs/zh-CN/solutions/ppt-transcoding/reference/meta.json',
      '/zh-CN/api-reference/api-ref/ppt-conversion-service',
    ],
    [
      'content/docs/zh-CN/solutions/flexible-classroom/reference/meta.json',
      '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
    ],
    [
      'content/docs/zh-CN/realtime-media/meeting/reference/meta.json',
      '/zh-CN/api-reference/meeting/restful/api/create-room',
    ],
    [
      'content/docs/zh-CN/solutions/online-ktv/ktv-scenario/reference/meta.json',
      '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/music-content-center',
    ],
    [
      'content/docs/zh-CN/solutions/online-ktv/online-ktv-sdk/reference/meta.json',
      '/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center',
    ],
  ])('declares the service API link in %s', (metaPath, url) => {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
      pages: unknown[];
    };

    expect(meta.pages).toContain(`[服务端 API](${url})`);
  });
});
