const COMMON_API_TASK_DECORATION_TERMS = new Set([
  'a',
  'an',
  'can',
  'could',
  'do',
  'how',
  'i',
  'me',
  'my',
  'need',
  'our',
  'please',
  'show',
  'tell',
  'the',
  'to',
  'want',
  'we',
  'would',
  'you',
]);

const SDK_SOURCE_TERMS = new Set([
  'api',
  'class',
  'enum',
  'function',
  'interface',
  'method',
  'parameter',
  'property',
  'rest',
  'restful',
]);

function filterRequiredApiTaskTerms(terms: string[], source: 'docs' | 'sdk') {
  return terms.filter((term) => {
    const normalizedTerm = term.toLowerCase();
    return (
      !COMMON_API_TASK_DECORATION_TERMS.has(normalizedTerm) &&
      (source !== 'sdk' || !SDK_SOURCE_TERMS.has(normalizedTerm))
    );
  });
}

export function getRequiredApiTaskTerms(
  intent: { matchedPhrase?: string; terms: string[] },
  { source }: { source: 'docs' | 'sdk' },
) {
  const intentTerms = intent.matchedPhrase
    ? tokenizeSearchText(intent.matchedPhrase)
    : intent.terms;
  return filterRequiredApiTaskTerms(intentTerms, source);
}

function canonicalSdkAlias(value: string) {
  return filterRequiredApiTaskTerms(tokenizeSearchText(value), 'sdk').join('');
}

export function hasExactJoinedSearchAlias(
  fields: Array<string | undefined>,
  terms: string[],
) {
  const joinedTerms = terms.flatMap(tokenizeSearchText).join('');
  return (
    joinedTerms.length > 0 &&
    fields.some((field) => field && canonicalSdkAlias(field) === joinedTerms)
  );
}

export function allSearchTermsMatch(
  fields: Array<string | undefined>,
  terms: string[],
) {
  if (terms.length === 0) return false;
  const tokenizedFields = fields
    .filter((field): field is string => Boolean(field))
    .map(tokenizeSearchText);
  const fieldTerms = new Set(tokenizedFields.flat());
  const compactFields = tokenizedFields.map((field) => field.join(''));

  return terms.every((term) => {
    const normalizedTerm = tokenizeSearchText(term).join('');
    if (!normalizedTerm) return false;
    if (fieldTerms.has(normalizedTerm)) return true;
    return (
      [...normalizedTerm].length >= 4 &&
      compactFields.some((field) => field.includes(normalizedTerm))
    );
  });
}

import { tokenizeSearchText } from './search-normalization';
