import { Badge } from '@/components/ui/badge';
import type { FaqCategoryId } from './faq-data';
import { categoryHref } from './faq-filter';

export function FaqCategoryCard({
  category,
  count,
}: {
  category: { description: string; id: FaqCategoryId; label: string };
  count: number;
}) {
  return (
    <a
      className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/35 hover:bg-accent/35"
      href={categoryHref(category.id)}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-base font-medium text-foreground">
          {category.label}
        </span>
        <Badge variant="secondary">{count}</Badge>
      </span>
      <span className="text-sm leading-6 text-muted-foreground">
        {category.description}
      </span>
    </a>
  );
}
