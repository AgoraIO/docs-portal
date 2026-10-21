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

  return kind === 'platform'
    ? options.sort(
        (a, b) =>
          (platformPriority.get(a.id) ?? platformPriority.size) -
          (platformPriority.get(b.id) ?? platformPriority.size),
      )
    : options;
}
