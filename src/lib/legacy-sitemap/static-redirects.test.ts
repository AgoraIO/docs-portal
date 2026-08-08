import { describe, expect, it } from 'vitest';
import { resolveStaticLegacySitemapRedirect } from './static-redirects';

describe('static legacy sitemap redirects', () => {
  const legacyHelpFaqRedirects = [
    [
      '/en/help/integration-issues/system_volume',
      '/en/api-reference/faq/integration/system_volume',
    ],
    [
      '/en/help/integration-issues/recording_mode',
      '/en/api-reference/faq/integration/recording_mode',
    ],
    [
      '/help/account-and-billing/billing_account',
      '/en/api-reference/faq/account/billing_account',
    ],
    [
      '/help/integration-issues/agora_class_custom_properties',
      '/en/api-reference/faq/integration/agora_class_custom_properties',
    ],
    [
      '/help/integration-issues/token_cohost',
      '/en/api-reference/faq/integration/token_cohost',
    ],
    [
      '/help/integration-issues/token_related_issues',
      '/en/api-reference/faq/integration/token_related_issues',
    ],
  ] as const satisfies ReadonlyArray<
    readonly [legacyPath: string, redirectUrl: string]
  >;

  it('resolves a legacy path without relying on static docs payload files', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/agora-chat/develop/ip_allowlist'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl:
        '/en/realtime-media/im/build/secure-access-and-authentication/ip-allowlist',
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
    });
  });

  it('redirects the moved AI release notes page to its current URL', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/ai/reference/release-notes'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/ai/release-notes',
    });
  });

  it.each(legacyHelpFaqRedirects)(
    'redirects %s to %s',
    (legacyPath, redirectUrl) => {
      expect(resolveStaticLegacySitemapRedirect(legacyPath)).toEqual({
        preserveSearch: true,
        redirectUrl,
      });
    },
  );

  it('prefers query-specific legacy rules before path fallback rules', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/broadcast-streaming/overview/release-notes',
        '?platform=react-js',
      ),
    ).toEqual({
      preserveSearch: false,
      redirectUrl:
        '/en/realtime-media/rtc/reference/release-notes/javascript',
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
