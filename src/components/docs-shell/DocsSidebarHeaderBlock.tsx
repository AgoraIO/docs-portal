'use client';

import { Link } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { AppLocale } from '@/lib/i18n/i18n-config';

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
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('docs.versionSelect')}
              className={cn(
                'mt-2 h-8 max-w-full justify-between gap-2 rounded-md px-2.5 text-[13px] data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                mode === 'desktop' ? 'mx-2 w-[calc(100%-1rem)]' : 'w-full',
              )}
              size="sm"
              variant="outline"
            >
              <span className="min-w-0 truncate">{currentVersion.label}</span>
              <ChevronDownIcon aria-hidden="true" className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            aria-label={t('docs.versionMenuLabel')}
            className="w-48 rounded-lg p-1"
          >
            <DropdownMenuGroup>
              {versionSwitcher.versions.map((version) => (
                <DropdownMenuItem
                  asChild
                  className="min-h-8 cursor-pointer justify-between rounded-md px-2.5 text-[13px]"
                  key={version.id}
                >
                  <Link
                    aria-current={
                      version.id === versionSwitcher.currentId
                        ? 'page'
                        : undefined
                    }
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
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
