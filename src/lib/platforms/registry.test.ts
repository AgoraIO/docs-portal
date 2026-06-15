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
      'web',
      'javascript',
      'android',
      'ios',
      'macos',
      'windows',
      'electron',
      'flutter',
      'react-native',
      'react-js',
      'unity',
      'unreal',
      'blueprint',
      'python',
      'linux-cpp',
      'linux-c',
      'linux-java',
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
      platform: 'web',
      usedFallback: false,
    });
  });

  it('recognizes only registered platform keys', () => {
    expect(isKnownPlatform('android')).toBe(true);
    expect(isKnownPlatform('web')).toBe(true);
    expect(isKnownPlatform('electron')).toBe(true);
    expect(isKnownPlatform('react-js')).toBe(true);
    expect(isKnownPlatform('js')).toBe(false);
  });

  it('returns locale-specific labels from the registry', () => {
    expect(getPlatformLabel('javascript', 'en')).toBe('JavaScript');
    expect(getPlatformLabel('javascript', 'zh-CN')).toBe('JavaScript');
    expect(getPlatformLabel('ios', 'en')).toBe('iOS');
    expect(getPlatformLabel('web', 'en')).toBe('Web');
    expect(getPlatformLabel('react-js', 'en')).toBe('React');
  });

  it('uses a namespaced storage key', () => {
    expect(PLATFORM_PREFERENCE_STORAGE_KEY).toBe('docs-portal:platform:v1');
  });
});
