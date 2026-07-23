'use client';

import { useEffect } from 'react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/cn';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { ApiReferenceProductNav } from './ApiReferenceProductNav';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';
import { DocsSidebarTree } from './DocsSidebarTree';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsSidebar({
  activePath,
  header,
  locale,
  nodes,
  onSelectPath,
  resetKey,
}: {
  activePath: string;
  header?: DocsSidebarHeader;
  locale: AppLocale;
  nodes: DocsSidebarNode[];
  onSelectPath: () => void;
  resetKey: string;
}) {
  const { isScrollbarVisible, scrollContainerRef, scrollToTop } =
    useTransientScrollbar<HTMLDivElement>();
  const showsApiReferenceProductNav =
    locale === 'zh-CN' &&
    activePath.replace(/\/+$/, '') === '/zh-CN/api-reference/api';

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
        className={cn(
          'h-full min-h-0',
          showsApiReferenceProductNav
            ? 'overflow-y-hidden'
            : 'docs-scrollbar overflow-y-auto',
          !showsApiReferenceProductNav &&
            isScrollbarVisible &&
            'docs-scrollbar-visible',
        )}
        data-testid="docs-sidebar-scroll"
        ref={scrollContainerRef}
      >
        <div
          className={cn(
            'pr-3',
            showsApiReferenceProductNav
              ? 'flex h-full min-h-0 flex-col pt-4'
              : 'py-4 pb-8',
          )}
        >
          <div className={cn(showsApiReferenceProductNav && 'shrink-0')}>
            {header ? (
              <DocsSidebarHeaderBlock
                header={header}
                locale={locale}
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
          {showsApiReferenceProductNav ? <ApiReferenceProductNav /> : null}
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
