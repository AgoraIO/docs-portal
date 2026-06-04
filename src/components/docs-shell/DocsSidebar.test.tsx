import { render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { DocsSidebarNode } from '@/lib/docs-tree';
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
  resetKey = 'introduction',
}: {
  activePath?: string;
  resetKey?: string;
} = {}) {
  const view = render(
    <SidebarProvider>
      <DocsSidebar
        activePath={activePath}
        activeTab="introduction"
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
            activeTab="introduction"
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
});
