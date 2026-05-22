import type { AppLocale } from '@/lib/i18n/i18n-config';

export const CONVERSATIONAL_AI_OPENAPI_SOURCE_PATH =
  'content/openapi/conversational-ai/convoai.yaml';

export const CONVERSATIONAL_AI_PUBLIC_OPENAPI_URL =
  '/openapi/conversational-ai/convoai.yaml';

export const CONVERSATIONAL_AI_ROUTE_PREFIX =
  'api-reference/conversational-ai/rest-api/agent';

export const CONVERSATIONAL_AI_OPERATION_ROUTES = {
  'start-agent': 'join',
  'stop-agent': 'leave',
  'agent-update': 'update',
  'query-agent-status': 'query',
  'get-agent-list': 'list',
  'agent-speak': 'speak',
  'agent-interrupt': 'interrupt',
  'agent-think': 'think',
  'get-history': 'history',
  'get-turns': 'turns',
} as const;

export const CONVERSATIONAL_AI_OPERATION_TITLES = {
  en: {
    'start-agent': 'Start a conversational AI agent',
    'stop-agent': 'Stop a conversational AI agent',
    'agent-update': 'Update agent configuration',
    'query-agent-status': 'Query agent status',
    'get-agent-list': 'Retrieve a list of agents',
    'agent-speak': 'Broadcast a message using TTS',
    'agent-interrupt': 'Interrupt the agent',
    'agent-think': 'Send a custom instruction',
    'get-history': 'Retrieve agent history',
    'get-turns': 'Query conversation turn information',
  },
  'zh-CN': {
    'start-agent': '创建对话式智能体',
    'stop-agent': '停止对话式智能体',
    'agent-update': '更新智能体配置',
    'query-agent-status': '查询智能体状态',
    'get-agent-list': '获取智能体列表',
    'agent-speak': '播报自定义消息',
    'agent-interrupt': '打断智能体',
    'agent-think': '发送自定义指令',
    'get-history': '获取智能体短期记忆',
    'get-turns': '查询对话轮次信息',
  },
} as const;

export type ConversationalAiOperationId =
  keyof typeof CONVERSATIONAL_AI_OPERATION_ROUTES;

export function getConversationalAiEndpointUrl(
  locale: AppLocale,
  operationId: ConversationalAiOperationId,
) {
  return `/${locale}/${CONVERSATIONAL_AI_ROUTE_PREFIX}/${
    CONVERSATIONAL_AI_OPERATION_ROUTES[operationId]
  }`;
}

export function getConversationalAiPrerenderPaths() {
  return (['en', 'zh-CN'] as const).flatMap((locale) =>
    getConversationalAiOperationIds().map((operationId) =>
      getConversationalAiEndpointUrl(locale, operationId),
    ),
  );
}

export function getConversationalAiOperationIds() {
  return Object.keys(
    CONVERSATIONAL_AI_OPERATION_ROUTES,
  ) as ConversationalAiOperationId[];
}

export function getConversationalAiOperationIdByRouteLeaf(routeLeaf: string) {
  return getConversationalAiOperationIds().find(
    (operationId) =>
      CONVERSATIONAL_AI_OPERATION_ROUTES[operationId] === routeLeaf,
  );
}
