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

export function DocsContentBody(_: { contentPath: string }) {
  return <DocsContentSkeleton />;
}

export function DocsAiContentBody(_: { contentPath: string }) {
  return <DocsContentSkeleton />;
}

export function DocsApiReferenceContentBody(_: { contentPath: string }) {
  return <DocsContentSkeleton />;
}

export function DocsRtcAndroidApiReferenceContentBody(_: {
  contentPath: string;
}) {
  return <DocsContentSkeleton />;
}
