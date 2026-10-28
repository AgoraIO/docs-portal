import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { getCnPublicRouteRewrite } from './cn-public-routing';
import { createPlatformQueryIndex } from './platforms/query-route';

function fixture(entry: string, region: 'cn' | 'global' = 'cn') {
  const root = createRootRoute();
  const docs = createRoute({
    getParentRoute: () => root,
    path: '$locale/$tab/$',
  });
  const search = createRoute({
    getParentRoute: () => root,
    path: '$locale/search',
  });
  return createRouter({
    routeTree: root.addChildren([docs, search]),
    history: createMemoryHistory({ initialEntries: [entry] }),
    rewrite: getCnPublicRouteRewrite(region),
  });
}

describe('CN public route navigation', () => {
  it('normalizes query links before route matching and during SPA navigation', async () => {
    const canonicalPath = '/zh-CN/realtime-media/rtc/guide';
    const index = createPlatformQueryIndex(
      ['ios', 'android'].map((platform) => ({
        canonicalPath,
        platform,
        url: `${canonicalPath}/${platform}`,
      })),
    );
    const router = fixture(
      '/realtime-media/rtc/guide?platform=ios&from=legacy#details',
    );
    router.update({ rewrite: getCnPublicRouteRewrite('cn', index) });
    // Use a fresh history entry after installing the rewrite in this fixture.
    await router.navigate({
      href: '/realtime-media/rtc/guide?platform=ios&from=legacy#details',
    });
    expect(router.state.location.pathname).toBe(`${canonicalPath}/ios`);
    expect(router.state.location.search).toEqual({ from: 'legacy' });
    expect(router.state.location.hash).toBe('details');
    await router.navigate({
      to: '/$locale/$tab/$',
      params: { locale: 'zh-CN', tab: 'realtime-media', _splat: 'rtc/guide' },
      search: { platform: 'android', from: 'legacy' },
    });
    expect(router.state.location.pathname).toBe(`${canonicalPath}/android`);
    expect(
      new URL(router.state.location.publicHref, 'https://docs.example')
        .pathname,
    ).toBe('/realtime-media/rtc/guide/android');
  });

  it.each([
    '/solutions/iot-apaas/reference/restful',
    '/api-reference/iot-apaas/client-api/call',
    '/solutions/%69ot-apaas/reference/restful',
  ])(
    'keeps undiscoverable but published document %s routable',
    async (pathname) => {
      const router = fixture(`${pathname}?platform=web#overview`);
      await router.load();
      expect(router.state.matches.at(-1)?.params).toMatchObject({
        locale: 'zh-CN',
      });
      expect(router.state.location.search).toEqual({ platform: 'web' });
      expect(router.state.location.hash).toBe('overview');
    },
  );

  it('loads a public document through the existing Chinese route', async () => {
    const router = fixture('/ai/release-notes?platform=ios#release');
    await router.load();
    expect(router.state.matches.at(-1)?.params).toMatchObject({
      locale: 'zh-CN',
      tab: 'ai',
      _splat: 'release-notes',
    });
    expect(router.state.location.pathname).toBe('/zh-CN/ai/release-notes');
    expect(router.state.location.search).toEqual({ platform: 'ios' });
    expect(router.state.location.hash).toBe('release');
  });

  it.each(['/search', '/search/'])(
    'loads %s directly and keeps all search state during navigation',
    async (pathname) => {
      const router = fixture(
        `${pathname}?q=Token&platform=ios&type=all&page=2`,
      );
      await router.load();
      expect(router.state.matches.at(-1)?.routeId).toBe('/$locale/search');
      expect(router.state.location.search).toEqual({
        q: 'Token',
        platform: 'ios',
        type: 'all',
        page: 2,
      });
      const location = router.buildLocation({
        to: '/$locale/search',
        params: { locale: 'zh-CN' },
        search: { q: 'Token', platform: 'web', type: 'docs', page: 3 },
      });
      expect(new URL(location.publicHref, 'https://docs.local').pathname).toBe(
        '/search',
      );
      expect(
        new URL(location.publicHref, 'https://docs.local').searchParams.get(
          'page',
        ),
      ).toBe('3');
    },
  );

  it('builds public document links without changing platform or fragment', () => {
    const router = fixture('/zh-CN/ai/release-notes');
    const location = router.buildLocation({
      to: '/$locale/$tab/$',
      params: {
        locale: 'zh-CN',
        tab: 'realtime-media',
        _splat: 'rtc/token/ios',
      },
      hash: '生成-token',
    });
    expect(new URL(location.publicHref, 'https://docs.local').pathname).toBe(
      '/realtime-media/rtc/token/ios',
    );
    expect(
      decodeURIComponent(
        new URL(location.publicHref, 'https://docs.local').hash,
      ),
    ).toBe('#生成-token');
  });

  it.each([
    '/api/search',
    '/assets/app.js',
    '/__static/docs.json',
    '/en/ai',
    '/missing/page',
  ])('leaves non-document path %s unchanged', (pathname) => {
    const rewrite = getCnPublicRouteRewrite('cn');
    const url = new URL(pathname, 'https://docs.local');
    const original = url.toString();
    expect(rewrite?.input?.({ url })?.toString() ?? url.toString()).toBe(
      original,
    );
  });

  it('keeps the global router unchanged', () => {
    expect(getCnPublicRouteRewrite('global')).toBeUndefined();
  });
});
