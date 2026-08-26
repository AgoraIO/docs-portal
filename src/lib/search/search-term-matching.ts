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

function normalizedTerms(value: string) {
  return (
    value
      .replace(/<\/?mark(?:\s[^>]*)?>/giu, '')
      .normalize('NFKC')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

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
    ? normalizedTerms(intent.matchedPhrase)
    : intent.terms;
  return filterRequiredApiTaskTerms(intentTerms, source);
}

function canonicalSdkAlias(value: string) {
  return filterRequiredApiTaskTerms(normalizedTerms(value), 'sdk').join('');
}

export function hasExactJoinedSearchAlias(
  fields: Array<string | undefined>,
  terms: string[],
) {
  const joinedTerms = terms.flatMap(normalizedTerms).join('');
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
    .map(normalizedTerms);
  const fieldTerms = new Set(tokenizedFields.flat());
  const compactFields = tokenizedFields.map((field) => field.join(''));

  return terms.every((term) => {
    const normalizedTerm = normalizedTerms(term).join('');
    if (!normalizedTerm) return false;
    if (fieldTerms.has(normalizedTerm)) return true;
    return (
      [...normalizedTerm].length >= 4 &&
      compactFields.some((field) => field.includes(normalizedTerm))
    );
  });
}
