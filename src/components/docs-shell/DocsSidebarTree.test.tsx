import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
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
  it('renders section labels without configured sidebar icons and active page links', async () => {
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

    const sectionTitle = await screen.findByText('Get Started');

    expect(sectionTitle).toBeInTheDocument();
    expect(document.querySelector('.docs-side-icon')).toBeNull();
    expect(document.querySelector('.docs-side-icon svg')).toBeNull();
    expect(screen.getByTitle('About Agora')).toHaveClass('whitespace-normal');

    const activeLink = screen.getByRole('link', { name: 'About Agora' });
    const activeButton = activeLink.closest('[data-sidebar="menu-button"]');

    expect(activeButton).toBeInstanceOf(HTMLElement);
    expect(activeButton).toHaveClass(
      'min-h-[28px]',
      'h-auto',
      'items-center',
      'py-1',
    );
    const sectionLabel = sectionTitle.closest(
      '[data-slot="sidebar-group-label"]',
    );
    expect(sectionLabel).toHaveClass(
      'mb-1.5',
      'gap-2',
      'items-center',
      'text-[12px]',
      'font-bold',
      'text-[color:var(--ink-2)]',
    );
    expect(sectionLabel?.querySelector('.docs-side-icon')).toBeNull();
    expect(activeButton?.className).toContain(
      'data-[active=true]:font-semibold',
    );
    expect(activeButton?.className).toContain(
      'data-[active=true]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-brand)_22%,transparent)]',
    );
    expect(activeButton?.className).toContain(
      'data-[active=true]:before:bg-[color:var(--accent-brand)]',
    );
    expect(activeButton?.className).toContain(
      'data-[active=true]:bg-[color:var(--accent-brand-soft)]',
    );
  });

  it('does not render sidebar category icons or infer page badges', async () => {
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
        icon: 'Bot',
        id: 'ai-section',
        title: 'AI section with icon metadata',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/ai/quick-start');

    expect(
      await screen.findByText('AI section with icon metadata'),
    ).toBeInTheDocument();
    expect(document.querySelector('.docs-side-icon')).toBeNull();
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

  it('removes configured icons from nested, linked, and merged section headings', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/ai/enable-service',
            title: 'Enable service',
            type: 'page',
            url: '/en/ai/enable-service',
          },
        ],
        icon: 'BookOpen',
        id: 'getting-started',
        title: 'Getting Started',
        type: 'section',
      },
      {
        children: [
          {
            id: '/en/ai/quick-start',
            title: 'Quickstart',
            type: 'page',
            url: '/en/ai/quick-start',
          },
        ],
        collapsible: true,
        icon: 'Rocket',
        id: 'sdk-quickstarts',
        title: 'SDK Quickstarts',
        type: 'section',
      },
      {
        children: [
          {
            children: [
              {
                id: '/en/ai/build/tools',
                title: 'Tool setup',
                type: 'page',
                url: '/en/ai/build/tools',
              },
            ],
            collapsible: true,
            icon: 'Wrench',
            id: 'nested-tools',
            title: 'Nested tools',
            type: 'section',
          },
        ],
        icon: 'Hammer',
        id: 'build',
        title: 'Build',
        type: 'section',
      },
      {
        children: [],
        collapsible: true,
        icon: 'CircleHelp',
        id: 'faq',
        title: 'FAQ',
        type: 'section',
        url: '/en/ai/faq',
      },
    ];

    renderSidebarTree(tree, '/en/ai/enable-service');

    expect(
      await screen.findByRole('link', { name: 'Enable service' }),
    ).toBeInTheDocument();

    const quickstartsToggle = screen.getByRole('button', {
      name: /SDK Quickstarts/i,
    });
    const nestedToggle = screen.getByRole('button', { name: /Nested tools/i });

    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FAQ/i })).toHaveAttribute(
      'href',
      '/en/ai/faq',
    );
    expect(document.querySelector('.docs-side-icon')).toBeNull();
    expect(document.querySelector('.docs-side-icon svg')).toBeNull();
    expect(quickstartsToggle.firstElementChild).toHaveClass(
      'flex',
      'min-w-0',
      'items-center',
      'gap-2',
    );
    expect(nestedToggle.firstElementChild).toHaveClass(
      'flex',
      'min-w-0',
      'items-center',
      'gap-2',
    );
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

    const label = await screen.findByTitle(longTitle);
    const link = screen.getByRole('link', { name: longTitle });

    expect(label).toHaveClass('whitespace-normal');
    expect(label).toHaveClass('break-words');
    expect(label).not.toHaveClass('[display:-webkit-box]');
    expect(label).not.toHaveClass('[-webkit-line-clamp:2]');
    expect(link.className).toContain('overflow-visible');
  });

  it('renders linked external SDK API jumps with a chevron in a new tab', async () => {
    const tree: DocsSidebarNode[] = [
      {
        external: true,
        href: '/en/api-reference/api-ref',
        id: '/en/api-reference/api-ref',
        linked: true,
        title: 'SDK API reference',
        type: 'page',
        url: '/en/api-reference/api-ref',
      },
    ];

    renderSidebarTree(tree, '/en/introduction');

    const link = await screen.findByRole('link', {
      name: 'SDK API reference',
    });

    expect(link).toHaveAttribute('href', '/en/api-reference/api-ref');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.querySelector('svg')).toHaveClass('-rotate-90');
  });

  it('renders linked external REST API jumps with a chevron in a new tab', async () => {
    const tree: DocsSidebarNode[] = [
      {
        external: true,
        href: '/en/api-reference/api-ref/rtc',
        id: '/en/api-reference/api-ref/rtc',
        linked: true,
        title: 'RESTful API',
        type: 'page',
        url: '/en/api-reference/api-ref/rtc',
      },
    ];

    renderSidebarTree(tree, '/en/introduction');

    const link = await screen.findByRole('link', {
      name: 'RESTful API',
    });

    expect(link).toHaveAttribute('href', '/en/api-reference/api-ref/rtc');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.querySelector('svg')).toHaveClass('-rotate-90');
  });

  it('renders linked internal jumps with a chevron in the current tab', async () => {
    const tree: DocsSidebarNode[] = [
      {
        id: '/en/api-reference/recipes',
        linked: true,
        title: 'API recipes',
        type: 'page',
        url: '/en/api-reference/recipes',
      },
    ];

    renderSidebarTree(tree, '/en/introduction');

    const link = await screen.findByRole('link', {
      name: 'API recipes',
    });

    expect(link).toHaveAttribute('href', '/en/api-reference/recipes');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
    expect(link.querySelector('svg')).toHaveClass('-rotate-90');
  });

  it('renders HTTP method badges for OpenAPI endpoint pages', async () => {
    const tree: DocsSidebarNode[] = [
      {
        id: '/en/api-reference/api-ref/conversational-ai/join',
        method: 'POST',
        title: 'Start a conversational AI agent',
        type: 'page',
        url: '/en/api-reference/api-ref/conversational-ai/join',
      },
    ];

    renderSidebarTree(tree, '/en/api-reference/api-ref/conversational-ai/join');

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
        id: '/en/api-reference/api-ref/conversational-ai/join',
        method: 'POST',
        title: longTitle,
        type: 'page',
        url: '/en/api-reference/api-ref/conversational-ai/join',
      },
    ];

    renderSidebarTree(tree, '/en/api-reference/api-ref/conversational-ai/join');

    const label = await screen.findByTitle(longTitle);
    const link = screen.getByRole('link', {
      name: /Start a conversational AI agent with a very long visible endpoint label POST/i,
    });

    expect(label).toHaveClass('whitespace-normal');
    expect(label).not.toHaveClass('[display:-webkit-box]');
    expect(label).not.toHaveClass('[-webkit-line-clamp:2]');
    const linkClasses = link.className.split(/\s+/);
    expect(link.className).toContain('overflow-visible');
    expect(link.className).toContain('min-h-[28px]');
    expect(link.className).toContain('h-auto');
    expect(link.className).toContain('items-center');
    expect(linkClasses).not.toContain('overflow-hidden');
    expect(linkClasses).not.toContain('h-[30px]');
  });

  it('uses compact vertical spacing for sidebar entries and section labels', async () => {
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

    const sectionLabel = await screen.findByText('Get Started');
    const labelWrapper = sectionLabel.closest('[data-sidebar="group-label"]');
    const activeLink = screen.getByRole('link', { name: 'About Agora' });
    const activeButton = activeLink.closest('[data-sidebar="menu-button"]');

    expect(labelWrapper).toHaveClass(
      'mb-1.5',
      'py-0.5',
      'gap-2',
      'items-center',
      'text-[12px]',
      'font-bold',
      'text-[color:var(--ink-2)]',
    );
    expect(labelWrapper?.querySelector('.docs-side-icon')).toBeNull();
    expect(activeButton).toHaveClass('min-h-[28px]', 'py-1');
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

    renderSidebarTree(tree, '/en/ai/reference/pricing');

    const toggle = await screen.findByRole('button', {
      name: /SDK Quickstarts/i,
    });
    expect(toggle).toHaveClass('font-medium', 'text-[color:var(--ink-3)]');
    expect(toggle).not.toHaveClass(
      'font-semibold',
      'text-[color:var(--ink-2)]',
    );
    expect(toggle.closest('[data-sidebar="menu-item"]')).not.toHaveClass(
      'mt-5',
    );

    expect(
      screen.queryByRole('link', { name: 'Use RESTful API' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    const link = await screen.findByRole('link', { name: 'Use RESTful API' });
    const expandedChildren = link.closest('[data-sidebar="menu-sub"]');

    expect(link).toBeInTheDocument();
    expect(link.closest('[data-sidebar="menu-sub-button"]')).toHaveClass(
      'data-[active=true]:font-semibold',
      'data-[active=true]:before:bg-[color:var(--accent-brand)]',
    );
    expect(expandedChildren).toHaveClass(
      'border-l',
      'border-[color:var(--line-strong)]',
      'pl-3',
    );
  });

  it('renders linked collapsed sections as navigation entries', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [],
            collapsible: true,
            id: 'folder-realtime-media-rtc-folder',
            title: 'Voice & Video',
            type: 'section',
            url: '/en/realtime-media/rtc',
          },
        ],
        collapsible: true,
        id: 'separator-Build Live Interaction',
        title: 'Build Live Interaction',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/realtime-media');

    const link = await screen.findByRole('link', {
      name: /Voice & Video/i,
    });

    expect(link).toHaveAttribute('href', '/en/realtime-media/rtc');
    expect(
      screen.queryByRole('button', { name: /Voice & Video/i }),
    ).not.toBeInTheDocument();
  });

  it('renders reference product sections as always-expanded headings', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/api-reference/conversational-ai/android',
            title: 'Android',
            type: 'page',
            url: '/en/api-reference/conversational-ai/android',
          },
          {
            id: '/en/api-reference/conversational-ai/ios',
            title: 'iOS',
            type: 'page',
            url: '/en/api-reference/conversational-ai/ios',
          },
        ],
        collapsible: true,
        id: 'convoai-section',
        title: 'Conversational AI',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/api-reference/conversational-ai/android');

    expect(await screen.findByText('Conversational AI')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Android' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'iOS' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Conversational AI/i }),
    ).toBeNull();
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

  it('renders a direct introduction page link without the get started section', async () => {
    const tree: DocsSidebarNode[] = [
      {
        id: '/en/introduction/start-with-ai',
        title: 'Start with AI',
        type: 'page',
        url: '/en/introduction/start-with-ai',
      },
    ];

    renderSidebarTree(tree, '/en/introduction/index');

    expect(
      await screen.findByRole('link', { name: 'Start with AI' }),
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
    expect(
      screen
        .getByRole('link', { name: '场景化 API' })
        .closest('div[class*="border-l"]'),
    ).toHaveClass('border-[color:var(--line-strong)]', 'pl-3');
  });

  it('opens a collapsed nested section when activePath moves into it', async () => {
    const tree: DocsSidebarNode[] = [
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
              {
                id: '/en/realtime-media/rtm/build/channels',
                title: 'Stream channels',
                type: 'page',
                url: '/en/realtime-media/rtm/build/channels',
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
    function SidebarHarness() {
      const [activePath, setActivePath] = useState(
        '/en/realtime-media/video/overview',
      );

      return (
        <>
          <button
            onClick={() =>
              setActivePath('/en/realtime-media/rtm/build/presence')
            }
            type="button"
          >
            Go to presence
          </button>
          <button
            onClick={() =>
              setActivePath('/en/realtime-media/rtm/build/channels')
            }
            type="button"
          >
            Go to channels
          </button>
          <DocsSidebarTree
            activePath={activePath}
            nodes={tree}
            onSelectPath={() => {}}
          />
        </>
      );
    }
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$',
      component: () => (
        <AppProviders>
          <SidebarProvider>
            <SidebarHarness />
          </SidebarProvider>
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/realtime-media/video/overview'],
      }),
    });

    render(<RouterProvider router={router} />);

    const signalingToggle = await screen.findByRole('button', {
      name: /Signaling/i,
    });

    expect(signalingToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Presence' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to presence' }));

    expect(
      await screen.findByRole('link', { name: 'Presence' }),
    ).toHaveAttribute('data-active', 'true');
    expect(signalingToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(signalingToggle);

    expect(signalingToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Presence' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to channels' }));

    expect(
      await screen.findByRole('link', { name: 'Stream channels' }),
    ).toHaveAttribute('data-active', 'true');
    expect(signalingToggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps defaultOpen false sections collapsed even when a child is active', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/api-reference/faq',
            title: 'Overview',
            type: 'page',
            url: '/en/api-reference/faq',
          },
          {
            id: '/en/api-reference/faq/integration',
            title: 'Integration',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        collapsible: true,
        defaultOpen: false,
        id: 'folder-faq-folder',
        title: 'FAQ',
        type: 'section',
        url: '/en/api-reference/faq',
      },
    ];
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
              activePath="/en/api-reference/faq/integration"
              nodes={tree}
              onSelectPath={() => {}}
            />
          </SidebarProvider>
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/en/api-reference/faq/integration'],
      }),
    });

    render(<RouterProvider router={router} />);

    const faqToggle = await screen.findByRole('button', { name: /FAQ/i });

    expect(faqToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Integration' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the Build subsection collapsed by default inside Get started', async () => {
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
      screen.queryByRole('link', { name: 'Start and stop an agent' }),
    ).not.toBeInTheDocument();
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

  it('keeps Create and connect an agent collapsed by default on the AI overview page', async () => {
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
            children: [
              {
                id: '/en/ai/build/start-stop-agent',
                title: 'Start and stop an agent',
                type: 'page',
                url: '/en/ai/build/start-stop-agent',
              },
            ],
            collapsible: true,
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

    await screen.findByTitle('Build');

    expect(
      await screen.findByRole('button', {
        name: /Create and connect an agent/i,
      }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('button', { name: /Shape the conversation/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Shape the conversation')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Start and stop an agent' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Keep conversation context across turns',
      }),
    ).toBeInTheDocument();
  });

  it('renders a linked section with children as a whole-row collapse toggle', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/en/api-reference/faq/integration',
            title: 'Integration',
            type: 'page',
            url: '/en/api-reference/faq/integration',
          },
        ],
        collapsible: true,
        id: 'folder-faq',
        title: 'FAQ',
        type: 'section',
        url: '/en/api-reference/faq',
      },
    ];

    renderSidebarTree(tree, '/en/api-reference/other');

    // The whole row is a single collapse toggle button — not a navigating link.
    const toggle = await screen.findByRole('button', { name: 'FAQ' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'FAQ' })).toBeNull();

    // Children stay hidden until the row is clicked.
    expect(
      screen.queryByRole('link', { name: 'Integration' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(
      await screen.findByRole('link', { name: 'Integration' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FAQ' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('marks an active linked section without children as the current page', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [],
        id: 'folder-rtc',
        title: 'Realtime Communication',
        type: 'section',
        url: '/en/realtime-media/rtc',
      },
    ];

    renderSidebarTree(tree, '/en/realtime-media/rtc');

    expect(
      await screen.findByRole('link', { name: 'Realtime Communication' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('renders full sidebar labels for long Build document titles', async () => {
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
      await screen.findByRole('link', {
        name: 'Build a backend and client from scratch',
      }),
    ).toBeInTheDocument();
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
