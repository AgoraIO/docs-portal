import { Link } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  Edit3Icon,
  ExternalLinkIcon,
} from 'lucide-react';
import {
  type MouseEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import {
  findDocsHeadingForHash,
  getActiveDocsScrollContainer,
  scrollDocsHashTarget,
  syncDocsHashTargetFromLocation,
} from '@/lib/docs-hash';
import type { DocsLayoutMode } from '@/lib/docs-layout';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsBreadcrumbItem } from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import type { PlatformKey } from '@/lib/platforms/registry';
import {
  PlatformHeaderTabs,
  PlatformPanel,
  PlatformTabsGroup,
  PlatformTabsPlacementProvider,
} from '../mdx/PlatformTabsGroup';
import { FumadocsOpenApiContent } from '../openapi/FumadocsOpenApiContent';
import { DocsContentBody } from './DocsContentBody';
import { DocsCopyMenu } from './docs-copy-menu';

const DOCS_ARTICLE_RETURN_STORAGE_KEY = 'docs-portal:article-return:v1';
const TOC_ACTIVE_OFFSET = 96;
const TOC_VISIBLE_INTERSECTION_THRESHOLD = 4;
const ARTICLE_RETURN_MAX_AGE_MS = 30 * 60 * 1000;

type DocsArticleReturnRecord = {
  createdAt: number;
  source: {
    href: string;
    title: string;
  };
  targetPage: string;
};

type DocsArticleReturnLink = {
  href: string;
  title: string;
};

