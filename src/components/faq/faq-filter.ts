import {
  FAQ_ALL_PLATFORMS,
  FAQ_ALL_PRODUCTS,
  type FaqCategoryId,
  type FaqItem,
  faqCategories,
} from './faq-data';

export type FaqFilter = {
  category?: FaqCategoryId;
  platform?: string;
  product?: string;
  query?: string;
};

export const FAQ_CATEGORY_FOLDER: Record<FaqCategoryId, string> = {
  'integration-issues': 'integration',
  'quality-issues': 'quality',
  'general-product-inquiry': 'product',
  'account-and-billing': 'account',
  'other-issues': 'other',
};

export function categoryHref(category: FaqCategoryId): string {
  return `/en/api-reference/faq/${FAQ_CATEGORY_FOLDER[category]}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesFacet(values: string[], active: string, all: string): boolean {
  return active === all || values.includes(active);
}

function categoryLabel(id: FaqCategoryId): string {
  return faqCategories.find((category) => category.id === id)?.label ?? 'FAQ';
}

export function filterFaqs(
  items: FaqItem[],
  filter: FaqFilter = {},
): FaqItem[] {
  const product = filter.product ?? FAQ_ALL_PRODUCTS;
  const platform = filter.platform ?? FAQ_ALL_PLATFORMS;
  const query = normalize(filter.query ?? '');

  return items.filter((item) => {
    if (filter.category && item.category !== filter.category) {
      return false;
    }
    if (!matchesFacet(item.products, product, FAQ_ALL_PRODUCTS)) {
      return false;
    }
    if (!matchesFacet(item.platforms, platform, FAQ_ALL_PLATFORMS)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = normalize(
      [
        item.title,
        item.summary,
        item.products.join(' '),
        item.platforms.join(' '),
        categoryLabel(item.category),
      ].join(' '),
    );
    return haystack.includes(query);
  });
}

export function countByCategory(
  items: FaqItem[],
): Record<FaqCategoryId, number> {
  const counts = Object.fromEntries(
    faqCategories.map((category) => [category.id, 0]),
  ) as Record<FaqCategoryId, number>;
  for (const item of items) {
    counts[item.category] += 1;
  }
  return counts;
}

export function searchAll(items: FaqItem[], query: string): FaqItem[] {
  return filterFaqs(items, { query });
}
