'use client';

import { useNavigate } from '@tanstack/react-router';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchDetailPanel } from '@/components/docs-shell/SearchDetailPanel';
import {
  type FilterGroup,
  SearchFilterDropdown,
} from '@/components/docs-shell/SearchFilterDropdown';
import { SearchKeyboardHints } from '@/components/docs-shell/SearchKeyboardHints';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  captureDocsSearchCompleted,
  captureDocsSearchOpened,
  captureDocsSearchResultClicked,
} from '@/lib/analytics/posthog';
import { cn } from '@/lib/cn';
import type { SearchEntry } from '@/lib/docs-search';
import type { ProductScope } from '@/lib/docs-tree';
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
import { getRecentPages, type RecentPage } from '@/lib/recently-viewed';
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { getAlgoliaSearchConfig } from '@/lib/search/algolia-config';
import { createOramaDocsClient } from '@/lib/search/orama-client';
import { classifySearchIntent } from '@/lib/search/search-intent';

// Delay before an Algolia query fires after the last keystroke. The skeleton
// "busy" bridge below runs slightly longer so it always outlasts this window.
const SEARCH_DEBOUNCE_MS = 200;

// First-open cascade: how many leading rows animate, and the per-row offset.
// Capped so a long list never feels slow to appear.
const STAGGER_MAX = 6;
const STAGGER_STEP_MS = 30;

