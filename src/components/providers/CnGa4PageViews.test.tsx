import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { captureCnGa4PageView } from '@/lib/analytics/cn-ga4';
import { AppProviders } from './AppProviders';

vi.mock('@/lib/analytics/cn-ga4', () => ({
  cnGa4Enabled: true,
  captureCnGa4PageView: vi.fn(),
}));

it('reports the rendered public path on first load, navigation and Back', async () => {
  const rootRoute = createRootRoute({
    component: () => (
      <AppProviders>
        <Outlet />
      </AppProviders>
    ),
  });
  const page = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$slug',
    component: () => <main>Document</main>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/intro?q=private'] }),
  });
  render(<RouterProvider router={router} />);
  await waitFor(() =>
    expect(captureCnGa4PageView).toHaveBeenCalledWith('/intro'),
  );
  act(() => router.history.push('/about#section'));
  await waitFor(() =>
    expect(captureCnGa4PageView).toHaveBeenCalledWith('/about'),
  );
  act(() => router.history.back());
  await waitFor(() =>
    expect(vi.mocked(captureCnGa4PageView).mock.calls).toEqual([
      ['/intro'],
      ['/about'],
      ['/intro'],
    ]),
  );
});
