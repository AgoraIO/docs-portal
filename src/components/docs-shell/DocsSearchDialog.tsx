'use client';

import { useNavigate } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { SearchEntry } from '@/lib/docs-search';
import type { TabSummary } from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';

type PagesState =
  | {
      locale: AppLocale;
      pages: SearchEntry[];
      status: 'loaded';
    }
  | {
      locale: AppLocale;
      pages: [];
      status: 'error';
    };

export function DocsSearchDialog({
  loadPages,
  locale = DEFAULT_LOCALE,
  mode = 'desktop',
  tabs,
}: {
  loadPages: () => Promise<SearchEntry[]>;
  locale?: AppLocale | string;
  mode?: 'desktop' | 'mobile';
  tabs: TabSummary[];
}) {
  const { i18n } = useTranslation('common');
  const searchLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(searchLocale, 'common');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pagesState, setPagesState] = useState<PagesState | null>(null);
  const pagesPromiseRef = useRef<{
    locale: AppLocale;
    promise: Promise<SearchEntry[]>;
  } | null>(null);
  const pages = pagesState?.locale === searchLocale ? pagesState.pages : [];
  const searchIndexFailed =
    pagesState?.locale === searchLocale && pagesState.status === 'error';

  async function handleSelect(url: string) {
    setOpen(false);
    await navigate({
      to: url,
    });
  }

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen && pages.length === 0) {
      try {
        if (pagesPromiseRef.current?.locale !== searchLocale) {
          pagesPromiseRef.current = {
            locale: searchLocale,
            promise: loadPages(),
          };
        }
        setPagesState({
          locale: searchLocale,
          pages: await pagesPromiseRef.current.promise,
          status: 'loaded',
        });
      } catch {
        pagesPromiseRef.current = null;
        setPagesState({
          locale: searchLocale,
          pages: [],
          status: 'error',
        });
      }
    }
  }

  return (
    <>
      {mode === 'mobile' ? (
        <Button
          aria-label={t('docs.search')}
          onClick={() => void handleOpenChange(true)}
          size="icon"
          variant="ghost"
        >
          <SearchIcon />
        </Button>
      ) : (
        <Button
          aria-label={t('docs.search')}
          className="docs-shell-search-trigger"
          onClick={() => void handleOpenChange(true)}
          size="sm"
          variant="outline"
        >
          <SearchIcon data-icon="inline-start" />
          <span>{t('docs.searchPlaceholder')}</span>
          <kbd>⌘K</kbd>
        </Button>
      )}
      <CommandDialog
        className="max-w-2xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        open={open}
        title={t('docs.search')}
      >
        <CommandInput placeholder={t('docs.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>
            {searchIndexFailed
              ? t('docs.searchUnavailable')
              : t('docs.searchEmpty')}
          </CommandEmpty>
          <CommandGroup heading={t('docs.tabsLabel')}>
            {tabs.map((tab) => (
              <CommandItem
                key={tab.url}
                onSelect={() => void handleSelect(tab.url)}
              >
                <div className="flex flex-col gap-1">
                  <span>{tab.title}</span>
                  {tab.description ? (
                    <span className="text-xs text-muted-foreground">
                      {tab.description}
                    </span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('docs.pagesLabel')}>
            {searchIndexFailed ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {t('docs.searchUnavailable')}
              </div>
            ) : (
              pages.map((page) => (
                <CommandItem
                  key={page.url}
                  onSelect={() => void handleSelect(page.url)}
                >
                  <div className="flex flex-col gap-1">
                    <span>{page.title}</span>
                    {page.description ? (
                      <span className="text-xs text-muted-foreground">
                        {page.description}
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