// How many recently-viewed pages the empty state shows.
const RECENT_VISIBLE = 6;

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
}: {
  loadPages: () => Promise<SearchEntry[]>;
  locale?: AppLocale | string;
  mode?: 'desktop' | 'mobile';
  productScopes?: ProductScope[];
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
  // The first batch of rows shown right after opening cascades in. Typing
  // disarms it so results render instantly on every keystroke (no typing lag).
  const [staggerArmed, setStaggerArmed] = useState(false);
  // Recently-viewed pages shown (before any query) as a starting point. Loaded
  // from localStorage each time the dialog opens.
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const searchScope = productScopes.find(
    (scope) => scope.id === scopeId,
  )?.scope;
  const [pagesState, setPagesState] = useState<PagesState | null>(null);
  const pagesPromiseRef = useRef<{
    locale: AppLocale;
    promise: Promise<SearchEntry[]>;
  } | null>(null);
  const pages = pagesState?.locale === searchLocale ? pagesState.pages : [];
  const searchIndexFailed =
    pagesState?.locale === searchLocale && pagesState.status === 'error';
  const localSearchStatus =
    pagesState?.locale === searchLocale ? pagesState.status : 'loading';
  const algoliaConfig = getAlgoliaSearchConfig();
  const algoliaAppId = algoliaConfig?.appId;
  const algoliaApiReferenceIndexName = algoliaConfig?.apiReferenceIndexName;
  const algoliaIndexName = algoliaConfig?.indexName;
  const algoliaRankingV2 = algoliaConfig?.rankingV2 ?? false;
  const algoliaSearchApiKey = algoliaConfig?.searchApiKey;
  const algoliaEnabled = Boolean(algoliaConfig);
  // Count of in-flight search requests. fumadocs' `isLoading` flips off the
  // moment ANY request settles — including a superseded one whose result it then
  // discards — which briefly reads as "settled with no results" mid-typing and
  // flashes the empty message. Tracking every request keeps us "busy" until the
  // latest one actually resolves.
  const [pendingRequests, setPendingRequests] = useState(0);
  const [apiSearchUnavailable, setApiSearchUnavailable] = useState(false);
  const currentSearchRef = useRef('');
  const latestSearchRequestRef = useRef(0);
  const localSearchStatusRef = useRef(localSearchStatus);
  localSearchStatusRef.current = localSearchStatus;
  const pendingLocalCompletionRef = useRef<{
    query: string;
    requestId: number;
  } | null>(null);
  const isLatestSearch = useCallback((query: string, requestId: number) => {
    return (
      latestSearchRequestRef.current === requestId &&
      currentSearchRef.current === query.trim()
    );
  }, []);
  const captureLatestCompletedSearch = useCallback(
    ({
      query,
      requestId,
      resultCount,
      status,
    }: {
      query: string;
      requestId: number;
      resultCount?: number;
      status: 'error' | 'success';
    }) => {
      const normalizedQuery = query.trim();

      if (!isLatestSearch(normalizedQuery, requestId)) {
        return;
      }

      captureDocsSearchCompleted({
        locale: searchLocale,
        platformFilter,
        productScope: scopeId,
        provider: algoliaEnabled ? 'algolia' : 'local',
        queryLength: normalizedQuery.length,
        ...(resultCount === undefined ? {} : { resultCount }),
        status,
      });
      pendingLocalCompletionRef.current = null;
    },
    [algoliaEnabled, isLatestSearch, platformFilter, scopeId, searchLocale],
  );
  const searchClient = useMemo(() => {
    const base =
      algoliaAppId && algoliaIndexName && algoliaSearchApiKey
        ? createAlgoliaDocsClient({
            apiReferenceIndexName: algoliaApiReferenceIndexName,
            appId: algoliaAppId,
            indexName: algoliaIndexName,
            locale: searchLocale,
            platform: platformFilter ?? undefined,
            rankingV2: algoliaRankingV2,
            scope: searchScope,
            searchApiKey: algoliaSearchApiKey,
          })
        : createOramaDocsClient({
            pages,
            platform: platformFilter ?? undefined,
            scope: searchScope,
          });
    return {
      ...base,
      async search(query: string) {
        const requestId = latestSearchRequestRef.current + 1;
        latestSearchRequestRef.current = requestId;
        setApiSearchUnavailable(false);
        setPendingRequests((count) => count + 1);
        try {
          const results = await base.search(query);
          if (isLatestSearch(query, requestId)) {
            const searchStatus =
              'getLastStatus' in base &&
              typeof base.getLastStatus === 'function'
                ? base.getLastStatus()
                : undefined;
            const intent = classifySearchIntent(query).intent;
            const isApiIntent =
              intent === 'api-symbol' ||
              intent === 'api-task' ||
              (searchScope?.field === 'tab' &&
                searchScope.value === 'api-reference');

            setApiSearchUnavailable(
              searchStatus?.docs === 'success' &&
                searchStatus.api === 'error' &&
                isApiIntent,
            );
          }
          const completionStatus = algoliaEnabled
            ? 'success'
            : localSearchStatus === 'loading'
              ? localSearchStatusRef.current === 'error'
                ? 'error'
                : null
              : localSearchStatus === 'error'
                ? 'error'
                : 'success';

          if (completionStatus) {
            captureLatestCompletedSearch({
              query,
              requestId,
              ...(completionStatus === 'success'
                ? {
                    resultCount: Array.isArray(results) ? results.length : 0,
                  }
                : {}),
              status: completionStatus,
            });
          } else if (
            localSearchStatusRef.current === 'loading' &&
            isLatestSearch(query, requestId)
          ) {
            pendingLocalCompletionRef.current = {
              query,
              requestId,
            };
          }

          return results;
        } catch (error) {
          captureLatestCompletedSearch({
            query,
            requestId,
            status: 'error',
          });

          throw error;
        } finally {
          setPendingRequests((count) => count - 1);
        }
      },
    };
  }, [
    algoliaAppId,
    algoliaApiReferenceIndexName,
    algoliaIndexName,
    algoliaRankingV2,
    algoliaSearchApiKey,
    algoliaEnabled,
    captureLatestCompletedSearch,
    isLatestSearch,
    pages,
    platformFilter,
    localSearchStatus,
    searchScope,
    searchLocale,
  ]);
  const searchDeps = useMemo(
    () =>
      algoliaAppId && algoliaIndexName && algoliaSearchApiKey
        ? [
            algoliaAppId,
            algoliaApiReferenceIndexName,
            algoliaIndexName,
            algoliaRankingV2,
            algoliaSearchApiKey,
            searchLocale,
            platformFilter,
            searchScope,
          ]
        : [pages, searchLocale],
    [
      algoliaAppId,
      algoliaApiReferenceIndexName,
      algoliaIndexName,
      algoliaRankingV2,
      algoliaSearchApiKey,
      pages,
      platformFilter,
      searchScope,
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
      delayMs: algoliaConfig ? SEARCH_DEBOUNCE_MS : 0,
    },
    searchDeps,
  );
  currentSearchRef.current = search.trim();
  useEffect(() => {
    if (algoliaEnabled || localSearchStatus !== 'error') {
      return;
    }

    const pendingCompletion = pendingLocalCompletionRef.current;
    if (!pendingCompletion) {
      return;
    }

    pendingLocalCompletionRef.current = null;
    captureLatestCompletedSearch({
      ...pendingCompletion,
      status: 'error',
    });
  }, [algoliaEnabled, captureLatestCompletedSearch, localSearchStatus]);
  const normalizedSearchResults =
    !searchResults || searchResults === 'empty' ? [] : searchResults;
  const hasQuery = search.trim() !== '';
  const isSearchUnavailable = searchIndexFailed || Boolean(searchError);
  // fumadocs only flips `isLoading` once the debounced query fires (delayMs).
  // During that pre-fetch window `isLoading` is false and `results` still holds
  // the previous/initial value, which briefly flashes the empty state after a
  // keystroke. Treat the debounce window as busy so the skeleton bridges the gap.
  const [debouncePending, setDebouncePending] = useState(false);
  // `algoliaConfig` is a fresh object every render, so depend on a stable
  // boolean to avoid re-running this effect (and re-arming the timer) endlessly.
  useEffect(() => {
    if (!algoliaEnabled || search.trim() === '') {
      setDebouncePending(false);
      return;
    }
    setDebouncePending(true);
    const id = window.setTimeout(
      () => setDebouncePending(false),
      SEARCH_DEBOUNCE_MS + 30,
    );
    return () => window.clearTimeout(id);
  }, [algoliaEnabled, search]);
  useEffect(() => {
    if (isLoading) {
      setDebouncePending(false);
    }
  }, [isLoading]);
  // Once the user starts typing, the cascade would replay on every keystroke and
  // read as lag, so disarm it as soon as there's a query.
  useEffect(() => {
    if (search.trim() !== '') {
      setStaggerArmed(false);
    }
  }, [search]);
  const isBusy = isLoading || debouncePending || pendingRequests > 0;
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

  const invalidateCurrentSearch = useCallback(() => {
    latestSearchRequestRef.current += 1;
    pendingLocalCompletionRef.current = null;
    setApiSearchUnavailable(false);
  }, []);
  const handleSearchChange = useCallback(
    (nextSearch: string) => {
      setApiSearchUnavailable(false);
      setSearch(nextSearch);
    },
    [setSearch],
  );
  const closeAndReset = useCallback(() => {
    setOpen(false);
    setStaggerArmed(false);
    setActiveValue(null);
    invalidateCurrentSearch();
    setSearch('');
  }, [invalidateCurrentSearch, setSearch]);
  const handleScopeChange = useCallback(
    (nextScopeId: string | null) => {
      if (nextScopeId === scopeId) {
        return;
      }

      invalidateCurrentSearch();
      setScopeId(nextScopeId);
    },
    [invalidateCurrentSearch, scopeId],
  );
  const handlePlatformFilterChange = useCallback(
    (nextPlatform: string | null) => {
      const normalizedPlatform = nextPlatform as PlatformKey | null;
      if (normalizedPlatform === platformFilter) {
        return;
      }

      invalidateCurrentSearch();
      setPlatformFilter(normalizedPlatform);
    },
    [invalidateCurrentSearch, platformFilter],
  );

  async function handleSelect(url: string, rank?: number) {
    if (hasQuery && rank !== undefined) {
      captureDocsSearchResultClicked({
        href: url,
        locale: searchLocale,
        queryLength: search.trim().length,
        rank,
      });
    }

    closeAndReset();
    if (isExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    await navigate({
      to: url,
    });
  }

  const handleOpenChange = useCallback(
    async (nextOpen: boolean, trigger: 'button' | 'keyboard' = 'button') => {
      if (nextOpen) {
        setOpen(true);
        // Re-arm the result cascade each time the dialog opens.
        setStaggerArmed(true);
      } else {
        closeAndReset();
      }

      if (nextOpen) {
        captureDocsSearchOpened({
          locale: searchLocale,
          mode,
          trigger,
        });
        // Refresh the recent list from storage on each open, dropping the page
        // the user is currently on (offering it back to them makes no sense).
        const currentPath =
          typeof window === 'undefined' ? '' : window.location.pathname;
        setRecentPages(
          getRecentPages()
            .filter((page) => page.url !== currentPath)
            .slice(0, RECENT_VISIBLE),
        );
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
    [algoliaConfig, closeAndReset, loadPages, mode, pages.length, searchLocale],
  );

  useEffect(() => {
    // Only one instance owns the global ⌘K shortcut. DocsShell mounts several
    // DocsSearchDialogs (desktop + mobile triggers) that are toggled by CSS, so
    // if every instance listened, ⌘K would open multiple overlapping dialogs.
    if (mode !== 'desktop') {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'k') {
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      event.preventDefault();
      void handleOpenChange(true, 'keyboard');
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenChange, mode]);

  // Results only appear once there's a query — the empty state is the recent
  // list (or a prompt). Section tabs are navigation, not search results, so
  // they no longer appear here; their landing pages surface as normal results.
  const resultEntries: RenderedSearchEntry[] =
    !hasQuery || isSearchUnavailable
      ? []
      : normalizedSearchResults.map(searchResultToEntry);
  const rankedApiReferenceEntries = resultEntries
    .map((page, index) => ({ page, rank: index + 1 }))
    .filter(({ page }) => page.objectType === 'sdk-api');
  const rankedDocumentationEntries = resultEntries
    .map((page, index) => ({ page, rank: index + 1 }))
    .filter(({ page }) => page.objectType !== 'sdk-api');
  const showRecent = !hasQuery && recentPages.length > 0;
  // Nothing typed and no history yet → a plain prompt instead of fake results.
  const showPrompt = !hasQuery && recentPages.length === 0;
  // Only show the loading skeleton when there's nothing else to show. While a
  // re-query is in flight the previous results stay visible, so the skeleton
  // must not render on top of them.
  const showSkeleton = hasQuery && isBusy && resultEntries.length === 0;

  // One detail record per rendered item, in render order. `value` matches the
  // cmdk item value set on each CommandItem below. The empty state lists recent
  // pages; an active query lists results.
  const detailEntries: DetailEntry[] = hasQuery
    ? resultEntries.map((page) => ({
        path: page.path,
        primary: page.description,
        title: page.title,
        value: page.id ?? page.url,
      }))
    : recentPages.map((page) => ({
        path: [],
        primary: page.description,
        title: page.title,
        value: page.url,
      }));

  // cmdk emits the active item's (trimmed) value via onValueChange. Our values
  // are URLs/ids with no case or whitespace variance, so a direct match is
  // correct. Fall back to the first rendered item (cmdk auto-selects it) so the
  // strip is populated on open and when the previously-active item was filtered
  // out.
  const activeDetail =
    detailEntries.find((entry) => entry.value === activeValue) ??
    detailEntries[0];

  // Per-row cascade props for the first-open stagger. `position` is the row's
  // index across the whole list (tabs first, then results); only the first
  // STAGGER_MAX rows animate, each offset by STAGGER_STEP_MS.
  const staggerProps = (position: number) =>
    staggerArmed && position < STAGGER_MAX
      ? {
          className: 'search-result-enter',
          style: { animationDelay: `${position * STAGGER_STEP_MS}ms` },
        }
      : { className: undefined, style: undefined };

  return (
    <>
      {mode === 'mobile' ? (
        <Button
          aria-label={t('docs.search')}
          onClick={() => void handleOpenChange(true, 'button')}
          size="icon"
          variant="ghost"
        >
          <SearchIcon />
        </Button>
      ) : (
        <Button
          aria-label={t('docs.search')}
          className="docs-shell-search-trigger"
          onClick={() => void handleOpenChange(true, 'button')}
          size="sm"
          variant="outline"
        >
          <SearchIcon data-icon="inline-start" />
          <span>{t('docs.searchPlaceholder')}</span>
          <kbd>⌘K</kbd>
        </Button>
      )}
      <CommandDialog
        className="docs-search-dialog max-w-2xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        onValueChange={setActiveValue}
        open={open}
        overlayClassName="docs-search-overlay bg-black/30 backdrop-blur-md"
        shouldFilter={false}
        title={t('docs.search')}
        value={activeValue ?? ''}
      >
        <CommandInput
          onValueChange={handleSearchChange}
          placeholder={t('docs.searchPlaceholder')}
          value={search}
        />
        {algoliaConfig ? (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            {productScopes.length > 0 ? (
              <SearchFilterDropdown
                allLabel={t('docs.searchAllProducts')}
                emptyLabel={t('docs.searchFilterNoResults')}
                groups={productFilterGroups}
                onChange={handleScopeChange}
                searchPlaceholder={t('docs.searchFilterProducts')}
                value={scopeId}
              />
            ) : null}
            <SearchFilterDropdown
              allLabel={t('docs.searchAllPlatforms')}
              emptyLabel={t('docs.searchFilterNoResults')}
              groups={platformFilterGroups}
              onChange={handlePlatformFilterChange}
              searchPlaceholder={t('docs.searchFilterPlatforms')}
              value={platformFilter}
            />
          </div>
        ) : null}
        {hasQuery && apiSearchUnavailable && !isSearchUnavailable ? (
          <div
            aria-live="polite"
            className="border-b px-4 py-2 text-sm text-muted-foreground"
            data-testid="search-api-unavailable"
            role="status"
          >
            {t('docs.searchApiUnavailable')}
          </div>
        ) : null}
        <CommandList className="max-h-[min(620px,70vh)]">
          {showSkeleton ? (
            <div className="space-y-1 p-2" data-testid="search-loading">
              {[0, 1, 2].map((row) => (
                <div className="space-y-2 rounded-md px-2 py-2.5" key={row}>
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-muted/70" />
                </div>
              ))}
            </div>
          ) : hasQuery ? (
            // Only render cmdk's empty slot during an active search. Rendering it
            // in the prompt/recent state adds an empty padded block that throws
            // off the prompt's vertical balance.
            <CommandEmpty>
              {isSearchUnavailable
                ? t('docs.searchUnavailable')
                : normalizedSearchResults.length === 0
                  ? t('docs.searchEmpty')
                  : null}
            </CommandEmpty>
          ) : null}
          {showPrompt ? (
            <div
              className="px-4 py-8 text-center text-sm text-muted-foreground"
              data-testid="search-prompt"
            >
              {t('docs.searchPrompt')}
            </div>
          ) : null}
          {showRecent ? (
            <CommandGroup heading={t('docs.searchRecent')}>
              {recentPages.map((page, index) => {
                const stagger = staggerProps(index);
                return (
                  <CommandItem
                    className={cn('items-start', stagger.className)}
                    key={page.url}
                    onSelect={() => void handleSelect(page.url)}
                    style={stagger.style}
                    value={page.url}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <span className="line-clamp-1 font-medium">
                        {page.title}
                      </span>
                      {page.description ? (
                        <div className="line-clamp-1 text-[0.7rem] text-muted-foreground">
                          {page.description}
                        </div>
                      ) : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
          {hasQuery && isSearchUnavailable ? (
            <CommandGroup>
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {t('docs.searchUnavailable')}
              </div>
            </CommandGroup>
          ) : null}
          {hasQuery
            ? [
                {
                  entries: rankedApiReferenceEntries,
                  heading: t('docs.searchApiReference'),
                },
                {
                  entries: rankedDocumentationEntries,
                  heading: t('docs.searchDocumentation'),
                },
              ].map(({ entries, heading }) =>
                entries.length > 0 ? (
                  <CommandGroup heading={heading} key={heading}>
                    {entries.map(({ page, rank }) => {
                      const stagger = staggerProps(rank - 1);
                      return (
                        <CommandItem
                          className={cn('items-start', stagger.className)}
                          key={page.id ?? page.url}
                          onSelect={() => void handleSelect(page.url, rank)}
                          style={stagger.style}
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
                      );
                    })}
                  </CommandGroup>
                ) : null,
              )
            : null}
        </CommandList>
        {/* Active-item detail: floats beside the dialog when there's room,
            otherwise a fixed-height strip in the footer. Either way it's out of
            the height-varying flow, so the dialog doesn't resize on focus change. */}
        <SearchDetailPanel
          activeValue={activeValue}
          description={activeDetail?.primary}
          open={open}
          renderText={(value) => <HighlightedText value={value} />}
          title={activeDetail?.title}
        />
        <SearchKeyboardHints
          closeLabel={t('docs.searchHintClose')}
          navigateLabel={t('docs.searchHintNavigate')}
          selectLabel={t('docs.searchHintSelect')}
        />
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

// The active-item detail shown in the floating panel / footer strip, one per
// rendered tab or result. `value` matches the item's cmdk value.
type DetailEntry = {
  path: string[];
  primary?: string;
  title: string;
  value: string;
};

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
  version?: unknown;
}): RenderedSearchEntry {
  const breadcrumbs = getStringArray(result.breadcrumbs);
  const platforms = getStringArray(result.platform);
  const objectType = getString(result.objectType);
  const version = getString(result.version);

  return {
    context: uniqueStrings([
      objectType === 'openapi' ? 'API' : undefined,
      ...formatPlatformContext(platforms ?? []),
      version,
    ]),
    description: truncateSearchSnippet(
      typeof result.snippet === 'string'
        ? result.snippet
        : breadcrumbs?.filter(Boolean).join(' / '),
    ),
    id: getString(result.id),
    objectType:
      objectType === 'docs' ||
      objectType === 'openapi' ||
      objectType === 'sdk-api'
        ? objectType
        : undefined,
    path: getStringArray(result.path) ?? [],
    title:
      typeof result.title === 'string'
        ? result.title
        : typeof result.content === 'string'
          ? result.content
          : result.url,
    url: result.url,
    version,
  };
}

function isExternalUrl(url: string) {
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
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
