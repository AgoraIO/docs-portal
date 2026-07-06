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
    });
  });

  it('returns null for non-legacy paths', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/ai/get-started/quickstart'),
    ).toBeNull();
  });
});
