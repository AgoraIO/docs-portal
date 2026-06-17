import { buildDocsIndex } from './build-docs-index.server';
import type { DocsIndex } from './docs-index-types';

let docsIndexCache: DocsIndex | null = null;

export function getDocsIndex() {
  if (!docsIndexCache) {
    docsIndexCache = buildDocsIndex();
  }

  return docsIndexCache;
}
