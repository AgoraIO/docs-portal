'use client';

import { useEffect, useRef } from 'react';
import { Sidebar as ShadcnSidebar, SidebarContent } from '@/components/ui/sidebar';
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <ShadcnSidebar
      className="hidden border-r border-border lg:flex"
      collapsible="none"
      data-testid="docs-sidebar"
      style={
        {
          '--sidebar-width': '18.5rem',
        } as React.CSSProperties
      }
      variant="inset"
    >
      <SidebarContent
        data-testid="docs-sidebar-scroll"
        ref={scrollContainerRef}
      >
        <div className="px-2 py-4">
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
