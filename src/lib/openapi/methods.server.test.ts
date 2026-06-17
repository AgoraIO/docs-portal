import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import { getOpenApiOperationMethod } from './methods.server';

describe('openapi methods manifest', () => {
  const lane = OPENAPI_LANES[0];

  it('returns operation methods without loading full OpenAPI documents', () => {
    expect(getOpenApiOperationMethod(lane, 'start-agent', 'en')).toBe('POST');
    expect(getOpenApiOperationMethod(lane, 'agent-interrupt', 'zh-CN')).toBe(
      'POST',
    );
  });
});
