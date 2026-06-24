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
      en: '/en/api-reference/api-ref/conversational-ai',
      'zh-CN': '/zh-CN/api-reference/api-ref/conversational-ai',
    },
    publicSourceUrl: {
      en: '/openapi/conversational-ai/rest-api.en.yaml',
      'zh-CN': '/openapi/conversational-ai/rest-api.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/conversational-ai',
    sourcePath: {
      en: 'content/openapi/conversational-ai/rest-api.en.yaml',
      'zh-CN': 'content/openapi/conversational-ai/rest-api.en.yaml',
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
  {
    id: 'signaling-rest',
    parentUrl: {
      en: '/en/api-reference/api-ref/signaling',
      'zh-CN': '/zh-CN/api-reference/api-ref/signaling',
    },
    publicSourceUrl: {
      en: '/openapi/rtm/signaling-rest.en.yaml',
      'zh-CN': '/openapi/rtm/signaling-rest.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/signaling',
    sourcePath: {
      en: 'content/openapi/rtm/signaling-rest.en.yaml',
      'zh-CN': 'content/openapi/rtm/signaling-rest.en.yaml',
    },
    tab: 'api-reference',
    operations: {
      'send-peer-message': {
        routeLeaf: 'peer-to-peer-message',
        title: {
          en: 'Send peer-to-peer message',
          'zh-CN': 'Send peer-to-peer message',
        },
      },
      'send-channel-message': {
        routeLeaf: 'channel-message',
        title: {
          en: 'Send channel message',
          'zh-CN': 'Send channel message',
        },
      },
      'get-message-history': {
        routeLeaf: 'message-history',
        title: {
          en: 'Get message history',
          'zh-CN': 'Get message history',
        },
      },
      'get-user-events': {
        routeLeaf: 'user-events',
        title: {
          en: 'Get user events',
          'zh-CN': 'Get user events',
        },
      },
      'get-channel-events': {
        routeLeaf: 'channel-events',
        title: {
          en: 'Get channel events',
          'zh-CN': 'Get channel events',
        },
      },
    },
  },
  {
    id: 'cloud-recording-rest',
    parentUrl: {
      en: '/en/api-reference/api-ref/cloud-recording',
      'zh-CN': '/zh-CN/api-reference/api-ref/cloud-recording',
    },
    publicSourceUrl: {
      en: '/openapi/cloud-recording/cloud-recording.en.yaml',
      'zh-CN': '/openapi/cloud-recording/cloud-recording.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/cloud-recording',
    sourcePath: {
      en: 'content/openapi/cloud-recording/cloud-recording.en.yaml',
      'zh-CN': 'content/openapi/cloud-recording/cloud-recording.en.yaml',
    },
    tab: 'api-reference',
    operations: {
      'acquire-cloud-recording-resource': {
        routeLeaf: 'acquire',
        title: {
          en: 'Acquire a cloud recording resource',
          'zh-CN': 'Acquire a cloud recording resource',
        },
      },
      'start-cloud-recording': {
        routeLeaf: 'start',
        title: {
          en: 'Start cloud recording',
          'zh-CN': 'Start cloud recording',
        },
      },
      'update-cloud-recording': {
        routeLeaf: 'update',
        title: {
          en: 'Update cloud recording settings',
          'zh-CN': 'Update cloud recording settings',
        },
      },
      'update-cloud-recording-layout': {
        routeLeaf: 'update-layout',
        title: {
          en: 'Update the cloud recording layout',
          'zh-CN': 'Update the cloud recording layout',
        },
      },
      'query-cloud-recording': {
        routeLeaf: 'query',
        title: {
          en: 'Query cloud recording status',
          'zh-CN': 'Query cloud recording status',
        },
      },
      'stop-cloud-recording': {
        routeLeaf: 'stop',
        title: {
          en: 'Stop cloud recording',
          'zh-CN': 'Stop cloud recording',
        },
      },
      'get-ncs-ip': {
        routeLeaf: 'get-ncs-ip',
        title: {
          en: 'Query message notification server IP addresses',
          'zh-CN': 'Query message notification server IP addresses',
        },
      },
    },
  },
  {
    id: 'speech-to-text-rest',
    parentUrl: {
      en: '/en/api-reference/api-ref/speech-to-text',
      'zh-CN': '/zh-CN/api-reference/api-ref/speech-to-text',
    },
    publicSourceUrl: {
      en: '/openapi/speech-to-text/v7.en.yaml',
      'zh-CN': '/openapi/speech-to-text/v7.zh-CN.yaml',
    },
    routePrefix: 'api-reference/api-ref/speech-to-text',
    sourcePath: {
      en: 'content/openapi/speech-to-text/v7.en.yaml',
      'zh-CN': 'content/openapi/speech-to-text/v7.zh-CN.yaml',
    },
    tab: 'api-reference',
    operations: {
      join: {
        routeLeaf: 'join',
        title: {
          en: 'Start a Real-time STT agent',
          'zh-CN': '加入频道开始实时转录翻译',
        },
      },
      query: {
        routeLeaf: 'query',
        title: {
          en: 'Query the task status',
          'zh-CN': '获取实时转录翻译任务的状态',
        },
      },
      leave: {
        routeLeaf: 'leave',
        title: {
          en: 'Stop a Real-time STT agent',
          'zh-CN': '停止实时转录翻译',
        },
      },
      update: {
        routeLeaf: 'update',
        title: {
          en: 'Update task configuration',
          'zh-CN': '更新实时转录翻译任务',
        },
      },
      list: {
        routeLeaf: 'list',
        title: {
          en: 'List Real-time STT agents',
          'zh-CN': '获取任务列表',
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

export function isOpenApiTab(tab: string) {
  return getOpenApiLanes().some((lane) => lane.tab === tab);
}
