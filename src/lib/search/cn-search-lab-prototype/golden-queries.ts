export type GoldenQuery = {
  expectedAnchors: string[];
  expectedBaseUrls: string[];
  query: string;
  target: 'page' | 'section';
  type: 'exact-api' | 'product-term' | 'typo' | 'chinese-api-intent';
};

const webApi = '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi';
const androidApi =
  '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi';
const iosApi = '/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi';

export const GOLDEN_QUERIES: GoldenQuery[] = [
  sectionQuery('manualSOS', 'manualsos', [webApi, androidApi, iosApi]),
  sectionQuery('manualEOS', 'manualeos', [webApi, androidApi, iosApi]),
  sectionQuery('removeHandler', 'removehandler', [androidApi, iosApi]),
  sectionQuery('subscribeMessage', 'subscribemessage', [webApi, androidApi]),
  sectionQuery('loadAudioSettings', 'loadaudiosettings', [androidApi]),
  pageQuery('云端录制', ['/zh-CN/realtime-media/cloud-recording']),
  pageQuery('对话式 AI API', ['/zh-CN/api-reference/conversational-ai']),
  pageQuery('加入和离开频道', [
    '/zh-CN/realtime-media/rtc/build/initialize-and-channel/join-leave-channel',
  ]),
  sectionQuery('manualSO', 'manualsos', [webApi, androidApi, iosApi], 'typo'),
  sectionQuery('removeHandlr', 'removehandler', [androidApi, iosApi], 'typo'),
  sectionQuery(
    '手动开始说话',
    'manualsos',
    [webApi, androidApi, iosApi],
    'chinese-api-intent',
  ),
  sectionQuery(
    '手动结束说话',
    'manualeos',
    [webApi, androidApi, iosApi],
    'chinese-api-intent',
  ),
  sectionQuery(
    '移除事件处理器',
    'removehandler',
    [androidApi, iosApi],
    'chinese-api-intent',
  ),
  sectionQuery(
    '订阅消息',
    'subscribemessage',
    [webApi, androidApi],
    'chinese-api-intent',
  ),
  sectionQuery(
    '加载音频设置',
    'loadaudiosettings',
    [androidApi],
    'chinese-api-intent',
  ),
];

function sectionQuery(
  query: string,
  anchor: string,
  expectedBaseUrls: string[],
  type: GoldenQuery['type'] = 'exact-api',
): GoldenQuery {
  return {
    expectedAnchors: [anchor],
    expectedBaseUrls,
    query,
    target: 'section',
    type,
  };
}

function pageQuery(query: string, expectedBaseUrls: string[]): GoldenQuery {
  return {
    expectedAnchors: [],
    expectedBaseUrls,
    query,
    target: 'page',
    type: 'product-term',
  };
}
