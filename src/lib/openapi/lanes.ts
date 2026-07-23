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

type ZhCnOpenApiLaneInput = {
  id: string;
  parentUrl: string;
  publicSourceUrl: string;
  routePrefix: string;
  sourcePath: string;
  operations: readonly (readonly [
    operationId: string,
    routeLeaf: string,
    enTitle: string,
    zhCnTitle: string,
  ])[];
};

function zhCnOpenApiLane(input: ZhCnOpenApiLaneInput): OpenApiLane {
  return {
    id: input.id,
    locales: ['zh-CN'],
    parentUrl: {
      en: input.parentUrl.replace('/zh-CN/', '/en/'),
      'zh-CN': input.parentUrl,
    },
    publicSourceUrl: {
      en: input.publicSourceUrl,
      'zh-CN': input.publicSourceUrl,
    },
    routePrefix: input.routePrefix,
    sourcePath: {
      en: input.sourcePath,
      'zh-CN': input.sourcePath,
    },
    tab: 'api-reference',
    operations: Object.fromEntries(
      input.operations.map(([operationId, routeLeaf, enTitle, zhCnTitle]) => [
        operationId,
        {
          routeLeaf,
          title: {
            en: enTitle,
            'zh-CN': zhCnTitle,
          },
        },
      ]),
    ),
  };
}

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
    locales: ['en'],
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
    locales: ['en'],
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
  zhCnOpenApiLane({
    id: 'agora-analytics-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/agora-analytics',
    publicSourceUrl: '/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/agora-analytics',
    sourcePath: 'content/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml',
    operations: [
      [
        'get-beta-analytics-call-lists',
        'call-list',
        'Get call list',
        '获取频道通话列表',
      ],
      [
        'get-beta-analytics-call-sessions',
        'call-sessions',
        'Get call sessions',
        '获取用户通话详情',
      ],
      [
        'get-beta-analytics-call-metrics',
        'call-metrics',
        'Get call metrics',
        '获取通话质量指标',
      ],
      [
        'get-beta-analytics-call-statistics',
        'call-statistics',
        'Get call statistics',
        '获取通话统计数据',
      ],
      [
        'get-beta-analytics-call-freeze-bucket',
        'call-freeze-bucket',
        'Get call freeze bucket',
        '获取通话卡顿率分桶数据',
      ],
      [
        'get-beta-analytics-call-statistics-time',
        'call-statistics-time',
        'Get call time-series metrics',
        '获取频道时序指标',
      ],
      [
        'get-beta-insight-usage-by_time',
        'insight-usage-time',
        'Query usage time-series metrics',
        '查询时序用量指标',
      ],
      [
        'get-beta-insight-quality-by_time',
        'insight-quality-time',
        'Query quality time-series metrics',
        '查询时序质量指标',
      ],
      [
        'post-beta-insight-usage-aggregation',
        'insight-usage-aggregation',
        'Query aggregated usage metrics',
        '查询聚合用量指标',
      ],
      [
        'post-beta-insight-quality-aggregation',
        'insight-quality-aggregation',
        'Query aggregated quality metrics',
        '查询聚合质量指标',
      ],
      [
        'get-beta-realtime-usage-by_time_20sec',
        'realtime-usage',
        'Query real-time usage',
        '查询实时规模',
      ],
      [
        'get-beta-realtime-quality-by_time_20sec',
        'realtime-quality',
        'Query real-time quality',
        '查询实时质量',
      ],
      [
        'get-beta-realtime-usage-dimension-top20',
        'realtime-usage-top20',
        'Query real-time usage TOP 20 groups',
        '查询实时规模 TOP 20 分组',
      ],
      [
        'get-beta-realtime-quality-dimension-top20',
        'realtime-quality-top20',
        'Query real-time quality TOP 20 groups',
        '查询实时质量 TOP 20 分组',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'console-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/console',
    publicSourceUrl: '/openapi/console/rest-api.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/console',
    sourcePath: 'content/openapi/console/rest-api.zh-CN.yaml',
    operations: [
      ['post-dev-v1-project', 'create-project', 'Create a project', '创建项目'],
      [
        'get-dev-v1-project',
        'get-project',
        'Get a specified project',
        '获取指定项目信息',
      ],
      [
        'get-dev-v1-projects',
        'list-projects',
        'Get all projects',
        '获取所有项目信息',
      ],
      [
        'post-dev-v1-project_status',
        'update-project-status',
        'Disable or enable a project',
        '禁用或启用项目',
      ],
      [
        'post-dev-v1-signkey',
        'update-primary-app-certificate',
        'Enable or disable the primary App certificate',
        '启用或禁用主要 App 证书',
      ],
      [
        'post-dev-v1-reset_signkey',
        'reset-primary-app-certificate',
        'Reset the primary App certificate',
        '重置主要 App 证书',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'ppt-conversion-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/ppt-conversion-service',
    publicSourceUrl: '/openapi/ppt-conversion-service/rest-api.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/ppt-conversion-service',
    sourcePath: 'content/openapi/ppt-conversion-service/rest-api.zh-CN.yaml',
    operations: [
      [
        'post-v5-tokens-teams',
        'generate-sdk-token',
        'Generate an SDK token',
        '生成 SDK Token',
      ],
      [
        'post-v5-tokens-tasks-uuid',
        'generate-task-token',
        'Generate a task token',
        '生成 Task Token',
      ],
      [
        'post-v5-projector-tasks',
        'start-conversion',
        'Start a PPT conversion task',
        '发起 PPT 转码',
      ],
      [
        'get-v5-projector-tasks',
        'list-pending-tasks',
        'List pending conversion tasks',
        '查询待转码任务',
      ],
      [
        'get-v5-projector-tasks-uuid',
        'query-task',
        'Query conversion task progress',
        '查询转码任务进度',
      ],
      [
        'delete-v5-projector-tasks-uuid',
        'cancel-task',
        'Cancel a conversion task',
        '取消指定的转码任务',
      ],
      [
        'put-v5-projector-tasks-uuid-priority',
        'set-task-priority',
        'Set conversion task priority',
        '设置任务优先级',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'danmaku-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/danmaku',
    publicSourceUrl: '/openapi/danmaku/danmaku.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/danmaku',
    sourcePath: 'content/openapi/danmaku/danmaku.zh-CN.yaml',
    operations: [
      [
        'get-cloud-game-list',
        'get-cloud-game-list',
        'Get cloud game list',
        '获取云游戏列表',
      ],
      [
        'get-cloud-game-detail',
        'get-cloud-game-detail',
        'Get cloud game details',
        '获取云游戏详情',
      ],
      [
        'start-cloud-game',
        'start-cloud-game',
        'Start cloud game service',
        '启动云游戏服务',
      ],
      [
        'stop-cloud-game',
        'stop-cloud-game',
        'Stop cloud game service',
        '关闭云游戏服务',
      ],
      [
        'get-cloud-game-status',
        'get-cloud-game-status',
        'Query cloud game task status',
        '查询云游戏任务状态',
      ],
      [
        'renew-cloud-game-token',
        'renew-cloud-game-token',
        'Renew cloud game streaming token',
        '更新云游戏推流 Token',
      ],
      [
        'push-message',
        'push-message',
        'Push live room messages',
        '推送直播间消息',
      ],
      [
        'start-pc-game',
        'start-pc-game',
        'Start PC game service',
        '启动游戏服务',
      ],
      ['stop-pc-game', 'stop-pc-game', 'Stop PC game service', '关闭游戏服务'],
    ],
  }),
  zhCnOpenApiLane({
    id: 'fusion-cdn-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/fusion-cdn',
    publicSourceUrl: '/openapi/fusion-cdn/streaming.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/fusion-cdn',
    sourcePath: 'content/openapi/fusion-cdn/streaming.zh-CN.yaml',
    operations: [
      ['get-domain-list', 'domain-list', 'Get domain list', '获取域名列表'],
      [
        'post-v1-projects-appid-fls-domains',
        'domain-create',
        'Add a domain',
        '增加域名',
      ],
      [
        'get-entry-point-list',
        'entry-point-list',
        'Get entry point list',
        '获取发布点列表',
      ],
      [
        'post-v1-projects-appid-fls-entry_points',
        'entry-point-create',
        'Add an entry point',
        '增加发布点',
      ],
      [
        'delete-a-entry-point',
        'entry-point-delete',
        'Delete an entry point',
        '删除发布点',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-admin-banned_streams-stream_name',
        'ban-stream',
        'Ban a stream',
        '封禁直播流',
      ],
      [
        'delete-v1-projects-appid-fls-entry_points-entry_point-admin-banned_streams-stream_name',
        'unban-stream',
        'Unban a stream',
        '取消封禁直播流',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-admin-banned_streams',
        'banned-stream-list',
        'Get banned stream list',
        '获取封禁的流列表',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-reports-online_streams',
        'online-stream-list',
        'Query online stream list',
        '查询在线流列表',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-reports-online_streams-stream_name',
        'online-stream-get',
        'Get online stream information',
        '获取在线流信息',
      ],
      [
        'get-streaming-history',
        'publish-history',
        'Get publish history',
        '获取推流历史',
      ],
      [
        'get-streaming-quality-stats',
        'publish-quality',
        'Get publish quality data',
        '获取推流质量数据',
      ],
      [
        'get-streaming-play-stats',
        'play-statistics',
        'Get playback statistics',
        '获取播流统计数据',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-record-custom-regions-region',
        'custom-recording-config-update',
        'Update custom recording configuration',
        '设置自定义录制配置',
      ],
      [
        'get-customized-recording-configuration',
        'custom-recording-config-get',
        'Get custom recording configuration',
        '获取自定义录制配置',
      ],
      [
        'enable-disable-customized-recording',
        'custom-recording-auto-update',
        'Enable or disable custom recording',
        '开启/关闭发布点的自定义录制',
      ],
      [
        'enable-customized-recording-for-a-stream',
        'custom-recording-stream-enable',
        'Enable custom recording for a stream',
        '开启单条流的自定义录制',
      ],
      [
        'disable-customized-recording-for-a-stream',
        'custom-recording-stream-disable',
        'Disable custom recording for a stream',
        '关闭单条流的自定义录制',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-record-standard-regions-region',
        'standard-recording-config-update',
        'Update standard recording configuration',
        '设置标准录制配置',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-record-standard-regions-region',
        'standard-recording-config-get',
        'Get standard recording configuration',
        '获取标准录制配置',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-record-standard-auto',
        'standard-recording-auto-update',
        'Enable or disable standard recording',
        '开启/关闭发布点的标准录制',
      ],
      [
        'put-v1-projects-appid-fls-entry_points-entry_point-admin-record-standard-regions-region-tasks',
        'standard-recording-stream-enable',
        'Enable standard recording for a stream',
        '开启单条流的标准录制',
      ],
      [
        'delete-v1-projects-appid-fls-entry_points-entry_point-admin-record-standard-regions-region-tasks-stream_name',
        'standard-recording-stream-disable',
        'Disable standard recording for a stream',
        '关闭单条流的标准录制',
      ],
      [
        'post-v1-projects-appid-fls-entry_points-entry_point-admin-record-standard-regions-region-cutting-stream_name',
        'recording-cut',
        'Cut a recording segment',
        '截取片段',
      ],
      [
        'post-v1-projects-appid-fls-entry_points-entry_point-admin-record-standard-regions-region-snapshot-stream_name',
        'recording-snapshot',
        'Capture a recording snapshot',
        '定点截图',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-admin-record-standard-regions-region-preview_list',
        'recording-file-list',
        'Query recording file list',
        '查询录制文件列表',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-snapshot-custom-regions-region',
        'custom-snapshot-config-update',
        'Update custom snapshot configuration',
        '设置自定义截图及存储配置',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-snapshot-custom-regions-region',
        'custom-snapshot-config-get',
        'Get custom snapshot configuration',
        '获取自定义截图及存储配置',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-snapshot-standard-regions-region',
        'standard-snapshot-config-update',
        'Update standard snapshot configuration',
        '设置标准截图及存储配置',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-snapshot-standard-regions-region',
        'standard-snapshot-config-get',
        'Get standard snapshot configuration',
        '获取标准截图及存储配置',
      ],
      [
        'patch-v1-projects-appid-fls-settings-streamauth-webhook',
        'origin-auth-config-update',
        'Update origin authentication configuration',
        '设置回源鉴权配置',
      ],
      [
        'get-v1-projects-appid-fls-settings-streamauth-webhook',
        'origin-auth-config-get',
        'Get origin authentication configuration',
        '获取回源鉴权配置',
      ],
      [
        'post-transcode-custom',
        'custom-transcode-template-create',
        'Create custom transcoding template',
        '创建自定义转码模版',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-transcode-custom',
        'custom-transcode-template-list',
        'List custom transcoding templates',
        '获取自定义转码模版列表',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-transcode-custom-name',
        'custom-transcode-template-update',
        'Update custom transcoding template',
        '更新自定义转码模版',
      ],
      [
        'delete-v1-projects-appid-fls-entry_points-entry_point-settings-transcode-custom-name',
        'custom-transcode-template-delete',
        'Delete custom transcoding template',
        '删除自定义转码模版',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-transcode-standard-name',
        'preset-transcode-template-set',
        'Set preset transcoding template',
        '设置预置的转码模版',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-transcode-standard',
        'transcode-template-list',
        'List transcoding templates',
        '获取转码模版列表',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-watermark',
        'watermark-template-update',
        'Update watermark template',
        '设置水印模版',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-watermark',
        'watermark-template-get',
        'Get watermark template',
        '获取水印模版',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-transfer',
        'relay-config-update',
        'Update relay configuration',
        '设置转推到第三方平台配置',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-transfer',
        'relay-config-get',
        'Get relay configuration',
        '获取转推到第三方平台的配置',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-admin-delayed_streams-stream_name',
        'delay-stream-set',
        'Set stream delay',
        '设置延播时长',
      ],
      [
        'delete-v1-projects-appid-fls-entry_points-entry_point-admin-delayed_streams-stream_name',
        'delay-stream-cancel',
        'Cancel stream delay',
        '取消延播',
      ],
      [
        'patch-v1-projects-appid-fls-entry_points-entry_point-settings-origin_site',
        'origin-site-config-update',
        'Update origin pull configuration',
        '设置回源拉流配置',
      ],
      [
        'get-v1-projects-appid-fls-entry_points-entry_point-settings-origin_site',
        'origin-site-config-get',
        'Get origin pull configuration',
        '获取回源拉流配置',
      ],
      [
        'get-v2-ncs-ip',
        'ncs-ip-list',
        'Query NCS IP addresses',
        '查询消息通知服务器的 IP 地址',
      ],
      [
        'patch-v1-projects-appid-fls-domains-domain',
        'timestamp-auth-key-update',
        'Update timestamp authentication key',
        '设置时间戳鉴权密钥',
      ],
      [
        'delete-v1-projects-appid-fls-domains-domain',
        'domain-delete',
        'Delete a domain',
        '删除域名',
      ],
      [
        'get-v1-projects-appid-fls-domains-domain',
        'domain-get',
        'Get domain properties',
        '获取域名属性',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'media-pull-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/media-pull',
    publicSourceUrl: '/openapi/media-pull/media-pull.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/media-pull',
    sourcePath: 'content/openapi/media-pull/media-pull.zh-CN.yaml',
    operations: [
      [
        'get-region-v1-projects-appId-cloud-player-players',
        'create',
        'Create a cloud player',
        '创建云端播放器',
      ],
      [
        'patch-region-v1-projects-appId-cloud-player-players-playerid',
        'update',
        'Update a cloud player',
        '更新云端播放器',
      ],
      [
        'get-v1-projects-appId-cloud-player-players',
        'list',
        'List cloud players',
        '查询所有云端播放器',
      ],
      [
        'delete-region-v1-projects-appId-cloud-player-players-id',
        'delete',
        'Delete a cloud player',
        '销毁云端播放器',
      ],
      [
        'get-v1-ncs-ip',
        'get-ncs-ip',
        'Query notification server IP addresses',
        '查询消息通知服务器 IP',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'media-push-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/media-push',
    publicSourceUrl: '/openapi/media-push/media-push.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/media-push',
    sourcePath: 'content/openapi/media-push/media-push.zh-CN.yaml',
    operations: [
      [
        'post-region-v1-projects-appId-rtmp-converters',
        'create',
        'Create a Converter',
        '创建 Converter',
      ],
      [
        'delete-region-v1-projects-appId-rtmp-converters-converterId',
        'delete',
        'Delete a Converter',
        '销毁指定 Converter',
      ],
      [
        'patch-region-v1-projects-appId-rtmp-converters-converterId',
        'update',
        'Update a Converter',
        '更新指定 Converter',
      ],
      [
        'get-region-v1-projects-appId-rtmp-converters-converterId',
        'get',
        'Get Converter status',
        '获取指定 Converter 的推流状态',
      ],
      [
        'get-v1-projects-appId-rtmp-converters',
        'list',
        'List project Converters',
        '查询项目下所有 Converter',
      ],
      [
        'get-v1-projects-appId-channels-cname-rtmp-converters',
        'list-by-channel',
        'List channel Converters',
        '查询频道内 Converter',
      ],
      [
        'get-v1-ncs-ip',
        'get-ncs-ip',
        'Query message notification server IP addresses',
        '查询消息通知服务器 IP',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'rtc-rest-zh-cn',
    parentUrl: '/zh-CN/api-reference/api-ref/rtc',
    publicSourceUrl: '/openapi/rtc/channel-management.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/rtc',
    sourcePath: 'content/openapi/rtc/channel-management.zh-CN.yaml',
    operations: [
      [
        'post-dev-v1-kicking-rule',
        'create-ban-rule',
        'Create a banning rule',
        '创建规则',
      ],
      [
        'get-dev-v1-kicking-rule',
        'get-ban-rule-list',
        'Get the banning rule list',
        '获取规则列表',
      ],
      [
        'put-dev-v1-kicking-rule',
        'update-ban-expiration',
        'Update the banning rule expiration',
        '更新规则过期时间',
      ],
      [
        'delete-dev-v1-kicking-rule',
        'delete-ban-rule',
        'Delete a banning rule',
        '删除规则',
      ],
      [
        'get-user-property',
        'query-user-status',
        'Query user status',
        '查询用户状态',
      ],
      [
        'get-dev-v1-channel-user-appid-channelName',
        'query-user-list',
        'Query the user list',
        '查询用户列表',
      ],
      [
        'get-dev-v1-channel-user-appid-channelName-hosts_only',
        'query-host-list',
        'Query the host list',
        '查询主播列表',
      ],
      [
        'get-dev-v1-channel-appid',
        'query-channel-list',
        'Query the channel list',
        '查询项目的频道列表',
      ],
      [
        'get-v2-ncs-ip',
        'query-ip-address',
        'Query the IP address',
        '查询消息通知服务器 IP',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'cloud-transcoding-rest-zh-cn',
    parentUrl: '/zh-CN/api-reference/api-ref/cloud-transcoding',
    publicSourceUrl: '/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/cloud-transcoding',
    sourcePath:
      'content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml',
    operations: [
      [
        'post-v1-projects-appId-rtsc-cloud-transcoder-builderTokens',
        'acquire',
        'Acquire a builder token',
        '获取云端转码资源',
      ],
      [
        'post-v1-projects-appId-rtsc-cloud-transcoder-tasks',
        'create',
        'Create a cloud transcoding task',
        '创建云端转码',
      ],
      [
        'get-v1-projects-appId-rtsc-cloud-transcoder-tasks-taskId',
        'query',
        'Query the status of a task',
        '查询云端转码状态',
      ],
      [
        'patch-v1-projects-appId-rtsc-cloud-transcoder-tasks-taskId',
        'update',
        'Update a cloud transcoding task',
        '更新指定的云端转码',
      ],
      [
        'delete-v1-projects-appId-rtsc-cloud-transcoder-tasks-taskId',
        'destroy',
        'Destroy a cloud transcoding task',
        '销毁云端转码',
      ],
      [
        'post-v1-projects-appId-rtls-abr-config-codecs-codecId',
        'template-create',
        'Create or update a transcoding template',
        '创建或更新转码模板',
      ],
      [
        'get-v1-projects-appId-rtls-abr-config-codecs',
        'template-query',
        'Query transcoding templates',
        '查询转码模板',
      ],
      [
        'get-v1-ncs-ip',
        'ncs-query-ip',
        'Query message notification server IP',
        '查询消息通知服务器 IP',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'media-gateway-rest-zh-cn',
    parentUrl: '/zh-CN/api-reference/api-ref/rtmp-gateway',
    publicSourceUrl: '/openapi/media-gateway/media-gateway.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/rtmp-gateway',
    sourcePath: 'content/openapi/media-gateway/media-gateway.zh-CN.yaml',
    operations: [
      [
        'post-region-v1-projects-appId-rtls-ingress-streamkeys',
        'create-streaming-key',
        'Create streaming key',
        '创建推流码',
      ],
      [
        'get-region-v1-projects-appId-rtls-ingress-streamkeys-limit-cursor',
        'list-streaming-keys',
        'List streaming keys',
        '列出指定 App ID 下所有推流码',
      ],
      [
        'get-region-v1-projects-appId-rtls-ingress-streamkeys-streamkey',
        'query-streaming-key',
        'Query streaming key',
        '查询推流码信息',
      ],
      [
        'put-region-v1-projects-appId-rtls-ingress-streamkeys-streamkey',
        'update-streaming-key',
        'Update streaming key',
        '更新推流码信息',
      ],
      [
        'delete-region-v1-projects-appId-rtls-ingress-streamkeys-streamkey',
        'delete-streaming-key',
        'Delete streaming key',
        '销毁推流码',
      ],
      [
        'put-region-v1-projects-appId-rtls-ingress-stream-templates-templateId',
        'create-reset-template',
        'Create or reset template',
        '创建或重置流配置模板',
      ],
      [
        'patch-region-v1-projects-appId-rtls-ingress-stream-templates-templateId',
        'update-template',
        'Update template',
        '更新流配置模板',
      ],
      [
        'delete-region-v1-projects-appId-rtls-ingress-stream-templates-templateId',
        'delete-template',
        'Delete template',
        '删除流配置模板',
      ],
      [
        'put-region-v1-projects-appId-rtls-ingress-appconfig',
        'set-global-template',
        'Set global template',
        '设置全局流配置模板',
      ],
      [
        'get-region-v1-projects-appId-rtls-ingress-online-streams',
        'query-streaming-list',
        'Query streaming list',
        '查询当前在推流列表',
      ],
      [
        'get-region-version-projects-appId-rtls-ingress-online-streams-sid',
        'query-streaming-information',
        'Query streaming information',
        '使用 SID 查询在推流信息',
      ],
      [
        'delete-region-v1-projects-appId-rtls-ingress-online-streams-sid',
        'force-disconnection',
        'Force disconnect',
        '使用 SID 强制断开推流',
      ],
      [
        'post-region-version-projects-appId-rtls-ingress-online-streams-sid-mute',
        'mute-streaming',
        'Mute or unmute streaming',
        '对在推流进行 mute/unmute 操作',
      ],
      [
        'get-v1-ncs-ip',
        'query-ip-address',
        'Query notification service IP address',
        '查询消息通知服务器 IP',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'voip-callkit-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/voip-callkit',
    publicSourceUrl: '/openapi/voip-callkit/call.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/voip-callkit',
    sourcePath: 'content/openapi/voip-callkit/call.zh-CN.yaml',
    operations: [
      [
        'callMiniApp',
        'call-mini-app',
        'Call a mini app from a device',
        '设备呼叫小程序',
      ],
      [
        'hangupMiniApp',
        'hangup-mini-app',
        'Hang up a mini app call',
        '挂断小程序',
      ],
      [
        'activateLicense',
        'activate-license',
        'Activate a license',
        '激活 License',
      ],
      [
        'getExpiringLicenses',
        'list-expiring-licenses',
        'List expiring licenses',
        '查询即将到期的 License 列表',
      ],
      ['renewLicense', 'renew-license', 'Renew a license', 'License 续期'],
      [
        'getLicenseRenewals',
        'list-license-renewals',
        'List license renewal orders',
        '查询 License 续期订单',
      ],
    ],
  }),
  zhCnOpenApiLane({
    id: 'whiteboard-rest',
    parentUrl: '/zh-CN/api-reference/api-ref/whiteboard/restful',
    publicSourceUrl: '/openapi/whiteboard/restful-wb.zh-CN.yaml',
    routePrefix: 'api-reference/api-ref/whiteboard/restful',
    sourcePath: 'content/openapi/whiteboard/restful-wb.zh-CN.yaml',
    operations: [
      [
        'post-v5-tokens-teams',
        'generate-sdk-token',
        'Generate an SDK token',
        '生成 SDK Token',
      ],
      [
        'post-v5-tokens-rooms-uuid',
        'generate-room-token',
        'Generate a room token',
        '生成 Room Token',
      ],
      [
        'post-v5-tokens-tasks-uuid',
        'generate-task-token',
        'Generate a task token',
        '生成 Task Token',
      ],
      ['post-v5-rooms', 'create-room', 'Create a room', '创建房间'],
      ['get-v5-rooms', 'list-rooms', 'List rooms', '获取房间列表'],
      ['get-v5-rooms-uuid', 'get-room', 'Get room information', '获取房间信息'],
      ['patch-v5-rooms-uuid', 'ban-room', 'Ban or unban a room', '封禁房间'],
      [
        'get-v5-rooms-uuid-scenes',
        'list-scene-paths',
        'Get scene path list',
        '获取场景地址列表',
      ],
      [
        'post-v5-rooms-uuid-scenes',
        'insert-scenes',
        'Insert scenes',
        '插入新场景',
      ],
      [
        'patch-v5-rooms-uuid-scene-state',
        'switch-scene',
        'Switch scenes',
        '场景跳转',
      ],
      [
        'post-v5-rooms-uuid-screenshots',
        'screenshot-scene',
        'Capture a scene screenshot',
        '生成场景截图',
      ],
      [
        'post-v5-rooms-uuid-screenshot-list',
        'screenshot-scene-list',
        'Capture scene screenshots',
        '生成场景截图列表',
      ],
      [
        'post-v5-projector-tasks',
        'start-file-conversion',
        'Start file conversion',
        '发起文档转换',
      ],
      [
        'get-v5-projector-tasks',
        'list-file-conversion-tasks',
        'List pending file-conversion tasks',
        '查询待转换任务',
      ],
      [
        'get-v5-projector-tasks-uuid',
        'get-file-conversion-task',
        'Query file-conversion progress',
        '查询转换任务进度',
      ],
      [
        'delete-v5-projector-tasks-uuid',
        'cancel-file-conversion-task',
        'Cancel a file-conversion task',
        '取消指定的文档转换任务',
      ],
      [
        'put-v5-projector-tasks-uuid-priority',
        'set-file-conversion-task-priority',
        'Set file-conversion task priority',
        '设置任务优先级',
      ],
      [
        'post-v5-services-conversion-tasks',
        'start-legacy-file-conversion',
        'Start legacy file conversion',
        '发起文档转换',
      ],
      [
        'get-v5-services-conversion-tasks-uuid',
        'get-legacy-file-conversion-task',
        'Query legacy file-conversion progress',
        '查询转换任务的进度',
      ],
    ],
  }),
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

export function getOpenApiReferenceBackLink(locale: AppLocale) {
  return locale === 'zh-CN'
    ? {
        href: '/zh-CN/api-reference/api',
        label: '参考文档',
      }
    : {
        href: '/en/api-reference',
        label: 'API Reference',
      };
}

export function findOpenApiLaneByUrl(
  locale: AppLocale,
  tab: string,
  activePath: string,
) {
  return getOpenApiLanes()
    .filter(
      (lane) =>
        lane.tab === tab &&
        getOpenApiLaneLocales(lane).includes(locale) &&
        (activePath === lane.parentUrl[locale] ||
          activePath.startsWith(`${lane.parentUrl[locale]}/`)),
    )
    .sort(
      (left, right) =>
        right.parentUrl[locale].length - left.parentUrl[locale].length,
    )
    .at(0);
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
