'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocsTableOfContents } from './DocsContent';

export function DocsTocRail({ toc }: { toc: TOCItemType[] }) {
  return (
    <aside
      className="hidden w-[220px] shrink-0 bg-transparent xl:block"
      data-testid="docs-toc-rail"
    >
      <ScrollArea className="h-full min-h-0">
        <div className="px-2 py-9 pl-6">
          <DocsTableOfContents toc={toc} />
        </div>
      </ScrollArea>
    </aside>
  );
}
