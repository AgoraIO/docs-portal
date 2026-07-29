'use client';

import {
  BoxIcon,
  LayoutGridIcon,
  type LucideIcon,
  WorkflowIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zhCNApiReferenceCards } from '@/lib/api-reference-cards-data.zh-cn';
import { buildApiReferenceFilterOptions } from '@/lib/api-reference-filter-options';
import {
  API_REFERENCE_CAPABILITY_GROUPS,
  API_REFERENCE_CATALOG_SELECTOR,
  API_REFERENCE_PRODUCT_ID_ATTRIBUTE,
  API_REFERENCE_PRODUCT_SECTION_SELECTOR,
  getApiReferenceProductSectionId,
} from '@/lib/api-reference-navigation';
import { cn } from '@/lib/cn';
import {
  type CatalogSectionNavItem,
  useCatalogSectionNavigation,
} from './useCatalogSectionNavigation';

const groupIconById: Record<
  (typeof API_REFERENCE_CAPABILITY_GROUPS)[number]['id'],
  LucideIcon
> = {
  core: BoxIcon,
  extensions: WorkflowIcon,
  solutions: LayoutGridIcon,
};

const productOptions = buildApiReferenceFilterOptions(
  zhCNApiReferenceCards.all,
  'product',
);

export function ApiReferenceProductNav() {
  const { activeId, availableItems, setLinkRef } = useCatalogSectionNavigation({
    idAttribute: API_REFERENCE_PRODUCT_ID_ATTRIBUTE,
    items: productOptions,
    rootSelector: API_REFERENCE_CATALOG_SELECTOR,
    sectionSelector: API_REFERENCE_PRODUCT_SECTION_SELECTOR,
  });
  const availableProductById = new Map(
    availableItems.map((product) => [product.id, product]),
  );

  return (
    <section
      aria-label="API 参考产品目录"
      className="flex min-h-0 flex-1 flex-col"
      data-testid="api-reference-product-nav"
    >
      <ScrollArea
        className="min-h-0 flex-1"
        data-testid="api-reference-product-scroll"
        type="always"
      >
        <nav aria-label="API 参考产品" className="pr-3 pb-6">
          {API_REFERENCE_CAPABILITY_GROUPS.map((group) => {
            const products = group.productIds.flatMap((productId) => {
              const product = availableProductById.get(productId);
              return product ? [product] : [];
            });

            return products.length > 0 ? (
              <ProductNavGroup
                activeProductId={activeId}
                groupId={group.id}
                key={group.id}
                label={group.label}
                products={products}
                setLinkRef={setLinkRef}
              />
            ) : null;
          })}
        </nav>
      </ScrollArea>
    </section>
  );
}

function ProductNavGroup({
  activeProductId,
  groupId,
  label,
  products,
  setLinkRef,
}: {
  activeProductId: string;
  groupId: (typeof API_REFERENCE_CAPABILITY_GROUPS)[number]['id'];
  label: string;
  products: CatalogSectionNavItem[];
  setLinkRef: (id: string, element: HTMLAnchorElement | null) => void;
}) {
  const Icon = groupIconById[groupId];

  return (
    <section className="mb-4 last:mb-0">
      <h2 className="sticky top-0 z-10 flex min-h-8 items-center gap-2 bg-background/95 px-2 text-[13px] font-semibold text-foreground backdrop-blur-sm">
        <Icon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        {label}
      </h2>
      <div className="ml-4 flex flex-col border-border/70 border-l pl-3">
        {products.map((product) => {
          const isActive = activeProductId === product.id;

          return (
            <a
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                'relative min-h-8 w-full rounded-md px-2 py-1.5 text-left text-[13px] leading-5 text-muted-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                isActive
                  ? 'bg-[color:var(--accent-brand-soft)] font-semibold text-[color:var(--accent-brand)] before:absolute before:top-1/2 before:-left-[13px] before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[color:var(--accent-brand)]'
                  : 'hover:bg-accent hover:text-foreground',
              )}
              href={`#${getApiReferenceProductSectionId(product.id)}`}
              key={product.id}
              ref={(element) => setLinkRef(product.id, element)}
            >
              {product.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
