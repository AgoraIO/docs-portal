import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('voice pricing doc', () => {
  it('uses mdx for interactive FAQ accordions and includes the RTC minutes calculator', () => {
    expect(
      existsSync(
        '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/voice/reference/pricing.mdx',
      ),
    ).toBe(true);
    expect(
      existsSync(
        '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/voice/reference/pricing.md',
      ),
    ).toBe(false);

    const content = readFileSync(
      '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/voice/reference/pricing.mdx',
      'utf8',
    );

    expect(content).toContain('<Accordions>');
    expect(content).toContain(
      '<Accordion title="If I purchase a paid package, do I still get 10,000 free minutes each month?">',
    );
    expect(content).toContain('<RTCMinutesCalculator/>');
  });
});
