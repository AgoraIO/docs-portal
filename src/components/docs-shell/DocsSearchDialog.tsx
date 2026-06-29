'use client';

import { useNavigate } from '@tanstack/react-router';
import { useDocsSearch } from 'fumadocs-core/search/client';
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
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { getAlgoliaSearchConfig } from '@/lib/search/algolia-config';

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
  const algoliaConfig = getAlgoliaSearchConfig();
  const searchClient = algoliaConfig
    ? createAlgoliaDocsClient({
        ...algoliaConfig,
        locale: searchLocale,
      })
    : createLocalDocsClient(pages);
  const {
    search,
    setSearch,
    query: { data: searchResults, isLoading },
  } = useDocsSearch(
    {
      client: searchClient,
      delayMs: algoliaConfig ? 100 : 0,
    },
    [algoliaConfig, pages, searchLocale],
  );
  const normalizedSearchResults =
    !searchResults || searchResults === 'empty' ? [] : searchResults;
  const showFallbackPages = !algoliaConfig && !search.trim();

  async function handleSelect(url: string) {
    setOpen(false);
    await navigate({
      to: url,
    });
  }

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (algoliaConfig || !nextOpen || pages.length > 0) {
      return;
    }

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
        shouldFilter={false}
        title={t('docs.search')}
      >
        <CommandInput
          onValueChange={setSearch}
          placeholder={t('docs.searchPlaceholder')}
          value={search}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading
              ? t('docs.searchLoading')
              : searchIndexFailed
                ? t('docs.searchUnavailable')
                : t('docs.searchEmpty')}
          </CommandEmpty>
          <CommandGroup heading={t('docs.tabsLabel')}>
            {filterTabs(tabs, search).map((tab) => (
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
              (showFallbackPages
                ? pages
                : normalizedSearchResults.map((result) => ({
                    description: result.breadcrumbs?.join(' / '),
                    title: result.content,
                    url: result.url,
                  }))
              ).map((page) => (
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

function filterTabs(tabs: TabSummary[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tabs;
  }

  return tabs.filter((tab) =>
    `${tab.title}\n${tab.description ?? ''}\n${tab.url}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function createLocalDocsClient(pages: SearchEntry[]) {
  return {
    deps: [pages],
    search(query: string) {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return [];
      }

      return pages
        .filter((page) =>
          `${page.title}\n${page.description ?? ''}\n${page.url}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
        .slice(0, 12)
        .map((page) => ({
          content: page.title,
          id: page.url,
          type: 'page' as const,
          url: page.url,
        }));
    },
  };
}
