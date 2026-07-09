export const doxygenJavadocLane = {
  id: 'doxygen-javadoc',
  filterSourceNames(sourceNames) {
    return sourceNames.filter(isMigratableDoxygenOrJavadocSource);
  },
  usesSemanticRenderer: true,
};

function isMigratableDoxygenOrJavadocSource(sourceName) {
  const basename = sourceName.split('/').at(-1) ?? sourceName;

  if (basename.endsWith('-members.html')) return false;
  if (basename.endsWith('_source.html')) return false;
  if (/^functions(?:[_-].*)?\.html$/i.test(basename)) return false;
  if (/^namespacemembers(?:[_-].*)?\.html$/i.test(basename)) return false;
  if (/^globals(?:[_-].*)?\.html$/i.test(basename)) return false;

  return true;
}
