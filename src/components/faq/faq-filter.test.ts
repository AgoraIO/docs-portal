import { describe, expect, it } from 'vitest';
import {
  FAQ_CATEGORY_FOLDER,
  categoryHref,
  countByCategory,
  filterFaqs,
  searchAll,
} from './faq-filter';
import { faqCategories, faqItems } from './faq-data';

describe('faq-filter', () => {
  it('filters by category', () => {
    const result = filterFaqs(faqItems, { category: 'quality-issues' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === 'quality-issues')).toBe(true);
  });

  it('filters by product facet, honoring the "all" sentinel', () => {
    const all = filterFaqs(faqItems, { category: 'general-product-inquiry' });
    const cloud = filterFaqs(faqItems, {
      category: 'general-product-inquiry',
      product: 'Cloud Recording',
    });
    expect(cloud.length).toBeGreaterThan(0);
    expect(cloud.length).toBeLessThanOrEqual(all.length);
    expect(
      cloud.every(
        (item) =>
          item.products.includes('All Products') ||
          item.products.includes('Cloud Recording'),
      ),
    ).toBe(true);
  });

  it('filters by case-insensitive query over title and summary', () => {
    const result = filterFaqs(faqItems, { query: 'CHROME 81' });
    expect(
      result.some((item) => item.title.includes('Chrome 81')),
    ).toBe(true);
  });

  it('counts every category, including zero', () => {
    const counts = countByCategory(faqItems);
    for (const category of faqCategories) {
      expect(counts[category.id]).toBe(
        faqItems.filter((item) => item.category === category.id).length,
      );
    }
  });

  it('searchAll spans every category', () => {
    const result = searchAll(faqItems, 'recording');
    const categories = new Set(result.map((item) => item.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('maps each category id to a folder and href', () => {
    expect(FAQ_CATEGORY_FOLDER['integration-issues']).toBe('integration');
    expect(categoryHref('account-and-billing')).toBe(
      '/en/api-reference/faq/account',
    );
  });
});
