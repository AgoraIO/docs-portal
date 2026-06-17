import { lazy, Suspense, useEffect, useState } from 'react';
import { getDocsSearchIndex } from '@/lib/docs-page';

const DocsSearchDialog = lazy(() =>
  import('./DocsSearchDialog').then((module) => ({
    default: module.DocsSearchDialog,
  })),
);

export function DocsSearchDialogHydrated({
  locale,
  mode,
  tabs,
}: {
  locale?: string;
  mode?: 'desktop' | 'mobile';
  tabs: { description?: string; id: string; title: string; url: string }[];
}) {
  const [pages, setPages] = useState<
    { description?: string; title: string; url: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    void getDocsSearchIndex().then((nextPages) => {
      if (!cancelled) {
        setPages(nextPages);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Suspense fallback={<DocsSearchTriggerSkeleton mode={mode} />}>
      <DocsSearchDialog locale={locale} mode={mode} pages={pages} tabs={tabs} />
    </Suspense>
  );
}

function DocsSearchTriggerSkeleton({
  mode = 'desktop',
}: {
  mode?: 'desktop' | 'mobile';
}) {
  if (mode === 'mobile') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-9 rounded-md border border-transparent"
        data-testid="docs-search-trigger-skeleton-mobile"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-9 w-full rounded-md border border-[color:var(--line-soft)]"
      data-testid="docs-search-trigger-skeleton-desktop"
    />
  );
}
