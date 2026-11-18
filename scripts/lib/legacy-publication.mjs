// Mirror the old site's _processFile/_processFolder rules for page entrypoints.
// Shared fragments may still be expanded inside an eligible page.
export function isUnpublishedLegacySource(sourcePath) {
  const segments = sourcePath.replaceAll('\\', '/').split('/');
  return (
    ['docs', 'docs-api-reference'].includes(segments[0]) &&
    /\.mdx?$/.test(segments.at(-1) ?? '') &&
    segments.slice(1).some((segment) => segment.startsWith('_'))
  );
}
