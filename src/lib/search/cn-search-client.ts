import type { SearchClient } from 'fumadocs-core/search/client';
import { isKnownPlatform } from '../platforms/registry';
import { getCnSearchFamily } from './cn-search-family';
import {
  getCnSearchFamilyOrder,
  resolveCnSearchQuery,
} from './cn-search-intent';
import { type SearchPageGroup, searchCnDocsPage } from './cn-search-page';
import { getCnSearchNavigationLanguage } from './cn-search-terms';
import { mapSearchHit, normalizeMeilisearchQuery } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';
import type { DocsSearchScope } from './search-provider';

export function createCnDocsSearchClient({
  platform,
  scope,
  requestHeaders,
}: {
  platform?: string;
  scope?: DocsSearchScope;
  requestHeaders?: () => Record<string, string>;
}): SearchClient {
  return {
    deps: ['cn-search-api', platform, scope?.field, scope?.value],
    async search(query) {
      const q = normalizeMeilisearchQuery(query);
      if (!q) return [];
      const selectedPlatform = resolveCnSearchQuery(q, platform).platform;
      const language = getCnSearchNavigationLanguage(q);
      const result = await searchCnDocsPage(
        {
          ...parseSearchPageState({
            q,
            platform,
            product: scope?.field === 'product' ? scope.value : undefined,
          }),
          tab: scope?.field === 'tab' ? scope.value : undefined,
        },
        undefined,
        requestHeaders?.(),
      );
      const families = getCnSearchFamilyOrder(
        q,
        result.groups.flatMap((group) =>
          group.sections.map((section) => ({
            family: getCnSearchFamily(group),
            title: section.sectionTitle,
            languageEntryTerms: section.languageEntryTerms,
            languageEntryRank: section.languageEntryRank,
          })),
        ),
        platform,
      );
      return families.flatMap((family) =>
        result.groups
          .filter((group) => getCnSearchFamily(group) === family)
          .flatMap((group) =>
            // API members have distinct anchors. Guides and FAQs already share
            // a canonical document group across matching platform variants.
            family === 'api'
              ? group.sections
              : [getDocumentEntry(group, selectedPlatform, language)],
          )
          .slice(0, 3)
          .map((hit) => ({
            ...mapSearchHit(hit),
            family,
            familyTotalHits: result.familyTotalHits?.[family],
          })),
      );
    },
  };
}

function getDocumentEntry(
  group: SearchPageGroup,
  selectedPlatform?: string,
  language?: string,
) {
  const first = group.sections[0];
  const canonical = first.canonicalUrl?.split(/[?#]/, 1)[0];
  const defaultPlatform = first.defaultPlatform;
  // Only published platform variants use canonical/platform routes. Shared
  // pages and older responses without default metadata keep their real link.
  const hasPlatformRoute = first.platform?.some(
    (value) => first.url.split('#', 1)[0] === `${canonical}/${value}`,
  );
  if (
    selectedPlatform ||
    (language && first.languageEntryTerms?.includes(language)) ||
    !canonical ||
    !defaultPlatform ||
    !isKnownPlatform(defaultPlatform) ||
    !hasPlatformRoute
  )
    return { ...first, platform: group.platform };

  const defaultUrl = `${canonical}/${defaultPlatform}`;
  const match = group.sections.find(
    (section) => section.url.split('#', 1)[0] === defaultUrl,
  );
  if (match) return { ...match, platform: group.platform };

  // A non-default section's fragment may not exist on the default platform.
  // Use the document entrance and title instead of inventing that anchor.
  return {
    ...first,
    url: defaultUrl,
    sectionTitle: group.title,
    headingPath: [group.title],
    platform: group.platform,
    highlights: {
      ...first.highlights,
      sectionTitle: [{ text: group.title, highlighted: false }],
    },
  };
}
