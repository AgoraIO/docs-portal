import { zhCnFaqItems } from '../../components/faq/faq-data.zh-cn';

// FAQ 的中文展示标签转换为当前站点筛选 ID；“全部”是 UI 默认选项，不是通配标签。
const products: Record<string, string> = {
  实时互动: 'rtc',
  实时消息: 'rtm',
  灵动课堂: 'flexible-classroom',
  本地服务端录制: 'local-server-recording',
  互动白板: 'whiteboard',
  Fastboard: 'whiteboard',
  旁路推流: 'media-push',
  声动语聊: 'chatroom',
  水晶球: 'analytics',
  '融合 CDN': 'fusion-cdn',
  云端录制: 'cloud-recording',
  云端转码: 'cloud-transcoding',
  '对话式 AI 引擎': 'conversational-ai',
  声网会议: 'meeting',
};
const platforms: Record<string, string> = {
  Android: 'android',
  iOS: 'ios',
  macOS: 'macos',
  JavaScript: 'web',
  Windows: 'windows',
  HarmonyOS: 'harmonyos',
  小程序: 'mini-program',
  Electron: 'electron',
  Unity: 'unity',
  Flutter: 'flutter',
  'React Native': 'react-native',
  '服务端 Java': 'java',
  '服务端 C++': 'cpp',
  'Unreal (C++)': 'unreal',
  'Unreal (Blueprint)': 'blueprint',
  RESTful: 'restful',
};
const byUrl = new Map(zhCnFaqItems.map((item) => [item.href, item]));

function normalize(
  labels: string[],
  mapping: Record<string, string>,
  all: string,
) {
  return [
    ...new Set(
      labels
        .filter((label) => label !== all)
        .map((label) => {
          const value = mapping[label];
          if (!value)
            throw new Error(`Unmapped CN FAQ metadata label: ${label}`);
          return value;
        }),
    ),
  ];
}

export function getCnFaqMetadata(url: string) {
  const item = byUrl.get(url);
  if (!item) return undefined;
  return {
    products: normalize(item.products, products, '全部产品'),
    platform: normalize(item.platforms, platforms, '全部平台'),
  };
}
