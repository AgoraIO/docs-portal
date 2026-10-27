'use client';

import {
  ArrowUpRightIcon,
  Clock3Icon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DocsTaskFeedback } from '@/components/docs-shell/DocsTaskFeedback';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultList } from '@/components/search/SearchResultList';
import { SearchTypeTabs } from '@/components/search/SearchTypeTabs';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  ResultsSnapshot,
  SearchSnapshot,
} from '@/lib/analytics/docs-measurement';
import {
  getDocsMeasurement,
  selectDocsResult,
} from '@/lib/analytics/measurement';
import { observeVisible } from '@/lib/analytics/visibility';
import type { ProductScope } from '@/lib/docs-tree';
import { isKnownPlatform } from '@/lib/platforms/registry';
import { getRecentPages, type RecentPage } from '@/lib/recently-viewed';
import {
  getCnProductLabel,
  getCnSearchProductGroups,
} from '@/lib/search/cn-product-labels';
import {
  getCnSearchPlatformLabel,
  getCnSearchPlatforms,
} from '@/lib/search/cn-search-context';
import {
  cnSearchFamilies,
  getCnSearchFamily,
} from '@/lib/search/cn-search-family';
import {
  type CnSearchPageResponse,
  isPublicCnSearchUrl,
  loadCnSearchCatalog,
  mergeSearchPageGroups,
  type SearchFacets,
  type SearchPageGroup,
  searchCnDocsPage,
} from '@/lib/search/cn-search-page';
import type { SearchPageState } from '@/lib/search/search-page-state';

type SearchStatus = 'loading' | 'loaded' | 'error';
const examples = ['Token', 'manualSOS', '云端录制', '降噪'];

