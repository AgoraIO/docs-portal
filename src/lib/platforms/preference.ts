import { PLATFORM_PREFERENCE_STORAGE_KEY, type PlatformKey } from './registry';

export const PLATFORM_DATASET_KEY = 'docsPlatform';

export function getStoredPlatformPreference(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPlatformPreference(platform: PlatformKey) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, platform);
    } catch {
      // Ignore storage errors and still sync the live DOM dataset.
    }
  }

  syncPlatformDataset(platform);
}

export function syncPlatformDataset(platform: string | null) {
  if (typeof document === 'undefined') {
    return;
  }

  if (!platform) {
    delete document.documentElement.dataset[PLATFORM_DATASET_KEY];
    return;
  }

  document.documentElement.dataset[PLATFORM_DATASET_KEY] = platform;
}
