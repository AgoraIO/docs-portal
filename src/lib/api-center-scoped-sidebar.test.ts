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
  const payload = await loadDocsPagePayload('zh-CN', 'api-reference', slugs);
  if (!payload || 'redirectUrl' in payload) {
    throw new Error(
      `expected docs payload for /zh-CN/api-reference/${slugs.join('/')}`,
    );
  }
  return payload.sidebar as SidebarNode[];
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
});
