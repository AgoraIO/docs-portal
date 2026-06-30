'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { cn } from '@/lib/cn';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { DocsTableOfContents } from './DocsContent';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsTocRail({
  locale,
  toc,
}: {
  locale?: AppLocale | string;
  toc: TOCItemType[];
}) {
  const { isScrollbarVisible, scrollContainerRef } =
    useTransientScrollbar<HTMLDivElement>();

  return (
    <aside
      className="hidden w-[220px] shrink-0 bg-transparent xl:sticky xl:top-[var(--docs-shell-header-offset)] xl:block xl:h-[var(--docs-shell-body-height)] xl:min-h-0 xl:self-start"
      data-testid="docs-toc-rail"
    >
      <div
        className={cn(
          'docs-scrollbar h-full min-h-0 overflow-y-auto px-2 py-9 pl-6',
          isScrollbarVisible && 'docs-scrollbar-visible',
        )}
        data-testid="docs-toc-rail-scroll"
        ref={scrollContainerRef}
      >
        <DocsTableOfContents locale={locale} toc={toc} />
      </div>
    </aside>
  );
}
