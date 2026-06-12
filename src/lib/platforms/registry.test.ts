import { describe, expect, it } from 'vitest';
import {
  PLATFORM_CANONICAL_PRIORITY,
  PLATFORM_PREFERENCE_STORAGE_KEY,
  getCanonicalPlatform,
  getPlatformLabel,
  isKnownPlatform,
} from './registry';

describe('platform registry', () => {
  it('exposes a stable canonical priority order', () => {
    expect(PLATFORM_CANONICAL_PRIORITY).toEqual([
      'javascript',
      'android',
      'ios',
      'flutter',
      'react-native',
    ]);
  });

  it('resolves canonical platform by priority, not declaration order', () => {
    expect(getCanonicalPlatform(['ios', 'android'])).toEqual({
      platform: 'android',
      usedFallback: false,
    });
    expect(getCanonicalPlatform(['flutter', 'javascript'])).toEqual({
      platform: 'javascript',
      usedFallback: false,
    });
  });

  it('falls back to the first available platform when no canonical priority matches', () => {
    expect(getCanonicalPlatform(['unity', 'web'])).toEqual({
      platform: 'unity',
      usedFallback: true,
    });
  });

  it('recognizes only registered platform keys', () => {
    expect(isKnownPlatform('android')).toBe(true);
    expect(isKnownPlatform('js')).toBe(false);
  });

  it('returns locale-specific labels from the registry', () => {
    expect(getPlatformLabel('javascript', 'en')).toBe('JavaScript');
    expect(getPlatformLabel('javascript', 'zh-CN')).toBe('JavaScript');
    expect(getPlatformLabel('ios', 'en')).toBe('iOS');
  });

  it('uses a namespaced storage key', () => {
    expect(PLATFORM_PREFERENCE_STORAGE_KEY).toBe('docs-portal:platform:v1');
  });
});
