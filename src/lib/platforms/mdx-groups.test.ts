import { describe, expect, it } from 'vitest';
import {
  createPlatformGroup,
  splitPlatformRuns,
  validatePlatformGroup,
} from './mdx-groups';

describe('platform mdx groups', () => {
  it('splits non-consecutive platform blocks into separate groups', () => {
    const nodes = [
      { kind: 'shared', value: 'before' },
      { kind: 'platform', mode: 'structured', platform: 'android', value: 'A' },
      {
        kind: 'platform',
        mode: 'structured',
        platform: 'javascript',
        value: 'B',
      },
      { kind: 'shared', value: 'middle' },
      { kind: 'platform', mode: 'inline', platform: 'android', value: 'C' },
      { kind: 'platform', mode: 'inline', platform: 'javascript', value: 'D' },
    ] as const;

    expect(splitPlatformRuns(nodes)).toEqual([
      [
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'android',
          value: 'A',
        },
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'javascript',
          value: 'B',
        },
      ],
      [
        {
          kind: 'platform',
          mode: 'inline',
          platform: 'android',
          value: 'C',
        },
        {
          kind: 'platform',
          mode: 'inline',
          platform: 'javascript',
          value: 'D',
        },
      ],
    ]);
  });

  it('rejects mixed inline and structured nodes in the same consecutive run', () => {
    expect(() =>
      validatePlatformGroup([
        { kind: 'platform', mode: 'inline', platform: 'android', value: 'A' },
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'javascript',
          value: 'B',
        },
      ]),
    ).toThrow(
      'Platform groups cannot mix PlatformInline and PlatformStructured blocks.',
    );
  });

  it('rejects duplicate platforms within one group', () => {
    expect(() =>
      validatePlatformGroup([
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'android',
          value: 'A',
        },
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'android',
          value: 'B',
        },
      ]),
    ).toThrow('Platform groups cannot contain duplicate platforms.');
  });

  it('creates a validated group with canonical-platform metadata', () => {
    expect(
      createPlatformGroup([
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'flutter',
          value: 'A',
        },
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'javascript',
          value: 'B',
        },
      ]),
    ).toEqual({
      canonicalPlatform: 'javascript',
      mode: 'structured',
      usedCanonicalFallback: false,
      platforms: ['flutter', 'javascript'],
      nodes: [
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'flutter',
          value: 'A',
        },
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'javascript',
          value: 'B',
        },
      ],
    });
  });
});
