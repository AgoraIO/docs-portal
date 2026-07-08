'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Badge } from '@/components/ui/badge';
import { FaqFilterToolbar } from './FaqFilterToolbar';
import { FaqItemList } from './FaqItemList';
import { FaqSearch } from './FaqSearch';
import type { FaqCategoryId } from './faq-data';
import {
  type FaqLocale,
  faqLocaleFromPathname,
  getFaqDataset,
} from './faq-dataset';
import { filterFaqs } from './faq-filter';

function getParam(name: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function FaqCategory({
  category,
  locale,
}: {
  category: FaqCategoryId;
  locale?: FaqLocale;
}) {
  const dataset = getFaqDataset(locale ?? faqLocaleFromPathname());
  const meta =
    dataset.categories.find((entry) => entry.id === category) ??
    dataset.categories[0];

  const [product, setProduct] = useState(() =>
    getParam('product', dataset.allProducts),
  );
  const [platform, setPlatform] = useState(() =>
    getParam('platform', dataset.allPlatforms),
  );
  const [query, setQuery] = useState(() => getParam('q', ''));
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const set = (key: string, value: string, fallback: string) => {
      if (value === fallback) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    };
    set('product', product, dataset.allProducts);
    set('platform', platform, dataset.allPlatforms);
    set('q', query, '');
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
  }, [dataset, platform, product, query]);

  const items = useMemo(
    () =>
      filterFaqs(
        dataset.items,
        {
          category,
          platform,
          product,
          query: deferredQuery,
        },
        {
          allPlatforms: dataset.allPlatforms,
          allProducts: dataset.allProducts,
          categories: dataset.categories,
        },
      ),
    [category, dataset, platform, product, deferredQuery],
  );

  const hasActiveFilters =
    query.length > 0 ||
    product !== dataset.allProducts ||
    platform !== dataset.allPlatforms;

  const resetFilters = useCallback(() => {
    setProduct(dataset.allProducts);
    setPlatform(dataset.allPlatforms);
    setQuery('');
  }, [dataset]);

  return (
    <section className="not-prose my-8 flex flex-col gap-5">
      <p className="m-0 max-w-2xl text-sm leading-6 text-muted-foreground">
        {meta.description}
      </p>

      <FaqSearch
        placeholder={dataset.ui.searchCategoryPlaceholder(meta.label)}
        query={query}
        setQuery={setQuery}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FaqFilterToolbar
          clearLabel={dataset.ui.clear}
          hasActiveFilters={hasActiveFilters}
          onClear={resetFilters}
          onPlatformChange={setPlatform}
          onProductChange={setProduct}
          platform={platform}
          platformLabel={dataset.ui.platformFilter}
          platforms={dataset.platforms}
          product={product}
          productLabel={dataset.ui.productFilter}
          products={dataset.products}
        />
        <Badge className="whitespace-nowrap" variant="outline">
          {dataset.ui.questionCount(items.length)}
        </Badge>
      </div>

      <FaqItemList
        categories={dataset.categories}
        clearFiltersLabel={dataset.ui.clearFilters}
        emptyDescription={dataset.ui.emptyDescription}
        emptyTitle={dataset.ui.emptyTitle}
        items={items}
        onClear={resetFilters}
        readLabel={dataset.ui.read}
      />
    </section>
  );
}
