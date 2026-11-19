import { resolveZhCnApiReferenceEntry } from '../api-reference-breadcrumb';
import { isSamePathOrDescendant } from '../docs-routing';
import { platformRegistry } from '../platforms/registry';
import {
  type CnSearchPlatform,
  cnSearchPlatformOptions,
  isCnSearchPlatform,
  normalizeCnSearchPlatform,
} from './cn-search-platforms';
import { toCnContentSearchUrl } from './cn-search-urls.mjs';

// This nested publication is maintained as a versionOverride of the React SDK.
// It is a companion reference, not another release of the standalone Web SDK.
const companionReferences = [
  {
    scope: '/zh-CN/api-reference/rtc/react-sdk/web-sdk',
    label: 'React SDK 配套 Web SDK',
  },
];

export function getCnSearchSdkLabel(url: string): string | undefined {
  const path = toCnContentSearchUrl(url.split(/[?#]/, 1)[0]);
  const companion = companionReferences.find(({ scope }) =>
    isSamePathOrDescendant(path, scope),
  );
  if (companion) return companion.label;
  const entry = resolveZhCnApiReferenceEntry(path);
  if (!entry || entry.apiType === 'restful-api') return undefined;
  const label = entry.sourceLabel || entry.platform;
  return /SDK/i.test(label) ? label : `${label} SDK`;
}

export function getCnSearchPlatforms(
  _available?: Record<string, number>,
  selected?: string | null,
): CnSearchPlatform[] {
  // The legacy catalog is fixed; availability from one publication must not
  // change its labels, ordering, or remove choices during loading.
  const canonical = selected ? normalizeCnSearchPlatform(selected) : undefined;
  const options: CnSearchPlatform[] = cnSearchPlatformOptions.map(
    ({ value }) => value,
  );
  if (
    canonical &&
    isCnSearchPlatform(canonical) &&
    !options.includes(canonical)
  )
    options.push(canonical);
  return options;
}

export function getCnSearchPlatformLabel(platform: string) {
  platform = normalizeCnSearchPlatform(platform);
  const option = cnSearchPlatformOptions.find(
    ({ value }) => value === platform,
  );
  if (option) return option.label;
  return platform in platformRegistry
    ? platformRegistry[platform as keyof typeof platformRegistry].label['zh-CN']
    : platform;
}
