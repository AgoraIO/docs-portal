import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import type { SidebarEntry, TabSummary } from '@/lib/docs-tree';
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

const sidebar: SidebarEntry[] = [
  {
    id: 'intro',
    title: 'Introduction',
    type: 'page',
    url: '/en/introduction',
  },
  {
    id: 'sep-guides',
    title: 'Guides',
    type: 'separator',
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    type: 'page',
    url: '/en/introduction/quick-start',
  },
];

describe('DocsShell', () => {
  afterEach(async () => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('renders a separate desktop header row and docs tabs strip', async () => {
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
            toc={[
              {
                depth: 2,
                title: 'Overview',
                url: '#overview',
              },
            ]}
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
});
