import { Check, ChevronRight, Link2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { OpenApiSchemaViewNode } from '@/lib/openapi/schema-view';

export type OpenApiSchemaFieldRowLabels = {
  allowedValues: string;
  collapse: string;
  copiedLink: string;
  copyLink: string;
  deprecated: string;
  expand: string;
  optional: string;
  properties: string;
  required: string;
};

export type OpenApiSchemaFieldRowProps = {
  copied: boolean;
  domId?: string;
  expanded: boolean;
  labels: OpenApiSchemaFieldRowLabels;
  node: OpenApiSchemaViewNode;
  onCopy: () => void;
  onExpandedChange: (expanded: boolean) => void;
  remainingInfoTags?: ReactNode[];
};

export function OpenApiSchemaFieldRow({
  copied,
  domId,
  expanded,
  labels,
  node,
  onCopy,
  onExpandedChange,
  remainingInfoTags = [],
}: OpenApiSchemaFieldRowProps) {
  const expandable = node.children.length > 0;
  const fieldIdentity = (
    <>
      <code
        className={cn(
          'min-w-0 break-words font-mono text-sm font-semibold [overflow-wrap:anywhere]',
          node.schema.deprecated && 'line-through decoration-2',
        )}
      >
        {node.name}
      </code>
      <span className="min-w-0 break-words font-mono text-sm text-muted-foreground [overflow-wrap:anywhere]">
        {node.schema.aliasName}
      </span>
      {node.variant ? (
        <span
          className="min-w-0 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]"
          data-openapi-schema-variant=""
        >
          ({node.variant})
        </span>
      ) : null}
    </>
  );

  return (
    <div
      className="openapi-schema-field-row min-w-0 scroll-mt-24 border-t border-border py-3 first:border-t-0 [overflow-wrap:anywhere]"
      id={domId ?? node.id}
    >
      <div className="flex min-w-0 items-start gap-2 text-sm">
        <div
          className="openapi-schema-field-leading flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1"
          data-openapi-field-leading={expandable ? 'expandable' : 'leaf'}
        >
          {expandable ? (
            <>
              <span
                className="flex size-3 shrink-0 items-center justify-center"
                data-openapi-field-gutter
              >
                <Button
                  aria-expanded={expanded}
                  aria-label={`${expanded ? labels.collapse : labels.expand} ${node.name} ${labels.properties}`}
                  className="size-3 shrink-0 p-0 hover:bg-transparent"
                  onClick={() => onExpandedChange(!expanded)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      'size-3 transition-transform',
                      expanded && 'rotate-90',
                    )}
                  />
                </Button>
              </span>
              <span className="openapi-schema-field-content flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                {fieldIdentity}
              </span>
            </>
          ) : (
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="flex size-3 shrink-0 items-center justify-center"
                data-openapi-field-gutter
              />
              <span className="openapi-schema-field-content flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                {fieldIdentity}
              </span>
            </div>
          )}
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <Badge
            className={cn(
              'openapi-schema-status ml-auto normal-case tracking-normal',
              node.required
                ? 'border-fd-error/30 bg-fd-error/10 text-fd-error'
                : 'border-border bg-muted text-muted-foreground',
            )}
            variant="outline"
          >
            {node.required ? labels.required : labels.optional}
          </Badge>
          {node.schema.deprecated ? (
            <Badge
              className="openapi-schema-status border-fd-warning/30 bg-fd-warning/10 text-fd-warning normal-case tracking-normal"
              variant="outline"
            >
              {labels.deprecated}
            </Badge>
          ) : null}
          <Button
            aria-label={`${copied ? labels.copiedLink : labels.copyLink} ${node.name}`}
            className="text-muted-foreground"
            onClick={onCopy}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Link2 aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
      {node.schema.description ||
      (node.schema.allowedValues && node.schema.allowedValues.length > 0) ||
      remainingInfoTags.length > 0 ? (
        <div className="openapi-schema-field-details min-w-0">
          {node.schema.description ? (
            <div className="openapi-schema-field-description mt-2 min-w-0 break-words font-normal text-muted-foreground [overflow-wrap:anywhere]">
              {node.schema.description}
            </div>
          ) : null}
          {node.schema.allowedValues && node.schema.allowedValues.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="text-muted-foreground">
                {labels.allowedValues}
              </span>
              {node.schema.allowedValues.map((value, index) => {
                const key = getAllowedValueKey(value, index);

                return (
                  <code
                    className="max-w-full break-words rounded border border-border px-1.5 py-0.5 font-mono text-xs [overflow-wrap:anywhere]"
                    data-openapi-allowed-value-key={key}
                    key={key}
                  >
                    {formatAllowedValue(value)}
                  </code>
                );
              })}
            </div>
          ) : null}
          {remainingInfoTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">{remainingInfoTags}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatAllowedValue(value: unknown) {
  if (typeof value === 'string') return value;
  return serializeAllowedValue(value);
}

function getAllowedValueKey(value: unknown, index: number) {
  return `${typeof value}:${serializeAllowedValue(value)}:${index}`;
}

function serializeAllowedValue(value: unknown) {
  if (value === undefined) return 'undefined';

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
