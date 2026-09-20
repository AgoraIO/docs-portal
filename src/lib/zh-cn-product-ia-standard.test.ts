import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';
import {
  resolveZhCnProductIaRedirect,
  ZH_CN_PRODUCT_IA_REDIRECTS,
} from './zh-cn-product-ia-redirects';

type DocsMeta = {
  pages?: string[];
  sidebarIndexTitle?: string;
  title?: string;
};

const speechToTextRoot = resolve(
  process.cwd(),
  'content/docs/zh-CN/realtime-media/speech-to-text',
);
const contentRoot = resolve(process.cwd(), 'content/docs/zh-CN');
const rtmRoot = resolve(contentRoot, 'realtime-media/rtm');
const standardFirstLevelPages = ['index', 'get-started', 'build', 'reference'];
const standardFirstLevelPageSet = new Set(standardFirstLevelPages);
const allowedProductFamilyEntries: Record<string, Set<string>> = {
  'realtime-media/whiteboard': new Set(['whiteboard-sdk', 'fastboard-sdk']),
};
const rtmBuildPageMoves = [
  [
    'build/setup-and-access/enable-service',
    'build/rtm-initialization/enable-service',
  ],
  [
    'build/setup-and-access/application-setup',
    'build/rtm-initialization/application-setup',
  ],
  [
    'build/setup-and-access/add-event-listener',
    'build/messaging/add-event-listener',
  ],
  ['build/setup-and-access/login', 'build/authentication-and-connection/login'],
  [
    'build/setup-and-access/link-basic',
    'build/authentication-and-connection/link-basic',
  ],
  [
    'build/setup-and-access/link-state',
    'build/authentication-and-connection/link-state',
  ],
  [
    'build/setup-and-access/data-storage',
    'build/state-and-attributes/data-storage',
  ],
  [
    'build/setup-and-access/private-setup',
    'build/network-and-private-deployment/private-setup',
  ],
  [
    'build/manage-channels/channel-basic',
    'build/channels-and-topics/channel-basic',
  ],
  [
    'build/manage-channels/channel-name',
    'build/channels-and-topics/channel-name',
  ],
  [
    'build/manage-channels/message-channel',
    'build/channels-and-topics/message-channel',
  ],
  [
    'build/manage-channels/stream-channel',
    'build/channels-and-topics/stream-channel',
  ],
  ['build/manage-messages/send-message', 'build/messaging/send-message'],
  [
    'build/manage-messages/constructed',
    'build/message-design-and-history/constructed',
  ],
  [
    'build/manage-messages/serialized',
    'build/message-design-and-history/serialized',
  ],
  [
    'build/manage-messages/history-message',
    'build/message-design-and-history/history-message',
  ],
  [
    'build/manage-topics/topic-basic',
    'build/channels-and-topics/topics/topic-basic',
  ],
  ['build/manage-topics/usage', 'build/channels-and-topics/topics/usage'],
  [
    'build/manage-topics/topic-events',
    'build/channels-and-topics/topics/topic-events',
  ],
  [
    'build/manage-presence/presence-basic',
    'build/state-and-attributes/presence-basic',
  ],
  [
    'build/manage-presence/temporary-user-state',
    'build/state-and-attributes/temporary-user-state',
  ],
  [
    'build/manage-presence/presence-events',
    'build/state-and-attributes/presence-events',
  ],
  [
    'build/manage-metadata/user-metadata',
    'build/state-and-attributes/user-metadata',
  ],
  [
    'build/manage-metadata/channel-metadata',
    'build/state-and-attributes/channel-metadata',
  ],
  [
    'build/manage-metadata/metadata-events',
    'build/state-and-attributes/metadata-events',
  ],
  [
    'build/security-and-auth/token-generation',
    'build/authentication-and-connection/token-generation',
  ],
  [
    'build/security-and-auth/user-authentication',
    'build/authentication-and-connection/user-authentication',
  ],
] as const;

