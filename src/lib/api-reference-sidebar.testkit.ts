import { getNavScopeSidebarNodes } from './docs-nav-scope';
import type { DocsSidebarNode } from './docs-tree';
import { source } from './source.server';

// source.getNodeMeta wants an internal fumadocs Folder generic that doesn't
// unify with page-tree's Folder, and .data is intentionally untyped here
// until a shared getDocsMetaData util is extracted.
export function getApiReferenceNodeMeta(
  node: Parameters<typeof source.getNodeMeta>[0],
) {
  // biome-ignore lint/suspicious/noExplicitAny: see comment above
  return source.getNodeMeta(node as any, 'en')?.data as any;
}

// Builds the unified API-reference tab rail exactly as a non-scoped Reference
// page would render it (the same path docs-page.server.ts takes when navScope is null).
export function buildApiReferenceRail(): DocsSidebarNode[] {
  const root = source.getPageTree('en');
  return getNavScopeSidebarNodes({
    getNodeMeta: getApiReferenceNodeMeta,
    root,
    tab: 'api-reference',
  });
}
