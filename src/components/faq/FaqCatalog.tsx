'use client';

import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
} from 'lucide-react';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import {
  FAQ_ALL_PLATFORMS,
  FAQ_ALL_PRODUCTS,
  type FaqCategoryId,
  faqCategories,
  faqItems,
  faqPlatforms,
  faqProducts,
} from './faq-data';

const DEFAULT_CATEGORY = 'integration-issues' satisfies FaqCategoryId;

function getInitialCategory() {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORY;
  }

  const category = new URLSearchParams(window.location.search).get('category');

  if (isFaqCategoryId(category)) {
    return category;
  }

  return DEFAULT_CATEGORY;
}

function isFaqCategoryId(value: string | null): value is FaqCategoryId {
  return faqCategories.some((category) => category.id === value);
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}

function getCategoryLabel(categoryId: FaqCategoryId) {
  return (
    faqCategories.find((category) => category.id === categoryId)?.label ?? 'FAQ'
  );
}

function matchesFacet(values: string[], activeValue: string, allValue: string) {
  return activeValue === allValue || values.includes(activeValue);
}

export function FaqCatalog() {
  const [activeCategory, setActiveCategory] =
    useState<FaqCategoryId>(getInitialCategory);
  const [activeProduct, setActiveProduct] = useState(FAQ_ALL_PRODUCTS);
  const [activePlatform, setActivePlatform] = useState(FAQ_ALL_PLATFORMS);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const defaultCategory = activeCategory === DEFAULT_CATEGORY;

    if (defaultCategory) {
      params.delete('category');
    } else {
      params.set('category', activeCategory);
    }

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;

    window.history.replaceState(null, '', nextUrl);
  }, [activeCategory]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeFilterText(deferredQuery);

    return faqItems.filter((item) => {
      if (item.category !== activeCategory) {
        return false;
      }

      if (!matchesFacet(item.products, activeProduct, FAQ_ALL_PRODUCTS)) {
        return false;
      }

      if (!matchesFacet(item.platforms, activePlatform, FAQ_ALL_PLATFORMS)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeFilterText(
        [
          item.title,
          item.summary,
          item.products.join(' '),
          item.platforms.join(' '),
          getCategoryLabel(item.category),
        ].join(' '),
      );

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, activePlatform, activeProduct, deferredQuery]);

  const selectedCategory = useMemo(
    () =>
      faqCategories.find((category) => category.id === activeCategory) ??
      faqCategories[0],
    [activeCategory],
  );
  const hasActiveFilters =
    query.length > 0 ||
    activeProduct !== FAQ_ALL_PRODUCTS ||
    activePlatform !== FAQ_ALL_PLATFORMS;
  const resetFilters = useCallback(() => {
    setActiveProduct(FAQ_ALL_PRODUCTS);
    setActivePlatform(FAQ_ALL_PLATFORMS);
    setQuery('');
  }, []);

  return (
    <section className="not-prose my-8">
      <div className="mb-5">
        <FaqSearch query={query} setQuery={setQuery} />
      </div>

      <div className="mb-5 flex flex-col gap-3 2xl:hidden">
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {faqCategories.map((category) => (
              <CategoryButton
                active={category.id === activeCategory}
                category={category}
                key={category.id}
                onSelect={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="self-start lg:hidden"
              size="sm"
              variant="outline"
            >
              <FilterIcon data-icon="inline-start" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[22rem] max-w-[calc(100vw-2rem)]"
            side="left"
          >
            <SheetHeader>
              <SheetTitle>FAQ filters</SheetTitle>
              <SheetDescription>
                Narrow questions by product, platform, or keyword.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-5">
              <ProductFilter
                activeProduct={activeProduct}
                setActiveProduct={setActiveProduct}
              />
              <PlatformFilter
                activePlatform={activePlatform}
                setActivePlatform={setActivePlatform}
              />
              {hasActiveFilters ? (
                <Button
                  className="justify-start"
                  onClick={resetFilters}
                  type="button"
                  variant="outline"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid min-h-[48rem] gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] 2xl:grid-cols-[15rem_18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border pr-5 2xl:block">
          <nav
            aria-label="FAQ categories"
            className="sticky top-8 flex flex-col gap-1"
          >
            {faqCategories.map((category) => (
              <CategoryButton
                active={category.id === activeCategory}
                category={category}
                key={category.id}
                onSelect={() => setActiveCategory(category.id)}
              />
            ))}
          </nav>
        </aside>

        <aside className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-3">
            <ProductFilter
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
            />
            <PlatformFilter
              activePlatform={activePlatform}
              setActivePlatform={setActivePlatform}
            />
            {hasActiveFilters ? (
              <Button
                className="justify-start"
                onClick={resetFilters}
                type="button"
                variant="outline"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="m-0 text-[2rem] font-bold leading-tight tracking-normal text-foreground sm:text-[2.35rem]">
                {selectedCategory.label}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedCategory.description}
              </p>
            </div>
            <Badge
              className="self-start whitespace-nowrap sm:self-auto"
              variant="outline"
            >
              {filteredItems.length} articles
            </Badge>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <FaqItemCard item={item} key={item.href} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No FAQs match the current filters.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another product, platform, or keyword.
              </p>
              {hasActiveFilters ? (
                <Button
                  className="mt-5"
                  onClick={resetFilters}
                  type="button"
                  variant="outline"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqItemCard({ item }: { item: (typeof faqItems)[number] }) {
  return (
    <a
      className="group grid min-h-24 gap-3 rounded-lg border border-border bg-card p-5 text-left shadow-xs transition-colors hover:border-primary/35 hover:bg-accent/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      href={item.href}
    >
      <span className="min-w-0">
        <span className="block text-lg font-medium leading-7 text-foreground">
          {item.title}
        </span>
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-primary sm:justify-end">
        Read
        <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

function CategoryButton({
  active,
  category,
  onSelect,
}: {
  active: boolean;
  category: (typeof faqCategories)[number];
  onSelect: () => void;
}) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md px-3 py-2 text-left text-sm font-medium leading-6 transition-colors',
        active
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
      onClick={onSelect}
      type="button"
    >
      {category.label}
    </button>
  );
}

function FaqSearch({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (query: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search FAQs</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        className="h-11 w-full rounded-lg border border-input bg-background px-9 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search FAQs"
        type="search"
        value={query}
      />
    </label>
  );
}

function ProductFilter({
  activeProduct,
  setActiveProduct,
}: {
  activeProduct: string;
  setActiveProduct: (product: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-14 w-full justify-between px-4 text-base font-normal"
          type="button"
          variant="outline"
        >
          <span className="truncate">{activeProduct}</span>
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {faqProducts.map((product) => (
          <DropdownMenuItem
            className="justify-between"
            key={product}
            onSelect={() => setActiveProduct(product)}
          >
            {product}
            {product === activeProduct ? <CheckCircle2Icon /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlatformFilter({
  activePlatform,
  setActivePlatform,
}: {
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
}) {
  return (
    <fieldset className="rounded-lg border border-border bg-card">
      <legend className="sr-only">Platforms</legend>
      <div className="border-b border-border px-4 py-4 text-base font-medium text-foreground">
        Platforms
      </div>
      <div className="flex flex-col gap-1 p-4">
        {faqPlatforms.map((platform) => {
          const active = platform === activePlatform;

          return (
            <button
              className="flex min-h-9 items-center gap-3 rounded-md px-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              key={platform}
              onClick={() => setActivePlatform(platform)}
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background',
                )}
              >
                {active ? <CheckCircle2Icon /> : null}
              </span>
              <span className={cn(active && 'font-semibold text-foreground')}>
                {platform}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
