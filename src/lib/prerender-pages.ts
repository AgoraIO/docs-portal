import { isMachineReadableDocsPath } from './machine-readable-docs';

type PrerenderSourcePage = {
  url: string;
};

export function createDocsPrerenderPaths({
  openApiPaths,
  pages,
}: {
  openApiPaths: Iterable<string>;
  pages: Iterable<PrerenderSourcePage>;
}) {
  const paths = new Set<string>(['/']);

  for (const page of pages) {
    if (!isMachineReadableDocsPath(page.url)) {
      continue;
    }

    paths.add(page.url);
  }

  for (const path of openApiPaths) {
    if (!isMachineReadableDocsPath(path)) {
      continue;
    }

    paths.add(path);
  }

  return Array.from(paths).sort();
}

export function selectStaticDocsPrerenderPaths(
  paths: Iterable<string>,
  selectedPaths?: Iterable<string>,
) {
  const selection = selectedPaths ? new Set(selectedPaths) : null;

  return Array.from(paths).filter(
    (path) => path !== '/' && (!selection || selection.has(path)),
  );
}
