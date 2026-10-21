import type { ApiReferenceCardEntry } from './api-reference-cards-data.zh-cn';

export type ApiReferenceFilterOption = {
  id: string;
  label: string;
};

const platformPriority = new Map(
  [
    'android',
    'ios',
    'web',
    'windows',
    'macos',
    'harmonyos',
    'mini-program',
    'flutter',
    'react-native',
    'electron',
    'unity',
    'unreal-cpp',
    'unreal-blueprint',
    'python',
    'java',
    'go',
    'typescript',
    'cpp',
    'csharp',
    'c',
    'device',
    'operator',
    'restful-api',
  ].map((id, index) => [id, index] as const),
);

export function buildApiReferenceFilterOptions(
  entries: readonly ApiReferenceCardEntry[],
  kind: 'platform' | 'product',
): ApiReferenceFilterOption[] {
  const seen = new Set<string>();
  const options: ApiReferenceFilterOption[] = [];

  for (const entry of entries) {
    const id = kind === 'product' ? entry.productId : entry.platformId;
    const label = kind === 'product' ? entry.product : entry.platform;

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    options.push({ id, label });
  }

  return kind === 'platform' ? sortPlatformOptions(options) : options;
}

// These shared references explicitly include Windows; other C++ SDKs may target
// different operating systems and must keep their own documented platform scope.
const windowsClientReferences = new Set(['rtc/cpp', 'rtc/csharp', 'im/cpp']);

function supportsWindows(entry: ApiReferenceCardEntry) {
  return (
    entry.apiType === 'client-api' &&
    windowsClientReferences.has(`${entry.productId}/${entry.platformId}`)
  );
}

export function matchesApiReferencePlatform(
  entry: ApiReferenceCardEntry,
  platformId: string,
) {
  return (
    platformId === 'all' ||
    entry.platformId === platformId ||
    (platformId === 'windows' && supportsWindows(entry))
  );
}

export function getApiReferencePlatformOptions(
  entries: readonly ApiReferenceCardEntry[],
): ApiReferenceFilterOption[] {
  const sdkEntries = entries.filter((entry) => entry.apiType !== 'restful-api');
  const options = buildApiReferenceFilterOptions(sdkEntries, 'platform');

  if (
    sdkEntries.some(supportsWindows) &&
    !options.some((option) => option.id === 'windows')
  ) {
    options.push({ id: 'windows', label: 'Windows' });
  }

  return sortPlatformOptions(options);
}

function sortPlatformOptions(options: ApiReferenceFilterOption[]) {
  return options.sort(
    (a, b) =>
      (platformPriority.get(a.id) ?? platformPriority.size) -
      (platformPriority.get(b.id) ?? platformPriority.size),
  );
}
