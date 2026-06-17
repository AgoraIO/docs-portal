'use client';

import { Link } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { DocsCompactMenu } from './DocsCompactMenu';

export function DocsSidebarHeaderBlock({
  className,
  header,
  mode,
  onSelectPath,
}: {
  className?: string;
  header: DocsSidebarHeader;
  mode: 'desktop' | 'mobile';
  onSelectPath: () => void;
}) {
  const versionSwitcher = header.versionSwitcher;
  const currentVersion = versionSwitcher?.versions.find(
    (version) => version.id === versionSwitcher.currentId,
  );

  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'mb-4 border-b border-border/70 pb-3'
          : 'mb-2 rounded-lg border border-border px-3 py-2',
        className,
      )}
    >
      <Link
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
      <div
        className={cn(
          'min-w-0 font-semibold text-[color:var(--ink-1)]',
          mode === 'desktop' ? 'px-2 text-[15px]' : 'text-sm text-foreground',
        )}
      >
        {header.title}
      </div>
      {versionSwitcher &&
      currentVersion &&
      versionSwitcher.presentation !== 'tabs' ? (
        <DocsCompactMenu
          ariaLabel="Documentation versions"
          className={cn(mode === 'desktop' ? 'mx-2 mt-2' : 'mt-2')}
          panelClassName="w-48 p-1"
          button={({ 'aria-controls': ariaControls, 'aria-expanded': ariaExpanded, onClick }) => (
            <Button
              aria-controls={ariaControls}
              aria-expanded={ariaExpanded}
              aria-label="Select documentation version"
              className={cn(
                'h-8 max-w-full justify-between gap-2 rounded-md px-2.5 text-[13px]',
                mode === 'desktop' ? 'w-full' : 'w-full',
              )}
              onClick={onClick}
              size="sm"
              variant="outline"
            >
              <span className="min-w-0 truncate">{currentVersion.label}</span>
              <ChevronDownIcon aria-hidden="true" className="opacity-60" />
            </Button>
          )}
        >
          <div className="flex flex-col">
            {versionSwitcher.versions.map((version) => (
              <Link
                aria-current={
                  version.id === versionSwitcher.currentId ? 'page' : undefined
                }
                className="flex min-h-8 items-center justify-between rounded-md px-2.5 text-[13px] hover:bg-accent hover:text-accent-foreground"
                key={version.id}
                onClick={onSelectPath}
                params={{}}
                search={{}}
                to={version.href}
              >
                <span className="min-w-0 truncate">{version.label}</span>
                {version.id === versionSwitcher.currentId ? (
                  <CheckIcon className="opacity-80" />
                ) : null}
              </Link>
            ))}
          </div>
        </DocsCompactMenu>
      ) : null}
    </div>
  );
}
