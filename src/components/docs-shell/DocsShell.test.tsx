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
import { type ComponentProps, type ReactNode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { DocsShell } from './DocsShell';

const tabs: TabSummary[] = [
  {
    icon: 'BookOpen',
    id: 'introduction',
    title: 'Introduction',
    url: '/en/introduction',
  },
  {
    icon: 'Zap',
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
    icon: 'BookOpen',
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
    localeLinks: [
      {
        href: '/en/introduction',
        isActive: true,
        locale: 'en',
      },
      {
        href: '/zh-CN/introduction',
        isActive: false,
        locale: 'zh-CN',
      },
    ],
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

function renderWithRouter(
  children: ReactNode,
  initialEntry = '/en/introduction/about-agora',
) {
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
    vi.useRealTimers();
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('renders a separate desktop header row and docs tabs strip', async () => {
    renderDocsShell();

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();

    const mainHeaderRow = screen.getByTestId('docs-main-header-row');
    const docsTabsStrip = screen.getByTestId('docs-tabs-strip');
    const docsBodyShell = screen.getByTestId('docs-body-shell');
    const docsSidebar = screen.getByTestId('docs-sidebar');
    const desktopSearch = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Search docs',
      })
      .find((button) =>
        button.textContent?.includes('Search docs, APIs, guides...'),
      );
    const languageControl = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Language',
      })
      .find((button) => button.textContent?.includes('English'));
    const themeControl = within(mainHeaderRow).getByRole('button', {
      name: 'Theme: Light',
    });
    const githubControl = within(mainHeaderRow).getByRole('link', {
      name: 'GitHub',
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
    expect(mainHeaderRow.querySelector('.docs-brand-mark')).toBeNull();
    expect(mainHeaderRow).not.toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsAiLink);
    expect(mainHeaderRow).not.toContainElement(docsTabsStrip);
    expect(docsTabsStrip).toHaveClass('hidden', 'md:block');
    expect(docsBodyShell).toHaveClass('grid');
    expect(docsBodyShell).toHaveClass('lg:grid-cols-[256px_minmax(0,1fr)]');
    expect(docsSidebar).toHaveStyle({
      '--sidebar-width': '16rem',
    });
    expect(themeControl).toHaveAttribute('aria-label', 'Theme: Light');
    expect(themeControl).toHaveAttribute('aria-pressed', 'false');
    expect(themeControl.querySelector('span:not(.sr-only)')).toBeNull();
    expect(themeControl.className).not.toContain('bg-card');
    expect(themeControl.className).not.toContain('hover:bg-transparent');
    expect(themeControl.className).toContain(
      'hover:bg-[color:var(--docs-soft-fill)]',
    );
    expect(themeControl.className).not.toContain('dark:hover:bg-transparent');
    expect(themeControl.className).toContain(
      'dark:hover:bg-[color:var(--docs-soft-fill)]',
    );
    expect(githubControl.className).not.toContain('bg-card');
    expect(githubControl.className).not.toContain('hover:bg-transparent');
    expect(githubControl.className).toContain(
      'hover:bg-[color:var(--docs-soft-fill)]',
    );
    expect(githubControl.className).not.toContain('dark:hover:bg-transparent');
    expect(githubControl.className).toContain(
      'dark:hover:bg-[color:var(--docs-soft-fill)]',
    );
    expect(languageControl).toHaveAttribute('data-variant', 'ghost');
    expect(languageControl.className).not.toContain(
      'border-[color:var(--line-strong)]',
    );
    expect(languageControl.className).not.toContain('bg-card');
    expect(languageControl.className).toContain(
      'hover:bg-[color:var(--docs-soft-fill)]',
    );
    expect(languageControl).toHaveTextContent('English');
    expect(tabsIntroductionLink).toHaveAttribute('href', '/en/introduction');
    expect(tabsAiLink).toHaveAttribute('href', '/en/ai');
    expect(tabsIntroductionLink.className).toContain('after:!bottom-[-3px]');
    expect(tabsIntroductionLink.className).toContain('after:h-0.5');

    expect(
      screen.getByRole('link', { name: 'Quick Start' }),
    ).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('keeps the top docs tabs available from the medium breakpoint upward', async () => {
    renderDocsShell();

    const docsTabsStrip = await screen.findByTestId('docs-tabs-strip');

    expect(docsTabsStrip).toHaveClass('hidden', 'md:block');
    expect(docsTabsStrip).not.toHaveClass('lg:block');
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

  it('uses the openapi layout with a dedicated side rail instead of the generic toc rail', async () => {
    renderDocsShell({
      layoutMode: 'openapi',
      sideRail: <div>Code &amp; Examples</div>,
    });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');

    expect(docsBodyShell).toHaveClass(
      'xl:grid-cols-[256px_minmax(0,1fr)_400px]',
    );
    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(screen.getByTestId('docs-side-rail')).toHaveTextContent(
      'Code & Examples',
    );
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('keeps desktop sidebar, content, and toc as independent scroll regions', async () => {
    renderDocsShell({
      next: { title: 'Next Page', url: '/en/introduction/next-page' },
      previous: { title: 'Previous Page', url: '/en/introduction/prev-page' },
    });

    expect(await screen.findByTestId('docs-body-shell')).toHaveClass(
      'lg:min-h-0',
      'lg:overflow-hidden',
    );
    expect(screen.getByTestId('docs-sidebar')).toHaveClass(
      'h-full',
      'min-h-0',
      'overflow-hidden',
    );
    expect(screen.getByTestId('docs-sidebar-scroll')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
    expect(screen.getByTestId('docs-main-column')).toHaveClass(
      'h-full',
      'min-h-0',
      'overflow-hidden',
    );
    expect(screen.getByTestId('docs-main-desktop-scroll')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
    expect(screen.getByTestId('docs-toc-rail')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
  });

  it('shows docs scrollbars transiently while a region is scrolling', async () => {
    renderDocsShell();

    const mainScrollRegion = await screen.findByTestId(
      'docs-main-desktop-scroll',
    );
    vi.useFakeTimers();

    expect(mainScrollRegion).not.toHaveClass('docs-scrollbar-visible');

    fireEvent.scroll(mainScrollRegion);

    expect(mainScrollRegion).toHaveClass('docs-scrollbar-visible');

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(mainScrollRegion).not.toHaveClass('docs-scrollbar-visible');
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
            localeLinks={[
              {
                href: '/en/introduction',
                isActive: true,
                locale: 'en',
              },
              {
                href: '/zh-CN/introduction',
                isActive: false,
                locale: 'zh-CN',
              },
            ]}
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
                      url: '/en/ai/get-started/quickstart',
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
      path: '/$locale/$tab/$',
      component: () => (
        <AppProviders>
          <DocsShell
            activePath="/en/ai/get-started/quickstart"
            activeTab="ai"
            localeLinks={[
              {
                href: '/en/ai/get-started/quickstart',
                isActive: true,
                locale: 'en',
              },
              {
                href: '/zh-CN/ai/get-started/quickstart',
                isActive: false,
                locale: 'zh-CN',
              },
            ]}
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
        initialEntries: ['/en/ai/get-started/quickstart'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);

    const languageButton = (
      await screen.findAllByRole('button', {
        name: 'Language',
      })
    ).find((button) => button.textContent?.includes('English'));

    if (!languageButton) {
      throw new Error('expected desktop language button');
    }

    fireEvent.click(languageButton);
    fireEvent.click(await screen.findByRole('link', { name: '简体中文' }));

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/ai/get-started/quickstart',
        }),
      );
    });
    await waitFor(() => {
      expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN');
    });
  });

  it('renders locale options as crawlable links for static discovery', async () => {
    renderDocsShell({
      activePath: '/en/ai/get-started/quickstart',
      activeTab: 'ai',
      localeLinks: [
        {
          href: '/en/ai/get-started/quickstart',
          isActive: true,
          locale: 'en',
        },
        {
          href: '/zh-CN/ai/get-started/quickstart',
          isActive: false,
          locale: 'zh-CN',
        },
      ],
    });

    fireEvent.click(
      (
        await screen.findAllByRole('button', {
          name: 'Language',
        })
      ).find((button) => button.textContent?.includes('English')) ??
        (() => {
          throw new Error('expected desktop language button');
        })(),
    );

    expect(
      await screen.findByRole('link', { name: '简体中文' }),
    ).toHaveAttribute('href', '/zh-CN/ai/get-started/quickstart');
  });

  it('keeps compact mobile header controls and exposes locale and theme in the sheet', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$',
      component: () => (
        <AppProviders>
          <DocsShell
            activePath="/en/introduction"
            activeTab="introduction"
            localeLinks={[
              {
                href: '/en/introduction',
                isActive: true,
                locale: 'en',
              },
              {
                href: '/zh-CN/introduction',
                isActive: false,
                locale: 'zh-CN',
              },
            ]}
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
    expect(screen.getByTestId('docs-tabs-strip')).toHaveClass(
      'hidden',
      'md:block',
    );
    expect(
      within(mobileHeaderActions).queryByRole('button', { name: 'Language' }),
    ).toBeNull();
    expect(
      within(mobileHeaderActions).queryByRole('button', {
        name: 'Theme: Light',
      }),
    ).toBeNull();
    expect(desktopSearchButton).toHaveTextContent(
      'Search docs, APIs, guides...',
    );

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
    expect(
      within(mobileSheet).getByRole('button', { name: 'Theme: Light' }),
    ).toHaveAttribute('data-variant', 'ghost');

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
