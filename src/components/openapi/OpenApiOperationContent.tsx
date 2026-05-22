import { ExternalLinkIcon } from 'lucide-react';
import type { OpenApiSchemaTreeNode } from '@/lib/openapi/schema-tree';
import type { NormalizedOpenApiOperation } from '@/lib/openapi/source.server';

export type OpenApiOperationPayload = {
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
  requestSchemaTree: OpenApiSchemaTreeNode[];
  responseSchemaTrees: Record<string, OpenApiSchemaTreeNode[]>;
};

export function OpenApiOperationContent({
  operation,
  publicSourceUrl,
  requestSchemaTree,
  responseSchemaTrees,
}: OpenApiOperationPayload) {
  return (
    <div className="not-prose flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border border-[color:var(--line-soft)] bg-card p-4">
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
        {operation.description ? (
          <p className="text-sm leading-6 text-[color:var(--ink-3)]">
            {operation.description}
          </p>
        ) : null}
      </section>

      {operation.servers.length > 0 ? (
        <OpenApiSection title="Servers">
          <div className="flex flex-col gap-2">
            {operation.servers.map((server) => (
              <div
                className="rounded-md border border-[color:var(--line-soft)] px-3 py-2"
                key={server.url}
              >
                <code className="break-all text-sm text-[color:var(--ink-1)]">
                  {server.url}
                </code>
                {server.description ? (
                  <p className="mt-1 text-sm text-[color:var(--ink-4)]">
                    {server.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </OpenApiSection>
      ) : null}

      <OpenApiSection title="Parameters">
        {operation.parameters.length > 0 ? (
          <div className="flex flex-col gap-2">
            {operation.parameters.map((parameter, index) => (
              <ParameterRow key={getParameterKey(parameter, index)} value={parameter} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-4)]">No parameters.</p>
        )}
      </OpenApiSection>

      <OpenApiSection title="Request body">
        {operation.requestBody ? (
          <div className="flex flex-col gap-4">
            <MimeList values={operation.requestBody.contentTypes} />
            <SchemaTree nodes={requestSchemaTree} />
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-4)]">No request body.</p>
        )}
      </OpenApiSection>

      <OpenApiSection title="Responses">
        {Object.entries(operation.responses).length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.entries(operation.responses).map(([status, response]) => (
              <div
                className="rounded-lg border border-[color:var(--line-soft)] p-4"
                key={status}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[color:var(--surface-muted)] px-2 py-1 font-mono text-xs font-semibold">
                    {status}
                  </span>
                  {response.description ? (
                    <span className="text-sm text-[color:var(--ink-3)]">
                      {response.description}
                    </span>
                  ) : null}
                </div>
                <SchemaTree nodes={responseSchemaTrees[status] ?? []} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-4)]">No responses.</p>
        )}
      </OpenApiSection>
    </div>
  );
}

function OpenApiSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="scroll-mt-24 text-xl font-semibold text-[color:var(--ink-1)]"
        id={slugify(title)}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ParameterRow({ value }: { value: unknown }) {
  const parameter = isRecord(value) ? value : {};
  const name = typeof parameter.name === 'string' ? parameter.name : 'parameter';
  const location = typeof parameter.in === 'string' ? parameter.in : undefined;
  const required = parameter.required === true;
  const description =
    typeof parameter.description === 'string' ? parameter.description : undefined;

  return (
    <div className="rounded-md border border-[color:var(--line-soft)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-sm font-semibold text-[color:var(--ink-1)]">
          {name}
        </code>
        {location ? (
          <span className="rounded bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-xs text-[color:var(--ink-4)]">
            {location}
          </span>
        ) : null}
        {required ? (
          <span className="text-xs font-medium text-red-600">required</span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-[color:var(--ink-3)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MimeList({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <code
          className="rounded-md bg-[color:var(--surface-muted)] px-2 py-1 text-xs text-[color:var(--ink-3)]"
          key={value}
        >
          {value}
        </code>
      ))}
    </div>
  );
}

function SchemaTree({ nodes }: { nodes: OpenApiSchemaTreeNode[] }) {
  if (nodes.length === 0) {
    return <p className="text-sm text-[color:var(--ink-4)]">No schema.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {nodes.map((node) => (
        <SchemaNode depth={0} key={node.path} node={node} />
      ))}
    </div>
  );
}

function SchemaNode({
  depth,
  node,
}: {
  depth: number;
  node: OpenApiSchemaTreeNode;
}) {
  const hasChildren = node.children.length > 0;
  const content = (
    <div className="flex flex-col gap-1 rounded-md border border-[color:var(--line-soft)] px-3 py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <code className="break-all text-sm font-semibold text-[color:var(--ink-1)]">
          {node.name}
        </code>
        <span className="rounded bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-xs text-[color:var(--ink-4)]">
          {node.type}
        </span>
        {node.required ? (
          <span className="text-xs font-medium text-red-600">required</span>
        ) : null}
      </div>
      {node.description ? (
        <p className="text-sm leading-6 text-[color:var(--ink-3)]">
          {node.description}
        </p>
      ) : null}
      {node.enumValues ? (
        <p className="text-xs text-[color:var(--ink-4)]">
          Enum: {node.enumValues.map(String).join(', ')}
        </p>
      ) : null}
    </div>
  );

  if (!hasChildren) {
    return content;
  }

  return (
    <details className="flex flex-col gap-2" open={depth < 2}>
      <summary className="cursor-pointer list-none">{content}</summary>
      <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-[color:var(--line-soft)] pl-3">
        {node.children.map((child) => (
          <SchemaNode depth={depth + 1} key={child.path} node={child} />
        ))}
      </div>
    </details>
  );
}

function getParameterKey(parameter: unknown, index: number) {
  if (!isRecord(parameter)) {
    return `parameter-${index}`;
  }

  return `${String(parameter.in ?? 'unknown')}-${String(
    parameter.name ?? index,
  )}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
