import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { DocsSearchDialog } from './DocsSearchDialog';

describe('DocsSearchDialog', () => {
  it('opens, renders search results, and navigates through the router', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            pages={[
              {
                description: 'Start here',
                title: 'Quick Start',
                url: '/en/ai/quick-start',
              },
            ]}
            tabs={[
              {
                description: 'AI docs',
                id: 'ai',
                title: 'AI',
                url: '/en/ai',
              },
            ]}
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/introduction/index'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));

    expect(
      await screen.findByPlaceholderText('Search pages...'),
    ).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Quick Start')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Quick Start'));

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/ai/quick-start',
        }),
      );
    });
  });
});
