'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { DocsTableOfContents } from './DocsContent';

export function DocsTocRail({ toc }: { toc: TOCItemType[] }) {
  return (
    <aside
      className="hidden h-full min-h-0 w-[220px] shrink-0 overflow-y-auto bg-transparent xl:block"
      data-testid="docs-toc-rail"
    >
      <div className="px-2 py-9 pl-6">
        <DocsTableOfContents toc={toc} />
      </div>
    </aside>
  );
}
