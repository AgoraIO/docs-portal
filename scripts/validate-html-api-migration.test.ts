import { describe, expect, it } from 'vitest';
import { hasInvalidMarkdownHeading } from './validate-html-api-migration.mjs';

describe('validate-html-api-migration', () => {
  it('rejects level-7 headings outside fenced code', () => {
    expect(hasInvalidMarkdownHeading('####### `since`')).toBe(true);
    expect(hasInvalidMarkdownHeading('  ####### nested')).toBe(true);
  });

  it('allows hash-prefixed lines inside fenced code', () => {
    expect(
      hasInvalidMarkdownHeading(
        ['```shell', '####### shell comment', '```'].join('\n'),
      ),
    ).toBe(false);
    expect(
      hasInvalidMarkdownHeading(
        ['  ~~~~text', '  ####### example', '  ~~~~'].join('\n'),
      ),
    ).toBe(false);
  });
});
