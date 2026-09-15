import { describe, expect, it } from 'vitest';
import { parseReplayArguments } from './replay-algolia-search-arguments';

describe('parseReplayArguments', () => {
  it('defaults to the strict all-case gate', () => {
    expect(parseReplayArguments(['--out=report.json'])).toEqual({
      gateMode: 'all',
      outputPath: 'report.json',
    });
  });

  it('accepts the Preview blocker gate', () => {
    expect(
      parseReplayArguments(['--gate=preview-blockers', '--out=preview.json']),
    ).toEqual({ gateMode: 'preview-blockers', outputPath: 'preview.json' });
  });

  it('rejects an unsupported gate mode', () => {
    expect(() => parseReplayArguments(['--gate=monitoring'])).toThrow(
      'Unsupported replay gate mode: monitoring',
    );
  });
});
