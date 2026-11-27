'use client';

import { Link } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { AppLocale } from '@/lib/i18n/i18n-config';

import { DocsVersionDropdown } from './DocsVersionDropdown';

export function DocsSidebarHeaderBlock({
  className,
  header,
  locale,
  mode,
  onSelectPath,
}: {
  className?: string;
  header: DocsSidebarHeader;
  locale: AppLocale;
  mode: 'desktop' | 'mobile';
  onSelectPath: () => void;
}) {
  const versionSwitcher = header.versionSwitcher;

  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'mb-4 border-b border-border/70 pb-3'
          : 'mb-2 rounded-lg border border-border px-3 py-2',
        className,
      )}
    >
      {header.backHref && header.backLabel ? (
        <Link
          activeOptions={{ exact: true }}
          className={cn(
            'flex items-center gap-2 rounded-[7px] font-medium text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
            mode === 'desktop'
              ? 'mb-2 px-2 py-1.5 text-[13px]'
              : 'mb-1 px-0 py-1 text-sm text-muted-foreground hover:bg-transparent',
          )}
          onClick={onSelectPath}
          params={{}}
          search={{}}
          to={header.backHref}
        >
          <ChevronLeftIcon className="size-4" />
          <span className="min-w-0 truncate">{header.backLabel}</span>
        </Link>
      ) : null}
      <div
        className={cn(
          'min-w-0 font-semibold text-[color:var(--ink-1)]',
          mode === 'desktop' ? 'px-2 text-[15px]' : 'text-sm text-foreground',
        )}
      >
        {header.title}
      </div>
      {versionSwitcher && versionSwitcher.presentation !== 'tabs' ? (
        <DocsVersionDropdown
          className={
            mode === 'desktop' ? 'mt-2 mx-2 w-[calc(100%-1rem)]' : 'mt-2 w-full'
          }
          locale={locale}
          onSelectPath={onSelectPath}
          versionSwitcher={versionSwitcher}
        />
      ) : null}
    </div>
  );
}
