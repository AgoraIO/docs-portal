'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { FaqCategoryCard } from './FaqCategoryCard';
import { FaqItemList } from './FaqItemList';
import { FaqSearch } from './FaqSearch';
import {
  type FaqLocale,
  faqLocaleFromPathname,
  getFaqDataset,
} from './faq-dataset';
import { countByCategory, searchAll } from './faq-filter';

export function FaqLanding({ locale }: { locale?: FaqLocale } = {}) {
  const dataset = getFaqDataset(locale ?? faqLocaleFromPathname());
  const counts = useMemo(
    () => countByCategory(dataset.items, dataset.categories),
    [dataset],
  );
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const trimmed = deferredQuery.trim();
    return trimmed
      ? searchAll(dataset.items, trimmed, {
          allPlatforms: dataset.allPlatforms,
          allProducts: dataset.allProducts,
          categories: dataset.categories,
        })
      : null;
  }, [dataset, deferredQuery]);

  return (
    <section className="not-prose my-8 flex flex-col gap-6">
      <p className="m-0 max-w-2xl text-sm leading-6 text-muted-foreground">
        {dataset.ui.landingDescription}
      </p>

      <FaqSearch
        placeholder={dataset.ui.searchAllPlaceholder}
        query={query}
        setQuery={setQuery}
      />

      {results ? (
        <FaqItemList
          categories={dataset.categories}
          clearFiltersLabel={dataset.ui.clearFilters}
          emptyDescription={dataset.ui.emptyDescription}
          emptyTitle={dataset.ui.emptyTitle}
          items={results}
          readLabel={dataset.ui.read}
          showCategory
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {dataset.categories.map((category) => (
            <FaqCategoryCard
              category={category}
              count={counts[category.id]}
              key={category.id}
              locale={dataset.locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}