const productBuildPageMoves = [
  [
    'realtime-media/media-push',
    'build/setup-and-access/enable-service',
    'build/enable-media-push/enable-service',
  ],
  [
    'realtime-media/media-push',
    'build/setup-and-access/http-basic-auth',
    'build/enable-media-push/http-basic-auth',
  ],
  [
    'realtime-media/media-push',
    'build/setup-and-access/call-api',
    'build/enable-media-push/call-api',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/set-no-transcode',
    'build/configure-media-stream/set-no-transcode',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/set-transcode',
    'build/configure-media-stream/set-transcode',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/update-transcode',
    'build/configure-media-stream/update-transcode',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/vertical-streaming',
    'build/configure-media-stream/vertical-streaming',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/set-volume',
    'build/configure-media-stream/set-volume',
  ],
  [
    'realtime-media/media-push',
    'build/manage-media-streams/set-sei',
    'build/configure-media-stream/set-sei',
  ],
  [
    'realtime-media/media-push',
    'build/monitor-events/enable-ncs',
    'build/monitor-and-maintain-media-push/enable-ncs',
  ],
  [
    'realtime-media/media-push',
    'build/optimize-and-operate/checklist',
    'build/monitor-and-maintain-media-push/checklist',
  ],
  [
    'realtime-media/media-push',
    'build/optimize-and-operate/ensure-converter-created',
    'build/monitor-and-maintain-media-push/ensure-converter-created',
  ],
  [
    'realtime-media/media-push',
    'build/optimize-and-operate/rest-availability',
    'build/monitor-and-maintain-media-push/rest-availability',
  ],
  [
    'realtime-media/local-server-recording',
    'build/setup-and-access/enable-service',
    'build/recording-preparation/enable-service',
  ],
  [
    'realtime-media/local-server-recording',
    'build/setup-and-access/generate-token',
    'build/recording-preparation/generate-token',
  ],
  [
    'realtime-media/local-server-recording',
    'build/setup-and-access/cloud-proxy',
    'build/recording-preparation/cloud-proxy',
  ],
  [
    'realtime-media/local-server-recording',
    'build/recording-modes/recording-mode',
    'build/configure-recording-output/recording-mode',
  ],
  [
    'realtime-media/local-server-recording',
    'build/recording-modes/set-layout',
    'build/configure-recording-output/set-layout',
  ],
  [
    'realtime-media/local-server-recording',
    'build/recording-modes/watermark',
    'build/configure-recording-output/watermark',
  ],
  [
    'realtime-media/local-server-recording',
    'build/recording-modes/screen-capture',
    'build/configure-recording-output/screen-capture',
  ],
  [
    'realtime-media/local-server-recording',
    'build/optimize-and-operate/restore-files',
    'build/best-practices/restore-files',
  ],
  ['realtime-media/usage-analytics', 'build/fls/data', 'build/view-live-data'],
  [
    'realtime-media/usage-analytics',
    'build/rtc/monitor',
    'build/monitor-call-quality/monitor',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/alarm',
    'build/monitor-call-quality/alarm',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/call-search/overview',
    'build/investigate-call-problems/overview',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/call-search/call-detail',
    'build/investigate-call-problems/call-detail',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/call-search/troubleshooting',
    'build/investigate-call-problems/troubleshooting',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/data-insight/basic',
    'build/analyze-call-data/basic',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/data-insight/plus',
    'build/analyze-call-data/plus',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/data-insight/troubleshooting',
    'build/analyze-call-data/troubleshooting',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/embeded',
    'build/embed-and-maintain-data-service/embeded',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/guarantee-rest',
    'build/embed-and-maintain-data-service/guarantee-rest',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtc/metric-ids',
    'build/metric-ids',
  ],
  [
    'realtime-media/usage-analytics',
    'build/rtm/data-insight',
    'build/analyze-signaling-data',
  ],
  [
    'solutions/flexible-classroom',
    'build/setup-and-access/enable',
    'build/create-classroom/enable',
  ],
  [
    'solutions/flexible-classroom',
    'build/setup-and-access/configure',
    'build/create-classroom/configure',
  ],
  [
    'solutions/flexible-classroom',
    'build/setup-and-access/generate-token',
    'build/create-classroom/generate-token',
  ],
  [
    'solutions/flexible-classroom',
    'build/setup-and-access/http-token-auth',
    'build/create-classroom/http-token-auth',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/integrate-systems',
    'build/create-classroom/integrate-systems',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/courseware',
    'build/configure-teaching-resources-and-interactions/courseware',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/whiteboard-on-off',
    'build/configure-teaching-resources-and-interactions/whiteboard-on-off',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/proctor-online-exams',
    'build/configure-teaching-resources-and-interactions/proctor-online-exams',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/record',
    'build/configure-teaching-resources-and-interactions/record',
  ],
  [
    'solutions/flexible-classroom',
    'build/manage-classroom/high-availability',
    'build/maintain-classroom-service/high-availability',
  ],
  [
    'solutions/flexible-classroom',
    'build/customize-and-extend/custom-ui',
    'build/customize-classroom-experience/custom-ui',
  ],
  [
    'solutions/flexible-classroom',
    'build/customize-and-extend/custom-ui-new',
    'build/customize-classroom-experience/custom-ui-new',
  ],
  [
    'solutions/flexible-classroom',
    'build/customize-and-extend/widget',
    'build/customize-classroom-experience/widget',
  ],
  [
    'solutions/flexible-classroom',
    'build/customize-and-extend/widget-tech',
    'build/customize-classroom-experience/widget-tech',
  ],
  [
    'solutions/flexible-classroom',
    'build/customize-and-extend/widget-previous',
    'build/customize-classroom-experience/widget-previous',
  ],
  [
    'solutions/showroom',
    'build/setup-and-access/enable-service',
    'build/enable-service',
  ],
  [
    'solutions/showroom',
    'build/implement-core-features/integrate-showroom',
    'build/integrate-showroom',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/audio-scenario',
    'build/audio-scenario',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/hq-video',
    'build/hq-video',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/video-moderation',
    'build/video-moderation',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/overview',
    'build/beauty/overview',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/bytedance/integrate',
    'build/beauty/bytedance-integrate',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/bytedance/run-project',
    'build/beauty/bytedance-run-project',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/faceunity/integrate',
    'build/beauty/faceunity-integrate',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/faceunity/run-project',
    'build/beauty/faceunity-run-project',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/sensetime/integrate',
    'build/beauty/sensetime-integrate',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/beauty/sensetime/run-project',
    'build/beauty/sensetime-run-project',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/video-loader/overview',
    'build/video-loader/overview',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/video-loader/integrate',
    'build/video-loader/integrate',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/video-loader/guidance',
    'build/video-loader/guidance',
  ],
  [
    'solutions/showroom',
    'build/customize-and-extend/video-loader/run-project',
    'build/video-loader/run-project',
  ],
] as const;

