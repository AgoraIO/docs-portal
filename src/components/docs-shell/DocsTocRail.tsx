'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { cn } from '@/lib/cn';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { DocsTableOfContents } from './DocsContent';
import { DocsPageFeedback } from './DocsPageFeedback';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsTocRail({
  locale,
  toc,
}: {
  locale?: AppLocale | string;
  toc: TOCItemType[];
}) {
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
      <div className="flex flex-col gap-4 px-2 py-9 pl-6">
        <DocsTableOfContents locale={locale} toc={toc} />
        <DocsPageFeedback compact locale={locale} />
      </div>
    </aside>
  );
}
