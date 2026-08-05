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

type VercelCondition = {
  key: string;
  type: string;
  value?: string;
};

type VercelRedirect = {
  destination: string;
  has?: VercelCondition[];
  preserveQueryParams?: boolean;
  source: string;
  statusCode: number;
};

type VercelRoute = {
  dest?: string;
  has?: VercelCondition[];
  headers?: Record<string, string>;
  missing?: VercelCondition[];
  src: string;
  status?: number;
};

describe('legacy redirect Vercel artifacts', () => {
  const legacyRules = redirectsConfig.rules as LegacySitemapRedirectRule[];
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    bulkRedirectsPath: string;
    redirects?: VercelRedirect[];
    rewrites?: unknown[];
    routes?: VercelRoute[];
  };
  const bulkRedirects = JSON.parse(
    readFileSync('vercel-legacy-redirects.json', 'utf8'),
  ) as VercelRedirect[];

  it('keeps the committed artifacts aligned with the legacy redirect rules', () => {
    expect(staticRedirects).toHaveLength(legacyRules.length);
    expect(vercelConfig.bulkRedirectsPath).toBe('vercel-legacy-redirects.json');
    expect(vercelConfig.rewrites).toBeUndefined();
  });

  it('stays within Vercel redirect limits and schema', () => {
    expect(bulkRedirects.length).toBeLessThanOrEqual(1_000);
    expect(vercelConfig.redirects?.length ?? 0).toBeLessThanOrEqual(2_048);
    expect(vercelConfig.redirects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ preserveQueryParams: expect.anything() }),
      ]),
    );
  });

  it('negotiates canonical docs URLs to markdown before filesystem routing', () => {
    expect(vercelConfig.routes).toContainEqual({
      dest: '/en.md',
      has: [
        {
          key: 'Accept',
          type: 'header',
          value: '.*text/markdown.*',
        },
      ],
      src: '^/(?:en/?)?$',
    });
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

  it('negotiates only English entry requests that explicitly accept markdown', () => {
    expect(resolveVercelRoute(vercelConfig.routes, '/', 'text/markdown')).toBe(
      '/en.md',
    );
    expect(
      resolveVercelRoute(vercelConfig.routes, '/en', 'text/markdown'),
    ).toBe('/en.md');
    expect(
      resolveVercelRoute(vercelConfig.routes, '/en/', 'text/markdown'),
    ).toBe('/en.md');
    expect(
      resolveVercelRoute(vercelConfig.routes, '/', 'text/html'),
    ).toBeNull();
    expect(
      resolveVercelRoute(vercelConfig.routes, '/en', 'text/html'),
    ).toBeNull();
    expect(
      resolveVercelRoute(vercelConfig.routes, '/en.md', 'text/markdown'),
    ).toBeNull();
    expect(
      resolveVercelRoute(vercelConfig.routes, '/zh-CN', 'text/markdown'),
    ).toBeNull();
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

  it('redirects the moved AI release notes page in production', () => {
    expect(
      bulkRedirects.find(
        (rule) => rule.source === '/en/ai/reference/release-notes',
      ),
    ).toEqual({
      destination: '/en/ai/release-notes',
      preserveQueryParams: true,
      source: '/en/ai/reference/release-notes',
      statusCode: 301,
    });
  });

  it('redirects high-traffic legacy English URLs to their current pages', () => {
    const expectedRedirects = [
      {
        destination: '/en/api-reference/sdks',
        source: '/en/sdks',
      },
      {
        destination: '/en/api-reference/faq/integration/acquire_file_directory',
        source: '/en/help/integration-issues/acquire_file_directory',
      },
      {
        destination: '/en/api-reference/faq/other/android_noaudio',
        source: '/en/help/other-issues/android_noaudio',
      },
      {
        destination: '/en/api-reference/faq/quality/track_ended',
        source: '/en/help/quality-issues/track_ended',
      },
      {
        destination: '/en/api-reference/faq/account/console_account_faq',
        source: '/en/help/account-and-billing/console_account_faq',
      },
      {
        destination:
          '/en/realtime-media/interactive-live-streaming/product-overview',
        source: '/en/solutions/interactive-live-streaming/product-overview',
      },
      {
        destination:
          '/en/realtime-media/flexible-classroom/reference/supported-platforms',
        source: '/en/flexible-classroom/overview/supported-platforms',
      },
      {
        destination:
          '/en/realtime-media/voice/build/optimize-and-operate/autoplay',
        source: '/en/Voice/autoplay_policy_web_ng',
      },
      {
        destination:
          '/en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow',
        source: '/en/interactive-whiteboard/develop/authentication-workflow',
      },
    ];

    for (const expected of expectedRedirects) {
      expect(
        bulkRedirects.find((rule) => rule.source === expected.source),
      ).toEqual({
        ...expected,
        preserveQueryParams: true,
        statusCode: 301,
      });
    }
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

  it('strips legacy queries with conditional Vercel redirect routes', () => {
    expect(
      bulkRedirects.some(
        (rule) =>
          rule.source === '/en/broadcast-streaming/overview/release-notes',
      ),
    ).toBe(false);
    expect(vercelConfig.routes).toContainEqual({
      headers: {
        Location:
          '/en/realtime-media/broadcast-streaming/reference/release-notes/javascript',
      },
      has: [
        {
          key: 'platform',
          type: 'query',
          value: 'react-js',
        },
      ],
      src: '^/en/broadcast-streaming/overview/release-notes/?$',
      status: 301,
    });
  });

  it('redirects legacy platform URLs without a platform query using fallback routes', () => {
    const expectedFallbackRoutes = [
      {
        src: '^/en/Agora Platform/get_appid_token/?$',
        headers: {
          Location: '/en/introduction/account',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Agora Platform/terms/?$',
        headers: {
          Location: '/en/introduction/core-concepts',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Interactive Broadcast/cdn_streaming_web/?$',
        headers: {
          Location:
            '/en/realtime-media/media-push/get-started/enable-media-push',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Interactive Broadcast/cdn_streaming_windows/?$',
        headers: {
          Location:
            '/en/realtime-media/media-push/get-started/enable-media-push',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Interactive Broadcast/cloud_proxy_web_ng/?$',
        headers: {
          Location:
            '/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/cloud-proxy',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Interactive Broadcast/in-call_quality_windows/?$',
        headers: {
          Location:
            '/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/in-call-quality-monitoring',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
      {
        src: '^/en/Interactive Broadcast/set_subscribing_state/?$',
        headers: {
          Location:
            '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute',
        },
        missing: [{ type: 'query', key: 'platform' }],
        status: 301,
      },
    ];

    expect(vercelConfig.routes).toEqual(
      expect.arrayContaining(expectedFallbackRoutes),
    );

    const platformRouteIndex = vercelConfig.routes?.findIndex(
      (route) =>
        route.src === '^/en/Interactive Broadcast/set_subscribing_state/?$' &&
        route.headers?.Location ===
          '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute/windows' &&
        route.has?.some(
          (condition) =>
            condition.type === 'query' &&
            condition.key === 'platform' &&
            condition.value === 'Windows',
        ),
    );
    const fallbackRouteIndex = vercelConfig.routes?.findIndex(
      (route) =>
        route.src === '^/en/Interactive Broadcast/set_subscribing_state/?$' &&
        route.headers?.Location ===
          '/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute' &&
        route.missing?.some(
          (condition) =>
            condition.type === 'query' && condition.key === 'platform',
        ),
    );

    expect(platformRouteIndex).toBeGreaterThanOrEqual(0);
    expect(fallbackRouteIndex).toBeGreaterThan(platformRouteIndex ?? -1);
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

function resolveVercelRoute(
  routes: VercelRoute[] | undefined,
  pathname: string,
  accept: string,
) {
  for (const route of routes ?? []) {
    if (!new RegExp(route.src).test(pathname)) {
      continue;
    }

    const acceptsRequest = (route.has ?? []).every((condition) =>
      condition.type === 'header' && condition.key.toLowerCase() === 'accept'
        ? new RegExp(condition.value).test(accept)
        : false,
    );

    if (acceptsRequest) {
      return route.dest;
    }
  }

  return null;
}
