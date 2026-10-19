'use client';

import { useEffect } from 'react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';
import { DocsSidebarTree } from './DocsSidebarTree';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsSidebar({
  activePath,
  header,
  nodes,
  onSelectPath,
  resetKey,
}: {
  activePath: string;
  header?: DocsSidebarHeader;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
  resetKey: string;
}) {
  const { isScrollbarVisible, scrollContainerRef, scrollToTop } =
    useTransientScrollbar<HTMLDivElement>();

  useEffect(() => {
    void resetKey;

    scrollToTop();
  }, [resetKey, scrollToTop]);

  return (
    <ShadcnSidebar
      className="hidden overflow-hidden bg-transparent text-[color:var(--ink-3)] lg:sticky lg:top-[var(--docs-shell-header-offset)] lg:flex lg:h-[var(--docs-shell-body-height)] lg:min-h-0 lg:self-start"
      collapsible="none"
      data-testid="docs-sidebar"
      style={
        {
          '--sidebar-width': '16rem',
        } as React.CSSProperties
      }
      variant="inset"
    >
      <SidebarContent
        className={`docs-scrollbar h-full min-h-0 overflow-y-auto ${
          isScrollbarVisible ? 'docs-scrollbar-visible' : ''
        }`}
        data-testid="docs-sidebar-scroll"
        ref={scrollContainerRef}
      >
        <div className="py-4 pr-3 pb-8">
          {header ? (
            <DocsSidebarHeaderBlock
              header={header}
              mode="desktop"
              onSelectPath={onSelectPath}
            />
          ) : null}
          <DocsSidebarTree
            activePath={activePath}
            nodes={nodes}
            onSelectPath={onSelectPath}
          />
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
