import { defaultTranslations, defineI18nUI } from 'fumadocs-ui/i18n';

export const docsI18n = defineI18nUI(
  {
    defaultLanguage: 'en',
    languages: ['en', 'zh-CN'],
  },
  {
    en: {
      ...defaultTranslations,
      displayName: 'English',
      search: 'Search docs',
      searchNoResult: 'No matches found.',
      toc: 'On this page',
      tocNoHeadings: 'No headings on this page.',
      lastUpdate: 'Last updated',
      chooseLanguage: 'Choose language',
      nextPage: 'Next page',
      previousPage: 'Previous page',
      chooseTheme: 'Choose theme',
      editOnGithub: 'Edit on GitHub',
    },
    'zh-CN': {
      ...defaultTranslations,
      displayName: '简体中文',
      search: '搜索文档',
      searchNoResult: '没有找到结果。',
      toc: '本页目录',
      tocNoHeadings: '当前页面没有标题。',
      lastUpdate: '最近更新',
      chooseLanguage: '选择语言',
      nextPage: '下一页',
      previousPage: '上一页',
      chooseTheme: '切换主题',
      editOnGithub: '在 GitHub 上编辑',
    },
  },
);
