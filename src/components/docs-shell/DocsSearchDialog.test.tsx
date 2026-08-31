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
import {
  type AlgoliaSearchStatus,
  createAlgoliaDocsClient,
} from '@/lib/search/algolia-client';
import { DocsSearchDialog } from './DocsSearchDialog';

const analyticsMocks = vi.hoisted(() => ({
  captureDocsSearchCompleted: vi.fn(),
  captureDocsSearchOpened: vi.fn(),
  captureDocsSearchResultClicked: vi.fn(),
  queueDocsPageView: vi.fn(),
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
    getLastStatus: vi.fn(() => ({
      api: 'not-requested' as const,
      docs: 'success' as const,
    })),
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

function successfulAlgoliaStatus() {
  return { api: 'not-requested' as const, docs: 'success' as const };
}

function renderAlgoliaSearchDialog() {
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
  return router;
}

const apiFallbackDocsResult = {
  content: 'Secure authentication with tokens',
  id: 'renew-token-guide',
  objectType: 'docs',
  path: ['Voice Calling', 'Develop'],
  snippet: 'Renew a token before it expires.',
  type: 'page' as const,
  url: '/en/video-calling/develop/authentication-workflow',
};

describe('DocsSearchDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
      getLastStatus: successfulAlgoliaStatus,
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

  it('groups SDK API results separately and opens their external links', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: successfulAlgoliaStatus,
      search: vi.fn().mockResolvedValue([
        {
          content: '<mark>uplinkNetworkQuality</mark>',
          id: 'api-property',
          objectType: 'sdk-api',
          path: ['API Reference', 'Video SDK', 'Web', '4.x'],
          platform: ['web'],
          snippet: 'The uplink network quality.',
          type: 'page',
          url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/NetworkQuality.html#uplinkNetworkQuality',
          version: '4.x',
        },
        {
          content: 'In-call quality monitoring',
          id: 'guide',
          objectType: 'docs',
          path: ['Video Calling', 'Develop'],
          type: 'page',
          url: '/en/video-calling/develop/in-call-quality',
        },
      ]),
    });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
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
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'networkquality' } },
    );

    expect(await screen.findByText('API Reference')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('4.x')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('uplinkNetworkQuality')[0]);

    expect(openSpy).toHaveBeenCalledWith(
      'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/NetworkQuality.html#uplinkNetworkQuality',
      '_blank',
      'noopener,noreferrer',
    );
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('keeps documentation results and warns when an API-intent search loses only SDK API results', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => ({ api: 'error', docs: 'success' }),
      search: vi.fn().mockResolvedValue([apiFallbackDocsResult]),
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'renew token' } },
    );

    expect(
      await screen.findAllByText('Secure authentication with tokens'),
    ).not.toHaveLength(0);
    const warning = await screen.findByRole('status');
    expect(warning).toHaveTextContent(
      'SDK API results are temporarily unavailable.',
    );
    expect(warning).toHaveAttribute('aria-live', 'polite');
    expect(warning.closest('[role="listbox"]')).toBeNull();
    expect(warning.closest('[cmdk-item]')).toBeNull();
  });

  it('clears the API warning and query when a result closes the dialog', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => ({ api: 'error', docs: 'success' }),
      search: vi.fn().mockResolvedValue([
        {
          ...apiFallbackDocsResult,
          url: '/en/voice/authentication',
        },
      ]),
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'renew token' } });
    await screen.findByRole('status');

    fireEvent.click(await screen.findByRole('option'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));

    expect(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
    ).toHaveValue('');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it.each([
    { apiStatus: 'not-requested' as const, query: 'cloud recording' },
    { apiStatus: 'not-requested' as const, query: 'voice agent quickstart' },
  ])(
    'does not show the SDK API warning for the natural-language query $query when API status is $apiStatus',
    async ({ apiStatus, query }) => {
      vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
      vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
      vi.mocked(createAlgoliaDocsClient).mockReturnValue({
        deps: ['mock-algolia'],
        getLastStatus: () => ({ api: apiStatus, docs: 'success' }),
        search: vi.fn().mockResolvedValue([apiFallbackDocsResult]),
      });
      renderAlgoliaSearchDialog();

      fireEvent.click(
        await screen.findByRole('button', { name: 'Search docs' }),
      );
      fireEvent.input(
        await screen.findByPlaceholderText('Search docs, APIs, guides...'),
        { target: { value: query } },
      );

      await screen.findAllByText('Secure authentication with tokens');
      expect(
        screen.queryByText('SDK API results are temporarily unavailable.'),
      ).toBeNull();
    },
  );

  it('warns when an unknown-intent API fallback request fails', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => ({ api: 'error', docs: 'success' }),
      search: vi.fn().mockResolvedValue([]),
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'RTC engine method' } },
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'SDK API results are temporarily unavailable.',
    );
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('clears the SDK API warning for the next query and an empty query', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    let status: AlgoliaSearchStatus = { api: 'error', docs: 'success' };
    const secondSearch = new Promise<never[]>(() => {});
    const search = vi
      .fn()
      .mockResolvedValueOnce([apiFallbackDocsResult])
      .mockReturnValueOnce(secondSearch);
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => status,
      search,
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'renew token' } });
    expect(
      await screen.findByText('SDK API results are temporarily unavailable.'),
    ).toBeInTheDocument();

    status = { api: 'not-requested', docs: 'success' };
    fireEvent.input(input, { target: { value: 'cloud recording' } });
    expect(
      screen.queryByText('SDK API results are temporarily unavailable.'),
    ).toBeNull();

    fireEvent.input(input, { target: { value: '' } });
    expect(
      screen.queryByText('SDK API results are temporarily unavailable.'),
    ).toBeNull();
  });

  it('does not restore an SDK API warning from a stale request or after closing', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    let status: AlgoliaSearchStatus = successfulAlgoliaStatus();
    let resolveApiSearch: ((value: never[]) => void) | undefined;
    let resolveTaskSearch: ((value: never[]) => void) | undefined;
    const search = vi.fn((query: string) => {
      return new Promise<never[]>((resolve) => {
        if (query === 'joinChannel') {
          resolveApiSearch = resolve;
        } else {
          resolveTaskSearch = resolve;
        }
      });
    });
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => status,
      search,
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    await waitFor(() => expect(search).toHaveBeenCalledOnce());
    fireEvent.input(input, { target: { value: 'cloud recording' } });
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2));

    await act(async () => {
      status = successfulAlgoliaStatus();
      resolveTaskSearch?.([apiFallbackDocsResult] as never[]);
    });
    await screen.findAllByText('Secure authentication with tokens');
    await act(async () => {
      status = { api: 'error', docs: 'success' };
      resolveApiSearch?.([apiFallbackDocsResult] as never[]);
    });
    expect(
      screen.queryByText('SDK API results are temporarily unavailable.'),
    ).toBeNull();

    fireEvent.input(input, { target: { value: 'joinChannel' } });
    await waitFor(() => expect(search).toHaveBeenCalledTimes(3));
    await act(async () => {
      status = { api: 'error', docs: 'success' };
      resolveApiSearch?.([apiFallbackDocsResult] as never[]);
    });
    expect(
      await screen.findByText('SDK API results are temporarily unavailable.'),
    ).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(
      screen.queryByText('SDK API results are temporarily unavailable.'),
    ).toBeNull();
  });

  it('renders one aggregated SDK API row with platform-aware navigation', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => ({ api: 'success', docs: 'success' }),
      search: vi.fn().mockResolvedValue([
        {
          content: '<mark>joinChannel</mark>',
          id: 'video-sdk:rtcengine:joinchannel:method',
          objectType: 'sdk-api',
          path: ['API Reference', 'Video SDK'],
          platform: ['android', 'ios', 'web', 'linux'],
          platformUrls: {
            android:
              'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#joinchannel',
            ios: 'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_irtcengine.html#joinchannel',
            linux:
              'https://api-ref.agora.io/en/video-sdk/linux/4.x/API/class_irtcengine.html#joinchannel',
            web: 'https://api-ref.agora.io/en/video-sdk/web/4.x/API/class_irtcengine.html#joinchannel',
          },
          type: 'page',
          url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#joinchannel',
        },
      ]),
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    fireEvent.input(
      await screen.findByPlaceholderText('Search docs, APIs, guides...'),
      { target: { value: 'joinChannel' } },
    );

    await screen.findAllByText('joinChannel');
    const platformSelector = screen.getByRole('combobox', {
      name: 'Choose platform',
    });
    expect(platformSelector).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'linux' })).toBeInTheDocument();
    fireEvent.keyDown(platformSelector, { key: 'Enter' });
    expect(openSpy).not.toHaveBeenCalled();
    fireEvent.change(platformSelector, {
      target: {
        value:
          'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_irtcengine.html#joinchannel',
      },
    });
    expect(screen.getByText('android')).toBeInTheDocument();
    expect(screen.getByText('ios')).toBeInTheDocument();
    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('joinChannel')[0]);
    expect(openSpy).toHaveBeenCalledWith(
      'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_irtcengine.html#joinchannel',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('resets an API row platform selection when the query changes', async () => {
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(createAlgoliaDocsClient).mockReturnValue({
      deps: ['mock-algolia'],
      getLastStatus: () => ({ api: 'success', docs: 'success' }),
      search: vi.fn().mockResolvedValue([
        {
          content: '<mark>joinChannel</mark>',
          id: 'join-channel',
          objectType: 'sdk-api',
          path: ['API Reference', 'Video SDK'],
          platform: ['android', 'ios'],
          platformUrls: {
            android: 'https://api-ref.agora.io/android/joinchannel',
            ios: 'https://api-ref.agora.io/ios/joinchannel',
          },
          type: 'page',
          url: 'https://api-ref.agora.io/android/joinchannel',
        },
      ]),
    });
    renderAlgoliaSearchDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Search docs' }));
    const input = await screen.findByPlaceholderText(
      'Search docs, APIs, guides...',
    );
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    const platformSelector = await screen.findByRole('combobox', {
      name: 'Choose platform',
    });
    fireEvent.change(platformSelector, {
      target: { value: 'https://api-ref.agora.io/ios/joinchannel' },
    });

    fireEvent.input(input, { target: { value: 'joinChannel method' } });
    fireEvent.click((await screen.findAllByText('joinChannel'))[0]);

    expect(openSpy).toHaveBeenCalledWith(
      'https://api-ref.agora.io/android/joinchannel',
      '_blank',
      'noopener,noreferrer',
    );
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
        getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
        apiReferenceIndexName: 'agora_APIRefSearch',
        appId: 'test-app',
        indexName: 'docs_portal_en',
        locale: 'en',
        platform: undefined,
        rankingV2: false,
        scope: undefined,
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
      getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
      getLastStatus: successfulAlgoliaStatus,
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
