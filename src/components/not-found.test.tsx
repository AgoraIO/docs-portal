import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const captureDocsPageNotFoundMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsPageNotFound: captureDocsPageNotFoundMock,
}));

import { NotFound } from './not-found';

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
