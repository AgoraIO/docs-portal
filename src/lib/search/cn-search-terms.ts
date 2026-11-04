// Meilisearch tokenizes the punctuation in C++/C# away. Use the same whole
// language terms in queries and indexed metadata; never change display text.
export function normalizeCnSearchLanguageTerms(value: string) {
  return value
    .replace(/(?<![A-Za-z0-9_])c\+\+(?![A-Za-z0-9_+])/gi, 'cplusplus')
    .replace(/(?<![A-Za-z0-9_])c#(?![A-Za-z0-9_#])/gi, 'csharp');
}

export function getCnSearchLanguageTerms(
  value: string,
  platforms: string[] = [],
) {
  const normalized = normalizeCnSearchLanguageTerms(value);
  return ['csharp', 'cplusplus'].filter(
    (term) =>
      new RegExp(`\\b${term}\\b`, 'i').test(normalized) ||
      platforms.includes(term === 'cplusplus' ? 'cpp' : term),
  );
}

/** A language name alone asks for SDK navigation, rather than a feature. */
export function getCnSearchNavigationLanguage(query: string) {
  return normalizeCnSearchLanguageTerms(query)
    .trim()
    .toLowerCase()
    .match(/^(csharp|cplusplus)(?:\s+sdk)?$/)?.[1];
}
