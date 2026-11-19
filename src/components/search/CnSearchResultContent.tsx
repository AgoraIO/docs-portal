import { BookOpenIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Shared by the command dialog and full search page so card layout cannot drift.
export function CnSearchResultContent({
  title,
  path,
  context,
  description,
  children,
}: {
  title: ReactNode;
  path: string[];
  context: { key: string; label: ReactNode }[];
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-start gap-3 text-sm">
      <BookOpenIcon
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="font-medium [overflow-wrap:anywhere]">{title}</div>
        {path.length > 1 ? (
          <div className="line-clamp-1 text-xs text-muted-foreground">
            {path.slice(0, -1).join(' › ')}
          </div>
        ) : null}
        {context.length ? (
          <div className="flex min-h-4 flex-wrap gap-1">
            {context.map(({ key, label }) => (
              <span
                className="whitespace-nowrap rounded border border-border bg-background/70 px-1.5 py-0.5 text-[0.68rem] leading-none text-muted-foreground"
                key={key}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
        <div className="line-clamp-2 min-h-8 min-w-0 text-xs leading-4 text-muted-foreground [overflow-wrap:anywhere]">
          {description}
        </div>
        {children}
      </div>
    </div>
  );
}
