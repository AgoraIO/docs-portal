import { describe, expect, it } from 'vitest';
import { compareQuality, pageRank } from './top-query-quality.mjs';

describe('top-query search acceptance', () => {
  it('counts repeated section hits as one page card', () => {
    expect(
      pageRank(
        [{ url: '/a#one' }, { url: '/a#two' }, { url: '/b#method' }],
        ['/b'],
      ),
    ).toBe(2);
  });

  it('does not let an improved query cancel another query losing its target', () => {
    expect(
      compareQuality(
        [
          { id: 'lost', status: 'ok', rank: 2, totalHits: 20 },
          { id: 'better', status: 'ok', rank: 5, totalHits: 20 },
        ],
        [
          { id: 'lost', status: 'ok', rank: null, totalHits: 20 },
          { id: 'better', status: 'ok', rank: 1, totalHits: 20 },
        ],
      ),
    ).toEqual([{ id: 'lost', reason: 'target-lost', before: 2, after: null }]);
  });

  it('fails closed for missing cases and request failures', () => {
    expect(
      compareQuality(
        [
          { id: 'missing', status: 'ok', rank: null, totalHits: 5 },
          { id: 'failed', status: 'ok', rank: null, totalHits: 5 },
        ],
        [{ id: 'failed', status: 'error', rank: null, totalHits: 0 }],
      ),
    ).toEqual([
      { id: 'missing', reason: 'case-missing' },
      { id: 'failed', reason: 'request-error' },
    ]);
  });

  it('detects rank drops and new zero-result queries even without a known target', () => {
    expect(
      compareQuality(
        [
          { id: 'rank', status: 'ok', rank: 1, totalHits: 5 },
          { id: 'zero', status: 'ok', rank: null, totalHits: 5 },
        ],
        [
          { id: 'rank', status: 'ok', rank: 3, totalHits: 5 },
          { id: 'zero', status: 'ok', rank: null, totalHits: 0 },
        ],
      ),
    ).toEqual([
      { id: 'rank', reason: 'rank-dropped', before: 1, after: 3 },
      { id: 'zero', reason: 'new-zero-results' },
    ]);
  });

  it('detects an entire result family being squeezed out of the first batch', () => {
    expect(
      compareQuality(
        [
          {
            id: 'beauty',
            status: 'ok',
            rank: 1,
            totalHits: 30,
            familyCounts: { docs: 5, api: 5, faq: 3 },
          },
        ],
        [
          {
            id: 'beauty',
            status: 'ok',
            rank: 1,
            totalHits: 90,
            familyCounts: { docs: 9, api: 0, faq: 1 },
          },
        ],
      ),
    ).toEqual([{ id: 'beauty', reason: 'family-lost', family: 'api' }]);
  });
});
