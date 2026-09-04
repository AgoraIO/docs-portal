import { describe, expect, it } from 'vitest';
import { GLOBAL_GOLDEN_SEARCH_CASES } from './golden-search-queries';

describe('Global search golden query metadata', () => {
  it('keeps 54 cases and marks exactly the four review regressions as Preview blockers', () => {
    expect(GLOBAL_GOLDEN_SEARCH_CASES).toHaveLength(54);
    expect(
      GLOBAL_GOLDEN_SEARCH_CASES.filter(({ previewBlocking }) =>
        Boolean(previewBlocking),
      ).map(({ query }) => query),
    ).toEqual([
      'joinChannel method',
      'setAudioProfile method',
      'RtcEngine class',
      'renewToken api',
    ]);
  });
});
