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
import { DOCS_MAIN_SCROLL_RESTORATION_ID } from '@/lib/docs-scroll-restoration';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { legacyDocsBannerConfig } from '@/lib/shared';
import {
  DocsShell,
  LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY,
} from './DocsShell';

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

const realtimeMediaSidebar: DocsSidebarNode[] = [
  {
    children: [
      {
        children: [
          {
            id: '/en/realtime-media/video/overview',
            title: 'Voice overview',
            type: 'page',
            url: '/en/realtime-media/video/overview',
          },
        ],
        collapsible: true,
        id: 'voice-video',
        title: 'Voice & Video',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/realtime-media/rtm/build/presence',
            title: 'Presence',
            type: 'page',
            url: '/en/realtime-media/rtm/build/presence',
          },
        ],
        collapsible: true,
        id: 'signaling',
        title: 'Signaling',
        type: 'section',
      },
    ],
    id: 'realtime-media',
    title: 'RTC',
    type: 'section',
  },
];

const realtimeMediaTabs: TabSummary[] = [
  {
    icon: 'Radio',
    id: 'realtime-media',
    title: 'RTC',
    url: '/en/realtime-media',
  },
];

type DocsShellProps = ComponentProps<typeof DocsShell>;

const loadSearchPages = async () => [
  {
    title: 'Quick Start',
    url: '/en/introduction/quick-start',
  },
];

function expectNoZhCnLinks(container: ParentNode) {
  const zhCnHrefs = Array.from(
    container.querySelectorAll<HTMLAnchorElement>('a[href^="/zh-CN"]'),
  ).map((link) => link.getAttribute('href'));

  expect(zhCnHrefs).toEqual([]);
}

function renderDocsShell(
  overrides: Partial<DocsShellProps> = {},
  initialEntry = '/en/introduction/about-agora',
) {
  const props: DocsShellProps = {
    activePath: '/en/introduction',
    activeTab: 'introduction',
    children: <article>Body</article>,
    contentPath: 'en/introduction/about-agora.md',
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
  const shellComponent = () => (
    <AppProviders>
      <DocsShell {...props} />
    </AppProviders>
  );
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: shellComponent,
  });
  const docsIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab',
    component: shellComponent,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute, docsIndexRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  return {
    router,
    ...render(<RouterProvider router={router} />),
  };
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

function renderRealtimeMediaDocsShell(
  initialEntry = '/en/realtime-media/video/overview',
) {
  const videoPath = '/en/realtime-media/video/overview';
  const signalingPath = '/en/realtime-media/rtm/build/presence';
  const history = createMemoryHistory({
    initialEntries: [initialEntry],
  });
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$',
    component: () => {
      const params = docsRoute.useParams();
      const activePath = `/${params.locale}/${params.tab}/${params._splat}`;

      return (
        <AppProviders>
          <DocsShell
            activePath={activePath}
            activeTab="realtime-media"
            localeLinks={[
              {
                href: activePath,
                isActive: true,
                locale: 'en',
              },
            ]}
            locale="en"
            loadPages={loadSearchPages}
            next={
              activePath === videoPath
                ? {
                    title: 'Presence',
                    url: signalingPath,
                  }
                : undefined
            }
            previous={
              activePath === signalingPath
                ? {
                    title: 'Voice overview',
                    url: videoPath,
                  }
                : undefined
            }
            sidebar={realtimeMediaSidebar}
            tabs={realtimeMediaTabs}
            toc={[]}
          >
            <article>{activePath}</article>
          </DocsShell>
        </AppProviders>
      );
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history,
  });

  return {
    history,
    router,
    ...render(<RouterProvider router={router} />),
  };
}

