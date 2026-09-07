import { Check, ChevronRight, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { OpenApiSchemaViewNode } from '@/lib/openapi/schema-view';
import {
  OpenApiSchemaMetadata,
  type OpenApiSchemaMetadataItem,
} from './OpenApiSchemaMetadata';

export type OpenApiSchemaFieldRowLabels = {
  allowedValues: string;
  collapse: string;
  copiedLink: string;
  copyLink: string;
  default: string;
  deprecated: string;
  expand: string;
  properties: string;
  range: string;
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
  remainingInfoTags?: OpenApiSchemaMetadataItem[];
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
  const fieldStatuses = (
    <>
      {node.required ? (
        <Badge
          className="openapi-schema-status normal-case tracking-normal border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          variant="outline"
        >
          {labels.required}
        </Badge>
      ) : null}
      {node.schema.deprecated ? (
        <Badge
          className="openapi-schema-status normal-case tracking-normal border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300"
          variant="outline"
        >
          {labels.deprecated}
        </Badge>
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
                {fieldStatuses}
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
                {fieldStatuses}
              </span>
            </div>
          )}
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
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
      {node.schema.description || remainingInfoTags.length > 0 ? (
        <div className="openapi-schema-field-details min-w-0">
          {remainingInfoTags.length > 0 ? (
            <OpenApiSchemaMetadata items={remainingInfoTags} />
          ) : null}
          {node.schema.description ? (
            <div className="openapi-schema-field-description mt-2 min-w-0 break-words font-normal text-muted-foreground [overflow-wrap:anywhere]">
              {node.schema.description}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
