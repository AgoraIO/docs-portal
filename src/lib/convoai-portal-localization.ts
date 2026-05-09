import type { PortalTab } from './convoai-portal.server';
import type { AppLocale } from './i18n/i18n-config';

const EN_TEXT_MAP: Record<string, string> = {
  'API': 'API',
  'Agent': 'Agent',
  'Agent接入': 'Agent Integrations',
  'Go服务端快速开始': 'Go Server Quickstart',
  'Java服务端快速开始': 'Java Server Quickstart',
  'Java 服务端快速开始': 'Java Server Quickstart',
  'MCP集成': 'MCP Integrations',
  'Recepies': 'Recipes',
  'RESTful': 'RESTful',
  'SDKs': 'SDKs',
  'Skill&MCP': 'Skill & MCP',
  'Skills集成': 'Skills Integrations',
  'Webhook': 'Webhook',
  '产品与概念': 'Product & Concepts',
  '产品概览': 'Product Overview',
  '体验设计': 'Experience Design',
  '关键概念': 'Key Concepts',
  '发行说明': 'Release Notes',
  '历史与观测': 'History & Observability',
  '参考': 'Reference',
  '反馈与参考': 'Reference',
  '响应码': 'Response Codes',
  '声网对话式 AI 引擎': 'Agora Conversational AI Engine',
  '开通服务': 'Enable Service',
  '快速接入': 'Quickstart',
  '开始使用': 'Get Started',
  '技能与MCP集成': 'Skills & MCP',
  '文档': 'Docs',
  '文档指引': 'Docs Guide',
  '最佳实践': 'Best Practices',
  '智能体能力': 'Agent Capabilities',
  '智能体控制': 'Agent Control',
  '服务端 API': 'Server API',
  '服务端 API 导航': 'Server API Navigation',
  '模型与上下文': 'Models & Context',
  '概览': 'Overview',
  '生命周期': 'Lifecycle',
  '用户指南': 'User Guides',
  '目录': 'Contents',
  '资源与参考': 'Resources',
  '资源获取': 'Resources',
  '计费说明': 'Billing',
  '语音与交互': 'Voice & Interaction',
  '对话控制': 'Conversation Controls',
  '通过 Go 服务端快速开始': 'Go Server Quickstart',
  '使用 RESTful API 实现对话式 AI 引擎':
    'Build a Voice Agent with RESTful API',
};

const EN_DESCRIPTION_MAP: Record<string, string> = {
  'landing-page':
    'Agora Conversational AI Engine redefines human-computer interaction with realtime voice conversations for assistants, companions, tutors, support agents, devices, and immersive NPC experiences.',
  'get-started/enable-service':
    'Turn on the service in Console, collect credentials, and prepare the realtime channel dependencies before you call the agent APIs.',
  'get-started/quick-start':
    'Create a conversational agent over RESTful APIs and connect it to an RTC channel for realtime voice interaction.',
};

export function localizePortalData(
  portalData: PortalTab[],
  locale: AppLocale,
): PortalTab[] {
  if (locale === 'zh-CN') {
    return portalData;
  }

  return portalData.map((tab) => ({
    ...tab,
    label: localizePortalText(locale, tab.label),
    docs: tab.docs.map((doc) => ({
      ...doc,
      description:
        EN_DESCRIPTION_MAP[doc.pageKey] ?? doc.description,
      title: localizePortalText(locale, doc.title),
    })),
  }));
}

export function localizePortalText(locale: AppLocale, text: string) {
  if (locale === 'zh-CN') {
    return text;
  }

  return EN_TEXT_MAP[normalizeLookup(text)] ?? text;
}

function normalizeLookup(value: string) {
  return value.replace(/\s+/g, '');
}
