'use client';

import { Link } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { cn } from '@/lib/cn';

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
      {versionSwitcher && currentVersion ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Select documentation version"
              className={cn(
                'mt-2 h-8 max-w-full justify-between gap-2 rounded-lg px-2 text-[13px]',
                mode === 'desktop' ? 'mx-2 w-[calc(100%-1rem)]' : 'w-full',
              )}
              size="sm"
              variant="outline"
            >
              <span className="min-w-0 truncate">{currentVersion.label}</span>
              <ChevronDownIcon className="size-3.5 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1">
            <div
              aria-label="Documentation versions"
              className="flex flex-col gap-1"
              role="menu"
            >
              {versionSwitcher.versions.map((version) => (
                <Button
                  asChild
                  className="w-full justify-between rounded-lg"
                  key={version.id}
                  variant={
                    version.id === versionSwitcher.currentId
                      ? 'secondary'
                      : 'ghost'
                  }
                >
                  <Link
                    aria-current={
                      version.id === versionSwitcher.currentId
                        ? 'page'
                        : undefined
                    }
                    onClick={onSelectPath}
                    params={{}}
                    role="menuitem"
                    search={{}}
                    to={version.href}
                  >
                    <span>{version.label}</span>
                    {version.id === versionSwitcher.currentId ? (
                      <CheckIcon className="size-4" />
                    ) : null}
                  </Link>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
