import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type SidebarNode = {
  children?: SidebarNode[];
  title?: string;
};

function collectTitles(nodes: SidebarNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.title ? [node.title] : []),
    ...collectTitles(node.children ?? []),
  ]);
}

function findNode(
  nodes: SidebarNode[],
  title: string,
): SidebarNode | undefined {
  for (const node of nodes) {
    if (node.title === title) return node;
    const nested = findNode(node.children ?? [], title);
    if (nested) return nested;
  }
  return undefined;
}

async function loadApiReferenceSidebar(slugs: string[]) {
  return (await loadApiReferencePayload(slugs)).sidebar as SidebarNode[];
}

async function loadApiReferencePayload(slugs: string[]) {
  const payload = await loadDocsPagePayload('zh-CN', 'api-reference', slugs);
  if (!payload || 'redirectUrl' in payload) {
    throw new Error(
      `expected docs payload for /zh-CN/api-reference/${slugs.join('/')}`,
    );
  }
  return payload;
}

async function loadReferencePayload(slugs: string[]) {
  const payload = await loadDocsPagePayload('zh-CN', 'reference', slugs);
  if (!payload || 'redirectUrl' in payload) {
    throw new Error(
      `expected docs payload for /zh-CN/reference/${slugs.join('/')}`,
    );
  }
  return payload;
}

