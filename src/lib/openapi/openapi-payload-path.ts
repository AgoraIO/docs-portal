import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';

export function getOpenApiPayloadAssetPath(
  lane: OpenApiLane,
  locale: AppLocale,
  operationId: string,
) {
  return `/generated/openapi/page-payloads/${locale}/${lane.id}/${operationId}.json` as const;
}