const productPageMoves = [
  [
    'solutions/showroom',
    'build/integrate-check-point',
    'reference/integrate-check-point',
  ],
  [
    'solutions/flexible-classroom',
    'build/configure-teaching-resources-and-interactions/classroom-properties',
    'build/maintain-classroom-service/classroom-properties',
  ],
] as const;

const productBuildMetas = [
  [
    'realtime-media/media-push/build/meta.json',
    {
      title: '开发与集成',
      pages: [
        'enable-media-push',
        'configure-media-stream',
        'monitor-and-maintain-media-push',
      ],
    },
  ],
  [
    'realtime-media/media-push/build/enable-media-push/meta.json',
    {
      title: '开通与接入',
      pages: ['enable-service', 'http-basic-auth', 'call-api'],
    },
  ],
  [
    'realtime-media/media-push/build/configure-media-stream/meta.json',
    {
      title: '配置推流媒体流',
      pages: [
        'set-no-transcode',
        'set-transcode',
        'update-transcode',
        'vertical-streaming',
        'set-volume',
        'set-sei',
      ],
    },
  ],
  [
    'realtime-media/media-push/build/monitor-and-maintain-media-push/meta.json',
    {
      title: '最佳实践',
      pages: [
        'enable-ncs',
        'checklist',
        'ensure-converter-created',
        'rest-availability',
      ],
    },
  ],
  [
    'realtime-media/local-server-recording/build/meta.json',
    {
      title: '开发与集成',
      pages: [
        'recording-preparation',
        'configure-recording-output',
        'best-practices',
        'legacy',
      ],
    },
  ],
  [
    'realtime-media/local-server-recording/build/recording-preparation/meta.json',
    {
      title: '接入准备',
      pages: ['enable-service', 'generate-token', 'cloud-proxy'],
    },
  ],
  [
    'realtime-media/local-server-recording/build/configure-recording-output/meta.json',
    {
      title: '配置录制输出',
      pages: ['recording-mode', 'set-layout', 'watermark', 'screen-capture'],
    },
  ],
  [
    'realtime-media/local-server-recording/build/best-practices/meta.json',
    {
      title: '最佳实践',
      pages: ['restore-files'],
    },
  ],
  [
    'realtime-media/usage-analytics/build/meta.json',
    {
      title: '开发与集成',
      pages: [
        'view-live-data',
        'monitor-call-quality',
        'investigate-call-problems',
        'analyze-call-data',
        'embed-and-maintain-data-service',
        '!metric-ids',
        '!analyze-signaling-data',
      ],
    },
  ],
  [
    'realtime-media/usage-analytics/build/monitor-call-quality/meta.json',
    {
      title: '监控通话质量',
      pages: ['monitor', 'alarm'],
    },
  ],
  [
    'realtime-media/usage-analytics/build/investigate-call-problems/meta.json',
    {
      title: '调查通话问题',
      pages: ['overview', 'call-detail', 'troubleshooting'],
    },
  ],
  [
    'realtime-media/usage-analytics/build/analyze-call-data/meta.json',
    {
      title: '分析通话数据',
      pages: ['basic', 'plus', 'troubleshooting'],
    },
  ],
  [
    'realtime-media/usage-analytics/build/embed-and-maintain-data-service/meta.json',
    {
      title: '嵌入并保障数据服务',
      pages: ['embeded', 'guarantee-rest'],
    },
  ],
  [
    'solutions/flexible-classroom/build/meta.json',
    {
      title: '开发与集成',
      pages: [
        'create-classroom',
        'configure-teaching-resources-and-interactions',
        'customize-classroom-experience',
        'maintain-classroom-service',
      ],
    },
  ],
  [
    'solutions/flexible-classroom/build/create-classroom/meta.json',
    {
      title: '创建可用课堂',
      pages: [
        'enable',
        'configure',
        'generate-token',
        'http-token-auth',
        'integrate-systems',
      ],
    },
  ],
  [
    'solutions/flexible-classroom/build/configure-teaching-resources-and-interactions/meta.json',
    {
      title: '配置教学资源与互动',
      pages: [
        'courseware',
        'whiteboard-on-off',
        'proctor-online-exams',
        'record',
      ],
    },
  ],
  [
    'solutions/flexible-classroom/build/customize-classroom-experience/meta.json',
    {
      title: '定制课堂体验',
      pages: [
        'custom-ui',
        'custom-ui-new',
        'widget',
        'widget-tech',
        'widget-previous',
      ],
    },
  ],
  [
    'solutions/flexible-classroom/build/maintain-classroom-service/meta.json',
    {
      title: '最佳实践',
      pages: ['classroom-properties', 'high-availability'],
    },
  ],
  [
    'solutions/showroom/build/meta.json',
    {
      title: '开发与集成',
      pages: [
        'enable-service',
        'integrate-showroom',
        'audio-scenario',
        'hq-video',
        'beauty',
        'video-loader',
        'video-moderation',
      ],
    },
  ],
  [
    'solutions/showroom/build/beauty/meta.json',
    {
      title: '接入美颜能力',
      pages: [
        'overview',
        'bytedance-integrate',
        'bytedance-run-project',
        'faceunity-integrate',
        'faceunity-run-project',
        'sensetime-integrate',
        'sensetime-run-project',
      ],
    },
  ],
  [
    'solutions/showroom/build/video-loader/meta.json',
    {
      title: '使用视频加载器',
      pages: ['overview', 'integrate', 'guidance', 'run-project'],
    },
  ],
] as const;

