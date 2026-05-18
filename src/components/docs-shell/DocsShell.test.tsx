import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { DocsShell } from './DocsShell';

const tabs: TabSummary[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    url: '/en/introduction',
  },
  {
    id: 'ai',
    title: 'AI',
    url: '/en/ai',
  },
];

const sidebar: DocsSidebarNode[] = [
  {
    id: 'intro',
    title: 'Introduction',
    type: 'page',
    url: '/en/introduction',
  },
  {
    children: [
      {
        id: 'quick-start',
        title: 'Quick Start',
        type: 'page',
        url: '/en/introduction/quick-start',
      },
    ],
    collapsible: false,
    title: 'Guides',
    type: 'section',
    id: 'guides-section',
  },
];

type DocsShellProps = ComponentProps<typeof DocsShell>;

function renderDocsShell(
  overrides: Partial<DocsShellProps> = {},
  initialEntry = '/en/introduction/about-agora',
) {
  const props: DocsShellProps = {
    activePath: '/en/introduction',
    activeTab: 'introduction',
    children: <article>Body</article>,
    locale: 'en',
    next: undefined,
    pages: [
      {
        title: 'Quick Start',
        url: '/en/introduction/quick-start',
      },
    ],
    previous: undefined,
    sidebar,
    tabs,
    toc: [
      {
        depth: 2,
        title: 'Overview',
        url: '#overview',
      },
    ],
    ...overrides,
  };

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => (
      <AppProviders>
        <DocsShell {...props} />
      </AppProviders>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  return render(<RouterProvider router={router} />);
}

function renderWithRouter(children: ReactNode, initialEntry = '/en/introduction/about-agora') {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => <AppProviders>{children}</AppProviders>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  return render(<RouterProvider router={router} />);
}

describe('DocsShell', () => {
  afterEach(async () => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('renders a separate desktop header row and docs tabs strip', async () => {
    renderDocsShell();

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();

    const mainHeaderRow = screen.getByTestId('docs-main-header-row');
    const docsTabsStrip = screen.getByTestId('docs-tabs-strip');
    const desktopSearch = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Search docs',
      })
      .find((button) => button.textContent?.includes('Search docs'));
    const languageControl = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Language',
      })
      .find((button) => button.textContent?.includes('English'));
    const themeControl = within(mainHeaderRow).getByRole('button', {
      name: 'Theme: Light',
    });
    const tabsIntroductionLink = within(docsTabsStrip).getByRole('tab', {
      name: 'Introduction',
    });
    const tabsAiLink = within(docsTabsStrip).getByRole('tab', {
      name: 'AI',
    });

    expect(desktopSearch).toBeDefined();
    if (!desktopSearch) {
      throw new Error('expected desktop search trigger in main header row');
    }
    expect(languageControl).toBeDefined();
    if (!languageControl) {
      throw new Error('expected desktop language trigger in main header row');
    }
    expect(mainHeaderRow).toContainElement(desktopSearch);
    expect(mainHeaderRow).toContainElement(languageControl);
    expect(mainHeaderRow).toContainElement(themeControl);
    expect(mainHeaderRow).not.toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsAiLink);
    expect(mainHeaderRow).not.toContainElement(docsTabsStrip);
    expect(themeControl).toHaveAttribute('aria-label', 'Theme: Light');
    expect(themeControl).toHaveAttribute('aria-pressed', 'false');
    expect(themeControl.querySelector('span:not(.sr-only)')).toBeNull();
    expect(languageControl).toHaveTextContent('English');
    expect(tabsIntroductionLink).toHaveAttribute('href', '/en/introduction');
    expect(tabsAiLink).toHaveAttribute('href', '/en/ai');

    expect(
      screen.getByRole('link', { name: 'Quick Start' }),
    ).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('renders the desktop docs body shell regions and keeps pagination inside the main column', async () => {
    renderDocsShell({
      next: { title: 'Next Page', url: '/en/introduction/next-page' },
      previous: { title: 'Previous Page', url: '/en/introduction/prev-page' },
    });

    expect(await screen.findByTestId('docs-body-shell')).toBeInTheDocument();
    expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('docs-main-column')).toBeInTheDocument();
    expect(screen.getByTestId('docs-toc-rail')).toBeInTheDocument();
    expect(screen.queryByTestId('docs-shell-footer')).not.toBeInTheDocument();

    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    expect(
      within(mainColumn).getByRole('link', { name: /Next Next Page/i }),
    ).toBeInTheDocument();
    expect(
      within(mainColumn).getByRole('link', { name: /Previous Previous Page/i }),
    ).toBeInTheDocument();
  });

  it('resets desktop sidebar scroll position when the active tab changes', async () => {
    function ShellWithTabSwitcher() {
      const [activeTab, setActiveTab] = useState<'introduction' | 'ai'>(
        'introduction',
      );

      return (
        <>
          <button onClick={() => setActiveTab('ai')} type="button">
            Switch tab
          </button>
          <DocsShell
            activePath="/en/introduction"
            activeTab={activeTab}
            locale="en"
            pages={[
              {
                title: 'Quick Start',
                url: '/en/introduction/quick-start',
              },
            ]}
            sidebar={
              activeTab === 'introduction'
                ? sidebar
                : [
                    {
                      id: 'ai-intro',
                      title: 'AI Intro',
                      type: 'page' as const,
                      url: '/en/ai/quick-start',
                    },
                  ]
            }
            tabs={tabs}
            toc={[]}
          >
            <article>Body</article>
          </DocsShell>
        </>
      );
    }

    renderWithRouter(<ShellWithTabSwitcher />);

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();

    const sidebarScroll = screen.getByTestId('docs-sidebar-scroll');
    sidebarScroll.scrollTop = 180;

    fireEvent.click(screen.getByRole('button', { name: 'Switch tab' }));

    await waitFor(() => {
      expect(sidebarScroll.scrollTop).toBe(0);
    });
  });

  it('switches locale while preserving the current tab and slug path', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsShell
            activePath="/en/ai/quick-start"
            activeTab="ai"
            locale="en"
            pages={[]}
            sidebar={[]}
            tabs={tabs}
            toc={[]}
          >
            <article>Body</article>
          </DocsShell>
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/ai/quick-start'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);

    const languageButton = (await screen.findAllByRole('button', {
      name: 'Language',
    })).find((button) => button.textContent?.includes('English'));

    if (!languageButton) {
      throw new Error('expected desktop language button');
    }

    fireEvent.click(languageButton);
    fireEvent.click(await screen.findByRole('button', { name: '简体中文' }));

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/ai/quick-start',
        }),
      );
    });
    await waitFor(() => {
      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN');
    });
  });

  it('keeps compact mobile header controls and exposes locale and theme in the sheet', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsShell
            activePath="/en/introduction"
            activeTab="introduction"
            locale="en"
            pages={[
              {
                title: 'Quick Start',
                url: '/en/introduction/quick-start',
              },
            ]}
            sidebar={sidebar}
            tabs={tabs}
            toc={[]}
          >
            <article>Body</article>
          </DocsShell>
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

    const mainHeaderRow = await screen.findByTestId('docs-main-header-row');
    const mobileHeaderActions = within(mainHeaderRow).getByTestId(
      'docs-mobile-header-actions',
    );
    const desktopHeaderActions = within(mainHeaderRow).getByTestId(
      'docs-desktop-header-actions',
    );
    const menuButton = within(mainHeaderRow).getByRole('button', {
      name: 'Open navigation',
    });
    const mobileSearchButton = within(mobileHeaderActions).getByRole('button', {
      name: 'Search docs',
    });
    const desktopSearchButton = within(desktopHeaderActions).getByRole(
      'button',
      {
        name: 'Search docs',
      },
    );

    expect(menuButton).toBeInTheDocument();
    expect(mobileSearchButton).toBeInTheDocument();
    expect(mobileSearchButton).not.toHaveTextContent('Search docs');
    expect(
      within(mobileHeaderActions).queryByRole('button', { name: 'Language' }),
    ).toBeNull();
    expect(
      within(mobileHeaderActions).queryByRole('button', { name: 'Theme: Light' }),
    ).toBeNull();
    expect(desktopSearchButton).toHaveTextContent('Search docs');

    fireEvent.click(menuButton);

    const mobileSheet = await screen.findByRole('dialog');

    expect(
      within(mobileSheet).getByRole('tab', { name: 'Introduction' }),
    ).toBeInTheDocument();
    expect(
      within(mobileSheet).getByRole('link', { name: 'Quick Start' }),
    ).toBeInTheDocument();
    expect(
      within(mobileSheet).getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(
      within(mobileSheet).getByRole('button', { name: 'Theme: Light' }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(mobileSheet).getByRole('tab', { name: 'Introduction' }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('keeps mobile docs content in normal page flow instead of a nested scroll viewport', async () => {
    renderDocsShell();

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();

    const mobileFlow = screen.getByTestId('docs-main-mobile-flow');
    const mobileScrollViewport = mobileFlow.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );

    expect(mobileScrollViewport).toBeNull();
    expect(within(mobileFlow).getByText('Body')).toBeInTheDocument();
  });

  it('renders the split docs body shell regions and keeps pagination in the main column', async () => {
    renderDocsShell({
      children: <article>Body copy</article>,
      next: {
        title: 'Advanced Setup',
        url: '/en/introduction/advanced-setup',
      },
      previous: {
        title: 'Overview',
        url: '/en/introduction/overview',
      },
    });

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();

    const bodyShell = screen.getByTestId('docs-body-shell');
    const sidebarRegion = screen.getByTestId('docs-sidebar');
    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const tocRail = screen.getByTestId('docs-toc-rail');

    expect(bodyShell).toBeInTheDocument();
    expect(sidebarRegion).toBeInTheDocument();
    expect(sidebarRegion).toHaveClass('hidden', 'lg:flex');
    expect(mainColumn).toBeInTheDocument();
    expect(within(mainColumn).getByText('Body copy')).toBeInTheDocument();
    expect(
      within(mainColumn).getByRole('link', { name: /Previous Overview/i }),
    ).toBeInTheDocument();
    expect(
      within(mainColumn).getByRole('link', { name: /Next Advanced Setup/i }),
    ).toBeInTheDocument();
    expect(tocRail).toBeInTheDocument();
    expect(tocRail).toHaveClass('hidden', 'xl:block');
    expect(within(tocRail).getByText('On this page')).toBeInTheDocument();
  });
});
