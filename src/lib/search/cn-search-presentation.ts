import { isKnownPlatform } from '../platforms/registry';
import { getCnSearchFamily } from './cn-search-family';
import {
  getCnSearchFamilyOrder,
  resolveCnSearchQuery,
} from './cn-search-intent';
import { getSearchPageGroupKey, type SearchPageGroup } from './cn-search-page';
import { getCnSearchNavigationLanguage } from './cn-search-terms';
import {
  normalizeMeilisearchQuery,
  type SearchHit,
} from './meilisearch-client';

export function getCnSearchResponseFamilyOrder(
  groups: SearchPageGroup[],
  query: string,
  platform?: string,
) {
  return getCnSearchFamilyOrder(
    normalizeMeilisearchQuery(query),
    groups.flatMap((group) =>
      group.sections.map((section) => ({
        family: getCnSearchFamily(group),
        title: section.sectionTitle,
        languageEntryTerms: section.languageEntryTerms,
        languageEntryRank: section.languageEntryRank,
      })),
    ),
    platform,
  );
}

export type CnSearchResultEntry = {
  key: string;
  group: SearchPageGroup;
  hit: SearchHit;
  sectionRank: number;
  otherSections: SearchHit[];
};

// Both surfaces show API members separately and one default-platform entrance
// per guide/FAQ. Grouping must not move a later API section ahead of an earlier
// hit from another page (including after loading more).
export function getCnSearchResultEntries(
  groups: SearchPageGroup[],
  query: string,
  platform?: string,
): CnSearchResultEntry[] {
  const q = normalizeMeilisearchQuery(query);
  const selectedPlatform = resolveCnSearchQuery(q, platform).platform;
  const language = getCnSearchNavigationLanguage(q);
  const families = [...new Set(groups.map(getCnSearchFamily))];
  const entries = groups.flatMap((group) => {
    if (!group.sections.length) return [];
    const api = getCnSearchFamily(group) === 'api';
    const hits = api
      ? group.sections
      : [getDocumentEntry(group, selectedPlatform, language)];
    return hits.map((hit) => ({
      key: `${getSearchPageGroupKey(group)}\0${hit.id}`,
      group,
      hit,
      sectionRank:
        Math.max(
          0,
          group.sections.findIndex((section) => section.id === hit.id),
        ) + 1,
      otherSections: api
        ? []
        : group.sections.filter((section) => section.id !== hit.id),
    }));
  });
  const rank = (entry: CnSearchResultEntry) =>
    (getCnSearchFamily(entry.group) === 'api'
      ? entry.hit.resultRank
      : entry.group.sections[0]?.resultRank) ?? Number.MAX_SAFE_INTEGER;
  return families.flatMap((family) =>
    entries
      .filter((entry) => getCnSearchFamily(entry.group) === family)
      .sort((a, b) => rank(a) - rank(b)),
  );
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
