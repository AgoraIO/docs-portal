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

  it.each([
    { activePath: '/zh-CN/introduction', layoutMode: 'docs' },
    { activePath: '/zh-CN/introduction/about-agora', layoutMode: 'docs' },
    { activePath: '/zh-CN/api-reference/example', layoutMode: 'openapi' },
    { activePath: '/zh-CN/search', layoutMode: 'search' },
  ] as const)(
    'offers a site menu on Chinese $layoutMode page $activePath',
    async ({ activePath, layoutMode }) => {
      renderDocsShell({ locale: 'zh-CN', activePath, layoutMode }, activePath);

      const actions = await screen.findByTestId('docs-desktop-header-actions');
      const trigger = within(actions).getByRole('button', {
        name: '切换站点 / Switch site',
      });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      trigger.focus();
      fireEvent.keyDown(trigger, { code: 'Enter', key: 'Enter' });
      const menu = await screen.findByRole('menu');
      expect(
        within(menu).getByRole('menuitem', { name: /简体中文/ }),
      ).toHaveAttribute('aria-current', 'true');
      const link = within(menu).getByRole('menuitem', { name: /English/ });
      expect(link).toHaveAttribute(
        'href',
        'https://docs.agora.io/en/introduction',
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('hrefLang', 'en');
      expect(link).toHaveAccessibleName(/在新标签页打开/);
      expect(screen.getByTestId('legacy-docs-banner')).toHaveAttribute(
        'href',
        'https://doc-archive.shengwang.cn/archive/0.0.546/',
      );
    },
  );

  it('keeps international docs available after dismissing the Chinese legacy banner and remounting', async () => {
    const { unmount } = renderDocsShell({ locale: 'zh-CN' });
    fireEvent.click(
      await screen.findByRole('button', { name: '关闭旧版文档提示' }),
    );
    expect(screen.queryByTestId('legacy-docs-banner')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '切换站点 / Switch site' }),
    ).toBeInTheDocument();

    unmount();
    renderDocsShell({ locale: 'zh-CN' });
    const trigger = await screen.findByRole('button', {
      name: '切换站点 / Switch site',
    });
    fireEvent.keyDown(trigger, { code: 'Enter', key: 'Enter' });
    expect(
      await screen.findByRole('menuitem', { name: /English/ }),
    ).toHaveAttribute('href', 'https://docs.agora.io/en/introduction');
    expect(screen.queryByTestId('legacy-docs-banner')).not.toBeInTheDocument();
  });

  it('opens international docs from the mobile tools and closes the navigation', async () => {
    renderDocsShell({ locale: 'zh-CN' });
    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));
    const sheet = await screen.findByRole('dialog');
    const tools = within(sheet).getByTestId('docs-mobile-sidebar-tools');
    const trigger = within(tools).getByRole('button', {
      name: '切换站点 / Switch site',
    });
    expect(
      within(sheet).getByTestId('docs-mobile-sidebar-scroll'),
    ).not.toContainElement(tools);
    expect(
      within(tools).getByRole('button', { name: '主题: 浅色' }),
    ).toBeInTheDocument();
    fireEvent.keyDown(trigger, { code: 'Enter', key: 'Enter' });
    const menu = await screen.findByRole('menu');
    const link = within(menu).getByRole('menuitem', { name: /English/ });
    expect(link).toHaveAttribute(
      'href',
      'https://docs.agora.io/en/introduction',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('closes the mobile site menu with Escape and restores focus without closing navigation', async () => {
    renderDocsShell({ locale: 'zh-CN' });
    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));
    const sheet = await screen.findByRole('dialog');
    const trigger = within(sheet).getByRole('button', {
      name: '切换站点 / Switch site',
    });
    trigger.focus();
    fireEvent.keyDown(trigger, { code: 'Enter', key: 'Enter' });
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { code: 'Escape', key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    expect(sheet).toBeInTheDocument();
  });

  it('does not add a site menu to English desktop or mobile navigation', async () => {
    renderDocsShell();
    await screen.findByTestId('docs-desktop-header-actions');
    expect(
      screen.queryByRole('button', { name: 'Switch site' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const sheet = await screen.findByRole('dialog');
    expect(
      within(sheet).queryByRole('button', { name: 'Switch site' }),
    ).not.toBeInTheDocument();
  });

  it('hides pointer focus on header tabs and restores it when keyboard navigation starts outside the strip', async () => {
    renderDocsShell();
    const strip = await screen.findByTestId('docs-tabs-strip');
    const introTab = within(strip).getByRole('tab', {
      name: 'Introduction',
    });

    expect(strip).toHaveAttribute('data-pointer-focus', 'false');
    fireEvent.pointerDown(introTab, { pointerType: 'mouse' });
    expect(strip).toHaveAttribute('data-pointer-focus', 'true');

    // Tab can enter from a header action after a pointer interaction that did
    // not focus the tab (for example, Safari or a cancelled touch).
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(strip).toHaveAttribute('data-pointer-focus', 'false');

    fireEvent.pointerDown(introTab, { pointerType: 'touch' });
    expect(strip).toHaveAttribute('data-pointer-focus', 'true');
    fireEvent.keyDown(introTab, { key: 'ArrowRight' });
    expect(strip).toHaveAttribute('data-pointer-focus', 'false');
  });

  it('renders the ordinary docs action in the mobile sidebar and closes it after navigation', async () => {
    renderDocsShell({
      activePath: '/zh-CN/api-reference/conversational-ai/android/overview',
      activeTab: 'api-reference',
      locale: 'zh-CN',
      localeLinks: [
        {
          href: '/en/api-reference/conversational-ai/android/overview',
          isActive: false,
          locale: 'en',
        },
        {
          href: '/zh-CN/api-reference/conversational-ai/android/overview',
          isActive: true,
          locale: 'zh-CN',
        },
      ],
      sidebarHeader: {
        backHref: '/zh-CN/api-reference/api',
        backLabel: 'API 参考',
        productDocsHref: '/zh-CN/ai',
        title: 'Android API 参考',
      },
    });

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    const action = within(mobileSheet).getByRole('link', {
      name: '查看普通文档',
    });

    expect(action).toHaveAttribute('href', '/zh-CN/ai');
    const actionIcon = action.querySelector('svg');
    expect(actionIcon).toHaveClass('lucide-arrow-left');
    expect(actionIcon).toBe(action.firstElementChild);

    fireEvent.click(action);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
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
        activePath:
          '/zh-CN/api-reference/api-ref/cloud-recording/long-endpoint',
        activeTab: 'long-realtime-media',
        locale: 'zh-CN',
        sidebar: [
          {
            children: [
              {
                id: 'long-endpoint',
                method: 'POST',
                title: longPageTitle,
                type: 'page',
                url: '/zh-CN/api-reference/api-ref/cloud-recording/long-endpoint',
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
            url: '/zh-CN/realtime-media',
          },
          {
            id: 'api-reference',
            title: 'Reference',
            url: '/zh-CN/api-reference',
          },
        ],
      },
      '/zh-CN/api-reference/long-endpoint',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

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
    expect(pageTitle.parentElement).toHaveClass(
      'flow-root',
      'min-w-0',
      'flex-1',
    );
    expect(pageTitle).toHaveClass('[overflow-wrap:anywhere]');
    expect(pageLink.querySelector('[data-openapi-method]')).toHaveClass(
      'float-right',
      'whitespace-nowrap',
      'font-mono',
    );
  });

  it.each([
    ['GET', 'blue'],
    ['POST', 'green'],
    ['PUT', 'amber'],
    ['PATCH', 'amber'],
    ['DELETE', 'red'],
  ])(
    'colors %s method badges in the mobile navigation',
    async (method, color) => {
      const url = '/zh-CN/api-reference/api-ref/conversational-ai/join';
      renderDocsShell(
        {
          activePath: url,
          activeTab: 'api-reference',
          sidebar: [
            { id: url, method, title: 'ConvoAI endpoint', type: 'page', url },
          ],
        },
        '/en/api-reference/method',
      );
      fireEvent.click(
        await screen.findByRole('button', { name: 'Open navigation' }),
      );
      const sheet = await screen.findByRole('dialog');
      const link = within(sheet).getByRole('link', {
        name: `ConvoAI endpoint ${method}`,
      });
      expect(link.querySelector('[data-openapi-method]')).toHaveClass(
        `bg-${color}-100`,
        `text-${color}-800`,
        `dark:bg-${color}-900`,
        `dark:text-${color}-100`,
      );
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveAttribute('aria-current', 'page');
    },
  );

  it('keeps linked mobile sections navigable and independently expandable', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/realtime-media/overview',
        activeTab: 'realtime-media',
        locale: 'zh-CN',
        sidebar: [
          {
            children: [
              {
                id: 'rtc-overview',
                title: '产品概述',
                type: 'page',
                url: '/zh-CN/realtime-media/rtc/overview',
              },
            ],
            collapsible: true,
            id: 'rtc',
            title: '实时互动 RTC',
            type: 'section',
            url: '/zh-CN/realtime-media/rtc',
          },
        ],
        tabs: [
          {
            id: 'realtime-media',
            title: '实时互动',
            url: '/zh-CN/realtime-media',
          },
        ],
      },
      '/zh-CN/realtime-media/overview',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    const landingLink = within(mobileSheet).getByRole('link', {
      name: '实时互动 RTC',
    });
    const disclosure = within(mobileSheet).getByRole('button', {
      name: '展开或收起实时互动 RTC子页面',
    });

    expect(landingLink).toHaveAttribute('href', '/zh-CN/realtime-media/rtc');
    expect(landingLink).toHaveClass('min-h-11', 'flex-1');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(disclosure).toHaveClass('size-11');
    expect(
      within(mobileSheet).queryByRole('link', { name: '产品概述' }),
    ).not.toBeInTheDocument();

    fireEvent.click(disclosure);

    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(mobileSheet).getByRole('link', { name: '产品概述' }),
    ).toBeInTheDocument();
  });

  it('opens external and linked mobile sidebar pages in new tabs with external icons', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/realtime-media/overview',
        activeTab: 'realtime-media',
        locale: 'zh-CN',
        sidebar: [
          {
            external: true,
            href: 'https://im.shengwang.cn',
            id: 'im',
            title: '即时通讯 IM',
            type: 'page',
            url: 'https://im.shengwang.cn',
          },
          {
            id: 'client-api',
            linked: true,
            search: {
              apiType: 'client',
              product: 'rtc',
            },
            title: '客户端 API',
            type: 'page',
            url: '/zh-CN/api-reference/api',
          },
        ],
        tabs: realtimeMediaTabs,
      },
      '/zh-CN/realtime-media/overview',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    const imLink = within(mobileSheet).getByRole('link', {
      name: '即时通讯 IM',
    });
    const clientApiLink = within(mobileSheet).getByRole('link', {
      name: '客户端 API',
    });

    for (const link of [imLink, clientApiLink]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
      expect(link.querySelector('.lucide-external-link')).toBeInTheDocument();
    }

    expect(imLink).toHaveAttribute('href', 'https://im.shengwang.cn');
    expect(clientApiLink).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/api?apiType=client&product=rtc',
    );
  });

  it('shows an internal navigation arrow without opening marked mobile links in a new tab', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/introduction',
        activeTab: 'introduction',
        locale: 'zh-CN',
        sidebar: [
          {
            id: 'introduction-demo-gallery',
            showNavigationArrow: true,
            title: '体验 Demo',
            type: 'page',
            url: '/zh-CN/reference/demo',
          },
        ],
        tabs: [
          {
            id: 'introduction',
            title: '介绍',
            url: '/zh-CN/introduction',
          },
        ],
      },
      '/zh-CN/introduction',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    const demoLink = within(mobileSheet).getByRole('link', {
      name: '体验 Demo',
    });

    expect(demoLink).toHaveAttribute('href', '/zh-CN/reference/demo');
    expect(demoLink).not.toHaveAttribute('target', '_blank');
    expect(demoLink.querySelector('.lucide-arrow-right')).toBeInTheDocument();
    expect(
      demoLink.querySelector('.lucide-external-link'),
    ).not.toBeInTheDocument();
  });

  it('keeps linked hub sections collapsed when defaultOpen is false', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/reference/faq',
        activeTab: 'reference',
        locale: 'zh-CN',
        sidebar: [
          {
            children: [
              {
                id: 'faq-account',
                title: '账号问题',
                type: 'page',
                url: '/zh-CN/reference/faq/account',
              },
            ],
            collapsible: true,
            defaultOpen: false,
            id: 'faq',
            title: '常见问题',
            type: 'section',
            url: '/zh-CN/reference/faq',
          },
        ],
        tabs: [
          {
            id: 'reference',
            title: '参考文档',
            url: '/zh-CN/reference',
          },
        ],
      },
      '/zh-CN/reference/faq',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    expect(
      within(mobileSheet).getByRole('button', {
        name: '展开或收起常见问题子页面',
      }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(mobileSheet).queryByRole('link', { name: '账号问题' }),
    ).not.toBeInTheDocument();
  });

  it('gives search one full-width body without article chrome or a duplicate search dialog', async () => {
    renderDocsShell({
      layoutMode: 'search',
      activeTab: 'search',
      children: <main>Search results</main>,
    });
    const body = await screen.findByTestId('docs-body-shell');
    expect(within(body).getByRole('main')).toHaveTextContent('Search results');
    expect(body).not.toHaveClass('grid');
    expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('docs-main-desktop-scroll'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Search docs' }),
    ).not.toBeInTheDocument();
  });

  it('renders embedded service API sections as collapsed mobile disclosures', async () => {
    renderDocsShell(
      {
        activePath: '/zh-CN/realtime-media/rtc',
        activeTab: 'realtime-media',
        locale: 'zh-CN',
        sidebar: [
          {
            children: [
              {
                id: 'rtc-create-ban-rule',
                search: {
                  from: '/zh-CN/realtime-media/rtc',
                },
                title: '创建规则',
                type: 'page',
                url: '/zh-CN/realtime-media/api',
              },
            ],
            collapsible: true,
            defaultOpen: false,
            id: 'rtc-rest-api',
            title: '服务端 API',
            type: 'section',
          },
        ],
        tabs: [
          {
            id: 'realtime-media',
            title: '实时互动',
            url: '/zh-CN/realtime-media',
          },
        ],
      },
      '/zh-CN/realtime-media/rtc',
    );

    fireEvent.click(await screen.findByRole('button', { name: '打开导航' }));

    const mobileSheet = await screen.findByRole('dialog');
    const toggle = within(mobileSheet).getByRole('button', {
      name: '展开或收起服务端 API子页面',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(mobileSheet).queryByRole('link', { name: '创建规则' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const childLink = within(mobileSheet).getByRole('link', {
      name: '创建规则',
    });
    expect(childLink).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/api?from=%2Fzh-CN%2Frealtime-media%2Frtc',
    );

    fireEvent.click(childLink);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
