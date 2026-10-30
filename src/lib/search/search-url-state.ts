// Preserve URL values rather than coercing arbitrary business parameters into
// JSON. A repeated key and one JSON-array string are different URL parameters.
export function parseDocsSearch(search: string) {
  const parsed: Record<string, string | string[]> = Object.create(null);
  for (const [key, value] of new URLSearchParams(search)) {
    const previous = parsed[key];
    parsed[key] =
      previous === undefined
        ? value
        : [...(Array.isArray(previous) ? previous : [previous]), value];
  }
  if (typeof parsed.q === 'string') parsed.q = decodeSearchQueryText(parsed.q);
  return parsed;
}

// Existing router-generated search links may contain JSON-quoted search text.
// Keep this compatibility limited to q, with a symmetric encoder below.
export function decodeSearchQueryText(value: string): string {
  try {
    const decoded: unknown = JSON.parse(value);
    return typeof decoded === 'string' ? decoded : value;
  } catch {
    return value;
  }
}

export function stringifyDocsSearch(search: Record<string, unknown>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      let encoded =
        typeof item === 'object' && item !== null
          ? JSON.stringify(item)
          : String(item);
      if (key === 'q' && typeof value === 'string') {
        try {
          JSON.parse(value);
          encoded = JSON.stringify(value);
        } catch {
          // Ordinary search text needs no JSON quoting.
        }
      }
      params.append(key, encoded);
    }
  }
  return params.size ? `?${params}` : '';
}
