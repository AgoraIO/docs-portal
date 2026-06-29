import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pricingMdx = resolve(
  process.cwd(),
  'content/docs/en/realtime-media/voice/reference/pricing.mdx',
);
const pricingMd = resolve(
  process.cwd(),
  'content/docs/en/realtime-media/voice/reference/pricing.md',
);

describe('voice pricing doc', () => {
  it('uses mdx for interactive FAQ accordions and includes the RTC minutes calculator', () => {
    expect(existsSync(pricingMdx)).toBe(true);
    expect(existsSync(pricingMd)).toBe(false);

    const content = readFileSync(pricingMdx, 'utf8');

    expect(content).toContain('<Accordions>');
    expect(content).toContain(
      '<Accordion title="If I purchase a paid package, do I still get 10,000 free minutes each month?">',
    );
    expect(content).toContain('<RTCMinutesCalculator/>');
  });
});
