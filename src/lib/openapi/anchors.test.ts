import { describe, expect, it } from 'vitest';
import {
  buildOpenApiAnchorId,
  buildUniqueOpenApiAnchorIds,
  slugOpenApiAnchorSegment,
} from './anchors';

describe('openapi anchors', () => {
  it('slugs camel-case and dotted schema paths', () => {
    expect(slugOpenApiAnchorSegment('agentId')).toBe('agent-id');
    expect(slugOpenApiAnchorSegment('properties.llm[0].url')).toBe(
      'properties-llm-0-url',
    );
  });

  it('builds an anchor ID from a prefix and value', () => {
    expect(buildOpenApiAnchorId('request-body', 'agentId')).toBe(
      'request-body-agent-id',
    );
  });

  it('disambiguates duplicate slugs with stable hashes', () => {
    const ids = buildUniqueOpenApiAnchorIds('query-parameters', [
      'pageToken',
      'page-token',
      'cursor',
    ]);

    expect(ids).toEqual([
      'query-parameters-page-token-eg3ove',
      'query-parameters-page-token-3akh17-2',
      'query-parameters-cursor',
    ]);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[2]).toBe('query-parameters-cursor');
  });
});
