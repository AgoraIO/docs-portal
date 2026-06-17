import { describe, expect, it } from 'vitest';
import { getOpenApiLanes } from './lanes';
import { getOpenApiPayloadAssetPath } from './openapi-payload-path';

describe('openapi payload asset path', () => {
  it('builds a stable static payload path for an operation page', () => {
    const lane = getOpenApiLanes().find((entry) => entry.id === 'convoai');

    expect(lane).toBeTruthy();
    if (!lane) {
      throw new Error('Missing convoai lane');
    }

    expect(getOpenApiPayloadAssetPath(lane, 'en', 'start-agent')).toBe(
      '/generated/openapi/page-payloads/en/convoai/start-agent.json',
    );
  });
});