describe('DocsShell', () => {
  afterEach(async () => {
    vi.useRealTimers();
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY);
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('links the desktop brand to the current-locale docs home', async () => {
    const { router } = renderDocsShell();

    const mainHeaderRow = await screen.findByTestId('docs-main-header-row');
    const brandHomeLink = within(mainHeaderRow).getByRole('link', {
      name: 'Agora Docs',
    });

    expect(brandHomeLink).toHaveAttribute('href', '/en/introduction');

    fireEvent.click(brandHomeLink);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/introduction');
    });
  });

  it('uses the route locale when building the desktop brand home link', async () => {
    const { router } = renderDocsShell(
      {
        activePath: '/zh-CN/introduction/about-agora',
        locale: 'zh-CN',
        localeLinks: [
          {
            href: '/en/introduction/about-agora',
            isActive: false,
            locale: 'en',
          },
          {
            href: '/zh-CN/introduction/about-agora',
            isActive: true,
            locale: 'zh-CN',
          },
        ],
      },
      '/zh-CN/introduction/about-agora',
    );

    const mainHeaderRow = await screen.findByTestId('docs-main-header-row');
    const brandHomeLink = within(mainHeaderRow).getByRole('link', {
      name: 'Agora Docs',
    });

    expect(brandHomeLink).toHaveAttribute('href', '/zh-CN/introduction');

    fireEvent.click(brandHomeLink);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/zh-CN/introduction');
    });
  });

  it('links the mobile sheet brand to the docs home and closes the sheet', async () => {
    const { router } = renderDocsShell();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Open navigation' }),
    );

    const mobileDialog = await screen.findByRole('dialog');
    const mobileBrandHomeLink = within(mobileDialog).getByRole('link', {
      name: 'Agora Docs',
    });

    expect(mobileBrandHomeLink).toHaveAttribute('href', '/en/introduction');

    fireEvent.click(mobileBrandHomeLink);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/introduction');
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
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
    const themeControl = within(mainHeaderRow).getByRole('button', {
      name: 'Theme: Light',
    });
    const githubControl = within(mainHeaderRow).getByRole('link', {
      name: 'GitHub',
    });
    const brandHomeLink = within(mainHeaderRow).getByRole('link', {
      name: 'Agora Docs',
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
    expect(mainHeaderRow).toContainElement(desktopSearch);
    expect(mainHeaderRow).toContainElement(themeControl);
    expect(within(brandHomeLink).getByText('Docs')).toBeInTheDocument();
    expect(brandHomeLink.querySelector('svg')).toBeInTheDocument();
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
    expect(tabsIntroductionLink).toHaveAttribute('href', '/en/introduction');
    expect(tabsAiLink).toHaveAttribute('href', '/en/ai');
    expect(tabsIntroductionLink.className).toContain('after:!bottom-[-3px]');
    expect(tabsIntroductionLink.className).toContain('after:h-0.5');

    expect(
      screen.getByRole('link', { name: 'Quick Start' }),
    ).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('renders a configurable legacy docs banner in the sticky docs header', async () => {
    renderDocsShell();

    const banner = await screen.findByTestId('legacy-docs-banner');

    expect(banner).toHaveTextContent(
      'Looking for the previous docs site? Visit the legacy docs homepage.',
    );
    expect(legacyDocsBannerConfig.hrefs.en).toBe(
      'https://docs-legacy.agora.io/en',
    );
    expect(banner).toHaveAttribute('href', legacyDocsBannerConfig.hrefs.en);
    expect(banner).toHaveAttribute('target', '_blank');
    expect(banner).toHaveAttribute('rel', 'noreferrer');
    expect(
      screen.getByRole('button', { name: 'Dismiss legacy docs banner' }),
    ).toBeVisible();
    expect(screen.getByRole('banner')).toContainElement(banner);
  });

  it('dismisses the legacy docs banner immediately and persists the dismissal', async () => {
    const { unmount } = renderDocsShell();

    await screen.findByTestId('legacy-docs-banner');

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss legacy docs banner' }),
    );

    expect(screen.queryByTestId('legacy-docs-banner')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Dismiss legacy docs banner' }),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem(LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY),
    ).toBe('true');

    unmount();
    renderDocsShell();

    await waitFor(() => {
      expect(
        screen.queryByTestId('legacy-docs-banner'),
      ).not.toBeInTheDocument();
    });
  });

  it('localizes the legacy docs banner copy for Chinese docs chrome', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/introduction/about-agora',
        locale: 'zh-CN',
        localeLinks: [
          {
            href: '/zh-CN/introduction/about-agora',
            isActive: true,
            locale: 'zh-CN',
          },
        ],
      },
      '/zh-CN/introduction/about-agora',
    );

    const banner = await screen.findByTestId('legacy-docs-banner');

    expect(banner).toHaveTextContent(
      '需要访问旧版文档站？前往旧版文档官网首页。',
    );
    expect(banner).toHaveAttribute(
      'href',
      legacyDocsBannerConfig.hrefs['zh-CN'],
    );
  });

  it('reserves bold width on top tabs so the menu does not shift on activation', async () => {
    renderDocsShell();

    const docsTabsStrip = await screen.findByTestId('docs-tabs-strip');
    const introTab = within(docsTabsStrip).getByRole('tab', {
      name: 'Introduction',
    });

    // Weight no longer toggles on the Link itself (that would shift siblings);
    // the Link exposes its active state as a named group instead.
    expect(introTab.className).not.toContain(
      'data-[state=active]:font-semibold',
    );
    expect(introTab.className).toContain('group/tab');

    // The title is rendered twice: an aria-hidden semibold ghost that reserves
    // width, and a visible copy whose weight follows the group's active state.
    const titles = within(introTab).getAllByText('Introduction');
    expect(titles).toHaveLength(2);

    const ghost = titles.find(
      (el) => el.getAttribute('aria-hidden') === 'true',
    );
    const visible = titles.find(
      (el) => el.getAttribute('aria-hidden') !== 'true',
    );

    expect(ghost).toBeDefined();
    expect(ghost?.className).toContain('invisible');
    expect(ghost?.className).toContain('font-semibold');

    expect(visible).toBeDefined();
    expect(visible?.className).toContain(
      'group-data-[state=active]/tab:font-semibold',
    );
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
    expect(
      screen.queryByRole('navigation', { name: 'Alternate languages' }),
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
    expect(within(tocRail).queryByTestId('docs-feedback')).toBeNull();

    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const pageFooter = within(mainColumn).getByTestId('docs-page-footer');
    expect(
      within(mainColumn).getByRole('link', { name: /Next Next Page/i }),
    ).toBeInTheDocument();
    expect(
      within(mainColumn).getByRole('link', { name: /Previous Previous Page/i }),
    ).toBeInTheDocument();
    expect(within(pageFooter).getByTestId('docs-feedback')).toBeInTheDocument();
    expect(
      within(mainColumn).queryByTestId('docs-site-footer'),
    ).not.toBeInTheDocument();
  });

  it('renders the Agora site footer as a shell-level full-width footer on desktop', async () => {
    renderDocsShell();

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const pageFooter = within(mainColumn).getByTestId('docs-page-footer');
    const siteFooter = screen
      .getAllByTestId('docs-site-footer')
      .find((footer) => !footer.classList.contains('lg:hidden'));
    if (!siteFooter) {
      throw new Error('expected a desktop site footer');
    }
    const footerContent = within(siteFooter).getByTestId(
      'docs-site-footer-content',
    );

    expect(docsBodyShell).not.toContainElement(siteFooter);
    expect(mainColumn).not.toContainElement(siteFooter);
    expect(pageFooter).not.toContainElement(siteFooter);
    expect(
      docsBodyShell.compareDocumentPosition(siteFooter) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      pageFooter.compareDocumentPosition(siteFooter) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(siteFooter.parentElement).toHaveClass('flex', 'min-h-screen');
    expect(siteFooter).toHaveClass(
      'w-full',
      'border-t',
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
      'lg:block',
    );
    expect(siteFooter).not.toHaveClass('w-screen', '-ml-8');
    expect(footerContent).toHaveClass('mx-auto', 'lg:px-10');

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
    expect(
      within(siteFooter).getByRole('link', { name: 'Discord' }),
    ).toHaveAttribute('href', 'https://discord.gg/QfgBCvuX4d');

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
    ).toHaveAttribute('href', '/en/');
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

    expect(siteFooter).toHaveClass(
      'left-1/2',
      'w-screen',
      '-translate-x-1/2',
      'lg:hidden',
    );
    expect(navGrid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-4',
    );
    expect(copyrightRow).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('keeps the openapi layout on the stable docs shell without the generic toc rail', async () => {
    renderDocsShell({
      layoutMode: 'openapi',
    });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainHeaderRow = screen.getByTestId('docs-main-header-row');
    const docsTabsStrip = screen.getByTestId('docs-tabs-strip');

    expect(mainHeaderRow).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsTabsStrip.firstElementChild).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).toHaveClass('xl:grid-cols-[256px_minmax(0,1fr)]');
    expect(docsBodyShell).not.toHaveClass(
      'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
    );
    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(screen.queryByTestId('docs-page-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('docs-side-rail')).not.toBeInTheDocument();
    for (const footer of screen.getAllByTestId('docs-page-footer')) {
      expect(footer).toHaveClass('max-w-none');
      expect(footer).not.toHaveClass('max-w-[var(--content-max)]');
    }
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('keeps feedback in normal page flow while only navigation areas own scroll regions', async () => {
    renderDocsShell({
      next: { title: 'Next Page', url: '/en/introduction/next-page' },
      previous: { title: 'Previous Page', url: '/en/introduction/prev-page' },
    });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainColumn = screen.getByTestId('docs-main-column');
    const desktopContent = screen.getByTestId('docs-main-desktop-scroll');

    expect(docsBodyShell).toHaveClass('lg:items-start');
    expect(docsBodyShell).not.toHaveClass(
      'lg:h-[var(--docs-shell-body-height)]',
      'lg:min-h-0',
      'lg:overflow-hidden',
    );
    expect(screen.getByTestId('docs-sidebar')).toHaveClass(
      'lg:sticky',
      'lg:top-[var(--docs-shell-header-offset)]',
      'lg:h-[var(--docs-shell-body-height)]',
      'overflow-hidden',
    );
    expect(screen.getByTestId('docs-sidebar-scroll')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
    expect(mainColumn).toHaveClass('min-w-0', 'bg-background');
    expect(mainColumn).not.toHaveClass('h-full', 'min-h-0', 'overflow-hidden');
    expect(desktopContent).toHaveClass('hidden', 'lg:block');
    expect(desktopContent).not.toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );

    const tocRail = screen.getByTestId('docs-toc-rail');
    expect(tocRail).toHaveClass(
      'xl:sticky',
      'xl:top-[var(--docs-shell-header-offset)]',
      'xl:h-[var(--docs-shell-body-height)]',
      'xl:min-h-0',
    );
    expect(tocRail).not.toHaveClass('docs-scrollbar', 'overflow-y-auto');
    expect(screen.getByTestId('docs-toc-rail-scroll')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
  });

  it('shows docs scrollbars transiently while a sidebar region is scrolling', async () => {
    renderDocsShell();

    const sidebarScrollRegion = await screen.findByTestId(
      'docs-sidebar-scroll',
    );
    vi.useFakeTimers();

    expect(sidebarScrollRegion).not.toHaveClass('docs-scrollbar-visible');

    fireEvent.scroll(sidebarScrollRegion);

    expect(sidebarScrollRegion).toHaveClass('docs-scrollbar-visible');

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(sidebarScrollRegion).not.toHaveClass('docs-scrollbar-visible');
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

  it('delegates desktop main-column scroll restoration to the router', async () => {
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
    expect(mainScroll).toHaveAttribute(
      'data-scroll-restoration-id',
      DOCS_MAIN_SCROLL_RESTORATION_ID,
    );
    mainScroll.scrollTop = 180;

    fireEvent.click(screen.getByRole('button', { name: 'Switch page' }));

    await waitFor(() => {
      expect(mainScroll).toHaveAttribute(
        'data-reset-key',
        '/en/introduction/quick-start',
      );
    });
    expect(mainScroll.scrollTop).toBe(180);
    expect(windowScrollTo).not.toHaveBeenCalledWith({
      behavior: 'auto',
      top: 0,
    });
  });

  it('restores the desktop main-column scroll position on browser back navigation', async () => {
    const history = createMemoryHistory({
      initialEntries: ['/en/introduction/about-agora'],
    });
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$',
      component: () => {
        const params = docsRoute.useParams();
        const activePath = `/${params.locale}/${params.tab}/${params._splat}`;

        return (
          <AppProviders>
            <DocsShell
              activePath={activePath}
              activeTab="introduction"
              localeLinks={[
                {
                  href: activePath,
                  isActive: true,
                  locale: 'en',
                },
                {
                  href: `/zh-CN/${params.tab}/${params._splat}`,
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
          </AppProviders>
        );
      },
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history,
      scrollRestoration: true,
      scrollToTopSelectors: [
        `[data-scroll-restoration-id="${DOCS_MAIN_SCROLL_RESTORATION_ID}"]`,
      ],
    });

    render(<RouterProvider router={router} />);

    const mainScroll = await screen.findByTestId('docs-main-desktop-scroll');
    mainScroll.scrollTop = 180;
    fireEvent.scroll(mainScroll);

    await act(async () => {
      await router.navigate({ to: '/en/introduction/quick-start' as never });
    });

    await waitFor(() => {
      expect(
        screen.getAllByText('/en/introduction/quick-start').length,
      ).toBeGreaterThan(0);
    });
    expect(mainScroll.scrollTop).toBe(0);

    await act(async () => {
      history.back();
    });

    await waitFor(() => {
      expect(
        screen.getAllByText('/en/introduction/about-agora').length,
      ).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(mainScroll.scrollTop).toBe(180);
    });
  });

  it('reveals active nested sidebar sections after footer and history navigation', async () => {
    const { history, router } = renderRealtimeMediaDocsShell();
    const sidebarRegion = await screen.findByTestId('docs-sidebar');
    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const voiceToggle = within(sidebarRegion).getByRole('button', {
      name: /Voice & Video/i,
    });
    const signalingToggle = within(sidebarRegion).getByRole('button', {
      name: /Signaling/i,
    });

    expect(voiceToggle).toHaveAttribute('aria-expanded', 'true');
    expect(signalingToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(sidebarRegion).queryByRole('link', { name: 'Presence' }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(mainColumn).getByRole('link', { name: /Next Presence/i }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/realtime-media/rtm/build/presence',
      );
    });
    expect(signalingToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(sidebarRegion).getByRole('link', { name: 'Presence' }),
    ).toHaveAttribute('data-active', 'true');

    fireEvent.click(voiceToggle);

    expect(voiceToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(
      within(mainColumn).getByRole('link', {
        name: /Previous Voice overview/i,
      }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/realtime-media/video/overview',
      );
    });
    expect(voiceToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(sidebarRegion).getByRole('link', { name: 'Voice overview' }),
    ).toHaveAttribute('data-active', 'true');

    fireEvent.click(signalingToggle);

    expect(signalingToggle).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      history.back();
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/realtime-media/rtm/build/presence',
      );
    });
    expect(signalingToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(sidebarRegion).getByRole('link', { name: 'Presence' }),
    ).toHaveAttribute('data-active', 'true');

    fireEvent.click(voiceToggle);

    expect(voiceToggle).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      history.forward();
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/realtime-media/video/overview',
      );
    });
    expect(voiceToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(sidebarRegion).getByRole('link', { name: 'Voice overview' }),
    ).toHaveAttribute('data-active', 'true');
  });

  it('expands the active nested sidebar section on direct deep links', async () => {
    renderRealtimeMediaDocsShell('/en/realtime-media/rtm/build/presence');

    const sidebarRegion = await screen.findByTestId('docs-sidebar');
    const signalingToggle = within(sidebarRegion).getByRole('button', {
      name: /Signaling/i,
    });

    expect(signalingToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(sidebarRegion).getByRole('link', { name: 'Presence' }),
    ).toHaveAttribute('data-active', 'true');
  });

  it('does not expose China site or alternate zh-CN navigation in desktop chrome', async () => {
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

    const mainHeaderRow = await screen.findByTestId('docs-main-header-row');
    const desktopHeaderActions = within(mainHeaderRow).getByTestId(
      'docs-desktop-header-actions',
    );

    expect(
      within(desktopHeaderActions).queryByRole('button', { name: 'Site' }),
    ).toBeNull();
    expect(
      within(desktopHeaderActions).queryByText('China site'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', {
        name: 'Alternate languages',
      }),
    ).toBeNull();
    expect(
      screen.queryByRole('link', { name: 'zh-CN' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'China site',
      }),
    ).not.toBeInTheDocument();
    expectNoZhCnLinks(mainHeaderRow);
  });

  it('does not render alternate-language chrome when only one UI locale is enabled', async () => {
    renderDocsShell({
      activePath: '/en/ai/get-started/quickstart',
      activeTab: 'ai',
      localeLinks: [
        {
          href: '/en/ai/get-started/quickstart',
          isActive: true,
          locale: 'en',
        },
      ],
    });

    expect(
      screen.queryByRole('navigation', {
        name: 'Alternate languages',
      }),
    ).toBeNull();
  });

  it('keeps compact mobile header controls and exposes theme in the sheet', async () => {
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
      within(desktopHeaderActions).queryByRole('button', { name: 'Site' }),
    ).toBeNull();
    expect(
      within(mainHeaderRow).queryByText('China site'),
    ).not.toBeInTheDocument();
    expectNoZhCnLinks(mainHeaderRow);
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
    const sectionPicker = within(mobileSheet).getByTestId(
      'docs-mobile-section-picker',
    );
    const quickStartLink = within(mobileSheet).getByRole('link', {
      name: 'Quick Start',
    });

    expect(sectionPicker).toHaveTextContent('Introduction');
    expect(within(mobileSheet).queryByRole('tablist')).toBeNull();
    expect(
      within(mobileSheet).queryByRole('tab', { name: 'Introduction' }),
    ).toBeNull();
    expect(quickStartLink).toBeInTheDocument();
    expect(
      sectionPicker.compareDocumentPosition(quickStartLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(mobileSheet).queryByRole('button', { name: 'Site' }),
    ).toBeNull();
    expect(
      within(mobileSheet).queryByText('China site'),
    ).not.toBeInTheDocument();
    expect(
      within(mobileSheet).queryByRole('link', { name: 'zh-CN' }),
    ).not.toBeInTheDocument();
    expectNoZhCnLinks(mobileSheet);
    expect(
      within(mobileSheet).getByRole('button', { name: 'Theme: Light' }),
    ).toBeInTheDocument();
    expect(
      within(mobileSheet).getByRole('button', { name: 'Theme: Light' }),
    ).toHaveAttribute('data-variant', 'ghost');

    sectionPicker.focus();
    fireEvent.keyDown(sectionPicker, { code: 'Enter', key: 'Enter' });

    const sectionMenu = await screen.findByRole('menu');
    const currentSectionItem = within(sectionMenu).getByRole('menuitem', {
      name: 'Introduction',
    });

    const aiSectionItem = within(sectionMenu).getByRole('menuitem', {
      name: 'AI',
    });

    expect(aiSectionItem).toBeInTheDocument();
    expect(currentSectionItem).toHaveAttribute('aria-current');
    expect(currentSectionItem).toHaveClass('font-semibold');
    expect(currentSectionItem.querySelector('svg')).toBeInTheDocument();

    fireEvent.click(aiSectionItem);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('keeps mobile navigation groups spaced with distinct active tab and page states', async () => {
    renderDocsShell(
      {
        activePath: '/en/api-reference/api-ref/cloud-recording/acquire',
        activeTab: 'api-reference',
        sidebar: [
          {
            id: 'overview',
            title: 'Overview',
            type: 'page',
            url: '/en/api-reference/api-ref/cloud-recording/overview',
          },
          {
            id: 'auth',
            title: 'RESTful authentication',
            type: 'page',
            url: '/en/api-reference/api-ref/cloud-recording/authentication',
          },
          {
            id: 'acquire',
            title: 'Acquire a cloud recording resource',
            type: 'page',
            url: '/en/api-reference/api-ref/cloud-recording/acquire',
          },
        ],
        sidebarHeader: {
          backHref: '/en/api-reference/api-ref',
          backLabel: 'API Reference',
          title: 'Cloud Recording',
        },
        tabs: [
          {
            id: 'ai',
            title: 'Voice Agent',
            url: '/en/ai',
          },
          {
            id: 'realtime-media',
            title: 'RTC',
            url: '/en/realtime-media',
          },
          {
            id: 'api-reference',
            title: 'Reference',
            url: '/en/api-reference',
          },
        ],
      },
      '/en/api-reference/acquire',
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Open navigation' }),
    );

    const mobileSheet = await screen.findByRole('dialog');
    const mobileSheetContent = screen.getByTestId('docs-mobile-sidebar-sheet');
    const mobileScroll = within(mobileSheet).getByTestId(
      'docs-mobile-sidebar-scroll',
    );
    const sectionPicker = within(mobileSheet).getByTestId(
      'docs-mobile-section-picker',
    );
    const currentPageLink = within(mobileSheet).getByRole('link', {
      name: 'Acquire a cloud recording resource',
    });
    const pagesLabel = within(mobileSheet).getByText('Pages');

    expect(mobileSheetContent).toBe(mobileSheet);
    expect(mobileSheetContent).toHaveClass(
      'w-[min(92vw,24rem)]',
      'max-w-[calc(100vw-1rem)]',
      'overflow-hidden',
    );
    expect(mobileScroll).toHaveClass(
      'min-w-0',
      'overflow-hidden',
      'px-3',
      'sm:px-4',
    );
    expect(sectionPicker).toHaveTextContent('Reference');
    expect(sectionPicker).toHaveClass(
      'h-10',
      'w-full',
      'justify-between',
      'text-left',
    );
    expect(within(mobileSheet).queryByRole('tablist')).toBeNull();
    expect(pagesLabel).toHaveClass('pb-0.5', 'leading-4');
    expect(
      within(mobileSheet).getByRole('link', { name: 'API Reference' }),
    ).toBeInTheDocument();
    expect(
      sectionPicker.compareDocumentPosition(currentPageLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(currentPageLink).toHaveClass('w-full', 'min-w-0', 'overflow-hidden');
    expect(currentPageLink).toHaveAttribute('aria-current', 'page');
    expect(currentPageLink.className).toContain(
      'bg-[color:var(--accent-brand-soft)]',
    );
    expect(currentPageLink.className).toContain(
      'before:bg-[color:var(--accent-brand)]',
    );
    expect(currentPageLink.className).toContain('focus-visible:ring-[3px]');

    sectionPicker.focus();
    fireEvent.keyDown(sectionPicker, { code: 'Enter', key: 'Enter' });

    const sectionMenu = await screen.findByRole('menu');
    const currentSectionItem = within(sectionMenu).getByRole('menuitem', {
      name: 'Reference',
    });

    expect(
      within(sectionMenu).getByRole('menuitem', { name: 'Voice Agent' }),
    ).toBeInTheDocument();
    expect(
      within(sectionMenu).getByRole('menuitem', { name: 'RTC' }),
    ).toBeInTheDocument();
    expect(
      within(sectionMenu).getByRole('menuitem', { name: 'Solutions' }),
    ).toBeInTheDocument();
    expect(currentSectionItem).toHaveAttribute('aria-current');
    expect(currentSectionItem).toHaveClass(
      'font-semibold',
      'text-[color:var(--accent-brand)]',
    );
    expect(currentSectionItem.querySelector('svg')).toBeInTheDocument();
  });

  it('wraps long mobile sidebar labels and limits nested indentation', async () => {
    const longTabTitle =
      'RealtimeMediaWithAnExtremelyLongUnbrokenMobileNavigationTitle';
    const longSectionTitle =
      'CloudRecordingEndpointsWithVeryLongUnbrokenSectionTitle';
    const longPageTitle =
      'AcquireCloudRecordingResourceWithExtremelyLongUnbrokenIdentifierForMobileDrawer';

    renderDocsShell(
      {
        activePath: '/en/api-reference/api-ref/cloud-recording/long-endpoint',
        activeTab: 'long-realtime-media',
        sidebar: [
          {
            children: [
              {
                id: 'long-endpoint',
                method: 'POST',
                title: longPageTitle,
                type: 'page',
                url: '/en/api-reference/api-ref/cloud-recording/long-endpoint',
              },
            ],
            id: 'long-section',
            title: longSectionTitle,
            type: 'section',
          },
        ],
        tabs: [
          {
            id: 'long-realtime-media',
            title: longTabTitle,
            url: '/en/realtime-media',
          },
          {
            id: 'api-reference',
            title: 'Reference',
            url: '/en/api-reference',
          },
        ],
      },
      '/en/api-reference/long-endpoint',
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Open navigation' }),
    );

    const mobileSheet = await screen.findByRole('dialog');
    const sectionPicker = within(mobileSheet).getByTestId(
      'docs-mobile-section-picker',
    );
    const pickerLabel = within(sectionPicker).getByText(longTabTitle);
    const sectionLabel = within(mobileSheet)
      .getByText(longSectionTitle)
      .closest('p');
    const pageLink = within(mobileSheet).getByRole('link', {
      name: `${longPageTitle} POST`,
    });
    const pageTitle = within(pageLink).getByText(longPageTitle);
    const nestedList = sectionLabel?.nextElementSibling;

    expect(sectionPicker).toHaveClass('w-full', 'min-w-0', 'justify-between');
    expect(pickerLabel).toHaveClass('min-w-0', 'truncate');
    expect(within(mobileSheet).queryByRole('tablist')).toBeNull();
    expect(sectionLabel).toBeInstanceOf(HTMLElement);
    expect(sectionLabel).toHaveAttribute('data-active', 'true');
    expect(sectionLabel).toHaveClass('max-w-full', '[overflow-wrap:anywhere]');
    expect(nestedList).toBeInstanceOf(HTMLElement);
    expect(nestedList).toHaveClass('max-w-full', 'border-l', 'pl-2', 'ml-2');
    expect(pageLink).toHaveClass(
      'max-w-full',
      'overflow-hidden',
      '[&>span:first-child]:[overflow-wrap:anywhere]',
    );
    expect(pageTitle).toHaveClass('min-w-0', 'flex-1');
    expect(within(pageLink).getByText('POST')).toHaveClass(
      'shrink-0',
      'font-mono',
    );
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

  it('hides the toc rail and fills the grid when hideToc is set, keeping the docs footprint', async () => {
    renderDocsShell({ layoutMode: 'docs', hideToc: true });

    const docsBodyShell = await screen.findByTestId('docs-body-shell');
    const mainColumn = screen.getByTestId('docs-main-desktop-scroll');
    const pageFooter = within(mainColumn).getByTestId('docs-page-footer');

    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(docsBodyShell).toHaveClass('xl:grid-cols-[256px_minmax(0,1fr)]');
    expect(docsBodyShell).not.toHaveClass(
      'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
    );
    expect(docsBodyShell).toHaveClass(
      'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]',
    );
    expect(docsBodyShell).not.toHaveClass('max-w-[min(100%,1600px)]');
    expect(pageFooter).toHaveClass('max-w-none');
    expect(pageFooter).not.toHaveClass('max-w-[var(--content-max)]');
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
