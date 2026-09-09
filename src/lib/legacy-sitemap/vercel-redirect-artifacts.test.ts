import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import redirectsConfig from './redirects.json';
import staticRedirects from './static-redirects.json';

type LegacySitemapRedirectRule = {
  legacyPath: string;
  legacySearch?: string;
  preserveSearch: boolean;
  target: string;
};

type StaticRedirectRule = {
  p: string;
  q?: string;
  s?: 0;
  t: string;
};

type VercelRedirect = {
  destination: string;
  has?: Array<{
    key: string;
    type: string;
    value: string;
  }>;
  preserveQueryParams?: boolean;
  source: string;
  statusCode: number;
};

const RTM_DEPLOYMENT_REDIRECTS = {
  '/zh-CN/realtime-media/rtm/build/setup-and-access/enable-service':
    '/zh-CN/realtime-media/rtm/build/rtm-initialization/enable-service',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/application-setup':
    '/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/add-event-listener':
    '/zh-CN/realtime-media/rtm/build/messaging/add-event-listener',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/login':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/login',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/link-basic':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-basic',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/link-state':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/data-storage':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/data-storage',
  '/zh-CN/realtime-media/rtm/build/setup-and-access/private-setup':
    '/zh-CN/realtime-media/rtm/build/network-and-private-deployment/private-setup',
  '/zh-CN/realtime-media/rtm/build/manage-channels/channel-basic':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/channel-basic',
  '/zh-CN/realtime-media/rtm/build/manage-channels/channel-name':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/channel-name',
  '/zh-CN/realtime-media/rtm/build/manage-channels/message-channel':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/message-channel',
  '/zh-CN/realtime-media/rtm/build/manage-channels/stream-channel':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/stream-channel',
  '/zh-CN/realtime-media/rtm/build/manage-messages/send-message':
    '/zh-CN/realtime-media/rtm/build/messaging/send-message',
  '/zh-CN/realtime-media/rtm/build/manage-messages/constructed':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/constructed',
  '/zh-CN/realtime-media/rtm/build/manage-messages/serialized':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/serialized',
  '/zh-CN/realtime-media/rtm/build/manage-messages/history-message':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/history-message',
  '/zh-CN/realtime-media/rtm/build/manage-topics/topic-basic':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/topic-basic',
  '/zh-CN/realtime-media/rtm/build/manage-topics/usage':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/usage',
  '/zh-CN/realtime-media/rtm/build/manage-topics/topic-events':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/topic-events',
  '/zh-CN/realtime-media/rtm/build/manage-presence/presence-basic':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-basic',
  '/zh-CN/realtime-media/rtm/build/manage-presence/temporary-user-state':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/temporary-user-state',
  '/zh-CN/realtime-media/rtm/build/manage-presence/presence-events':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-events',
  '/zh-CN/realtime-media/rtm/build/manage-metadata/user-metadata':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/user-metadata',
  '/zh-CN/realtime-media/rtm/build/manage-metadata/channel-metadata':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/channel-metadata',
  '/zh-CN/realtime-media/rtm/build/manage-metadata/metadata-events':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/metadata-events',
  '/zh-CN/realtime-media/rtm/build/security-and-auth/token-generation':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/token-generation',
  '/zh-CN/realtime-media/rtm/build/security-and-auth/user-authentication':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/user-authentication',
  '/zh-CN/realtime-media/rtm/get-started/enable-service':
    '/zh-CN/realtime-media/rtm/build/rtm-initialization/enable-service',
  '/zh-CN/realtime-media/rtm/reference/link-state':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state',
  '/zh-CN/realtime-media/rtm/reference/metadata-events':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/metadata-events',
  '/zh-CN/realtime-media/rtm/reference/presence-events':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-events',
  '/zh-CN/realtime-media/rtm/reference/topic-events':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/topic-events',
  '/zh-CN/realtime-media/rtm/user-guide/channel/channel-basic':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/channel-basic',
  '/zh-CN/realtime-media/rtm/user-guide/channel/channel-name':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/channel-name',
  '/zh-CN/realtime-media/rtm/user-guide/channel/message-channel':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/message-channel',
  '/zh-CN/realtime-media/rtm/user-guide/channel/stream-channel':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/stream-channel',
  '/zh-CN/realtime-media/rtm/user-guide/link/link-basic':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-basic',
  '/zh-CN/realtime-media/rtm/user-guide/link/link-state':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state',
  '/zh-CN/realtime-media/rtm/user-guide/message/add-event-listener':
    '/zh-CN/realtime-media/rtm/build/messaging/add-event-listener',
  '/zh-CN/realtime-media/rtm/user-guide/message/constructed':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/constructed',
  '/zh-CN/realtime-media/rtm/user-guide/message/history-message':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/history-message',
  '/zh-CN/realtime-media/rtm/user-guide/message/send-message':
    '/zh-CN/realtime-media/rtm/build/messaging/send-message',
  '/zh-CN/realtime-media/rtm/user-guide/message/serialized':
    '/zh-CN/realtime-media/rtm/build/message-design-and-history/serialized',
  '/zh-CN/realtime-media/rtm/user-guide/presence/event':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-events',
  '/zh-CN/realtime-media/rtm/user-guide/presence/presence-basic':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-basic',
  '/zh-CN/realtime-media/rtm/user-guide/presence/temporary-user-state':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/temporary-user-state',
  '/zh-CN/realtime-media/rtm/user-guide/setup/application-setup':
    '/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup',
  '/zh-CN/realtime-media/rtm/user-guide/setup/data-storage':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/data-storage',
  '/zh-CN/realtime-media/rtm/user-guide/setup/login':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/login',
  '/zh-CN/realtime-media/rtm/user-guide/setup/private-setup':
    '/zh-CN/realtime-media/rtm/build/network-and-private-deployment/private-setup',
  '/zh-CN/realtime-media/rtm/user-guide/storage/channel-metadata':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/channel-metadata',
  '/zh-CN/realtime-media/rtm/user-guide/storage/event':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/metadata-events',
  '/zh-CN/realtime-media/rtm/user-guide/storage/user-metadata':
    '/zh-CN/realtime-media/rtm/build/state-and-attributes/user-metadata',
  '/zh-CN/realtime-media/rtm/user-guide/token/token-generation':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/token-generation',
  '/zh-CN/realtime-media/rtm/user-guide/token/user-authentication':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/user-authentication',
  '/zh-CN/realtime-media/rtm/user-guide/topic/event':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/topic-events',
  '/zh-CN/realtime-media/rtm/user-guide/topic/topic-basic':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/topic-basic',
  '/zh-CN/realtime-media/rtm/user-guide/topic/usage':
    '/zh-CN/realtime-media/rtm/build/channels-and-topics/topics/usage',
  '/zh-CN/realtime-media/rtm/build/manage-connections/link-basic':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-basic',
  '/zh-CN/realtime-media/rtm/build/manage-connections/link-state':
    '/zh-CN/realtime-media/rtm/build/authentication-and-connection/link-state',
  '/zh-CN/realtime-media/rtm/build/manage-messages/add-event-listener':
    '/zh-CN/realtime-media/rtm/build/messaging/add-event-listener',
} as const;

