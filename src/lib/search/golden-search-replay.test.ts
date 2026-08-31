import { describe, expect, it, vi } from 'vitest';
import type { GoldenSearchCase } from './golden-search-queries';
import { replayGoldenSearchCases } from './golden-search-replay';

const cases = [
  {
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Quickstart',
    expectedUrl: '/en/quickstart',
    query: 'quickstart',
  },
  {
    expectedIntent: 'unknown',
    expectedKind: 'empty',
    query: 'does-not-exist',
  },
] satisfies GoldenSearchCase[];

describe('replayGoldenSearchCases', () => {
  it('evaluates supplied live results against the golden top-three contract', async () => {
    const search = vi.fn(async (query: string) =>
      query === 'quickstart'
        ? [
            {
              recordKind: 'guide',
              title: 'Voice agent Quickstart',
              url: '/en/quickstart',
            },
          ]
        : [],
    );

    const report = await replayGoldenSearchCases(cases, search);

    expect(search).toHaveBeenCalledTimes(2);
    expect(report).toMatchObject({ failed: 0, passed: 2, total: 2 });
    expect(report.cases).toEqual([
      expect.objectContaining({ passed: true, query: 'quickstart' }),
      expect.objectContaining({ passed: true, query: 'does-not-exist' }),
    ]);
  });

  it('reports the observed top three when the live target is missing', async () => {
    const report = await replayGoldenSearchCases(
      cases.slice(0, 1),
      async () => [
        {
          recordKind: 'guide',
          title: 'Unrelated guide',
          url: '/en/unrelated',
        },
      ],
    );

    expect(report).toMatchObject({ failed: 1, passed: 0, total: 1 });
    expect(report.cases[0]).toMatchObject({
      actualUrls: ['/en/unrelated'],
      expectedUrl: '/en/quickstart',
      passed: false,
    });
  });
});
