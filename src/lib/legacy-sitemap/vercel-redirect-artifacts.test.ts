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

type VercelRoute = {
  dest: string;
  has?: Array<{
    key: string;
    type: string;
    value: string;
  }>;
  src: string;
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
