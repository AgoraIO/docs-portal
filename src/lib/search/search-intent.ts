export type SearchIntent =
  | 'api-symbol'
  | 'api-task'
  | 'task'
  | 'support'
  | 'product'
  | 'unknown';

export type SearchIntentResult = {
  intent: SearchIntent;
  originalQuery: string;
  normalizedQuery: string;
  terms: string[];
  majorTerms: string[];
};

/** Phrases that describe an API operation, rather than a general guide task. */
const API_TASK_PHRASES = [
  'acquire resource id',
  'query recording status',
  'renew token',
  'get token',
  'refresh token',
] as const;

const SUPPORT_PHRASES = [
  'black screen',
  'error code',
  'not working',
  'unable to',
  'cannot',
  'troubleshoot',
  'bluetooth',
] as const;

const TASK_PHRASES = [
  'voice agent quickstart',
  'screen sharing',
  'getting started',
  'how to',
  'quickstart',
  'quick start',
  'set up',
  'setup',
  'configure',
  'configuration',
  'build',
  'start',
] as const;

const PRODUCT_ALIASES = [
  'cloud recording',
  'agora cli',
  'iot sdk',
  'video sdk',
  'voice sdk',
  'real time engagement',
  'realtime engagement',
] as const;

const SUPPORT_TERMS = new Set([
  'error',
  'issue',
  'failed',
  'failure',
  'problem',
]);

function normalizeQuery(query: string) {
  return query.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
}

function queryTerms(normalizedQuery: string) {
  return normalizedQuery.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

function splitIdentifier(identifier: string) {
  return identifier
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/\s+/u)
    .filter(Boolean)
    .map((term) => term.toLowerCase());
}

function majorTermsForQuery(query: string, terms: string[]) {
  const rawTokens = query.match(/[^\s]+/gu) ?? [];
  if (rawTokens.length === 1) {
    return splitIdentifier(rawTokens[0]);
  }

  const majorTerms = [...terms];
  if (terms.length > 1) {
    majorTerms.push(terms.join(''));
  }
  return majorTerms;
}

function includesPhrase(normalizedQuery: string, phrase: string) {
  const phraseTerms = phrase.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  if (phraseTerms.length === 0) return false;
  const escapedPhrase = phraseTerms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('[^\\p{L}\\p{M}\\p{N}]+');
  return new RegExp(
    `(?:^|[^\\p{L}\\p{M}\\p{N}])${escapedPhrase}(?:$|[^\\p{L}\\p{M}\\p{N}])`,
    'u',
  ).test(normalizedQuery);
}

function isApiSymbol(query: string) {
  // A symbol is a single identifier. Spaces make the query natural language,
  // even when one of its words happens to contain an uppercase letter.
  if (/\s/u.test(query)) return false;

  const compact = query.replace(/\s+/gu, '');
  if (!compact || compact.length < 2) return false;

  const identifier = compact.replace(/\(\)$/u, '');
  const hasCamelBoundary = /[a-z][A-Z]/u.test(identifier);
  const hasPascalBoundary =
    /[a-z]/u.test(identifier) && /[A-Z].*[A-Z]/u.test(identifier);
  const isIdentifier = /^[A-Za-z][A-Za-z\d]*$/u.test(identifier);
  const isDelimitedIdentifier =
    /^[A-Za-z][A-Za-z\d]*(?:(?:\.|::|->)[A-Za-z][A-Za-z\d]*)+$/u.test(
      identifier,
    );
  const hasCallSyntax = compact.endsWith('()');
  const hasApiPunctuation =
    (hasCallSyntax ? isIdentifier : isDelimitedIdentifier) &&
    (hasCamelBoundary || hasPascalBoundary);

  return hasApiPunctuation || hasCamelBoundary || hasPascalBoundary;
}

function hasAnyPhrase(normalizedQuery: string, phrases: readonly string[]) {
  return phrases.some((phrase) => includesPhrase(normalizedQuery, phrase));
}

export function classifySearchIntent(query: string): SearchIntentResult {
  const normalizedQuery = normalizeQuery(query);
  const terms = queryTerms(normalizedQuery);
  const majorTerms = majorTermsForQuery(query.normalize('NFKC'), terms);

  let intent: SearchIntent = 'unknown';
  if (normalizedQuery) {
    if (isApiSymbol(query.normalize('NFKC').trim())) {
      intent = 'api-symbol';
    } else if (hasAnyPhrase(normalizedQuery, API_TASK_PHRASES)) {
      intent = 'api-task';
    } else if (
      hasAnyPhrase(normalizedQuery, SUPPORT_PHRASES) ||
      (!/\(\)$/u.test(normalizedQuery) &&
        terms.some((term) => SUPPORT_TERMS.has(term)))
    ) {
      intent = 'support';
    } else if (hasAnyPhrase(normalizedQuery, TASK_PHRASES)) {
      intent = 'task';
    } else if (hasAnyPhrase(normalizedQuery, PRODUCT_ALIASES)) {
      intent = 'product';
    }
  }

  return {
    intent,
    originalQuery: query,
    normalizedQuery,
    terms,
    majorTerms,
  };
}
