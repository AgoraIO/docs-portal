import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { getDocsSidebarResetKey } from './DocsShell';
import { DocsSidebar } from './DocsSidebar';
import { useTransientScrollbar } from './useTransientScrollbar';

vi.mock('./useTransientScrollbar', () => ({
  useTransientScrollbar: vi.fn(),
}));

vi.mock('./DocsSidebarTree', () => ({
  DocsSidebarTree: () => <div data-testid="docs-sidebar-tree" />,
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

const scrollToTop = vi.fn();
const useTransientScrollbarMock = vi.mocked(useTransientScrollbar);

function renderDocsSidebar({
  activePath = '/en/introduction',
  locale = 'en',
  resetKey = 'introduction',
}: {
  activePath?: string;
  locale?: 'en' | 'zh-CN';
  resetKey?: string;
} = {}) {
  const view = render(
    <SidebarProvider>
      <DocsSidebar
        activePath={activePath}
        locale={locale}
        nodes={nodes}
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
            nodes={nodes}
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

  it('keeps the root links fixed above a product scroller on the Chinese API catalog', () => {
    useTransientScrollbarMock.mockReturnValue({
      isScrollbarVisible: false,
      scrollContainerRef: createRef<HTMLDivElement>(),
      scrollToTop,
    });

    const { rerenderSidebar } = renderDocsSidebar({
      activePath: '/zh-CN/api-reference/api',
      locale: 'zh-CN',
      resetKey: 'api-reference',
    });

    expect(screen.getByTestId('docs-sidebar-scroll')).toHaveClass(
      'overflow-y-hidden',
    );
    expect(screen.getByTestId('docs-sidebar-tree')).toBeVisible();
    expect(screen.getByTestId('api-reference-product-nav')).toBeVisible();

    rerenderSidebar({
      activePath: '/zh-CN/api-reference/sdks',
      resetKey: 'api-reference',
    });

    expect(
      screen.queryByTestId('api-reference-product-nav'),
    ).not.toBeInTheDocument();
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
