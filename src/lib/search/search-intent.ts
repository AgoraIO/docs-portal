import {
  normalizeSearchText,
  tokenizeSearchText,
} from './search-normalization';

export type SearchIntent =
  | 'api-symbol'
  | 'api-task'
  | 'task'
  | 'support'
  | 'product'
  | 'unknown';

export type SearchIntentResult = {
  intent: SearchIntent;
  matchedPhrase?: string;
  originalQuery: string;
  normalizedQuery: string;
  terms: string[];
  majorTerms: string[];
};

/** Phrases that describe an API operation, rather than a general guide task. */
const API_TASK_PHRASES = [
  'acquire resource id',
  'cloud recording rest api',
  'query recording status',
  'renew token',
  'send streaming message',
  'start cloud recording task',
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
  'token authentication',
  'http basic authentication',
  'billing policy',
  'firewall requirements',
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
  'connect your own tts service',
  'record captions',
  'transcribe audio',
  'join a channel',
  'join multiple channels',
  'enable adaptive bitrate',
  'stream channels',
  'send a message',
  'mute remote audio',
] as const;

const PRODUCT_ALIASES = [
  'cloud recording',
  'agora cli',
  'iot sdk',
  'video sdk',
  'voice sdk',
  'real time engagement',
  'realtime engagement',
  'voice agent',
  'voice activity detection',
  'conversational ai',
  'real time transcription',
  'speech to text',
  'video calling',
  'interactive live streaming',
  'broadcast streaming',
  'flexible classroom',
] as const;

const SUPPORT_TERMS = new Set([
  'error',
  'issue',
  'failed',
  'failure',
  'problem',
]);

const DOCS_RETRIEVAL_QUERY_ALIASES = new Map([
  ['billing policy', 'billing policies'],
  ['real-time transcription', 'speech to text'],
  ['real time transcription', 'speech to text'],
]);

const API_RETRIEVAL_QUERY_ALIASES = new Map([
  ['rtcengine', 'AgoraRtcEngineKit'],
]);

const API_QUERY_MODIFIER_TERMS = new Set([
  'api',
  'class',
  'enum',
  'function',
  'interface',
  'method',
  'parameter',
  'property',
]);

function normalizeQuery(query: string) {
  return normalizeSearchText(query);
}

export function getDocsRetrievalQuery(query: string) {
  return DOCS_RETRIEVAL_QUERY_ALIASES.get(normalizeQuery(query)) ?? query;
}

export function getApiRetrievalQuery(query: string) {
  const normalizedQuery = normalizeQuery(query);
  const alias = API_RETRIEVAL_QUERY_ALIASES.get(normalizedQuery);
  if (alias) return alias;

  const identifiers = (query.match(/[A-Za-z][A-Za-z\d]*/gu) ?? []).filter(
    (token) =>
      !API_QUERY_MODIFIER_TERMS.has(token.toLowerCase()) && isApiSymbol(token),
  );
  if (identifiers.length !== 1) return query;
  const identifier = identifiers[0];
  return (
    API_RETRIEVAL_QUERY_ALIASES.get(normalizeQuery(identifier)) ?? identifier
  );
}

function queryTerms(normalizedQuery: string) {
  return normalizedQuery.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

function splitIdentifier(identifier: string) {
  return tokenizeSearchText(identifier.replace(/[^\p{L}\p{M}\p{N}]+/gu, ''));
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
  return findMatchedPhrase(normalizedQuery, phrases) !== undefined;
}

function findMatchedPhrase(
  normalizedQuery: string,
  phrases: readonly string[],
) {
  return phrases.find((phrase) => includesPhrase(normalizedQuery, phrase));
}

export function classifySearchIntent(query: string): SearchIntentResult {
  const normalizedQuery = normalizeQuery(query);
  const terms = queryTerms(normalizedQuery);
  const majorTerms = majorTermsForQuery(query.normalize('NFKC'), terms);
  const matchedApiTaskPhrase = findMatchedPhrase(
    normalizedQuery,
    API_TASK_PHRASES,
  );

  let intent: SearchIntent = 'unknown';
  let matchedPhrase: string | undefined;
  if (normalizedQuery) {
    if (isApiSymbol(query.normalize('NFKC').trim())) {
      intent = 'api-symbol';
    } else if (
      hasAnyPhrase(normalizedQuery, SUPPORT_PHRASES) ||
      (!/\(\)$/u.test(normalizedQuery) &&
        terms.some((term) => SUPPORT_TERMS.has(term)))
    ) {
      intent = 'support';
    } else if (matchedApiTaskPhrase) {
      intent = 'api-task';
      matchedPhrase = matchedApiTaskPhrase;
    } else if (hasAnyPhrase(normalizedQuery, TASK_PHRASES)) {
      intent = 'task';
    } else if (hasAnyPhrase(normalizedQuery, PRODUCT_ALIASES)) {
      intent = 'product';
    }
  }

  return {
    intent,
    ...(matchedPhrase ? { matchedPhrase } : {}),
    originalQuery: query,
    normalizedQuery,
    terms,
    majorTerms,
  };
}
