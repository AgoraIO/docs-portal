import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import type {
  NormalizedOpenApiOperation,
  OpenApiExamples,
  OpenApiOperationPayload,
  OpenApiParameter,
  OpenApiSchemaRow,
} from '@/lib/openapi/payload';

type CodeTab = 'curl' | 'javascript' | 'response';

export function OpenApiOperationContent({
  operation,
  publicSourceUrl,
  requestSchemaRows,
  responseSchemaRows,
}: OpenApiOperationPayload) {
  return (
    <div className="not-prose openapi-operation">
      <OperationHeader
        operation={operation}
        publicSourceUrl={publicSourceUrl}
      />
      <div className="min-w-0 space-y-9">
        <AuthorizationSection operation={operation} />
        <ParametersSection operation={operation} />
        <SchemaSection
          contentTypes={operation.requestBody?.contentTypes}
          description={operation.requestBody?.description}
          emptyLabel="No request body."
          required={operation.requestBody?.required}
          rows={requestSchemaRows}
          title="Request body"
        />
        <ResponsesSection
          operation={operation}
          responseSchemaRows={responseSchemaRows}
        />
      </div>
    </div>
  );
}

export function OpenApiExamplesRail({
  examples,
}: {
  examples: OpenApiExamples;
}) {
  return <ExamplesPanel examples={examples} />;
}

function OperationHeader({
  operation,
  publicSourceUrl,
}: {
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
}) {
  return (
    <section className="mb-8 border-b border-[color:var(--line-soft)] pb-5">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--ink-4)]">
        <span>
          Operation ID: <code>{operation.operationId}</code>
        </span>
        <a
          className="inline-flex items-center gap-1.5 font-medium text-[color:var(--accent-brand)] transition-colors hover:text-[color:var(--ink-1)]"
          href={publicSourceUrl}
        >
          <ExternalLinkIcon className="size-3.5" />
          OpenAPI source
        </a>
      </div>
      <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[color:var(--line-soft)] bg-card px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <MethodBadge method={operation.method} />
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-[color:var(--ink-1)]">
          {operation.path}
        </code>
      </div>
    </section>
  );
}

function MethodBadge({ method }: { method: string }) {
  const tone = getMethodTone(method);

  return (
    <span
      className={cn(
        'shrink-0 rounded-md border px-2 py-1 font-mono text-[11px] leading-none font-bold',
        tone,
      )}
    >
      {method}
    </span>
  );
}

function AuthorizationSection({
  operation,
}: {
  operation: NormalizedOpenApiOperation;
}) {
  const authParameters = operation.parameters.filter(
    (parameter) =>
      parameter.in === 'header' &&
      /authorization|token|api[-_ ]?key/i.test(parameter.name),
  );

  if (authParameters.length === 0 && !operation.security) {
    return null;
  }

  return (
    <ApiSection icon={<KeyRoundIcon className="size-4" />} title="Authorization">
      {authParameters.length > 0 ? (
        <ParameterRows parameters={authParameters} />
      ) : (
        <p className="text-sm text-[color:var(--ink-4)]">
          This operation declares OpenAPI security requirements.
        </p>
      )}
    </ApiSection>
  );
}

function ParametersSection({
  operation,
}: {
  operation: NormalizedOpenApiOperation;
}) {
  const groups = groupParameters(
    operation.parameters.filter(
      (parameter) =>
        !(
          parameter.in === 'header' &&
          /authorization|token|api[-_ ]?key/i.test(parameter.name)
        ),
    ),
  );

  if (groups.length === 0) {
    return (
      <ApiSection title="Parameters">
        <p className="text-sm text-[color:var(--ink-4)]">No parameters.</p>
      </ApiSection>
    );
  }

  return (
    <div className="space-y-7">
      {groups.map(([location, parameters]) => (
        <ApiSection key={location} title={`${capitalize(location)} parameters`}>
          <ParameterRows parameters={parameters} />
        </ApiSection>
      ))}
    </div>
  );
}

