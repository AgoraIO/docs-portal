import { ClientOnly } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { DocsBreadcrumbItem } from '@/lib/docs-tree';
import { DocsContentBodyClient } from './DocsContentBody.client';

export function DocsContent({
  breadcrumb = [],
  contentPath,
  description,
  readingTime,
  slug,
  title,
  toc,
}: {
  breadcrumb?: DocsBreadcrumbItem[];
  contentPath: string;
  description?: string;
  readingTime?: {
    minutes: number;
    words: number;
  };
  slug?: string;
  title?: string;
  toc: TOCItemType[];
}) {
  const { t } = useTranslation('common');
  const displayTitle = title ?? slug;

  return (
    <article className="flex min-w-0 flex-col gap-9">
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
          <h1 className="max-w-4xl text-[2rem] leading-[1.12] font-semibold text-[color:var(--ink-1)] sm:text-[2.5rem]">
            {displayTitle}
          </h1>
          {description ? (
            <p className="max-w-3xl text-[15px] leading-7 text-[color:var(--ink-3)]">
              {description}
            </p>
          ) : null}
        </div>
        {readingTime ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[color:var(--line-soft)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[color:var(--ink-3)]">
              {t('docs.readingTime', { count: readingTime.minutes })}
            </span>
          </div>
        ) : null}
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ClientOnly fallback={null}>
          <DocsContentBodyClient contentPath={contentPath} />
        </ClientOnly>
      </div>
      <DocsTableOfContents className="xl:hidden" toc={toc} />
    </article>
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

  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      <div className="px-3 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
        {t('docs.toc')}
      </div>
      {items.length > 0 ? (
        <nav className="flex flex-col border-l border-border">
          {items.map((item) => (
            <a
              className={cn(
                '-ml-px border-l-2 border-transparent px-3 py-1.5 text-sm leading-5 text-[color:var(--ink-3)] transition-colors hover:border-[color:var(--accent-brand)] hover:text-[color:var(--ink-1)]',
                item.depth > 2 && 'pl-6',
                item.depth > 3 && 'pl-8',
              )}
              href={item.url}
              key={item.url}
            >
              {item.title}
            </a>
          ))}
        </nav>
      ) : (
        <p className="text-sm text-muted-foreground">{t('docs.tocEmpty')}</p>
      )}
    </aside>
  );
}
