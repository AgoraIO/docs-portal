import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';
import { OPENAPI_ROUTE_MANIFEST } from './openapi-route-manifest.generated';

type OpenApiRouteManifest = Record<
  string,
  Partial<
    Record<
      AppLocale,
      Record<
        string,
        {
          deprecated?: boolean;
          description?: string;
          method: string;
          path: string;
          routeLeaf: string;
          title: string;
        }
      >
    >
  >
>;

const manifest = OPENAPI_ROUTE_MANIFEST as unknown as OpenApiRouteManifest;

export function getOpenApiRouteManifestEntry(
  lane: OpenApiLane,
  locale: AppLocale,
) {
  const entry = manifest[lane.id]?.[locale];

  if (!entry) {
    throw new Error(
      `Missing OpenAPI route manifest for lane "${lane.id}" and locale "${locale}"`,
    );
  }

  return entry;
}
