import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video pricing doc', () => {
  it('does not reference the missing RTCMinutesCalculator component', () => {
    const content = readFileSync(
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video/reference/pricing.mdx',
      'utf8',
    );

    expect(content).not.toContain('<RTCMinutesCalculator/>');
  });
});
