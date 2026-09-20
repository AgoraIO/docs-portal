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

  it('disambiguates duplicate slugs with stable encoded identities', () => {
    const ids = buildUniqueOpenApiAnchorIds('query-parameters', [
      'pageToken',
      'page-token',
      'cursor',
    ]);

    expect(ids).toEqual([
      'query-parameters-page-token--70_61_67_65_54_6f_6b_65_6e',
      'query-parameters-page-token--70_61_67_65_2d_74_6f_6b_65_6e',
      'query-parameters-cursor',
    ]);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[2]).toBe('query-parameters-cursor');
  });

  it('stays globally unique and stable when colliding values are reordered', () => {
    const values = ['pageToken', 'page-token', 'page-token-eg3ove'];
    const first = buildUniqueOpenApiAnchorIds('query-parameters', values);
    const reorderedValues = [...values].reverse();
    const reordered = buildUniqueOpenApiAnchorIds(
      'query-parameters',
      reorderedValues,
    );

    expect(new Set(first).size).toBe(values.length);
    expect(
      Object.fromEntries(values.map((value, index) => [value, first[index]])),
    ).toEqual(
      Object.fromEntries(
        reorderedValues.map((value, index) => [value, reordered[index]]),
      ),
    );
  });
});
