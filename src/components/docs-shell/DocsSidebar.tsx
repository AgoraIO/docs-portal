'use client';

import { useEffect, useRef } from 'react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { DocsSidebarTree } from './DocsSidebarTree';

export function DocsSidebar({
  activePath,
  activeTab,
  nodes,
  onSelectPath,
}: {
  activePath: string;
  activeTab: string;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void activeTab;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <ShadcnSidebar
      className="hidden h-full min-h-0 overflow-hidden bg-transparent text-[color:var(--ink-3)] lg:flex"
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
        className="h-full min-h-0 overflow-y-auto"
        data-testid="docs-sidebar-scroll"
        ref={scrollContainerRef}
      >
        <div className="py-6 pr-3 pb-12">
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
