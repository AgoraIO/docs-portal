import type { SearchSection } from '../../src/lib/search/kb-record';

export type CnKbKind =
  | 'overview'
  | 'tutorial'
  | 'api-reference'
  | 'faq'
  | 'platform-version';

export type CnKbManifestEntry = {
  kind: CnKbKind;
  route: string;
  sourcePath: string;
  reason: string;
  product: string;
  platform?: string[];
  version?: string;
  audience: SearchSection['audience'];
  queryIds: string[];
};

// Paths are a fixed allowlist. The route is derived only from each explicit source path.
function page(
  kind: CnKbKind,
  sourcePath: string,
  reason: string,
  product: string,
  queryId: string,
  options: { platform?: string[]; version?: string; support?: boolean } = {},
): CnKbManifestEntry {
  return {
    kind,
    sourcePath,
    route: sourcePath.replace(/^content\/docs/, '').replace(/\.mdx$/, ''),
    reason,
    product,
    platform: options.platform,
    version: options.version,
    audience: options.support
      ? ['developer', 'customer-support']
      : ['developer'],
    queryIds: [queryId],
  };
}

export const cnKbManifest: readonly CnKbManifestEntry[] = [
  page(
    'overview',
    'content/docs/zh-CN/ai/overview/product-overview.mdx',
    '对话式 AI 产品说明和表格。',
    'conversational-ai',
    'ai-product-overview',
    { support: true },
  ),
  page(
    'overview',
    'content/docs/zh-CN/ai/overview/concepts.mdx',
    'AI 术语和概念解释。',
    'conversational-ai',
    'ai-concepts',
    { support: true },
  ),
  page(
    'overview',
    'content/docs/zh-CN/ai/device-kit/overview/product-overview.mdx',
    'Device Kit 场景介绍。',
    'device-kit',
    'device-kit-overview',
    { support: true },
  ),
  page(
    'overview',
    'content/docs/zh-CN/ai/aigc/overview/product-overview.mdx',
    'AIGC 场景介绍。',
    'aigc',
    'aigc-overview',
    { support: true },
  ),
  page(
    'overview',
    'content/docs/zh-CN/realtime-media/whiteboard/concepts.mdx',
    '白板基础概念。',
    'whiteboard',
    'whiteboard-concepts',
    { support: true },
  ),

  page(
    'tutorial',
    'content/docs/zh-CN/introduction/quickstart.mdx',
    '控制台入门、账号与项目步骤。',
    'console',
    'quickstart-task',
    { support: true },
  ),
  page(
    'tutorial',
    'content/docs/zh-CN/ai/get-started/quick-start.mdx',
    '对话式 AI REST 调用步骤与代码。',
    'conversational-ai',
    'ai-rest-quick-start',
  ),
  page(
    'tutorial',
    'content/docs/zh-CN/ai/get-started/quick-start-java.mdx',
    'Java SDK 教程的代码块与参数。',
    'conversational-ai',
    'ai-java-quick-start',
    { platform: ['java'] },
  ),
  page(
    'tutorial',
    'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx',
    'RTC 跨平台快速开始与复杂步骤。',
    'rtc',
    'rtc-quick-start',
  ),
  page(
    'tutorial',
    'content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx',
    '纯语音集成教程。',
    'rtc',
    'rtc-audio-quick-start',
  ),

  page(
    'api-reference',
    'content/docs/zh-CN/api-reference/conversational-ai/web/conversationalaiapi.mdx',
    'Web 方法与参数的显式锚点。',
    'conversational-ai',
    'manual-sos',
    { platform: ['web'] },
  ),
  page(
    'api-reference',
    'content/docs/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi.mdx',
    'Android 方法与同名跨平台 API。',
    'conversational-ai',
    'remove-handler',
    { platform: ['android'] },
  ),
  page(
    'api-reference',
    'content/docs/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi.mdx',
    'iOS 方法与 Objective-C 签名。',
    'conversational-ai',
    'ios-conversational-api',
    { platform: ['ios'] },
  ),
  page(
    'api-reference',
    'content/docs/zh-CN/api-reference/conversational-ai/web/struct.mdx',
    'API 结构体及属性章节。',
    'conversational-ai',
    'web-struct',
    { platform: ['web'] },
  ),
  page(
    'api-reference',
    'content/docs/zh-CN/api-reference/conversational-ai/restclient-java/convoaiclient.java.mdx',
    '服务端 Java API 类参考。',
    'conversational-ai',
    'java-client-api',
    { platform: ['java'] },
  ),

  page(
    'faq',
    'content/docs/zh-CN/reference/faq/product/call_api_in_browser.mdx',
    '无章节标题的完整问答。',
    'cloud-recording',
    'call-api-in-browser',
    { support: true },
  ),
  page(
    'faq',
    'content/docs/zh-CN/reference/faq/integration/token_related_issues.mdx',
    '鉴权错误和多段排查。',
    'rtc',
    'token-errors',
    { support: true },
  ),
  page(
    'faq',
    'content/docs/zh-CN/reference/faq/quality/video_blank.mdx',
    '视频黑屏故障排查。',
    'rtc',
    'video-blank',
    { support: true },
  ),
  page(
    'faq',
    'content/docs/zh-CN/reference/faq/quality/android_background.mdx',
    'Android 后台行为和平台限定。',
    'rtc',
    'android-background',
    { support: true, platform: ['android'] },
  ),
  page(
    'faq',
    'content/docs/zh-CN/reference/faq/product/recording_concurrence.mdx',
    '录制容量的客服常见问题。',
    'cloud-recording',
    'recording-concurrency',
    { support: true },
  ),

  page(
    'platform-version',
    'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start-expo.mdx',
    'Expo 特定平台的教程。',
    'rtc',
    'rtc-expo',
    { platform: ['expo'] },
  ),
  page(
    'platform-version',
    'content/docs/zh-CN/api-reference/rtc/web/overview.mdx',
    'RTC Web API 平台概览。',
    'rtc',
    'rtc-web-api-overview',
    { platform: ['web'] },
  ),
  page(
    'platform-version',
    'content/docs/zh-CN/api-reference/rtc/android/4.6.0/overview.mdx',
    '显式 4.6.0 版本和 Android 范围。',
    'rtc',
    'rtc-android-460',
    { platform: ['android'], version: '4.6.0' },
  ),
  page(
    'platform-version',
    'content/docs/zh-CN/api-reference/conversational-ai/ios/overview.mdx',
    '对话式 AI iOS 平台说明。',
    'conversational-ai',
    'conversational-ios-overview',
    { platform: ['ios'] },
  ),
  page(
    'platform-version',
    'content/docs/zh-CN/api-reference/conversational-ai/android/overview.mdx',
    '对话式 AI Android 平台说明。',
    'conversational-ai',
    'conversational-android-overview',
    { platform: ['android'] },
  ),
];
