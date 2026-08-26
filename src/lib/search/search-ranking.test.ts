import { describe, expect, it } from 'vitest';
import type { SearchIntent, SearchIntentResult } from './search-intent';
import type { RankedSearchResult } from './search-ranking';
import { rankSearchResults } from './search-ranking';

function queryIntent(intent: SearchIntent): SearchIntentResult {
  return {
    intent,
    majorTerms: [],
    normalizedQuery: '',
    originalQuery: '',
    terms: [],
  };
}

function result(
  id: string,
  overrides: Partial<RankedSearchResult> = {},
): RankedSearchResult {
  return {
    allMajorTermsMatch: false,
    contentMatch: false,
    id,
    intentMatch: true,
    path: [],
    recordKind: 'guide',
    sectionMatch: false,
    title: id,
    titleMatch: false,
    url: `/${id}`,
    ...overrides,
  };
}

function rankedIds(
  results: RankedSearchResult[],
  intent: SearchIntent,
  limit?: number,
) {
  return rankSearchResults(results, queryIntent(intent), limit).map(
    ({ id }) => id,
  );
}

describe('rankSearchResults', () => {
  it.each(['task', 'product', 'support'] as const)(
    'places an exact guide before a weak API result for %s intent',
    (intent) => {
      const weakApi = result('api-weak', {
        recordKind: 'sdk-symbol',
      });
      const exactGuide = result('guide-exact', {
        allMajorTermsMatch: true,
        recordKind: 'guide',
        titleExactMatch: true,
        titleMatch: true,
      });

      expect(rankedIds([weakApi, exactGuide], intent)).toEqual([
        'guide-exact',
        'api-weak',
      ]);
    },
  );

  it('places an exact SDK symbol before an equally strong guide for api-symbol intent', () => {
    const equallyStrongTextSignals = {
      allMajorTermsMatch: true,
      titleExactMatch: true,
      titleMatch: true,
    };

    expect(
      rankedIds(
        [
          result('guide', equallyStrongTextSignals),
          result('api', {
            ...equallyStrongTextSignals,
            recordKind: 'sdk-symbol',
          }),
        ],
        'api-symbol',
      ),
    ).toEqual(['api', 'guide']);
  });

  it.each([
    ['api-task', 'sdk-symbol', 'guide'],
    ['api-task', 'rest-api', 'guide'],
    ['task', 'guide', 'sdk-symbol'],
    ['task', 'rest-api', 'sdk-symbol'],
    ['product', 'guide', 'sdk-symbol'],
    ['product', 'rest-api', 'sdk-symbol'],
    ['support', 'faq', 'sdk-symbol'],
    ['support', 'guide', 'sdk-symbol'],
    ['support', 'rest-api', 'sdk-symbol'],
  ] as const)(
    'boosts %s-compatible %s records over %s records',
    (intent, compatibleKind, incompatibleKind) => {
      expect(
        rankedIds(
          [
            result('incompatible', { recordKind: incompatibleKind }),
            result('compatible', { recordKind: compatibleKind }),
          ],
          intent,
        ),
      ).toEqual(['compatible', 'incompatible']);
    },
  );

  it('does not apply a record-kind boost for unknown intent', () => {
    expect(
      rankedIds(
        [
          result('sdk', { recordKind: 'sdk-symbol' }),
          result('guide', { recordKind: 'guide' }),
          result('faq', { recordKind: 'faq' }),
        ],
        'unknown',
      ),
    ).toEqual(['sdk', 'guide', 'faq']);
  });

  it('requires the result intent signal before applying a compatible kind boost', () => {
    expect(
      rankedIds(
        [
          result('incompatible', { recordKind: 'guide' }),
          result('compatible-but-unmatched', {
            intentMatch: false,
            recordKind: 'sdk-symbol',
          }),
        ],
        'api-symbol',
      ),
    ).toEqual(['incompatible', 'compatible-but-unmatched']);
  });

  it('orders signals by exact title or alias, all terms, title, section, content, intent, category, then current version', () => {
    const candidates = [
      result('historical', { category: 'deprecated' }),
      result('current', {
        category: 'deprecated',
        currentVersion: true,
      }),
      result('default', { category: 'default' }),
      result('intent', { recordKind: 'sdk-symbol' }),
      result('content', { contentMatch: true, recordKind: 'guide' }),
      result('section', { sectionMatch: true, recordKind: 'guide' }),
      result('title', { recordKind: 'guide', titleMatch: true }),
      result('all-terms', {
        allMajorTermsMatch: true,
        recordKind: 'guide',
      }),
      result('exact-alias', {
        aliasesExactMatch: true,
        recordKind: 'guide',
      }),
      result('exact-title', {
        recordKind: 'guide',
        titleExactMatch: true,
      }),
    ];

    expect(rankedIds(candidates, 'api-symbol')).toEqual([
      'exact-alias',
      'exact-title',
      'all-terms',
      'title',
      'section',
      'content',
      'intent',
      'default',
      'current',
      'historical',
    ]);
  });

  it('places a current version before a historical version in the same bucket', () => {
    expect(
      rankedIds(
        [result('historical'), result('current', { currentVersion: true })],
        'unknown',
      ),
    ).toEqual(['current', 'historical']);
  });

  it('places default content before deprecated and glossary content on a text tie', () => {
    expect(
      rankedIds(
        [
          result('glossary', { category: 'glossary' }),
          result('deprecated', { category: 'deprecated' }),
          result('default', { category: 'default' }),
        ],
        'unknown',
      ),
    ).toEqual(['default', 'deprecated', 'glossary']);
  });

  it('preserves original input order when ranking tuples are equal', () => {
    const input = [result('first'), result('second'), result('third')];

    expect(rankedIds(input, 'unknown')).toEqual(['first', 'second', 'third']);
    expect(input.map(({ id }) => id)).toEqual(['first', 'second', 'third']);
  });

  it('sorts aggregated candidates before applying the final result limit', () => {
    const aggregatedCandidates = Array.from({ length: 12 }, (_, index) =>
      result(`weak-${index}`),
    );
    aggregatedCandidates.push(
      result('strong-after-aggregation', { titleExactMatch: true }),
    );

    expect(rankedIds(aggregatedCandidates, 'unknown', 3)).toEqual([
      'strong-after-aggregation',
      'weak-0',
      'weak-1',
    ]);
  });

  it('does not expose or use a cross-index raw Algolia score', () => {
    const first = result('first') as RankedSearchResult & {
      rawAlgoliaScore: number;
    };
    const second = result('second') as RankedSearchResult & {
      rawAlgoliaScore: number;
    };
    first.rawAlgoliaScore = 1;
    second.rawAlgoliaScore = 999;

    expect(rankedIds([first, second], 'unknown')).toEqual(['first', 'second']);
  });
});
