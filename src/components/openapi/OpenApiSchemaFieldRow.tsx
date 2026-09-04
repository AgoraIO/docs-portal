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
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          {expandable ? (
            <Button
              aria-expanded={expanded}
              aria-label={`${expanded ? labels.collapse : labels.expand} ${node.name} ${labels.properties}`}
              className="min-w-0 max-w-full justify-start whitespace-normal break-words px-0 py-0 text-left font-normal hover:bg-transparent [overflow-wrap:anywhere]"
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
              {fieldIdentity}
            </Button>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              {fieldIdentity}
            </div>
          )}
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <Badge
            className={cn(
              'openapi-schema-status ml-auto normal-case tracking-normal',
              node.required
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
                : 'border-border bg-muted text-muted-foreground',
            )}
            variant="outline"
          >
            {node.required ? labels.required : labels.optional}
          </Badge>
          {node.schema.deprecated ? (
            <Badge
              className="openapi-schema-status border-orange-200 bg-orange-50 text-orange-800 normal-case tracking-normal dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300"
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
      {node.schema.description ? (
        <div className="openapi-schema-field-description mt-2 min-w-0 break-words font-normal text-muted-foreground [overflow-wrap:anywhere]">
          {node.schema.description}
        </div>
      ) : null}
      {node.schema.allowedValues && node.schema.allowedValues.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground">{labels.allowedValues}</span>
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
