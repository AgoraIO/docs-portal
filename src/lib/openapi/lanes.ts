import type { AppLocale } from '../i18n/i18n-config';
import { SUPPORTED_LOCALES } from '../i18n/i18n-config';

export type OpenApiLaneOperation = {
  routeLeaf: string;
  title: Record<AppLocale, string>;
};

export type OpenApiLane = {
  id: string;
  locales?: readonly AppLocale[];
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
      'zh-CN': '/openapi/conversational-ai/rest-api.zh-CN.yaml',
    },
    routePrefix: 'api-reference/api-ref/conversational-ai',
    sourcePath: {
      en: 'content/openapi/conversational-ai/rest-api.en.yaml',
      'zh-CN': 'content/openapi/conversational-ai/rest-api.zh-CN.yaml',
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
    id: 'rtc-rest',
    locales: ['en'],
    parentUrl: {
      en: '/en/api-reference/api-ref/rtc',
      'zh-CN': '/zh-CN/api-reference/api-ref/rtc',
    },
    publicSourceUrl: {
      en: '/openapi/rtc/channel-management.en.yaml',
      'zh-CN': '/openapi/rtc/channel-management.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/rtc',
    sourcePath: {
      en: 'content/openapi/rtc/channel-management.en.yaml',
      'zh-CN': 'content/openapi/rtc/channel-management.en.yaml',
    },
    tab: 'api-reference',
    operations: {
      'cma-query-channel-list': {
        routeLeaf: 'query-channel-list',
        title: {
          en: 'Query the channel list',
          'zh-CN': 'Query the channel list',
        },
      },
      'cma-query-user-list': {
        routeLeaf: 'query-user-list',
        title: {
          en: 'Query the user list',
          'zh-CN': 'Query the user list',
        },
      },
      'cma-query-host-list': {
        routeLeaf: 'query-host-list',
        title: {
          en: 'Query the host list',
          'zh-CN': 'Query the host list',
        },
      },
      'cma-query-user-status': {
        routeLeaf: 'query-user-status',
        title: {
          en: 'Query the user status',
          'zh-CN': 'Query the user status',
        },
      },
      'cma-create-ban-rule': {
        routeLeaf: 'create-ban-rule',
        title: {
          en: 'Create a banning rule',
          'zh-CN': 'Create a banning rule',
        },
      },
      'cma-delete-ban-rule': {
        routeLeaf: 'delete-ban-rule',
        title: {
          en: 'Delete a banning rule',
          'zh-CN': 'Delete a banning rule',
        },
      },
      'cma-get-ban-rule-list': {
        routeLeaf: 'get-ban-rule-list',
        title: {
          en: 'Get the banning rule list',
          'zh-CN': 'Get the banning rule list',
        },
      },
      'cma-update-ban-expiration': {
        routeLeaf: 'update-ban-expiration',
        title: {
          en: 'Update the banning rule expiration',
          'zh-CN': 'Update the banning rule expiration',
        },
      },
      'cma-query-ip-address': {
        routeLeaf: 'query-ip-address',
        title: {
          en: 'Query the IP address',
          'zh-CN': 'Query the IP address',
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
      'zh-CN': '/openapi/cloud-recording/cloud-recording.zh-CN.yaml',
    },
    routePrefix: 'api-reference/api-ref/cloud-recording',
    sourcePath: {
      en: 'content/openapi/cloud-recording/cloud-recording.en.yaml',
      'zh-CN': 'content/openapi/cloud-recording/cloud-recording.zh-CN.yaml',
    },
    tab: 'api-reference',
    operations: {
      'acquire-cloud-recording-resource': {
        routeLeaf: 'acquire',
        title: {
          en: 'Acquire a resource ID',
          'zh-CN': '获取云端录制资源',
        },
      },
      'start-cloud-recording': {
        routeLeaf: 'start',
        title: {
          en: 'Start a cloud recording task',
          'zh-CN': '开始云端录制',
        },
      },
      'update-cloud-recording': {
        routeLeaf: 'update',
        title: {
          en: 'Update task settings',
          'zh-CN': '更新云端录制设置',
        },
      },
      'update-cloud-recording-layout': {
        routeLeaf: 'update-layout',
        title: {
          en: 'Update layout',
          'zh-CN': '更新云端录制合流布局',
        },
      },
      'query-cloud-recording': {
        routeLeaf: 'query',
        title: {
          en: 'Query status',
          'zh-CN': '查询云端录制状态',
        },
      },
      'stop-cloud-recording': {
        routeLeaf: 'stop',
        title: {
          en: 'Stop a cloud recording task',
          'zh-CN': '停止云端录制',
        },
      },
      'get-ncs-ip': {
        routeLeaf: 'get-ncs-ip',
        title: {
          en: 'Query message notification server IP addresses',
          'zh-CN': '查询消息通知服务器 IP',
        },
      },
    },
  },
  {
    id: 'cloud-transcoding-rest',
    parentUrl: {
      en: '/en/api-reference/api-ref/cloud-transcoding',
      'zh-CN': '/zh-CN/api-reference/api-ref/cloud-transcoding',
    },
    publicSourceUrl: {
      en: '/openapi/cloud-transcoding/cloud-transcoding.en.yaml',
      'zh-CN': '/openapi/cloud-transcoding/cloud-transcoding.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/cloud-transcoding',
    sourcePath: {
      en: 'content/openapi/cloud-transcoding/cloud-transcoding.en.yaml',
      'zh-CN': 'content/openapi/cloud-transcoding/cloud-transcoding.en.yaml',
    },
    tab: 'api-reference',
    operations: {
      'acquire-cloud-transcoding-builder-token': {
        routeLeaf: 'acquire',
        title: {
          en: 'Acquire a builder token',
          'zh-CN': 'Acquire a builder token',
        },
      },
      'create-cloud-transcoding-task': {
        routeLeaf: 'create',
        title: {
          en: 'Create a cloud transcoding task',
          'zh-CN': 'Create a cloud transcoding task',
        },
      },
      'query-cloud-transcoding-task': {
        routeLeaf: 'query',
        title: {
          en: 'Query the status of a task',
          'zh-CN': 'Query the status of a task',
        },
      },
      'update-cloud-transcoding-task': {
        routeLeaf: 'update',
        title: {
          en: 'Update a cloud transcoding task',
          'zh-CN': 'Update a cloud transcoding task',
        },
      },
      'destroy-cloud-transcoding-task': {
        routeLeaf: 'destroy',
        title: {
          en: 'Destroy a cloud transcoding task',
          'zh-CN': 'Destroy a cloud transcoding task',
        },
      },
      'create-or-update-transcoding-template': {
        routeLeaf: 'template-create',
        title: {
          en: 'Create or update a transcoding template',
          'zh-CN': 'Create or update a transcoding template',
        },
      },
      'query-transcoding-templates': {
        routeLeaf: 'template-query',
        title: {
          en: 'Query transcoding templates',
          'zh-CN': 'Query transcoding templates',
        },
      },
      'query-cloud-transcoding-ncs-ip': {
        routeLeaf: 'ncs-query-ip',
        title: {
          en: 'Query message notification server IP',
          'zh-CN': 'Query message notification server IP',
        },
      },
    },
  },
  {
    id: 'media-gateway-rest',
    locales: ['en'],
    parentUrl: {
      en: '/en/api-reference/api-ref/rtmp-gateway',
      'zh-CN': '/zh-CN/api-reference/api-ref/rtmp-gateway',
    },
    publicSourceUrl: {
      en: '/openapi/media-gateway/media-gateway.en.yaml',
      'zh-CN': '/openapi/media-gateway/media-gateway.en.yaml',
    },
    routePrefix: 'api-reference/api-ref/rtmp-gateway',
    sourcePath: {
      en: 'content/openapi/media-gateway/media-gateway.en.yaml',
      'zh-CN': 'content/openapi/media-gateway/media-gateway.en.yaml',
    },
    tab: 'api-reference',
    operations: {
      'create-media-gateway-streaming-key': {
        routeLeaf: 'create-streaming-key',
        title: {
          en: 'Create streaming key',
          'zh-CN': 'Create streaming key',
        },
      },
      'query-media-gateway-streaming-key': {
        routeLeaf: 'query-streaming-key',
        title: {
          en: 'Query streaming key',
          'zh-CN': 'Query streaming key',
        },
      },
      'delete-media-gateway-streaming-key': {
        routeLeaf: 'delete-streaming-key',
        title: {
          en: 'Delete streaming key',
          'zh-CN': 'Delete streaming key',
        },
      },
      'query-media-gateway-streaming-list': {
        routeLeaf: 'query-streaming-list',
        title: {
          en: 'Query streaming list',
          'zh-CN': 'Query streaming list',
        },
      },
      'query-media-gateway-streaming-information': {
        routeLeaf: 'query-streaming-information',
        title: {
          en: 'Query streaming information',
          'zh-CN': 'Query streaming information',
        },
      },
      'force-disconnect-media-gateway-stream': {
        routeLeaf: 'force-disconnection',
        title: {
          en: 'Force disconnect',
          'zh-CN': 'Force disconnect',
        },
      },
      'mute-media-gateway-stream': {
        routeLeaf: 'mute-streaming',
        title: {
          en: 'Mute or unmute streaming',
          'zh-CN': 'Mute or unmute streaming',
        },
      },
      'create-or-reset-media-gateway-template': {
        routeLeaf: 'create-reset-template',
        title: {
          en: 'Create or reset template',
          'zh-CN': 'Create or reset template',
        },
      },
      'update-media-gateway-template': {
        routeLeaf: 'update-template',
        title: {
          en: 'Update template',
          'zh-CN': 'Update template',
        },
      },
      'delete-media-gateway-template': {
        routeLeaf: 'delete-template',
        title: {
          en: 'Delete template',
          'zh-CN': 'Delete template',
        },
      },
      'set-media-gateway-global-template': {
        routeLeaf: 'set-global-template',
        title: {
          en: 'Set global template',
          'zh-CN': 'Set global template',
        },
      },
      'query-media-gateway-ncs-ip': {
        routeLeaf: 'query-ip-address',
        title: {
          en: 'Query notification service IP address',
          'zh-CN': 'Query notification service IP address',
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

export function getOpenApiLaneLocales(lane: OpenApiLane) {
  return lane.locales ?? SUPPORTED_LOCALES;
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
    getOpenApiLaneLocales(lane).flatMap((locale) =>
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
    if (lane.tab !== tab || !getOpenApiLaneLocales(lane).includes(locale)) {
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

export function resolveOpenApiLaneRoute(
  locale: AppLocale,
  tab: string,
  slugSegments: string[],
) {
  for (const lane of getOpenApiLanes()) {
    if (lane.tab !== tab || !getOpenApiLaneLocales(lane).includes(locale)) {
      continue;
    }

    const prefixSegments = lane.routePrefix.split('/').filter(Boolean).slice(1);

    if (
      slugSegments.length < prefixSegments.length ||
      !prefixSegments.every((segment, index) => slugSegments[index] === segment)
    ) {
      continue;
    }

    return lane;
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
