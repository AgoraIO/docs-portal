'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { useEffect, useState } from 'react';
import { getDocsPageToc } from '@/lib/docs-page';
import { DocsTableOfContents } from './DocsTableOfContents';

export function DocsTableOfContentsHydrated({
  className,
  contentPath,
  locale,
  toc = [],
}: {
  className?: string;
  contentPath: string;
  locale?: string;
  toc?: TOCItemType[];
}) {
  const [resolvedToc, setResolvedToc] = useState(toc);

  useEffect(() => {
    let cancelled = false;

    setResolvedToc(toc);

    if (toc.length > 0) {
      return;
    }

    void getDocsPageToc({ data: { contentPath } }).then((nextToc) => {
      if (cancelled) {
        return;
      }

      setResolvedToc(nextToc);
    });

    return () => {
      cancelled = true;
    };
  }, [contentPath, toc]);

  return (
    <DocsTableOfContents
      className={className}
      locale={locale}
      toc={resolvedToc}
    />
  );
}
