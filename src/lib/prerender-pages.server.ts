import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { getDocsIndex } from './docs-static/docs-index.server';
import { createDocsPrerenderPaths } from './prerender-pages';

export function getDocsPrerenderPaths() {
  return createDocsPrerenderPaths({
    openApiPaths: getOpenApiPrerenderPaths(),
    pages: getDocsIndex().pages.map((page) => ({
      url: page.routePath,
    })),
  });
}
