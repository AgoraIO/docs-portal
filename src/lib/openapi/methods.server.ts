import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';
import { OPENAPI_METHODS_MANIFEST } from './openapi-methods.generated';

type OpenApiMethodManifest = Record<
  string,
  Partial<Record<AppLocale, Record<string, string>>>
>;

const manifest =
  OPENAPI_METHODS_MANIFEST as unknown as OpenApiMethodManifest;

export function getOpenApiOperationMethod(
  lane: OpenApiLane,
  operationId: string,
  locale: AppLocale,
) {
  const method = manifest[lane.id]?.[locale]?.[operationId];

  if (!method) {
    throw new Error(
      `Missing OpenAPI method manifest for lane "${lane.id}", operation "${operationId}", and locale "${locale}"`,
    );
  }

  return method;
}