export function DocsContent({
  body,
  breadcrumb = [],
  contentPath,
  description,
  locale = DEFAULT_LOCALE,
  markdownUrl,
  layoutMode = 'docs',
  hideToc = false,
  sidebarHeader,
  slug,
  title,
  toc,
}: {
  body?: DocsContentBodyPayload;
  breadcrumb?: DocsBreadcrumbItem[];
  contentPath?: string;
  description?: string;
  locale?: AppLocale | string;
  layoutMode?: DocsLayoutMode;
  hideToc?: boolean;
  markdownUrl?: string;
  sidebarHeader?: DocsSidebarHeader;
  slug?: string;
  title?: string;
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(currentLocale, 'common');
  const displayTitle = title ?? slug;
  const sourceTitle = displayTitle ?? t('app.name');
  const currentPageKey = getCurrentDocsPageKey();
  const articleReturnLink = useDocsArticleReturnLink(currentPageKey);
  const handleArticleBodyLinkClick = useTrackDocsArticleLinkNavigation({
    sourceTitle,
  });
  // A single crumb that just repeats the page title (the H1 right below) adds no
  // wayfinding — suppress it. Multi-item breadcrumbs always render.
  const showBreadcrumb =
    breadcrumb.length > 1 ||
    (breadcrumb.length === 1 && breadcrumb[0].title !== displayTitle);
  const resolvedBody =
    body ??
    (contentPath
      ? ({
          contentPath,
          kind: 'mdx',
        } satisfies DocsContentBodyPayload)
      : undefined);
  const isOpenApiBody = resolvedBody?.kind === 'openapi';
  const effectiveLayoutMode = isOpenApiBody ? 'openapi' : layoutMode;
  const isOpenApiLayout = effectiveLayoutMode === 'openapi';
  // openapi and hideToc both let the article fill the width and hide the toc.
  const contentFillsWidth = isOpenApiLayout || hideToc;
  const platformTabs =
    resolvedBody?.kind === 'mdx' || resolvedBody?.kind === 'platform-group'
      ? resolvedBody.platformTabs
      : undefined;
  const hidePlatformTabs =
    resolvedBody?.kind === 'mdx' ? resolvedBody.hidePlatformTabs === true : false;
  const isMdxBody =
    resolvedBody?.kind === 'mdx' || resolvedBody?.kind === 'platform-group';

  useEffect(() => {
    if (!isMdxBody) {
      return;
    }

    const handleHashChange = () => {
      syncDocsHashTargetFromLocation('auto');
    };

    const frame = window.requestAnimationFrame(handleHashChange);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isMdxBody]);

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col',
        'gap-6',
        contentFillsWidth ? 'max-w-none' : 'max-w-[var(--content-max)]',
      )}
    >
      <header
        className={cn(
          'flex flex-col gap-4 border-b border-[color:var(--line-soft)]',
          platformTabs ? 'pb-0' : 'pb-5',
        )}
      >
        {articleReturnLink ? (
          <a
            className="inline-flex min-w-0 w-fit items-center gap-1.5 rounded-md text-[13px] leading-5 font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink-1)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            href={articleReturnLink.href}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">
              {t('docs.returnToSource', { title: articleReturnLink.title })}
            </span>
          </a>
        ) : null}
        {showBreadcrumb ? (
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 text-[color:var(--ink-4)]">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                  <li
                    className="flex min-w-0 items-center gap-2"
                    key={item.url ?? item.title}
                  >
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="text-[color:var(--line-strong)]"
                      >
                        /
                      </span>
                    ) : null}
                    {item.url && !isLast ? (
                      <a
                        className="truncate transition-colors hover:text-[color:var(--ink-1)]"
                        href={item.url}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={cn(
                          'truncate',
                          isLast && 'text-[color:var(--ink-2)]',
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <div
          className={cn(
            'flex flex-col gap-3',
            markdownUrl && 'xl:flex-row xl:items-start xl:gap-6',
          )}
        >
          <div className="min-w-0 flex-1">
            <h1 className="max-w-4xl text-[2rem] leading-[1.12] font-bold tracking-[-0.022em] text-[color:var(--ink-1)] sm:text-[2.375rem]">
              {displayTitle}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-[17.5px] leading-[1.55] text-[color:var(--ink-3)]">
                {description}
              </p>
            ) : null}
          </div>
          {markdownUrl ? (
            <DocsCopyMenu
              className="self-start xl:ml-auto xl:shrink-0 xl:translate-y-1"
              locale={currentLocale}
              markdownUrl={markdownUrl}
              slug={slug ?? ''}
              title={displayTitle ?? ''}
            />
          ) : null}
        </div>
        {sidebarHeader?.versionSwitcher?.presentation === 'tabs' ? (
          <DocsHeaderScopeTabs header={sidebarHeader} />
        ) : null}
        {platformTabs && !hidePlatformTabs ? (
          <PlatformHeaderTabs
            canonicalPlatform={platformTabs.canonicalPlatform}
            className="pt-1"
            initialPlatform={platformTabs.initialPlatform}
            locale={currentLocale}
            platforms={platformTabs.platforms}
          />
        ) : null}
      </header>
      {isOpenApiBody ? (
        <div onClickCapture={handleArticleBodyLinkClick}>
          <FumadocsOpenApiContent pageProps={resolvedBody.pageProps} />
        </div>
      ) : (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          data-platform-header-tabs={platformTabs ? 'true' : undefined}
          onClickCapture={handleArticleBodyLinkClick}
        >
          {resolvedBody?.kind === 'mdx' ? (
            <Suspense fallback={<DocsContentSkeleton />}>
              <PlatformTabsPlacementProvider
                initialPlatform={platformTabs?.initialPlatform}
                value={platformTabs || hidePlatformTabs ? 'header' : 'inline'}
              >
                <DocsContentBody contentPath={resolvedBody.contentPath} />
              </PlatformTabsPlacementProvider>
            </Suspense>
          ) : null}
          {resolvedBody?.kind === 'platform-group' ? (
            <div className="flex flex-col gap-8">
              <Suspense fallback={<DocsContentSkeleton />}>
                <DocsContentBody contentPath={resolvedBody.contentPath} />
              </Suspense>
              <PlatformTabsPlacementProvider
                initialPlatform={platformTabs?.initialPlatform}
                value="header"
              >
                <PlatformTabsGroup
                  canonicalPlatform={resolvedBody.canonicalPlatform}
                  groupMode="structured"
                  initialPlatform={platformTabs?.initialPlatform}
                  locale={currentLocale}
                  platforms={JSON.stringify(resolvedBody.platforms)}
                  showTabs="false"
                >
                  {resolvedBody.panels.map((panel) => (
                    <PlatformPanel
                      key={panel.platform}
                      platform={panel.platform}
                    >
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <Suspense fallback={<DocsContentSkeleton />}>
                          <DocsContentBody contentPath={panel.contentPath} />
                        </Suspense>
                      </div>
                    </PlatformPanel>
                  ))}
                </PlatformTabsGroup>
              </PlatformTabsPlacementProvider>
            </div>
          ) : null}
        </div>
      )}
      {contentFillsWidth ? null : (
        <DocsTableOfContents
          className="xl:hidden"
          locale={currentLocale}
          toc={toc}
          variant="mobile"
        />
      )}
    </article>
  );
}

