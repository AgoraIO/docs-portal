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
    // 'AI' can appear in both the tab list row and the beside detail panel title.
    expect(screen.getAllByText('AI').length).toBeGreaterThanOrEqual(1);
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
    // 'AI' can appear in both the tab list row and the beside detail panel title.
    expect(screen.getAllByText('AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Search index unavailable.')).toBeInTheDocument();
    expect(screen.queryByText('No matching pages found.')).toBeNull();

    fireEvent.click(screen.getAllByText('AI')[0]);

    await waitFor(() => {
      expect(loadPagesFailure).toHaveBeenCalledOnce();
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/en/ai',
        }),
      );
    });
  });

  it('scopes the Algolia query to a product when a product filter is chosen', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            productScopes={[
              {
                description: 'Real-time voice.',
                filter: 'product:"voice"',
                group: 'Realtime Media',
                id: 'product:voice',
                label: 'Voice Calling',
              },
            ]}
            tabs={[]}
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

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.click(
      await screen.findByRole('combobox', { name: 'All products' }),
    );
    fireEvent.click(await screen.findByText('Voice Calling'));

    await waitFor(() => {
      expect(createAlgoliaDocsClient).toHaveBeenCalledWith(
        expect.objectContaining({ scopeFilter: 'product:"voice"' }),
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

    // 2 result rows + 1 title in the beside detail panel (happy-dom innerWidth=1024)
    expect(await screen.findAllByText('Voice Activity Detection')).toHaveLength(
      3,
    );
    expect(screen.getByText('android')).toBeInTheDocument();
    expect(screen.getByText('ios')).toBeInTheDocument();
    expect(screen.getAllByText('Realtime Media › Voice')).toHaveLength(2);
    expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
      'Enable VAD on Android.',
    );
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

  it('shows a keyboard-hint bar while the dialog is open', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
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
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));

    const hints = await screen.findByTestId('search-keyboard-hints');
    expect(hints).toHaveTextContent('navigate');
    expect(hints).toHaveTextContent('select');
    expect(hints).toHaveTextContent('close');
  });

  it('shows animated skeleton rows while a search is in flight', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn(() => new Promise<never>(() => {})),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'vad' } },
    );

    expect(await screen.findByTestId('search-loading')).toBeInTheDocument();
    expect(screen.queryByText('Searching...')).toBeNull();
  });

  it('updates the footer detail as the highlighted result changes', async () => {
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
          snippet: 'Enable <mark>VAD</mark> on Android.',
          type: 'page',
          url: '/en/voice/vad#android',
        },
        {
          content: 'Voice Activity Detection',
          id: 'ios-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['ios'],
          product: 'voice',
          snippet: 'Enable <mark>VAD</mark> on iOS.',
          type: 'page',
          url: '/en/voice/vad#ios',
        },
      ]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'vad' } });

    await screen.findAllByText('Voice Activity Detection');
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Enable VAD on Android.',
      ),
    );

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Enable VAD on iOS.',
      ),
    );
  });

  it('does not show the empty state before anything is searched', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    await screen.findByPlaceholderText('Search docs, APIs, guides...');

    // No query typed yet → the "no matching pages" message must not appear.
    expect(screen.queryByText('No matching pages found.')).toBeNull();
  });

  it('shows the empty message once a query resolves with no results', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'zzzznomatch' } },
    );

    expect(
      await screen.findByText('No matching pages found.'),
    ).toBeInTheDocument();
  });

  it('opens only one dialog on ⌘K even when a mobile instance is also mounted', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" tabs={[]} />
          <DocsSearchDialog loadPages={loadPages} mode="mobile" tabs={[]} />
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
    await screen.findAllByRole('button', { name: 'Search docs' });
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await screen.findByPlaceholderText('Search docs, APIs, guides...');
    // Both instances register no listener except the desktop one, so exactly
    // one dialog opens — not two overlapping ones.
    expect(
      screen.getAllByPlaceholderText('Search docs, APIs, guides...'),
    ).toHaveLength(1);
  });

  it('renders the ↗ external pill and sets the aria-label for external results', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search: vi.fn().mockResolvedValue([
        {
          content: 'Android SDK Reference',
          id: 'ext-android',
          objectType: 'external',
          path: ['Voice & Video'],
          title: 'Android',
          url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
        },
      ]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'android' } },
    );

    // The ↗ external pill must appear in the result row.
    expect(await screen.findByText('↗ external')).toBeInTheDocument();
    // The CommandItem must carry the accessible label for screen readers.
    expect(
      screen.getByRole('option', { name: 'Android (opens in new tab)' }),
    ).toBeInTheDocument();
  });

  it('does not overlay the loading skeleton on top of existing results', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    // First query resolves with a result; the next query never resolves, so the
    // dialog stays "busy" while the previous result is still on screen.
    const search = vi
      .fn()
      .mockResolvedValueOnce([
        {
          content: 'Voice Activity Detection',
          id: 'android-vad',
          objectType: 'docs',
          path: ['Realtime Media', 'Voice'],
          platform: ['android'],
          product: 'voice',
          snippet: 'Enable <mark>VAD</mark> on Android.',
          type: 'page',
          url: '/en/voice/vad#android',
        },
      ])
      .mockReturnValue(new Promise<never>(() => {}));
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      search,
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="en"
            mode="desktop"
            tabs={[]}
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

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'vad' } });
    // Title shows in the result row (and the beside detail panel), so >= 1.
    await screen.findAllByText('Voice Activity Detection');

    // Type again → the second query is in flight, but the previous result stays
    // and the skeleton must NOT appear alongside it.
    fireEvent.input(input, { target: { value: 'vadx' } });
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
    expect(screen.queryByTestId('search-loading')).toBeNull();
    expect(
      screen.getAllByText('Voice Activity Detection').length,
    ).toBeGreaterThan(0);
  });
});
