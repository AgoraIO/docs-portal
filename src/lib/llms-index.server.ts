import { llms } from 'fumadocs-core/source';
import { createMachineReadableDocsIndexes } from './llms-index';
import { MACHINE_READABLE_LOCALE } from './machine-readable-docs';
import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { getContentDocsPrerenderPaths } from './prerender-content-routes';
import { createPublishedDocsRoutes } from './published-docs-routes';
import { readPublishedDocsRoutes } from './published-docs-routes.server';
import { getSitemapBaseUrl } from './sitemap';

let indexesPromise:
  | ReturnType<typeof createRuntimeMachineReadableDocsIndexes>
  | undefined;

export function getRuntimeMachineReadableDocsIndexes() {
  indexesPromise ??= createRuntimeMachineReadableDocsIndexes();
  return indexesPromise;
}

async function createRuntimeMachineReadableDocsIndexes() {
  const { source } = await import('./source');
  const publishedRoutes = getRuntimePublishedDocsRoutes();

  return createMachineReadableDocsIndexes({
    baseUrl: getSitemapBaseUrl(),
    docsIndex: llms(source).index(MACHINE_READABLE_LOCALE),
    publishedRoutes,
  });
}

function getRuntimePublishedDocsRoutes() {
  try {
    return readPublishedDocsRoutes();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('Missing published docs routes manifest')
    ) {
      return createPublishedDocsRoutes({
        canonicalPaths: [
          ...getContentDocsPrerenderPaths(),
          ...getOpenApiPrerenderPaths(),
        ],
        platformPages: [],
      });
    }

    throw error;
  }
}
