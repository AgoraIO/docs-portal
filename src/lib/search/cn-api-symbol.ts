// Match complete indexed symbols, independently of query casing, highlighting
// or a rendered overload suffix. Prose and partial names are not symbols.
export function normalizeCnApiSymbol(value: string): string | undefined {
  const symbol = value
    .replace(/<\/?(?:mark|em)>/gi, '')
    .replace(/`/g, '')
    .trim()
    .replace(/\s*\[\d+\/\d+\]$/, '')
    .replace(/\(\)$/, '')
    .replace(/:$/, '')
    .trim();
  if (!/^[A-Za-z_$][\w$]*$/.test(symbol)) return undefined;
  // Reference generators also emit one-word documentation headings beneath
  // members. Those headings are not evidence of an API with that name.
  if (
    /^(?:examples?|parameters?|returns?|remarks?|description|details|overloads?|methods?|properties|events?|constructors?|overview|signature|deprecated)$/i.test(
      symbol,
    )
  )
    return undefined;
  return symbol.toLowerCase();
}
