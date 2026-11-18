// docs.agora.io shares the agora.io Securiti consent domain, so a visitor's choice on
// www.agora.io also applies here. VITE_SECURITI_DOMAIN_UUID lets a deployment on another host
// name its own Securiti domain; an invalid value fails the build instead of shipping no banner.

export const SECURITI_TENANT_UUID = 'b373a629-85bf-440d-824a-a86fc32ae3e9';
export const SECURITI_PRODUCTION_DOMAIN_UUID =
  '7ba04bfc-c10b-4f3a-80d5-bf9ed910b46f';
export const SECURITI_SDK_LOADER_URL =
  'https://cdn-prod.securiti.ai/consent/cookie-consent-sdk-loader.js';
export const SECURITI_BACKEND_URL = 'https://app.securiti.ai';
export const CONSENT_BRIDGE_PATH = '/js/consent-bridge.js';

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

export type SecuritiConfig = {
  autoBlockingUrl: string;
  domainUuid: string;
};

export function resolveSecuritiConfig(domainUuid?: string): SecuritiConfig {
  const configured = domainUuid?.trim().toLowerCase() || undefined;

  if (configured && !UUID_PATTERN.test(configured)) {
    throw new Error(
      'VITE_SECURITI_DOMAIN_UUID must be a Securiti domain UUID.',
    );
  }

  const resolved = configured ?? SECURITI_PRODUCTION_DOMAIN_UUID;

  return {
    autoBlockingUrl: `https://cdn-prod.securiti.ai/consent/auto_blocking/${SECURITI_TENANT_UUID}/${resolved}.js`,
    domainUuid: resolved,
  };
}
