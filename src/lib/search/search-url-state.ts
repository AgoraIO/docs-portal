import { defaultParseSearch } from '@tanstack/react-router';

// TanStack parses JSON literals in query parameters. Search text must also
// accept an ordinary external link such as ?q=110, without losing its spelling.
// Keep the default parser for router-generated, JSON-quoted string links.
export function parseDocsSearch(search: string) {
  const parsed: Record<string, unknown> = defaultParseSearch(search);
  const queries = new URLSearchParams(search).getAll('q');
  if (queries.length === 1 && typeof parsed.q !== 'string') {
    parsed.q = queries[0];
  }
  return parsed;
}