function useDocsArticleReturnLink(currentPageKey: string | null) {
  const [returnLink, setReturnLink] = useState<DocsArticleReturnLink | null>(
    null,
  );

  useEffect(() => {
    setReturnLink(readDocsArticleReturnLink(currentPageKey));
  }, [currentPageKey]);

  return returnLink;
}

function useTrackDocsArticleLinkNavigation({
  sourceTitle,
}: {
  sourceTitle: string;
}) {
  return useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href]');

      if (!anchor || !event.currentTarget.contains(anchor)) {
        return;
      }

      trackDocsArticleLinkNavigation(anchor, sourceTitle);
    },
    [sourceTitle],
  );
}

function trackDocsArticleLinkNavigation(
  anchor: HTMLAnchorElement,
  sourceTitle: string,
) {
  if (
    anchor.hasAttribute('download') ||
    (anchor.target && anchor.target !== '_self')
  ) {
    return;
  }

  const targetUrl = getSameOriginUrl(anchor.href);
  const sourceUrl = getCurrentUrl();

  if (!targetUrl || !sourceUrl) {
    return;
  }

  const targetPage = getDocsPageKey(targetUrl);
  const sourcePage = getDocsPageKey(sourceUrl);

  if (!targetPage || !sourcePage || targetPage === sourcePage) {
    return;
  }

  const record: DocsArticleReturnRecord = {
    createdAt: Date.now(),
    source: {
      href: getPathHref(sourceUrl),
      title: sourceTitle.trim() || getPathHref(sourceUrl),
    },
    targetPage,
  };

  writeArticleReturnRecord(record);
}

function readDocsArticleReturnLink(
  currentPage: string | null,
): DocsArticleReturnLink | null {
  const record = readArticleReturnRecord();

  if (!record || !currentPage) {
    return null;
  }

  if (
    Date.now() - record.createdAt > ARTICLE_RETURN_MAX_AGE_MS ||
    record.targetPage !== currentPage
  ) {
    removeArticleReturnRecord();
    return null;
  }

  const safeSourceHref = getSafeStoredDocsHref(record.source.href);

  if (!safeSourceHref) {
    removeArticleReturnRecord();
    return null;
  }

  // Keep the matched record in sessionStorage so the duplicated mobile and
  // desktop DocsContent renders can both read it. The record is scoped to one
  // target page and expires, so it is cleared on stale or mismatched routes.
  return {
    href: safeSourceHref,
    title: record.source.title,
  };
}

function readArticleReturnRecord(): DocsArticleReturnRecord | null {
  const storage = getSessionStorage();
  const value = storage?.getItem(DOCS_ARTICLE_RETURN_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const record = JSON.parse(value) as Partial<DocsArticleReturnRecord>;

    if (
      typeof record.createdAt !== 'number' ||
      typeof record.targetPage !== 'string' ||
      typeof record.source?.href !== 'string' ||
      typeof record.source.title !== 'string'
    ) {
      removeArticleReturnRecord();
      return null;
    }

    return {
      createdAt: record.createdAt,
      source: {
        href: record.source.href,
        title: record.source.title,
      },
      targetPage: record.targetPage,
    };
  } catch {
    removeArticleReturnRecord();
    return null;
  }
}

