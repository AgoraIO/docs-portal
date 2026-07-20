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

describe('API Center scoped sidebars', () => {
  it('keeps hidden implementation roots out of the Reference sidebar', async () => {
    const sidebar = await loadApiReferenceSidebar(['overview']);
    const titles = collectTitles(sidebar);

    expect(titles.filter((title) => title === 'API 参考')).toHaveLength(1);
    expect(titles.filter((title) => title === '实时互动 RTC')).toHaveLength(1);
    expect(titles.filter((title) => title === '实时消息 RTM')).toHaveLength(1);
    expect(titles).not.toContain('Whiteboard SDK');
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

  it('keeps a single-page Agent SDK entry in the Reference root sidebar', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'conversational-ai',
      'agent-go',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toContain('实时互动 RTC');
    expect(titles).not.toContain('创建对话式智能体');
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
      backHref: '/zh-CN/api-reference/overview',
      backLabel: '参考中心',
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
      backHref: '/zh-CN/api-reference/overview',
      backLabel: '参考中心',
      title: 'RESTful API',
    });
  });

  it.each([
    'android',
    'ios',
    'web',
  ])('keeps the single-page Fastboard %s API in the Reference root sidebar', async (platform) => {
    const payload = await loadApiReferencePayload([
      'whiteboard',
      'fastboard',
      platform,
    ]);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toContain('实时互动 RTC');
    expect(titles).not.toContain('Fastboard SDK');
    expect(payload.sidebarHeader).toBeUndefined();
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
      backHref: '/zh-CN/api-reference/overview',
      backLabel: '参考中心',
      title,
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

  it('matches the live RTSA C Doxygen TOC hierarchy', async () => {
    const payload = await loadApiReferencePayload([
      'rtsa',
      'c',
      'agora-rtc-api-8h',
    ]);

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
});
