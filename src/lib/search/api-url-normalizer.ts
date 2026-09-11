export function normalizeApiReferenceUrl(value: string) {
  const fragmentIndex = value.indexOf('#');
  const fragment = fragmentIndex === -1 ? '' : value.slice(fragmentIndex);
  const reference =
    fragmentIndex === -1 ? value : value.slice(0, fragmentIndex);
  const queryIndex = reference.indexOf('?');
  if (queryIndex === -1) return value;

  const prefix = reference.slice(0, queryIndex);
  const rawQuery = reference.slice(queryIndex + 1);
  const retained: string[] = [];
  let languageInsertionIndex = -1;
  let firstLanguage: string | undefined;

  for (const segment of rawQuery.split('&')) {
    const firstEntry = new URLSearchParams(segment).entries().next().value as
      | [string, string]
      | undefined;
    if (firstEntry?.[0] !== 'language') {
      retained.push(segment);
      continue;
    }

    if (languageInsertionIndex === -1) {
      languageInsertionIndex = retained.length;
    }
    firstLanguage ??= firstEntry[1]
      .split(',')
      .map((token) => token.trim())
      .find(Boolean);
  }

  if (languageInsertionIndex === -1) return value;

  if (firstLanguage) {
    retained.splice(
      languageInsertionIndex,
      0,
      new URLSearchParams({ language: firstLanguage }).toString(),
    );
  }
  const query = retained.join('&');
  return `${prefix}${query ? `?${query}` : ''}${fragment}`;
}