function writeArticleReturnRecord(record: DocsArticleReturnRecord) {
  try {
    getSessionStorage()?.setItem(
      DOCS_ARTICLE_RETURN_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function removeArticleReturnRecord() {
  try {
    getSessionStorage()?.removeItem(DOCS_ARTICLE_RETURN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getCurrentUrl() {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URL(window.location.href);
}

function getCurrentDocsPageKey() {
  const currentUrl = getCurrentUrl();

  return currentUrl ? getDocsPageKey(currentUrl) : null;
}

function getSameOriginUrl(href: string) {
  const currentUrl = getCurrentUrl();

  if (!currentUrl) {
    return null;
  }

  try {
    const url = new URL(href, currentUrl);
    return url.origin === currentUrl.origin ? url : null;
  } catch {
    return null;
  }
}

function getSafeStoredDocsHref(href: string) {
  const url = getSameOriginUrl(href);

  if (!url || !getDocsPageKey(url)) {
    return null;
  }

  return getPathHref(url);
}

function getDocsPageKey(url: URL) {
  const pathname = normalizePathname(url.pathname);

  if (!isDocsPagePath(pathname)) {
    return null;
  }

  return `${pathname}${url.search}`;
}

function isDocsPagePath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];

  return Boolean(
    locale && segments.length >= 2 && normalizeLocale(locale) === locale,
  );
}

function getPathHref(url: URL) {
  return `${normalizePathname(url.pathname)}${url.search}${url.hash}`;
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');

  return normalized || '/';
}

function DocsHeaderScopeTabs({ header }: { header: DocsSidebarHeader }) {
  const versionSwitcher = header.versionSwitcher;

  if (!versionSwitcher) {
    return null;
  }

  return (
    <Tabs className="w-auto max-w-full" value={versionSwitcher.currentId}>
      <TabsList
        className="max-w-full justify-start gap-1 overflow-visible px-0"
        variant="line"
      >
        {versionSwitcher.versions.map((version) => (
          <TabsTrigger asChild key={version.id} value={version.id}>
            <Link
              className="h-9 rounded-none px-0 pr-4 text-[13.5px] font-medium after:!bottom-[-3px] data-[state=active]:font-semibold"
              params={{}}
              search={{}}
              to={version.href}
            >
              {version.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export type DocsContentBodyPayload =
  | {
      contentPath: string;
      hidePlatformTabs?: boolean;
      kind: 'mdx';
      platformTabs?: {
        canonicalPlatform: PlatformKey;
        initialPlatform?: PlatformKey;
        platforms: string;
      };
    }
  | {
      canonicalPlatform: PlatformKey;
      contentPath: string;
      kind: 'platform-group';
      panels: {
        contentPath: string;
        platform: PlatformKey;
      }[];
      platformTabs: {
        canonicalPlatform: PlatformKey;
        initialPlatform?: PlatformKey;
        platforms: string;
      };
      platforms: PlatformKey[];
    }
  | { kind: 'openapi'; pageProps: ClientApiPageProps };

function DocsContentSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="not-prose flex flex-col gap-5 py-1"
      data-testid="docs-content-skeleton"
    >
      <div className="flex flex-col gap-2">
        <span
          className="h-4 w-24 rounded bg-[color:var(--surface-muted)]"
          data-skeleton-line="eyebrow"
        />
        <span
          className="h-7 w-full max-w-xl rounded bg-[color:var(--surface-muted)]"
          data-skeleton-line="hero"
        />
      </div>
      <div className="flex flex-col gap-3">
        <span className="h-4 w-full rounded bg-[color:var(--surface-muted)]" />
        <span className="h-4 w-[92%] rounded bg-[color:var(--surface-muted)]" />
        <span className="h-4 w-[76%] rounded bg-[color:var(--surface-muted)]" />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <span className="h-24 rounded-lg border border-[color:var(--line-soft)] bg-card" />
        <span className="h-24 rounded-lg border border-[color:var(--line-soft)] bg-card" />
      </div>
    </div>
  );
}

export function DocsTableOfContents({
  className,
  locale = DEFAULT_LOCALE,
  toc,
  variant = 'rail',
}: {
  className?: string;
  locale?: AppLocale | string;
  toc: TOCItemType[];
  variant?: 'mobile' | 'rail';
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');
  const [derivedItems, setDerivedItems] = useState<TOCItemType[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const items = useMemo(
    () =>
      (toc.length > 0 ? toc : derivedItems).filter(
        (item) => typeof item.title === 'string',
      ),
    [derivedItems, toc],
  );
  const [primaryActiveUrl, setPrimaryActiveUrl] = useState(
    () => items[0]?.url ?? '',
  );
  const [visibleUrls, setVisibleUrls] = useState<Set<string>>(
    () => new Set(items[0]?.url ? [items[0].url] : []),
  );

  const scrollToHeading = useCallback((url: string) => {
    setPrimaryActiveUrl(url);
    setVisibleUrls((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
    setIsMobileOpen(false);
    scrollDocsHashTarget(url);
  }, []);

  useEffect(() => {
    if (toc.length > 0) {
      setDerivedItems([]);
      return;
    }

    let frame = 0;
    const updateDerivedItems = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        setDerivedItems(getVisibleArticleHeadingItems());
      });
    };
    const observer = new MutationObserver(updateDerivedItems);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['hidden', 'aria-hidden', 'inert'],
      childList: true,
      subtree: true,
    });
    updateDerivedItems();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      observer.disconnect();
    };
  }, [toc]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let frame = 0;
    const updateActiveUrl = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = requestAnimationFrame(() => {
        const scrollContainer = getActiveDocsScrollContainer();
        const boundary =
          (scrollContainer?.getBoundingClientRect().top ?? 0) +
          TOC_ACTIVE_OFFSET;
        const viewportRect = getScrollViewportRect(scrollContainer);
        const headings = items.map((item) => findDocsHeadingForHash(item.url));
        let nextActiveUrl = items[0]?.url ?? '';
        const nextVisibleUrls = new Set<string>();

        for (const [index, item] of items.entries()) {
          const heading = headings[index];

          if (!heading) {
            continue;
          }

          const sectionTop = heading.getBoundingClientRect().top;
          const sectionBottom = getSectionBottomForItem(index, headings, items);

          if (
            sectionBottom - viewportRect.top >
              TOC_VISIBLE_INTERSECTION_THRESHOLD &&
            viewportRect.bottom - sectionTop >
              TOC_VISIBLE_INTERSECTION_THRESHOLD
          ) {
            nextVisibleUrls.add(item.url);
          }

          if (sectionTop <= boundary) {
            nextActiveUrl = item.url;
          }
        }

        setPrimaryActiveUrl(nextActiveUrl);
        setVisibleUrls(nextVisibleUrls);
      });
    };

    const scrollContainer = getActiveDocsScrollContainer();
    const observer = new MutationObserver(updateActiveUrl);

    scrollContainer?.addEventListener('scroll', updateActiveUrl, {
      passive: true,
    });
    window.addEventListener('scroll', updateActiveUrl, { passive: true });
    window.addEventListener('resize', updateActiveUrl);
    observer.observe(document.body, { childList: true, subtree: true });
    updateActiveUrl();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      scrollContainer?.removeEventListener('scroll', updateActiveUrl);
      window.removeEventListener('scroll', updateActiveUrl);
      window.removeEventListener('resize', updateActiveUrl);
      observer.disconnect();
    };
  }, [items]);

  const linkItems =
    items.length > 0 ? (
      <TocLinks
        items={items}
        onHeadingClick={scrollToHeading}
        primaryActiveUrl={primaryActiveUrl}
        visibleUrls={visibleUrls}
        variant={variant}
      />
    ) : (
      <p className="text-sm text-muted-foreground">{t('docs.tocEmpty')}</p>
    );

  return (
    <aside
      className={cn(
        'flex flex-col',
        variant === 'mobile' ? 'gap-2' : 'gap-4',
        className,
      )}
    >
      {variant === 'mobile' ? (
        <button
          aria-expanded={isMobileOpen}
          className="flex min-h-10 w-full items-center justify-between rounded-md border border-[color:var(--line-soft)] bg-card px-3 py-2 text-left text-[13px] font-semibold text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-muted)]"
          onClick={() => setIsMobileOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span>{t('docs.toc')}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              'size-4 text-[color:var(--ink-4)] transition-transform',
              isMobileOpen && 'rotate-180',
            )}
          />
        </button>
      ) : (
        <div className="px-3 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
          {t('docs.toc')}
        </div>
      )}
      {variant === 'mobile' ? (
        isMobileOpen ? (
          <div className="rounded-md border border-[color:var(--line-soft)] bg-card p-2">
            {linkItems}
          </div>
        ) : null
      ) : (
        linkItems
      )}
      {variant === 'rail' || isMobileOpen ? (
        <div className="mt-2 flex flex-col gap-1 border-t border-[color:var(--line)] pt-3">
          <a
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]"
            href="https://github.com/Shengwang-Community/docs-portal/tree/main/content/docs"
            rel="noreferrer"
            target="_blank"
          >
            <Edit3Icon className="size-3.5" />
            {t('docs.editPage')}
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]"
            href="https://github.com/Shengwang-Community/docs-portal"
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-3.5" />
            {t('docs.viewGithub')}
          </a>
        </div>
      ) : null}
    </aside>
  );
}

