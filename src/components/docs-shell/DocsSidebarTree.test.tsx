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
        icon: 'BookOpen',
        id: 'get-started',
        title: 'Get Started',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/about-agora');

    expect(await screen.findByText('Get Started')).toBeInTheDocument();
    expect(document.querySelector('.docs-side-icon svg')).toBeInTheDocument();
    expect(screen.getByTitle('About Agora')).toHaveClass('whitespace-normal');

    const activeLink = screen.getByRole('link', { name: 'About Agora' });
    const activeButton = activeLink.closest('[data-sidebar="menu-button"]');

    expect(activeButton).toBeInstanceOf(HTMLElement);
    expect(activeButton?.className).not.toContain('font-semibold');
    expect(activeButton?.className).toContain(
      'data-[active=true]:before:bg-[color:var(--accent-brand)]',
    );
    expect(activeButton?.className).toContain(
      'data-[active=true]:bg-[color:var(--accent-brand-soft)]',
    );
  });

  it('only renders configured icons and does not infer page badges', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/quick-start',
            title: 'Quick Start',
            type: 'page',
            url: '/en/ai/quick-start',
          },
        ],
        id: 'ai-section',
        title: 'AI section without icon',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/quick-start');

    expect(
      await screen.findByText('AI section without icon'),
    ).toBeInTheDocument();
    expect(document.querySelector('.docs-side-icon svg')).toBeNull();
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.queryByText('Beta')).toBeNull();
  });

  it('does not render the sidebar icon wrapper for invalid configured icons', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/quick-start',
            title: 'Quick Start',
            type: 'page',
            url: '/en/ai/quick-start',
          },
        ],
        icon: 'NotARealLucideIcon',
        id: 'ai-section',
        title: 'AI section with invalid icon',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/quick-start');

    expect(
      await screen.findByText('AI section with invalid icon'),
    ).toBeInTheDocument();
    expect(document.querySelector('.docs-side-icon')).toBeNull();
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

    expect(await screen.findByTitle(longTitle)).toHaveClass(
      'whitespace-normal',
    );
    expect(screen.getByTitle(longTitle)).toHaveClass('[display:-webkit-box]');
  });

  it('renders HTTP method badges for OpenAPI endpoint pages', async () => {
    const tree: DocsSidebarNode[] = [
      {
        id: '/en/api-reference/conversational-ai/rest-api/agent/join',
        method: 'POST',
        title: 'Start a conversational AI agent',
        type: 'page',
        url: '/en/api-reference/conversational-ai/rest-api/agent/join',
      },
    ];

    renderSidebarTree(
      tree,
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );

    const link = await screen.findByRole('link', {
      name: /Start a conversational AI agent POST/i,
    });

    expect(link).toBeInTheDocument();
    expect(screen.getByText('POST')).toHaveClass('font-mono');
  });

  it('does not clamp long OpenAPI endpoint labels', async () => {
    const longTitle =
      'Start a conversational AI agent with a very long visible endpoint label';
    const tree: DocsSidebarNode[] = [
      {
        id: '/en/api-reference/conversational-ai/rest-api/agent/join',
        method: 'POST',
        title: longTitle,
        type: 'page',
        url: '/en/api-reference/conversational-ai/rest-api/agent/join',
      },
    ];

    renderSidebarTree(
      tree,
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );

    const label = await screen.findByTitle(longTitle);
    const link = screen.getByRole('link', {
      name: /Start a conversational AI agent with a very long visible endpoint label POST/i,
    });

    expect(label).toHaveClass('whitespace-normal');
    expect(label).not.toHaveClass('[display:-webkit-box]');
    expect(label).not.toHaveClass('[-webkit-line-clamp:2]');
    const linkClasses = link.className.split(/\s+/);
    expect(link.className).toContain('overflow-visible');
    expect(link.className).toContain('min-h-[30px]');
    expect(linkClasses).not.toContain('overflow-hidden');
    expect(linkClasses).not.toContain('h-[30px]');
  });

  it('supports collapsible sections', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
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
        ],
        id: 'ai-section',
        title: 'AI',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/overview/pricing');

    const toggle = await screen.findByRole('button', {
      name: /SDK Quickstarts/i,
    });

    expect(
      screen.queryByRole('link', { name: 'Use RESTful API' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(
      await screen.findByRole('link', { name: 'Use RESTful API' }),
    ).toBeInTheDocument();
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

    expect(
      await screen.findByRole('link', { name: '音视频' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '消息' })).toBeInTheDocument();
  });

  it('opens the get started section by default on the english introduction index page', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/introduction/start-with-ai',
            title: 'Start with AI',
            type: 'page',
            url: '/en/introduction/start-with-ai',
          },
          {
            id: '/en/introduction/build-it-yourself',
            title: 'Build it yourself',
            type: 'page',
            url: '/en/introduction/build-it-yourself',
          },
        ],
        collapsible: true,
        id: 'get-started',
        title: 'Get Started',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/index');

    expect(
      await screen.findByRole('link', { name: 'Start with AI' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Build it yourself' }),
    ).toBeInTheDocument();
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

    expect(
      await screen.findByRole('link', { name: '开通服务' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /SDK 快速开始/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Start with Agent Studio' }),
    ).toBeInTheDocument();

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
                id: '/zh-CN/realtime-media/online-ktv',
                title: '总览',
                type: 'page',
                url: '/zh-CN/realtime-media/online-ktv',
              },
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

    expect(
      await screen.findByRole('link', { name: '总览' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '场景化 API' }),
    ).toBeInTheDocument();
  });

  it('opens the Build subsection by default inside Get started', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/get-started/quickstart',
            title: 'Quickstart',
            type: 'page',
            url: '/en/ai/get-started/quickstart',
          },
        ],
        id: 'get-started',
        title: 'Get started',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/ai/build/start-stop-agent',
            title: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
        ],
        collapsible: true,
        id: 'build',
        title: 'Build',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/get-started/quickstart');

    expect(
      await screen.findByRole('link', { name: 'Quickstart' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Start and stop an agent' }),
    ).toBeInTheDocument();
  });

  it('merges best practices into Build as a hardened and optimize group', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/build/start-stop-agent',
            title: 'Start and stop an agent',
            type: 'page',
            url: '/en/ai/build/start-stop-agent',
          },
        ],
        id: 'build',
        title: 'Build',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/ai/best-practices/audio-setup',
            title: 'Optimize audio quality',
            type: 'page',
            url: '/en/ai/best-practices/audio-setup',
          },
        ],
        id: 'best-practices',
        title: 'Best practices',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/best-practices/audio-setup');

    expect(
      await screen.findByRole('button', { name: /Harden and optimize/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Optimize audio quality' }),
    ).toBeInTheDocument();
  });

  it('opens selected Build child groups by default on the AI overview page', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/start-stop-agent',
                title: 'Start and stop an agent',
                type: 'page',
                url: '/en/ai/build/start-stop-agent',
              },
            ],
            collapsible: false,
            id: 'separator-Create and connect an agent',
            title: 'Create and connect an agent',
            type: 'section',
          },
          {
            children: [
              {
                id: '/en/ai/build/short-term-memory',
                title: 'Keep conversation context across turns',
                type: 'page',
                url: '/en/ai/build/short-term-memory',
              },
            ],
            collapsible: false,
            id: 'separator-Shape the conversation',
            title: 'Shape the conversation',
            type: 'section',
          },
        ],
        id: 'build',
        title: 'Build',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai');

    const toggle = await screen.findByRole('button', {
      name: /Create and connect an agent/i,
    });
    await screen.findByRole('button', {
      name: /Shape the conversation/i,
    });

    expect(
      await screen.findByRole('link', { name: 'Start and stop an agent' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Keep conversation context across turns',
      }),
    ).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(
      screen.queryByRole('link', { name: 'Start and stop an agent' }),
    ).not.toBeInTheDocument();
  });

  it('uses shorter sidebar labels for long Build document titles', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/build-server-client',
                title: 'Build a backend and client from scratch',
                type: 'page',
                url: '/en/ai/build/build-server-client',
              },
            ],
            collapsible: true,
            id: 'separator-Create and connect an agent',
            title: 'Create and connect an agent',
            type: 'section',
          },
        ],
        id: 'build',
        title: 'Build',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/build/build-server-client');

    expect(
      await screen.findByRole('link', { name: 'Build backend and client' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Build a backend and client from scratch',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders updated task-oriented titles from docs metadata', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/architecture',
                title: 'Voice agent app architecture',
                type: 'page',
                url: '/en/ai/build/architecture',
              },
              {
                id: '/en/ai/build/filler-words',
                title: 'Fill response silence',
                type: 'page',
                url: '/en/ai/build/filler-words',
              },
              {
                id: '/en/ai/build/custom-llm',
                title: 'Connect your own LLM service',
                type: 'page',
                url: '/en/ai/build/custom-llm',
              },
              {
                id: '/en/ai/build/webhooks',
                title: 'Receive webhook agent events',
                type: 'page',
                url: '/en/ai/build/webhooks',
              },
              {
                id: '/en/ai/build/transcripts',
                title: 'Display live transcripts',
                type: 'page',
                url: '/en/ai/build/transcripts',
              },
              {
                id: '/en/ai/best-practices/audio-setup',
                title: 'Optimize audio quality',
                type: 'page',
                url: '/en/ai/best-practices/audio-setup',
              },
            ],
            collapsible: true,
            id: 'separator-Create and connect an agent',
            title: 'Create and connect an agent',
            type: 'section',
          },
        ],
        id: 'build',
        title: 'Build',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/build/architecture');

    expect(
      await screen.findByRole('link', {
        name: 'Voice agent app architecture',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Fill response silence' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Connect your own LLM service' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Receive webhook agent events' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Display live transcripts' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Optimize audio quality' }),
    ).toBeInTheDocument();
  });
});
