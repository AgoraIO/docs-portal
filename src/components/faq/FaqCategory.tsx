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
import {
  FAQ_ALL_PLATFORMS,
  FAQ_ALL_PRODUCTS,
  type FaqCategoryId,
  faqCategories,
  faqItems,
} from './faq-data';
import { filterFaqs } from './faq-filter';

function getParam(name: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function FaqCategory({ category }: { category: FaqCategoryId }) {
  const meta =
    faqCategories.find((entry) => entry.id === category) ?? faqCategories[0];

  const [product, setProduct] = useState(() =>
    getParam('product', FAQ_ALL_PRODUCTS),
  );
  const [platform, setPlatform] = useState(() =>
    getParam('platform', FAQ_ALL_PLATFORMS),
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
    set('product', product, FAQ_ALL_PRODUCTS);
    set('platform', platform, FAQ_ALL_PLATFORMS);
    set('q', query, '');
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
  }, [platform, product, query]);

  const items = useMemo(
    () =>
      filterFaqs(faqItems, {
        category,
        platform,
        product,
        query: deferredQuery,
      }),
    [category, platform, product, deferredQuery],
  );

  const hasActiveFilters =
    query.length > 0 ||
    product !== FAQ_ALL_PRODUCTS ||
    platform !== FAQ_ALL_PLATFORMS;

  const resetFilters = useCallback(() => {
    setProduct(FAQ_ALL_PRODUCTS);
    setPlatform(FAQ_ALL_PLATFORMS);
    setQuery('');
  }, []);

  return (
    <section className="not-prose my-8 flex flex-col gap-5">
      <p className="m-0 max-w-2xl text-sm leading-6 text-muted-foreground">
        {meta.description}
      </p>

      <FaqSearch
        placeholder={`Search ${meta.label}`}
        query={query}
        setQuery={setQuery}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FaqFilterToolbar
          hasActiveFilters={hasActiveFilters}
          onClear={resetFilters}
          onPlatformChange={setPlatform}
          onProductChange={setProduct}
          platform={platform}
          product={product}
        />
        <Badge className="whitespace-nowrap" variant="outline">
          {items.length} {items.length === 1 ? 'question' : 'questions'}
        </Badge>
      </div>

      <FaqItemList items={items} onClear={resetFilters} />
    </section>
  );
}
