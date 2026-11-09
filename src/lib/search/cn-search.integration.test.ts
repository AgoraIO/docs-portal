// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addAccordionHeadingsToTocText } from '../mdx/accordion-toc';
import { exportPublishedCnRecords } from './cn-records.server';
import { queryCnSearch } from './cn-search.server';
import type { SearchSection } from './kb-record';
import {
  createSearchIndexClient,
  prepareSearchIndex,
} from './meilisearch-index.server';
import { parseSearchPageState } from './search-page-state';

// Opt-in integration tests use a disposable index on a local engine only.
const host = process.env.MEILI_INTEGRATION_URL;
const key = process.env.MEILI_INTEGRATION_KEY ?? 'local-integration-key';

describe.skipIf(!host)('CN search against Meilisearch', () => {
  let stagedUid: string | undefined;
  let config: { host: string; indexUid: string; searchOnlyKey: string };
  const base = '/realtime-media/rtc/guide';
  const section: SearchSection = {
    id: 'section',
    url: `${base}/android#shared`,
    canonicalUrl: base,
    pageTitle: 'Guide',
    sectionTitle: 'Shared',
    headingPath: ['Guide', 'Shared'],
    content: 'sharedMarker content',
    locale: 'zh-CN',
    product: 'rtc',
    products: ['rtc'],
    platform: ['android'],
    defaultPlatform: 'android',
    isDefaultPlatform: true,
    docType: 'docs',
    audience: ['developer'],
    status: 'published',
    hidden: false,
  };

  beforeAll(async () => {
    if (
      !host ||
      !['localhost', '127.0.0.1', '[::1]'].includes(new URL(host).hostname)
    ) {
      throw new Error('Integration tests require a local Meilisearch instance');
    }
    const records: SearchSection[] = Array.from({ length: 25 }, (_, index) =>
      ['android', 'ios', 'web'].map((platform) => ({
        ...section,
        id: `${platform}-${index}`,
        url: `${base}/${platform}#shared-${index}`,
        sectionTitle: `Shared ${index}`,
        headingPath: ['Guide', `Shared ${index}`],
        content: `sharedMarker content ${index}`,
        platform: [platform],
        isDefaultPlatform: platform === 'android',
      })),
    ).flat();
    records.push(
      ...[
        [
          'rtm-entry',
          '/realtime-media/rtm',
          '实时消息 RTM 概览',
          'RTM 实时消息。',
        ],
        [
          'rtmp-entry',
          '/realtime-media/rtmp-gateway',
          'RTMP 网关概览',
          'RTMP 推流。',
        ],
        [
          'rtc-connection',
          `${base}/android#rtc-connection`,
          'RtcConnection',
          '管理频道连接。',
        ],
        [
          'obfuscation',
          `${base}/android#obfuscation`,
          '防止代码混淆',
          '配置 ProGuard 混淆规则。',
        ],
        [
          'proguard',
          '/realtime-media/rtc/reference/release-notes/android#proguard',
          'R8/ProGuard 混淆规则配置优化',
          '如果开启 R8/ProGuard 缩减和混淆，需要配置保留规则。',
        ],
        [
          'field-obfuscation',
          `${base}/harmonyos#fields`,
          '关闭与状态记录',
          '启用字段混淆时，保留 autoShape 和 strokeType 这两个名称。',
        ],
        [
          'uglify',
          '/realtime-media/whiteboard/reference/release-notes/web#uglify',
          '问题修复',
          'SDK 代码经过 uglify-js 混淆后的语义可能和之前不一样。',
        ],
        [
          'sdk-obfuscation',
          `${base}/android#project`,
          '创建项目',
          `${'在 Android Studio 创建项目并导入最新 SDK。'.repeat(25)}在 proguard-rules.pro 添加规则，防止 SDK 的代码被混淆。`,
        ],
        [
          'unit-confusion',
          `${base}/c#bitrate`,
          '开发注意事项',
          'bps 不要和 kbps 及 Bps 混淆。',
        ],
        [
          'token-confusion',
          `${base}/ios#token`,
          '登录即时通讯',
          '以下代码生成 Chat Token，不要和 RTC Token 混淆。',
        ],
        [
          'cloud-recording',
          '/realtime-media/cloud-recording',
          '云端录制概览',
          '云端录制产品介绍。',
        ],
        [
          'cloud-recording-start',
          '/realtime-media/cloud-recording/get-started/start',
          '快速开始云端录制',
          '开通云端录制并启动服务。',
        ],
        [
          'container-recording',
          '/realtime-media/local-server-recording/build/container',
          '使用云容器部署录制 SDK',
          '在云容器部署本地录制 SDK。',
        ],
        [
          'classroom-recording',
          '/solutions/chatroom/reference/integration#recording',
          '云录制常见问题',
          '课堂配置问题请参考云端录制文档。',
        ],
        ['mixing', `${base}/android#mixing`, '混音', '调节混音音量。'],
        [
          'simulator',
          `${base}/ios#simulator`,
          'Simulator 排查',
          '在 Simulator 中检查 CocoaPods 配置。',
        ],
        [
          'dualstream',
          `${base}/web#dualstream`,
          '双流模式',
          '双流模式同时发送大流和小流。',
        ],
        [
          'simulcast-list',
          '/realtime-media/rtc/reference/release-notes/electron#added',
          '新增',
          '4.6.0 新增 SimulcastStreamMode，扩展 AUTO_SIMULCAST_STREAM 双流支持。',
        ],
      ].map(([id, url, title, content]) => ({
        ...section,
        ...(id === 'rtmp-entry'
          ? { product: 'rtmp-gateway', products: ['rtmp-gateway'] }
          : {}),
        id,
        url,
        canonicalUrl: url.split('#')[0],
        pageTitle: title,
        sectionTitle: title,
        headingPath: [title],
        content,
      })),
      ...['android', 'web'].map((platform) => ({
        ...section,
        id: `${platform}-setup`,
        url: `${base}/${platform}#setup`,
        sectionTitle: 'Setup',
        headingPath: ['Guide', 'Setup'],
        content: `setupMarker ${platform === 'web' ? 'npm' : 'Gradle'}`,
        platform: [platform],
        isDefaultPlatform: platform === 'android',
      })),
    );
    const releaseUrl = '/zh-CN/realtime-media/rtc/releases';
    records.push(
      ...(await exportPublishedCnRecords({
        pages: [{ url: releaseUrl, title: '发版说明', objectType: 'docs' }],
        routes: [
          {
            url: `${releaseUrl}/web`,
            canonicalPath: releaseUrl,
            markdownPath: `${releaseUrl}/web.md`,
            platform: 'web',
            defaultPlatform: 'android',
          },
          {
            url: `${releaseUrl}/android`,
            canonicalPath: releaseUrl,
            markdownPath: `${releaseUrl}/android.md`,
            platform: 'android',
            defaultPlatform: 'android',
          },
        ],
        readMarkdown: async (path) =>
          path.endsWith('/android.md')
            ? '# 发版说明\n\n## Android [#android]\n\n其他更新。'
            : addAccordionHeadingsToTocText(`# 发版说明

<Accordions>
<Accordion title="v3.2" id="v32" headingLevel={2}>

新版本。

### 新增特性 [#feature]

#### 自动接收 [#receive]

enableBrowserAudio 支持自动接收音频。

</Accordion>
<Accordion title="v3.1" id="v31" headingLevel={2}>

历史版本。

### 问题修复 [#fixes]

enableLegacyAudio 修复。

</Accordion>
</Accordions>`),
        readRenderedHtml: async () =>
          '<h2 id="android">Android</h2><h2 id="v32">v3.2</h2><h3 id="feature">新增特性</h3><h4 id="receive">自动接收</h4><h2 id="v31">v3.1</h2><h3 id="fixes">问题修复</h3>',
      })),
    );
    const receipt = await prepareSearchIndex({
      client: createSearchIndexClient({ host, writeKey: key }),
      indexUid: 'docs_search_integration',
      revision: 'integration',
      records,
    });
    stagedUid = receipt.stagedUid;
    config = { host, indexUid: stagedUid, searchOnlyKey: key };
  }, 30_000);

  afterAll(async () => {
    if (host && stagedUid) {
      const response = await fetch(`${host}/indexes/${stagedUid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!response.ok) throw new Error('Failed to remove integration index');
      await createSearchIndexClient({ host, writeKey: key }).wait(
        (await response.json()).taskUid,
      );
    }
  });

  const search = (q: string, page = 1, platform?: string) =>
    queryCnSearch(
      config,
      parseSearchPageState({ q, type: 'docs', page, platform }),
    );

  it('keeps complete product acronyms separate and does not confuse obfuscation with mixing', async () => {
    expect((await search('rtm')).groups.map((group) => group.pageUrl)).toEqual([
      '/realtime-media/rtm',
    ]);
    expect((await search('rtmp')).groups.map((group) => group.pageUrl)).toEqual(
      ['/realtime-media/rtmp-gateway'],
    );
    expect(
      (await search('混淆')).groups
        .flatMap((group) => group.sections)
        .map((hit) => hit.sectionTitle),
    ).toContain('防止代码混淆');
    expect((await search('simulcast')).groups[0].sections[0].sectionTitle).toBe(
      '双流模式',
    );
    expect(
      (await search('simulcast')).groups
        .flatMap((group) => group.sections)
        .map((hit) => hit.sectionTitle),
    ).not.toContain('Simulator 排查');
  });

  it('keeps mixed-case RTM exact when product filters leave no guide matches', async () => {
    for (const q of ['RTM', 'rTm', 'rtM']) {
      for (const type of ['all', 'docs']) {
        const result = await queryCnSearch(
          config,
          parseSearchPageState({ q, type, product: 'rtmp-gateway', page: 1 }),
        );
        expect(result.totalHits, `${q}/${type}`).toBe(0);
        expect(result.groups, `${q}/${type}`).toEqual([]);
      }
    }
  });

  it('separates bare code obfuscation from ordinary confusion without losing technical contexts', async () => {
    const hits = (await search('混淆')).groups.flatMap(
      (group) => group.sections,
    );
    const titles = hits.map((hit) => hit.sectionTitle);
    expect(titles).toEqual(
      expect.arrayContaining([
        '防止代码混淆',
        'R8/ProGuard 混淆规则配置优化',
        '关闭与状态记录',
        '问题修复',
        '创建项目',
      ]),
    );
    expect(titles).not.toContain('开发注意事项');
    expect(titles).not.toContain('登录即时通讯');
    expect(titles).not.toContain('混音');
    const setup = hits.find((hit) => hit.sectionTitle === '创建项目');
    expect(
      setup?.highlights.content.some(
        (part) => part.highlighted && part.text.includes('混淆'),
      ),
    ).toBe(true);
    expect((await search('bps 混淆')).groups[0].sections[0].sectionTitle).toBe(
      '开发注意事项',
    );
    expect(
      (await search('RTC Token 混淆')).groups[0].sections[0].sectionTitle,
    ).toBe('登录即时通讯');
  });

  it('uses the canonical cloud recording intent while retaining explicit container searches', async () => {
    const urls = (await search('云录制')).groups.map((group) => group.pageUrl);
    expect(urls.slice(0, 2)).toEqual([
      '/realtime-media/cloud-recording',
      '/realtime-media/cloud-recording/get-started/start',
    ]);
    expect(
      (await search('云录制 Web')).groups.map((group) => group.pageUrl),
    ).toEqual(
      (await search('云端录制 Web')).groups.map((group) => group.pageUrl),
    );
    expect((await search('云容器部署录制 SDK')).groups[0].pageUrl).toBe(
      '/realtime-media/local-server-recording/build/container',
    );
  });

  it('retains incomplete acronym discovery and explicit release-version intent', async () => {
    expect(
      (await search('RTC')).groups
        .flatMap((group) => group.sections)
        .map((hit) => hit.sectionTitle),
    ).toContain('RtcConnection');
    expect((await search('rt')).groups.map((group) => group.pageUrl)).toEqual(
      expect.arrayContaining([
        '/realtime-media/rtm',
        '/realtime-media/rtmp-gateway',
      ]),
    );
    expect((await search('simulcast 4.6.0')).groups[0].pageUrl).toBe(
      '/realtime-media/rtc/reference/release-notes/electron',
    );
  });

  it('includes non-default platform content in full and quick-search overview queries', async () => {
    const full = await search('enableBrowserAudio');
    const overview = await queryCnSearch(
      config,
      parseSearchPageState({ q: 'enableBrowserAudio' }),
    );
    for (const result of [full, overview]) {
      expect(result.totalHits).toBe(1);
      expect(result.groups[0]).toMatchObject({
        pageUrl: '/realtime-media/rtc/releases/web',
        sections: [
          {
            url: '/realtime-media/rtc/releases/web#receive',
            headingPath: ['发版说明', 'v3.2', '新增特性', '自动接收'],
          },
        ],
      });
    }
    expect((await search('enableBrowserAudio', 1, 'android')).totalHits).toBe(
      0,
    );
    expect((await search('enableBrowserAudio', 1, 'web')).totalHits).toBe(1);
  });

  it('deduplicates equivalent platform chapters before counting and pagination', async () => {
    const first = await search('sharedMarker');
    const second = await search('sharedMarker', 2);
    expect(first.totalHits).toBe(25);
    expect(first.totalPages).toBe(2);
    const firstSections = first.groups.flatMap((group) => group.sections);
    const secondSections = second.groups.flatMap((group) => group.sections);
    expect(firstSections).toHaveLength(20);
    expect(secondSections).toHaveLength(5);
    expect(
      new Set(
        [...firstSections, ...secondSections].map((hit) => hit.sectionTitle),
      ).size,
    ).toBe(25);
    expect((await search('sharedMarker', 1, 'web')).totalHits).toBe(25);
  });

  it('preserves same-name platform chapters with different instructions', async () => {
    const result = await search('setupMarker');
    expect(result.totalHits).toBe(2);
    expect(result.groups[0].sections.map((hit) => hit.url).sort()).toEqual([
      `${base}/android#setup`,
      `${base}/web#setup`,
    ]);
  });

  it('matches the release and identifier together without silently dropping query terms', async () => {
    expect((await search('v3.2 enableBrowserAudio')).totalHits).toBe(1);
    expect((await search('3.2 enableBrowserAudio')).totalHits).toBe(1);
    expect((await search('v3.2 nonexistentIdentifier')).totalHits).toBe(0);
  });
});
