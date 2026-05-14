import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { DocsSidebarTree } from './DocsSidebarTree';

function renderSidebarTree(nodes: DocsSidebarNode[], activePath: string) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => (
      <AppProviders>
        <SidebarProvider>
          <DocsSidebarTree
            activePath={activePath}
            nodes={nodes}
            onSelectPath={() => {}}
          />
        </SidebarProvider>
      </AppProviders>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history: createMemoryHistory({
      initialEntries: [activePath],
    }),
  });

  return render(<RouterProvider router={router} />);
}

describe('DocsSidebarTree', () => {
  it('renders section labels and active page links', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/introduction/about-agora',
            title: 'About Agora',
            type: 'page',
            url: '/en/introduction/about-agora',
          },
        ],
        id: 'get-started',
        title: 'Get Started',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/about-agora');

    expect(await screen.findByText('Get Started')).toBeInTheDocument();
    expect(screen.getByTitle('About Agora')).toHaveClass('truncate');
  });

  it('keeps long labels truncated', async () => {
    const longTitle =
      'This is a very long documentation title that should stay visually truncated';

    const tree: DocsSidebarNode[] = [
      {
        id: '/en/introduction/long-page',
        title: longTitle,
        type: 'page',
        url: '/en/introduction/long-page',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/other');

    expect(await screen.findByTitle(longTitle)).toHaveClass('truncate');
  });
});
