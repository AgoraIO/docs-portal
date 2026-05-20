import { buildDocPath, getSourceSlugsFromContentPath } from './docs-routing';

export type NormalizedDocsHrefKind =
  | 'external'
  | 'hash'
  | 'internal-doc'
  | 'relative-asset'
  | 'root'
  | 'unknown';

export type NormalizedDocsHref = {
  href: string;
  kind: NormalizedDocsHrefKind;
};

export function normalizeDocsHref(
  href: string,
  context: { contentPath?: string } = {},
): NormalizedDocsHref {
  if (!href) {
    return { href, kind: 'unknown' };
  }

  if (href.startsWith('#')) {
    return { href, kind: 'hash' };
  }

  if (href.startsWith('/')) {
    return { href, kind: href.startsWith('//') ? 'external' : 'root' };
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return { href, kind: 'external' };
  }

  const parsed = splitHref(href);

  if (!/\.mdx?$/i.test(parsed.path)) {
    return { href, kind: 'relative-asset' };
  }

  if (!context.contentPath) {
    return { href, kind: 'unknown' };
  }

  const targetContentPath = resolveRelativePath(
    dirname(context.contentPath),
    parsed.path,
  );
  const [locale] = targetContentPath.split('/').filter(Boolean);
  const sourceSlugs = getSourceSlugsFromContentPath(targetContentPath);
  const [tab, ...slugSegments] = sourceSlugs;

  if (!locale || !tab) {
    return { href, kind: 'unknown' };
  }

  return {
    href: `${buildDocPath(locale, tab, slugSegments)}${parsed.search}${parsed.hash}`,
    kind: 'internal-doc',
  };
}

function splitHref(href: string) {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
  const searchIndex = beforeHash.indexOf('?');

  if (searchIndex === -1) {
    return { path: beforeHash, search: '', hash };
  }

  return {
    path: beforeHash.slice(0, searchIndex),
    search: beforeHash.slice(searchIndex),
    hash,
  };
}

function dirname(path: string) {
  const segments = path.split('/').filter(Boolean);
  segments.pop();
  return segments.join('/');
}

function resolveRelativePath(baseDir: string, relativePath: string) {
  const segments = [...baseDir.split('/'), ...relativePath.split('/')];
  const normalized: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      normalized.pop();
      continue;
    }

    normalized.push(segment);
  }

  return normalized.join('/');
}
