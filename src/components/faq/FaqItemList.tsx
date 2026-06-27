import { Button } from '@/components/ui/button';
import { FaqItemCard } from './FaqItemCard';
import type { FaqItem } from './faq-data';

export function FaqItemList({
  items,
  onClear,
  showCategory = false,
}: {
  items: FaqItem[];
  onClear?: () => void;
  showCategory?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No FAQs match the current filters.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another product, platform, or keyword.
        </p>
        {onClear ? (
          <Button
            className="mt-5"
            onClick={onClear}
            type="button"
            variant="outline"
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <FaqItemCard item={item} key={item.href} showCategory={showCategory} />
      ))}
    </div>
  );
}
