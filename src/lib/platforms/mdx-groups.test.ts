import { describe, expect, it } from 'vitest';
import {
  createPlatformGroup,
  splitPlatformRuns,
  type SharedLeaf,
  type PlatformLeaf,
  validatePlatformGroup,
} from './mdx-groups';

describe('platform mdx groups', () => {
  it('splits non-consecutive platform blocks into separate groups', () => {
    const nodes: Array<PlatformLeaf<string> | SharedLeaf<string>> = [
      { kind: 'shared', value: 'before' },
      { kind: 'platform', mode: 'structured', platform: 'android', value: 'A' },
      {
        kind: 'platform',
        mode: 'structured',
        platform: 'web',
        value: 'B',
      },
      { kind: 'shared', value: 'middle' },
      { kind: 'platform', mode: 'inline', platform: 'android', value: 'C' },
      { kind: 'platform', mode: 'inline', platform: 'web', value: 'D' },
    ];

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
          platform: 'web',
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
          platform: 'web',
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
          platform: 'web',
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
    ).toThrow('Duplicate platform key "android" in the same group.');
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
          platform: 'web',
          value: 'B',
        },
      ]),
    ).toEqual({
      canonicalPlatform: 'web',
      mode: 'structured',
      showTabs: true,
      usedCanonicalFallback: false,
      platforms: ['flutter', 'web'],
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
          platform: 'web',
          value: 'B',
        },
      ],
    });
  });

  it('allows a single platform node and marks the group as tabless', () => {
    expect(
      createPlatformGroup([
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'web',
          value: 'A',
        },
      ]),
    ).toEqual({
      canonicalPlatform: 'web',
      mode: 'structured',
      showTabs: false,
      usedCanonicalFallback: false,
      platforms: ['web'],
      nodes: [
        {
          kind: 'platform',
          mode: 'structured',
          platform: 'web',
          value: 'A',
        },
      ],
    });
  });
});
