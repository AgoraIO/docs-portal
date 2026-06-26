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

const loadSearchPages = async () => [
  {
    title: 'Quick Start',
    url: '/en/introduction/quick-start',
  },
];

function renderDocsShell(
  overrides: Partial<DocsShellProps> = {},
  initialEntry = '/en/introduction/about-agora',
) {
  const props: DocsShellProps = {
    activePath: '/en/introduction',
    activeTab: 'introduction',
    children: <article>Body</article>,
    loadPages: loadSearchPages,
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
    const docsTabsRow = docsTabsStrip.firstElementChild;
    const docsBodyShell = screen.getByTestId('docs-body-shell');
    const docsSidebar = screen.getByTestId('docs-sidebar');
    const desktopSearch = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Search docs',
      })
      .find((button) =>
        button.textContent?.includes('Search docs, APIs, guides...'),
      );
    const siteControl = within(mainHeaderRow)
      .getAllByRole('button', {
        name: 'Site',
      })
      .find((button) => button.textContent?.includes('International site'));
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
    expect(siteControl).toBeDefined();
    if (!siteControl) {
      throw new Error('expected desktop site trigger in main header row');
    }
    expect(mainHeaderRow).toContainElement(desktopSearch);
    expect(mainHeaderRow).toContainElement(siteControl);
    expect(mainHeaderRow).toContainElement(themeControl);
    expect(mainHeaderRow.querySelector('.docs-brand-mark')).toBeNull();
    expect(mainHeaderRow).not.toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsIntroductionLink);
    expect(docsTabsStrip).toContainElement(tabsAiLink);
    expect(mainHeaderRow).not.toContainElement(docsTabsStrip);
    expect(docsTabsStrip).toHaveClass('hidden', 'md:block');
    expect(mainHeaderRow).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsTabsRow).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass('grid');
    expect(docsBodyShell).toHaveClass('lg:grid-cols-[256px_minmax(0,1fr)]');
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass(
      'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
    );
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
    expect(siteControl).toHaveAttribute('data-variant', 'ghost');
    expect(siteControl.className).not.toContain(
      'border-[color:var(--line-strong)]',
    );
    expect(siteControl.className).not.toContain('bg-card');
    expect(siteControl.className).toContain('hover:bg-accent');
    expect(siteControl.className).toContain('data-[state=open]:bg-accent');
    expect(siteControl).toHaveTextContent('International site');
    expect(tabsIntroductionLink).toHaveAttribute('href', '/en/introduction');
    expect(tabsAiLink).toHaveAttribute('href', '/en/ai');
    expect(tabsIntroductionLink.className).toContain('after:!bottom-[-3px]');
    expect(tabsIntroductionLink.className).toContain('after:h-0.5');

    expect(
      screen.getByRole('link', { name: 'Quick Start' }),
    ).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('renders scoped version selectors in desktop and mobile sidebars for non-tab scopes', async () => {
    renderDocsShell({
      activePath: '/en/api-reference/rtc/android/overview',
      activeTab: 'api-reference',
      sidebarHeader: {
        backHref: '/en/api-reference/rtc',
        backLabel: 'RTC',
        title: 'Android API Reference',
        versionSwitcher: {
          currentId: 'current',
          versions: [
            {
              href: '/en/api-reference/rtc/android/overview',
              id: 'current',
              label: 'v4.6.2',
            },
            {
              href: '/en/api-reference/rtc/android/4.6.0/overview',
              id: '4.6.0',
              label: 'v4.6.0',
            },
          ],
        },
      },
    });

    const desktopSidebar = await screen.findByTestId('docs-sidebar');

    expect(desktopSidebar).toHaveTextContent('Android API Reference');
    expect(
      within(desktopSidebar).getByRole('button', {
        name: 'Select documentation version',
      }),
    ).toHaveTextContent('v4.6.2');

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));

    const mobileDialog = await screen.findByRole('dialog');

    expect(mobileDialog).toHaveTextContent('Android API Reference');
    expect(
      within(mobileDialog).getByRole('button', {
        name: 'Select documentation version',
      }),
    ).toHaveTextContent('v4.6.2');
  });

  it('uses the route locale for shell chrome before i18n bootstrap changes global language', async () => {
    await i18n.changeLanguage('en');

    renderDocsShell(
      {
        activePath: '/zh-CN/api-reference/rtc/android/overview',
        activeTab: 'api-reference',
        children: <article>正文</article>,
        locale: 'zh-CN',
        localeLinks: [
          {
            href: '/en/api-reference/rtc/android/overview',
            isActive: false,
            locale: 'en',
          },
          {
            href: '/zh-CN/api-reference/rtc/android/overview',
            isActive: true,
            locale: 'zh-CN',
          },
        ],
        loadPages: async () => [],
        sidebar,
        tabs,
        toc: [],
      },
      '/zh-CN/api-reference/overview',
    );

    expect(
      await screen.findByRole('button', { name: '打开导航' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '搜索文档' })).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: '主题: 浅色' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open navigation' }),
    ).toBeNull();
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

    const docsBodyShell = await screen.findByTestId('docs-body-shell');

    expect(docsBodyShell).toBeInTheDocument();
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass(
      'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
    );
    expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('docs-main-column')).toBeInTheDocument();
    const tocRail = screen.getByTestId('docs-toc-rail');
    expect(tocRail).toBeInTheDocument();
    expect(screen.queryByTestId('docs-page-actions')).not.toBeInTheDocument();
    expect(
      within(tocRail).queryByRole('button', { name: 'Copy Page' }),
    ).not.toBeInTheDocument();

    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const siteFooter = within(mainColumn).getByTestId('docs-site-footer');
    expect(
      within(mainColumn).getByRole('link', { name: /Next Next Page/i }),
    ).toBeInTheDocument();
    expect(
      within(mainColumn).getByRole('link', { name: /Previous Previous Page/i }),
    ).toBeInTheDocument();
    expect(mainColumn).toContainElement(siteFooter);
    expect(docsBodyShell).toContainElement(siteFooter);
  });

  it('renders the Agora site footer as a full-width break-out in the main scroll region', async () => {
    renderDocsShell();

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const pageFooter = within(mainColumn).getByTestId('docs-page-footer');
    const siteFooter = within(mainColumn).getByTestId('docs-site-footer');
    const footerContent = within(siteFooter).getByTestId(
      'docs-site-footer-content',
    );

    expect(docsBodyShell.getAttribute('style')).toContain(
      '--docs-site-footer-width',
    );
    expect(docsBodyShell.getAttribute('style')).toContain(
      '--docs-site-footer-offset',
    );
    expect(mainColumn).toContainElement(siteFooter);
    expect(pageFooter).not.toContainElement(siteFooter);
    expect(siteFooter).toHaveClass(
      'w-screen',
      '-ml-8',
      'border-t',
      'lg:w-[var(--docs-site-footer-width)]',
    );
    expect(siteFooter).toHaveStyle({
      marginLeft: 'calc(-1 * var(--docs-site-footer-offset))',
    });
    expect(footerContent).toHaveClass('mx-auto', 'px-0');

    expect(
      within(siteFooter).getByRole('link', { name: 'LinkedIn' }),
    ).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/agora-lab-inc/',
    );
    expect(within(siteFooter).getByRole('link', { name: 'X' })).toHaveAttribute(
      'href',
      'https://x.com/AgoraIO',
    );
    expect(
      within(siteFooter).getByRole('link', { name: 'YouTube' }),
    ).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UCjPZukasIgWoB4HBHga5CGA',
    );
    expect(
      within(siteFooter).getByRole('link', { name: 'GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/AgoraIO-Community');

    expect(within(siteFooter).getByText('Contact Us')).toBeInTheDocument();
    expect(
      within(siteFooter).getByText('+1 (408) 879-5885'),
    ).toBeInTheDocument();
    expect(
      within(siteFooter).getByText('2804 Mission College Blvd.'),
    ).toBeInTheDocument();
    expect(
      within(siteFooter).getByText('Santa Clara, CA, USA 95054'),
    ).toBeInTheDocument();
    expect(
      within(siteFooter).getByRole('link', { name: 'Agora Advantage' }),
    ).toHaveAttribute(
      'href',
      'https://www.agora.io/en/the-agora-platform-advantage/',
    );
    expect(
      within(siteFooter).getByRole('link', { name: 'Investor Relations' }),
    ).toHaveAttribute('href', 'https://investor.agora.io/');
    expect(
      within(siteFooter).getByRole('link', { name: 'Documentation' }),
    ).toHaveAttribute('href', 'https://docs.agora.io/en/');
    expect(
      within(siteFooter).getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', 'https://www.agora.io/en/privacy-policy/');
    expect(
      within(siteFooter).getByRole('link', { name: 'Manage My Cookies' }),
    ).toHaveAttribute('href', '#');
    expect(
      within(siteFooter).getByRole('img', { name: 'Agora' }),
    ).toBeInTheDocument();
    expect(
      within(siteFooter).getByText('Copyright © 2026 Agora'),
    ).toBeInTheDocument();
    expect(
      within(siteFooter).getByText('All rights reserved'),
    ).toBeInTheDocument();
  });

  it('keeps the shell footer responsive on mobile', async () => {
    renderDocsShell();

    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const siteFooter = within(mobileFlow).getByTestId('docs-site-footer');
    const navGrid = within(siteFooter).getByText('Contact Us').closest('.grid');
    const copyrightRow = within(siteFooter)
      .getByText('Copyright © 2026 Agora')
      .closest('div');

    expect(navGrid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-4',
    );
    expect(copyrightRow).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('uses the openapi layout without the generic toc rail', async () => {
    renderDocsShell({
      layoutMode: 'openapi',
    });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainHeaderRow = screen.getByTestId('docs-main-header-row');
    const docsTabsStrip = screen.getByTestId('docs-tabs-strip');

    expect(mainHeaderRow).toHaveClass('max-w-[1440px]');
    expect(docsTabsStrip.firstElementChild).toHaveClass('max-w-[1440px]');
    expect(docsBodyShell).toHaveClass('max-w-[1440px]');
    expect(docsBodyShell).toHaveClass('xl:grid-cols-[256px_minmax(0,1fr)]');
    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(screen.queryByTestId('docs-page-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('docs-side-rail')).not.toBeInTheDocument();
    for (const footer of screen.getAllByTestId('docs-page-footer')) {
      expect(footer).toHaveClass('max-w-none');
      expect(footer).not.toHaveClass('max-w-[var(--content-max)]');
    }
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('uses the full-page layout without the generic toc rail', async () => {
    renderDocsShell({
      layoutMode: 'full-page',
    });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');

    expect(docsBodyShell).toHaveClass('max-w-[1440px]');
    expect(docsBodyShell).toHaveClass('xl:grid-cols-[256px_minmax(0,1fr)]');
    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    for (const footer of screen.getAllByTestId('docs-page-footer')) {
      expect(footer).toHaveClass('max-w-none');
      expect(footer).not.toHaveClass('max-w-[var(--content-max)]');
    }
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
            loadPages={loadSearchPages}
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

  it('resets desktop main-column scroll position when the active path changes', async () => {
    function ShellWithPathSwitcher() {
      const [activePath, setActivePath] = useState(
        '/en/introduction/about-agora',
      );

      return (
        <>
          <button
            onClick={() => setActivePath('/en/introduction/quick-start')}
            type="button"
          >
            Switch page
          </button>
          <DocsShell
            activePath={activePath}
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
            loadPages={loadSearchPages}
            sidebar={sidebar}
            tabs={tabs}
            toc={[]}
          >
            <article>{activePath}</article>
          </DocsShell>
        </>
      );
    }

    const windowScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });

    renderWithRouter(<ShellWithPathSwitcher />);

    const mainScroll = await screen.findByTestId('docs-main-desktop-scroll');
    mainScroll.scrollTop = 180;

    fireEvent.click(screen.getByRole('button', { name: 'Switch page' }));

    await waitFor(() => {
      expect(mainScroll.scrollTop).toBe(0);
    });
    expect(windowScrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 0,
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
            loadPages={async () => []}
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

    const siteButton = (
      await screen.findAllByRole('button', {
        name: 'Site',
      })
    ).find((button) => button.textContent?.includes('International site'));

    if (!siteButton) {
      throw new Error('expected desktop site button');
    }

    fireEvent.pointerDown(siteButton, { button: 0 });
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'China site' }),
    );

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

    fireEvent.pointerDown(
      (
        await screen.findAllByRole('button', {
          name: 'Site',
        })
      ).find((button) => button.textContent?.includes('International site')) ??
        (() => {
          throw new Error('expected desktop site button');
        })(),
      { button: 0 },
    );

    const siteOptions = await screen.findByRole('menu', {
      name: 'Site',
    });

    expect(siteOptions).toHaveAttribute('data-slot', 'dropdown-menu-content');
    expect(
      within(siteOptions).getByRole('menuitem', { name: 'China site' }),
    ).toHaveAttribute('href', '/zh-CN/ai/get-started/quickstart');
    expect(
      within(siteOptions).getByText(
        'Product coverage differs between the two sites.',
      ),
    ).toBeInTheDocument();
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
            loadPages={loadSearchPages}
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
      within(mobileHeaderActions).queryByRole('button', { name: 'Site' }),
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
      within(mobileSheet).getByRole('button', { name: 'Site' }),
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
