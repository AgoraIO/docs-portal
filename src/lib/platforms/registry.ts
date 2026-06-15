import type { AppLocale } from '@/lib/i18n/i18n-config';

export const PLATFORM_PREFERENCE_STORAGE_KEY = 'docs-portal:platform:v1';

export const platformRegistry = {
  web: {
    label: {
      en: 'Web',
      'zh-CN': 'Web',
    },
    order: 10,
  },
  javascript: {
    label: {
      en: 'JavaScript',
      'zh-CN': 'JavaScript',
    },
    order: 15,
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
  windows: {
    label: {
      en: 'Windows',
      'zh-CN': 'Windows',
    },
    order: 60,
  },
  macos: {
    label: {
      en: 'macOS',
      'zh-CN': 'macOS',
    },
    order: 70,
  },
  electron: {
    label: {
      en: 'Electron',
      'zh-CN': 'Electron',
    },
    order: 80,
  },
  unity: {
    label: {
      en: 'Unity',
      'zh-CN': 'Unity',
    },
    order: 90,
  },
  unreal: {
    label: {
      en: 'Unreal Engine',
      'zh-CN': 'Unreal Engine',
    },
    order: 100,
  },
  blueprint: {
    label: {
      en: 'Unreal Blueprint',
      'zh-CN': 'Unreal Blueprint',
    },
    order: 110,
  },
  python: {
    label: {
      en: 'Python',
      'zh-CN': 'Python',
    },
    order: 120,
  },
  'linux-c': {
    label: {
      en: 'Linux C',
      'zh-CN': 'Linux C',
    },
    order: 130,
  },
} as const;

export type PlatformKey = keyof typeof platformRegistry;

const platformAliases = {
  'react-js': 'javascript',
} as const;

export type PlatformAlias = keyof typeof platformAliases;

export const PLATFORM_CANONICAL_PRIORITY: PlatformKey[] = [
  'web',
  'android',
  'ios',
  'javascript',
  'flutter',
  'react-native',
];

export function normalizePlatformKey(value: string): string {
  return platformAliases[value as PlatformAlias] ?? value;
}

export function isKnownPlatform(value: string): value is PlatformKey {
  return normalizePlatformKey(value) in platformRegistry;
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
