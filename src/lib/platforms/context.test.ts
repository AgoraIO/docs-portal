import { describe, expect, it } from 'vitest';
import { resolvePlatformContext } from './context';

describe('resolvePlatformContext', () => {
  it('uses the URL-selected platform before the page default', () => {
    expect(
      resolvePlatformContext({
        availablePlatforms: ['android', 'windows'],
        defaultPlatform: 'android',
        requestedPlatform: 'windows',
      }),
    ).toMatchObject({
      selectedPlatform: 'windows',
      titlePlatforms: ['windows'],
    });
  });

  it('promotes a structured page default when no platform is selected', () => {
    expect(
      resolvePlatformContext({
        availablePlatforms: ['android', 'ios'],
        defaultPlatform: 'android',
      }),
    ).toMatchObject({
      selectedPlatform: 'android',
      titlePlatforms: ['android'],
    });
  });

  it('keeps explicit title platforms ahead of inferred platform state', () => {
    expect(
      resolvePlatformContext({
        availablePlatforms: ['android', 'web'],
        defaultPlatform: 'android',
        explicitTitlePlatforms: ['web'],
      }),
    ).toMatchObject({
      selectedPlatform: 'android',
      titlePlatforms: ['web'],
    });
  });

  it('lets a URL-selected platform override a stale explicit badge', () => {
    expect(
      resolvePlatformContext({
        availablePlatforms: ['android', 'windows'],
        explicitTitlePlatforms: ['android'],
        requestedPlatform: 'windows',
      }),
    ).toMatchObject({
      selectedPlatform: 'windows',
      titlePlatforms: ['windows'],
    });
  });

  it('uses a single path platform when no structured group is available', () => {
    expect(
      resolvePlatformContext({
        pathPlatforms: ['rtc', 'android', 'overview'],
      }),
    ).toMatchObject({
      selectedPlatform: 'android',
      titlePlatforms: ['android'],
    });
  });

  it('drops unknown and non-platform values from the result', () => {
    expect(
      resolvePlatformContext({
        availablePlatforms: ['android', 'unknown' as never],
        explicitTitlePlatforms: ['restful', 'windows', 'unknown'],
      }),
    ).toMatchObject({
      availablePlatforms: ['android'],
      titlePlatforms: ['windows'],
    });
  });
});
