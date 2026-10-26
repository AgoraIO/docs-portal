import { resolveZhCnApiReferenceEntry } from '../api-reference-breadcrumb';
import { isSamePathOrDescendant } from '../docs-routing';
import { type PlatformKey, platformRegistry } from '../platforms/registry';
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
  available?: Record<string, number>,
  selected?: string | null,
): PlatformKey[] {
  const registered = Object.keys(platformRegistry) as PlatformKey[];
  const published = available && Object.keys(available).length > 0;
  return registered
    .filter(
      (platform) =>
        platform !== 'restful-api' &&
        (!published ||
          platform in available ||
          platform === selected ||
          (platform === 'restful' && 'restful-api' in available)),
    )
    .sort((a, b) => platformRegistry[a].order - platformRegistry[b].order);
}

export function getCnSearchPlatformLabel(platform: string) {
  if (platform === 'restful' || platform === 'restful-api') return '服务端';
  return platform in platformRegistry
    ? platformRegistry[platform as PlatformKey].label['zh-CN']
    : platform;
}
