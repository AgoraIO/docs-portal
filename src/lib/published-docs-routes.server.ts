import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isKnownPlatform } from './platforms/registry';
import type { PublishedDocsRoute } from './published-docs-routes';

export const PUBLISHED_DOCS_ROUTES_MANIFEST_PATH =
  'public/__static/docs-routes.json';
export const DOCS_PRERENDER_PATHS_MANIFEST_PATH =
  'public/__static/docs-prerender-paths.json';

export async function writeStaticDocsRouteManifests({
  directory = path.dirname(PUBLISHED_DOCS_ROUTES_MANIFEST_PATH),
  machineReadableRoutes,
  prerenderRoutes,
}: {
  directory?: string;
  machineReadableRoutes: readonly PublishedDocsRoute[];
  prerenderRoutes: readonly PublishedDocsRoute[];
}) {
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(directory, path.basename(PUBLISHED_DOCS_ROUTES_MANIFEST_PATH)),
      `${JSON.stringify(machineReadableRoutes)}\n`,
    ),
    writeFile(
      path.join(directory, path.basename(DOCS_PRERENDER_PATHS_MANIFEST_PATH)),
      `${JSON.stringify(prerenderRoutes.map((route) => route.url))}\n`,
    ),
  ]);
}

export function readPublishedDocsRoutes(
  manifestPath = PUBLISHED_DOCS_ROUTES_MANIFEST_PATH,
) {
  const routes = readRequiredManifest(manifestPath, 'published docs routes');

  if (!Array.isArray(routes) || !routes.every(isPublishedDocsRoute)) {
    throw new Error(
      `Invalid published docs routes manifest at ${manifestPath}.`,
    );
  }

  return routes;
}

export function readDocsPrerenderPaths(
  manifestPath = DOCS_PRERENDER_PATHS_MANIFEST_PATH,
) {
  const paths = readRequiredManifest(manifestPath, 'docs prerender paths');
  if (
    !Array.isArray(paths) ||
    !paths.every(
      (value): value is string =>
        typeof value === 'string' && value.startsWith('/'),
    )
  ) {
    throw new Error(
      `Invalid docs prerender paths manifest at ${manifestPath}.`,
    );
  }
  return paths;
}

function readRequiredManifest(manifestPath: string, name: string): unknown {
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
        `Missing ${name} manifest at ${manifestPath}. Run docs:static-payload before the static app build.`,
      );
    }

    throw error;
  }

  return JSON.parse(value);
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
    (route.platform === undefined || isKnownPlatform(route.platform)) &&
    (route.version === undefined || typeof route.version === 'string')
  );
}
