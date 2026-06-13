import type { AppLocale } from '../i18n/i18n-config';
import { SUPPORTED_LOCALES } from '../i18n/i18n-config';

export type OpenApiLaneOperation = {
  routeLeaf: string;
  title: Record<AppLocale, string>;
};

export type OpenApiLane = {
  id: string;
  parentUrl: Record<AppLocale, string>;
  publicSourceUrl: Record<AppLocale, string>;
  routePrefix: string;
  sourcePath: Record<AppLocale, string>;
  tab: string;
  operations: Record<string, OpenApiLaneOperation>;
};

export const OPENAPI_LANES = [
  {
    id: 'convoai',
    parentUrl: {
      en: '/en/api-reference/conversational-ai/rest-api/agent',
      'zh-CN': '/zh-CN/api-reference/conversational-ai/rest-api/agent',
    },
    publicSourceUrl: {
      en: '/openapi/conversational-ai/convoai.en.yaml',
      'zh-CN': '/openapi/conversational-ai/convoai.zh-CN.yaml',
    },
    routePrefix: 'api-reference/conversational-ai/rest-api/agent',
    sourcePath: {
      en: 'content/openapi/conversational-ai/convoai.en.yaml',
      'zh-CN': 'content/openapi/conversational-ai/convoai.zh-CN.yaml',
    },
    tab: 'api-reference',
    operations: {
      'start-agent': {
        routeLeaf: 'join',
        title: {
          en: 'Start a conversational AI agent',
          'zh-CN': '创建对话式智能体',
        },
      },
      'stop-agent': {
        routeLeaf: 'leave',
        title: {
          en: 'Stop a conversational AI agent',
          'zh-CN': '停止对话式智能体',
        },
      },
      'agent-update': {
        routeLeaf: 'update',
        title: {
          en: 'Update agent configuration',
          'zh-CN': '更新智能体配置',
        },
      },
      'query-agent-status': {
        routeLeaf: 'query',
        title: {
          en: 'Query agent status',
          'zh-CN': '查询智能体状态',
        },
      },
      'get-agent-list': {
        routeLeaf: 'list',
        title: {
          en: 'Retrieve a list of agents',
          'zh-CN': '获取智能体列表',
        },
      },
      'agent-speak': {
        routeLeaf: 'speak',
        title: {
          en: 'Broadcast a message using TTS',
          'zh-CN': '播报自定义消息',
        },
      },
      'agent-interrupt': {
        routeLeaf: 'interrupt',
        title: {
          en: 'Interrupt the agent',
          'zh-CN': '打断智能体',
        },
      },
      'agent-think': {
        routeLeaf: 'think',
        title: {
          en: 'Send a custom instruction',
          'zh-CN': '发送自定义指令',
        },
      },
      'get-history': {
        routeLeaf: 'history',
        title: {
          en: 'Retrieve agent history',
          'zh-CN': '获取智能体短期记忆',
        },
      },
      'get-turns': {
        routeLeaf: 'turns',
        title: {
          en: 'Query conversation turn information',
          'zh-CN': '查询对话轮次信息',
        },
      },
    },
  },
] as const satisfies OpenApiLane[];

export type OpenApiLaneId = (typeof OPENAPI_LANES)[number]['id'];

export function getOpenApiLanes(): readonly OpenApiLane[] {
  return OPENAPI_LANES;
}

export function getOpenApiOperationIds(lane: OpenApiLane) {
  return Object.keys(lane.operations);
}

export function getOpenApiEndpointUrl(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string,
) {
  const operation = lane.operations[operationId];
  if (!operation) {
    throw new Error(
      `Unknown OpenAPI operation "${operationId}" for lane "${lane.id}"`,
    );
  }

  return `/${locale}/${lane.routePrefix}/${operation.routeLeaf}`;
}

export function getOpenApiPrerenderPaths() {
  return getOpenApiLanes().flatMap((lane) =>
    SUPPORTED_LOCALES.flatMap((locale) =>
      getOpenApiOperationIds(lane).map((operationId) =>
        getOpenApiEndpointUrl(lane, locale, operationId),
      ),
    ),
  );
}

export function resolveOpenApiEndpointRoute(
  locale: AppLocale,
  tab: string,
  slugSegments: string[],
) {
  for (const lane of getOpenApiLanes()) {
    if (lane.tab !== tab) {
      continue;
    }

    const prefixSegments = lane.routePrefix.split('/').filter(Boolean).slice(1);

    if (slugSegments.length !== prefixSegments.length + 1) {
      continue;
    }

    if (
      !prefixSegments.every((segment, index) => slugSegments[index] === segment)
    ) {
      continue;
    }

    const routeLeaf = slugSegments[prefixSegments.length];
    const operationId = Object.entries(lane.operations).find(
      ([, operation]) => operation.routeLeaf === routeLeaf,
    )?.[0];

    if (!operationId) {
      continue;
    }

    return {
      lane,
      operationId,
      routeLeaf,
      url: getOpenApiEndpointUrl(lane, locale, operationId),
    };
  }

  return null;
}

export function findOpenApiLaneBySourcePath(sourcePath: string) {
  return getOpenApiLanes().find((lane) =>
    Object.values(lane.sourcePath).includes(sourcePath),
  );
}
