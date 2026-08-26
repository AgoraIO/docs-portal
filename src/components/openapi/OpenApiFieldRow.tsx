import { ChevronRight, Link2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type OpenApiFieldRequiredState = 'required' | 'optional';

export type OpenApiFieldLabels = {
  collapse: string;
  copyLink: string;
  deprecated: string;
  expand: string;
  optional: string;
  properties: string;
  required: string;
};

type OpenApiFieldRowPropsBase = {
  anchorId: string;
  deprecated?: boolean;
  details?: ReactNode;
  labels: OpenApiFieldLabels;
  name: string;
  requiredState?: OpenApiFieldRequiredState;
  type: string;
};

type OpenApiFieldRowProps =
  | (OpenApiFieldRowPropsBase & {
      expandable: true;
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
    })
  | (OpenApiFieldRowPropsBase & {
      expandable?: false;
      expanded?: never;
      onExpandedChange?: never;
    });

export function OpenApiFieldRow({
  anchorId,
  deprecated = false,
  details,
  expandable,
  expanded,
  labels,
  name,
  onExpandedChange,
  requiredState,
  type,
}: OpenApiFieldRowProps) {
  const control = (
    <span
      aria-hidden="true"
      className="openapi-field-control-gutter flex h-3 w-3 shrink-0 items-center justify-center"
    >
      {expandable && (
        <ChevronRight
          className={cn('size-3 transition-transform', expanded && 'rotate-90')}
        />
      )}
    </span>
  );

  const fieldName = (
    <code
      className={cn(
        'min-w-0 break-words font-mono text-sm font-bold [overflow-wrap:anywhere]',
        deprecated && 'text-muted-foreground opacity-70 line-through',
      )}
    >
      {name}
    </code>
  );

  return (
    <div
      className={cn(
        'openapi-field-row scroll-mt-24 py-3',
        expandable && 'openapi-field-row-container',
      )}
      id={anchorId}
    >
      <div className="openapi-field-main min-w-0">
        <div className="openapi-field-heading min-w-0">
          <div className="openapi-field-name min-w-0">
            {expandable ? (
              <button
                aria-expanded={expanded}
                aria-label={`${expanded ? labels.collapse : labels.expand} ${name} ${labels.properties}`}
                className="flex min-w-0 w-full items-center gap-2 text-start"
                onClick={() => {
                  if (expandable) onExpandedChange(!expanded);
                }}
                type="button"
              >
                {control}
                {fieldName}
              </button>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                {control}
                {fieldName}
              </div>
            )}
          </div>
          <div className="openapi-field-meta min-w-0">
            {requiredState && (
              <span
                className={cn(
                  'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  requiredState === 'required'
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
                    : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {labels[requiredState]}
              </span>
            )}
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {type}
            </span>
            {deprecated && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {labels.deprecated}
              </span>
            )}
            <a
              aria-label={`${labels.copyLink} ${anchorId}`}
              className="openapi-field-anchor shrink-0 rounded p-1 text-muted-foreground"
              href={`#${anchorId}`}
            >
              <Link2 aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </div>
        {details !== undefined && (
          <div className="openapi-field-details mt-3 ps-5">{details}</div>
        )}
      </div>
    </div>
  );
}
