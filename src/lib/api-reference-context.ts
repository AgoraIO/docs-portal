export type ApiReferenceLink = { href: string; title: string };

const TRAIL_PARAM = 'apiTrail';
const MAX_TRAIL_LENGTH = 8;
const MAX_TRAIL_CHARS = 6000;

export function isApiReferencePath(path: string) {
  return path.startsWith('/zh-CN/api-reference/');
}

export function readApiReferenceTrail(url: URL): ApiReferenceLink[] {
  const raw = url.searchParams.get(TRAIL_PARAM);
  if (!isApiReferencePath(url.pathname) || !raw || raw.length > MAX_TRAIL_CHARS)
    return [];
  try {
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length > MAX_TRAIL_LENGTH) return [];
    const result: ApiReferenceLink[] = [];
    for (const entry of entries) {
      if (
        !entry ||
        typeof entry.href !== 'string' ||
        typeof entry.title !== 'string' ||
        !entry.title.trim() ||
        entry.title.length > 200 ||
        !entry.href.startsWith('/') ||
        entry.href.startsWith('//')
      )
        return [];
      const source = new URL(entry.href, url);
      if (source.origin !== url.origin || !isApiReferencePath(source.pathname))
        return [];
      result.push({
        href: withoutApiReferenceTrail(source),
        title: entry.title,
      });
    }
    return result;
  } catch {
    return [];
  }
}

export function withoutApiReferenceTrail(url: URL) {
  const clean = new URL(url);
  clean.searchParams.delete(TRAIL_PARAM);
  return `${clean.pathname}${clean.search}${clean.hash}`;
}

export function withApiReferenceTrail(
  href: string,
  trail: ApiReferenceLink[],
  origin: string,
) {
  const target = new URL(href, origin);
  target.searchParams.delete(TRAIL_PARAM);
  const bounded = trail.slice(-MAX_TRAIL_LENGTH);
  while (encodeURIComponent(JSON.stringify(bounded)).length > MAX_TRAIL_CHARS)
    bounded.shift();
  if (bounded.length)
    target.searchParams.set(TRAIL_PARAM, JSON.stringify(bounded));
  return `${target.pathname}${target.search}${target.hash}`;
}

export function appendApiReferenceTrail(
  href: string,
  source: URL,
  title: string,
) {
  const target = new URL(href, source);
  if (
    target.origin !== source.origin ||
    !isApiReferencePath(source.pathname) ||
    !isApiReferencePath(target.pathname) ||
    source.pathname === target.pathname
  )
    return href;
  const trail = [
    ...readApiReferenceTrail(source),
    { href: withoutApiReferenceTrail(source), title: title.slice(0, 200) },
  ];
  const cycle = trail.findIndex(
    (item) => new URL(item.href, source).pathname === target.pathname,
  );
  return withApiReferenceTrail(
    href,
    cycle < 0 ? trail : trail.slice(0, cycle),
    source.origin,
  );
}
