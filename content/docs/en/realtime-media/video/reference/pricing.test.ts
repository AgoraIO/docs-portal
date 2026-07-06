import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const englishRtcPricingPages = [
  'content/docs/en/realtime-media/video/reference/pricing.mdx',
  'content/docs/en/realtime-media/voice/reference/pricing.mdx',
  'content/docs/en/realtime-media/broadcast-streaming/reference/pricing.mdx',
  'content/docs/en/realtime-media/interactive-live-streaming/reference/pricing.mdx',
];

function readDocsFile(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

function getStandardMinutesCalculatorSection(content: string) {
  const start = content.indexOf('### Standard minutes calculator');
  const end = content.indexOf('### FAQs', start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return content.slice(start, end);
}

describe('video pricing doc', () => {
  it('includes the RTC minutes calculator in the standard minutes section', () => {
    const content = readDocsFile(englishRtcPricingPages[0]);
    const calculatorSection = getStandardMinutesCalculatorSection(content);

    expect(calculatorSection).toContain('#### Standard Minutes Calculator');
    expect(calculatorSection).toContain('<RTCMinutesCalculator/>');
  });

  it('keeps English RTC pricing pages wired to the shared calculator', () => {
    for (const page of englishRtcPricingPages) {
      expect(readDocsFile(page), page).toContain('<RTCMinutesCalculator/>');
    }
  });
});
