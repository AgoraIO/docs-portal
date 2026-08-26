const API_TASK_DECORATION_TERMS = new Set([
  'a',
  'an',
  'how',
  'please',
  'the',
  'to',
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

export function getRequiredApiTaskTerms(terms: string[]) {
  return terms.filter(
    (term) => !API_TASK_DECORATION_TERMS.has(term.toLowerCase()),
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

export function hasJoinedSearchAlias(
  fields: Array<string | undefined>,
  terms: string[],
) {
  const normalizedRequiredTerms = terms.flatMap(normalizedTerms);
  if (normalizedRequiredTerms.length < 2) return true;
  const joinedTerms = normalizedRequiredTerms.join('');

  return fields.some((field) => {
    if (!field) return false;
    return getRequiredApiTaskTerms(normalizedTerms(field))
      .join('')
      .includes(joinedTerms);
  });
}
