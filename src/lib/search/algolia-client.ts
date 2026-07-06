import { liteClient } from 'algoliasearch/lite';
import type { SearchClient } from 'fumadocs-core/search/client';
import { SUPPORTED_LOCALES } from '../i18n/i18n-config';

export type AlgoliaSearchFilters = {
  platform?: string;
};

type AlgoliaDocsHit = Record<string, unknown> & {
  objectID: string;
};

const LOCALE_SEGMENTS = new Set<string>(SUPPORTED_LOCALES);

// Segments that read better fully capitalised than title-cased.
const ACRONYM_SEGMENTS = new Set([
  'ai',
  'api',
  'asr',
  'cli',
  'faq',
  'im',
  'ios',
  'ip',
  'llm',
  'mcp',
  'mllm',
  'rtc',
  'rtm',
  'sdk',
  'stt',
  'tts',
  'ui',
  'url',
  'vad',
]);

export function createAlgoliaDocsClient({
  appId,
  indexName,
  locale,
  platform,
  scopeFilter,
  searchApiKey,
}: {
  appId: string;
  indexName: string;
  locale: string;
  platform?: string;
  // Raw Algolia filter narrowing results to a product/tab scope, e.g.
  // `product:"video"`. Derived from the nav, so no re-sync is needed.
  scopeFilter?: string;
  searchApiKey: string;
}): SearchClient {
  const client = liteClient(appId, searchApiKey);

  return {
    deps: [appId, indexName, locale, platform, scopeFilter, searchApiKey],
    async search(query) {
      if (query.trim().length === 0) {
        return [];
      }

      const result = await client.searchForHits({
        requests: [
          {
            type: 'default',
            indexName,
            query,
            // One result per page: a page's best-matching section, never the
            // same page repeated for each matching heading.
            distinct: 1,
            filters: buildFilters({ locale, platform, scopeFilter }),
            // Demote low-signal pages so real docs rank above them. Boosting
            // via optionalFilters keeps Algolia's textual relevance intact and
            // only nudges by category: normal docs (+2) and deprecated (+1)
            // outrank glossary (no boost), which otherwise floods every query.
            optionalFilters: [
              'category:default<score=2>',
              'category:deprecated<score=1>',
            ],
            hitsPerPage: 10,
            attributesToHighlight: ['title', 'section', 'content'],
            attributesToSnippet: ['content:25', 'section:20'],
            snippetEllipsisText: '…',
            attributesToRetrieve: [
              'objectID',
              'title',
              'description',
              'section',
              'content',
              'url',
              'section_id',
              'breadcrumbs',
              'locale',
              'product',
              'platform',
              'tab',
              'objectType',
              'category',
            ],
            highlightPostTag: '</mark>',
            highlightPreTag: '<mark>',
          },
        ],
      });

      const entries = [];
      const seenUrls = new Set<string>();

      for (const hit of result.results[0].hits as AlgoliaDocsHit[]) {
        const sectionId =
          typeof hit.section_id === 'string' ? hit.section_id : undefined;
        const url = typeof hit.url === 'string' ? hit.url : '';
        const section = getString(hit.section);
        const resultUrl = sectionId ? `${url}#${sectionId}` : url;

        if (seenUrls.has(resultUrl)) {
          continue;
        }

        seenUrls.add(resultUrl);

        entries.push({
          breadcrumbs: getStringArray(hit.breadcrumbs),
          content: getHighlight(hit, 'title') ?? getString(hit.title) ?? url,
          id: getString(hit.objectID) ?? `${url}#${sectionId ?? ''}`,
          objectType: getString(hit.objectType),
          path: buildPathSegments(url),
          platform: getStringArray(hit.platform),
          product: getString(hit.product),
          section: getHighlight(hit, 'section') ?? section,
          snippet:
            (isMatched(hit, 'content')
              ? getSnippet(hit, 'content')
              : undefined) ??
            (isMatched(hit, 'section')
              ? getSnippet(hit, 'section')
              : undefined) ??
            getString(hit.description) ??
            getSnippet(hit, 'content') ??
            getString(hit.content),
          tab: getString(hit.tab),
          title: getHighlight(hit, 'title') ?? getString(hit.title),
          type: 'page' as const,
          url: resultUrl,
        });
      }

      // Ranking is left entirely to Algolia (textual relevance + the category
      // optionalFilters above); the client no longer re-sorts, so it can't
      // fight the server ranking (e.g. re-promoting a glossary heading match).
      return entries;
    },
  };
}

function buildFilters({
  locale,
  platform,
  scopeFilter,
}: {
  locale: string;
  platform?: string;
  scopeFilter?: string;
}) {
  return [
    `locale:${locale}`,
    platform ? `platform:${platform}` : undefined,
    scopeFilter || undefined,
  ]
    .filter(Boolean)
    .join(' AND ');
}

// Turn a doc URL into a readable breadcrumb of its parent sections, e.g.
// "/en/realtime-media/voice/vad" -> ["Realtime Media", "Voice"]. The trailing
// segment is dropped because the page title already conveys it.
function buildPathSegments(url: string): string[] {
  const segments = url.split('#')[0].split('/').filter(Boolean);

  if (segments.length > 0 && LOCALE_SEGMENTS.has(segments[0])) {
    segments.shift();
  }

  if (segments.length > 1) {
    segments.pop();
  }

  const humanized = segments.map(humanizeSegment);

  return humanized.filter(
    (segment, index) =>
      index === 0 ||
      segment.toLowerCase() !== humanized[index - 1].toLowerCase(),
  );
}

function humanizeSegment(segment: string) {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) =>
      ACRONYM_SEGMENTS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

function isMatched(hit: Record<string, unknown>, key: string) {
  const highlight = hit._highlightResult;

  if (!isRecord(highlight)) {
    return false;
  }

  const value = highlight[key];

  return (
    isRecord(value) &&
    typeof value.matchLevel === 'string' &&
    value.matchLevel !== 'none'
  );
}

function getHighlight(hit: Record<string, unknown>, key: string) {
  return getMarkedValue(hit._highlightResult, key);
}

function getSnippet(hit: Record<string, unknown>, key: string) {
  return getMarkedValue(hit._snippetResult, key);
}

function getMarkedValue(source: unknown, key: string) {
  if (!isRecord(source)) {
    return undefined;
  }

  const value = source[key];

  if (!isRecord(value) || typeof value.value !== 'string') {
    return undefined;
  }

  return value.value;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
