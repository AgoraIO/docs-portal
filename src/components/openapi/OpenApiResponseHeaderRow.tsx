import { Link2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function OpenApiResponseHeaderRow({
  anchorId,
  copyLinkLabel,
  deprecated = false,
  deprecatedLabel,
  details,
  name,
  type,
}: {
  anchorId: string;
  copyLinkLabel: string;
  deprecated?: boolean;
  deprecatedLabel: string;
  details?: ReactNode;
  name: string;
  type: string;
}) {
  return (
    <div
      className="openapi-response-header-row scroll-mt-24 border-t border-fd-border py-4 first:border-t-0"
      id={anchorId}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <code className="font-medium text-fd-primary">{name}</code>
        <span className="font-mono text-fd-muted-foreground text-sm">
          {type}
        </span>
        <span className="flex-1" />
        {deprecated ? (
          <span className="font-mono text-fd-warning text-xs">
            {deprecatedLabel}
          </span>
        ) : null}
        <a
          aria-label={`${copyLinkLabel} ${anchorId}`}
          className="openapi-field-anchor rounded p-1 text-fd-muted-foreground"
          href={`#${anchorId}`}
        >
          <Link2 aria-hidden="true" className="size-3.5" />
        </a>
      </div>
      {details ? <div className="prose-no-margin pt-2">{details}</div> : null}
    </div>
  );
}
