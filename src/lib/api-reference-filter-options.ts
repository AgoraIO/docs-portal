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

// Preserve language-based links while also matching their supported platforms.
// Only explicitly Windows-compatible C++ and C# references share that alias.
const clientPlatformAliases: Record<
  string,
  { label: string; references: ReadonlySet<string> }
> = {
  android: { label: 'Android', references: new Set(['rtm/java']) },
  windows: {
    label: 'Windows',
    references: new Set(['rtc/cpp', 'rtc/csharp', 'im/cpp']),
  },
};

function supportsClientPlatform(
  entry: ApiReferenceCardEntry,
  platformId: string,
) {
  return (
    entry.apiType === 'client-api' &&
    (clientPlatformAliases[platformId]?.references.has(
      `${entry.productId}/${entry.platformId}`,
    ) ??
      false)
  );
}

export function matchesApiReferencePlatform(
  entry: ApiReferenceCardEntry,
  platformId: string,
) {
  return (
    platformId === 'all' ||
    entry.platformId === platformId ||
    supportsClientPlatform(entry, platformId)
  );
}

export function getApiReferencePlatformOptions(
  entries: readonly ApiReferenceCardEntry[],
): ApiReferenceFilterOption[] {
  const sdkEntries = entries.filter((entry) => entry.apiType !== 'restful-api');
  const options = buildApiReferenceFilterOptions(sdkEntries, 'platform');

  for (const [id, { label }] of Object.entries(clientPlatformAliases)) {
    if (
      sdkEntries.some((entry) => supportsClientPlatform(entry, id)) &&
      !options.some((option) => option.id === id)
    ) {
      options.push({ id, label });
    }
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
