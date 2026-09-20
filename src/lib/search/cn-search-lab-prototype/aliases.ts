import type { SearchDocument } from './model.ts';

type AliasRule = {
  aliases: string[];
  anchor: string;
  baseUrls: string[];
};

const conversationalAiWeb =
  '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi';
const conversationalAiAndroid =
  '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi';
const conversationalAiIos =
  '/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi';

export const CN_API_ALIAS_RULES: AliasRule[] = [
  {
    aliases: ['手动开始说话'],
    anchor: 'manualsos',
    baseUrls: [
      conversationalAiWeb,
      conversationalAiAndroid,
      conversationalAiIos,
    ],
  },
  {
    aliases: ['手动结束说话'],
    anchor: 'manualeos',
    baseUrls: [
      conversationalAiWeb,
      conversationalAiAndroid,
      conversationalAiIos,
    ],
  },
  {
    aliases: ['移除事件处理器'],
    anchor: 'removehandler',
    baseUrls: [conversationalAiAndroid, conversationalAiIos],
  },
  {
    aliases: ['订阅消息'],
    anchor: 'subscribemessage',
    baseUrls: [conversationalAiWeb, conversationalAiAndroid],
  },
  {
    aliases: ['加载音频设置'],
    anchor: 'loadaudiosettings',
    baseUrls: [conversationalAiAndroid],
  },
];

export function addChineseApiAliases(documents: SearchDocument[]) {
  return documents.map((document) => {
    const [baseUrl, anchor = ''] = document.url.split('#');
    const aliases = CN_API_ALIAS_RULES.filter(
      (rule) =>
        (anchor.toLowerCase().startsWith(rule.anchor) ||
          document.sectionTitle.toLowerCase().startsWith(rule.anchor)) &&
        rule.baseUrls.includes(baseUrl),
    ).flatMap((rule) => rule.aliases);

    return aliases.length > 0
      ? { ...document, aliases: aliases.join(' ') }
      : document;
  });
}
