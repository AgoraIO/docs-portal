import type { SearchIntent, SearchIntentResult } from './search-intent';

export type SearchRecordKind = 'guide' | 'faq' | 'rest-api' | 'sdk-symbol';

export type RankedSearchResult = {
  id: string;
  url: string;
  title: string;
  recordKind: SearchRecordKind;
  /** Stable SDK symbol identity used to verify and preserve aggregation. */
  canonicalKey?: string;
  path: string[];
  platform?: string[];
  product?: string;
  version?: string;
  snippet?: string;
  /** Exact normalized title equality, distinct from a partial title hit. */
  titleExactMatch?: boolean;
  /** Exact equality with one of the record's normalized aliases. */
  aliasesExactMatch?: boolean;
  titleMatch: boolean;
  sectionMatch: boolean;
  contentMatch: boolean;
  allMajorTermsMatch: boolean;
  /** Whether the record content matches the classified intent. */
  intentMatch: boolean;
  currentVersion?: boolean;
  category?: 'default' | 'deprecated' | 'glossary';
};

type RankingTuple = readonly [
  exactTitleOrAlias: number,
  allMajorTerms: number,
  title: number,
  section: number,
  content: number,
  intentAndRecordKind: number,
  categoryQuality: number,
  currentVersion: number,
];

const COMPATIBLE_RECORD_KINDS: Record<
  Exclude<SearchIntent, 'unknown'>,
  ReadonlySet<SearchRecordKind>
> = {
  'api-symbol': new Set(['sdk-symbol']),
  'api-task': new Set(['rest-api', 'sdk-symbol']),
  task: new Set(['guide', 'rest-api']),
  product: new Set(['guide', 'rest-api']),
  support: new Set(['faq', 'guide', 'rest-api']),
};

const CATEGORY_QUALITY: Record<
  NonNullable<RankedSearchResult['category']>,
  number
> = {
  default: 2,
  deprecated: 1,
  glossary: 0,
};

function flag(value: boolean | undefined) {
  return value ? 1 : 0;
}

function intentAndRecordKindMatch(
  result: RankedSearchResult,
  intent: SearchIntent,
) {
  if (intent === 'unknown' || !result.intentMatch) return 0;
  return flag(COMPATIBLE_RECORD_KINDS[intent].has(result.recordKind));
}

function rankingTuple(
  result: RankedSearchResult,
  intent: SearchIntent,
): RankingTuple {
  return [
    flag(result.titleExactMatch || result.aliasesExactMatch),
    flag(result.allMajorTermsMatch),
    flag(result.titleMatch),
    flag(result.sectionMatch),
    flag(result.contentMatch),
    intentAndRecordKindMatch(result, intent),
    CATEGORY_QUALITY[result.category ?? 'default'],
    flag(result.currentVersion),
  ];
}

function compareTupleDescending(left: RankingTuple, right: RankingTuple) {
  for (let index = 0; index < left.length; index += 1) {
    const difference = right[index] - left[index];
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * Ranks already-normalized and, for SDK symbols, already-aggregated results.
 *
 * The optional limit is applied only after the complete candidate list has
 * been sorted. Source order is the final tie-breaker; cross-index Algolia
 * scores are deliberately absent from the ranking contract.
 */
export function rankSearchResults(
  results: RankedSearchResult[],
  intent: SearchIntentResult,
  limit?: number,
): RankedSearchResult[] {
  const ranked = results
    .map((result, sourceIndex) => ({
      result,
      sourceIndex,
      tuple: rankingTuple(result, intent.intent),
    }))
    .sort(
      (left, right) =>
        compareTupleDescending(left.tuple, right.tuple) ||
        left.sourceIndex - right.sourceIndex,
    )
    .map(({ result }) => result);

  if (limit === undefined) return ranked;
  return ranked.slice(0, Math.max(0, Math.floor(limit)));
}
