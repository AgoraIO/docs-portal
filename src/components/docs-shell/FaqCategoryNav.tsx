'use client';

import { Link } from '@tanstack/react-router';
import { ListFilterIcon } from 'lucide-react';
import { zhCnFaqDataset } from '@/components/faq/faq-dataset';
import { categoryHref, countByCategory } from '@/components/faq/faq-filter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/cn';

const faqCategoryCounts = countByCategory(
  zhCnFaqDataset.items,
  zhCnFaqDataset.categories,
);

export function FaqCategoryNav({
  activePath,
  onSelectPath,
}: {
  activePath: string;
  onSelectPath: () => void;
}) {
  return (
    <section
      aria-label="常见问题分类目录"
      className="flex min-h-0 flex-1 flex-col"
      data-testid="faq-category-nav"
    >
      <ScrollArea className="min-h-0 flex-1" type="always">
        <nav aria-label="常见问题分类" className="pr-3 pb-6">
          <h2 className="sticky top-0 z-10 flex min-h-8 items-center gap-2 bg-background/95 px-2 text-[13px] font-semibold text-foreground backdrop-blur-sm">
            <ListFilterIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            问题分类
          </h2>
          <div className="ml-4 flex flex-col border-border/70 border-l pl-3">
            {zhCnFaqDataset.categories.map((category) => {
              const href = categoryHref(category.id, 'zh-CN');
              const isActive =
                activePath === href || activePath.startsWith(`${href}/`);

              return (
                <Link
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative flex min-h-8 w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] leading-5 text-muted-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    isActive
                      ? 'bg-[color:var(--accent-brand-soft)] font-semibold text-[color:var(--accent-brand)] before:absolute before:top-1/2 before:-left-[13px] before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[color:var(--accent-brand)]'
                      : 'hover:bg-accent hover:text-foreground',
                  )}
                  key={category.id}
                  onClick={onSelectPath}
                  params={{}}
                  search={{}}
                  to={href}
                >
                  <span>{category.label}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {faqCategoryCounts[category.id]}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </ScrollArea>
    </section>
  );
}
