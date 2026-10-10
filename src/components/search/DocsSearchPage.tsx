'use client';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  Clock3Icon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import type { ProductScope } from '@/lib/docs-tree';
import { getPlatformLabel, isKnownPlatform } from '@/lib/platforms/registry';
import { getRecentPages, type RecentPage } from '@/lib/recently-viewed';
import {
  type CnSearchPageResponse,
  type SearchFacets,
  searchCnDocsPage,
} from '@/lib/search/cn-search-page';
import type { SearchPageState } from '@/lib/search/search-page-state';

type SearchStatus = 'loading' | 'loaded' | 'error';
const productNames: Record<string, string> = {
  'conversational-ai': '对话式 AI 引擎',
  'device-kit': '对话式 AI 开发套件',
  rtc: '实时互动 RTC',
  rtm: '实时消息 RTM',
  rtsa: '媒体流加速 RTSA',
  'cloud-recording': '云端录制',
  'local-server-recording': '本地服务端录制',
  console: '控制台',
  whiteboard: '互动白板',
  transcoding: '云端转码',
};
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
  const [facets, setFacets] = useState<SearchFacets>({});
  const [recent, setRecent] = useState<RecentPage[]>([]);
  const [retry, setRetry] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const request = useMemo(() => ({ state, retry }), [state, retry]);
  useEffect(() => setDraft(state.q), [state.q]);
  useEffect(
    () =>
      setRecent(
        getRecentPages()
          .filter((page) => page.url.startsWith('/zh-CN/'))
          .slice(0, 4),
      ),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setData(null);
    searchCnDocsPage(request.state, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setFacets((previous) => {
          const merged = { ...previous };
          for (const [field, values] of Object.entries(result.facets))
            merged[field] = { ...previous[field], ...values };
          return merged;
        });
        setStatus('loaded');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error');
      });
    return () => controller.abort();
  }, [request]);

  const productLabel = (product?: string) =>
    product
      ? (productNames[product] ??
        productScopes.find(
          (scope) =>
            scope.scope.field === 'product' && scope.scope.value === product,
        )?.label ??
        product)
      : '';
  const hasFilters = Boolean(
    state.product || state.platform || state.version || state.type !== 'all',
  );
  const filterCount = [
    state.product,
    state.platform,
    state.version,
    state.type !== 'all',
  ].filter(Boolean).length;
  const platforms = useMemo(
    () => Object.keys(facets.platform ?? {}).filter(isKnownPlatform),
    [facets.platform],
  );
  const products = [
    ...new Set([
      ...Object.keys(facets.product ?? {}),
      ...(state.product ? [state.product] : []),
    ]),
  ];
  const versions = [
    ...new Set([
      ...Object.keys(facets.version ?? {}),
      ...(state.version ? [state.version] : []),
    ]),
  ];

  const filterControls = (
    <>
      <div className="search-page-filter-label">
        <span>产品</span>
        <NativeSelect
          aria-label="产品"
          onChange={(event) =>
            onChange({
              product: event.target.value || undefined,
              version: undefined,
            })
          }
          value={state.product ?? ''}
        >
          <NativeSelectOption value="">全部产品</NativeSelectOption>
          {products.map((product) => (
            <NativeSelectOption key={product} value={product}>
              {productLabel(product)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="search-page-filter-label">
        <span>平台</span>
        <NativeSelect
          aria-label="平台"
          onChange={(event) =>
            onChange({ platform: event.target.value || undefined })
          }
          value={state.platform ?? ''}
        >
          <NativeSelectOption value="">全部平台</NativeSelectOption>
          {[
            ...new Set([
              ...platforms,
              ...(state.platform ? [state.platform] : []),
            ]),
          ].map((platform) => (
            <NativeSelectOption key={platform} value={platform}>
              {isKnownPlatform(platform)
                ? getPlatformLabel(platform, 'zh-CN')
                : platform}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {versions.length > 0 && (
        <div className="search-page-filter-label">
          <span>版本</span>
          <NativeSelect
            aria-label="版本"
            onChange={(event) =>
              onChange({ version: event.target.value || undefined })
            }
            value={state.version ?? ''}
          >
            <NativeSelectOption value="">全部版本</NativeSelectOption>
            {versions.map((version) => (
              <NativeSelectOption key={version} value={version}>
                {version}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      )}
    </>
  );

  function submitQuery(query: string) {
    if (query.trim() === state.q) setRetry((value) => value + 1);
    onChange({ q: query.trim(), page: 1 });
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
            <Sheet onOpenChange={setFilterOpen} open={filterOpen}>
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
                    选择适用的产品、平台和版本。
                  </SheetDescription>
                </SheetHeader>
                <div className="search-page-sheet-filters">
                  {filterControls}
                </div>
                <div className="flex gap-2 p-4">
                  <Button
                    onClick={() => {
                      onChange({
                        product: undefined,
                        platform: undefined,
                        version: undefined,
                        type: 'all',
                      });
                      setFilterOpen(false);
                    }}
                    variant="outline"
                  >
                    清除筛选
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>查看结果</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {state.q && (
            <p aria-live="polite" className="search-page-result-count">
              {status === 'loading'
                ? '正在搜索…'
                : status === 'loaded' && data
                  ? `${data.totalHits} 个章节匹配`
                  : ''}
            </p>
          )}
        </div>
        {hasFilters && (
          <fieldset
            aria-label="已选筛选条件"
            className="search-page-selected-filters"
          >
            {(['product', 'platform', 'version'] as const).map(
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
                        ? getPlatformLabel(state.platform, 'zh-CN')
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
          aria-label="搜索结果"
          aria-busy={status === 'loading'}
          className="search-page-results-section"
        >
          {status === 'loading' && (
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
          {status === 'error' && (
            <SearchEmpty error onRetry={() => setRetry((value) => value + 1)} />
          )}
          {status === 'loaded' &&
            data &&
            (data.groups.length ? (
              <>
                <SearchResultList
                  groups={data.groups}
                  productLabel={productLabel}
                />
                <SearchPagination
                  onChange={(page) => onChange({ page })}
                  page={state.page}
                  totalPages={data.totalPages}
                />
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

function SearchPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="搜索结果分页" className="search-page-pagination">
      <Button
        aria-label="上一页"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        variant="outline"
      >
        <ArrowLeftIcon data-icon="inline-start" />
        <span className="hidden sm:inline">上一页</span>
      </Button>
      <span aria-live="polite">
        第 {page} / {totalPages} 页
      </span>
      <Button
        aria-label="下一页"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        variant="outline"
      >
        <span className="hidden sm:inline">下一页</span>
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </nav>
  );
}
