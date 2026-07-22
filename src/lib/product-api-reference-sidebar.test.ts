import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type SidebarNode = {
  children?: SidebarNode[];
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

function findTopLevelSection(
  nodes: SidebarNode[],
  titles: string[],
): SidebarNode | undefined {
  return nodes.find(
    (node) =>
      node.type === 'section' && node.title && titles.includes(node.title),
  );
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
  ])('adds a RESTful API leaf to the Chinese %s realtime-media reference section', async (productSlug, url) => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', [productSlug]);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    const restApiNode = reference?.children?.find(
      (child) => child.title === 'RESTful API',
    );

    expect(restApiNode).toMatchObject({
      title: 'RESTful API',
      type: 'page',
      url,
    });
  });

  it('adds the RTC client API picker before its RESTful API link', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', ['rtc']);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    expect(reference?.children?.slice(0, 2)).toMatchObject([
      {
        pickerItems: expect.arrayContaining([
          {
            platformId: 'android',
            title: 'Android',
            url: '/zh-CN/api-reference/rtc/android/rtc-api-overview',
          },
          {
            platformId: 'unreal-blueprint',
            title: 'Unreal (Blueprint)',
            url: '/zh-CN/api-reference/rtc/unreal-blueprint/rtc-api-overview',
          },
        ]),
        title: '客户端 API',
        type: 'page',
      },
      {
        title: 'RESTful API',
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/rtc',
      },
    ]);
  });

  it('adds a RESTful API leaf to nested Chinese whiteboard reference sections', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
      'whiteboard',
      'whiteboard-sdk',
    ]);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    expect(reference?.children?.[0]).toMatchObject({
      title: 'RESTful API',
      type: 'page',
      url: '/zh-CN/api-reference/api-ref/whiteboard/restful',
    });
  });

  it.each([
    ['ppt-transcoding', '/zh-CN/api-reference/api-ref/ppt-conversion-service'],
    ['voip-call', '/zh-CN/api-reference/api-ref/voip-callkit'],
    [
      'flexible-classroom',
      '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
    ],
  ])('adds a RESTful API leaf to the Chinese %s solutions reference section', async (productSlug, url) => {
    const sidebar = await loadSidebar('zh-CN', 'solutions', [productSlug]);
    const reference = findSection(sidebar, ['参考', '参考信息']);

    expect(reference?.children?.[0]).toMatchObject({
      title: 'RESTful API',
      type: 'page',
      url,
    });
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

  it('adds a RESTful API leaf to the Chinese AI engine reference section only', async () => {
    const sidebar = await loadSidebar('zh-CN', 'ai', []);
    const engineSection = findTopLevelSection(sidebar, ['对话式 AI 引擎']);
    const reference = engineSection?.children
      ? findSection(engineSection.children, ['参考'])
      : undefined;

    expect(reference?.children?.[0]).toMatchObject({
      linked: true,
      title: 'RESTful API',
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
          child.url === '/zh-CN/api-reference/api-ref/conversational-ai',
      ) ?? false,
    ).toBe(false);
  });
});
