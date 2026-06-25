export type DocsLayoutMode = 'docs' | 'full-page' | 'openapi';

export function isWideDocsLayout(layoutMode: DocsLayoutMode) {
  return layoutMode !== 'docs';
}
