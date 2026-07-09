import { describe, expect, it } from 'vitest';
import type { PlatformKey } from '@/lib/platforms/registry';
import { getHeaderPlatformBuckets } from './PlatformTabsGroup';

const platforms = [
  'android',
  'ios',
  'web',
  'macos',
  'flutter',
] satisfies PlatformKey[];
const tabWidths: Partial<Record<PlatformKey, number>> = {
  android: 70,
  flutter: 72,
  ios: 34,
  macos: 62,
  web: 44,
};

describe('getHeaderPlatformBuckets', () => {
  it('keeps every platform visible when measured tabs fit in the row', () => {
    expect(
      getHeaderPlatformBuckets(platforms, 'android', {
        availableWidth: 380,
        moreButtonWidth: 64,
        moreGapWidth: 16,
        tabGapWidth: 24,
        tabWidths,
      }),
    ).toEqual({
      overflowPlatforms: [],
      primaryPlatforms: platforms,
    });
  });

  it('moves only the tabs that cannot fit beside More into overflow', () => {
    expect(
      getHeaderPlatformBuckets(platforms, 'android', {
        availableWidth: 270,
        moreButtonWidth: 64,
        moreGapWidth: 16,
        tabGapWidth: 24,
        tabWidths,
      }),
    ).toEqual({
      overflowPlatforms: ['web', 'macos', 'flutter'],
      primaryPlatforms: ['android', 'ios'],
    });
  });

  it('keeps the active platform visible when it would otherwise overflow', () => {
    expect(
      getHeaderPlatformBuckets(platforms, 'flutter', {
        availableWidth: 304,
        moreButtonWidth: 64,
        moreGapWidth: 16,
        tabGapWidth: 24,
        tabWidths,
      }),
    ).toEqual({
      overflowPlatforms: ['web', 'macos'],
      primaryPlatforms: ['android', 'ios', 'flutter'],
    });
  });

  it('waits for real measurements before showing More', () => {
    expect(getHeaderPlatformBuckets(platforms, 'android')).toEqual({
      overflowPlatforms: [],
      primaryPlatforms: platforms,
    });
  });
});
