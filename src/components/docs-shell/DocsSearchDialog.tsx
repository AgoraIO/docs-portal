'use client';

import { useNavigate } from '@tanstack/react-router';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type FilterGroup,
  SearchFilterDropdown,
} from '@/components/docs-shell/SearchFilterDropdown';
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
import type { ProductScope, TabSummary } from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import {
  getPlatformLabel,
  type PlatformKey,
  platformRegistry,
} from '@/lib/platforms/registry';
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
  productScopes = [],
  tabs,
}: {
  loadPages: () => Promise<SearchEntry[]>;
  locale?: AppLocale | string;
  mode?: 'desktop' | 'mobile';
  productScopes?: ProductScope[];
  tabs: TabSummary[];
}) {
  const { i18n } = useTranslation('common');
  const searchLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(searchLocale, 'common');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformKey | null>(
    null,
  );
  // Selected scope id (e.g. `product:video`), or null for all products.
  const [scopeId, setScopeId] = useState<string | null>(null);
  // Mirrors cmdk's highlighted item (keyboard ↑/↓ AND mouse hover both set it)
  // so the footer can describe the active result without a focus-based tooltip.
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const scopeFilter =
    productScopes.find((scope) => scope.id === scopeId)?.filter ?? undefined;
  const [pagesState, setPagesState] = useState<PagesState | null>(null);
  const pagesPromiseRef = useRef<{
    locale: AppLocale;
    promise: Promise<SearchEntry[]>;
  } | null>(null);
  const pages = pagesState?.locale === searchLocale ? pagesState.pages : [];
  const searchIndexFailed =
    pagesState?.locale === searchLocale && pagesState.status === 'error';
  const algoliaConfig = getAlgoliaSearchConfig();
  const algoliaAppId = algoliaConfig?.appId;
  const algoliaIndexName = algoliaConfig?.indexName;
  const algoliaSearchApiKey = algoliaConfig?.searchApiKey;
  const searchClient = useMemo(
    () =>
      algoliaAppId && algoliaIndexName && algoliaSearchApiKey
        ? createAlgoliaDocsClient({
            appId: algoliaAppId,
            indexName: algoliaIndexName,
            locale: searchLocale,
            platform: platformFilter ?? undefined,
            scopeFilter,
            searchApiKey: algoliaSearchApiKey,
          })
        : createLocalDocsClient(pages),
    [
      algoliaAppId,
      algoliaIndexName,
      algoliaSearchApiKey,
      pages,
      platformFilter,
      scopeFilter,
      searchLocale,
    ],
  );
  const searchDeps = useMemo(
    () =>
      algoliaAppId && algoliaIndexName && algoliaSearchApiKey
        ? [
            algoliaAppId,
            algoliaIndexName,
            algoliaSearchApiKey,
            searchLocale,
            platformFilter,
            scopeFilter,
          ]
        : [pages, searchLocale],
    [
      algoliaAppId,
      algoliaIndexName,
      algoliaSearchApiKey,
      pages,
      platformFilter,
      scopeFilter,
      searchLocale,
    ],
  );
  const {
    search,
    setSearch,
    query: { data: searchResults, error: searchError, isLoading },
  } = useDocsSearch(
    {
      client: searchClient,
      delayMs: algoliaConfig ? 100 : 0,
    },
    searchDeps,
  );
  const normalizedSearchResults =
    !searchResults || searchResults === 'empty' ? [] : searchResults;
  const showFallbackPages = !algoliaConfig && !search.trim();
  const isSearchUnavailable = searchIndexFailed || Boolean(searchError);
  const platformOptions = useMemo(
    () =>
      (Object.keys(platformRegistry) as PlatformKey[]).filter((platform) =>
        [
          'web',
          'android',
          'ios',
          'javascript',
          'flutter',
          'react-native',
          'windows',
          'macos',
          'electron',
          'unity',
        ].includes(platform),
      ),
    [],
  );

  const productFilterGroups = useMemo<FilterGroup[]>(
    () =>
      groupProductScopes(productScopes).map((group) => ({
        label: group.label,
        options: group.scopes.map((scope) => ({
          description: scope.description,
          label: scope.label,
          value: scope.id,
        })),
      })),
    [productScopes],
  );
  const platformFilterGroups = useMemo<FilterGroup[]>(
    () => [
      {
        options: platformOptions.map((platform) => ({
          label: getPlatformLabel(platform, searchLocale),
          value: platform,
        })),
      },
    ],
    [platformOptions, searchLocale],
  );

  async function handleSelect(url: string) {
    setOpen(false);
    await navigate({
      to: url,
    });
  }

  const handleOpenChange = useCallback(
    async (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (!nextOpen) {
        setActiveValue(null);
      }

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
    },
    [algoliaConfig, loadPages, pages.length, searchLocale],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'k') {
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      event.preventDefault();
      void handleOpenChange(true);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenChange]);

  const tabEntries = filterTabs(tabs, search);
  const resultEntries: RenderedSearchEntry[] = isSearchUnavailable
    ? []
    : showFallbackPages
      ? pages.map(localSearchEntryToRenderedEntry)
      : normalizedSearchResults.map(searchResultToEntry);

  // One detail record per rendered item, in render order (tabs first, then
  // results). `value` matches the cmdk item value set on each CommandItem below.
  const detailEntries = [
    ...tabEntries.map((tab) => ({
      path: [] as string[],
      primary: tab.description,
      value: tab.url,
    })),
    ...resultEntries.map((page) => ({
      path: page.path,
      primary: page.description,
      value: page.id ?? page.url,
    })),
  ];

  // cmdk emits the active item's (trimmed) value via onValueChange. Our values
  // are URLs/ids with no case or whitespace variance, so a direct match is
  // correct. Fall back to the first rendered item (cmdk auto-selects it) so the
  // strip is populated on open and when the previously-active item was filtered
  // out.
  const activeDetail =
    detailEntries.find((entry) => entry.value === activeValue) ??
    detailEntries[0];

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
        className="max-w-4xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        onValueChange={setActiveValue}
        open={open}
        shouldFilter={false}
        title={t('docs.search')}
      >
        <CommandInput
          onValueChange={setSearch}
          placeholder={t('docs.searchPlaceholder')}
          value={search}
        />
        {algoliaConfig ? (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            {productScopes.length > 0 ? (
              <SearchFilterDropdown
                allLabel={t('docs.searchAllProducts')}
                groups={productFilterGroups}
                onChange={setScopeId}
                searchPlaceholder={t('docs.searchFilterProducts')}
                value={scopeId}
              />
            ) : null}
            <SearchFilterDropdown
              allLabel={t('docs.searchAllPlatforms')}
              groups={platformFilterGroups}
              onChange={(next) => setPlatformFilter(next as PlatformKey | null)}
              searchPlaceholder={t('docs.searchFilterPlatforms')}
              value={platformFilter}
            />
          </div>
        ) : null}
        <CommandList className="max-h-[min(620px,70vh)]">
          <CommandEmpty>
            {isLoading
              ? t('docs.searchLoading')
              : isSearchUnavailable
                ? t('docs.searchUnavailable')
                : t('docs.searchEmpty')}
          </CommandEmpty>
          <CommandGroup>
            {tabEntries.map((tab) => (
              <CommandItem
                key={tab.url}
                onSelect={() => void handleSelect(tab.url)}
                value={tab.url}
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
          <CommandGroup>
            {isSearchUnavailable ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {t('docs.searchUnavailable')}
              </div>
            ) : (
              resultEntries.map((page) => (
                <CommandItem
                  className="items-start"
                  key={page.id ?? page.url}
                  onSelect={() => void handleSelect(page.url)}
                  value={page.id ?? page.url}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <HighlightedText
                      className="line-clamp-1 font-medium"
                      value={page.title}
                    />
                    {page.path.length > 0 ? (
                      <div className="line-clamp-1 text-[0.7rem] text-muted-foreground">
                        {page.path.join(' › ')}
                      </div>
                    ) : null}
                    {page.context.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {page.context.map((item) => (
                          <span
                            className="rounded border border-border bg-background/70 px-1.5 py-0.5 text-[0.68rem] leading-none text-muted-foreground"
                            key={`${page.id ?? page.url}:${item}`}
                          >
                            <HighlightedText value={item} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>
        {/* Footer detail strip: mirrors the cmdk-active item's snippet + full
            path. Rows still show their own (truncated) path so non-active rows
            remain locatable; the active item intentionally appears in both. */}
        {activeDetail &&
        (activeDetail.primary || activeDetail.path.length > 0) ? (
          <div
            className="min-h-[3.25rem] shrink-0 border-t px-4 py-2"
            data-testid="search-active-detail"
          >
            {activeDetail.primary ? (
              <HighlightedText
                className="line-clamp-2 text-xs leading-5 text-muted-foreground"
                value={activeDetail.primary}
              />
            ) : null}
            {activeDetail.path.length > 0 ? (
              <div className="mt-1 line-clamp-1 text-[0.7rem] text-muted-foreground/80">
                {activeDetail.path.join(' › ')}
              </div>
            ) : null}
          </div>
        ) : null}
      </CommandDialog>
    </>
  );
}

type RenderedSearchEntry = SearchEntry & {
  context: string[];
  id?: string;
  path: string[];
  snippet?: string;
};

function localSearchEntryToRenderedEntry(
  entry: SearchEntry,
): RenderedSearchEntry {
  return {
    ...entry,
    context: [],
    id: entry.url,
    path: [],
  };
}

function searchResultToEntry(result: {
  breadcrumbs?: unknown[];
  content: unknown;
  id?: unknown;
  objectType?: unknown;
  path?: unknown[];
  platform?: unknown;
  product?: unknown;
  section?: unknown;
  snippet?: unknown;
  tab?: unknown;
  title?: unknown;
  url: string;
}): RenderedSearchEntry {
  const breadcrumbs = getStringArray(result.breadcrumbs);
  const platforms = getStringArray(result.platform);
  const objectType = getString(result.objectType);

  return {
    context: uniqueStrings([
      objectType === 'openapi' ? 'API' : undefined,
      ...formatPlatformContext(platforms ?? []),
    ]),
    description: truncateSearchSnippet(
      typeof result.snippet === 'string'
        ? result.snippet
        : breadcrumbs?.filter(Boolean).join(' / '),
    ),
    id: getString(result.id),
    path: getStringArray(result.path) ?? [],
    title:
      typeof result.title === 'string'
        ? result.title
        : typeof result.content === 'string'
          ? result.content
          : result.url,
    url: result.url,
  };
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;
}

function uniqueStrings(values: (string | undefined)[]) {
  return [...new Set(values.filter(Boolean))] as string[];
}

function formatPlatformContext(platforms: string[]) {
  if (platforms.length <= 3) {
    return platforms;
  }

  return [...platforms.slice(0, 3), `+${platforms.length - 3}`];
}

function truncateSearchSnippet(value: string | undefined) {
  if (!value || value.length <= 360) {
    return value;
  }

  return `${value.slice(0, 360).trim()}...`;
}

function HighlightedText({
  className,
  value,
}: {
  className?: string;
  value: string;
}) {
  return (
    <span className={className}>
      {getHighlightParts(value).map((part) =>
        part.highlight ? (
          <mark
            className="rounded-[3px] bg-primary/25 px-0.5 font-semibold text-primary"
            key={part.key}
          >
            {part.text}
          </mark>
        ) : (
          <span key={part.key}>{part.text}</span>
        ),
      )}
    </span>
  );
}

function getHighlightParts(value: string) {
  const parts: { highlight: boolean; key: string; text: string }[] = [];
  const pattern = /<mark>(.*?)<\/mark>/g;
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    const start = match.index;

    if (start > cursor) {
      const text = value.slice(cursor, start);
      parts.push({
        highlight: false,
        key: `${cursor}:text:${text}`,
        text,
      });
    }

    const text = match[1];
    parts.push({
      highlight: true,
      key: `${start}:mark:${text}`,
      text,
    });
    cursor = start + match[0].length;
  }

  if (cursor < value.length) {
    const text = value.slice(cursor);
    parts.push({
      highlight: false,
      key: `${cursor}:text:${text}`,
      text,
    });
  }

  return parts.length > 0
    ? parts
    : [{ highlight: false, key: `0:text:${value}`, text: value }];
}

// Group scopes by their section header (preserving nav order) for <optgroup>
// rendering. Tab-level scopes (no group) come through as an unlabelled group.
function groupProductScopes(scopes: ProductScope[]) {
  const groups: { label?: string; scopes: ProductScope[] }[] = [];
  const byLabel = new Map<string, { label?: string; scopes: ProductScope[] }>();

  for (const scope of scopes) {
    const key = scope.group ?? '';
    let group = byLabel.get(key);

    if (!group) {
      group = { label: scope.group, scopes: [] };
      byLabel.set(key, group);
      groups.push(group);
    }

    group.scopes.push(scope);
  }

  return groups;
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
