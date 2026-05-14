'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocsTableOfContents } from './DocsContent';

export function DocsTocRail({ toc }: { toc: TOCItemType[] }) {
  return (
    <aside
      className="hidden w-[240px] shrink-0 border-l border-border xl:block"
      data-testid="docs-toc-rail"
    >
      <ScrollArea className="h-full min-h-0">
        <div className="px-6 py-8">
          <DocsTableOfContents toc={toc} />
        </div>
      </ScrollArea>
    </aside>
  );
}
