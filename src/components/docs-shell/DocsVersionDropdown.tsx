'use client';

import { Link } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
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

export function DocsVersionDropdown({
  className,
  locale,
  onSelectPath,
  versionSwitcher,
}: {
  className?: string;
  locale: AppLocale;
  onSelectPath?: () => void;
  versionSwitcher: NonNullable<DocsSidebarHeader['versionSwitcher']>;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(locale, 'common');
  const currentVersion = versionSwitcher.versions.find(
    (version) => version.id === versionSwitcher.currentId,
  );

  if (!currentVersion) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('docs.versionSelect')}
          className={cn(
            'h-8 max-w-full justify-between gap-2 rounded-md px-2.5 text-[13px] data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className,
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
          {versionSwitcher.versions.map((version) => {
            const isCurrent = version.id === versionSwitcher.currentId;
            const content = (
              <>
                <span className="min-w-0 truncate">{version.label}</span>
                {isCurrent ? <CheckIcon className="opacity-80" /> : null}
              </>
            );

            return (
              <DropdownMenuItem
                asChild
                className="min-h-8 cursor-pointer justify-between rounded-md px-2.5 text-[13px]"
                key={version.id}
              >
                {/^https?:\/\//i.test(version.href) ? (
                  <a
                    aria-current={isCurrent ? 'page' : undefined}
                    href={version.href}
                    onClick={onSelectPath}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    onClick={onSelectPath}
                    params={{}}
                    search={{}}
                    to={version.href}
                  >
                    {content}
                  </Link>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
