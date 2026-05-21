import { ClientOnly } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { BotIcon, Edit3Icon, ExternalLinkIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { DocsBreadcrumbItem } from '@/lib/docs-tree';
import { DocsContentBodyClient } from './DocsContentBody.client';

const DESKTOP_SCROLL_SELECTOR = '[data-testid="docs-main-desktop-scroll"]';
const TOC_SCROLL_OFFSET = 24;
const TOC_ACTIVE_OFFSET = 96;
const TOC_VISIBLE_INTERSECTION_THRESHOLD = 4;

export function DocsContent({
  breadcrumb = [],
  contentPath,
  description,
  markdownUrl,
  slug,
  title,
  toc,
}: {
  breadcrumb?: DocsBreadcrumbItem[];
  contentPath: string;
  description?: string;
  markdownUrl?: string;
  slug?: string;
  title?: string;
  toc: TOCItemType[];
}) {
  const { t } = useTranslation('common');
  const displayTitle = title ?? slug;

  return (
    <article className="flex min-w-0 max-w-[var(--content-max)] flex-col gap-9">
      <header className="flex flex-col gap-4 border-b border-[color:var(--line-soft)] pb-7">
        {breadcrumb.length > 0 ? (
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
        <div className="flex flex-col gap-3">
          <h1 className="max-w-4xl text-[2rem] leading-[1.12] font-bold tracking-[-0.022em] text-[color:var(--ink-1)] sm:text-[2.375rem]">
            {displayTitle}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[17.5px] leading-[1.55] text-[color:var(--ink-3)]">
              {description}
            </p>
          ) : null}
        </div>
        {markdownUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[color:var(--line-soft)] bg-card px-2.5 text-xs font-medium text-[color:var(--ink-3)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--ink-1)]"
              href={markdownUrl}
              rel="noreferrer"
              target="_blank"
            >
              <BotIcon className="size-3.5" />
              {t('docs.viewAsMarkdown')}
            </a>
          </div>
        ) : null}
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ClientOnly fallback={<DocsContentSkeleton />}>
          <DocsContentBodyClient contentPath={contentPath} />
        </ClientOnly>
      </div>
      <DocsTableOfContents className="xl:hidden" toc={toc} />
    </article>
  );
}

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
  toc,
}: {
  className?: string;
  toc: TOCItemType[];
}) {
  const { t } = useTranslation('common');
  const items = useMemo(
    () => toc.filter((item) => typeof item.title === 'string'),
    [toc],
  );
  const [primaryActiveUrl, setPrimaryActiveUrl] = useState(
    () => items[0]?.url ?? '',
  );
  const [visibleUrls, setVisibleUrls] = useState<Set<string>>(
    () => new Set(items[0]?.url ? [items[0].url] : []),
  );

  const scrollToHeading = useCallback((url: string) => {
    const scrollContainer = getActiveDocsScrollContainer();
    const heading = getHeadingForUrl(url, scrollContainer);

    if (!heading) {
      return;
    }

    setPrimaryActiveUrl(url);
    setVisibleUrls((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
    updateHash(url);

    const headingRect = heading.getBoundingClientRect();

    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();

      scrollContainer.scrollTo({
        behavior: 'smooth',
        top:
          scrollContainer.scrollTop +
          headingRect.top -
          containerRect.top -
          TOC_SCROLL_OFFSET,
      });
      return;
    }

    window.scrollTo({
      behavior: 'smooth',
      top: window.scrollY + headingRect.top - TOC_ACTIVE_OFFSET,
    });
  }, []);

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
        const headings = items.map((item) =>
          getHeadingForUrl(item.url, scrollContainer),
        );
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

    const scrollContainer = getDesktopDocsScrollContainer();
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

  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      <div className="px-3 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
        {t('docs.toc')}
      </div>
      {items.length > 0 ? (
        <nav className="flex flex-col border-l border-border">
          {items.map((item) => {
            const isPrimary = item.url === primaryActiveUrl;
            const isVisible = visibleUrls.has(item.url);

            return (
              <a
                aria-current={isPrimary ? 'location' : undefined}
                className={cn(
                  '-ml-px rounded-r-md border-l-2 border-transparent px-3 py-1.5 text-sm leading-5 text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
                  isVisible &&
                    'border-[color:var(--line-strong)] text-[color:var(--ink-2)]',
                  isPrimary &&
                    'border-[color:var(--accent-brand)] text-[color:var(--ink-1)]',
                  item.depth > 2 && 'pl-6',
                  item.depth > 3 && 'pl-8',
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
                  scrollToHeading(item.url);
                }}
              >
                {item.title}
              </a>
            );
          })}
        </nav>
      ) : (
        <p className="text-sm text-muted-foreground">{t('docs.tocEmpty')}</p>
      )}
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
    </aside>
  );
}

function getActiveDocsScrollContainer() {
  const scrollContainer = getDesktopDocsScrollContainer();

  if (!scrollContainer) {
    return null;
  }

  const styles = window.getComputedStyle(scrollContainer);

  if (styles.display === 'none' || styles.visibility === 'hidden') {
    return null;
  }

  return scrollContainer;
}

function getDesktopDocsScrollContainer() {
  return document.querySelector<HTMLElement>(DESKTOP_SCROLL_SELECTOR);
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

function getHeadingForUrl(url: string, scrollContainer: HTMLElement | null) {
  if (!url.startsWith('#')) {
    return null;
  }

  const id = decodeURIComponent(url.slice(1));

  if (!id) {
    return null;
  }

  const selector = `#${escapeCssIdentifier(id)}`;

  const headings = [
    ...(scrollContainer?.querySelectorAll<HTMLElement>(selector) ?? []),
    ...document.querySelectorAll<HTMLElement>(selector),
  ];
  const visibleHeading = headings.find(
    (heading) => heading.getClientRects().length > 0,
  );

  return visibleHeading ?? headings[0] ?? null;
}

function escapeCssIdentifier(value: string) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }

  return value.replace(/["\\#.:,[\]=>+~*^$|()\s]/g, '\\$&');
}

function requestAnimationFrame(callback: FrameRequestCallback) {
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(() => callback(window.performance.now()), 0);
}

function updateHash(url: string) {
  if (!url.startsWith('#')) {
    return;
  }

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${url}`,
  );
}
