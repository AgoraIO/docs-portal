import generatedCards from './api-reference-cards-data.zh-cn.json';

export type ApiReferenceCardType = 'client' | 'server';

export type ApiReferenceKind = 'client-api' | 'restful-api' | 'server-sdk';

export type ApiReferenceBreadcrumbRole = 'document' | 'platform-landing';

export type ApiReferenceCardEntry = {
  apiType: ApiReferenceKind;
  breadcrumbRole: ApiReferenceBreadcrumbRole;
  href: string;
  label: string;
  platform: string;
  platformId: string;
  product: string;
  productId: string;
  sourceLabel: string;
  solutionDescription?: string;
  solutionId?: string;
  solutionTitle?: string;
};

const all = generatedCards.all as ApiReferenceCardEntry[];

export const zhCNApiReferenceCards: Record<
  ApiReferenceCardType | 'all',
  ApiReferenceCardEntry[]
> = {
  all,
  client: all.filter((entry) => entry.apiType === 'client-api'),
  server: all.filter((entry) => entry.apiType !== 'client-api'),
};
