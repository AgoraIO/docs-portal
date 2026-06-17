'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import { Edit3Icon, ExternalLinkIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { findDocsHeadingForHash, scrollDocsHashTarget } from '@/lib/docs-hash';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { useTranslation } from '@/lib/i18n/react';

const TOC_ACTIVE_OFFSET = 96;
const TOC_VISIBLE_INTERSECTION_THRESHOLD = 4;

export function DocsTableOfContents({
  className,
  locale = DEFAULT_LOCALE,
  toc,
}: {
  className?: string;
  locale?: AppLocale | string;
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');
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
    setPrimaryActiveUrl(url);
    setVisibleUrls((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
    scrollDocsHashTarget(url);
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
  return getDesktopDocsScrollContainer();
}

function getDesktopDocsScrollContainer() {
  return document.querySelector<HTMLElement>(
    '[data-testid="docs-main-desktop-scroll"]',
  );
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