describe('API Center scoped sidebars', () => {
  it('places API Reference between Solutions and Reference in the zh-CN tabs', async () => {
    const payload = await loadApiReferencePayload(['api']);

    expect(payload.tabs).toEqual([
      expect.objectContaining({ id: 'introduction', title: '介绍' }),
      expect.objectContaining({ id: 'ai', title: '对话式 AI 引擎' }),
      expect.objectContaining({ id: 'realtime-media', title: '实时互动' }),
      expect.objectContaining({ id: 'solutions', title: '解决方案' }),
      expect.objectContaining({
        id: 'api-reference',
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      }),
      expect.objectContaining({
        id: 'reference',
        title: '参考文档',
        url: '/zh-CN/reference/sdks',
      }),
    ]);
  });

  it('keeps product entries out of the Reference sidebar', async () => {
    const sidebar = await loadApiReferenceSidebar(['overview']);
    const titles = collectTitles(sidebar);
    const rootTitles = sidebar.flatMap((node) =>
      node.title ? [node.title] : [],
    );
    expect(titles.filter((title) => title === 'API 参考')).toHaveLength(1);
    expect(titles).toEqual(['API 参考', 'SDK 下载', 'Recipe', '常见问题']);
    expect(titles).not.toContain('产品参考');
    expect(titles).not.toContain('Whiteboard SDK');
    expect(titles).not.toEqual(
      expect.arrayContaining([
        '对话式 AI',
        '实时互动 RTC',
        '实时消息 RTM',
        '互动白板',
        '灵动课堂',
      ]),
    );
    expect(rootTitles).toEqual([
      'API 参考',
      'SDK 下载',
      'Recipe',
      '常见问题',
    ]);
  });

  it('keeps the reference resources together in the Reference tab', async () => {
    const payload = await loadReferencePayload(['recipes']);
    const sidebar = payload.sidebar as SidebarNode[];
    const titles = collectTitles(sidebar);
    const rootTitles = sidebar.flatMap((node) =>
      node.title ? [node.title] : [],
    );

    expect(titles).not.toContain('产品参考');
    expect(titles).not.toContain('Whiteboard SDK');
    expect(titles).toEqual(
      expect.arrayContaining(['SDK 下载', 'Recipe', '常见问题']),
    );
    expect(rootTitles).toEqual(['SDK 下载', 'Recipe', '常见问题']);
  });

  it('uses the generated RTC Android current-version categories', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'rtc',
      'android',
      'rtc-api-overview',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining([
        'API 概览',
        'Full SDK API 列表',
        '初始化相关',
        '音频功能',
        '视频功能',
      ]),
    );
    expect(titles).not.toContain('参考概览');
  });

  it.each([
    [['conversational-ai', 'agent-go'], 'Go'],
    [['conversational-ai', 'agent-python'], 'Python'],
    [['conversational-ai', 'agent-typescript'], 'TypeScript'],
    [['whiteboard', 'fastboard', 'android'], 'Android'],
    [['whiteboard', 'fastboard', 'ios'], 'iOS'],
    [['whiteboard', 'fastboard', 'web'], 'Web'],
    [['meeting', 'android'], 'Android'],
    [['meeting', 'ios'], 'iOS'],
    [['meeting', 'electron'], 'Electron'],
    [['private-room', 'android', 'rtm', 'api', 'call-api'], 'Android'],
    [['private-room', 'ios', 'rtm', 'api', 'call-api'], 'iOS'],
    [
      ['private-room', 'android', 'custom-signaling', 'api', 'call-api'],
      'Android',
    ],
    [['private-room', 'ios', 'custom-signaling', 'api', 'call-api'], 'iOS'],
    [['online-art-teaching', 'android', 'api', 'correction'], 'Android'],
    [['online-art-teaching', 'ios', 'api', 'correction'], 'iOS'],
    [['online-art-teaching', 'macos', 'api', 'correction'], 'macOS'],
    [
      ['online-art-teaching', 'cpp-all-platforms', 'api', 'correction'],
      'Windows',
    ],
    [['online-music-teaching', 'android', 'api', 'fish-eye'], 'Android'],
    [['online-music-teaching', 'ios', 'api', 'fish-eye'], 'iOS'],
    [['online-music-teaching', 'macos', 'api', 'fish-eye'], 'macOS'],
    [
      ['online-music-teaching', 'cpp-all-platforms', 'api', 'fish-eye'],
      'Windows',
    ],
    [['teleoperation', 'iot', 'api', 'device'], '设备端'],
    [['teleoperation', 'iot', 'api', 'operator'], '操控端'],
  ])('uses a focused %s sidebar for a single-document card', async (route, label) => {
    const payload = await loadApiReferencePayload(route);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual([label]);
    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title: label,
    });
  });

  it('uses the Conversational AI Android SDK sidebar, not RESTful navigation', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'conversational-ai',
      'android',
      'overview',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining([
        'API 概览',
        '枚举类',
        'IConversationalAIAPI 类',
        'IConversationalAIAPIEventHandler 类',
        '结构体',
      ]),
    );
    expect(titles).not.toContain('创建对话式智能体');
  });

  it('keeps the Conversational AI RESTful lane API-only and under Reference Center', async () => {
    const payload = await loadApiReferencePayload([
      'api-ref',
      'conversational-ai',
    ]);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual(
      expect.arrayContaining([
        'RESTful 鉴权',
        '创建对话式智能体',
        '停止对话式智能体',
      ]),
    );
    expect(titles).not.toEqual(
      expect.arrayContaining(['文档指引', '产品介绍', '快速开始', '功能指南']),
    );
    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title: 'RESTful API',
    });
  });

  it('keeps the Whiteboard RESTful lane API-only and under Reference Center', async () => {
    const payload = await loadApiReferencePayload([
      'api-ref',
      'whiteboard',
      'restful',
    ]);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual(
      expect.arrayContaining(['生成 SDK Token', '生成 Room Token', '创建房间']),
    );
    expect(titles).not.toEqual(
      expect.arrayContaining(['文档指引', '产品介绍', '快速开始', '功能指南']),
    );
    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title: 'RESTful API',
    });
  });

  it('uses the Cloud Recording Go REST Client sidebar, not RESTful navigation', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'cloud-recording',
      'go-api',
      'overview.go',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining(['API 概览', 'Client 类', '结构体', '枚举类']),
    );
    expect(titles).not.toContain('获取云端录制资源');
  });

  it.each([
    [['cloud-recording', 'go-api', 'overview.go'], '云端录制'],
    [['cloud-recording', 'java-api', 'overview.java'], '云端录制'],
    [['local-server-recording', 'java', 'api-overview'], '本地服务端录制'],
    [['local-server-recording', 'cpp', 'api-overview'], '本地服务端录制'],
  ])('uses the product name for the %s scope title', async (route, title) => {
    const payload = await loadApiReferencePayload(route);

    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title,
    });
  });

  it.each([
    [
      ['local-server-recording', 'java', 'agoraservice.java'],
      ['API 概览', 'AgoraService 类', 'AgoraMediaRtcRecorder 类'],
    ],
    [
      ['local-server-recording', 'cpp', 'iagoraservice.cpp'],
      [
        'API 概览',
        'IAgoraService 类',
        'IAgoraMediaComponentFactory 类',
        'IAgoraMediaRtcRecorder 类',
      ],
    ],
  ])('keeps the canonical %s page inside the local recording sidebar scope', async (route, expectedTitles) => {
    const payload = await loadApiReferencePayload(route);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual(expect.arrayContaining(expectedTitles));
    expect(titles).not.toContain('Recipe');
    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title: '本地服务端录制',
    });
  });

  it.each([
    ['cpp', 'overview'],
    ['java', 'overview'],
    ['python-api', 'overview.python'],
    ['go-api', 'overview.go'],
  ])('labels the RTC Server SDK %s error-code entry as common', async (...route) => {
    const titles = collectTitles(
      await loadApiReferenceSidebar(['rtc-server-sdk', ...route]),
    );

    expect(titles).toContain('通用错误码');
    expect(titles).not.toContain('错误码');
  });

  it('identifies the shared RTC Server SDK error-code page', async () => {
    const payload = await loadApiReferencePayload([
      'rtc-server-sdk',
      'error-code',
    ]);

    expect(payload.title).toBe('RTC 服务端 SDK 通用错误码');
  });

  it.each([
    [
      ['conversational-ai', 'rest-api', 'user-guides', 'http-basic-auth'],
      ['Agent SDK API', '客户端组件 API'],
    ],
    [['cloud-recording', 'restful', 'landing-page'], ['REST Client API']],
  ])('keeps cross-entry SDK links out of RESTful sidebars', async (route, excluded) => {
    const titles = collectTitles(await loadApiReferenceSidebar(route));

    for (const title of excluded) expect(titles).not.toContain(title);
  });

  it.each([
    'android',
    'ios',
    'macos',
    'flutter',
  ])('preserves RTC %s first-level groups with second-level pages', async (platform) => {
    const sidebar = await loadApiReferenceSidebar([
      'rtc',
      platform,
      'play',
      'audio-mixing',
    ]);
    const audio = findNode(sidebar, '音频功能');
    const video = findNode(sidebar, '视频功能');

    expect(collectTitles(audio?.children ?? [])).toEqual(
      expect.arrayContaining([
        '音频基础功能',
        '音频采集',
        '音频前处理和后处理',
        '原始音频数据',
        '已编码音频数据',
        '自定义音频采集和渲染',
        '音频频谱',
      ]),
    );
    expect(collectTitles(video?.children ?? [])).toEqual(
      expect.arrayContaining([
        '视频基础功能',
        '摄像头采集',
        '屏幕采集',
        '视频前处理和后处理',
        '视频渲染',
        '原始视频数据',
        '已编码视频数据',
        '自定义视频采集和渲染',
      ]),
    );
  });

  it.each([
    [
      'Android',
      ['android', 'overview'],
      ['WhiteSdk', 'WhiteRoom', 'Player', 'Displayer'],
    ],
    [
      'iOS',
      [
        'ios',
        'docs',
        'headers',
        'agora-interactive-whiteboard-objective-c-overview',
      ],
      ['WhiteSdk', 'WhiteRoom', 'WhitePlayer', 'WhiteDisplayer'],
    ],
  ])('uses the Whiteboard SDK %s class directory', async (_platform, route, expected) => {
    const sidebar = await loadApiReferenceSidebar([
      'whiteboard',
      'whiteboard-sdk',
      ...route,
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(expect.arrayContaining(expected));
    expect(titles).not.toContain('参考概览');
  });

  it('keeps the four Flexible Classroom Web API nodes', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'flexible-classroom',
      'web',
      'api-reference',
      'classroom-sdk',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining([
        'Classroom SDK API',
        'Proctor SDK API',
        'FcrUIScene API',
        'Edu Store API',
      ]),
    );
  });

  it.each([
    'electron',
    'web',
  ])('matches the old Flexible Classroom %s Edu Store sidebar', async (platform) => {
    const payload = await loadApiReferencePayload([
      'flexible-classroom',
      platform,
      'api-reference',
      'edu-store',
    ]);
    const sidebar = payload.sidebar as SidebarNode[];
    const eduStore = findNode(sidebar, 'Edu Store API');

    expect(eduStore).toBeDefined();
    const titles = collectTitles(eduStore?.children ?? []);
    expect(titles).toEqual([
      '概览',
      'CloudDriveStore',
      'GroupStore',
      'HandUpStore',
      'MediaStore',
      'RecordingStore',
      'RoomStore',
      'StreamStore',
      'UserStore',
      'ConnectionStore',
      'StatisticsStore',
      'WidgetStore',
    ]);
    expect(collectTitles(sidebar)).not.toContain('Exports');
    expect(collectTitles(sidebar)).not.toContain(
      '"agora-edu-core/src/configs/index"',
    );
    expect(payload.toc.map((item) => item.title)).toEqual([
      'Cloud Drive Store',
      'Group Store',
      'Hand Up Store',
      'Media Store',
      'Recording Store',
      'Room Store',
      'Statistics Store',
      'Stream Store',
      'User Store',
      'Connection Store',
    ]);
  });

  it('keeps RTSA C detail pages reachable without listing them in the platform sidebar', async () => {
    const payload = await loadApiReferencePayload([
      'rtsa',
      'c',
      'agora-rtc-api-8h',
    ]);

    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      title: '媒体流加速 RTSA C',
      versionSwitcher: {
        currentId: 'current',
        versions: [
          {
            href: '/zh-CN/api-reference/rtsa/c/overview',
            id: 'current',
            label: 'Current',
          },
        ],
      },
    });
    const sidebarTitles = collectTitles(payload.sidebar);
    expect(sidebarTitles).toEqual(['API 参考']);

    const toc = payload.toc.map((item) => ({
      depth: item.depth,
      title: item.title,
    }));

    expect(toc).toHaveLength(73);
    expect(toc.filter((item) => item.depth === 2)).toEqual([
      { depth: 2, title: '宏定义说明' },
      { depth: 2, title: '类型定义说明' },
      { depth: 2, title: '函数说明' },
    ]);
    expect(toc.filter((item) => item.depth === 3)).toHaveLength(70);
    expect(toc.map((item) => item.title)).not.toEqual(
      expect.arrayContaining([
        '枚举类型说明',
        '参数',
        '返回',
        '返回值',
        '注解',
        '自从',
      ]),
    );
    expect(toc.every((item) => !item.title.includes('◆'))).toBe(true);
  });

  it.each([
    'android',
    'ios',
  ])('keeps the online KTV %s entry scoped to its three API documents', async (platform) => {
    const payload = await loadApiReferencePayload([
      'online-ktv',
      platform,
      'ktv-scenario',
      'api',
      'ktv-api',
    ]);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual(
      expect.arrayContaining([
        '场景化 API',
        '歌词打分组件 API',
        '实时互动 API',
        '服务端 API',
      ]),
    );
    expect(titles.filter((title) => title === '场景化 API')).toHaveLength(1);
    expect(payload.sidebarHeader).toMatchObject({
      backHref: '/zh-CN/api-reference/api',
      backLabel: 'API 参考',
      title: platform === 'android' ? '在线 K 歌房 Android' : '在线 K 歌房 iOS',
    });
  });
});
