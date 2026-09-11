import { describe, expect, it } from 'vitest';
import { resolveStaticLegacySitemapRedirect } from './static-redirects';

describe('static legacy sitemap redirects', () => {
  it('resolves a legacy path without relying on static docs payload files', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/agora-chat/develop/ip_allowlist'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl:
        '/en/realtime-media/im/build/secure-access-and-authentication/ip-allowlist',
      statusCode: 301,
    });
  });

  it('marks flattened zh-CN Build routes as permanent redirects', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/zh-CN/realtime-media/meeting/build/setup-and-access/enable-service',
      ),
    ).toMatchObject({
      redirectUrl: '/zh-CN/realtime-media/meeting/build/enable-service',
      statusCode: 301,
    });
  });

  it('redirects the legacy Cloud Recording getstarted shortcut to the REST quickstart', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/cloud-recording/get-started/getstarted',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/realtime-media/cloud-recording/rest-quickstart',
      statusCode: 301,
    });
  });

  it('redirects the legacy Chat RESTful overview to the API reference overview', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/agora-chat/restful-api/restful-overview',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/api-ref/im',
      statusCode: 301,
    });
  });

  it('prefers query-specific legacy rules before path fallback rules', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/broadcast-streaming/overview/release-notes',
        '?platform=react-js',
      ),
    ).toEqual({
      preserveSearch: false,
      redirectUrl:
        '/en/realtime-media/broadcast-streaming/reference/release-notes/javascript',
      statusCode: 301,
    });
  });

  it('falls back to the path-level rule when no query-specific rule exists', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/signaling/rest-api/restful-authentication',
        '?platform=web',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/api-ref/signaling/authentication',
      statusCode: 301,
    });
  });

  it('returns null for non-legacy paths', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/ai/get-started/quickstart'),
    ).toBeNull();
  });
});
