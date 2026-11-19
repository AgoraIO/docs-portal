import { describe, expect, it } from 'vitest';
import { isRetiredCnDocsPath } from '../retired-cn-docs.mjs';
import { ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS } from '../zh-cn-product-ia-redirects';
import {
  resolveStaticLegacySitemapRedirect,
  ZH_CN_SMALL_BUILD_FLAT_IA_STATIC_REDIRECT_SOURCES,
} from './static-redirects';
import staticRedirects from './static-redirects.json';

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

  it('marks all maintained flattened zh-CN Build routes as permanent redirects', () => {
    for (const [path, redirectUrl] of Object.entries(
      ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS,
    )) {
      if (isRetiredCnDocsPath(`/zh-CN/${path}`)) {
        expect(resolveStaticLegacySitemapRedirect(`/zh-CN/${path}`)).toBeNull();
        continue;
      }
      expect(
        resolveStaticLegacySitemapRedirect(`/zh-CN/${path}`),
      ).toMatchObject({
        redirectUrl,
        statusCode: 301,
      });
    }
  });

  it('uses exactly the application-layer small Build redirect sources for permanent status', () => {
    const staticPermanentSources = new Set(
      (staticRedirects as Array<{ p: string }>).flatMap(({ p }) =>
        resolveStaticLegacySitemapRedirect(p)?.statusCode === 301 ? [p] : [],
      ),
    );
    const applicationSources = new Set(
      Object.keys(ZH_CN_SMALL_BUILD_FLAT_IA_REDIRECTS)
        .filter((path) => !isRetiredCnDocsPath(`/zh-CN/${path}`))
        .map((path) => `/zh-CN/${path}`),
    );

    expect(ZH_CN_SMALL_BUILD_FLAT_IA_STATIC_REDIRECT_SOURCES).toEqual(
      applicationSources,
    );
    expect(staticPermanentSources).toEqual(applicationSources);
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

  it.each([
    [
      '/en/cloud-recording/overview/pricing',
      undefined,
      '/en/realtime-media/cloud-recording/reference/pricing',
    ],
    [
      '/en/on-premise-recording/overview/billing',
      '?platform=linux-cpp',
      '/en/realtime-media/on-premise-recording/reference/pricing',
    ],
    [
      '/en/cloud-recording/overview/pricing-webpage-recording',
      undefined,
      '/en/realtime-media/cloud-recording/reference/pricing-webpage-recording',
    ],
  ])('redirects %s to its current pricing page', (path, search, target) => {
    expect(resolveStaticLegacySitemapRedirect(path, search)).toEqual({
      preserveSearch: true,
      redirectUrl: target,
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

  it.each([
    ['/en/server-gateway/develop/cloud-proxy', '?platform=go'],
    ['/en/server-gateway/develop/cloud-proxy', '?platform=linux-cpp'],
    ['/en/server-gateway/develop/cloud-proxy', '?platform=linux-java'],
    ['/en/server-gateway/develop/cloud-proxy', '?platform=python'],
  ])(
    'redirects the removed Server Gateway Cloud Proxy path %s',
    (path, search) => {
      expect(resolveStaticLegacySitemapRedirect(path, search)).toEqual({
        preserveSearch: true,
        redirectUrl:
          '/en/realtime-media/rtc/build/manage-connection-and-quality/cloud-proxy',
      });
    },
  );

  it('redirects the legacy Cloud Recording billing page to the shared billing policies', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/cloud-recording/reference/billing-policies',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/introduction/billing/billing-policies',
    });
  });

  it('redirects legacy Agora Platform community resources to Discord', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/AgoraPlatform/community/'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: 'https://discord.com/invite/QfgBCvuX4d',
    });
  });

  it('redirects legacy Agora Platform sample apps to Recipes', () => {
    expect(
      resolveStaticLegacySitemapRedirect('/en/AgoraPlatform/sampleapps/'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/recipes',
    });
  });

  it.each([
    ['/en/Agora%20Platform/downloads', '/en/api-reference/sdks'],
    ['/en/Agora%20Platform/sampleapps', '/en/api-reference/recipes'],
  ])('redirects the encoded legacy Agora Platform path %s', (path, target) => {
    expect(resolveStaticLegacySitemapRedirect(path)).toEqual({
      preserveSearch: true,
      redirectUrl: target,
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
      redirectUrl: '/en/realtime-media/rtc/reference/release-notes/javascript',
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