const RTM_OLD_CATEGORY_ROOTS = [
  '/zh-CN/realtime-media/rtm/build/setup-and-access',
  '/zh-CN/realtime-media/rtm/build/manage-channels',
  '/zh-CN/realtime-media/rtm/build/manage-messages',
  '/zh-CN/realtime-media/rtm/build/manage-topics',
  '/zh-CN/realtime-media/rtm/build/manage-presence',
  '/zh-CN/realtime-media/rtm/build/manage-metadata',
  '/zh-CN/realtime-media/rtm/build/manage-connections',
  '/zh-CN/realtime-media/rtm/build/security-and-auth',
];

const RTM_OLD_CATEGORY_SEGMENTS = [
  'setup-and-access',
  'manage-channels',
  'manage-messages',
  'manage-topics',
  'manage-presence',
  'manage-metadata',
  'manage-connections',
  'security-and-auth',
];

const CLOUD_RECORDING_DEPLOYMENT_REDIRECTS = {
  '/zh-CN/realtime-media/cloud-recording/build/implement-core-features':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events',
  '/zh-CN/realtime-media/cloud-recording/build/monitor-events':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events',
  '/zh-CN/realtime-media/cloud-recording/build/implement-core-features/service':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events/service',
  '/zh-CN/realtime-media/cloud-recording/build/implement-core-features/status':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events/status',
  '/zh-CN/realtime-media/cloud-recording/build/implement-core-features/uploading':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events/uploading',
  '/zh-CN/realtime-media/cloud-recording/build/implement-core-features/webpage':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events/webpage',
  '/zh-CN/realtime-media/cloud-recording/build/monitor-events/enable-ncs':
    '/zh-CN/realtime-media/cloud-recording/build/handle-events/enable-ncs',
} as const;

