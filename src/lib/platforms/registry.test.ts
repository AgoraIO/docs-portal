import { describe, expect, it } from 'vitest';
import {
  getCanonicalPlatform,
  getPlatformLabel,
  isKnownPlatform,
  normalizePlatformKey,
  PLATFORM_CANONICAL_PRIORITY,
  PLATFORM_PREFERENCE_STORAGE_KEY,
  platformRegistry,
} from './registry';

describe('platform registry', () => {
  it('exposes a stable canonical priority order', () => {
    expect(PLATFORM_CANONICAL_PRIORITY).toEqual([
      'web',
      'android',
      'ios',
      'javascript',
      'flutter',
      'react-native',
    ]);
  });

  it('resolves canonical platform by priority, not declaration order', () => {
    expect(getCanonicalPlatform(['ios', 'android'])).toEqual({
      platform: 'android',
      usedFallback: false,
    });
    expect(getCanonicalPlatform(['flutter', 'web'])).toEqual({
      platform: 'web',
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
    expect(getCanonicalPlatform(['unity', 'blueprint'])).toEqual({
      platform: 'unity',
      usedFallback: true,
    });
  });

  it('recognizes only registered platform keys', () => {
    expect(isKnownPlatform('android')).toBe(true);
    expect(isKnownPlatform('web')).toBe(true);
    expect(isKnownPlatform('react-js')).toBe(true);
    expect(isKnownPlatform('windows')).toBe(true);
    expect(isKnownPlatform('cpp')).toBe(true);
    expect(isKnownPlatform('macos')).toBe(true);
    expect(isKnownPlatform('electron')).toBe(true);
    expect(isKnownPlatform('unity')).toBe(true);
    expect(isKnownPlatform('unreal')).toBe(true);
    expect(isKnownPlatform('blueprint')).toBe(true);
    expect(isKnownPlatform('python')).toBe(true);
    expect(isKnownPlatform('linux-cpp')).toBe(true);
    expect(isKnownPlatform('linux-c')).toBe(true);
    expect(isKnownPlatform('linux-java')).toBe(true);
    expect(isKnownPlatform('go')).toBe(true);
    expect(isKnownPlatform('typescript')).toBe(true);
    expect(isKnownPlatform('js')).toBe(false);
  });

  it('normalizes legacy platform aliases to registered keys', () => {
    expect(normalizePlatformKey('react-js')).toBe('javascript');
    expect(normalizePlatformKey('android')).toBe('android');
  });

  it('returns locale-specific labels from the registry', () => {
    expect(getPlatformLabel('web', 'en')).toBe('Web');
    expect(getPlatformLabel('web', 'zh-CN')).toBe('Web');
    expect(getPlatformLabel('javascript', 'en')).toBe('JavaScript');
    expect(getPlatformLabel('javascript', 'zh-CN')).toBe('JavaScript');
    expect(getPlatformLabel('ios', 'en')).toBe('iOS');
    expect(getPlatformLabel('windows', 'en')).toBe('Windows');
    expect(getPlatformLabel('cpp', 'en')).toBe('C++');
    expect(getPlatformLabel('macos', 'en')).toBe('macOS');
    expect(getPlatformLabel('electron', 'en')).toBe('Electron');
    expect(getPlatformLabel('unity', 'en')).toBe('Unity');
    expect(getPlatformLabel('unreal', 'en')).toBe('Unreal Engine');
    expect(getPlatformLabel('blueprint', 'en')).toBe('Unreal Blueprint');
    expect(getPlatformLabel('python', 'en')).toBe('Python');
    expect(getPlatformLabel('linux-cpp', 'en')).toBe('Linux C++');
    expect(getPlatformLabel('linux-c', 'en')).toBe('Linux C');
    expect(getPlatformLabel('linux-java', 'en')).toBe('Linux Java');
  });

  it('uses a namespaced storage key', () => {
    expect(PLATFORM_PREFERENCE_STORAGE_KEY).toBe('docs-portal:platform:v1');
  });
});

describe('platform registry — SDK languages', () => {
  it('knows go and typescript', () => {
    expect(isKnownPlatform('go')).toBe(true);
    expect(isKnownPlatform('typescript')).toBe(true);
  });

  it('labels them for English', () => {
    expect(getPlatformLabel('go', 'en')).toBe('Go');
    expect(getPlatformLabel('typescript', 'en')).toBe('TypeScript');
  });

  it('orders them next to python', () => {
    expect(platformRegistry.go.order).toBeGreaterThan(platformRegistry.python.order);
    expect(platformRegistry.typescript.order).toBeGreaterThan(platformRegistry.go.order);
    expect(platformRegistry.typescript.order).toBeLessThan(platformRegistry['linux-cpp'].order);
  });
});
