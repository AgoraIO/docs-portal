import { ClientOnly } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { Edit3Icon, ExternalLinkIcon } from 'lucide-react';
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-[color:var(--line-soft)] bg-card px-2.5 text-xs font-medium text-[color:var(--ink-3)]">
            <span className="size-1.5 rounded-full bg-[color:var(--accent-brand)]" />
            {t('docs.updatedRecently')}
          </span>
          {readingTime ? (
            <span className="inline-flex h-6 items-center rounded-full border border-[color:var(--line-soft)] bg-card px-2.5 text-xs font-medium text-[color:var(--ink-3)]">
              {t('docs.readingTime', { count: readingTime.minutes })}
            </span>
          ) : null}
          <span className="inline-flex h-6 items-center rounded-full border border-[color:var(--line-soft)] bg-card px-2.5 text-xs font-medium text-[color:var(--ink-3)]">
            {t('docs.concepts')}
          </span>
        </div>
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
      <div className="mt-2 flex flex-col gap-1 border-t border-[color:var(--line)] pt-3">
        <a
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:bg-card hover:text-[color:var(--ink-1)]"
          href="https://github.com/Shengwang-Community/docs-portal/tree/main/content/docs"
          rel="noreferrer"
          target="_blank"
        >
          <Edit3Icon className="size-3.5" />
          {t('docs.editPage')}
        </a>
        <a
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:bg-card hover:text-[color:var(--ink-1)]"
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
