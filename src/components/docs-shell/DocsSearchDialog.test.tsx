import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { DocsSearchDialog } from './DocsSearchDialog';

vi.mock('@/lib/search/algolia-client', () => ({
  createAlgoliaDocsClient: vi.fn(() => ({
    deps: ['mock-algolia'],
    search: vi.fn(),
  })),
}));

const loadPages = async () => [
  {
    description: 'Start here',
    title: 'Quick Start',
    url: '/en/ai/get-started/quickstart',
  },
];

describe('DocsSearchDialog', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_ALGOLIA_APP_ID', '');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', '');
  });

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
            loadPages={loadPages}
            mode="desktop"
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
            loadPages={loadPages}
            mode="mobile"
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
      button.textContent?.includes('Search docs, APIs, guides...'),
    );
    const mobileButton = triggerButtons.find(
      (button) => button !== desktopButton,
    );

    expect(desktopButton).toBeDefined();
    expect(mobileButton).toBeDefined();
    if (!desktopButton || !mobileButton) {
      throw new Error('expected both desktop and mobile search triggers');
    }
    expect(desktopButton).toHaveTextContent('Search docs, APIs, guides...');
    expect(mobileButton).not.toHaveTextContent('Search docs');

    fireEvent.click(mobileButton);

    expect(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByText('Quick Start'));

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
            loadPages={loadPages}
            mode="desktop"
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
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(await screen.findByText('Quick Start')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Quick Start'));

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/ai/get-started/quickstart',
        }),
      );
    });
  });

  it('opens from the command-k keyboard shortcut', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const loadPagesSpy = vi.fn(loadPages);
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPagesSpy} mode="desktop" tabs={[]} />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('button', { name: 'Search docs' });
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(loadPagesSpy).toHaveBeenCalledOnce();
    });
  });

  it('also opens from the control-k keyboard shortcut', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" tabs={[]} />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);

    await screen.findByRole('button', { name: 'Search docs' });
    fireEvent.keyDown(document, { ctrlKey: true, key: 'k' });

    expect(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toBeInTheDocument();
  });

  it('keeps tabs usable and explains that page search is unavailable when lazy page loading fails', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const loadPagesFailure = vi.fn().mockRejectedValue(new Error('not found'));
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPagesFailure}
            mode="desktop"
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
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Search index unavailable.')).toBeInTheDocument();
    expect(screen.queryByText('No matching pages found.')).toBeNull();

    fireEvent.click(screen.getByText('AI'));

    await waitFor(() => {
      expect(loadPagesFailure).toHaveBeenCalledOnce();
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/ai',
        }),
      );
    });
  });

  it('uses Algolia search when configured and does not load the static page index', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([
        {
          content: 'Voice Activity Detection',
          id: 'android-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['android'],
          product: 'voice',
          section: 'Enable VAD',
          snippet: 'Enable <mark>VAD</mark> on Android.',
          type: 'page',
          url: '/en/voice/vad#enable-vad',
        },
        {
          content: 'Voice Activity Detection',
          id: 'ios-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['ios'],
          product: 'voice',
          section: 'Enable VAD',
          snippet: 'Enable <mark>VAD</mark> on iOS.',
          type: 'page',
          url: '/en/voice/vad#enable-vad-ios',
        },
      ]),
    });
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const loadPagesSpy = vi.fn(loadPages);
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPagesSpy}
            locale="en"
            mode="desktop"
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
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      {
        target: { value: 'vad' },
      },
    );

    expect(await screen.findAllByText('Voice Activity Detection')).toHaveLength(
      2,
    );
    expect(screen.getByText('android')).toBeInTheDocument();
    expect(screen.getByText('ios')).toBeInTheDocument();
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(2);
    fireEvent.click(screen.getAllByText('Voice Activity Detection')[0]);

    await waitFor(() => {
      expect(loadPagesSpy).not.toHaveBeenCalled();
      expect(createAlgoliaDocsClient).toHaveBeenCalledWith({
        appId: 'test-app',
        indexName: 'docs_portal_en',
        locale: 'en',
        platform: undefined,
        searchApiKey: 'test-search-key',
      });
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/voice/vad#enable-vad',
        }),
      );
    });
  });
});
