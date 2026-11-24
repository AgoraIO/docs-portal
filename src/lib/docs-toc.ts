/** Display limits only; headings, anchors and search metadata remain intact. */
export function resolveDocsTocMaxDepth(
  data: unknown,
  apiReference: boolean,
  toc: readonly { depth: number }[] = [],
) {
  if (!data || typeof data !== 'object') return undefined;
  if ('tocMaxDepth' in data && typeof data.tocMaxDepth === 'number') {
    const depth = data.tocMaxDepth;
    if (Number.isInteger(depth) && depth >= 1 && depth <= 6) return depth;
  }
  if (!apiReference || !('_migration' in data)) return undefined;
  const migration = data._migration;
  if (
    !migration ||
    typeof migration !== 'object' ||
    !('generator' in migration)
  )
    return undefined;
  // Oxygen uses h2 for APIs in collection pages and h3 for members in
  // class-only pages. Keep that first member level in either document shape.
  if (migration.generator === 'oxygen') {
    return toc.some((heading) => heading.depth === 2) ? 2 : 3;
  }
  // These generators put member details one level below their member headings.
  const depths: Record<string, number> = {
    appledoc: 3,
    doxygen: 3,
    dita: 3,
    javadoc: 3,
    typedoc: 3,
    'dita-ot': 2,
  };
  return typeof migration.generator === 'string'
    ? depths[migration.generator]
    : undefined;
}

export function filterDocsToc<T extends { depth: number }>(
  items: T[],
  maxDepth?: number,
): T[] {
  return maxDepth === undefined
    ? items
    : items.filter((item) => item.depth <= maxDepth);
}

/** Read the title separately from the heading copy button's announcement. */
export function getDocsHeadingTitle(heading: HTMLElement) {
  const label = heading
    .getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .map((id) => heading.ownerDocument.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(' ');
  const headingLabel =
    heading.querySelector(':scope > a[data-card]') ?? heading;
  return label || headingLabel.textContent?.trim() || '';
}
