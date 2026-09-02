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
  expand: string;
  optional: string;
  properties: string;
  required: string;
};

export type OpenApiSchemaFieldRowProps = {
  copied: boolean;
  expanded: boolean;
  labels: OpenApiSchemaFieldRowLabels;
  node: OpenApiSchemaViewNode;
  onCopy: () => void;
  onExpandedChange: (expanded: boolean) => void;
  remainingInfoTags?: ReactNode[];
};

export function OpenApiSchemaFieldRow({
  copied,
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
      <code className="min-w-0 break-words font-mono text-sm font-semibold">
        {node.name}
      </code>
      <span className="shrink-0 font-mono text-sm text-muted-foreground">
        {node.schema.aliasName}
      </span>
    </>
  );

  return (
    <div
      className="openapi-schema-field-row scroll-mt-24 border-t border-border py-3 first:border-t-0"
      id={node.id}
    >
      <div className="flex min-w-0 items-start gap-2 text-sm">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          {expandable ? (
            <Button
              aria-expanded={expanded}
              aria-label={`${expanded ? labels.collapse : labels.expand} ${node.name} ${labels.properties}`}
              className="min-w-0 max-w-full px-0 py-0 font-normal hover:bg-transparent"
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
          <Badge variant={node.required ? 'default' : 'outline'}>
            {node.required ? labels.required : labels.optional}
          </Badge>
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
        <div className="openapi-schema-field-description mt-2 font-normal text-muted-foreground">
          {node.schema.description}
        </div>
      ) : null}
      {node.schema.allowedValues && node.schema.allowedValues.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground">{labels.allowedValues}</span>
          {node.schema.allowedValues.map((value) => (
            <code
              className="rounded border border-border px-1.5 py-0.5 font-mono text-xs"
              key={formatAllowedValue(value)}
            >
              {formatAllowedValue(value)}
            </code>
          ))}
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
  if (value === undefined) return 'undefined';
  return JSON.stringify(value) ?? String(value);
}