export function DocsSearchPage({
  state,
  onChange,
  productScopes = [],
}: {
  state: SearchPageState;
  onChange: (patch: Partial<SearchPageState>) => void;
  productScopes?: ProductScope[];
}) {
  const [draft, setDraft] = useState(state.q);
  const [status, setStatus] = useState<SearchStatus>('loading');
  const [data, setData] = useState<CnSearchPageResponse | null>(null);
  const [catalog, setCatalog] = useState<SearchFacets>({});
  const [recent, setRecent] = useState<RecentPage[]>([]);
  const [retry, setRetry] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState(state);
  useEffect(() => {
    const controller = new AbortController();
    loadCnSearchCatalog(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCatalog(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const logicalSearch = useRef<{
    key: string;
    snapshot: SearchSnapshot;
  } | null>(null);
  const resultSnapshots = useRef(
    new WeakMap<CnSearchPageResponse, ResultsSnapshot>(),
  );
  const resultsContainer = useRef<HTMLElement>(null);
  const failure = useRef<
    { search: SearchSnapshot; requestId?: string } | undefined
  >(undefined);
  useEffect(() => {
    getDocsMeasurement()?.leaveContent();
  }, []);
  useEffect(() => {
    const snapshot = data ? resultSnapshots.current.get(data) : undefined;
    if (!resultsContainer.current) return;
    return observeVisible(resultsContainer.current, () => {
      if (status === 'loaded' && snapshot)
        getDocsMeasurement()?.presentResults(snapshot);
      if (status === 'error' && failure.current)
        getDocsMeasurement()?.fail(
          failure.current.search,
          failure.current.requestId,
        );
    });
  }, [data, status]);
  const stateKey = JSON.stringify(state);
  const [progress, setProgress] = useState({ key: stateKey, page: state.page });
  if (progress.key !== stateKey) {
    setProgress({ key: stateKey, page: state.page });
  }
  const currentPage = progress.key === stateKey ? progress.page : state.page;
  const loadedPages = useRef<{
    key: string;
    pages: Map<number, CnSearchPageResponse>;
  }>({ key: '', pages: new Map() });
  const request = useMemo(
    () => ({ state: { ...state, page: currentPage }, retry }),
    [state, currentPage, retry],
  );
  useEffect(() => setDraft(state.q), [state.q]);
  useEffect(
    () =>
      setRecent(
        getRecentPages()
          .filter((page) => isPublicCnSearchUrl(page.url))
          .slice(0, 4),
      ),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    const { page: _page, ...criteria } = request.state;
    const key = JSON.stringify(criteria);
    if (loadedPages.current.key !== key) {
      loadedPages.current = { key, pages: new Map() };
      setData(null);
    }
    const measurement = request.state.q ? getDocsMeasurement() : undefined;
    if (
      measurement &&
      (logicalSearch.current?.key !== key ||
        !measurement.searchIsCurrent(logicalSearch.current.snapshot))
    )
      logicalSearch.current = {
        key,
        snapshot: measurement.startSearch({
          surface: 'search_page',
          query: request.state.q,
          filters: {
            product: request.state.product,
            platform: request.state.platform,
            version: request.state.version,
            type: request.state.type,
          },
        }),
      };
    const snapshot = measurement ? logicalSearch.current?.snapshot : undefined;
    const requestId = snapshot ? crypto.randomUUID() : undefined;
    const requestStarted = Date.now();
    const headers = (purpose: string) =>
      snapshot
        ? {
            'X-Docs-Search-Id': snapshot.searchId,
            'X-Docs-Request-Id':
              purpose === 'results' ? (requestId ?? '') : crypto.randomUUID(),
            'X-Docs-Request-Purpose': purpose,
          }
        : undefined;
    setStatus('loading');
    searchCnDocsPage(request.state, controller.signal, headers('results'))
      .then((result) => {
        if (controller.signal.aborted) return;
        loadedPages.current.pages.set(request.state.page, result);
        const pages = [...loadedPages.current.pages.entries()]
          .filter(([page]) => page <= request.state.page)
          .sort(([a], [b]) => a - b);
        const accepted = {
          ...result,
          groups: mergeSearchPageGroups(
            pages.map(([, response]) => response.groups),
          ),
        };
        if (snapshot && measurement)
          resultSnapshots.current.set(
            accepted,
            measurement.prepareResults(snapshot, {
              count: accepted.groups.length,
              unit: 'document',
              page: request.state.page,
              totalHits: result.totalHits,
              requestId,
              started: request.state.page > 1 ? requestStarted : undefined,
            }),
          );
        setData(accepted);
        setStatus('loaded');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
          if (snapshot) failure.current = { search: snapshot, requestId };
        }
      });
    return () => controller.abort();
  }, [request]);

  const productLabel = (product?: string) =>
    getCnProductLabel(product, productScopes);
  const hasFilters = Boolean(
    state.product || state.platform || state.type !== 'all',
  );
  const filterCount = [
    state.product,
    state.platform,
    state.type !== 'all',
  ].filter(Boolean).length;
  const controlsState = filterOpen ? filterDraft : state;
  const changeFilters = (patch: Partial<SearchPageState>) => {
    if (filterOpen) setFilterDraft((previous) => ({ ...previous, ...patch }));
    else onChange(patch);
  };
  const platforms = getCnSearchPlatforms(
    catalog.platform,
    controlsState.platform,
  );
  const productGroups = getCnSearchProductGroups();

  const filterControls = (
    <>
      <div className="search-page-filter-label">
        <span>产品</span>
        <NativeSelect
          aria-label="产品"
          onChange={(event) =>
            changeFilters({
              product: event.target.value || undefined,
              version: undefined,
            })
          }
          value={controlsState.product ?? ''}
        >
          <NativeSelectOption value="">全部产品</NativeSelectOption>
          {productGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map(({ value, label }) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
      </div>
      <div className="search-page-filter-label">
        <span>平台</span>
        <NativeSelect
          aria-label="平台"
          onChange={(event) =>
            changeFilters({
              platform: event.target.value || undefined,
              version: undefined,
            })
          }
          value={controlsState.platform ?? ''}
        >
          <NativeSelectOption value="">全部平台</NativeSelectOption>
          {[
            ...new Set([
              ...platforms,
              ...(controlsState.platform ? [controlsState.platform] : []),
            ]),
          ].map((platform) => (
            <NativeSelectOption key={platform} value={platform}>
              {getCnSearchPlatformLabel(platform)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </>
  );

  function submitQuery(query: string) {
    if (query.trim() === state.q) setRetry((value) => value + 1);
    onChange({ q: query.trim(), page: 1 });
  }

  function renderResults(groups: SearchPageGroup[], rankOffset = 0) {
    if (!data) return null;
    return (
      <SearchResultList
        groups={groups}
        rankOffset={rankOffset}
        productLabel={productLabel}
        onSelectResult={(event, path, rank, sectionRank) => {
          if (event.type === 'auxclick' && event.button !== 1) return;
          const newTab =
            event.button === 1 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey;
          const href = selectDocsResult(
            resultSnapshots.current.get(data),
            {
              id: path,
              path,
              rank,
              kind: sectionRank ? 'section' : 'document',
              sectionRank,
              method:
                event.button === 1
                  ? 'middle'
                  : event.detail === 0
                    ? 'keyboard'
                    : 'mouse',
            },
            newTab,
          );
          event.currentTarget.href = href;
        }}
      />
    );
  }

  return (
    <main className="search-page" id="search-page-main">
      <section aria-label="搜索与筛选" className="search-page-controls">
        <div className="search-page-search-bar">
          <h1>搜索文档</h1>
          <SearchInput
            onChange={setDraft}
            onClear={() => {
              setDraft('');
              onChange({ q: '', page: 1 });
            }}
            onSubmit={() => submitQuery(draft)}
            value={draft}
          />
        </div>
        <div className="search-page-filter-bar">
          <SearchTypeTabs
            onChange={(type) => onChange({ type })}
            value={state.type}
          />
          <div className="search-page-desktop-filters">
            {filterControls}
            {hasFilters && (
              <Button
                onClick={() =>
                  onChange({
                    product: undefined,
                    platform: undefined,
                    version: undefined,
                    type: 'all',
                  })
                }
                size="sm"
                variant="ghost"
              >
                清除筛选
              </Button>
            )}
          </div>
          <div className="search-page-mobile-filters">
            <Sheet
              onOpenChange={(nextOpen) => {
                if (nextOpen) setFilterDraft(state);
                setFilterOpen(nextOpen);
              }}
              open={filterOpen}
            >
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost">
                  <SlidersHorizontalIcon data-icon="inline-start" />
                  筛选{filterCount ? ` (${filterCount})` : ''}
                </Button>
              </SheetTrigger>
              <SheetContent closeLabel="关闭筛选" side="bottom">
                <SheetHeader>
                  <SheetTitle>筛选文档</SheetTitle>
                  <SheetDescription>
                    调整产品和平台后，点击“查看结果”应用筛选。
                  </SheetDescription>
                </SheetHeader>
                <div className="search-page-sheet-filters">
                  {filterControls}
                </div>
                <div className="flex gap-2 p-4">
                  <Button
                    onClick={() => {
                      setFilterDraft({
                        ...state,
                        product: undefined,
                        platform: undefined,
                        version: undefined,
                        type: 'all',
                      });
                    }}
                    variant="outline"
                  >
                    清除筛选
                  </Button>
                  <Button
                    onClick={() => {
                      onChange({
                        product: filterDraft.product,
                        platform: filterDraft.platform,
                        version: filterDraft.version,
                        type: filterDraft.type,
                        page: 1,
                      });
                      setFilterOpen(false);
                    }}
                  >
                    查看结果
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {state.q && status === 'loading' && (
            <p aria-live="polite" className="search-page-result-count">
              正在搜索…
            </p>
          )}
        </div>
        {hasFilters && (
          <fieldset
            aria-label="已选筛选条件"
            className="search-page-selected-filters"
          >
            {(['product', 'platform'] as const).map(
              (field) =>
                state[field] && (
                  <Button
                    key={field}
                    onClick={() =>
                      onChange({
                        [field]: undefined,
                        ...(field === 'product' ? { version: undefined } : {}),
                      })
                    }
                    size="sm"
                    variant="secondary"
                  >
                    {field === 'product'
                      ? productLabel(state.product)
                      : field === 'platform' &&
                          state.platform &&
                          isKnownPlatform(state.platform)
                        ? getCnSearchPlatformLabel(state.platform)
                        : state[field]}
                    <XIcon data-icon="inline-end" />
                  </Button>
                ),
            )}
            <Button
              onClick={() =>
                onChange({
                  product: undefined,
                  platform: undefined,
                  version: undefined,
                  type: 'all',
                })
              }
              size="sm"
              variant="ghost"
            >
              清除筛选
            </Button>
          </fieldset>
        )}
      </section>
      {state.q ? (
        <section
          ref={resultsContainer}
          aria-label="搜索结果"
          aria-busy={status === 'loading'}
          className="search-page-results-section"
        >
          {status === 'loading' && !data && (
            <div
              aria-label="正在加载搜索结果"
              role="status"
              className="flex flex-col gap-6 py-4"
            >
              {[0, 1, 2].map((item) => (
                <div className="flex flex-col gap-3" key={item}>
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          )}
          {status === 'error' && !data && (
            <SearchEmpty error onRetry={() => setRetry((value) => value + 1)} />
          )}
          {data &&
            (data.groups.length ? (
              <>
                {state.type === 'all'
                  ? cnSearchFamilies.map((family, familyIndex) => {
                      const groups = data.groups.filter(
                        (group) => getCnSearchFamily(group) === family,
                      );
                      if (!groups.length) return null;
                      const label =
                        family === 'docs'
                          ? '产品文档'
                          : family === 'api'
                            ? 'API 文档'
                            : 'FAQ';
                      return (
                        <section aria-label={label} key={family}>
                          <div className="flex items-center justify-between border-b py-2">
                            <h2 className="text-sm font-semibold">{label}</h2>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                onChange({ type: family, page: 1 })
                              }
                            >
                              查看全部{label}
                            </Button>
                          </div>
                          {renderResults(
                            groups,
                            data.groups.filter((group) =>
                              cnSearchFamilies
                                .slice(0, familyIndex)
                                .includes(getCnSearchFamily(group)),
                            ).length,
                          )}
                        </section>
                      );
                    })
                  : renderResults(data.groups)}
                <div className="search-page-pagination">
                  <span aria-live="polite">
                    已展示 {data.groups.length} 篇文档
                  </span>
                  {status === 'error' ? (
                    <Button
                      onClick={() => setRetry((value) => value + 1)}
                      variant="outline"
                    >
                      加载失败，重试
                    </Button>
                  ) : (
                    currentPage < data.totalPages && (
                      <Button
                        disabled={status === 'loading'}
                        onClick={() =>
                          setProgress({ key: stateKey, page: currentPage + 1 })
                        }
                        variant="outline"
                      >
                        {status === 'loading' ? '正在加载…' : '加载更多'}
                      </Button>
                    )
                  )}
                </div>
              </>
            ) : (
              <SearchEmpty
                onClear={
                  hasFilters
                    ? () =>
                        onChange({
                          product: undefined,
                          platform: undefined,
                          version: undefined,
                          type: 'all',
                        })
                    : undefined
                }
              />
            ))}
          {status !== 'loading' ? (
            <DocsTaskFeedback surface="search_page" />
          ) : null}
        </section>
      ) : (
        <section aria-label="开始搜索" className="search-page-start">
          <h2>从一个关键词开始</h2>
          <p>输入功能名称、API 方法或错误码，也可以试试：</p>
          <div className="search-page-examples">
            {examples.map((example) => (
              <Button
                key={example}
                onClick={() => {
                  setDraft(example);
                  submitQuery(example);
                }}
                variant="outline"
              >
                {example}
                <ArrowUpRightIcon data-icon="inline-end" />
              </Button>
            ))}
          </div>
          {status === 'error' && (
            <div className="search-page-service-error" role="status">
              搜索暂时不可用，请稍后重试。
              <Button
                onClick={() => setRetry((value) => value + 1)}
                size="sm"
                variant="link"
              >
                重试
              </Button>
            </div>
          )}
          {recent.length > 0 && (
            <div className="search-page-recent">
              <h2>
                <Clock3Icon aria-hidden="true" className="size-4" />
                最近浏览
              </h2>
              <ul>
                {recent.map((page) => (
                  <li key={page.url}>
                    <a href={page.url}>
                      {page.title}
                      <ArrowUpRightIcon aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function SearchEmpty({
  error,
  onRetry,
  onClear,
}: {
  error?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
}) {
  return (
    <Empty className="search-page-empty" role={error ? 'alert' : 'status'}>
      <EmptyHeader>
        <EmptyMedia>
          <SearchIcon
            aria-hidden="true"
            className="size-7 text-muted-foreground"
          />
        </EmptyMedia>
        <EmptyTitle>
          <h2>{error ? '搜索暂时不可用' : '没有找到匹配的文档'}</h2>
        </EmptyTitle>
        <EmptyDescription>
          {error
            ? '请重试，或返回文档首页继续浏览。'
            : '试试更短的关键词、完整的 API 名称，或减少筛选条件。'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        {error ? (
          <>
            <Button onClick={onRetry} variant="outline">
              重新搜索
            </Button>
            <Button asChild variant="ghost">
              <a href="/zh-CN/introduction">浏览文档</a>
            </Button>
          </>
        ) : (
          onClear && (
            <Button onClick={onClear} variant="outline">
              清除筛选
            </Button>
          )
        )}
      </EmptyContent>
    </Empty>
  );
}
