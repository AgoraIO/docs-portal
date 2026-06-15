import type { AppLocale } from '@/lib/i18n/i18n-config';

export const PLATFORM_PREFERENCE_STORAGE_KEY = 'docs-portal:platform:v1';

export const platformRegistry = {
  web: {
    label: {
      en: 'Web',
      'zh-CN': 'Web',
    },
    order: 5,
  },
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
  macos: {
    label: {
      en: 'macOS',
      'zh-CN': 'macOS',
    },
    order: 35,
  },
  windows: {
    label: {
      en: 'Windows',
      'zh-CN': 'Windows',
    },
    order: 36,
  },
  electron: {
    label: {
      en: 'Electron',
      'zh-CN': 'Electron',
    },
    order: 37,
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
  'react-js': {
    label: {
      en: 'React',
      'zh-CN': 'React',
    },
    order: 55,
  },
  unity: {
    label: {
      en: 'Unity',
      'zh-CN': 'Unity',
    },
    order: 60,
  },
  unreal: {
    label: {
      en: 'Unreal Engine',
      'zh-CN': 'Unreal Engine',
    },
    order: 70,
  },
  blueprint: {
    label: {
      en: 'Unreal Blueprint',
      'zh-CN': 'Unreal Blueprint',
    },
    order: 80,
  },
  python: {
    label: {
      en: 'Python',
      'zh-CN': 'Python',
    },
    order: 90,
  },
  'linux-cpp': {
    label: {
      en: 'Linux C++',
      'zh-CN': 'Linux C++',
    },
    order: 100,
  },
  'linux-c': {
    label: {
      en: 'Linux C',
      'zh-CN': 'Linux C',
    },
    order: 110,
  },
  'linux-java': {
    label: {
      en: 'Linux Java',
      'zh-CN': 'Linux Java',
    },
    order: 120,
  },
} as const;

export type PlatformKey = keyof typeof platformRegistry;

export const PLATFORM_CANONICAL_PRIORITY: PlatformKey[] = [
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
