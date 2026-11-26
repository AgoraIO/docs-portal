import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCnPublicRouteRewrite } from '@/lib/cn-public-routing';
import { NotFound } from './not-found';

vi.mock('@/lib/i18n/i18n-config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/i18n/i18n-config')>()),
  DEFAULT_LOCALE: 'zh-CN',
}));

const captureDocsPageNotFoundMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsPageNotFound: captureDocsPageNotFoundMock,
}));

describe('NotFound locale', () => {
  it.each(['/missing-page', '/zh-CN/missing-page'])(
    'shows a Chinese error and a Chinese home link for %s',
    async (pathname) => {
      const router = createRouter({
        routeTree: createRootRoute({ component: NotFound }),
        history: createMemoryHistory({ initialEntries: [pathname] }),
        rewrite: getCnPublicRouteRewrite('cn'),
      });
      render(<RouterProvider router={router} />);
      expect(
        await screen.findByRole('heading', { name: '页面未找到' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          '你访问的页面不存在或已被移除，请检查链接或返回文档首页。',
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute(
        'href',
        '/introduction',
      );
    },
  );

  it('keeps English routes in English with an English home link', async () => {
    const router = createRouter({
      routeTree: createRootRoute({ component: NotFound }),
      history: createMemoryHistory({ initialEntries: ['/en/missing-page'] }),
    });
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole('heading', { name: 'The page left the map.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
      'href',
      '/en/introduction',
    );
  });
});

describe('NotFound analytics', () => {
  beforeEach(() => {
    captureDocsPageNotFoundMock.mockClear();
  });

  it('captures the current pathname when the router renders its not-found page', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const router = createRouter({
      defaultNotFoundComponent: NotFound,
      history: createMemoryHistory({
        initialEntries: ['/en/legacy/missing-page'],
      }),
      routeTree: rootRoute,
    });

    render(<RouterProvider router={router} />);

    await screen.findByText('The page left the map.');
    await waitFor(() => {
      expect(captureDocsPageNotFoundMock).toHaveBeenCalledWith({
        pathname: '/en/legacy/missing-page',
      });
    });
  });
});
