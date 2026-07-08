import { ArrowRightIcon } from 'lucide-react';
import { type FaqItem, faqCategories } from './faq-data';
import type { FaqCategoryMeta } from './faq-dataset';

export function FaqItemCard({
  categories = faqCategories,
  item,
  readLabel = 'Read',
  showCategory = false,
}: {
  categories?: FaqCategoryMeta[];
  item: FaqItem;
  readLabel?: string;
  showCategory?: boolean;
}) {
  const categoryLabel = categories.find(
    (category) => category.id === item.category,
  )?.label;

  return (
    <a
      className="group grid gap-3 rounded-lg border border-border bg-card p-5 text-left shadow-xs transition-colors hover:border-primary/35 hover:bg-accent/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      href={item.href}
    >
      <span className="min-w-0">
        {showCategory && categoryLabel ? (
          <span className="mb-1.5 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {categoryLabel}
          </span>
        ) : null}
        <span className="block text-lg font-medium leading-7 text-foreground">
          {item.title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {item.summary}
        </span>
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-primary sm:justify-end">
        {readLabel}
        <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
