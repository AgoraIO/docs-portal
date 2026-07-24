'use client';

import { Link } from '@tanstack/react-router';
import {
  BookOpenTextIcon,
  CircleHelpIcon,
  CookingPotIcon,
  DownloadIcon,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  REFERENCE_CENTER_ENTRIES,
  type ReferenceCenterEntryId,
} from '@/lib/reference-center-navigation';

const iconByEntryId: Record<ReferenceCenterEntryId, LucideIcon> = {
  api: BookOpenTextIcon,
  faq: CircleHelpIcon,
  recipes: CookingPotIcon,
  sdks: DownloadIcon,
};

export function ReferenceCenterPrimaryNav({
  activePath,
  onSelectPath,
}: {
  activePath: string;
  onSelectPath: () => void;
}) {
  return (
    <nav aria-label="参考中心" data-testid="reference-center-primary-nav">
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {REFERENCE_CENTER_ENTRIES.map((entry) => {
          const Icon = iconByEntryId[entry.id];
          const isActive = isEntryActive(entry.href, activePath);

          return (
            <li key={entry.id}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                  isActive
                    ? 'bg-[color:var(--docs-soft-fill)] font-medium text-[color:var(--ink-1)]'
                    : 'text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
                )}
                onClick={onSelectPath}
                params={{}}
                search={{}}
                to={entry.href}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0',
                    isActive
                      ? 'text-[color:var(--ink-2)]'
                      : 'text-[color:var(--ink-4)]',
                  )}
                />
                <span>{entry.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isEntryActive(entryHref: string, activePath: string) {
  const normalizedPath = activePath.replace(/\/+$/, '');

  return (
    normalizedPath === entryHref || normalizedPath.startsWith(`${entryHref}/`)
  );
}
