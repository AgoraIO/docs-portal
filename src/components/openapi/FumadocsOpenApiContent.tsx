import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { createClientAPIPageLite } from '@/lib/openapi/create-client-lite';
import {
  buildOpenApiSchemaRows,
  type OpenApiSchemaRow,
} from '@/lib/openapi/schema-tree';

const LEGACY_DOC_ORIGIN = 'https://doc.shengwang.cn';
const LEGACY_DOC_PATH_PATTERN =
  /(]\()(\/(?:api-center|basics|codebox|doc|faq)(?:[^)]*))(\))/g;

const ClientAPIPage = createClientAPIPageLite({
  playground: {
    enabled: false,
  },
  schemaUI: {
    render: (options, ctx) => (
      <OpenApiSchemaRows
        readOnly={options.readOnly}
        renderMarkdown={ctx.renderMarkdown}
        root={options.root}
        writeOnly={options.writeOnly}
      />
    ),
  },
});

export function FumadocsOpenApiContent({
  className,
  payloadAssetPath,
  payloadMeta,
}: {
  className?: string;
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
  const [pageProps, setPageProps] = useState<ClientApiPageProps | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(payloadAssetPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load OpenAPI payload: ${payloadAssetPath}`);
        }

        return response.json();
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setPageProps(payload as ClientApiPageProps);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPageProps({
          ...payloadMeta,
          payload: {
            bundled: {
              info: {
                title: payloadMeta.document,
              },
              openapi: '3.1.0',
              paths: {},
            },
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [payloadAssetPath, payloadMeta]);

  if (!pageProps) {
    return null;
  }

  return (
    <div className={cn('not-prose openapi-operation', className)}>
      <ClientAPIPage {...pageProps} />
    </div>
  );
}

function OpenApiSchemaRows({
  readOnly,
  renderMarkdown,
  root,
  writeOnly,
}: {
  readOnly?: boolean;
  renderMarkdown: (markdown: string) => ReactNode;
  root: unknown;
  writeOnly?: boolean;
}) {
  const rows = buildOpenApiSchemaRows(root, {
    usage: writeOnly ? 'request' : readOnly ? 'response' : undefined,
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="openapi-schema-tree not-prose my-4 overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground">
      {rows.map((row) => (
        <OpenApiSchemaRowItem
          key={row.path}
          renderMarkdown={renderMarkdown}
          row={row}
        />
      ))}
    </div>
  );
}

function OpenApiSchemaRowItem({
  renderMarkdown,
  row,
}: {
  renderMarkdown: (markdown: string) => ReactNode;
  row: OpenApiSchemaRow;
}) {
  return (
    <div
      className="border-fd-border border-t px-4 py-3 text-sm first:border-t-0"
      style={{ paddingInlineStart: `${1 + row.depth * 1.25}rem` }}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <code
          className={cn(
            'font-medium text-fd-primary',
            row.deprecated && 'line-through opacity-70',
          )}
        >
          {row.name}
        </code>
        {row.required ? (
          <span className="font-medium text-red-500">*</span>
        ) : (
          <span className="text-fd-muted-foreground">?</span>
        )}
        <span className="font-mono text-fd-muted-foreground text-xs">
          {row.type}
          {row.nullable ? ' | null' : ''}
        </span>
        {row.deprecated ? (
          <span className="rounded-md border border-yellow-500/25 bg-yellow-500/10 px-1.5 py-0.5 font-medium text-[11px] text-yellow-700 dark:text-yellow-300">
            Deprecated
          </span>
        ) : null}
      </div>
      {row.description ? (
        <div className="openapi-schema-description prose-no-margin mt-2 text-fd-muted-foreground">
          {renderMarkdown(normalizeOpenApiDescriptionMarkdown(row.description))}
        </div>
      ) : null}
      <OpenApiSchemaMeta row={row} />
    </div>
  );
}

function OpenApiSchemaMeta({ row }: { row: OpenApiSchemaRow }) {
  const items = [
    row.defaultValue !== undefined
      ? ['Default', formatOpenApiSchemaValue(row.defaultValue)]
      : null,
    row.enumValues
      ? ['Allowed', row.enumValues.map(formatOpenApiSchemaValue).join(' | ')]
      : null,
    row.format ? ['Format', row.format] : null,
    row.minimum !== undefined ? ['Minimum', String(row.minimum)] : null,
    row.maximum !== undefined ? ['Maximum', String(row.maximum)] : null,
    row.example !== undefined
      ? ['Example', formatOpenApiSchemaValue(row.example)]
      : null,
  ].filter((item): item is [string, string] => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map(([label, value]) => (
        <span
          className="inline-flex min-w-0 items-start gap-1 rounded-md border border-fd-border bg-fd-secondary px-1.5 py-1 text-xs"
          key={`${label}:${value}`}
        >
          <span className="font-medium text-fd-foreground">{label}</span>
          <code className="min-w-0 truncate text-fd-muted-foreground">
            {value}
          </code>
        </span>
      ))}
    </div>
  );
}

function formatOpenApiSchemaValue(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function normalizeOpenApiDescriptionMarkdown(markdown: string) {
  return markdown.replace(
    LEGACY_DOC_PATH_PATTERN,
    (_match, prefix: string, path: string, suffix: string) =>
      `${prefix}${LEGACY_DOC_ORIGIN}${path.replaceAll('&amp;', '&')}${suffix}`,
  );
}
