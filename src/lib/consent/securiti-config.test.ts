import { describe, expect, it } from 'vitest';
import {
  resolveSecuritiConfig,
  SECURITI_PRODUCTION_DOMAIN_UUID,
  SECURITI_TENANT_UUID,
} from './securiti-config';

describe('resolveSecuritiConfig', () => {
  it('defaults to the shared agora.io production domain', () => {
    expect(resolveSecuritiConfig()).toEqual({
      autoBlockingUrl: `https://cdn-prod.securiti.ai/consent/auto_blocking/${SECURITI_TENANT_UUID}/${SECURITI_PRODUCTION_DOMAIN_UUID}.js`,
      domainUuid: SECURITI_PRODUCTION_DOMAIN_UUID,
    });
    expect(resolveSecuritiConfig('  ').domainUuid).toBe(
      SECURITI_PRODUCTION_DOMAIN_UUID,
    );
  });

  it('uses a per-deployment domain override', () => {
    const config = resolveSecuritiConfig(
      ' 0A1B2C3D-0000-4000-8000-123456789ABC ',
    );

    expect(config.domainUuid).toBe('0a1b2c3d-0000-4000-8000-123456789abc');
    expect(config.autoBlockingUrl).toBe(
      `https://cdn-prod.securiti.ai/consent/auto_blocking/${SECURITI_TENANT_UUID}/0a1b2c3d-0000-4000-8000-123456789abc.js`,
    );
  });

  it('fails on a malformed domain instead of shipping without consent', () => {
    expect(() => resolveSecuritiConfig('not-a-uuid')).toThrow(
      'VITE_SECURITI_DOMAIN_UUID must be a Securiti domain UUID.',
    );
    expect(() =>
      resolveSecuritiConfig('7ba04bfc-c10b-4f3a-80d5-bf9ed910b46f.js'),
    ).toThrow();
  });
});
