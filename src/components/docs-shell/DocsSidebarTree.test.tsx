import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
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
    path: '/$locale/$tab/$',
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
    expect(screen.getByTitle('About Agora')).toHaveClass('whitespace-normal');
  });

  it('allows long labels to wrap instead of truncating to one line', async () => {
    const longTitle =
      'This is a very long documentation title that should wrap across multiple lines';

    const tree: DocsSidebarNode[] = [
      {
        id: '/en/introduction/long-page',
        title: longTitle,
        type: 'page',
        url: '/en/introduction/long-page',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/other');

    expect(await screen.findByTitle(longTitle)).toHaveClass('whitespace-normal');
    expect(screen.getByTitle(longTitle)).toHaveClass('[display:-webkit-box]');
  });

  it('supports collapsible sections', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/get-started/quickstart',
            title: 'Use RESTful API',
            type: 'page',
            url: '/en/ai/get-started/quickstart',
          },
        ],
        collapsible: true,
        id: 'separator-sdk-quickstarts',
        title: 'SDK Quickstarts',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/overview/pricing');

    const toggle = await screen.findByRole('button', {
      name: /SDK Quickstarts/i,
    });

    expect(screen.queryByRole('link', { name: 'Use RESTful API' })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(await screen.findByRole('link', { name: 'Use RESTful API' })).toBeInTheDocument();
  });

  it('opens the realtime section by default on the introduction index page', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/zh-CN/introduction/realtime-audio-video',
            title: '音视频',
            type: 'page',
            url: '/zh-CN/introduction/realtime-audio-video',
          },
          {
            id: '/zh-CN/introduction/messaging',
            title: '消息',
            type: 'page',
            url: '/zh-CN/introduction/messaging',
          },
        ],
        collapsible: true,
        id: 'realtime',
        title: '实时互动',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/introduction/index');

    expect(await screen.findByRole('link', { name: '音视频' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '消息' })).toBeInTheDocument();
  });

  it('renders sdk quickstarts inside the getting started section', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/zh-CN/ai/enable-service',
            title: '开通服务',
            type: 'page',
            url: '/zh-CN/ai/enable-service',
          },
          {
            id: '/zh-CN/ai/start-with-agent-studio',
            title: 'Start with Agent Studio',
            type: 'page',
            url: '/zh-CN/ai/start-with-agent-studio',
          },
        ],
        id: 'getting-started',
        title: '开始使用',
        type: 'section',
      },
      {
        children: [
          {
            id: '/zh-CN/ai/quick-start',
            title: '使用 RESTful API 实现对话式 AI 引擎',
            type: 'page',
            url: '/zh-CN/ai/quick-start',
          },
          {
            id: '/zh-CN/ai/quick-start-go',
            title: '使用 Go SDK 实现对话式 AI 引擎',
            type: 'page',
            url: '/zh-CN/ai/quick-start-go',
          },
          {
            id: '/zh-CN/ai/quick-start-java',
            title: '使用 Java SDK 实现对话式 AI 引擎',
            type: 'page',
            url: '/zh-CN/ai/quick-start-java',
          },
        ],
        collapsible: true,
        id: 'sdk-quickstarts',
        title: 'SDK 快速开始',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/ai/domain-overview');

    expect(await screen.findByRole('link', { name: '开通服务' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SDK 快速开始/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start with Agent Studio' })).toBeInTheDocument();

    const restfulLink = screen.queryByRole('link', {
      name: '使用 RESTful API 实现对话式 AI 引擎',
    });

    expect(restfulLink).not.toBeInTheDocument();
  });

  it('renders nested product sections with a second level of children', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    id: '/zh-CN/realtime-media/online-ktv/scenario-api',
                    title: '场景化 API',
                    type: 'page',
                    url: '/zh-CN/realtime-media/online-ktv/scenario-api',
                  },
                ],
                collapsible: true,
                id: 'nested-paths',
                title: '产品路径',
                type: 'section',
              },
            ],
            collapsible: true,
            id: 'online-ktv',
            title: '在线 KTV',
            type: 'section',
          },
        ],
        collapsible: true,
        id: 'products',
        title: 'Products',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/realtime-media/online-ktv/scenario-api');

    expect(await screen.findByRole('button', { name: '在线 KTV' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '场景化 API' })).toBeInTheDocument();
  });
});
