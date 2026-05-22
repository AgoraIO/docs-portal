import { ExternalLinkIcon } from 'lucide-react';
import type { OpenApiOperationPayload } from '@/lib/openapi/payload';

export function OpenApiOperationContent({
  operation,
  publicSourceUrl,
  requestSchemaRows,
}: OpenApiOperationPayload) {
  return (
    <div className="not-prose openapi-operation flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-lg border border-[color:var(--line-soft)] bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {operation.method}
          </span>
          <code className="min-w-0 break-all rounded-md bg-[color:var(--surface-muted)] px-2 py-1 text-sm text-[color:var(--ink-1)]">
            {operation.path}
          </code>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--ink-3)]">
          <span>
            Operation ID: <code>{operation.operationId}</code>
          </span>
          <a
            className="inline-flex items-center gap-1.5 font-medium text-[color:var(--accent-brand)] hover:underline"
            href={publicSourceUrl}
          >
            <ExternalLinkIcon className="size-3.5" />
            OpenAPI source
          </a>
        </div>
      </section>
      {requestSchemaRows.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[color:var(--ink-1)]">
            Request body
          </h2>
          <div className="flex flex-col gap-2">
            {requestSchemaRows.map((row) => (
              <div
                className="rounded-md border border-[color:var(--line-soft)] px-3 py-2"
                key={row.path}
              >
                <code className="break-all text-sm font-semibold text-[color:var(--ink-1)]">
                  {row.path}
                </code>
                <span className="ml-2 rounded bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-xs text-[color:var(--ink-4)]">
                  {row.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export type { OpenApiOperationPayload };
