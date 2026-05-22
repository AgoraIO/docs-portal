'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { cn } from '@/lib/cn';
import { DocsTableOfContents } from './DocsContent';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsTocRail({ toc }: { toc: TOCItemType[] }) {
  const { isScrollbarVisible, scrollContainerRef } =
    useTransientScrollbar<HTMLElement>();

  return (
    <aside
      className={cn(
        'docs-scrollbar hidden h-full min-h-0 w-[220px] shrink-0 overflow-y-auto bg-transparent xl:block',
        isScrollbarVisible && 'docs-scrollbar-visible',
      )}
      data-testid="docs-toc-rail"
      ref={scrollContainerRef}
    >
      <div className="px-2 py-9 pl-6">
        <DocsTableOfContents toc={toc} />
      </div>
    </aside>
  );
}
