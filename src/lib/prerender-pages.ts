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
    paths.add(page.url);
  }

  for (const path of openApiPaths) {
    paths.add(path);
  }

  return Array.from(paths).sort();
}