function TocLinks({
  items,
  onHeadingClick,
  primaryActiveUrl,
  variant,
  visibleUrls,
}: {
  items: TOCItemType[];
  onHeadingClick: (url: string) => void;
  primaryActiveUrl: string;
  variant: 'mobile' | 'rail';
  visibleUrls: Set<string>;
}) {
  return (
    <nav
      className={cn(
        'flex flex-col',
        variant === 'rail' && 'border-l border-border',
      )}
    >
      {items.map((item) => {
        const isPrimary = item.url === primaryActiveUrl;
        const isVisible = visibleUrls.has(item.url);

        return (
          <a
            aria-current={isPrimary ? 'location' : undefined}
            className={cn(
              'text-sm leading-5 text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
              variant === 'rail'
                ? '-ml-px rounded-r-md border-l-2 border-transparent px-3 py-1.5'
                : 'rounded-md px-2 py-2',
              isVisible &&
                variant === 'rail' &&
                'border-[color:var(--line-strong)] text-[color:var(--ink-2)]',
              isPrimary &&
                variant === 'rail' &&
                'border-[color:var(--accent-brand)] text-[color:var(--ink-1)]',
              isPrimary &&
                variant === 'mobile' &&
                'bg-[color:var(--docs-soft-fill)] text-[color:var(--ink-1)]',
              item.depth > 2 && (variant === 'rail' ? 'pl-6' : 'pl-4'),
              item.depth > 3 && (variant === 'rail' ? 'pl-8' : 'pl-6'),
            )}
            data-primary={isPrimary ? 'true' : undefined}
            data-visible={isVisible ? 'true' : undefined}
            href={item.url}
            key={item.url}
            onClick={(event) => {
              if (!item.url.startsWith('#')) {
                return;
              }

              event.preventDefault();
              onHeadingClick(item.url);
            }}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}

function getVisibleArticleHeadingItems(): TOCItemType[] {
  const article = document.querySelector('article');

  if (!article) {
    return [];
  }

  return Array.from(article.querySelectorAll<HTMLHeadingElement>('h2, h3, h4'))
    .filter((heading) => heading.id && !isHiddenFromToc(heading))
    .map((heading) => ({
      depth: Number(heading.tagName.slice(1)),
      title: heading.textContent?.trim() ?? '',
      url: `#${heading.id}`,
    }))
    .filter((item) => item.title.length > 0);
}

function isHiddenFromToc(element: HTMLElement) {
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    if (
      current.hidden ||
      current.getAttribute('aria-hidden') === 'true' ||
      current.hasAttribute('inert')
    ) {
      return true;
    }
  }

  return false;
}

function getScrollViewportRect(scrollContainer: HTMLElement | null) {
  if (scrollContainer) {
    const rect = scrollContainer.getBoundingClientRect();

    return {
      bottom: rect.bottom,
      top: rect.top,
    };
  }

  return {
    bottom: window.innerHeight,
    top: 0,
  };
}

function getSectionBottomForItem(
  itemIndex: number,
  headings: Array<HTMLElement | null>,
  items: TOCItemType[],
) {
  const currentItem = items[itemIndex];

  for (let index = itemIndex + 1; index < items.length; index += 1) {
    const nextHeading = headings[index];
    const nextItem = items[index];

    if (nextHeading && nextItem.depth <= currentItem.depth) {
      return nextHeading.getBoundingClientRect().top;
    }
  }

  return (
    headings[itemIndex]?.closest('.prose, article')?.getBoundingClientRect()
      .bottom ?? document.body.getBoundingClientRect().bottom
  );
}

function requestAnimationFrame(callback: FrameRequestCallback) {
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(() => callback(window.performance.now()), 0);
}
