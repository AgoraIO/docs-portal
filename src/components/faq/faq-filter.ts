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

export type FaqFilterOptions = {
  allPlatforms?: string;
  allProducts?: string;
  categories?: Array<{ id: FaqCategoryId; label: string }>;
};

export const FAQ_CATEGORY_FOLDER: Record<FaqCategoryId, string> = {
  'integration-issues': 'integration',
  'quality-issues': 'quality',
  'general-product-inquiry': 'product',
  'account-and-billing': 'account',
  'other-issues': 'other',
};

export function categoryHref(
  category: FaqCategoryId,
  locale: 'en' | 'zh-CN' = 'en',
): string {
  const tab = locale === 'zh-CN' ? 'reference' : 'api-reference';
  return `/${locale}/${tab}/faq/${FAQ_CATEGORY_FOLDER[category]}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesFacet(values: string[], active: string, all: string): boolean {
  return active === all || values.includes(active);
}

function categoryLabel(
  id: FaqCategoryId,
  categories: Array<{ id: FaqCategoryId; label: string }>,
): string {
  return categories.find((category) => category.id === id)?.label ?? 'FAQ';
}

export function filterFaqs(
  items: FaqItem[],
  filter: FaqFilter = {},
  options: FaqFilterOptions = {},
): FaqItem[] {
  const allProducts = options.allProducts ?? FAQ_ALL_PRODUCTS;
  const allPlatforms = options.allPlatforms ?? FAQ_ALL_PLATFORMS;
  const categories = options.categories ?? faqCategories;
  const product = filter.product ?? allProducts;
  const platform = filter.platform ?? allPlatforms;
  const query = normalize(filter.query ?? '');

  return items.filter((item) => {
    if (filter.category && item.category !== filter.category) {
      return false;
    }
    if (!matchesFacet(item.products, product, allProducts)) {
      return false;
    }
    if (!matchesFacet(item.platforms, platform, allPlatforms)) {
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
        categoryLabel(item.category, categories),
      ].join(' '),
    );
    return haystack.includes(query);
  });
}

export function countByCategory(
  items: FaqItem[],
  categories: Array<{ id: FaqCategoryId }> = faqCategories,
): Record<FaqCategoryId, number> {
  const counts = Object.fromEntries(
    categories.map((category) => [category.id, 0]),
  ) as Record<FaqCategoryId, number>;
  for (const item of items) {
    counts[item.category] += 1;
  }
  return counts;
}

export function searchAll(
  items: FaqItem[],
  query: string,
  options: FaqFilterOptions = {},
): FaqItem[] {
  return filterFaqs(items, { query }, options);
}
