import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditDocsLinks } from './audit-doc-links.mjs';
import { buildApiReferenceRehomePlan } from './lib/api-center/api-reference-ownership.mjs';
import { auditApiCenterMigration } from './lib/api-center/migration-audit.mjs';
import {
  runApiCenterNavigation,
  scopedRootMetaPages,
} from './lib/api-center/navigation-runner.mjs';

const roots: string[] = [];

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center navigation runner', () => {
  it('projects every rehomed private-room API leaf into the visible product group', () => {
    const rootRoute = '/zh-CN/api-reference/private-room';
    const useCases = [
      ['场景化 API 默认 RTM 方案', 'rtm'],
      ['场景化 API 自定义信令方案', 'custom-signaling'],
    ] as const;
    const platforms = [
      ['Android', 'android'],
      ['iOS', 'ios'],
    ] as const;
    const entries = useCases.flatMap(([useCase, sourceVariant]) =>
      platforms.map(([label, platform]) => {
        const callUrl = `https://doc.shengwang.cn/doc/one-to-one-live/${platform}/${sourceVariant}/api/call-api`;
        const rtcUrl = `https://doc.shengwang.cn/doc/one-to-one-live/${platform}/${sourceVariant}/api/rtc-api`;
        return {
          product: '1v1 私密房',
          productDescription: '支持陌生人社交和即时通讯。',
          useCase,
          label,
          pageGraph: {
            pages: [
              { label: 'CallAPI', url: callUrl },
              { label: 'RTC API', url: rtcUrl },
            ],
          },
        };
      }),
    );
    const pageEvidence = entries.flatMap((entry) =>
      entry.pageGraph.pages.map((page) => {
        const parsed = new URL(page.url);
        const [, , , platform, sourceVariant, , leaf] =
          parsed.pathname.split('/');
        return {
          requestedUrl: page.url,
          sourceResolution: {
            sourcePath: `docs/one-to-one-live/${sourceVariant}/api/${leaf}.${platform}.mdx`,
            supersededTargetPath: `content/docs/zh-CN/solutions/one-to-one-live/${sourceVariant}/reference/${leaf}.mdx`,
            supersededTargetRoute: `/zh-CN/solutions/one-to-one-live/${sourceVariant}/reference/${leaf}`,
            targetPath: `content/docs${rootRoute}/${platform}/${sourceVariant}/api/${leaf}.mdx`,
            targetRoute: `${rootRoute}/${platform}/${sourceVariant}/api/${leaf}`,
          },
        };
      }),
    );
    const manifest = { entries, pageEvidence };
    const rehome = buildApiReferenceRehomePlan(manifest);
    const pages = scopedRootMetaPages(
      [
        'overview',
        '---产品参考---',
        'private-room',
        {
          type: 'group',
          title: '私密房',
          pages: [`[Android](${rootRoute}/android)`, `[iOS](${rootRoute}/ios)`],
        },
      ],
      entries,
      rehome,
    );
    const privateRoom = pages.find(
      (page: unknown) =>
        page !== null &&
        typeof page === 'object' &&
        'title' in page &&
        page.title === '私密房',
    );

    expect(rehome.landingPages).toEqual([
      expect.objectContaining({
        route: rootRoute,
        links: [
          {
            label: '场景化 API 默认 RTM 方案 · Android · CallAPI',
            route: `${rootRoute}/android/rtm/api/call-api`,
          },
          {
            label: '场景化 API 默认 RTM 方案 · Android · RTC API',
            route: `${rootRoute}/android/rtm/api/rtc-api`,
          },
          {
            label: '场景化 API 默认 RTM 方案 · iOS · CallAPI',
            route: `${rootRoute}/ios/rtm/api/call-api`,
          },
          {
            label: '场景化 API 默认 RTM 方案 · iOS · RTC API',
            route: `${rootRoute}/ios/rtm/api/rtc-api`,
          },
          {
            label: '场景化 API 自定义信令方案 · Android · CallAPI',
            route: `${rootRoute}/android/custom-signaling/api/call-api`,
          },
          {
            label: '场景化 API 自定义信令方案 · Android · RTC API',
            route: `${rootRoute}/android/custom-signaling/api/rtc-api`,
          },
          {
            label: '场景化 API 自定义信令方案 · iOS · CallAPI',
            route: `${rootRoute}/ios/custom-signaling/api/call-api`,
          },
          {
            label: '场景化 API 自定义信令方案 · iOS · RTC API',
            route: `${rootRoute}/ios/custom-signaling/api/rtc-api`,
          },
        ],
      }),
    ]);
    expect(privateRoom).toMatchObject({
      type: 'group',
      title: '私密房',
      pages: rehome.landingPages[0].links.map(
        (link: { label: string; route: string }) =>
          `[${link.label}](${link.route})`,
      ),
    });
  });

  it('adds every internal API Center product in source order without dropping existing reference groups', () => {
    const rtcRoute = '/zh-CN/api-reference/rtc/android/rtc-api-overview';
    const rtsaRoute = '/zh-CN/api-reference/rtsa/c/overview';
    const rtmCppRoute =
      '/zh-CN/api-reference/rtm/toc-configuration/configuration.cpp';
    const teleoperationRoute =
      '/zh-CN/api-reference/teleoperation/iot/api/device';
    const entries = [
      {
        product: '实时互动 RTC',
        apiGroup: 'client',
        label: 'Android',
        targetRoute: rtcRoute,
        urlFamily: 'api-ref',
      },
      {
        product: '实时消息 RTM',
        apiGroup: 'client',
        label: 'C++',
        targetRoute: rtmCppRoute,
        urlFamily: 'api-ref',
      },
      {
        product: '即时通讯 IM',
        apiGroup: 'client',
        label: 'Web',
        legacyUrl: 'https://im.shengwang.cn/docs/sdk/web.html',
        urlFamily: 'external',
      },
      {
        product: '媒体流加速 RTSA',
        apiGroup: 'client',
        label: 'C',
        targetRoute: rtsaRoute,
        urlFamily: 'api-ref',
      },
      {
        product: '平行操控',
        apiGroup: 'client',
        label: '设备端',
        targetRoute: teleoperationRoute,
        urlFamily: 'doc',
      },
    ];
    const pages = scopedRootMetaPages(
      [
        'overview',
        '---产品参考---',
        'rtc',
        {
          type: 'group',
          title: '实时消息 RTM',
          pages: [
            `[C++](${rtmCppRoute})`,
            '[C++](/zh-CN/api-reference/rtm/cpp/configuration)',
            '[React Native](/zh-CN/api-reference/rtm/react-native/configuration)',
            '[Swift](/zh-CN/api-reference/rtm/swift/configuration)',
          ],
        },
        {
          type: 'group',
          title: '实时互动 RTC',
          icon: 'AudioLines',
          pages: [
            `[Android](${rtcRoute})`,
            '[iOS](/zh-CN/api-reference/rtc/ios/rtc-api-overview)',
            '[React Native](/zh-CN/api-reference/rtc/react-native/rtc-api-overview)',
          ],
        },
        {
          type: 'group',
          title: '灵动课堂',
          pages: [
            '[Android](/zh-CN/api-reference/flexible-classroom/android/api-reference/classroom-sdk)',
          ],
        },
      ],
      entries,
    );
    const visibleGroups = pages.filter(
      (page): page is { title: string; pages: string[] } =>
        page !== null &&
        typeof page === 'object' &&
        'title' in page &&
        page.title !== '产品参考',
    );

    expect(visibleGroups.map((page) => page.title)).toEqual([
      '实时互动 RTC',
      '实时消息 RTM',
      '媒体流加速 RTSA',
      '平行操控',
      '灵动课堂',
    ]);
    expect(visibleGroups[0].pages).toEqual([
      `[Android](${rtcRoute})`,
      '[iOS](/zh-CN/api-reference/rtc/ios/rtc-api-overview)',
      '[React Native](/zh-CN/api-reference/rtc/react-native/rtc-api-overview)',
    ]);
    expect(visibleGroups[1].pages).toEqual([
      `[C++](${rtmCppRoute})`,
      '[Swift](/zh-CN/api-reference/rtm/swift/configuration)',
    ]);
    expect(visibleGroups[2]).toMatchObject({
      title: '媒体流加速 RTSA',
      pages: [`[C](${rtsaRoute})`],
    });
    expect(visibleGroups[3]).toMatchObject({
      title: '平行操控',
      pages: [`[设备端](${teleoperationRoute})`],
    });
    expect(visibleGroups.some((page) => page.title === '即时通讯 IM')).toBe(
      false,
    );
  });

  it('generates ordered overview/root navigation, entry meta, and a missing OpenAPI landing', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-navigation-'),
    );
    roots.push(repoRoot);
    const manifestPath = 'docs/migration/api-center-html-manifest.json';
    const rtcOverviewUrl =
      'https://doc.shengwang.cn/api-ref/rtc/android/overview';
    const rtcClientUrl = 'https://doc.shengwang.cn/api-ref/rtc/android/client';
    const rtcMcpUrl = 'https://doc.shengwang.cn/doc/rtc/android/mcp-integrate';
    const speechUrl =
      'https://doc.shengwang.cn/doc/speech-to-text/restful/v7/operations/join';
    const whiteboardUrl =
      'https://doc.shengwang.cn/api-ref/whiteboard/android/overview';
    const manifest = {
      source: { commit: 'fixture' },
      live: {
        capturedAt: '2026-07-16T00:00:00.000Z',
        heroTitle: 'API 中心',
        heroDescription: '查看声网 API 的详细信息。',
      },
      entries: [
        {
          category: '基础能力',
          subcategories: [],
          product: '实时互动 RTC',
          productDescription: '实时互动能力。',
          apiGroup: 'client',
          label: 'Android',
          legacyUrl: rtcOverviewUrl,
          urlFamily: 'api-ref',
          targetRoute: '/zh-CN/api-reference/rtc/android/overview',
          pageGraph: {
            closure: { scopeRoot: '/api-ref/rtc/android/' },
            pages: [
              { url: rtcOverviewUrl, label: '概览', trail: [] },
              {
                url: rtcClientUrl,
                label: '客户端',
                trail: ['核心接口'],
              },
            ],
            navigation: [
              { kind: 'link', label: '概览', link: { url: rtcOverviewUrl } },
              {
                kind: 'category',
                label: '核心接口',
                items: [
                  {
                    kind: 'link',
                    label: '客户端',
                    link: { url: rtcClientUrl },
                  },
                ],
              },
              {
                kind: 'link',
                label: '客户端组件 API',
                link: {
                  url: 'https://doc.shengwang.cn/api-ref/convoai/android/android-component/overview',
                },
              },
              {
                kind: 'link',
                label: '使用 MCP 集成 🔌',
                link: { url: rtcMcpUrl },
              },
            ],
            sourceNavigation: [
              {
                kind: 'link',
                label: '概览',
                link: { url: rtcOverviewUrl },
              },
              {
                kind: 'category',
                label: '核心接口',
                link: { url: rtcClientUrl },
                items: [
                  {
                    kind: 'link',
                    label: '客户端',
                    link: { url: rtcClientUrl },
                  },
                ],
              },
              {
                kind: 'link',
                label: '客户端组件 API',
                link: {
                  url: 'https://doc.shengwang.cn/api-ref/convoai/android/android-component/overview',
                },
              },
            ],
            sourceNavigationSource:
              'html-docs/rtc/Android/API/rtc_api_overview.html',
          },
        },
        {
          category: '基础能力',
          subcategories: [],
          product: '即时通讯 IM',
          productDescription: '即时通讯能力。',
          apiGroup: 'client',
          label: 'Web',
          legacyUrl: 'https://im.shengwang.cn/docs/sdk/web.html',
          urlFamily: 'external',
          targetRoute: null,
          pageGraph: null,
        },
        {
          category: '基础能力',
          subcategories: [],
          product: '实时互动 RTC',
          productDescription: '实时互动能力。',
          apiGroup: 'client',
          label: 'iOS',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/rtc/ios/overview',
          urlFamily: 'api-ref',
          targetRoute: '/zh-CN/api-reference/rtc/android/overview',
          pageGraph: { pages: [], navigation: [] },
        },
        {
          category: '扩展能力',
          subcategories: [],
          product: '实时转录翻译',
          productDescription: '把频道语音转成文本。',
          apiGroup: 'server',
          label: 'RESTful',
          legacyUrl: speechUrl,
          urlFamily: 'doc',
          targetRoute: '/zh-CN/api-reference/api-ref/speech-to-text/join',
          pageGraph: {
            closure: { scopeRoot: '/doc/speech-to-text/restful/' },
            pages: [
              {
                url: speechUrl,
                label: '开始转写',
                trail: ['服务端 API'],
              },
            ],
            navigation: [
              {
                kind: 'category',
                label: '服务端 API',
                items: [
                  {
                    kind: 'link',
                    label: '开始转写',
                    link: { url: speechUrl },
                  },
                ],
              },
            ],
          },
        },
        {
          category: '扩展能力',
          subcategories: [],
          product: '互动白板',
          productDescription: '互动白板能力。',
          apiGroup: 'client',
          label: 'Android',
          legacyUrl: whiteboardUrl,
          urlFamily: 'api-ref',
          targetRoute:
            '/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/overview',
          pageGraph: {
            closure: { scopeRoot: '/api-ref/whiteboard/android/' },
            pages: [{ url: whiteboardUrl, label: 'API 概览', trail: [] }],
            navigation: [
              {
                kind: 'link',
                label: 'API 概览',
                link: { url: whiteboardUrl },
              },
            ],
          },
        },
      ],
      pageEvidence: [
        {
          requestedUrl: rtcOverviewUrl,
          sourceResolution: {
            type: 'generated-html',
            targetPath:
              'content/docs/zh-CN/api-reference/rtc/android/(current)/overview.mdx',
            targetRoute: '/zh-CN/api-reference/rtc/android/overview',
            route: { scopeKey: 'api-ref/rtc/android' },
          },
        },
        {
          requestedUrl: rtcClientUrl,
          sourceResolution: {
            type: 'generated-html',
            targetPath:
              'content/docs/zh-CN/api-reference/rtc/android/(current)/client.mdx',
            targetRoute: '/zh-CN/api-reference/rtc/android/client',
            route: { scopeKey: 'api-ref/rtc/android' },
          },
        },
        {
          requestedUrl: rtcMcpUrl,
          sourceResolution: {
            type: 'existing-mdx',
            targetPath: 'content/docs/zh-CN/introduction/mcp-integrate.mdx',
            targetRoute: '/zh-CN/introduction/mcp-integrate',
          },
        },
        {
          requestedUrl: speechUrl,
          sourceResolution: {
            type: 'openapi',
            laneId: 'speech-fixture',
            targetPath: 'content/openapi/speech.yaml',
            targetRoute: '/zh-CN/api-reference/api-ref/speech-to-text/join',
            route: { scopeKey: 'doc/speech-to-text/restful' },
          },
        },
        {
          requestedUrl: whiteboardUrl,
          sourceResolution: {
            type: 'generated-html',
            targetPath:
              'content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/overview.mdx',
            targetRoute:
              '/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/overview',
            route: { scopeKey: 'api-ref/whiteboard/android' },
          },
        },
      ],
    };
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, manifestPath),
      JSON.stringify(manifest),
    );
    for (const target of [
      'content/docs/zh-CN/api-reference/rtc/android/(current)/overview.mdx',
      'content/docs/zh-CN/api-reference/rtc/android/(current)/client.mdx',
      'content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/overview.mdx',
    ]) {
      await fs.mkdir(path.dirname(path.join(repoRoot, target)), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, target),
        '---\ntitle: Fixture\n---\n',
      );
    }
    await fs.mkdir(path.join(repoRoot, 'content/docs/zh-CN/api-reference'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/overview.mdx'),
      'old overview\n',
    );
    await fs.writeFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/meta.json'),
      JSON.stringify({
        title: '参考中心',
        root: true,
        pages: [
          'overview',
          'api',
          '---产品参考---',
          'api-ref',
          'whiteboard',
          'rtc',
          'cloud-recording',
          {
            type: 'group',
            title: '实时互动 RTC',
            pages: ['[Android](/zh-CN/api-reference/rtc/android/overview)'],
          },
        ],
      }),
    );
    await fs.mkdir(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/api-ref/signaling'),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(
        repoRoot,
        'content/docs/zh-CN/api-reference/api-ref/signaling/meta.json',
      ),
      JSON.stringify({
        title: '实时消息 RTM',
        navScope: {},
        pages: ['publish', 'receive'],
      }),
    );
    await fs.mkdir(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/whiteboard'),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(
        repoRoot,
        'content/docs/zh-CN/api-reference/whiteboard/meta.json',
      ),
      JSON.stringify({ title: '互动白板', pages: ['fastboard'] }),
    );
    const lanes = [
      {
        id: 'speech-fixture',
        parentUrl: {
          en: '/en/api-reference/api-ref/speech-to-text',
          'zh-CN': '/zh-CN/api-reference/api-ref/speech-to-text',
        },
        sourcePath: {
          en: 'content/openapi/speech.yaml',
          'zh-CN': 'content/openapi/speech.yaml',
        },
        operations: { join: { routeLeaf: 'join' } },
      },
      {
        id: 'signaling-fixture',
        parentUrl: {
          en: '/en/api-reference/api-ref/signaling',
          'zh-CN': '/zh-CN/api-reference/api-ref/signaling',
        },
        sourcePath: {
          en: 'content/openapi/signaling.yaml',
          'zh-CN': 'content/openapi/signaling.yaml',
        },
        operations: {},
      },
    ];

    const result = await runApiCenterNavigation({
      repoRoot,
      manifestPath,
      lanes,
    });
    const overview = await fs.readFile(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/overview.mdx'),
      'utf8',
    );
    const rootMeta = JSON.parse(
      await fs.readFile(
        path.join(repoRoot, 'content/docs/zh-CN/api-reference/meta.json'),
        'utf8',
      ),
    );
    const rtcMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/rtc/android/(current)/meta.json',
        ),
        'utf8',
      ),
    );
    const speechMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/api-ref/speech-to-text/meta.json',
        ),
        'utf8',
      ),
    );
    const signalingMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/api-ref/signaling/meta.json',
        ),
        'utf8',
      ),
    );
    const whiteboardRootMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/whiteboard/meta.json',
        ),
        'utf8',
      ),
    );
    const whiteboardAndroidMeta = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          'content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/meta.json',
        ),
        'utf8',
      ),
    );

    expect(result.report.counts).toMatchObject({ errors: 0, warnings: 0 });
    expect(result.parity.counts).toMatchObject({
      entries: 5,
      overviewActions: 5,
      rootActions: 4,
      visibleNavigationLeaves: 4,
      missingNavigationTargets: 0,
      errors: 0,
    });
    expect(overview.indexOf('实时互动 RTC')).toBeLessThan(
      overview.indexOf('即时通讯 IM'),
    );
    expect(overview).toContain('title: API 中心');
    expect(overview).toContain('description: 查看声网 API 的详细信息。');
    expect(overview).toContain('查看声网 API 的详细信息。');
    expect(overview).not.toContain('API 参考概览');
    expect(overview).not.toContain('按旧站 API Center');
    expect(overview).toContain('https://im.shengwang.cn/docs/sdk/web.html');
    expect(rootMeta.root).toBe(true);
    expect(rootMeta.pages).toContain('api');
    expect(
      rootMeta.pages.filter((page: unknown) => typeof page === 'string'),
    ).toEqual(['overview', 'api']);
    expect(rootMeta.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pages: expect.arrayContaining([
            'api-ref',
            'whiteboard',
            'rtc',
            'cloud-recording',
          ]),
          sidebarHidden: true,
          title: '产品参考',
          type: 'group',
        }),
      ]),
    );
    expect(rootMeta.pages).not.toContain('---产品参考---');
    expect(rootMeta.pages).not.toContain('api-ref');
    expect(rootMeta.pages).not.toContain('rtc');
    expect(rootMeta.pages).not.toContain('whiteboard');
    expect(rootMeta.pages).not.toContain('cloud-recording');
    expect(rootMeta.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '实时互动 RTC' }),
      ]),
    );
    expect(rootMeta.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '实时转录翻译' }),
        expect.objectContaining({ title: '互动白板' }),
      ]),
    );
    expect(rtcMeta.pages).toEqual([
      'overview',
      { type: 'group', title: '核心接口', pages: ['client'] },
    ]);
    expect(JSON.stringify(rtcMeta.pages)).not.toContain('客户端组件 API');
    expect(JSON.stringify(rtcMeta.pages)).not.toContain('MCP');
    expect(rtcMeta.sidebarLabels).toMatchObject({
      '/zh-CN/api-reference/rtc/android/overview': '概览',
      '/zh-CN/api-reference/rtc/android/client': '客户端',
    });
    expect(speechMeta.pages[0]).toBe('index');
    expect(speechMeta.pages).toContain('---服务端 API---');
    expect(speechMeta.pages).toContain('join');
    expect(signalingMeta).toEqual({
      title: '实时消息 RTM',
      pages: ['publish', 'receive'],
    });
    const speechLanding = await fs.readFile(
      path.join(
        repoRoot,
        'content/docs/zh-CN/api-reference/api-ref/speech-to-text/index.mdx',
      ),
      'utf8',
    );
    expect(speechLanding).toContain('title: 实时转录翻译');
    expect(speechLanding).toContain('description: 把频道语音转成文本。');
    expect(speechLanding).toContain(
      '[开始转写](/zh-CN/api-reference/api-ref/speech-to-text/join)',
    );
    expect(speechLanding).not.toContain('## 接口目录');
    expect(speechLanding).not.toContain('实时转录翻译 API');
    expect(speechLanding).toContain('content/openapi/speech.yaml');
    expect(whiteboardRootMeta.pages).toEqual(['fastboard', 'whiteboard-sdk']);
    expect(whiteboardAndroidMeta).toMatchObject({
      navScope: {
        defaultVersion: 'current',
        versions: [{ id: 'current', label: 'Current', path: '(current)' }],
      },
      pages: ['(current)'],
    });

    await expect(
      runApiCenterNavigation({
        repoRoot,
        manifestPath,
        lanes,
        mode: 'check',
      }),
    ).resolves.toBeTruthy();
    const { report: audit } = await auditApiCenterMigration({
      repoRoot,
      ownershipPath:
        'docs/migration/api-center-navigation-generated-files.json',
    });
    expect(audit.counts).toMatchObject({ errors: 0, metaFiles: 8 });
  });

  it('rebuilds the old Edu Store sidebar while keeping other TypeDoc details hidden', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-navigation-edu-store-'),
    );
    roots.push(repoRoot);
    const manifestPath = 'docs/migration/api-center-html-manifest.json';
    const root = 'content/docs/zh-CN/api-reference';
    const apiRoot = `${root}/flexible-classroom/web/api-reference`;
    const eduRoot = `${apiRoot}/edu-store`;
    const routeRoot =
      '/zh-CN/api-reference/flexible-classroom/web/api-reference/edu-store';
    const overview = {
      requestedUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/overview',
      supplementalGeneratedSource: {
        kind: 'edu-store-typedoc',
        navigationRole: 'visible-entry',
        targetPlatform: 'web',
        sourceRelativePath: 'index.html',
        sourceToc: [
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
        ].map((label) => ({ depth: 3, fragment: label, label })),
        sourceNavigation: [
          { label: 'Exports', sourceRelativePath: 'modules.html' },
          {
            label: '"agora-edu-core/src/index"',
            sourceRelativePath: 'modules/agora_edu_core_src_index_.html',
          },
        ],
        sourceSidebar: [
          { label: '概览', sourceRelativePath: 'index.html' },
          {
            label: 'CloudDriveStore',
            sourceRelativePath: 'classes/cloud-drive.html',
          },
        ],
      },
      sourceResolution: {
        status: 'resolved',
        targetPath: `${eduRoot}/index.mdx`,
        targetRoute: routeRoot,
      },
    };
    const exportsPage = {
      requestedUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/modules.html',
      supplementalGeneratedSource: {
        kind: 'edu-store-typedoc',
        navigationRole: 'hidden-reachable',
        targetPlatform: 'web',
        sourceRelativePath: 'modules.html',
      },
      sourceResolution: {
        status: 'resolved',
        targetPath: `${eduRoot}/modules/index.mdx`,
        targetRoute: `${routeRoot}/modules`,
      },
    };
    const modulePage = {
      requestedUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/modules/agora_edu_core_src_index_.html',
      supplementalGeneratedSource: {
        kind: 'edu-store-typedoc',
        navigationRole: 'hidden-reachable',
        targetPlatform: 'web',
        sourceRelativePath: 'modules/agora_edu_core_src_index_.html',
      },
      sourceResolution: {
        status: 'resolved',
        targetPath: `${eduRoot}/modules/agora-edu-core-src-index.mdx`,
        targetRoute: `${routeRoot}/modules/agora-edu-core-src-index`,
      },
    };
    const supplementalDetailPages = [
      exportsPage,
      modulePage,
      ...[
        'classes/cloud-drive',
        'interfaces/cloud-drive',
        'enums/store-kind',
      ].map((relative) => ({
        requestedUrl: `https://doc.shengwang.cn/api-ref/flexible-classroom/javascript/${relative}.html`,
        supplementalGeneratedSource: {
          kind: 'edu-store-typedoc',
          navigationRole: 'hidden-reachable',
          targetPlatform: 'web',
          sourceRelativePath: `${relative}.html`,
        },
        sourceResolution: {
          generator: 'typedoc',
          status: 'resolved',
          targetPath: `${eduRoot}/${relative}.mdx`,
          targetRoute: `${routeRoot}/${relative}`,
        },
      })),
    ];
    const visibleChildPage = supplementalDetailPages.find(
      (page) =>
        page.supplementalGeneratedSource.sourceRelativePath ===
        'classes/cloud-drive.html',
    );
    if (!visibleChildPage) throw new Error('Missing visible child fixture.');
    visibleChildPage.supplementalGeneratedSource.navigationRole =
      'visible-child';
    const regularTypeDocTargets = [
      `${root}/rtc/web/meta.json`,
      `${root}/rtc/react-sdk/web-sdk/meta.json`,
      `${root}/whiteboard/whiteboard-sdk/web/(current)/meta.json`,
      `${root}/rtc/mini-program/meta.json`,
    ];
    const manifest = {
      source: { commit: 'fixture' },
      live: {
        capturedAt: '2026-07-20T00:00:00.000Z',
        heroTitle: 'API 中心',
        heroDescription: '查看 API。',
      },
      entries: [],
      pageEvidence: [
        overview,
        ...supplementalDetailPages,
        ...regularTypeDocTargets.map((targetPath) => ({
          requestedUrl: `https://doc.shengwang.cn/api-ref/${targetPath}`,
          sourceResolution: {
            generator: 'typedoc',
            status: 'resolved',
            targetPath,
          },
        })),
      ],
    };
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, manifestPath),
      JSON.stringify(manifest),
    );
    await fs.mkdir(path.join(repoRoot, root), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, `${root}/meta.json`),
      JSON.stringify({ title: '参考中心', root: true, pages: ['overview'] }),
    );
    const platformRoot = `${root}/flexible-classroom/web`;
    await fs.mkdir(path.join(repoRoot, platformRoot), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, `${platformRoot}/meta.json`),
      JSON.stringify({ title: 'Web', navScope: {}, pages: ['api-reference'] }),
    );
    await fs.mkdir(path.join(repoRoot, apiRoot), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, `${apiRoot}/meta.json`),
      JSON.stringify({
        title: 'API 参考',
        pages: [
          '[Classroom SDK API](/zh-CN/api-reference/flexible-classroom/web/api-reference/classroom-sdk)',
          `[Edu Store API](${routeRoot})`,
        ],
      }),
    );
    for (const targetPath of [overview, ...supplementalDetailPages].map(
      (page) => page.sourceResolution.targetPath,
    )) {
      await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
        recursive: true,
      });
      const body = targetPath.endsWith('/index.mdx')
        ? `## Overview\n\n[CloudDrive](${routeRoot}/classes/cloud-drive#cancelupload)\n`
        : targetPath.endsWith('/classes/cloud-drive.mdx')
          ? `## cancelUpload\n\n[Module](${routeRoot}/modules/agora-edu-core-src-index#clouddrivestore)\n`
          : targetPath.endsWith('/modules/agora-edu-core-src-index.mdx')
            ? '## CloudDriveStore\n'
            : '## Detail\n';
      await fs.writeFile(
        path.join(repoRoot, targetPath),
        `---\ntitle: Page\n---\n\n${body}`,
      );
    }
    const staleModulesMetaPath = `${eduRoot}/modules/meta.json`;
    const staleModulesMeta = `${JSON.stringify(
      { title: 'Exports', pages: ['index', 'agora-edu-core-src-index'] },
      null,
      2,
    )}\n`;
    await fs.writeFile(
      path.join(repoRoot, staleModulesMetaPath),
      staleModulesMeta,
    );
    await fs.writeFile(
      path.join(
        repoRoot,
        'docs/migration/api-center-navigation-generated-files.json',
      ),
      JSON.stringify({
        schemaVersion: 1,
        files: [
          {
            contentHash: sha256(staleModulesMeta),
            sourcePath: manifestPath,
            sourceUrl: 'https://doc.shengwang.cn/api-center',
            targetPath: staleModulesMetaPath,
            type: 'navigation-meta',
          },
        ],
      }),
    );
    const regularTypeDocMeta = new Map<string, string>();
    for (const [index, targetPath] of regularTypeDocTargets.entries()) {
      const contents = `${JSON.stringify(
        { title: `Regular TypeDoc ${index}`, pages: ['overview', 'details'] },
        null,
        2,
      )}\n`;
      regularTypeDocMeta.set(targetPath, contents);
      await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
        recursive: true,
      });
      await fs.writeFile(path.join(repoRoot, targetPath), contents);
    }

    const result = await runApiCenterNavigation({
      repoRoot,
      manifestPath,
      lanes: [],
    });
    const parentMeta = JSON.parse(
      await fs.readFile(path.join(repoRoot, `${apiRoot}/meta.json`), 'utf8'),
    );
    const eduMeta = JSON.parse(
      await fs.readFile(path.join(repoRoot, `${eduRoot}/meta.json`), 'utf8'),
    );
    const platformMeta = JSON.parse(
      await fs.readFile(
        path.join(repoRoot, `${platformRoot}/meta.json`),
        'utf8',
      ),
    );

    expect(result.parity.counts).toMatchObject({
      hiddenReachableTypeDocTargets: 4,
      invalidSupplementalTargetLinks: 0,
      missingHiddenTargets: 0,
      missingVisibleChildTargets: 0,
      promotedSupplementalNavigationLeaves: 0,
      visibleSupplementalChildPages: 1,
      visibleSupplementalEntryPages: 1,
    });
    expect(parentMeta.pages).toEqual([
      '[Classroom SDK API](/zh-CN/api-reference/flexible-classroom/web/api-reference/classroom-sdk)',
      'edu-store',
    ]);
    expect(eduMeta).toMatchObject({
      title: 'Edu Store API',
      pages: ['index', 'classes/cloud-drive'],
    });
    await expect(
      fs.access(path.join(repoRoot, staleModulesMetaPath)),
    ).rejects.toThrow();
    expect(platformMeta).toEqual({
      title: 'Web',
      navScope: {},
      pages: ['api-reference'],
      sidebarLabels: {
        [routeRoot]: '概览',
        [`${routeRoot}/classes/cloud-drive`]: 'CloudDriveStore',
      },
    });
    for (const [targetPath, contents] of regularTypeDocMeta) {
      expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
        contents,
      );
    }
    const linkAudit = auditDocsLinks({
      docsRoot: path.join(repoRoot, 'content/docs'),
      sourcePaths: [
        overview.sourceResolution.targetPath.replace('content/docs/', ''),
        `${eduRoot}/classes/cloud-drive.mdx`.replace('content/docs/', ''),
      ],
    });
    expect(linkAudit.totalLinks).toBe(2);
    expect(linkAudit.invalidLinks).toEqual([]);
    await runApiCenterNavigation({
      repoRoot,
      manifestPath,
      lanes: [],
    });
    await expect(
      runApiCenterNavigation({
        repoRoot,
        manifestPath,
        lanes: [],
        mode: 'check',
      }),
    ).resolves.toBeTruthy();
  });
});
