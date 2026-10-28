export type SearchSection = {
  id: string;
  url: string;
  canonicalUrl?: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  headingPath: string[];
  locale: string;
  product?: string;
  /** 多产品文档的完整筛选标签；product 保留主产品用于兼容展示。 */
  products?: string[];
  tab?: string;
  platform?: string[];
  availablePlatforms?: string[];
  defaultPlatform?: string;
  isDefaultPlatform?: boolean;
  version?: string;
  docType: 'docs' | 'openapi';
  audience: ('developer' | 'customer-support')[];
  status: 'published' | 'deprecated' | 'internal';
  hidden: boolean;
  aliases?: string[];
};

// Platform copies are equivalent only when their document, hierarchy, content,
// and publication metadata agree. A shared fragment alone is not an identity.
export function getSearchSectionIdentity(
  record: Pick<
    SearchSection,
    | 'url'
    | 'canonicalUrl'
    | 'pageTitle'
    | 'sectionTitle'
    | 'headingPath'
    | 'content'
    | 'locale'
    | 'product'
    | 'products'
    | 'version'
    | 'docType'
  >,
) {
  return JSON.stringify([
    record.canonicalUrl ?? record.url.split('#')[0],
    record.pageTitle,
    record.sectionTitle,
    record.headingPath,
    record.content,
    record.locale,
    record.product,
    [...(record.products ?? [])].sort(),
    record.version,
    record.docType,
  ]);
}

const supportedAudiences = new Set<SearchSection['audience'][number]>([
  'developer',
  'customer-support',
]);

export function assertValidSearchSection(record: SearchSection): void {
  if (!record.id.trim()) {
    throw new Error('section ID must not be empty');
  }

  if (
    record.headingPath.length > 1 &&
    (!record.url.includes('#') || record.url.endsWith('#'))
  ) {
    throw new Error('section URL must include an anchor');
  }

  if (!record.pageTitle.trim() || !record.sectionTitle.trim()) {
    throw new Error('section titles must not be empty');
  }

  if (!record.content.trim()) {
    throw new Error('section content must not be empty');
  }

  if (record.hidden) {
    throw new Error('hidden records cannot enter the public KB');
  }

  if (!['published', 'deprecated', 'internal'].includes(record.status)) {
    throw new Error('status must be published, deprecated, or internal');
  }

  if (
    record.audience.length === 0 ||
    record.audience.some((audience) => !supportedAudiences.has(audience))
  ) {
    throw new Error('audience must contain a supported value');
  }

  if (record.headingPath.length === 0) {
    throw new Error('heading path must not be empty');
  }
}
