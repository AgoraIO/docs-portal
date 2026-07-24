export const SDK_DOWNLOAD_PRODUCT_GROUP_ORDER = [
  'agents',
  'voice',
  'video',
  'signaling',
  'chat',
  'iot',
  'whiteboard',
  'fastboard',
  'mediaplayer-kit',
  'server-gateway',
  'on-premise-recording',
  'meeting',
  'flexible-classroom',
  'cloud-scene',
  'proctor',
] as const;

export const ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY = {
  agents: {
    label: '对话式 AI 引擎 SDK',
    info: '用于在服务端构建和运行语音智能体的 SDK',
  },
  voice: {
    label: '语音 SDK',
    info: '适用于语音通话、纯音频互动直播和纯音频极速直播的实时互动 SDK',
  },
  video: {
    label: '视频 SDK',
    info: '适用于音视频通话、互动直播和极速直播的实时互动 SDK',
  },
  signaling: {
    label: '实时消息 SDK',
    info: '提供低延时消息、信令、状态同步和频道管理能力的 SDK',
  },
  chat: {
    label: '即时通讯 SDK',
    info: '适用于即时通讯场景的 SDK',
  },
  iot: {
    label: '物联网 aPaaS SDK',
    info: '适用于嵌入式设备实时音视频互动的 SDK',
  },
  whiteboard: {
    label: '互动白板 SDK',
    info: '提供可高度定制且不含默认 UI 的互动白板核心能力',
  },
  fastboard: {
    label: 'Fastboard SDK',
    info: '提供默认 UI，支持快速集成互动白板功能的 SDK',
  },
  'mediaplayer-kit': {
    label: '媒体播放器组件',
    info: '用于在客户端播放本地或在线媒体资源的组件',
  },
  'server-gateway': {
    label: 'RTC 服务端 SDK',
    info: '部署在服务端，用于向 RTC 频道发送音视频流或从频道接收音视频流',
  },
  'on-premise-recording': {
    label: '本地服务端录制 SDK',
    info: '部署在本地服务端，用于录制 RTC 频道中的音视频流',
  },
  meeting: {
    label: '智能云会议引擎 SDK',
    info: '用于构建多人音视频会议、会控、协作办公和 AI 会议体验的 SDK',
  },
  'flexible-classroom': {
    label: '灵动课堂 SDK',
    info: '适用于教育场景和课堂 UI 定制的 SDK',
  },
  'cloud-scene': {
    label: '云课堂 SDK',
    info: '提供默认课堂 UI 的场景化 SDK',
  },
  proctor: {
    label: '灵动监考 SDK',
    info: '适用于在线监考场景的 SDK',
  },
} as const satisfies Record<
  (typeof SDK_DOWNLOAD_PRODUCT_GROUP_ORDER)[number],
  { info: string; label: string }
>;

export function getZhCNSdkDownloadProductCopy(productId: string) {
  return ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY[
    productId as keyof typeof ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY
  ];
}
