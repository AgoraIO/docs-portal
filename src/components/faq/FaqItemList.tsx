import { Button } from '@/components/ui/button';
import { FaqItemCard } from './FaqItemCard';
import type { FaqItem } from './faq-data';
import type { FaqCategoryMeta } from './faq-dataset';

export function FaqItemList({
  categories,
  emptyDescription = 'Try another product, platform, or keyword.',
  emptyTitle = 'No FAQs match the current filters.',
  items,
  onClear,
  readLabel,
  clearFiltersLabel = 'Clear filters',
  showCategory = false,
}: {
  categories?: FaqCategoryMeta[];
  clearFiltersLabel?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  items: FaqItem[];
  onClear?: () => void;
  readLabel?: string;
  showCategory?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        {onClear ? (
          <Button
            className="mt-5"
            onClick={onClear}
            type="button"
            variant="outline"
          >
            {clearFiltersLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <FaqItemCard
          categories={categories}
          item={item}
          key={item.href}
          readLabel={readLabel}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}
