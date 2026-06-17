import type { DocsMeta } from '../docs-meta-schema';
import type { AppLocale } from '../i18n/i18n-config';

export type DocsIndexPage = {
  contentPath: string;
  description?: string;
  locale: AppLocale;
  markdownUrl: string;
  routePath: string;
  slugSegments: string[];
  sourceSlugs: string[];
  tab: string;
  title: string;
};

export type DocsIndexNode = {
  children: string[];
  key: string;
  locale: AppLocale;
  meta?: DocsMeta;
  name: string;
  page?: DocsIndexPage;
  parentKey?: string;
  routePath?: string;
  type: 'folder' | 'page';
};

export type DocsIndex = {
  nodesByKey: Map<string, DocsIndexNode>;
  pages: DocsIndexPage[];
  pagesByLocale: Record<AppLocale, DocsIndexPage[]>;
  pagesByRoutePath: Map<string, DocsIndexPage>;
};
