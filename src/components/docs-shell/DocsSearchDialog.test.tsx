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
  it('renders compact trigger variants and lets the mobile trigger navigate through the same dialog', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            mode="desktop"
            pages={[
              {
                description: 'Start here',
                title: 'Quick Start',
                url: '/en/ai/get-started/quickstart',
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
          <DocsSearchDialog
            mode="mobile"
            pages={[
              {
                description: 'Start here',
                title: 'Quick Start',
                url: '/en/ai/get-started/quickstart',
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
        initialEntries: ['/en/introduction/about-agora'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);

    const triggerButtons = await screen.findAllByRole('button', {
      name: 'Search docs',
    });
    const desktopButton = triggerButtons.find((button) =>
      button.textContent?.includes('Search docs'),
    );
    const mobileButton = triggerButtons.find(
      (button) => button !== desktopButton,
    );

    expect(desktopButton).toBeDefined();
    expect(mobileButton).toBeDefined();
    if (!desktopButton || !mobileButton) {
      throw new Error('expected both desktop and mobile search triggers');
    }
    expect(desktopButton).toHaveTextContent('Search docs');
    expect(mobileButton).not.toHaveTextContent('Search docs');

    fireEvent.click(mobileButton);

    expect(
      await screen.findByPlaceholderText('Search pages...'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Quick Start'));

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/ai/get-started/quickstart',
        }),
      );
    });
  });

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
            mode="desktop"
            pages={[
              {
                description: 'Start here',
                title: 'Quick Start',
                url: '/en/ai/get-started/quickstart',
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
        initialEntries: ['/en/introduction/about-agora'],
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
          to: '/en/ai/get-started/quickstart',
        }),
      );
    });
  });
});
