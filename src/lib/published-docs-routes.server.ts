import { readFileSync } from 'node:fs';
import { isKnownPlatform } from './platforms/registry';
import type { PublishedDocsRoute } from './published-docs-routes';

export const PUBLISHED_DOCS_ROUTES_MANIFEST_PATH =
  'public/__static/docs-routes.json';

export function readPublishedDocsRoutes(
  manifestPath = PUBLISHED_DOCS_ROUTES_MANIFEST_PATH,
) {
  let value: string;

  try {
    value = readFileSync(manifestPath, 'utf8');
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new Error(
        `Missing published docs routes manifest at ${manifestPath}. Run docs:static-payload before the static app build.`,
      );
    }

    throw error;
  }

  const routes = JSON.parse(value) as unknown;

  if (!Array.isArray(routes) || !routes.every(isPublishedDocsRoute)) {
    throw new Error(
      `Invalid published docs routes manifest at ${manifestPath}.`,
    );
  }

  return routes;
}

function isPublishedDocsRoute(value: unknown): value is PublishedDocsRoute {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const route = value as Partial<PublishedDocsRoute>;

  return (
    typeof route.canonicalPath === 'string' &&
    typeof route.markdownPath === 'string' &&
    typeof route.url === 'string' &&
    (route.platform === undefined || isKnownPlatform(route.platform))
  );
}
