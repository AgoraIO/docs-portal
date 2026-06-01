'use client';

import { Link } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';
import { useEffect } from 'react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { DocsSidebarTree } from './DocsSidebarTree';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsSidebar({
  activePath,
  activeTab,
  header,
  nodes,
  onSelectPath,
}: {
  activePath: string;
  activeTab: string;
  header?: {
    backHref: string;
    backLabel: string;
    title: string;
  };
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
}) {
  const { isScrollbarVisible, scrollContainerRef, scrollToTop } =
    useTransientScrollbar<HTMLDivElement>();

  useEffect(() => {
    void activeTab;
    void activePath;

    scrollToTop();
  }, [activePath, activeTab, scrollToTop]);

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
        className={`docs-scrollbar h-full min-h-0 overflow-y-auto ${
          isScrollbarVisible ? 'docs-scrollbar-visible' : ''
        }`}
        data-testid="docs-sidebar-scroll"
        ref={scrollContainerRef}
      >
        <div className="py-6 pr-3 pb-12">
          {header ? (
            <div className="mb-4 border-b border-border/70 pb-3">
              <Link
                className="mb-2 flex items-center gap-2 rounded-[7px] px-2 py-1.5 text-[13px] font-medium text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]"
                onClick={onSelectPath}
                params={{}}
                search={{}}
                to={header.backHref}
              >
                <ChevronLeftIcon className="size-4" />
                <span>{header.backLabel}</span>
              </Link>
              <div className="px-2 text-[15px] font-semibold text-[color:var(--ink-1)]">
                {header.title}
              </div>
            </div>
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
