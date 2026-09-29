import { describe, expect, it } from 'vitest';
import { evaluateGoldenQuery, type GoldenQuery } from './golden-query-check';

const fixture: GoldenQuery = {
  query: 'manualSOS',
  platform: 'web',
  expectedUrl:
    '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
};

describe('evaluateGoldenQuery', () => {
  it('reports the one-based rank of the expected chapter URL', () => {
    expect(
      evaluateGoldenQuery(fixture, [
        { url: '/zh-CN/other#section' },
        { url: fixture.expectedUrl },
      ]),
    ).toEqual({
      query: 'manualSOS',
      expectedUrl: fixture.expectedUrl,
      matched: true,
      rank: 2,
    });
  });

  it('reports a failed query when the expected chapter is absent', () => {
    expect(
      evaluateGoldenQuery(fixture, [{ url: '/zh-CN/other#section' }]),
    ).toEqual({
      query: 'manualSOS',
      expectedUrl: fixture.expectedUrl,
      matched: false,
      rank: null,
    });
  });
});
