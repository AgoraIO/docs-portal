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
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { RECENTLY_VIEWED_STORAGE_KEY } from '@/lib/recently-viewed';
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { DocsSearchDialog } from './DocsSearchDialog';

const analyticsMocks = vi.hoisted(() => ({
  captureDocsSearchCompleted: vi.fn(),
  captureDocsSearchOpened: vi.fn(),
  captureDocsSearchResultClicked: vi.fn(),
}));
const oramaClientMocks = vi.hoisted(() => ({
  actualCreate: undefined as
    | typeof import('@/lib/search/orama-client').createOramaDocsClient
    | undefined,
  create:
    vi.fn<typeof import('@/lib/search/orama-client').createOramaDocsClient>(),
}));

vi.mock('@/lib/analytics/posthog', () => ({
  ...analyticsMocks,
  initializePostHog: vi.fn(),
}));

vi.mock('@/lib/search/algolia-client', () => ({
  createAlgoliaDocsClient: vi.fn(() => ({
    deps: ['mock-algolia'],
    search: vi.fn(),
  })),
}));

vi.mock('@/lib/search/orama-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/search/orama-client')>();
  oramaClientMocks.actualCreate = actual.createOramaDocsClient;
  oramaClientMocks.create.mockImplementation(actual.createOramaDocsClient);
  return {
    ...actual,
    createOramaDocsClient: oramaClientMocks.create,
  };
});

const loadPages = async () => [
  {
    description: 'Start here',
    title: 'Quick Start',
    url: '/en/ai/get-started/quickstart',
  },
];

function createDeferredSearch() {
  const resolvers: Array<(value: never[]) => void> = [];
  const search = vi.fn(
    () =>
      new Promise<never[]>((resolve) => {
        resolvers.push(resolve);
      }),
  );

  return { resolvers, search };
}

