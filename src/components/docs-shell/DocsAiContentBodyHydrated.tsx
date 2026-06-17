import { lazy, Suspense } from 'react';

const DocsAiContentBodyClient = lazy(() =>
  import('./DocsAiContentBody.client').then((module) => ({
    default: module.DocsAiContentBodyClient,
  })),
);

export function DocsAiContentBodyHydrated({
  contentPath,
}: {
  contentPath: string;
}) {
  return (
    <Suspense fallback={<DocsContentSkeleton />}>
      <DocsAiContentBodyClient contentPath={contentPath} />
    </Suspense>
  );
}

function DocsContentSkeleton() {
  return (
    <div
      className="space-y-4 py-2"
      data-testid="docs-content-skeleton"
      role="status"
    >
      <div className="h-4 w-1/3 rounded bg-[color:var(--line-soft)]" />
      <div className="h-4 w-full rounded bg-[color:var(--line-soft)]" />
      <div className="h-4 w-5/6 rounded bg-[color:var(--line-soft)]" />
      <span className="sr-only">Loading documentation content</span>
    </div>
  );
}