function ParameterRows({ parameters }: { parameters: OpenApiParameter[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--line-soft)] bg-card">
      {parameters.map((parameter) => (
        <div
          className="grid gap-2 border-t border-[color:var(--line-soft)] px-3 py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_140px]"
          key={`${parameter.in}-${parameter.name}`}
        >
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <code className="break-all text-sm font-semibold text-[color:var(--ink-1)]">
                {parameter.name}
                {parameter.required ? null : (
                  <span className="text-[color:var(--ink-4)]">?</span>
                )}
              </code>
              {parameter.required ? <RequiredMark /> : null}
              <MetaPill>{parameter.in}</MetaPill>
            </div>
            {parameter.description ? (
              <p className="mt-1 text-sm leading-6 text-[color:var(--ink-3)]">
                {parameter.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-1.5 md:justify-end">
            <SchemaMeta schema={parameter.schema} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SchemaSection({
  contentTypes,
  description,
  emptyLabel,
  required,
  rows,
  title,
}: {
  contentTypes?: string[];
  description?: string;
  emptyLabel: string;
  required?: boolean;
  rows: OpenApiSchemaRow[];
  title: string;
}) {
  return (
    <ApiSection title={title}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {required ? <RequiredMark /> : null}
        {contentTypes?.map((contentType) => (
          <MetaPill key={contentType}>{contentType}</MetaPill>
        ))}
      </div>
      {description ? (
        <p className="mb-3 text-sm leading-6 text-[color:var(--ink-3)]">
          {description}
        </p>
      ) : null}
      <SchemaRowsTable emptyLabel={emptyLabel} rows={rows} />
    </ApiSection>
  );
}

function ResponsesSection({
  operation,
  responseSchemaRows,
}: {
  operation: NormalizedOpenApiOperation;
  responseSchemaRows: Record<string, OpenApiSchemaRow[]>;
}) {
  const responses = Object.entries(operation.responses);

  return (
    <ApiSection title="Responses">
      {responses.length > 0 ? (
        <div className="space-y-4">
          {responses.map(([status, response]) => (
            <div
              className="overflow-hidden rounded-lg border border-[color:var(--line-soft)] bg-card"
              key={status}
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--line-soft)] px-3 py-2.5">
                <StatusBadge status={status} />
                {response.description ? (
                  <span className="text-sm text-[color:var(--ink-3)]">
                    {response.description}
                  </span>
                ) : null}
              </div>
              <SchemaRowsTable
                emptyLabel="No response schema."
                rows={responseSchemaRows[status] ?? []}
                variant="embedded"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--ink-4)]">No responses.</p>
      )}
    </ApiSection>
  );
}

function SchemaRowsTable({
  emptyLabel,
  rows,
  variant,
}: {
  emptyLabel: string;
  rows: OpenApiSchemaRow[];
  variant?: 'embedded';
}) {
  if (rows.length === 0) {
    return (
      <p className="px-3 py-3 text-sm text-[color:var(--ink-4)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden bg-card',
        variant !== 'embedded' &&
          'rounded-lg border border-[color:var(--line-soft)]',
      )}
    >
      {rows.map((row) => (
        <div
          className="grid gap-2 border-t border-[color:var(--line-soft)] px-3 py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_180px]"
          key={row.path}
        >
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <code
                className="break-all text-sm font-semibold text-[color:var(--ink-1)]"
                style={{
                  paddingLeft: `${Math.min(row.depth, 2) * 0.5}rem`,
                }}
              >
                {row.path}
                {row.required ? null : (
                  <span className="text-[color:var(--ink-4)]">?</span>
                )}
              </code>
              {row.required ? <RequiredMark /> : null}
              {row.deprecated ? <MetaPill>Deprecated</MetaPill> : null}
              {row.nullable ? <MetaPill>Nullable</MetaPill> : null}
            </div>
            {row.description ? (
              <p className="mt-1 text-sm leading-6 text-[color:var(--ink-3)]">
                {row.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-1.5 md:justify-end">
            <MetaPill strong>{row.type}</MetaPill>
            {row.format ? <MetaPill>Format {row.format}</MetaPill> : null}
            {row.defaultValue !== undefined ? (
              <MetaPill>Default {formatJsonInline(row.defaultValue)}</MetaPill>
            ) : null}
            {row.example !== undefined ? (
              <MetaPill>Example {formatJsonInline(row.example)}</MetaPill>
            ) : null}
            {row.minimum !== undefined || row.maximum !== undefined ? (
              <MetaPill>
                Range {row.minimum ?? '-'}..{row.maximum ?? '-'}
              </MetaPill>
            ) : null}
            {row.enumValues ? (
              <MetaPill>Enum {row.enumValues.map(formatJsonInline).join(', ')}</MetaPill>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamplesPanel({ examples }: { examples: OpenApiExamples }) {
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const tabs = useMemo(
    () => {
      const items: { code: string; label: string; value: CodeTab }[] = [
        { code: examples.curl, label: 'cURL', value: 'curl' },
        {
          code: examples.javascript,
          label: 'JavaScript',
          value: 'javascript',
        },
      ];

      if (examples.responseBodyJson !== undefined) {
        items.push({
          code: JSON.stringify(examples.responseBodyJson, null, 2),
          label: examples.responseStatus
            ? `Response ${examples.responseStatus}`
            : 'Response',
          value: 'response',
        });
      }

      return items;
    },
    [examples],
  );
  const active = tabs.find(({ value }) => value === activeTab) ?? tabs[0];

  return (
    <aside className="min-w-0 xl:sticky xl:top-[var(--openapi-sticky-top)]">
      <div className="overflow-hidden rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--bg-elev)] shadow-[0_16px_44px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[color:var(--line-soft)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[color:var(--ink-1)]">
            Code & Examples
          </h2>
        </div>
        <div className="flex gap-1 border-b border-[color:var(--line-soft)] px-2 pt-2">
          {tabs.map(({ label, value }) => (
            <button
              className={cn(
                'rounded-t-md px-2.5 py-2 text-xs font-semibold text-[color:var(--ink-4)] transition-colors',
                active?.value === value &&
                  'bg-card text-[color:var(--ink-1)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--ink-1)_8%,transparent)]',
              )}
              key={value}
              onClick={() => setActiveTab(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        {active ? (
          <CodeBlock code={active.code} label={`Copy ${active.label} example`} />
        ) : null}
      </div>
    </aside>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <button
        aria-label={copied ? 'Example copied' : label}
        className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-black/20 text-white/80 transition-colors hover:bg-black/35 hover:text-white"
        onClick={() => void handleCopy()}
        type="button"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
      <pre className="min-h-[22rem] overflow-x-auto bg-[#10141d] p-4 pr-12 text-[12px] leading-6 text-[#dbe4f0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiSection({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-2">
        {icon ? (
          <span className="flex size-7 items-center justify-center rounded-md border border-[color:var(--line-soft)] bg-card text-[color:var(--ink-3)]">
            {icon}
          </span>
        ) : null}
        <h2 className="text-base font-semibold text-[color:var(--ink-1)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const success = status.startsWith('2');

  return (
    <span
      className={cn(
        'rounded-md border px-2 py-1 font-mono text-xs leading-none font-semibold',
        success
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-[color:var(--line-soft)] bg-[color:var(--surface-muted)] text-[color:var(--ink-3)]',
      )}
    >
      {status}
    </span>
  );
}

function RequiredMark() {
  return <span className="text-xs font-medium text-red-600">required</span>;
}

function MetaPill({
  children,
  strong,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <span
      className={cn(
        'rounded bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-xs text-[color:var(--ink-4)]',
        strong && 'font-mono font-semibold text-[color:var(--ink-2)]',
      )}
    >
      {children}
    </span>
  );
}

function SchemaMeta({ schema }: { schema?: unknown }) {
  if (!isRecord(schema)) {
    return null;
  }

  return (
    <>
      <MetaPill strong>{getSchemaType(schema)}</MetaPill>
      {typeof schema.format === 'string' ? (
        <MetaPill>Format {schema.format}</MetaPill>
      ) : null}
      {Array.isArray(schema.enum) ? (
        <MetaPill>Enum {schema.enum.map(formatJsonInline).join(', ')}</MetaPill>
      ) : null}
      {schema.default !== undefined ? (
        <MetaPill>Default {formatJsonInline(schema.default)}</MetaPill>
      ) : null}
    </>
  );
}

function groupParameters(parameters: OpenApiParameter[]) {
  const order = ['path', 'query', 'header', 'cookie'];
  const grouped = new Map<string, OpenApiParameter[]>();

  for (const parameter of parameters) {
    grouped.set(parameter.in, [...(grouped.get(parameter.in) ?? []), parameter]);
  }

  return order.flatMap((location) => {
    const items = grouped.get(location);
    return items?.length ? ([[location, items]] as const) : [];
  });
}

function getMethodTone(method: string) {
  switch (method) {
    case 'GET':
      return 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300';
    case 'POST':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'DELETE':
      return 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300';
    case 'PATCH':
    case 'PUT':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    default:
      return 'border-[color:var(--line-soft)] bg-[color:var(--surface-muted)] text-[color:var(--ink-3)]';
  }
}

function getSchemaType(schema: Record<string, unknown>) {
  if (typeof schema.type === 'string') {
    return schema.type;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(' | ');
  }

  if (Array.isArray(schema.enum)) {
    return 'enum';
  }

  return 'unknown';
}

function formatJsonInline(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type { OpenApiOperationPayload };