describe('DocsSearchDialog', () => {
  beforeEach(() => {
    analyticsMocks.captureDocsSearchCompleted.mockReset();
    analyticsMocks.captureDocsSearchOpened.mockReset();
    analyticsMocks.captureDocsSearchResultClicked.mockReset();
    if (oramaClientMocks.actualCreate) {
      oramaClientMocks.create.mockReset();
      oramaClientMocks.create.mockImplementation(oramaClientMocks.actualCreate);
    }
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_ALGOLIA_APP_ID', '');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', '');
    window.localStorage.clear();
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

    expect(analyticsMocks.captureDocsSearchOpened).toHaveBeenCalledWith({
      locale: 'en',
      mode: 'desktop',
      trigger: 'button',
    });
    await waitFor(() => {
      expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledWith({
        locale: 'en',
        platformFilter: null,
        productScope: null,
        provider: 'local',
        queryLength: 2,
        resultCount: 1,
        status: 'success',
      });
    });

    fireEvent.click(screen.getByText('Quick Start'));

    expect(analyticsMocks.captureDocsSearchResultClicked).toHaveBeenCalledWith({
      href: '/en/ai/get-started/quickstart',
      locale: 'en',
      queryLength: 2,
      rank: 1,
    });

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
    const resolveLocalSearch: Array<(value: never[]) => void> = [];
    const localSearch = vi.fn<(query: string) => Promise<never[]>>(
      () =>
        new Promise<never[]>((resolve) => {
          resolveLocalSearch.push(resolve);
        }),
    );
    oramaClientMocks.create.mockReturnValue({
      deps: ['delayed-local'],
      search: localSearch,
    });
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    let rejectLoadPages: ((reason?: unknown) => void) | undefined;
    const loadPagesFailure = vi.fn(
      () =>
        new Promise<never[]>((_, reject) => {
          rejectLoadPages = reject;
        }),
    );
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
      { target: { value: 'any' } },
    );
    await waitFor(() => expect(localSearch).toHaveBeenCalledOnce());
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'anything' } },
    );
    await waitFor(() => {
      expect(analyticsMocks.captureDocsSearchCompleted).not.toHaveBeenCalled();
      expect(localSearch).toHaveBeenCalledTimes(2);
    });
    await act(async () => {
      rejectLoadPages?.(new Error('not found'));
    });
    expect(
      await screen.findAllByText('Search index unavailable.'),
    ).not.toHaveLength(0);
    expect(screen.queryByText('No matching pages found.')).toBeNull();
    await waitFor(() => expect(loadPagesFailure).toHaveBeenCalledOnce());
    await act(async () => {
      resolveLocalSearch[1]?.([]);
    });
    await waitFor(() => {
      expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledOnce();
    });
    expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledWith({
      locale: 'en',
      platformFilter: null,
      productScope: null,
      provider: 'local',
      queryLength: 8,
      status: 'error',
    });
    await act(async () => {
      resolveLocalSearch[0]?.([]);
    });
    expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledOnce();
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

  it.each([
    {
      filterKind: 'product',
      filterName: 'All products',
      optionName: 'Voice Calling',
      platformFilter: null,
      productScope: 'product:voice',
    },
    {
      filterKind: 'platform',
      filterName: 'All platforms',
      optionName: 'Android',
      platformFilter: 'android',
      productScope: null,
    },
  ])(
    'does not report an in-flight Algolia request after the $filterKind filter changes',
    async ({
      filterKind,
      filterName,
      optionName,
      platformFilter,
      productScope,
    }) => {
      vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
      vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
      const { resolvers, search } = createDeferredSearch();
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
              productScopes={
                filterKind === 'product'
                  ? [
                      {
                        description: 'Real-time voice.',
                        group: 'Realtime Media',
                        id: 'product:voice',
                        label: 'Voice Calling',
                        scope: { field: 'product', value: 'voice' },
                      },
                    ]
                  : []
              }
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
      fireEvent.click(
        await screen.findByRole('button', { name: 'Search docs' }),
      );
      fireEvent.input(
        await screen.findByPlaceholderText('Search docs, APIs, guides...'),
        { target: { value: 'vad' } },
      );
      await waitFor(() => expect(search).toHaveBeenCalledTimes(1));

      fireEvent.click(
        await screen.findByRole('combobox', { name: filterName }),
      );
      const filterOption = await screen.findByText(optionName);
      await act(async () => {
        filterOption.click();
        expect(search).toHaveBeenCalledTimes(1);
        resolvers[0]([]);
      });
      expect(analyticsMocks.captureDocsSearchCompleted).not.toHaveBeenCalled();

      await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
      await act(async () => {
        resolvers[1]([]);
      });
      await waitFor(() => {
        expect(
          analyticsMocks.captureDocsSearchCompleted,
        ).toHaveBeenCalledOnce();
      });
      expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledWith({
        locale: 'en',
        platformFilter,
        productScope,
        provider: 'algolia',
        queryLength: 3,
        resultCount: 0,
        status: 'success',
      });
    },
  );

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
    const { resolvers, search } = createDeferredSearch();
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
    expect(analyticsMocks.captureDocsSearchCompleted).not.toHaveBeenCalled();
    // Second query fires while the first is still pending.
    fireEvent.input(input, { target: { value: 'star' } });
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
    expect(analyticsMocks.captureDocsSearchCompleted).not.toHaveBeenCalled();

    // Resolve the superseded first request (its result is discarded, but its
    // finally() flips fumadocs' isLoading off). The second is still pending, so
    // we must stay in the loading state — no empty message.
    await act(async () => {
      resolvers[0]([]);
    });
    expect(screen.queryByText('No matching pages found.')).toBeNull();
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    expect(analyticsMocks.captureDocsSearchCompleted).not.toHaveBeenCalled();

    // Once the latest request settles empty, the message is correct.
    await act(async () => {
      resolvers[1]([]);
    });
    expect(
      await screen.findByText('No matching pages found.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledOnce();
    });
    expect(analyticsMocks.captureDocsSearchCompleted).toHaveBeenCalledWith({
      locale: 'en',
      platformFilter: null,
      productScope: null,
      provider: 'algolia',
      queryLength: 4,
      resultCount: 0,
      status: 'success',
    });
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
      JSON.stringify([{ title: 'Recent Page', url: '/en/ai/recent-page' }]),
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
});