const productReferenceMetas = [
  [
    'solutions/showroom/reference/meta.json',
    {
      title: '参考',
      pages: ['api', 'downloads', 'integrate-check-point'],
    },
  ],
] as const;

function readMeta(path: string): DocsMeta {
  return JSON.parse(readFileSync(path, 'utf8')) as DocsMeta;
}

function stripPagePrefix(page: string) {
  return page.replace(/^[!.-]+/, '');
}

function getFirstLevelPage(page: string) {
  return stripPagePrefix(page).split('/')[0];
}

function pageExistsAtRelativePath(productRoot: string, page: string) {
  const relativePath = resolve(contentRoot, productRoot, stripPagePrefix(page));
  const candidates = [
    `${relativePath}.mdx`,
    `${relativePath}.md`,
    resolve(relativePath, 'index.mdx'),
    resolve(relativePath, 'index.md'),
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

function parseZhCnDocsUrl(url: string) {
  const [pathname] = url.split(/[?#]/, 1);
  const parts = pathname.replace(/^\/zh-CN\//, '').split('/');
  const [tab, ...slugSegments] = parts;

  return { slugSegments, tab };
}

function getContentPagePathForUrl(url: string) {
  const { slugSegments, tab } = parseZhCnDocsUrl(url);
  const relativePath = resolve(contentRoot, tab, ...slugSegments);
  const candidates = [
    `${relativePath}.mdx`,
    `${relativePath}.md`,
    resolve(relativePath, 'index.mdx'),
    resolve(relativePath, 'index.md'),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function getRedirectTargetProductRoots() {
  const roots = new Set<string>();

  for (const redirectUrl of Object.values(ZH_CN_PRODUCT_IA_REDIRECTS)) {
    const { slugSegments, tab } = parseZhCnDocsUrl(redirectUrl);

    if (tab !== 'realtime-media' && tab !== 'solutions') {
      continue;
    }

    const standardEntryIndex = slugSegments.findIndex((segment) =>
      standardFirstLevelPageSet.has(segment),
    );
    const productRootSegments =
      standardEntryIndex === -1
        ? slugSegments
        : slugSegments.slice(0, standardEntryIndex);

    roots.add([tab, ...productRootSegments].join('/'));
  }

  return [...roots].sort();
}

describe('zh-CN product IA standard', () => {
  it.each(productBuildMetas)(
    'uses the confirmed title and page order for %s',
    (metaPath, expectedMeta) => {
      expect(readMeta(resolve(contentRoot, metaPath))).toEqual(expectedMeta);
    },
  );

  it.each(productReferenceMetas)(
    'uses the confirmed title and page order for %s',
    (metaPath, expectedMeta) => {
      expect(readMeta(resolve(contentRoot, metaPath))).toEqual(expectedMeta);
    },
  );

  it('uses standard root entries for speech-to-text', () => {
    const meta = readMeta(resolve(speechToTextRoot, 'meta.json'));

    expect(meta.title).toBe('实时转录翻译');
    expect(meta.sidebarIndexTitle).toBe('实时转录翻译概览');
    expect(meta.pages).toEqual([
      'index',
      'get-started/quick-start',
      'build',
      'reference',
    ]);
  });

  it('uses Chinese titles for the standard speech-to-text groups', () => {
    expect(
      readMeta(resolve(speechToTextRoot, 'get-started/meta.json')),
    ).toEqual({
      pages: ['quick-start'],
      title: '快速开始',
    });
    expect(
      readMeta(resolve(speechToTextRoot, 'build/meta.json')),
    ).toMatchObject({
      title: '构建功能',
    });
    expect(
      readMeta(resolve(speechToTextRoot, 'reference/meta.json')),
    ).toMatchObject({
      title: '参考',
    });
  });

  it('removes legacy speech-to-text top-level grouping folders', () => {
    for (const legacyFolder of [
      'overview',
      'user-guides',
      'best-practices',
      'api',
      'webhook',
    ]) {
      expect(existsSync(resolve(speechToTextRoot, legacyFolder))).toBe(false);
    }
  });

  it.each([
    [['overview', 'product-overview'], '/zh-CN/realtime-media/speech-to-text'],
    [
      ['get-started', 'enable-service'],
      '/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service',
    ],
    [
      ['user-guides', 'record-captions'],
      '/zh-CN/realtime-media/speech-to-text/build/process-transcription-data/record-captions',
    ],
    [
      ['best-practices', 'optimize-quality'],
      '/zh-CN/realtime-media/speech-to-text/build/extend-and-optimize/optimize-quality',
    ],
    [
      ['api', 'supported-languages'],
      '/zh-CN/realtime-media/speech-to-text/reference/supported-languages',
    ],
    [
      ['webhook', 'ncs-events'],
      '/zh-CN/realtime-media/speech-to-text/reference/ncs-events',
    ],
  ] as const)(
    'redirects old speech-to-text path %j',
    async (slugSegments, redirectUrl) => {
      const result = await loadDocsPagePayload('zh-CN', 'realtime-media', [
        'speech-to-text',
        ...slugSegments,
      ]);

      expect(result).toEqual({ redirectUrl });
    },
  );

  it.each([
    [
      'realtime-media',
      ['rtc', 'basic-features', 'join-leave-channel'],
      '/zh-CN/realtime-media/rtc/build/channel-and-connection/join-leave-channel',
    ],
    [
      'realtime-media',
      [
        'recording',
        'cloud-recording',
        'user-guides',
        'manage-file',
        'playback',
      ],
      '/zh-CN/realtime-media/cloud-recording/build/manage-recorded-files/playback',
    ],
    [
      'solutions',
      ['smart-doorbell', 'paas', 'overview', 'paas-overview'],
      '/zh-CN/solutions/smart-doorbell/build/paas-overview',
    ],
    [
      'solutions',
      ['smart-doorbell', 'build', 'paas', 'paas-overview'],
      '/zh-CN/solutions/smart-doorbell/build/paas-overview',
    ],
    [
      'solutions',
      ['smart-doorbell', 'build', 'paas', 'get-started', 'quick-start'],
      '/zh-CN/solutions/smart-doorbell/build/quick-start',
    ],
    [
      'solutions',
      [
        'smart-doorbell',
        'build',
        'paas',
        'value-added-feature',
        'amazon-alexa',
      ],
      '/zh-CN/solutions/smart-doorbell/build/amazon-alexa',
    ],
    [
      'solutions',
      [
        'smart-doorbell',
        'build',
        'paas',
        'value-added-feature',
        'google-assistant',
      ],
      '/zh-CN/solutions/smart-doorbell/build/google-assistant',
    ],
    [
      'solutions',
      ['smart-doorbell', 'build', 'get-started', 'quick-start'],
      '/zh-CN/solutions/smart-doorbell/build/quick-start',
    ],
    [
      'solutions',
      ['smart-doorbell', 'build', 'value-added-feature', 'amazon-alexa'],
      '/zh-CN/solutions/smart-doorbell/build/amazon-alexa',
    ],
    [
      'solutions',
      ['smart-doorbell', 'build', 'value-added-feature', 'google-assistant'],
      '/zh-CN/solutions/smart-doorbell/build/google-assistant',
    ],
    [
      'solutions',
      ['smart-doorbell', 'product-overview'],
      '/zh-CN/solutions/smart-doorbell',
    ],
  ] as const)(
    'redirects representative old %s path %j',
    async (tab, slugSegments, redirectUrl) => {
      const result = await loadDocsPagePayload('zh-CN', tab, [...slugSegments]);

      expect(result).toEqual({ redirectUrl, statusCode: 301 });
    },
  );

  it('redirects the representative old RTM path with 301', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'realtime-media', [
        'rtm',
        'user-guide',
        'message',
        'send-message',
      ]),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/realtime-media/rtm/build/messaging/send-message',
      statusCode: 301,
    });
  });

  it.each(rtmBuildPageMoves)(
    'moves RTM build page %s to %s',
    async (legacyPath, canonicalPath) => {
      expect(pageExistsAtRelativePath('realtime-media/rtm', legacyPath)).toBe(
        false,
      );
      expect(
        pageExistsAtRelativePath('realtime-media/rtm', canonicalPath),
      ).toBe(true);

      await expect(
        loadDocsPagePayload('zh-CN', 'realtime-media', [
          'rtm',
          ...legacyPath.split('/'),
        ]),
      ).resolves.toEqual({
        redirectUrl: `/zh-CN/realtime-media/rtm/${canonicalPath}`,
        statusCode: 301,
      });
    },
  );

  it.each(productBuildPageMoves)(
    'moves %s page %s to %s and redirects the old URL',
    async (productRoot, legacyPath, canonicalPath) => {
      expect(pageExistsAtRelativePath(productRoot, legacyPath)).toBe(false);
      expect(pageExistsAtRelativePath(productRoot, canonicalPath)).toBe(true);

      const [tab, ...productSegments] = productRoot.split('/');
      await expect(
        loadDocsPagePayload('zh-CN', tab, [
          ...productSegments,
          ...legacyPath.split('/'),
        ]),
      ).resolves.toEqual({
        redirectUrl: `/zh-CN/${productRoot}/${canonicalPath}`,
        statusCode: 301,
      });
    },
  );

  it.each(productPageMoves)(
    'moves %s page %s to %s and redirects the old URL',
    async (productRoot, legacyPath, canonicalPath) => {
      expect(pageExistsAtRelativePath(productRoot, legacyPath)).toBe(false);
      expect(pageExistsAtRelativePath(productRoot, canonicalPath)).toBe(true);

      const [tab, ...productSegments] = productRoot.split('/');
      await expect(
        loadDocsPagePayload('zh-CN', tab, [
          ...productSegments,
          ...legacyPath.split('/'),
        ]),
      ).resolves.toEqual({
        redirectUrl: `/zh-CN/${productRoot}/${canonicalPath}`,
        statusCode: 301,
      });
    },
  );

  it.each([
    [
      ['local-server-recording', 'build', 'setup-and-access', 'enable-service'],
      '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/enable-service',
    ],
    [
      ['usage-analytics', 'build', 'rtc', 'call-search', 'overview'],
      '/zh-CN/realtime-media/usage-analytics/build/investigate-call-problems/overview',
    ],
  ] as const)(
    'redirects the representative old Build path %j directly to its canonical page with 301',
    async (slugSegments, redirectUrl) => {
      await expect(
        loadDocsPagePayload('zh-CN', 'realtime-media', [...slugSegments]),
      ).resolves.toEqual({ redirectUrl, statusCode: 301 });

      const { slugSegments: canonicalSegments, tab } =
        parseZhCnDocsUrl(redirectUrl);
      expect(
        resolveZhCnProductIaRedirect('zh-CN', tab, canonicalSegments),
      ).toBeNull();
    },
  );

  it('prioritizes an exact recording redirect over its matching prefix', async () => {
    const redirectUrl =
      '/zh-CN/realtime-media/local-server-recording/build/recording-preparation/enable-service';
    const slugSegments = [
      'recording',
      'local-server-recording',
      'get-started',
      'enable-service',
    ];

    await expect(
      loadDocsPagePayload('zh-CN', 'realtime-media', slugSegments),
    ).resolves.toEqual({ redirectUrl, statusCode: 301 });

    const { slugSegments: canonicalSegments, tab } =
      parseZhCnDocsUrl(redirectUrl);
    expect(
      resolveZhCnProductIaRedirect('zh-CN', tab, canonicalSegments),
    ).toBeNull();
  });

  it('keeps unmatched legacy recording prefix redirects at the default status', async () => {
    const slugSegments = [
      'recording',
      'local-server-recording',
      'unmapped-legacy-page',
    ];

    expect(
      resolveZhCnProductIaRedirect('zh-CN', 'realtime-media', slugSegments),
    ).toBe('/zh-CN/realtime-media/local-server-recording/unmapped-legacy-page');

    await expect(
      loadDocsPagePayload('zh-CN', 'realtime-media', slugSegments),
    ).resolves.toEqual({
      redirectUrl:
        '/zh-CN/realtime-media/local-server-recording/unmapped-legacy-page',
    });
  });

  it.each(productBuildPageMoves)(
    'loads the canonical %s page %s at %s without redirecting',
    async (productRoot, _legacyPath, canonicalPath) => {
      const [tab, ...productSegments] = productRoot.split('/');
      const payload = await loadDocsPagePayload('zh-CN', tab, [
        ...productSegments,
        ...canonicalPath.split('/'),
      ]);

      expect(payload).toBeTruthy();
      expect(payload).not.toHaveProperty('redirectUrl');
    },
    30_000,
  );

  it('preserves every Legacy recording MDX filename and both collapsible groups', () => {
    const legacyRoot = resolve(
      contentRoot,
      'realtime-media/local-server-recording/build/legacy',
    );

    expect(
      readdirSync(legacyRoot, { encoding: 'utf8', recursive: true })
        .filter((file) => file.endsWith('.mdx'))
        .sort(),
    ).toEqual([
      'collect-logs.mdx',
      'composite-mode.mdx',
      'docker.mdx',
      'individual-mode.mdx',
      'integrate-sdk.mdx',
      'manage-files.mdx',
      'merge-files.mdx',
      'raw-data.mdx',
      'record-by-api.mdx',
      'record-by-cmd.mdx',
      'restore-files.mdx',
      'screenshot.mdx',
      'set-layout.mdx',
      'set-output-video.mdx',
      'watermark.mdx',
    ]);
    expect(readMeta(resolve(legacyRoot, 'meta.json'))).toEqual({
      title: 'Legacy 文档',
      pages: [
        {
          type: 'group',
          title: '功能指南',
          collapsible: true,
          pages: [
            'integrate-sdk',
            'record-by-cmd',
            'record-by-api',
            'docker',
            'individual-mode',
            'composite-mode',
            'set-layout',
            'raw-data',
            'manage-files',
            'merge-files',
            'watermark',
            'screenshot',
            'collect-logs',
            'restore-files',
          ],
        },
        {
          type: 'group',
          title: '最佳实践',
          collapsible: true,
          pages: ['set-output-video'],
        },
      ],
    });
  });

  it('orders the RTM build IA groups by the new information architecture', () => {
    expect(readMeta(resolve(rtmRoot, 'build/meta.json')).pages).toEqual([
      'rtm-initialization',
      'authentication-and-connection',
      'channels-and-topics',
      'messaging',
      'message-design-and-history',
      'state-and-attributes',
      'network-and-private-deployment',
      'troubleshooting',
    ]);
  });

  it('keeps the RTM application setup anchor IDs stable', () => {
    const pagePath = getContentPagePathForUrl(
      '/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup',
    );

    expect(pagePath).not.toBeNull();
    if (!pagePath) {
      return;
    }

    const content = readFileSync(pagePath, 'utf8');
    for (const id of [
      'servicetype',
      'protocol',
      'install',
      'cloud-proxy-设置',
      'proxy-设置',
      '防火墙白名单设置',
    ]) {
      expect(content).toContain(`<a id="${id}"></a>`);
    }
  });

  it('keeps the RTM network configuration chapters in order', () => {
    const pagePath = getContentPagePathForUrl(
      '/zh-CN/realtime-media/rtm/build/network-and-private-deployment/network-configuration',
    );

    expect(pagePath).not.toBeNull();
    if (!pagePath) {
      return;
    }

    const headings = (
      readFileSync(pagePath, 'utf8').match(/^## .+$/gm) ?? []
    ).map((heading) => heading.slice(3));
    expect(headings).toEqual([
      '连接协议配置',
      'Cloud Proxy 设置',
      'Proxy 设置',
      '防火墙白名单设置',
    ]);
  });

  it('serves canonical speech-to-text build and reference pages', async () => {
    const buildResult = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'speech-to-text',
      'build',
      'process-transcription-data',
      'record-captions',
    ]);
    const referenceResult = await loadDocsPagePayload(
      'zh-CN',
      'realtime-media',
      ['speech-to-text', 'reference', 'supported-languages'],
    );

    expect(buildResult).toBeTruthy();
    expect(referenceResult).toBeTruthy();
    expect(buildResult).not.toHaveProperty('redirectUrl');
    expect(referenceResult).not.toHaveProperty('redirectUrl');
  }, 30_000);

  it('keeps every zh-CN product IA redirect source and target routable', () => {
    const failures: string[] = [];

    for (const [sourcePath, redirectUrl] of Object.entries(
      ZH_CN_PRODUCT_IA_REDIRECTS,
    )) {
      const [sourceTab, ...sourceSlugSegments] = sourcePath.split('/');
      const resolvedRedirect = resolveZhCnProductIaRedirect(
        'zh-CN',
        sourceTab,
        sourceSlugSegments,
      );
      const targetPath = getContentPagePathForUrl(redirectUrl);

      if (resolvedRedirect !== redirectUrl) {
        failures.push(
          `${sourcePath} expected redirect to ${redirectUrl}, got ${resolvedRedirect}`,
        );
      }

      if (!targetPath) {
        failures.push(
          `${sourcePath} redirects to missing target ${redirectUrl}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it('uses only standard first-level entries or direct page leaves in migrated product roots', () => {
    const failures: string[] = [];

    for (const productRoot of getRedirectTargetProductRoots()) {
      const absoluteRoot = resolve(contentRoot, productRoot);
      const meta = readMeta(resolve(absoluteRoot, 'meta.json'));
      const pages = (meta.pages ?? []).map(stripPagePrefix);
      const allowedFamilyEntries =
        allowedProductFamilyEntries[productRoot] ?? new Set<string>();
      const disallowedPages = pages.filter(
        (page) =>
          !standardFirstLevelPageSet.has(getFirstLevelPage(page)) &&
          !allowedFamilyEntries.has(getFirstLevelPage(page)),
      );
      const missingFlattenedLeaves = pages.filter(
        (page) =>
          page.includes('/') && !pageExistsAtRelativePath(productRoot, page),
      );
      const extraTopLevelMarkdownFiles = readdirSync(absoluteRoot, {
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => /\.mdx?$/.test(name) && !/^index\.mdx?$/.test(name));

      if (disallowedPages.length > 0) {
        failures.push(
          `${productRoot} has non-standard first-level pages: ${disallowedPages.join(
            ', ',
          )}`,
        );
      }

      if (missingFlattenedLeaves.length > 0) {
        failures.push(
          `${productRoot} has flattened page leaves that do not resolve: ${missingFlattenedLeaves.join(
            ', ',
          )}`,
        );
      }

      if (extraTopLevelMarkdownFiles.length > 0) {
        failures.push(
          `${productRoot} has extra top-level markdown files: ${extraTopLevelMarkdownFiles.join(
            ', ',
          )}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });
});
