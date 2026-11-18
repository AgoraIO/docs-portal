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
  it('shows a same-tab navigation arrow for marked internal page links', async () => {
    const demoLink: DocsSidebarNode = {
      id: 'introduction-demo-gallery',
      showNavigationArrow: true,
      title: '体验 Demo',
      type: 'page',
      url: '/zh-CN/reference/demo',
    };
    const tree: DocsSidebarNode[] = [
      {
        children: [demoLink],
        defaultOpen: true,
        id: 'general-references',
        title: '通用参考',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/introduction');

    const link = await screen.findByRole('link', { name: '体验 Demo' });
    expect(link.querySelector('.lucide-arrow-right')).toBeInTheDocument();
    expect(link.querySelector('.lucide-external-link')).not.toBeInTheDocument();
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('opens sections with defaultOpen true on initial render', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                id: 'sdk-extensions-quick-start',
                title: 'Quickstart',
                type: 'page',
                url: '/en/realtime-media/sdk-extensions/quickstart',
              },
            ],
            collapsible: true,
            defaultOpen: true,
            id: 'sdk-extensions-build',
            title: 'Build and integrate',
            type: 'section',
          },
        ],
        id: 'sdk-extensions',
        title: 'SDK Extensions',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/en/realtime-media/sdk-extensions');

    expect(
      await screen.findByRole('button', { name: 'Build and integrate' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: 'Quickstart' }),
    ).toBeInTheDocument();
  });

  it('keeps embedded service API entries collapsed until clicked', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            children: [
              {
                id: 'rtc-create-ban-rule',
                method: 'POST',
                search: {
                  from: '/zh-CN/realtime-media/rtc',
                },
                title: '创建规则',
                type: 'page',
                url: '/zh-CN/api-reference/api-ref/rtc/create-ban-rule',
              },
            ],
            collapsible: true,
            defaultOpen: false,
            id: 'rtc-rest-api',
            title: '服务端 API',
            type: 'section',
          },
        ],
        id: 'rtc-reference',
        title: '参考',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/realtime-media/rtc');

    const toggle = await screen.findByRole('button', { name: '服务端 API' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: '创建规则' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /创建规则/ })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/api-ref/rtc/create-ban-rule?from=%2Fzh-CN%2Frealtime-media%2Frtc',
    );
    expect(
      screen.getByText('POST', { selector: '[data-openapi-method]' }),
    ).toBeInTheDocument();
  });

  it('links the RTC client API entry to the filtered API reference page', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: 'rtc-client-api-reference',
            linked: true,
            search: {
              apiType: 'client',
              product: 'rtc',
            },
            title: '客户端 API',
            type: 'page',
            url: '/zh-CN/api-reference/api',
          },
          {
            id: 'rtc-rest-api',
            linked: true,
            title: 'RESTful API',
            type: 'page',
            url: '/zh-CN/api-reference/api-ref/rtc',
          },
        ],
        id: 'rtc-reference',
        title: '参考',
        type: 'section',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/realtime-media/rtc');

    const clientApiLink = await screen.findByRole('link', {
      name: '客户端 API',
    });
    const clientApiUrl = new URL(
      clientApiLink.getAttribute('href') ?? '',
      window.location.origin,
    );

    expect(clientApiUrl.pathname).toBe('/zh-CN/api-reference/api');
    expect(clientApiUrl.searchParams.get('product')).toBe('rtc');
    expect(clientApiUrl.searchParams.get('apiType')).toBe('client');
    expect(clientApiLink).toHaveAttribute('target', '_blank');
    expect(clientApiLink).toHaveAttribute('rel', 'noreferrer noopener');
    expect(screen.getByRole('link', { name: 'RESTful API' })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/api-ref/rtc',
    );
  });

  it('renders external page links with a native anchor', async () => {
    const tree: DocsSidebarNode[] = [
      {
        external: true,
        href: 'https://example.com/resources',
        id: 'https://example.com/resources',
        title: 'External Resource',
        type: 'page',
        url: 'https://example.com/resources',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/introduction');

    const link = await screen.findByRole('link', {
      name: 'External Resource',
    });

    expect(link).toHaveAttribute('href', 'https://example.com/resources');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.querySelector('.lucide-external-link')).toBeInTheDocument();
  });

  it('renders HTTP method badges for OpenAPI endpoint pages', async () => {
    const tree: DocsSidebarNode[] = [
      {
        id: '/zh-CN/api-reference/api-ref/conversational-ai/join',
        method: 'POST',
        title: 'Start a conversational AI agent',
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/conversational-ai/join',
      },
    ];

    renderSidebarTree(
      tree,
      '/zh-CN/api-reference/api-ref/conversational-ai/join',
    );

    const link = await screen.findByRole('link', {
      name: /Start a conversational AI agent POST/i,
    });

    expect(link).toBeInTheDocument();
    expect(
      screen.getByText('POST', { selector: '[data-openapi-method]' }),
    ).toHaveClass('font-mono');
  });

  it.each([
    ['GET', 'blue'],
    ['POST', 'green'],
    ['PUT', 'amber'],
    ['PATCH', 'amber'],
    ['DELETE', 'red'],
  ])(
    'colors active and inactive %s endpoint badges in both themes',
    async (method, color) => {
      const activePath = '/zh-CN/api-reference/api-ref/conversational-ai/join';
      const inactivePath = '/zh-CN/api-reference/api-ref/cloud-recording/query';
      renderSidebarTree(
        [
          {
            id: activePath,
            method,
            title: 'ConvoAI endpoint',
            type: 'page',
            url: activePath,
          },
          {
            id: 'cloud-recording',
            title: 'Cloud recording',
            type: 'section',
            children: [
              {
                id: inactivePath,
                method,
                title: 'Recording endpoint',
                type: 'page',
                url: inactivePath,
              },
            ],
          },
          {
            id: '/zh-CN/introduction',
            title: 'Overview',
            type: 'page',
            url: '/zh-CN/introduction',
          },
        ],
        activePath,
      );

      for (const title of ['ConvoAI endpoint', 'Recording endpoint']) {
        const link = await screen.findByRole('link', {
          name: `${title} ${method}`,
        });
        const badge = link.querySelector('[data-openapi-method]');
        expect(badge).toHaveClass(
          `bg-${color}-100`,
          `text-${color}-800`,
          `dark:bg-${color}-900`,
          `dark:text-${color}-100`,
        );
        expect(badge).not.toHaveClass('text-[color:var(--ink-4)]');
        expect(link).toHaveAttribute(
          'href',
          title === 'ConvoAI endpoint' ? activePath : inactivePath,
        );
      }
      expect(
        screen.getByRole('link', { name: 'Overview' }).children,
      ).toHaveLength(1);
    },
  );

  it('wraps full endpoint titles inline around a right-aligned method badge', async () => {
    const longTitle =
      'Start a conversational AI agent with a very long visible endpoint label';
    const tree: DocsSidebarNode[] = [
      {
        id: '/zh-CN/api-reference/api-ref/conversational-ai/join',
        method: 'POST',
        title: longTitle,
        type: 'page',
        url: '/zh-CN/api-reference/api-ref/conversational-ai/join',
      },
    ];

    renderSidebarTree(
      tree,
      '/zh-CN/api-reference/api-ref/conversational-ai/join',
    );

    const label = await screen.findByTitle(longTitle);
    const link = screen.getByRole('link', {
      name: /Start a conversational AI agent with a very long visible endpoint label POST/i,
    });

    expect(label.parentElement).toHaveClass(
      'flow-root',
      'min-w-0',
      'flex-1',
      'whitespace-normal',
    );
    expect(label).toHaveClass('[overflow-wrap:anywhere]');
    expect(link.querySelector('[data-openapi-method]')).toHaveClass(
      'float-right',
      'whitespace-nowrap',
    );
    const linkClasses = link.className.split(/\s+/);
    expect(link.className).toContain('overflow-visible');
    expect(link.className).toContain('min-h-[28px]');
    expect(link.className).toContain('h-auto');
    expect(link.className).toContain('items-center');
    expect(linkClasses).not.toContain('overflow-hidden');
    expect(linkClasses).not.toContain('h-[30px]');
  });

  it.each([
    ['rtc', '计费与限制', 'reference/billing-strategy', '计费策略'],
    ['rtm', '计费说明', 'reference/billing/billing-strategy', '计费说明'],
    [
      'cloud-recording',
      '计费说明',
      'reference/billing-strategy/billing',
      '单流和合流录制',
    ],
    ['local-server-recording', '计费说明', 'reference/billing', '计费说明'],
    ['media-push', '计费说明', 'reference/billing', '计费说明'],
    ['media-pull', '计费说明', 'reference/billing', '计费说明'],
    ['rtmp-gateway', '计费说明', 'reference/billing', '计费说明'],
    ['whiteboard/fastboard-sdk', '计费说明', 'reference/billing', '计费说明'],
    ['whiteboard/whiteboard-sdk', '计费说明', 'reference/billing', '计费说明'],
  ])(
    'keeps the %s billing root section collapsible',
    async (product, title, pagePath, pageTitle) => {
      const url = `/zh-CN/realtime-media/${product}/${pagePath}`;

      const tree: DocsSidebarNode[] = [
        {
          children: [
            {
              id: url,
              title: pageTitle,
              type: 'page',
              url,
            },
          ],
          collapsible: true,
          id: `separator-${title}`,
          title,
          type: 'section',
        },
      ];

      renderSidebarTree(tree, `/zh-CN/realtime-media/${product}`);

      const toggle = await screen.findByRole('button', {
        name: title,
      });

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: '计费说明' })).toBeNull();

      fireEvent.click(toggle);

      expect(
        await screen.findByRole('link', { name: pageTitle }),
      ).toBeInTheDocument();
    },
  );

  it('renders linked page indicators inside expanded sections', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/zh-CN/api-reference/api-ref/conversational-ai',
            linked: true,
            title: 'RESTful API',
            type: 'page',
            url: '/zh-CN/api-reference/api-ref/conversational-ai',
          },
          {
            id: '/zh-CN/ai/reference/pricing',
            title: '计费说明',
            type: 'page',
            url: '/zh-CN/ai/reference/pricing',
          },
        ],
        collapsible: true,
        id: 'folder-zh-CN:ai/reference',
        title: '参考',
        type: 'section',
      },
    ];

    const { container } = renderSidebarTree(
      tree,
      '/zh-CN/api-reference/api-ref/conversational-ai',
    );

    const link = await screen.findByRole('link', { name: 'RESTful API' });

    expect(link).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/api-ref/conversational-ai',
    );
    expect(link.querySelector('.lucide-external-link')).toBeInTheDocument();
    expect(
      container
        .querySelector('a[href="/zh-CN/ai/reference/pricing"]')
        ?.querySelector('.lucide-external-link'),
    ).toBeNull();
  });

  it('keeps an explicitly open root group collapsible beside direct overview links', async () => {
    const root = '/zh-CN/api-reference/rtc/react-sdk';
    const overview: DocsSidebarNode = {
      id: `${root}/overview`,
      title: '概览',
      type: 'page',
      url: `${root}/overview`,
    };
    renderSidebarTree(
      [
        overview,
        {
          id: 'web-sdk',
          title: 'Web SDK API',
          type: 'section',
          collapsible: true,
          defaultOpen: true,
          children: [
            {
              id: 'client',
              title: 'IAgoraRTCClient',
              type: 'page',
              url: `${root}/web-sdk/interfaces/iagorartcclient`,
            },
          ],
        },
      ],
      overview.url,
    );

    const toggle = await screen.findByRole('button', { name: 'Web SDK API' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: 'IAgoraRTCClient' }),
    ).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'IAgoraRTCClient' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '概览' })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: 'IAgoraRTCClient' }),
    ).toBeInTheDocument();
  });

  it('renders a linked section with children as a link and separate collapse toggle', async () => {
    const tree: DocsSidebarNode[] = [
      {
        children: [
          {
            id: '/zh-CN/api-reference/faq/integration',
            title: 'Integration',
            type: 'page',
            url: '/zh-CN/api-reference/faq/integration',
          },
        ],
        collapsible: true,
        id: 'folder-faq',
        title: 'FAQ',
        type: 'section',
        url: '/zh-CN/api-reference/faq',
      },
    ];

    renderSidebarTree(tree, '/zh-CN/api-reference/other');

    expect(await screen.findByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/faq',
    );
    const toggle = await screen.findByRole('button', { name: 'FAQ 子页面' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Children stay hidden until the row is clicked.
    expect(
      screen.queryByRole('link', { name: 'Integration' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(
      await screen.findByRole('link', { name: 'Integration' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FAQ 子页面' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
