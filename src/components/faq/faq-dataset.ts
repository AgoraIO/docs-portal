import {
  FAQ_ALL_PLATFORMS,
  FAQ_ALL_PRODUCTS,
  type FaqCategoryId,
  type FaqItem,
  faqCategories,
  faqItems,
  faqPlatforms,
  faqProducts,
} from './faq-data';
import {
  FAQ_ZH_CN_ALL_PLATFORMS,
  FAQ_ZH_CN_ALL_PRODUCTS,
  zhCnFaqCategories,
  zhCnFaqItems,
  zhCnFaqPlatforms,
  zhCnFaqProducts,
} from './faq-data.zh-cn';

export type FaqLocale = 'en' | 'zh-CN';

export type FaqCategoryMeta = {
  description: string;
  id: FaqCategoryId;
  label: string;
};

export type FaqDataset = {
  allPlatforms: string;
  allProducts: string;
  categories: FaqCategoryMeta[];
  items: FaqItem[];
  locale: FaqLocale;
  platforms: string[];
  products: string[];
  ui: {
    clear: string;
    clearFilters: string;
    emptyDescription: string;
    emptyTitle: string;
    landingDescription: string;
    platformFilter: string;
    productFilter: string;
    questionCount: (count: number) => string;
    read: string;
    searchAllPlaceholder: string;
    searchCategoryPlaceholder: (category: string) => string;
  };
};

export const englishFaqDataset: FaqDataset = {
  allPlatforms: FAQ_ALL_PLATFORMS,
  allProducts: FAQ_ALL_PRODUCTS,
  categories: faqCategories,
  items: faqItems,
  locale: 'en',
  platforms: faqPlatforms,
  products: faqProducts,
  ui: {
    clear: 'Clear',
    clearFilters: 'Clear filters',
    emptyDescription: 'Try another product, platform, or keyword.',
    emptyTitle: 'No FAQs match the current filters.',
    landingDescription: 'Search every FAQ, or pick a category to browse.',
    platformFilter: 'Platform',
    productFilter: 'Product',
    questionCount: (count) =>
      `${count} ${count === 1 ? 'question' : 'questions'}`,
    read: 'Read',
    searchAllPlaceholder: 'Search all FAQs',
    searchCategoryPlaceholder: (category) => `Search ${category}`,
  },
};

export const zhCnFaqDataset: FaqDataset = {
  allPlatforms: FAQ_ZH_CN_ALL_PLATFORMS,
  allProducts: FAQ_ZH_CN_ALL_PRODUCTS,
  categories: zhCnFaqCategories,
  items: zhCnFaqItems,
  locale: 'zh-CN',
  platforms: zhCnFaqPlatforms,
  products: zhCnFaqProducts,
  ui: {
    clear: '清除',
    clearFilters: '清除筛选',
    emptyDescription: '请尝试其他产品、平台或关键词。',
    emptyTitle: '没有符合当前筛选条件的常见问题。',
    landingDescription: '搜索全部常见问题，或选择分类浏览。',
    platformFilter: '平台',
    productFilter: '产品',
    questionCount: (count) => `${count} 个问题`,
    read: '查看',
    searchAllPlaceholder: '搜索全部常见问题',
    searchCategoryPlaceholder: (category) => `搜索${category}`,
  },
};

export function getFaqDataset(locale?: FaqLocale): FaqDataset {
  return locale === 'zh-CN' ? zhCnFaqDataset : englishFaqDataset;
}

export function faqLocaleFromPathname(pathname?: string): FaqLocale {
  const value =
    pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  return value.startsWith('/zh-CN/') ? 'zh-CN' : 'en';
}
