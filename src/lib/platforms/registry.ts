import type { AppLocale } from '@/lib/i18n/i18n-config';

export const PLATFORM_PREFERENCE_STORAGE_KEY = 'docs-portal:platform:v1';

export const platformRegistry = {
  web: {
    label: {
      en: 'Web',
      'zh-CN': 'Web',
    },
    order: 40,
  },
  javascript: {
    label: {
      en: 'JavaScript',
      'zh-CN': 'JavaScript',
    },
    order: 90,
  },
  android: {
    label: {
      en: 'Android',
      'zh-CN': 'Android',
    },
    order: 10,
  },
  ios: {
    label: {
      en: 'iOS',
      'zh-CN': 'iOS',
    },
    order: 20,
  },
  flutter: {
    label: {
      en: 'Flutter',
      'zh-CN': 'Flutter',
    },
    order: 70,
  },
  'react-native': {
    label: {
      en: 'React Native',
      'zh-CN': 'React Native',
    },
    order: 80,
  },
  windows: {
    label: {
      en: 'Windows',
      'zh-CN': 'Windows',
    },
    order: 50,
  },
  cpp: {
    label: {
      en: 'C++',
      'zh-CN': 'C++',
    },
    order: 130,
  },
  macos: {
    label: {
      en: 'macOS',
      'zh-CN': 'macOS',
    },
    order: 30,
  },
  electron: {
    label: {
      en: 'Electron',
      'zh-CN': 'Electron',
    },
    order: 60,
  },
  unity: {
    label: {
      en: 'Unity',
      'zh-CN': 'Unity',
    },
    order: 100,
  },
  unreal: {
    label: {
      en: 'Unreal Engine',
      'zh-CN': 'Unreal Engine',
    },
    order: 110,
  },
  blueprint: {
    label: {
      en: 'Unreal Blueprint',
      'zh-CN': 'Unreal Blueprint',
    },
    order: 120,
  },
  python: {
    label: {
      en: 'Python',
      'zh-CN': 'Python',
    },
    order: 140,
  },
  go: {
    label: {
      en: 'Go',
      'zh-CN': 'Go',
    },
    order: 150,
  },
  'linux-cpp': {
    label: {
      en: 'Linux C++',
      'zh-CN': 'Linux C++',
    },
    order: 160,
  },
  'linux-c': {
    label: {
      en: 'Linux C',
      'zh-CN': 'Linux C',
    },
    order: 170,
  },
  'linux-java': {
    label: {
      en: 'Linux Java',
      'zh-CN': 'Linux Java',
    },
    order: 180,
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

export function sortPlatformKeys(
  platforms: readonly PlatformKey[],
): PlatformKey[] {
  return [...platforms].sort(
    (left, right) =>
      platformRegistry[left].order - platformRegistry[right].order,
  );
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
