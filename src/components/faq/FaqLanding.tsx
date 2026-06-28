'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { FaqCategoryCard } from './FaqCategoryCard';
import { FaqItemList } from './FaqItemList';
import { FaqSearch } from './FaqSearch';
import { faqCategories, faqItems } from './faq-data';
import { countByCategory, searchAll } from './faq-filter';

const counts = countByCategory(faqItems);

export function FaqLanding() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const trimmed = deferredQuery.trim();
    return trimmed ? searchAll(faqItems, trimmed) : null;
  }, [deferredQuery]);

  return (
    <section className="not-prose my-8 flex flex-col gap-6">
      <p className="m-0 max-w-2xl text-sm leading-6 text-muted-foreground">
        Search every FAQ, or pick a category to browse.
      </p>

      <FaqSearch
        placeholder="Search all FAQs"
        query={query}
        setQuery={setQuery}
      />

      {results ? (
        <FaqItemList items={results} showCategory />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {faqCategories.map((category) => (
            <FaqCategoryCard
              category={category}
              count={counts[category.id]}
              key={category.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
