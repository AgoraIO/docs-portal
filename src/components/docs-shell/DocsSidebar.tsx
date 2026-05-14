'use client';

import { useEffect, useRef } from 'react';
import { Sidebar as ShadcnSidebar, SidebarContent } from '@/components/ui/sidebar';
import { mapSidebarEntriesToTree, type SidebarEntry } from '@/lib/docs-tree';
import { DocsSidebarTree } from './DocsSidebarTree';

export function DocsSidebar({
  activePath,
  activeTab,
  entries,
  onSelectPath,
}: {
  activePath: string;
  activeTab: string;
  entries: SidebarEntry[];
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
      className="hidden border-r border-border lg:block"
      collapsible="none"
      data-testid="docs-sidebar"
      variant="inset"
    >
      <SidebarContent>
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          data-testid="docs-sidebar-scroll"
          ref={scrollContainerRef}
        >
          <div className="px-2 py-4">
            <DocsSidebarTree
              activePath={activePath}
              nodes={mapSidebarEntriesToTree(entries)}
              onSelectPath={onSelectPath}
            />
          </div>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
