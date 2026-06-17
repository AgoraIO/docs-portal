import { lazy, Suspense } from 'react';

const FumadocsOpenApiContent = lazy(() =>
  import('./FumadocsOpenApiContent').then((module) => ({
    default: module.FumadocsOpenApiContent,
  })),
);

export function FumadocsOpenApiContentHydrated({
  payloadAssetPath,
  payloadMeta,
}: {
  payloadAssetPath: string;
  payloadMeta: {
    document: string;
    operations: Array<{
      method: string;
      path: string;
    }>;
    showDescription: true;
  };
}) {
  return (
    <Suspense fallback={<OpenApiContentSkeleton />}>
      <FumadocsOpenApiContent
        payloadAssetPath={payloadAssetPath}
        payloadMeta={payloadMeta}
      />
    </Suspense>
  );
}

function OpenApiContentSkeleton() {
  return (
    <div
      className="space-y-4 py-2"
      data-testid="openapi-content-skeleton"
      role="status"
    >
      <div className="h-5 w-2/5 rounded bg-[color:var(--line-soft)]" />
      <div className="h-4 w-full rounded bg-[color:var(--line-soft)]" />
      <div className="h-24 rounded-lg border border-[color:var(--line-soft)] bg-card" />
      <span className="sr-only">Loading OpenAPI content</span>
    </div>
  );
}
