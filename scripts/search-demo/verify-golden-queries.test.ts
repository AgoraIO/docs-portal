import { describe, expect, it, vi } from 'vitest';
import type { GoldenQuery } from './golden-query-check';
import { runGoldenQueries } from './verify-golden-queries';

const fixtures: GoldenQuery[] = [
  {
    query: 'manualSOS',
    platform: 'web',
    expectedUrl:
      '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
  },
];

describe('runGoldenQueries', () => {
  it('passes platform filters through and evaluates chapter URLs', async () => {
    const searchDocs = {
      searchDocs: vi.fn(async () => ({
        results: [
          {
            id: 'section-1',
            title: 'manualSOS',
            content: 'content',
            url: fixtures[0].expectedUrl,
            headingPath: ['API', 'manualSOS'],
          },
        ],
      })),
    };

    await expect(runGoldenQueries(fixtures, searchDocs)).resolves.toEqual([
      {
        query: 'manualSOS',
        expectedUrl: fixtures[0].expectedUrl,
        matched: true,
        rank: 1,
      },
    ]);
    expect(searchDocs.searchDocs).toHaveBeenCalledWith({
      query: 'manualSOS',
      platform: ['web'],
    });
  });
});
