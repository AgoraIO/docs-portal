import { render, screen } from '@testing-library/react';
import { type AnchorHTMLAttributes, createRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { zhCnFaqDataset } from '@/components/faq/faq-dataset';
import { countByCategory } from '@/components/faq/faq-filter';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { getDocsSidebarResetKey } from './DocsShell';
import { DocsSidebar } from './DocsSidebar';
import { useTransientScrollbar } from './useTransientScrollbar';

vi.mock('./useTransientScrollbar', () => ({
  useTransientScrollbar: vi.fn(),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    Link: ({
      children,
      params: _params,
      search: _search,
      to,
      ...props
    }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
      children: ReactNode;
      params?: unknown;
      search?: unknown;
      to: string;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('./DocsSidebarTree', () => ({
  DocsSidebarTree: ({ nodes }: { nodes: DocsSidebarNode[] }) => (
    <div data-testid="docs-sidebar-tree">
      {nodes.map((node) => node.title).join(',')}
    </div>
  ),
}));

const nodes: DocsSidebarNode[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    type: 'page',
    url: '/en/introduction',
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    type: 'page',
    url: '/en/introduction/quick-start',
  },
];

const apiReferenceNodes: DocsSidebarNode[] = [
  {
    id: 'api-reference',
    title: 'API 参考',
    type: 'page',
    url: '/zh-CN/api-reference/api',
  },
  {
    id: 'sdk-downloads',
    title: 'SDK 下载',
    type: 'page',
    url: '/zh-CN/api-reference/sdks',
  },
  {
    children: [],
    id: 'guides',
    title: '指南',
    type: 'section',
  },
];

const scrollToTop = vi.fn();
const useTransientScrollbarMock = vi.mocked(useTransientScrollbar);

function renderDocsSidebar({
  activePath = '/en/introduction',
  locale = 'en',
  sidebarNodes = nodes,
  resetKey = 'introduction',
}: {
  activePath?: string;
  locale?: 'en' | 'zh-CN';
  sidebarNodes?: DocsSidebarNode[];
  resetKey?: string;
} = {}) {
  const view = render(
    <SidebarProvider>
      <DocsSidebar
        activePath={activePath}
        locale={locale}
        nodes={sidebarNodes}
        onSelectPath={() => {}}
        resetKey={resetKey}
      />
    </SidebarProvider>,
  );

  return {
    ...view,
    rerenderSidebar(nextProps: { activePath?: string; resetKey?: string }) {
      view.rerender(
        <SidebarProvider>
          <DocsSidebar
            activePath={nextProps.activePath ?? activePath}
            locale={locale}
            nodes={sidebarNodes}
            onSelectPath={() => {}}
            resetKey={nextProps.resetKey ?? resetKey}
          />
        </SidebarProvider>,
      );
    },
  };
}

describe('DocsSidebar', () => {
  afterEach(() => {
    scrollToTop.mockClear();
    useTransientScrollbarMock.mockReset();
  });

  it('resets scroll on initial render and when resetKey changes', () => {
    useTransientScrollbarMock.mockReturnValue({
      isScrollbarVisible: false,
      scrollContainerRef: createRef<HTMLDivElement>(),
      scrollToTop,
    });

    const { rerenderSidebar } = renderDocsSidebar();

    expect(scrollToTop).toHaveBeenCalledTimes(1);

    rerenderSidebar({ activePath: '/en/introduction/quick-start' });

    expect(scrollToTop).toHaveBeenCalledTimes(1);

    rerenderSidebar({
      activePath: '/en/ai/get-started',
      resetKey: 'ai',
    });

    expect(scrollToTop).toHaveBeenCalledTimes(2);
  });

  it('keeps four primary links fixed above the contextual reference navigation', () => {
    useTransientScrollbarMock.mockReturnValue({
      isScrollbarVisible: false,
      scrollContainerRef: createRef<HTMLDivElement>(),
      scrollToTop,
    });

    const { rerenderSidebar } = renderDocsSidebar({
      activePath: '/zh-CN/api-reference/api',
      locale: 'zh-CN',
      resetKey: 'api-reference',
      sidebarNodes: apiReferenceNodes,
    });

    expect(screen.getByTestId('docs-sidebar-scroll')).toHaveClass(
      'overflow-y-hidden',
    );
    const primaryNav = screen.getByRole('navigation', {
      name: '参考中心',
    });
    const productNav = screen.getByTestId('api-reference-product-nav');

    expect(screen.queryByTestId('docs-sidebar-tree')).not.toBeInTheDocument();
    expect(primaryNav).toHaveTextContent('API 参考');
    expect(primaryNav).toHaveTextContent('SDK 下载');
    expect(primaryNav).toHaveTextContent('示例配方');
    expect(primaryNav).toHaveTextContent('常见问题');
    expect(screen.getByRole('link', { name: /API 参考/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      primaryNav.compareDocumentPosition(productNav) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    rerenderSidebar({
      activePath: '/zh-CN/api-reference/sdks',
      resetKey: 'api-reference',
    });

    expect(
      screen.queryByTestId('api-reference-product-nav'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('sdk-download-product-nav')).toBeVisible();

    rerenderSidebar({
      activePath: '/zh-CN/api-reference/recipes',
      resetKey: 'api-reference',
    });

    expect(
      screen.queryByTestId('sdk-download-product-nav'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('faq-category-nav')).not.toBeInTheDocument();

    rerenderSidebar({
      activePath: '/zh-CN/api-reference/faq/integration',
      resetKey: 'api-reference',
    });

    expect(screen.getByTestId('faq-category-nav')).toBeVisible();
    const integrationLink = screen.getByRole('link', { name: /集成类/ });
    const counts = countByCategory(
      zhCnFaqDataset.items,
      zhCnFaqDataset.categories,
    );

    expect(integrationLink).toHaveAttribute('aria-current', 'location');
    expect(integrationLink).toHaveTextContent(
      String(counts['integration-issues']),
    );

    rerenderSidebar({
      activePath: '/zh-CN/api-reference/rtc/android/overview',
      resetKey: 'api-reference',
    });

    expect(
      screen.queryByTestId('reference-center-primary-nav'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('docs-sidebar-tree')).toBeVisible();
  });
});

describe('getDocsSidebarResetKey', () => {
  it('uses the active tab when the sidebar has no scoped header', () => {
    expect(getDocsSidebarResetKey('introduction')).toBe('introduction');
  });

  it('includes scoped header and current version identity', () => {
    const header: DocsSidebarHeader = {
      backHref: '/en/api-reference/rtc',
      backLabel: 'RTC',
      title: 'Android API Reference',
      versionSwitcher: {
        currentId: 'current',
        versions: [],
      },
    };

    const currentKey = getDocsSidebarResetKey('api-reference', header);
    const nextVersionKey = getDocsSidebarResetKey('api-reference', {
      ...header,
      versionSwitcher: {
        currentId: '4.6.0',
        versions: [],
      },
    });
    const nextScopeKey = getDocsSidebarResetKey('api-reference', {
      ...header,
      backHref: '/en/api-reference/rtc/ios',
      title: 'iOS API Reference',
    });

    expect(currentKey).toBe(
      'api-reference\u0000Android API Reference\u0000/en/api-reference/rtc\u0000current',
    );
    expect(nextVersionKey).not.toBe(currentKey);
    expect(nextScopeKey).not.toBe(currentKey);
  });
});