describe('legacy redirect Vercel artifacts', () => {
  const legacyRules = redirectsConfig.rules as LegacySitemapRedirectRule[];
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    bulkRedirectsPath: string;
    redirects?: VercelRedirect[];
    rewrites?: unknown[];
    routes?: Array<{
      dest: string;
      has?: Array<{
        key: string;
        type: string;
        value: string;
      }>;
      src: string;
    }>;
  };
  const bulkRedirects = JSON.parse(
    readFileSync('vercel-legacy-redirects.json', 'utf8'),
  ) as VercelRedirect[];

  it('keeps the committed artifacts aligned with the legacy redirect rules', () => {
    expect(staticRedirects).toHaveLength(legacyRules.length);
    expect(vercelConfig.bulkRedirectsPath).toBe('vercel-legacy-redirects.json');
    expect(vercelConfig.rewrites).toBeUndefined();
  });

  it('negotiates canonical docs URLs to markdown before filesystem routing', () => {
    expect(vercelConfig.routes).toContainEqual({
      dest: '/en/$1.md',
      has: [
        {
          key: 'Accept',
          type: 'header',
          value: '.*text/markdown.*',
        },
      ],
      src: '^/en/((?!.*\\.md/?$).+?)/?$',
    });

    expect(vercelConfig.routes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: expect.stringContaining('zh-CN') }),
      ]),
    );
  });

  it('uses Vercel HTTP 301 redirects as the primary production path', () => {
    expect(
      bulkRedirects.find(
        (rule) => rule.source === '/en/agora-chat/develop/ip_allowlist',
      ),
    ).toEqual({
      destination:
        '/en/realtime-media/im/build/secure-access-and-authentication/ip-allowlist',
      preserveQueryParams: true,
      source: '/en/agora-chat/develop/ip_allowlist',
      statusCode: 301,
    });
  });

  it('redirects the legacy Chat RESTful overview to the API reference overview in production', () => {
    expect(
      bulkRedirects.find(
        (rule) => rule.source === '/en/agora-chat/restful-api/restful-overview',
      ),
    ).toEqual({
      destination: '/en/api-reference/api-ref/im',
      preserveQueryParams: true,
      source: '/en/agora-chat/restful-api/restful-overview',
      statusCode: 301,
    });
  });

  it('redirects locale-less conversational AI model overview links before app routing', () => {
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          destination: '/en/ai/models/asr/deepgram',
          source: '/conversational-ai/models/asr/overview',
          statusCode: 301,
        },
        {
          destination: '/en/ai/models/llm/openai',
          source: '/conversational-ai/models/llm/overview',
          statusCode: 301,
        },
        {
          destination: '/en/ai/models/mllm/openai',
          source: '/conversational-ai/models/mllm/overview',
          statusCode: 301,
        },
        {
          destination: '/en/ai/models/tts/openai',
          source: '/conversational-ai/models/tts/overview',
          statusCode: 301,
        },
      ]),
    );
  });

  it('redirects legacy Basics third-party compliance pages', () => {
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          destination:
            '/zh-CN/introduction/security/sdk-compliance/flexible-classroom-sdk-third-party',
          source: '/basics/security/flexible-classroom-sdk-third-party',
          statusCode: 301,
        },
        {
          destination:
            '/zh-CN/realtime-media/speech-to-text/reference/third-party-services',
          source: '/basics/security/speech-to-text-third-party',
          statusCode: 301,
        },
      ]),
    );
  });

  it('redirects RTM current pages and historical aliases with deployment 301s', () => {
    const rtmRedirects = (vercelConfig.redirects ?? []).filter((rule) =>
      rule.source.startsWith('/zh-CN/realtime-media/rtm/'),
    );

    for (const [source, destination] of Object.entries(
      RTM_DEPLOYMENT_REDIRECTS,
    )) {
      expect(rtmRedirects).toContainEqual({
        destination,
        source,
        statusCode: 301,
      });
    }

    expect(rtmRedirects.map((rule) => rule.source)).not.toEqual(
      expect.arrayContaining(RTM_OLD_CATEGORY_ROOTS),
    );

    for (const rule of rtmRedirects) {
      for (const segment of RTM_OLD_CATEGORY_SEGMENTS) {
        expect(rule.destination).not.toContain(segment);
      }
    }
  });

  it('redirects Cloud Recording IA pages and category roots with deployment 301s', () => {
    const cloudRecordingRedirects = (vercelConfig.redirects ?? []).filter(
      (rule) =>
        rule.source.startsWith('/zh-CN/realtime-media/cloud-recording/build/'),
    );

    for (const [source, destination] of Object.entries(
      CLOUD_RECORDING_DEPLOYMENT_REDIRECTS,
    )) {
      expect(cloudRecordingRedirects).toContainEqual({
        destination,
        source,
        statusCode: 301,
      });
    }
  });

  it('keeps legacy passthrough routes working without a catch-all SPA rewrite', () => {
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          destination: 'https://doc.shengwang.cn/doc/:path*',
          source: '/doc/:path*',
          statusCode: 308,
        },
        {
          destination: 'https://doc.shengwang.cn/api-ref/:path*',
          source: '/api-ref/:path*',
          statusCode: 308,
        },
      ]),
    );
  });

  it('keeps query-split paths in Vercel config redirects instead of bulk redirects', () => {
    expect(
      bulkRedirects.some(
        (rule) =>
          rule.source === '/en/broadcast-streaming/overview/release-notes',
      ),
    ).toBe(false);
    expect(vercelConfig.redirects).toContainEqual({
      destination:
        '/en/realtime-media/broadcast-streaming/reference/release-notes/javascript',
      has: [
        {
          key: 'platform',
          type: 'query',
          value: 'react-js',
        },
      ],
      source: '/en/broadcast-streaming/overview/release-notes',
      statusCode: 301,
    });
  });

  it('keeps the client fallback manifest compact and audit-free', () => {
    const sample = (staticRedirects as StaticRedirectRule[]).find(
      (rule) => rule.p === '/en/agora-chat/develop/ip_allowlist',
    );

    expect(sample).toEqual({
      p: '/en/agora-chat/develop/ip_allowlist',
      t: '/en/realtime-media/im/build/secure-access-and-authentication/ip-allowlist',
    });
    expect(Object.keys(sample ?? {}).sort()).toEqual(['p', 't']);
  });
});
