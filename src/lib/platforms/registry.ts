import type { AppLocale } from '@/lib/i18n/i18n-config';

export const PLATFORM_PREFERENCE_STORAGE_KEY = 'docs-portal:platform:v1';

export const platformRegistry = {
  javascript: {
    label: {
      en: 'JavaScript',
      'zh-CN': 'JavaScript',
    },
    order: 10,
  },
  android: {
    label: {
      en: 'Android',
      'zh-CN': 'Android',
    },
    order: 20,
  },
  ios: {
    label: {
      en: 'iOS',
      'zh-CN': 'iOS',
    },
    order: 30,
  },
  flutter: {
    label: {
      en: 'Flutter',
      'zh-CN': 'Flutter',
    },
    order: 40,
  },
  'react-native': {
    label: {
      en: 'React Native',
      'zh-CN': 'React Native',
    },
    order: 50,
  },
} as const;

export type PlatformKey = keyof typeof platformRegistry;

export const PLATFORM_CANONICAL_PRIORITY: PlatformKey[] = [
  'javascript',
  'android',
  'ios',
  'flutter',
  'react-native',
];

export function isKnownPlatform(value: string): value is PlatformKey {
  return value in platformRegistry;
}

export function getPlatformLabel(
  platform: PlatformKey,
  locale: AppLocale,
): string {
  return platformRegistry[platform].label[locale];
}

export function getCanonicalPlatform(platforms: string[]): {
  platform: string;
  usedFallback: boolean;
} {
  const match = PLATFORM_CANONICAL_PRIORITY.find((platform) =>
    platforms.includes(platform),
  );

  if (match) {
    return {
      platform: match,
      usedFallback: false,
    };
  }

  const fallback = platforms[0];

  if (!fallback) {
    throw new Error('Cannot resolve canonical platform from an empty group.');
  }

  return {
    platform: fallback,
    usedFallback: true,
  };
}
