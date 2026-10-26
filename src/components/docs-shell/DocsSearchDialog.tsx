'use client';

import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { ArrowUpRightIcon, SearchIcon } from 'lucide-react';
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
import type {
  ResultsSnapshot,
  SearchSnapshot,
} from '@/lib/analytics/docs-measurement';
import {
  getDocsMeasurement,
  selectDocsResult,
} from '@/lib/analytics/measurement';
import { observeVisible } from '@/lib/analytics/visibility';
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
import { getCnProductLabel } from '@/lib/search/cn-product-labels';
import { createCnDocsSearchClient } from '@/lib/search/cn-search-client';
import {
  getCnSearchPlatforms,
  getCnSearchSdkLabel,
} from '@/lib/search/cn-search-context';
import {
  loadCnSearchCatalog,
  type SearchFacets,
} from '@/lib/search/cn-search-page';
import {
  CN_SEARCH_SESSION_CHANGED,
  type CnSearchSession,
  readCnSearchSession,
  saveCnSearchSession,
} from '@/lib/search/cn-search-session';
import { createOramaDocsClient } from '@/lib/search/orama-client';
import {
  buildSearchPageHref,
  searchScopeProduct,
} from '@/lib/search/search-page-state';
import { DocsTaskFeedback } from './DocsTaskFeedback';

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
  const pathname = useLocation({ select: (location) => location.pathname });
  const isCn = searchLocale === 'zh-CN';
  const [open, setOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformKey | null>(
    null,
  );
  // Selected scope id (e.g. `product:video`), or null for all products.
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<SearchFacets>();
  const manualSelection = useRef(false);
  const searchOrigin = useRef<string | undefined>(undefined);
  const [savedPage, setSavedPage] = useState<{
    path: string;
    value?: CnSearchSession;
  }>();
  useEffect(() => {
    if (!isCn) return;
    const synchronize = () => {
      setSavedPage({ path: pathname, value: readCnSearchSession(pathname) });
    };
    synchronize();
    window.addEventListener(CN_SEARCH_SESSION_CHANGED, synchronize);
    return () =>
      window.removeEventListener(CN_SEARCH_SESSION_CHANGED, synchronize);
  }, [isCn, pathname]);
  const currentSearch = useRef({
    query: draftSearch,
    platform: platformFilter,
    scope: scopeId,
  });
  currentSearch.current = {
    query: draftSearch,
    platform: platformFilter,
    scope: scopeId,
  };
  useEffect(() => {
    if (isCn && open && searchOrigin.current === pathname) {
      saveCnSearchSession(pathname, {
        query: draftSearch,
        platform: platformFilter,
        scope: scopeId,
      });
    }
  }, [isCn, open, pathname, draftSearch, platformFilter, scopeId]);
  useEffect(() => {
    if (!isCn || !open || catalog) return;
    const controller = new AbortController();
    loadCnSearchCatalog(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCatalog(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [isCn, open, catalog]);
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
  const algoliaConfig = getAlgoliaSearchConfig();
  const algoliaAppId = algoliaConfig?.appId;
  const algoliaIndexName = algoliaConfig?.indexName;
  const algoliaSearchApiKey = algoliaConfig?.searchApiKey;
  const remoteSearchEnabled =
    searchLocale === 'zh-CN' || Boolean(algoliaConfig);
  // Count of in-flight search requests. fumadocs' `isLoading` flips off the
  // moment ANY request settles — including a superseded one whose result it then
  // discards — which briefly reads as "settled with no results" mid-typing and
  // flashes the empty message. Tracking every request keeps us "busy" until the
  // latest one actually resolves.
  const [pendingRequests, setPendingRequests] = useState(0);
  const isOpenRef = useRef(open);
  isOpenRef.current = open;
  const inputAt = useRef<number | undefined>(undefined);
  const composing = useRef(false);
  const logicalSearch = useRef<{
    key: string;
    snapshot: SearchSnapshot;
  } | null>(null);
  const resultSnapshots = useRef(new WeakMap<object, ResultsSnapshot>());
  const errorSnapshots = useRef(
    new WeakMap<object, { search: SearchSnapshot; requestId: string }>(),
  );
  const resultsContainer = useRef<HTMLDivElement>(null);
  const selectionMethod = useRef('keyboard');
  const searchClient = useMemo(() => {
    let headers: Record<string, string> = {};
    const base =
      searchLocale === 'zh-CN'
        ? createCnDocsSearchClient({
            platform: platformFilter ?? undefined,
            scope: searchScope,
            requestHeaders: () => headers,
          })
        : algoliaAppId && algoliaIndexName && algoliaSearchApiKey
          ? createAlgoliaDocsClient({
              appId: algoliaAppId,
              indexName: algoliaIndexName,
              locale: searchLocale,
              platform: platformFilter ?? undefined,
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
        setPendingRequests((count) => count + 1);
        const measurement =
          searchLocale === 'zh-CN' && isOpenRef.current && query.trim()
            ? getDocsMeasurement()
            : undefined;
        const key = JSON.stringify([query.trim(), platformFilter, searchScope]);
        if (
          measurement &&
          (logicalSearch.current?.key !== key ||
            !measurement.searchIsCurrent(logicalSearch.current.snapshot))
        )
          logicalSearch.current = {
            key,
            snapshot: measurement.startSearch({
              surface: 'search_dialog',
              query,
              started: inputAt.current,
              filters: {
                platform: platformFilter ?? undefined,
                product: searchScopeProduct(searchScope),
                tab:
                  searchScope?.field === 'tab' ? searchScope.value : undefined,
              },
            }),
          };
        const snapshot = measurement
          ? logicalSearch.current?.snapshot
          : undefined;
        const requestId = snapshot ? crypto.randomUUID() : undefined;
        headers =
          snapshot && requestId
            ? {
                'X-Docs-Search-Id': snapshot.searchId,
                'X-Docs-Request-Id': requestId,
                'X-Docs-Request-Purpose': 'results',
              }
            : {};
        try {
          const result = await base.search(query);
          if (measurement && snapshot && typeof result === 'object' && result)
            resultSnapshots.current.set(
              result,
              measurement.prepareResults(snapshot, {
                count: result.length,
                unit: 'section',
                requestId,
              }),
            );
          return result;
        } catch (error) {
          if (snapshot && requestId && error && typeof error === 'object')
            errorSnapshots.current.set(error, { search: snapshot, requestId });
          throw error;
        } finally {
          setPendingRequests((count) => count - 1);
        }
      },
    };
  }, [
    algoliaAppId,
    algoliaIndexName,
    algoliaSearchApiKey,
    pages,
    platformFilter,
    searchScope,
    searchLocale,
  ]);
  const searchDeps = useMemo(
    () =>
      remoteSearchEnabled
        ? [
            algoliaAppId,
            algoliaIndexName,
            algoliaSearchApiKey,
            searchLocale,
            platformFilter,
            searchScope,
          ]
        : [pages, searchLocale],
    [
      algoliaAppId,
      algoliaIndexName,
      algoliaSearchApiKey,
      pages,
      platformFilter,
      remoteSearchEnabled,
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
      delayMs: remoteSearchEnabled ? SEARCH_DEBOUNCE_MS : 0,
    },
    searchDeps,
  );
  const normalizedSearchResults =
    !searchResults || searchResults === 'empty' ? [] : searchResults;
  const hasQuery = search.trim() !== '';
  const showActiveDetail = searchLocale !== 'zh-CN' || hasQuery;
  const isSearchUnavailable = searchIndexFailed || Boolean(searchError);
  // fumadocs only flips `isLoading` once the debounced query fires (delayMs).
  // During that pre-fetch window `isLoading` is false and `results` still holds
  // the previous/initial value, which briefly flashes the empty state after a
  // keystroke. Treat the debounce window as busy so the skeleton bridges the gap.
  const [debouncePending, setDebouncePending] = useState(false);
  // The remote config objects are recreated on render, so depend on a stable
  // boolean to avoid re-running this effect (and re-arming the timer) endlessly.
  const remoteSearchConfigured = remoteSearchEnabled;
  const debounceRequest = useMemo(
    () => ({ query: search, platform: platformFilter, scope: scopeId }),
    [search, platformFilter, scopeId],
  );
  useEffect(() => {
    if (!remoteSearchConfigured || debounceRequest.query.trim() === '') {
      setDebouncePending(false);
      return;
    }
    setDebouncePending(true);
    const id = window.setTimeout(
      () => setDebouncePending(false),
      SEARCH_DEBOUNCE_MS + 30,
    );
    return () => window.clearTimeout(id);
  }, [remoteSearchConfigured, debounceRequest]);
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
  const visibleSnapshot =
    searchResults && typeof searchResults === 'object'
      ? resultSnapshots.current.get(searchResults)
      : undefined;
  useEffect(() => {
    if (!open || !resultsContainer.current || !hasQuery) return;
    return observeVisible(resultsContainer.current, () => {
      const measurement = getDocsMeasurement();
      if (searchError && typeof searchError === 'object') {
        const failure = errorSnapshots.current.get(searchError);
        if (failure) measurement?.fail(failure.search, failure.requestId);
      } else if (visibleSnapshot) measurement?.presentResults(visibleSnapshot);
    });
  }, [open, hasQuery, visibleSnapshot, searchError]);
  const platformOptions = useMemo(
    () =>
      isCn
        ? getCnSearchPlatforms(catalog?.platform, platformFilter)
        : (Object.keys(platformRegistry) as PlatformKey[]).filter((platform) =>
            [
              'web',
              'android',
              'ios',
              'javascript',
              'flutter',
              'react-native',
              'windows',
              'harmonyos',
              'macos',
              'electron',
              'unity',
            ].includes(platform),
          ),
    [isCn, catalog, platformFilter],
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
      isOpenRef.current = nextOpen;
      setOpen(nextOpen);
      // Re-arm the cascade each time the dialog opens; clear it on close.
      setStaggerArmed(nextOpen);

      if (nextOpen) {
        if (isCn) {
          const saved =
            readCnSearchSession(pathname) ??
            (searchOrigin.current === pathname
              ? currentSearch.current
              : undefined);
          setSearch(saved?.query ?? '');
          setDraftSearch(saved?.query ?? '');
          setPlatformFilter(saved?.platform ?? null);
          setScopeId(saved?.scope ?? null);
          setActiveValue(null);
          manualSelection.current = false;
          searchOrigin.current = pathname;
        }
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

      if (!nextOpen && !isCn) {
        setActiveValue(null);
        // Reset the query on close so reopening lands on the recent list / prompt
        // rather than the previous search's (possibly empty) results.
        setSearch('');
        setDraftSearch('');
        logicalSearch.current = null;
      }

      if (remoteSearchEnabled || !nextOpen || pages.length > 0) {
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
    [
      loadPages,
      pages.length,
      remoteSearchEnabled,
      searchLocale,
      setSearch,
      isCn,
      pathname,
    ],
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
      void handleOpenChange(true);
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
      : normalizedSearchResults.map((result) =>
          searchResultToEntry(result, searchLocale === 'zh-CN', productScopes),
        );
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

  const pageSearch =
    open && searchOrigin.current === pathname
      ? currentSearch.current
      : savedPage?.path === pathname
        ? savedPage.value
        : searchOrigin.current === pathname
          ? currentSearch.current
          : undefined;
  const pageScope = productScopes.find(
    (scope) => scope.id === pageSearch?.scope,
  )?.scope;
  const fullSearchHref = buildSearchPageHref(searchLocale, {
    q: pageSearch?.query ?? '',
    product: searchScopeProduct(pageScope),
    platform: pageSearch?.platform ?? undefined,
  });
  const openFullSearch = () => {
    if (isCn && searchOrigin.current === pathname)
      saveCnSearchSession(pathname, currentSearch.current);
    setOpen(false);
    void navigate({ href: fullSearchHref });
  };

  return (
    <>
      {mode === 'mobile' ? (
        <Button
          aria-label={t('docs.search')}
          className="size-11"
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
      {isCn && mode === 'desktop' ? (
        <Button
          asChild
          className="hidden shrink-0 lg:inline-flex"
          size="sm"
          variant="ghost"
        >
          <Link to={fullSearchHref}>完整搜索</Link>
        </Button>
      ) : null}
      <CommandDialog
        className="docs-search-dialog max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={(nextOpen) => void handleOpenChange(nextOpen)}
        onValueChange={(value) => {
          if (!isCn || manualSelection.current) setActiveValue(value);
        }}
        open={open}
        overlayClassName="docs-search-overlay bg-black/30 backdrop-blur-md"
        shouldFilter={false}
        title={t('docs.search')}
        value={activeValue ?? ''}
      >
        {isCn ? (
          <div className="flex items-center justify-between border-b px-3 py-2 pr-12">
            <span>搜索文档</span>
            <Button onClick={openFullSearch} size="sm" variant="ghost">
              完整搜索
            </Button>
          </div>
        ) : null}
        <CommandInput
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            manualSelection.current = false;
            setActiveValue(null);
            inputAt.current = Date.now();
            setDraftSearch(event.currentTarget.value);
            setSearch(event.currentTarget.value);
          }}
          onValueChange={(value) => {
            if (isCn) {
              manualSelection.current = false;
              setActiveValue(null);
            }
            inputAt.current = Date.now();
            setDraftSearch(value);
            if (!composing.current) setSearch(value);
          }}
          onKeyDownCapture={(event) => {
            selectionMethod.current = 'keyboard';
            if (!isCn) return;
            if (composing.current || event.nativeEvent.isComposing) {
              event.stopPropagation();
              return;
            }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              if (isBusy) {
                event.preventDefault();
                event.stopPropagation();
              } else manualSelection.current = true;
            }
            if (
              event.key === 'Enter' &&
              (!manualSelection.current ||
                isBusy ||
                event.metaKey ||
                event.ctrlKey)
            ) {
              event.preventDefault();
              event.stopPropagation();
              if (draftSearch.trim()) openFullSearch();
            }
          }}
          placeholder={t('docs.searchPlaceholder')}
          value={draftSearch}
        />
        {remoteSearchEnabled ? (
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            {productScopes.length > 0 ? (
              <SearchFilterDropdown
                allLabel={t('docs.searchAllProducts')}
                emptyLabel={t('docs.searchFilterNoResults')}
                groups={productFilterGroups}
                onChange={(value) => {
                  manualSelection.current = false;
                  setActiveValue(null);
                  inputAt.current = Date.now();
                  setScopeId(value);
                }}
                searchPlaceholder={t('docs.searchFilterProducts')}
                value={scopeId}
              />
            ) : null}
            <SearchFilterDropdown
              allLabel={t('docs.searchAllPlatforms')}
              emptyLabel={t('docs.searchFilterNoResults')}
              groups={platformFilterGroups}
              onChange={(next) => {
                manualSelection.current = false;
                setActiveValue(null);
                inputAt.current = Date.now();
                setPlatformFilter(next as PlatformKey | null);
              }}
              searchPlaceholder={t('docs.searchFilterPlatforms')}
              value={platformFilter}
            />
          </div>
        ) : null}
        <CommandList
          ref={resultsContainer}
          className="max-h-[min(620px,70vh)]"
          onKeyDownCapture={() => {
            selectionMethod.current = 'keyboard';
          }}
          onPointerDownCapture={() => {
            selectionMethod.current = 'mouse';
          }}
        >
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
          {hasQuery ? (
            <CommandGroup>
              {isSearchUnavailable ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  {t('docs.searchUnavailable')}
                </div>
              ) : (
                resultEntries.map((page, index) => {
                  const stagger = staggerProps(index);
                  return (
                    <CommandItem
                      className={cn('items-start', stagger.className)}
                      disabled={isCn && isBusy}
                      key={page.id ?? page.url}
                      onSelect={() => {
                        selectDocsResult(visibleSnapshot, {
                          id: page.url,
                          path: page.url,
                          rank: index + 1,
                          kind: 'section',
                          method: selectionMethod.current,
                        });
                        void handleSelect(page.url);
                      }}
                      onMouseDown={(event) => {
                        if (isCn && isBusy) return;
                        if (
                          event.button !== 1 &&
                          !(
                            event.button === 0 &&
                            (event.metaKey || event.ctrlKey)
                          )
                        )
                          return;
                        event.preventDefault();
                        const href = selectDocsResult(
                          visibleSnapshot,
                          {
                            id: page.url,
                            path: page.url,
                            rank: index + 1,
                            kind: 'section',
                            method: event.button === 1 ? 'middle' : 'mouse',
                          },
                          true,
                        );
                        window.open(href, '_blank', 'noopener');
                      }}
                      onClickCapture={(event) => {
                        if (event.metaKey || event.ctrlKey) {
                          event.preventDefault();
                          event.stopPropagation();
                        }
                      }}
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
                })
              )}
            </CommandGroup>
          ) : null}
        </CommandList>
        {searchLocale === 'zh-CN' && hasQuery && !isBusy ? (
          <div className="px-2 pb-2">
            <DocsTaskFeedback surface="search_dialog" />
          </div>
        ) : null}
        {searchLocale === 'zh-CN' ? (
          <div className="border-t p-2">
            <Button
              className="w-full justify-between"
              onClick={openFullSearch}
              variant="ghost"
            >
              查看全部搜索结果
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </div>
        ) : null}
        {/* Active-item detail: floats beside the dialog when there's room,
            otherwise a fixed-height strip in the footer. Either way it's out of
            the height-varying flow, so the dialog doesn't resize on focus change. */}
        <SearchDetailPanel
          activeValue={activeValue}
          description={showActiveDetail ? activeDetail?.primary : undefined}
          open={open}
          renderText={(value) => <HighlightedText value={value} />}
          title={showActiveDetail ? activeDetail?.title : undefined}
        />
        <SearchKeyboardHints
          closeLabel={t('docs.searchHintClose')}
          navigateLabel={t('docs.searchHintNavigate')}
          selectLabel={
            isCn && !manualSelection.current
              ? '完整搜索'
              : t('docs.searchHintSelect')
          }
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

function searchResultToEntry(
  result: {
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
  },
  isCn: boolean,
  productScopes: ProductScope[],
): RenderedSearchEntry {
  const breadcrumbs = getStringArray(result.breadcrumbs);
  const platforms = getStringArray(result.platform);
  const objectType = getString(result.objectType);
  const sdkLabel = isCn ? getCnSearchSdkLabel(result.url) : undefined;

  return {
    context: uniqueStrings([
      objectType === 'openapi' ? 'API' : undefined,
      isCn
        ? getCnProductLabel(getString(result.product), productScopes)
        : undefined,
      ...(sdkLabel ? [sdkLabel] : formatPlatformContext(platforms ?? [])),
      isCn ? getString(result.version) : undefined,
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
