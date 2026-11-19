import {
  createRootRoute,
  defaultStringifySearch,
} from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import { parseSearchPageState } from '@/lib/search/search-page-state';
import { getRouter } from './router';

vi.mock('@/lib/site-region', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/site-region')>()),
  DOCS_REGION: 'cn',
}));

vi.mock('./routeTree.gen', () => ({ routeTree: createRootRoute() }));

describe('Chinese router search query parsing', () => {
  it.each(['110', '-10005', '1e3', 'true', 'null', '{"code":110}'])(
    'preserves the original query %s on direct navigation',
    (query) => {
      const router = getRouter();
      const parsed = router.options.parseSearch?.(
        `?q=${encodeURIComponent(query)}&platform=flutter&page=2`,
      );
      expect(parseSearchPageState(parsed ?? {})).toMatchObject({
        q: query,
        platform: 'flutter',
        page: 2,
      });
    },
  );

  it('preserves links serialized by the router without adding query quotes', () => {
    const router = getRouter();
    const parsed = router.options.parseSearch?.(
      defaultStringifySearch({ q: '110', platform: 'flutter', page: 2 }),
    );
    expect(parseSearchPageState(parsed ?? {}).q).toBe('110');
  });
});
