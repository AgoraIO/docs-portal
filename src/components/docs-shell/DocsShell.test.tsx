import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import type { SidebarEntry, TabSummary } from '@/lib/docs-tree';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { i18n } from '@/lib/i18n/i18n';
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

  it('renders header tabs, sidebar, toc, and locale switcher', async () => {
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
        initialEntries: ['/en/introduction/index'],
      }),
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Agora Docs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Introduction' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quick Start' })).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole('button', { name: 'Language' }));
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
});
