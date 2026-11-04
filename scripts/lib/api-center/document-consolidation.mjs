import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { documents } = JSON.parse(
  readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../docs/migration/cn-document-ownership.json',
    ),
    'utf8',
  ),
);

function routeFor(source) {
  return `/${source
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')}`;
}

function normalizePath(value) {
  return decodeURIComponent(new URL(value, 'https://doc.shengwang.cn').pathname)
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
}

const bySource = new Map(documents.map((doc) => [doc.supersededSource, doc]));
const byRoute = new Map();
for (const doc of documents) {
  byRoute.set(routeFor(doc.supersededSource), doc);
  for (const url of doc.legacyUrls) byRoute.set(normalizePath(url), doc);
}

export function consolidatedSourceTarget(source) {
  const doc = bySource.get(source);
  return doc
    ? {
        targetPath: doc.canonicalSource,
        targetRoute: routeFor(doc.canonicalSource),
      }
    : null;
}

// Build/migration ownership only. Deliberately not used by runtime routing.
export function consolidatedLegacyTarget(value) {
  let path;
  try {
    path = normalizePath(value);
  } catch {
    return null;
  }
  const doc = byRoute.get(path);
  return doc ? consolidatedSourceTarget(doc.supersededSource) : null;
}
