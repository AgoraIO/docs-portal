import { expect, it } from 'vitest';
import { contrast } from '../../../scripts/check-code-contrast';
import { codePalettes } from './theme';

it('uses the WCAG luminance reference values', () => {
  expect(contrast('#000000', '#ffffff')).toBe(21);
  expect(contrast('#ffffff', '#ffffff')).toBe(1);
});
it('keeps syntax, comments and line-number colors readable on every code surface', () => {
  for (const palette of Object.values(codePalettes)) {
    for (const token of [
      'text',
      'comment',
      'keyword',
      'string',
      'function',
      'number',
      'punctuation',
    ] as const) {
      for (const surface of [
        'background',
        'header',
        'highlight',
        'added',
        'removed',
      ] as const) {
        expect(
          contrast(palette[token], palette[surface]),
          `${token} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});
