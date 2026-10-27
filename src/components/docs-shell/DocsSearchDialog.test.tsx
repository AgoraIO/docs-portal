import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { RECENTLY_VIEWED_STORAGE_KEY } from '@/lib/recently-viewed';
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { createCnDocsSearchClient } from '@/lib/search/cn-search-client';
import { DocsSearchDialog } from './DocsSearchDialog';

vi.mock('@/lib/search/algolia-client', () => ({
  createAlgoliaDocsClient: vi.fn(() => ({
    deps: ['mock-algolia'],
    search: vi.fn(),
  })),
}));

vi.mock('@/lib/search/cn-search-client', () => ({
  createCnDocsSearchClient: vi.fn(() => ({
    deps: ['mock-meilisearch'],
    search: vi.fn(),
  })),
}));

vi.mock('@/lib/search/cn-search-page', async (original) => ({
  ...(await original<typeof import('@/lib/search/cn-search-page')>()),
  loadCnSearchCatalog: vi.fn().mockResolvedValue({}),
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
    window.localStorage.clear();
    window.sessionStorage.clear();
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
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
          <DocsSearchDialog loadPages={loadPages} mode="mobile" />
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

    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'quick' } },
    );
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
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

    // Results only appear once there's a query. 'ai' matches the Quick Start
    // page (its url contains /ai/).
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'ai' } },
    );
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
          <DocsSearchDialog loadPages={loadPagesSpy} mode="desktop" />
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
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

  it('explains that page search is unavailable when lazy page loading fails', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const loadPagesFailure = vi.fn().mockRejectedValue(new Error('not found'));
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPagesFailure} mode="desktop" />
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

    // The page index failed to load; typing a query surfaces the unavailable
    // message rather than a "no matches" message or a crash.
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'anything' } },
    );
    expect(
      await screen.findByText('Search index unavailable.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No matching pages found.')).toBeNull();
    await waitFor(() => expect(loadPagesFailure).toHaveBeenCalledOnce());
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
                group: 'Realtime Media',
                id: 'product:voice',
                label: 'Voice Calling',
                scope: { field: 'product', value: 'voice' },
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

    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.click(
      await screen.findByRole('combobox', { name: 'All products' }),
    );
    fireEvent.click(await screen.findByText('Voice Calling'));

    await waitFor(() => {
      expect(createAlgoliaDocsClient).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: { field: 'product', value: 'voice' },
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
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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

  it('does not flash the empty message when an in-flight request is superseded by a newer one', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    // Hand out a controllable promise per search call so we can leave the first
    // request in flight while the second fires, then resolve the (superseded)
    // first one — the exact race that flips fumadocs' isLoading off early.
    const deferreds: Array<(value: never[]) => void> = [];
    const search = vi.fn(
      () =>
        new Promise<never[]>((resolve) => {
          deferreds.push(resolve);
        }),
    );
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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

    // First query fires after the debounce and stays in flight.
    fireEvent.input(input, { target: { value: 'sta' } });
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
    // Second query fires while the first is still pending.
    fireEvent.input(input, { target: { value: 'star' } });
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));

    // Resolve the superseded first request (its result is discarded, but its
    // finally() flips fumadocs' isLoading off). The second is still pending, so
    // we must stay in the loading state — no empty message.
    await act(async () => {
      deferreds[0]([]);
    });
    expect(screen.queryByText('No matching pages found.')).toBeNull();
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();

    // Once the latest request settles empty, the message is correct.
    await act(async () => {
      deferreds[1]([]);
    });
    expect(
      await screen.findByText('No matching pages found.'),
    ).toBeInTheDocument();
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
          <DocsSearchDialog loadPages={loadPages} mode="mobile" />
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

  it('shows recently-viewed pages under a Recent heading on open, and hides them once a query is typed', async () => {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([
        { title: 'Authentication', url: '/en/ai/authentication' },
      ]),
    );
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

    // On open (no query): the Recent heading + the seeded page, no prompt.
    expect(await screen.findByText('Recent')).toBeInTheDocument();
    expect(screen.getAllByText('Authentication').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.queryByTestId('search-prompt')).toBeNull();

    // Typing replaces the recent list with search results.
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'quick' } },
    );
    await waitFor(() => expect(screen.queryByText('Recent')).toBeNull());
  });

  it('keeps Chinese recent-page details hidden before a query', async () => {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([
        {
          description: '最近文档摘要',
          title: '最近文档',
          url: '/zh-CN/ai/recent-page',
        },
      ]),
    );
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} locale="zh-CN" />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(await screen.findByText('最近文档')).toBeInTheDocument();
    expect(screen.queryByTestId('search-active-detail')).toBeNull();
  });

  it('resets the query on close so reopening does not show the previous no-results message', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

    // Type a query with no matches → the empty message shows.
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'zzzznomatch' } });
    expect(
      await screen.findByText('No matching pages found.'),
    ).toBeInTheDocument();

    // Close, then reopen: the stale query and its message must be gone.
    fireEvent.keyDown(document.body, { key: 'Escape' });
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText('Search docs, APIs, guides...'),
      ).toBeNull(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Search docs' }));

    const reopenedInput = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    expect((reopenedInput as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('No matching pages found.')).toBeNull();
  });

  it('shows a prompt (not fake results) on open when there is no history', async () => {
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

    // No history and nothing typed: the prompt shows; there's no Recent heading.
    expect(await screen.findByTestId('search-prompt')).toBeInTheDocument();
    expect(screen.queryByText('Recent')).toBeNull();
    // cmdk's empty slot must NOT render in the prompt state — its padding would
    // sit above the prompt and throw off its vertical balance.
    expect(document.querySelector('[data-slot="command-empty"]')).toBeNull();
  });

  it('cascades the recent list on first open, then drops the enter animation once the user types', async () => {
    // Seed a recently-viewed page so the empty state has something to cascade.
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([
        {
          description: 'Recent page summary',
          title: 'Recent Page',
          url: '/en/ai/recent-page',
        },
      ]),
    );
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} mode="desktop" />
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

    // First open: the recent row cascades in with the enter animation class.
    // ('Recent Page' also appears in the beside detail panel, so scope to the
    // actual command item.)
    const rowFor = async (text: string) => {
      const matches = await screen.findAllByText(text);
      const row = matches
        .map((el) => el.closest('[data-slot="command-item"]'))
        .find(Boolean);
      if (!row) {
        throw new Error(`expected a "${text}" command item`);
      }
      return row;
    };
    expect((await rowFor('Recent Page')).className).toContain(
      'search-result-enter',
    );
    expect(await screen.findByTestId('search-active-detail')).toHaveTextContent(
      'Recent page summary',
    );

    // Typing disarms the stagger, so results render instantly — no cascade on
    // every keystroke.
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'quick' } },
    );
    await waitFor(async () => {
      expect((await rowFor('Quick Start')).className).not.toContain(
        'search-result-enter',
      );
    });
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
          <DocsSearchDialog loadPages={loadPages} locale="en" mode="desktop" />
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

  it('uses the search API for CN and navigates to the matched section anchor', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: ['mock-meilisearch'],
      search: vi.fn().mockResolvedValue([
        {
          content: '<mark>manualSOS</mark>',
          id: 'manual-sos',
          objectType: 'docs',
          path: ['Conversational AI API', 'manualSOS'],
          platform: ['web'],
          product: 'conversational-ai',
          version: '2.9.0',
          snippet: '手动触发 <mark>SOS</mark>。',
          title: '<mark>manualSOS</mark>',
          type: 'page',
          url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
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
            loadPages={vi.fn().mockRejectedValue(new Error('not needed'))}
            locale="zh-CN"
            mode="desktop"
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );

    expect(createCnDocsSearchClient).toHaveBeenCalled();
    const manualSosLabels = await screen.findAllByText('manualSOS');
    expect(manualSosLabels.length).toBeGreaterThan(0);
    expect(screen.queryByText('2.9.0')).not.toBeInTheDocument();
    expect(screen.getAllByText('对话式 AI 引擎').length).toBeGreaterThan(0);
    fireEvent.click(manualSosLabels[0]);
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
        }),
      );
    });
  });

  it('does not silently load the Orama page index when the CN search API is unavailable', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: [],
      search: vi.fn().mockRejectedValue(new Error('503')),
    });
    const loadPagesSpy = vi.fn().mockResolvedValue(loadPages());
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPagesSpy}
            locale="zh-CN"
            mode="desktop"
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );

    expect(
      (await screen.findAllByText('搜索索引不可用。')).length,
    ).toBeGreaterThan(0);
    expect(loadPagesSpy).not.toHaveBeenCalled();
  });

  it.each([0, 1])(
    'closes CN search and restores focus to trigger %s without clearing its query',
    async (triggerIndex) => {
      const router = renderCnSearch(vi.fn().mockResolvedValue([]), true);
      render(<RouterProvider router={router} />);
      const triggers = await screen.findAllByRole('button', {
        name: '搜索文档',
      });
      const trigger = triggers[triggerIndex];
      fireEvent.click(trigger);
      fireEvent.input(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
        { target: { value: 'RTMP' } },
      );
      fireEvent.click(screen.getByRole('button', { name: '关闭' }));
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(trigger);
      expect(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
      ).toHaveValue('RTMP');
    },
  );

  it.each(['metaKey', 'ctrlKey'] as const)(
    'returns to the previously focused element after cancelling a %s shortcut search',
    async (modifier) => {
      const router = renderCnSearch(vi.fn().mockResolvedValue([]));
      render(
        <>
          <input aria-label="文档中的输入框" />
          <RouterProvider router={router} />
        </>,
      );
      await screen.findByRole('button', { name: '搜索文档' });
      const previous = screen.getByRole('textbox', { name: '文档中的输入框' });
      previous.focus();
      fireEvent.keyDown(document, { key: 'k', [modifier]: true });
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.keyDown(input, { key: 'Escape' });
      await waitFor(() => expect(previous).toHaveFocus());
    },
  );

  it.each(['result', 'full search'])(
    'does not restore the old trigger focus when navigating to %s',
    async (destination) => {
      const router = renderCnSearch(
        vi.fn().mockResolvedValue([
          {
            id: 'gateway',
            title: 'RTMP 网关',
            content: 'RTMP 网关',
            type: 'page',
            url: '/zh-CN/realtime-media/rtmp-gateway',
          },
        ]),
      );
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      const trigger = await screen.findByRole('button', { name: '搜索文档' });
      fireEvent.click(trigger);
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.input(input, { target: { value: 'RTMP' } });
      const result = await screen.findByRole('option', { name: /RTMP 网关/ });
      const focus = vi.spyOn(trigger, 'focus');
      fireEvent.click(
        destination === 'result'
          ? result
          : screen.getByRole('button', { name: '查看全部搜索结果' }),
      );
      await waitFor(() => expect(navigate).toHaveBeenCalled());
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      // Radix restores focus after the content unmounts.
      await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
      expect(focus).not.toHaveBeenCalled();
    },
  );

  it('keeps CN search text and published platform choices when reopening', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部平台' }));
    for (const name of ['小程序', 'C++', 'C#', 'Java', 'Swift']) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('option', { name: 'C++' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'Token' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
    expect(screen.getByRole('combobox', { name: /C\+\+/ })).toBeInTheDocument();
  });

  it.each([false, true])(
    'submits CN Enter to full search regardless of whether results have arrived (%s)',
    async (ready) => {
      const result = {
        id: 'join',
        title: 'joinChannel',
        content: 'joinChannel',
        type: 'page' as const,
        url: '/zh-CN/api-reference/rtc/android/channel#joinchannel-12',
      };
      const search = ready
        ? vi.fn().mockResolvedValue([result])
        : vi.fn().mockImplementation(() => new Promise(() => {}));
      const router = renderCnSearch(search);
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.input(input, { target: { value: 'joinChannel' } });
      await waitFor(() => expect(search).toHaveBeenCalled());
      if (ready) await screen.findAllByText('joinChannel');
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({
            href: '/zh-CN/search?q=joinChannel',
          }),
        ),
      );
    },
  );

  it('opens an explicitly keyboard-selected CN result and preserves its overload anchor', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'join',
          title: 'joinChannel [2/2]',
          content: 'joinChannel [2/2]',
          type: 'page',
          url: '/zh-CN/api-reference/rtc/android/channel#joinchannel-22',
        },
      ]),
    );
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    await screen.findAllByText('joinChannel [2/2]');
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: /joinChannel/ }),
      ).not.toHaveAttribute('aria-disabled', 'true'),
    );
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/api-reference/rtc/android/channel#joinchannel-22',
        }),
      ),
    );
  });

  it('keeps an IME confirmation Enter from navigating', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'certificate',
          title: '管理鉴权方式',
          content: '主要证书',
          type: 'page',
          url: '/zh-CN/introduction/user-guides/manage-authentication',
        },
      ]),
    );
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: '主要证书' } });
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: '主要证书' });
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: /管理鉴权方式/ }),
      ).not.toHaveAttribute('aria-disabled', 'true'),
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          href: '/zh-CN/search?q=%E4%B8%BB%E8%A6%81%E8%AF%81%E4%B9%A6',
        }),
      ),
    );
  });

  it.each(['docs', 'api', 'faq'] as const)(
    'groups CN matches and opens all %s results with the selected filters',
    async (family) => {
      const router = renderCnSearch(
        vi.fn().mockResolvedValue([
          {
            id: 'api',
            title: 'API match',
            content: 'API match',
            type: 'page',
            url: '/api-reference/rtc/android/method#api',
            snippet: 'API summary',
            familyTotalHits: 39,
          },
          {
            id: 'guide',
            title: 'Guide match',
            content: 'Guide match',
            type: 'page',
            url: '/realtime-media/rtc/guide/android#guide',
            snippet: 'Guide summary',
            familyTotalHits: 7,
          },
          {
            id: 'faq',
            title: 'FAQ match',
            content: 'FAQ match',
            type: 'page',
            url: '/reference/faq/integration/set_log_file#native',
            snippet: 'FAQ summary',
            familyTotalHits: 1,
          },
        ]),
      );
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
      fireEvent.input(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
        { target: { value: 'getNtpWallTimeInMs' } },
      );
      await screen.findByRole('option', { name: /Guide match/ });
      fireEvent.click(screen.getByRole('combobox', { name: '全部产品' }));
      fireEvent.click(await screen.findByRole('option', { name: '实时互动' }));
      await screen.findByRole('combobox', { name: /实时互动/ });
      await waitFor(() =>
        expect(
          screen.queryByPlaceholderText('筛选产品…'),
        ).not.toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
      fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
      await screen.findByRole('combobox', { name: /Android/ });
      const docs = await screen.findByRole('group', { name: '技术文档' });
      expect(
        screen.queryByRole('button', { name: '完整搜索' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Close' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
      const api = screen.getByRole('group', { name: 'API Reference' });
      const faq = screen.getByRole('group', { name: 'FAQ' });
      expect(within(docs).getByText('共 7 条结果')).toBeInTheDocument();
      expect(within(api).getByText('共 39 条结果')).toBeInTheDocument();
      expect(within(docs).getByText('Guide summary')).toBeInTheDocument();
      expect(within(api).getByText('API summary')).toBeInTheDocument();
      expect(within(faq).getByText('FAQ summary')).toBeInTheDocument();
      expect(screen.getAllByRole('option').map((e) => e.textContent)).toEqual([
        expect.stringContaining('Guide match'),
        expect.stringContaining('API match'),
        expect.stringContaining('FAQ match'),
      ]);
      expect(screen.queryByTestId('search-active-detail')).toBeInTheDocument();
      const action = screen.getByRole('button', {
        name:
          family === 'docs'
            ? '查看全部技术文档'
            : family === 'api'
              ? '查看全部API Reference'
              : '查看全部FAQ',
      });
      expect(fireEvent.keyDown(action, { key: 'Enter' })).toBe(true);
      expect(fireEvent.keyDown(action, { key: ' ' })).toBe(true);
      fireEvent.click(action);
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({
            href: `/zh-CN/search?q=getNtpWallTimeInMs&product=rtc&platform=android&type=${family}`,
          }),
        ),
      );
    },
  );

  it('updates the CN floating preview from mouse and keyboard selection and removes it on close', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'first',
          title: '返回值 A',
          content: '返回值 A',
          type: 'page',
          url: '/api-reference/rtc/flutter/screen#first',
          snippet: '返回 <mark>ScreenCaptureSourceInfo</mark> 数组。',
        },
        {
          id: 'second',
          title: '返回值 B',
          content: '返回值 B',
          type: 'page',
          url: '/api-reference/rtc/electron/screen#second',
          snippet: 'Electron 屏幕来源说明。',
        },
      ]),
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'ScreenCaptureSourceInfo' } });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        '返回 ScreenCaptureSourceInfo 数组。',
      ),
    );
    fireEvent.pointerMove(screen.getByRole('option', { name: /返回值 B/ }), {
      pointerType: 'mouse',
    });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Electron 屏幕来源说明。',
      ),
    );
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        '返回 ScreenCaptureSourceInfo 数组。',
      ),
    );
    expect(
      screen.getByTestId('search-active-detail').querySelector('mark'),
    ).toHaveClass('search-page-mark');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByTestId('search-active-detail'),
    ).not.toBeInTheDocument();
  });

  it('keeps the empty document family visible when only API results match', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'api-only',
          title: 'manualSOS',
          content: 'manualSOS',
          type: 'page',
          url: '/api-reference/rtc/android/method#manualsos',
          familyTotalHits: 9,
        },
      ]),
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );
    const docs = await screen.findByRole('group', { name: '技术文档' });
    expect(within(docs).getByText('共 0 条结果')).toBeInTheDocument();
    expect(within(docs).getByText('暂无相关技术文档')).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'API Reference' })).getAllByRole(
        'option',
      ),
    ).toHaveLength(1);
    expect(document.querySelector('[cmdk-empty]')).toBeNull();
  });

  it('starts an unfiltered search on another document and restores the source search on return', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(() => router.navigate({ href: '/zh-CN/realtime-media/rtm' }));
    expect(
      screen.queryByRole('link', { name: '完整搜索' }),
    ).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', { name: '全部平台' }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(() => router.navigate({ href: '/zh-CN/realtime-media/flutter' }));
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('joinChannel');
    expect(
      screen.getByRole('combobox', { name: /Android/ }),
    ).toBeInTheDocument();
  });

  it('restores the document search after the full search route unmounts the dialog', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'Token' } });
    fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
    fireEvent.click(screen.getByRole('button', { name: '查看全部搜索结果' }));
    await screen.findByText('Full search route');
    await act(() => {
      router.history.back();
    });
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
    expect(
      screen.getByRole('combobox', { name: /Android/ }),
    ).toBeInTheDocument();
  });

  it('shares the current document search between mobile and desktop triggers', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]), true);
    render(<RouterProvider router={router} />);
    const triggers = await screen.findAllByRole('button', { name: '搜索文档' });
    fireEvent.click(triggers[1]);
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'Token' } },
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(triggers[0]);
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
  });

  it('filters CN quick search by HarmonyOS and carries the query and scope into full search', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: [],
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
            locale="zh-CN"
            mode="desktop"
            productScopes={[
              {
                id: 'rtc',
                label: '实时互动',
                scope: { field: 'product', value: 'rtc' },
              },
            ]}
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部产品' }));
    fireEvent.click(await screen.findByRole('option', { name: '实时互动' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'HarmonyOS' }));
    expect(createCnDocsSearchClient).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'harmonyos' }),
    );
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'Token' } },
    );
    expect(
      screen.queryByRole('radio', { name: 'AI 问答' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看全部搜索结果' }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          href: '/zh-CN/search?q=Token&product=rtc&platform=harmonyos',
        }),
      ),
    );
  });
});

function renderCnSearch(
  search: ReturnType<typeof createCnDocsSearchClient>['search'],
  dual = false,
) {
  vi.mocked(createCnDocsSearchClient).mockReturnValue({ deps: [], search });
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => (
      <AppProviders>
        <DocsSearchDialog loadPages={loadPages} locale="zh-CN" />
        {dual ? (
          <DocsSearchDialog
            loadPages={loadPages}
            locale="zh-CN"
            mode="mobile"
          />
        ) : null}
      </AppProviders>
    ),
  });
  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/search',
    component: () => <div>Full search route</div>,
  });
  return createRouter({
    routeTree: rootRoute.addChildren([docsRoute, searchRoute]),
    history: createMemoryHistory({
      initialEntries: ['/zh-CN/realtime-media/flutter'],
    }),
  });
}
