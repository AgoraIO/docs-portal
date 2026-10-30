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
  let payload = await loadDocsPagePayload('zh-CN', 'api-reference', slugs);
  if (payload && 'redirectUrl' in payload) {
    const target = new URL(payload.redirectUrl, 'https://docs.example.com');
    expect(target.pathname).toMatch(/^\/zh-CN\/api-reference\//);
    payload = await loadDocsPagePayload(
      'zh-CN',
      'api-reference',
      target.pathname.split('/').filter(Boolean).slice(2),
      target.search,
    );
  }
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

// These integration tests load the real MDX/OpenAPI graph under parallel suite load.
describe('API Center scoped sidebars', { timeout: 30_000 }, () => {
  it.each([
    [
      ['api-ref', 'console'],
      '/zh-CN/api-reference/api-ref/console/create-project',
    ],
    [
      ['api-ref', 'whiteboard', 'restful'],
      '/zh-CN/api-reference/api-ref/whiteboard/restful/generate-sdk-token',
    ],
  ])(
    'redirects the %s lane root to its maintained entry endpoint',
    async (slugs, redirectUrl) => {
      expect(
        await loadDocsPagePayload('zh-CN', 'api-reference', slugs),
      ).toMatchObject({
        redirectUrl,
      });
    },
  );
  it.each([
    [['conversational-ai', 'android', 'overview'], '/zh-CN/ai'],
    [['conversational-ai', 'android', 'enum'], '/zh-CN/ai'],
    [['rtc', 'android', 'rtc-api-overview'], '/zh-CN/realtime-media/rtc'],
    [['api-ref', 'console'], '/zh-CN/introduction/quickstart'],
  ])(
    'adds the ordinary docs destination for %s',
    async (route, expectedHref) => {
      const payload = await loadApiReferencePayload(route);

      expect(payload.sidebarHeader).toMatchObject({
        productDocsHref: expectedHref,
      });
    },
  );
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
    expect(titles).toEqual(['API 参考']);
    expect(titles).not.toContain('产品参考');
    expect(titles).not.toContain('Whiteboard SDK');
    expect(titles).not.toEqual(
      expect.arrayContaining([
        '对话式 AI 引擎',
        '实时互动 RTC',
        '实时消息 RTM',
        '互动白板',
        '灵动课堂',
      ]),
    );
    expect(rootTitles).toEqual(['API 参考']);
  });

  it('keeps the reference resources together in the Reference tab', async () => {
    const payload = await loadReferencePayload(['demo']);
    const sidebar = payload.sidebar as SidebarNode[];
    const titles = collectTitles(sidebar);
    const rootTitles = sidebar.flatMap((node) =>
      node.title ? [node.title] : [],
    );

    expect(titles).not.toContain('产品参考');
    expect(titles).not.toContain('Whiteboard SDK');
    expect(titles).toEqual(
      expect.arrayContaining(['SDK 下载', '体验 Demo', '常见问题']),
    );
    expect(rootTitles).toEqual(['SDK 下载', '体验 Demo', '常见问题']);
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
    ['overview'],
    ['components'],
    ['hooks'],
    ['data-types'],
    ['web-sdk', 'overview'],
    ['web-sdk', 'interfaces', 'iagorartcclient'],
    ['web-sdk', 'interfaces', 'networkquality'],
    ['web-sdk', 'globals'],
  ])(
    'shows React overview pages directly above the Web SDK group on %s',
    async (...route) => {
      const payload = await loadApiReferencePayload([
        'rtc',
        'react-sdk',
        ...route,
      ]);
      const sidebar = payload.sidebar as SidebarNode[];

      expect(sidebar).toMatchObject([
        { title: '概览', url: '/zh-CN/api-reference/rtc/react-sdk/overview' },
        { title: 'Components（组件）' },
        { title: 'Hooks（钩子）' },
        { title: '类型定义' },
        {
          type: 'section',
          title: 'Web SDK API',
          collapsible: true,
          defaultOpen: true,
          children: [
            {
              title: '概览',
              url: '/zh-CN/api-reference/rtc/react-sdk/web-sdk/overview',
            },
            { title: 'IAgoraRTC' },
            { title: 'IAgoraRTCClient' },
            { title: 'ILocalTrack' },
            { title: 'ILocalAudioTrack' },
            { title: 'IMicrophoneAudioTrack' },
            { title: 'IBufferSourceAudioTrack' },
            { title: 'ILocalVideoTrack' },
            { title: 'ICameraVideoTrack' },
            { title: 'IRemoteTrack' },
            { title: 'IRemoteAudioTrack' },
            { title: 'IRemoteVideoTrack' },
            {
              title: '类型别名 (Type alias)',
              url: '/zh-CN/api-reference/rtc/react-sdk/web-sdk/globals',
            },
          ],
        },
      ]);
      expect(collectTitles(sidebar)).not.toContain('API 概览');
      expect(collectTitles(sidebar)).not.toContain('API 参考');
      expect(collectTitles(sidebar)).not.toContain('NetworkQuality');
      expect(payload.sidebarHeader).toMatchObject({
        productDocsHref: '/zh-CN/realtime-media/rtc',
        versionSwitcher: { currentId: 'current' },
      });
      const isWebSdk = route[0] === 'web-sdk';
      const versions = payload.sidebarHeader?.versionSwitcher?.versions;
      expect(versions?.map((version) => version.label)).toEqual(
        isWebSdk
          ? ['v4.22.0', 'v4.21.0', 'v4.20.0', 'v4.19.3']
          : [
              'v2.5.0',
              'v2.4.0',
              'v2.3.0',
              'v2.2.0',
              'v2.1.0',
              'v2.0.0',
              'v2.0.0-beta.0',
            ],
      );
      expect(versions?.[0].href).toBe(
        isWebSdk
          ? '/zh-CN/api-reference/rtc/react-sdk/web-sdk/overview'
          : '/zh-CN/api-reference/rtc/react-sdk/overview',
      );
      for (const version of versions?.slice(1) ?? []) {
        expect(version.href).toMatch(
          isWebSdk
            ? /\/api-ref\/rtc\/react\/overview$/
            : /\/api-ref\/rtc\/react\/react-sdk\/overview$/,
        );
      }
    },
  );

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
  ])(
    'uses a focused %s sidebar for a single-document card',
    async (route, label) => {
      const payload = await loadApiReferencePayload(route);
      const titles = collectTitles(payload.sidebar as SidebarNode[]);

      expect(titles).toEqual([label]);
      expect(payload.sidebarHeader).toMatchObject({
        backHref: '/zh-CN/api-reference/api',
        backLabel: 'API 参考',
        title: label,
      });
    },
  );

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
      expect.arrayContaining(['创建对话式智能体', '停止对话式智能体']),
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

  it('keeps the Meeting RESTful API endpoints together in the API sidebar', async () => {
    const payload = await loadApiReferencePayload([
      'meeting',
      'restful',
      'api',
      'create-room',
    ]);
    const titles = collectTitles(payload.sidebar as SidebarNode[]);

    expect(titles).toEqual(['服务端 API', '创建房间', '查询录制列表']);
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
    ['cpp', 'iagoraservice.cpp'],
    ['java', 'agoraservice.java'],
  ])(
    'uses archives for local server recording %s history while retaining Legacy pages',
    async (platform, currentPage) => {
      const currentHref = `/zh-CN/api-reference/local-server-recording/${platform}/api-overview`;
      const payload = await loadApiReferencePayload([
        'local-server-recording',
        platform,
        currentPage,
      ]);

      expect(payload.sidebarHeader).toMatchObject({
        title: '本地服务端录制',
        versionSwitcher: {
          currentId: 'current',
          versions: [
            {
              href: currentHref,
              id: 'current',
              label: 'v4.4.151',
            },
            {
              href: `https://doc-archive.shengwang.cn/archive/0.0.341/api-ref/recording/${platform}/api-overview`,
              id: '4.4.150',
              label: 'v4.4.150',
            },
          ],
        },
      });

      const legacyPayload = await loadApiReferencePayload([
        'local-server-recording',
        platform,
        'legacy',
        'overview',
      ]);
      expect(legacyPayload.sidebarHeader?.versionSwitcher).toBeUndefined();

      const legacyTitles = collectTitles(
        legacyPayload.sidebar as SidebarNode[],
      );
      expect(legacyTitles).toEqual([
        'Legacy API 概览',
        'API 概览',
        platform === 'cpp' ? 'IRecordingEngine 类' : 'RecordingSDK 类',
        platform === 'cpp'
          ? 'IRecordingEngineEventHandler 类'
          : 'RecordingEventHandler 类',
        'RecordingConfig 类',
      ]);

      const legacyClassPayload = await loadApiReferencePayload([
        'local-server-recording',
        platform,
        'legacy',
        platform === 'cpp'
          ? 'classagora-1-1recording-1-1-i-recording-engine'
          : 'classio-1-1agora-1-1recording-1-1-recording-s-d-k',
      ]);
      expect(legacyClassPayload.sidebarHeader?.versionSwitcher).toBeUndefined();
      expect(
        collectTitles(legacyClassPayload.sidebar as SidebarNode[]),
      ).toEqual(legacyTitles);
      expect(
        findNode(payload.sidebar as SidebarNode[], 'Legacy API 参考'),
      ).toMatchObject({
        collapsible: true,
        children: [expect.objectContaining({ title: 'Legacy API 概览' })],
      });
    },
  );

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
  ])(
    'keeps the canonical %s page inside the local recording sidebar scope',
    async (route, expectedTitles) => {
      const payload = await loadApiReferencePayload(route);
      const titles = collectTitles(payload.sidebar as SidebarNode[]);

      expect(titles).toEqual(expect.arrayContaining(expectedTitles));
      expect(titles).not.toContain('Demo');
      expect(payload.sidebarHeader).toMatchObject({
        backHref: '/zh-CN/api-reference/api',
        backLabel: 'API 参考',
        title: '本地服务端录制',
      });
    },
  );

  it.each([
    ['cpp', 'overview'],
    ['java', 'overview'],
    ['python-api', 'overview.python'],
    ['go-api', 'overview.go'],
  ])(
    'labels the RTC Server SDK %s error-code entry as common',
    async (...route) => {
      const titles = collectTitles(
        await loadApiReferenceSidebar(['rtc-server-sdk', ...route]),
      );

      expect(titles).toContain('通用错误码');
      expect(titles).not.toContain('错误码');
    },
  );

  it('identifies the shared RTC Server SDK error-code page', async () => {
    const payload = await loadApiReferencePayload([
      'rtc-server-sdk',
      'error-code',
    ]);

    expect(payload.title).toBe('RTC 服务端 SDK 通用错误码');
  });

  it.each([
    [
      ['conversational-ai', 'rest-api', 'api', 'response-code'],
      ['Agent SDK API', '客户端组件 API'],
    ],
    [['api-ref', 'cloud-recording', 'acquire'], ['REST Client API']],
  ])(
    'keeps cross-entry SDK links out of RESTful sidebars',
    async (route, excluded) => {
      const titles = collectTitles(await loadApiReferenceSidebar(route));

      for (const title of excluded) expect(titles).not.toContain(title);
    },
  );

  it.each(['android', 'ios', 'macos', 'flutter'])(
    'preserves RTC %s first-level groups with second-level pages',
    async (platform) => {
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
    },
  );

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
  ])(
    'uses the Whiteboard SDK %s class directory',
    async (_platform, route, expected) => {
      const sidebar = await loadApiReferenceSidebar([
        'whiteboard',
        'whiteboard-sdk',
        ...route,
      ]);
      const titles = collectTitles(sidebar);

      expect(titles).toEqual(expect.arrayContaining(expected));
      expect(titles).not.toContain('参考概览');
    },
  );

  it.each(['web', 'electron'])(
    'keeps retired Flexible Classroom %s API entrypoints unavailable',
    async (platform) => {
      for (const name of [
        'classroom-sdk',
        'proctor-sdk',
        'fcr-ui-scene',
        'edu-store',
      ]) {
        await expect(
          loadDocsPagePayload('zh-CN', 'api-reference', [
            'flexible-classroom',
            platform,
            'api-reference',
            name,
          ]),
        ).resolves.toBeNull();
      }
    },
  );

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
        versions: expect.arrayContaining([
          {
            href: '/zh-CN/api-reference/rtsa/c/overview',
            id: 'current',
            label: 'v1.10.1',
          },
          {
            href: 'https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtsa/c/overview',
            id: '1.9.7',
            label: 'v1.9.7',
          },
        ]),
      },
    });
    const sidebarTitles = collectTitles(payload.sidebar);
    expect(sidebarTitles).toEqual(['API 参考']);

    const toc = payload.toc.map((item) => ({
      depth: item.depth,
      title: item.title,
    }));

    // v1.10.1 adds one message enum and three RTM Channel methods.
    expect(toc).toHaveLength(77);
    expect(toc.filter((item) => item.depth === 2)).toEqual([
      { depth: 2, title: '宏定义说明' },
      { depth: 2, title: '类型定义说明' },
      { depth: 2, title: '函数说明' },
    ]);
    expect(toc.filter((item) => item.depth === 3)).toHaveLength(74);
    expect(toc.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        'rtm_message_type_e',
        'agora_rtm_publish()',
        'agora_rtm_subscribe()',
        'agora_rtm_unsubscribe()',
      ]),
    );
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

  it.each(['android', 'ios'])(
    'keeps the online KTV %s entry scoped to its three API documents',
    async (platform) => {
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
        title:
          platform === 'android' ? '在线 K 歌房 Android' : '在线 K 歌房 iOS',
      });
    },
  );
});
