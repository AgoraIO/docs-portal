import type { ApiReferenceCardEntry } from './api-reference-cards-data.zh-cn';

export type ApiReferenceFilterOption = {
  id: string;
  label: string;
};

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

  return options;
}
