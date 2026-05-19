import { ClientOnly } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/cn';
import { DocsContentBodyClient } from './DocsContentBody.client';

export function DocsContent({
  contentPath,
  description,
  slug,
  title,
  toc,
}: {
  contentPath: string;
  description?: string;
  slug?: string;
  title?: string;
  toc: TOCItemType[];
}) {
  return (
    <article className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title ?? slug}
        </h1>
        {description ? (
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Separator />
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
