export const doxygenJavadocLane = {
  id: 'doxygen-javadoc',
  filterSourceNames(sourceNames) {
    return sourceNames.filter(isMigratableDoxygenOrJavadocSource);
  },
  isNavigationSource(sourceName) {
    return !isGeneratedDoxygenIndex(sourceName);
  },
  usesSemanticRenderer: true,
};

const GENERATED_INDEX_PAGES = new Set([
  'annotated.html',
  'classes.html',
  'deprecated.html',
  'dirs.html',
  'examples.html',
  'files.html',
  'hierarchy.html',
  'modules.html',
  'namespaces.html',
  'pages.html',
]);

function isMigratableDoxygenOrJavadocSource(sourceName) {
  const basename = sourceName.split('/').at(-1) ?? sourceName;

  if (basename.endsWith('-members.html')) return false;
  if (basename.endsWith('_source.html')) return false;
  if (/^functions(?:[_-].*)?\.html$/i.test(basename)) return false;
  if (/^namespacemembers(?:[_-].*)?\.html$/i.test(basename)) return false;
  if (/^globals(?:[_-].*)?\.html$/i.test(basename)) return false;

  return true;
}

function isGeneratedDoxygenIndex(sourceName) {
  const basename = sourceName.split('/').at(-1) ?? sourceName;
  return (
    GENERATED_INDEX_PAGES.has(basename.toLowerCase()) ||
    /^dir[_-].*\.html$/i.test(basename)
  );
}
