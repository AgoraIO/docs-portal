export type SearchEntry = {
  content?: string;
  description?: string;
  objectType?: 'docs' | 'openapi';
  platform?: string[];
  product?: string;
  tab?: string;
  title: string;
  url: string;
};

const SEARCH_PLATFORMS = [
  'android',
  'ios',
  'web',
  'windows',
  'macos',
  'unity',
  'flutter',
  'react-native',
  'electron',
  'unreal',
] as const;

export function getSearchEntryMetadata(
  url: string,
  content: string,
  objectType: NonNullable<SearchEntry['objectType']> = 'docs',
) {
  const [, tab = '', product = tab] = url.split('/').filter(Boolean);
  const searchableText = `${url}\n${content}`.toLowerCase();

  return {
    objectType,
    platform: inferSearchPlatforms(searchableText),
    product,
    tab,
  } satisfies Pick<SearchEntry, 'objectType' | 'platform' | 'product' | 'tab'>;
}

export function inferSearchPlatforms(sourceText: string) {
  const normalized = sourceText.toLowerCase();

  return SEARCH_PLATFORMS.filter((platform) =>
    new RegExp(`(^|[^a-z0-9])${platform}($|[^a-z0-9])`).test(normalized),
  );
}
