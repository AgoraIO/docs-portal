import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { createDocsPrerenderPaths } from './prerender-pages';
import { canonicalSource } from './source.server';

export function getDocsPrerenderPaths() {
  return createDocsPrerenderPaths({
    openApiPaths: getOpenApiPrerenderPaths(),
    pages: canonicalSource.getPages(),
  });
}
