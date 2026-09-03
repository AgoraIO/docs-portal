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

const zhCnServiceApiEntries = [
  ['ai', [], '服务端 API', '/zh-CN/api-reference/api-ref/conversational-ai'],
  ['realtime-media', ['rtc'], '服务端 API', '/zh-CN/api-reference/api-ref/rtc'],
  [
    'realtime-media',
    ['rtm'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/signaling/publish',
  ],
  [
    'realtime-media',
    ['cloud-recording'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/cloud-recording',
  ],
  [
    'realtime-media',
    ['transcoding'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/cloud-transcoding',
  ],
  [
    'realtime-media',
    ['media-push'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/media-push',
  ],
  [
    'realtime-media',
    ['media-pull'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/media-pull',
  ],
  [
    'realtime-media',
    ['rtmp-gateway'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/rtmp-gateway',
  ],
  [
    'realtime-media',
    ['speech-to-text'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/speech-to-text',
  ],
  [
    'realtime-media',
    ['usage-analytics'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/agora-analytics',
  ],
  [
    'realtime-media',
    ['fusion-cdn'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/fusion-cdn',
  ],
  [
    'realtime-media',
    ['danmaku'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/danmaku',
  ],
  [
    'realtime-media',
    ['whiteboard', 'whiteboard-sdk'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/whiteboard/restful',
  ],
  [
    'realtime-media',
    ['whiteboard', 'fastboard-sdk'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/whiteboard/restful',
  ],
  [
    'solutions',
    ['ppt-transcoding'],
    '服务端 API',
    '/zh-CN/api-reference/api-ref/ppt-conversion-service',
  ],
  [
    'solutions',
    ['flexible-classroom'],
    '服务端 API',
    '/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom',
  ],
  [
    'solutions',
    ['meeting'],
    '服务端 API',
    '/zh-CN/api-reference/meeting/restful/api/create-room',
  ],
  [
    'solutions',
    ['online-ktv', 'ktv-scenario'],
    '服务端 API',
    '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/music-content-center',
  ],
  [
    'solutions',
    ['online-ktv', 'online-ktv-sdk'],
    '服务端 API',
    '/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center',
  ],
  [
    'solutions',
    ['voip-call'],
    '呼叫小程序 API',
    '/zh-CN/api-reference/api-ref/voip-callkit/call-mini-app',
  ],
  [
    'solutions',
    ['voip-call'],
    'License 管理 API',
    '/zh-CN/api-reference/api-ref/voip-callkit/activate-license',
  ],
  [
    'solutions',
    ['teleoperation'],
    '设备端 API',
    '/zh-CN/api-reference/teleoperation/iot/api/device',
  ],
  [
    'solutions',
    ['teleoperation'],
    '操控端 API',
    '/zh-CN/api-reference/teleoperation/iot/api/operator',
  ],
] as const;

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

function collectUrls(nodes: SidebarNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.url ? [node.url] : []),
    ...collectUrls(node.children ?? []),
  ]);
}

async function loadSidebar(
  locale: 'en' | 'zh-CN',
  tab: string,
  slugs: readonly string[],
) {
  const payload = await loadDocsPagePayload(locale, tab, [...slugs]);

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
        collapsible: true,
        defaultOpen: false,
        title: '服务端 API',
        type: 'section',
      });
      expect(
        collectUrls(restApiNode?.children ?? []).some(
          (childUrl) => childUrl === url || childUrl.startsWith(`${url}/`),
        ),
      ).toBe(true);
    },
  );

  it.each([
    ['ai', [], 'conversational-ai'],
    ['realtime-media', ['rtc'], 'rtc'],
    ['realtime-media', ['rtm'], 'rtm'],
    ['realtime-media', ['rtsa'], 'rtsa'],
    ['realtime-media', ['whiteboard', 'whiteboard-sdk'], 'whiteboard'],
    ['solutions', ['flexible-classroom'], 'flexible-classroom'],
    ['solutions', ['meeting'], 'meeting'],
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
        collapsible: true,
        defaultOpen: false,
        title: '服务端 API',
        type: 'section',
      },
    ]);
  });

  it.each(zhCnServiceApiEntries)(
    'embeds %s/%s %s as a collapsed API sidebar section',
    async (tab, slugs, title, url) => {
      const sidebar = await loadSidebar('zh-CN', tab, slugs);
      const entry = findNode(sidebar, title);

      expect(entry).toMatchObject({
        collapsible: true,
        defaultOpen: false,
        title,
        type: 'section',
      });
      const childUrls = collectUrls(entry?.children ?? []);
      expect(childUrls.length).toBeGreaterThan(0);
      expect(
        childUrls.some(
          (childUrl) => childUrl === url || childUrl.startsWith(`${url}/`),
        ),
      ).toBe(true);
    },
  );

  it('flattens the redundant RESTful API section for the Chinese RTM sidebar', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', ['rtm']);
    const serviceApi = findNode(sidebar, '服务端 API');

    expect(serviceApi).toMatchObject({
      collapsible: true,
      defaultOpen: false,
      type: 'section',
    });
    expect(
      serviceApi?.children?.some(
        (child) => child.type === 'section' && child.title === 'RESTful API',
      ),
    ).toBe(false);
    expect(collectUrls(serviceApi?.children ?? [])).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/signaling/publish',
        '/zh-CN/api-reference/api-ref/signaling/receive',
      ]),
    );
  });

  it('hides the RTMP Gateway RESTful API landing page from the embedded sidebar', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
      'rtmp-gateway',
    ]);
    const serviceApi = findNode(sidebar, '服务端 API');
    const urls = collectUrls(serviceApi?.children ?? []);

    expect(urls).not.toContain(
      '/zh-CN/api-reference/api-ref/rtmp-gateway/restful',
    );
    expect(urls).toContain(
      '/zh-CN/api-reference/api-ref/rtmp-gateway/create-reset-template',
    );
  });

  it('hides the Whiteboard RESTful API landing page from the embedded sidebar', async () => {
    const sidebar = await loadSidebar('zh-CN', 'realtime-media', [
      'whiteboard',
      'whiteboard-sdk',
    ]);
    const serviceApi = findNode(sidebar, '服务端 API');
    const urls = collectUrls(serviceApi?.children ?? []);

    expect(urls).not.toContain(
      '/zh-CN/api-reference/api-ref/whiteboard/restful',
    );
    expect(urls).toContain(
      '/zh-CN/api-reference/api-ref/whiteboard/restful/generate-sdk-token',
    );
  });

  function findNode(
    nodes: SidebarNode[],
    title: string,
  ): SidebarNode | undefined {
    for (const node of nodes) {
      if (node.title === title) {
        return node;
      }

      const nested = findNode(node.children ?? [], title);
      if (nested) {
        return nested;
      }
    }

    return undefined;
  }

  function findSectionWithChild(
    nodes: SidebarNode[],
    title: string,
    childUrl: string,
  ): SidebarNode | undefined {
    for (const node of nodes) {
      if (
        node.type === 'section' &&
        node.title === title &&
        collectUrls(node.children ?? []).includes(childUrl)
      ) {
        return node;
      }

      const nested = findSectionWithChild(node.children ?? [], title, childUrl);
      if (nested) {
        return nested;
      }
    }

    return undefined;
  }

  it('keeps ordinary API cross-links as page entries', async () => {
    const sidebar = await loadSidebar('zh-CN', 'solutions', ['meeting']);
    const reference = findSection(sidebar, ['参考', '参考信息']);
    const createRoom = reference?.children?.find(
      (child) => child.title === '创建房间',
    );

    expect(createRoom).toMatchObject({
      title: '创建房间',
      type: 'page',
      url: '/zh-CN/api-reference/meeting/restful/api/create-room',
    });
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
      const url =
        '/zh-CN/api-reference/api-ref/whiteboard/restful/generate-sdk-token';
      const restApiNode = findNode(sidebar, '服务端 API');

      expect(restApiNode).toMatchObject({
        collapsible: true,
        defaultOpen: false,
        title: '服务端 API',
        type: 'section',
      });
      expect(
        collectUrls(restApiNode?.children ?? []).some(
          (childUrl) => childUrl === url || childUrl.startsWith(`${url}/`),
        ),
      ).toBe(true);
      expect(collectUrls(restApiNode?.children ?? [])).not.toContain(
        '/zh-CN/api-reference/api-ref/whiteboard/restful',
      );
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
    'reads the service API leaf from the Chinese %s solutions metadata',
    async (slugs, url) => {
      const sidebar = await loadSidebar('zh-CN', 'solutions', slugs);
      const restApiNode = findNode(sidebar, '服务端 API');

      expect(restApiNode).toMatchObject({
        collapsible: true,
        defaultOpen: false,
        title: '服务端 API',
        type: 'section',
      });
      expect(
        collectUrls(restApiNode?.children ?? []).some(
          (childUrl) => childUrl === url || childUrl.startsWith(`${url}/`),
        ),
      ).toBe(true);
    },
  );

  it('reads the two VoIP service API leaves from product metadata', async () => {
    const sidebar = await loadSidebar('zh-CN', 'solutions', ['voip-call']);
    const reference = findSection(sidebar, ['参考']);

    expect(reference?.children?.slice(0, 2)).toMatchObject([
      {
        collapsible: true,
        defaultOpen: false,
        title: '呼叫小程序 API',
        type: 'section',
      },
      {
        collapsible: true,
        defaultOpen: false,
        title: 'License 管理 API',
        type: 'section',
      },
    ]);
    expect(collectUrls(reference?.children?.[0]?.children ?? [])).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/voip-callkit/call-mini-app',
      ]),
    );
    expect(collectUrls(reference?.children?.[1]?.children ?? [])).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/voip-callkit/activate-license',
      ]),
    );
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

  it('keeps the RTC product sidebar while loading an API document', async () => {
    const payload = await loadDocsPagePayload(
      'zh-CN',
      'api-reference',
      ['api-ref', 'rtc', 'create-ban-rule'],
      '?from=%2Fzh-CN%2Frealtime-media%2Frtc',
    );

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a RESTful API docs payload');
    }

    expect(payload.activePath).toBe(
      '/zh-CN/api-reference/api-ref/rtc/create-ban-rule',
    );
    expect(payload.activeTab).toBe('realtime-media');
    expect(payload.body.kind).toBe('openapi');
    expect(
      findSectionWithChild(payload.sidebar, '服务端 API', payload.activePath),
    ).toMatchObject({
      defaultOpen: true,
      type: 'section',
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
      collapsible: true,
      defaultOpen: false,
      title: '服务端 API',
      type: 'section',
    });
    expect(collectUrls(reference?.children?.[1]?.children ?? [])).toEqual(
      expect.arrayContaining([
        '/zh-CN/api-reference/api-ref/conversational-ai/join',
      ]),
    );

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
      'content/docs/zh-CN/solutions/meeting/reference/meta.json',
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
