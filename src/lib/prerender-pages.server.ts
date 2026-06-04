import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { createDocsPrerenderPaths } from './prerender-pages';
import { source } from './source.server';

export function getDocsPrerenderPaths() {
  return createDocsPrerenderPaths({
    openApiPaths: getOpenApiPrerenderPaths(),
    pages: source.getPages(),
  });
}
