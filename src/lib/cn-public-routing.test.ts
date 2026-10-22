import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { getCnPublicRouteRewrite } from './cn-public-routing';

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

  it('loads search directly and keeps all search state during navigation', async () => {
    const router = fixture('/search?q=Token&platform=ios&type=all&page=2');
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
  });

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
    expect(rewrite?.input?.({ url })?.toString() ?? url.toString()).toBe(
      url.toString(),
    );
  });

  it('keeps the global router unchanged', () => {
    expect(getCnPublicRouteRewrite('global')).toBeUndefined();
  });
});
