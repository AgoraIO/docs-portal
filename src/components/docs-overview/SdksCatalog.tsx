import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';
import { SolutionCardIcon, type SolutionCardIconKind } from './mdx-components';
import {
  type SdkDownloadPlatform,
  type SdkDownloadProduct,
  type SdkDownloadVersion,
  sdkDownloadPlatforms,
} from './sdk-downloads-data';
import { zhCNSdkDownloadPlatforms } from './sdk-downloads-data.zh-cn';
import {
  deriveInstallCommand,
  type InstallCommand,
} from './sdk-install-command';

const platformGroups = [
  { label: 'Server', platformIds: ['python', 'typescript', 'go'] },
  {
    label: 'Mobile',
    platformIds: [
      'android',
      'ios',
      'harmonyos',
      'react-native',
      'flutter',
      'mini-program',
    ],
  },
  { label: 'Web', platformIds: ['web', 'react-js', 'electron'] },
  { label: 'Desktop', platformIds: ['windows', 'macos', 'linux'] },
  { label: 'Game engines', platformIds: ['unity', 'unreal-engine'] },
] as const;

const PLATFORM_ORDER = platformGroups.flatMap((group) => group.platformIds);
const PRODUCT_GROUP_ORDER = [
  'agents',
  'voice',
  'video',
  'signaling',
  'chat',
  'iot',
  'whiteboard',
  'fastboard',
  'mediaplayer-kit',
  'server-gateway',
  'on-premise-recording',
  'meeting',
  'flexible-classroom',
  'cloud-scene',
  'proctor',
] as const;
const LOCATION_CHANGE_EVENT = 'docs-portal-location-change';

const sdkDownloadDatasets = {
  en: sdkDownloadPlatforms,
  'zh-CN': zhCNSdkDownloadPlatforms,
} as const;

type SdkCatalogLocale = keyof typeof sdkDownloadDatasets;

const catalogCopy = {
  en: {
    catalogPath: '/en/api-reference/sdks',
    copyButton: 'Copy',
    copiedButton: 'Copied',
    copyInstallCommand: 'Copy install command',
    directDownload: 'Direct download',
    downloadSdk: 'Download SDK',
    md5: 'MD5',
    packageManager: 'Package manager ↗',
    packageName: 'Package',
    platformTabsLabel: (product: string) => `${product} platform`,
    releaseDate: 'Release date',
    showAll: 'Show all SDKs',
    showing: (label: string) => `Showing SDKs for ${label}`,
    versionLabel: (product: string) => `${product} version`,
    states: {
      latest: 'Latest',
      legacy: 'Legacy',
      lite: 'Lite',
      previous: 'Previous',
    },
  },
  'zh-CN': {
    catalogPath: '/zh-CN/api-reference/sdks',
    copyButton: '复制',
    copiedButton: '已复制',
    copyInstallCommand: '复制集成命令',
    directDownload: '直接下载',
    downloadSdk: '下载 SDK',
    md5: 'MD5',
    packageManager: '包管理器 ↗',
    packageName: '包名',
    platformTabsLabel: (product: string) => `${product} 平台`,
    releaseDate: '发布日期',
    showAll: '查看全部 SDK',
    showing: (label: string) => `正在显示 ${label}`,
    versionLabel: (product: string) => `${product} 版本`,
    states: {
      latest: '最新',
      legacy: '旧版',
      lite: 'Lite',
      previous: '历史版本',
    },
  },
} as const;

type CatalogCopy = (typeof catalogCopy)[SdkCatalogLocale];

let historyPatchDepth = 0;
let restoreHistoryMethods: (() => void) | null = null;

const productFilters = {
  agents: {
    label: 'Agora Agents SDK',
    zhLabel: 'Agora Agents SDK',
    aliases: ['agents', 'agora-agents', 'ai-agents'],
    productIds: ['agents'],
  },
  chat: {
    label: 'Chat SDK',
    zhLabel: 'Chat SDK',
    aliases: ['chat', 'im'],
    productIds: ['chat'],
  },
  'flexible-classroom': {
    label: 'Flexible Classroom SDK',
    zhLabel: '灵动课堂 SDK',
    aliases: ['flexible-classroom', 'classroom'],
    productIds: ['flexible-classroom'],
  },
  'cloud-scene': {
    label: 'Cloud Scene SDK',
    zhLabel: '云课堂 SDK',
    aliases: ['cloud-scene', 'fcruiscene'],
    productIds: ['cloud-scene'],
  },
  proctor: {
    label: 'Proctor SDK',
    zhLabel: '灵动监考 SDK',
    aliases: ['proctor', 'proctor-sdk'],
    productIds: ['proctor'],
  },
  fastboard: {
    label: 'Interactive Whiteboard Fastboard',
    zhLabel: 'Fastboard SDK',
    aliases: ['fastboard'],
    productIds: ['fastboard'],
  },
  iot: {
    label: 'IoT SDK',
    zhLabel: 'IoT SDK',
    aliases: ['iot'],
    productIds: ['iot'],
  },
  'mediaplayer-kit': {
    label: 'Mediaplayer Kit SDK',
    zhLabel: 'Mediaplayer Kit SDK',
    aliases: ['mediaplayer-kit', 'mediaplayer'],
    productIds: ['mediaplayer-kit'],
  },
  meeting: {
    label: 'Meeting SDK',
    zhLabel: '灵动会议 SDK',
    aliases: ['meeting', 'meeting-sdk'],
    productIds: ['meeting'],
  },
  'on-premise-recording': {
    label: 'Agora On-Premise Recording SDK',
    zhLabel: '本地服务端录制 SDK',
    aliases: ['on-premise-recording', 'onpremise-recording', 'recording'],
    productIds: ['on-premise-recording'],
  },
  'server-gateway': {
    label: 'Server Gateway SDK',
    zhLabel: 'RTC 服务端 SDK',
    aliases: ['server-gateway', 'rtc-server-sdk'],
    productIds: ['server-gateway'],
  },
  signaling: {
    label: 'Signaling SDK',
    zhLabel: 'Signaling SDK',
    aliases: ['signaling', 'rtm'],
    productIds: ['signaling'],
  },
  video: {
    label: 'Video SDK',
    zhLabel: '视频 SDK',
    aliases: [
      'video',
      'video-calling',
      'rtc-video',
      'interactive-live-streaming',
      'broadcast-streaming',
      'ils',
    ],
    productIds: ['video'],
  },
  voice: {
    label: 'Voice SDK',
    zhLabel: '语音 SDK',
    aliases: ['voice', 'voice-calling', 'rtc-voice'],
    productIds: ['voice'],
  },
  whiteboard: {
    label: 'Whiteboard SDKs',
    zhLabel: '互动白板 SDK',
    aliases: ['whiteboard', 'interactive-whiteboard'],
    productIds: ['fastboard', 'whiteboard'],
  },
  'whiteboard-sdk': {
    label: 'Interactive Whiteboard SDK',
    zhLabel: '互动白板 SDK',
    aliases: ['whiteboard-sdk', 'interactive-whiteboard-sdk'],
    productIds: ['whiteboard'],
  },
  rtc: {
    label: 'RTC SDKs',
    zhLabel: '实时互动 SDK',
    aliases: ['rtc', 'real-time-communication', 'real-time-engagement'],
    productIds: ['voice', 'video'],
  },
} as const;

type ProductFilterId = keyof typeof productFilters;

const productAliasToFilter = new Map<string, ProductFilterId>(
  Object.entries(productFilters).flatMap(([filterId, filter]) =>
    filter.aliases.map((alias) => [alias, filterId as ProductFilterId]),
  ),
);
function platformRank(platformId: string) {
  const index = (PLATFORM_ORDER as readonly string[]).indexOf(platformId);
  return index === -1 ? PLATFORM_ORDER.length : index;
}

function productGroupRank(productId: string) {
  const index = (PRODUCT_GROUP_ORDER as readonly string[]).indexOf(
    productId as (typeof PRODUCT_GROUP_ORDER)[number],
  );
  return index === -1 ? PRODUCT_GROUP_ORDER.length : index;
}

type ProductPlatformEntry = {
  platformId: string;
  platformLabel: string;
  product: SdkDownloadProduct;
};

type ProductGroup = {
  label: string;
  productId: string;
  defaultProduct: SdkDownloadProduct;
  platforms: ProductPlatformEntry[];
};

function buildProductGroups(
  platforms: readonly SdkDownloadPlatform[],
): ProductGroup[] {
  const order: string[] = [];
  const entriesByProductId = new Map<string, ProductPlatformEntry[]>();
  const labelsByProductId = new Map<string, string>();

  for (const platform of platforms) {
    for (const kind of ['core', 'addOns'] as const) {
      for (const product of platform[kind] ?? []) {
        const productId = getProductCatalogId(product);
        let entries = entriesByProductId.get(productId);
        if (!entries) {
          entries = [];
          entriesByProductId.set(productId, entries);
          labelsByProductId.set(productId, product.label);
          order.push(productId);
        }
        const existingEntry = entries.find(
          (entry) => entry.platformId === platform.id,
        );

        if (existingEntry) {
          const seenVersionKeys = new Set(
            existingEntry.product.versions.map((version) =>
              getVersionKey(platform.id, version),
            ),
          );
          const mergedVersions = [...existingEntry.product.versions];

          for (const version of product.versions) {
            const versionKey = getVersionKey(platform.id, version);
            if (seenVersionKeys.has(versionKey)) {
              continue;
            }
            mergedVersions.push(version);
            seenVersionKeys.add(versionKey);
          }

          existingEntry.product = {
            ...existingEntry.product,
            versions: mergedVersions,
          };
          continue;
        }

        entries.push({
          platformId: platform.id,
          platformLabel: platform.label,
          product,
        });
      }
    }
  }

  return order
    .map((productId) => {
      const platforms = (entriesByProductId.get(productId) ?? [])
        .slice()
        .sort((a, b) => platformRank(a.platformId) - platformRank(b.platformId));

      return {
        label: labelsByProductId.get(productId) ?? platforms[0].product.label,
        productId,
        defaultProduct: platforms[0].product,
        platforms,
      };
    })
    .sort((a, b) => productGroupRank(a.productId) - productGroupRank(b.productId));
}

export function SdksCatalog({
  locale = 'en',
  platform,
  product,
  versionIdPrefixes,
}: {
  locale?: SdkCatalogLocale;
  platform?: string;
  product?: string;
  versionIdPrefixes?: string[];
}) {
  const platforms = sdkDownloadDatasets[locale];
  const copy = catalogCopy[locale];
  const productGroups = useMemo(
    () => buildProductGroups(platforms),
    [platforms],
  );
  const queryFilters = useSdkCatalogQueryFilters(platforms, {
    platformId: normalizePlatformFilter(platform, platforms),
    productId: normalizeProductFilter(product),
  });
  const productFilter = queryFilters.productId
    ? productFilters[queryFilters.productId]
    : null;
  const productFilterProductIds = productFilter
    ? new Set<string>(productFilter.productIds)
    : null;
  const visibleProductGroups = productFilter
    ? productGroups.filter((group) =>
        productFilterProductIds?.has(group.productId),
      )
      : queryFilters.platformId
        ? productGroups.filter((group) =>
            group.platforms.some(
              (entry) => entry.platformId === queryFilters.platformId,
            ),
        )
      : productGroups;
  const visibleProductGroupsWithVersionFilter = useMemo(() => {
    if (!versionIdPrefixes || versionIdPrefixes.length === 0) {
      return visibleProductGroups;
    }

    const filteredGroups: ProductGroup[] = [];

    for (const group of visibleProductGroups) {
      const filteredPlatforms: ProductPlatformEntry[] = [];

      for (const entry of group.platforms) {
        const filteredVersions = entry.product.versions.filter((version) =>
          versionIdPrefixes.some((prefix) => version.id.includes(prefix)),
        );

        if (filteredVersions.length === 0) {
          continue;
        }

        filteredPlatforms.push({
          ...entry,
          product: {
            ...entry.product,
            versions: filteredVersions,
          },
        });
      }

      if (filteredPlatforms.length === 0) {
        continue;
      }

      filteredGroups.push({
        ...group,
        defaultProduct: filteredPlatforms[0].product,
        platforms: filteredPlatforms,
      });
    }

    return filteredGroups;
  }, [versionIdPrefixes, visibleProductGroups]);
  const platformLabel = queryFilters.platformId
    ? platforms.find((platform) => platform.id === queryFilters.platformId)
        ?.label
    : null;
  const summaryLabel = productFilter
    ? getProductFilterLabel(productFilter, locale)
    : platformLabel;

  return (
    <section className="not-prose my-8 flex flex-col gap-3">
      {summaryLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <p className="m-0 text-sm font-medium text-foreground">
            {copy.showing(summaryLabel)}
          </p>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={copy.catalogPath}
          >
            {copy.showAll}
          </a>
        </div>
      ) : null}
      {visibleProductGroupsWithVersionFilter.map((group) => (
        <ProductCard
          copy={copy}
          group={group}
          initialPlatformId={queryFilters.platformId}
          key={`${group.productId}-${queryFilters.platformId ?? 'default'}`}
          locale={locale}
        />
      ))}
    </section>
  );
}

function ProductCard({
  copy,
  group,
  initialPlatformId,
  locale,
}: {
  copy: CatalogCopy;
  group: ProductGroup;
  initialPlatformId: string | null;
  locale: SdkCatalogLocale;
}) {
  const defaultPlatformId =
    initialPlatformId &&
    group.platforms.some((entry) => entry.platformId === initialPlatformId)
      ? initialPlatformId
      : group.platforms[0].platformId;
  const [platformId, setPlatformId] = useState(defaultPlatformId);
  const [versionIndex, setVersionIndex] = useState('0');

  const activePlatform =
    group.platforms.find((entry) => entry.platformId === platformId) ??
    group.platforms[0];
  const versions = activePlatform.product.versions;
  const activeVersion = versions[Number(versionIndex)] ?? versions[0];
  const command = activeVersion ? deriveInstallCommand(activeVersion) : null;

  const titleId = `sdk-${group.defaultProduct.id}-title`;
  const versionId = `sdk-${group.defaultProduct.id}-version`;

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-xl border border-border p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <SolutionCardIcon
            kind={productIconKind(group.productId, group.label)}
          />
        </span>
        <div className="min-w-0">
          <h3
            className="m-0 text-base font-semibold text-foreground"
            id={titleId}
          >
            {group.label}
          </h3>
          <p className="m-0 mt-1 text-sm leading-6 text-muted-foreground">
            {group.defaultProduct.info}
          </p>
        </div>
      </div>

      <div
        aria-label={copy.platformTabsLabel(group.label)}
        className="mt-4 flex flex-wrap gap-1 border-border border-b"
        role="tablist"
      >
        {group.platforms.map((entry) => {
          const isActive = entry.platformId === platformId;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                '-mb-px border-b-2 px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'border-primary font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              key={entry.platformId}
              onClick={() => {
                setPlatformId(entry.platformId);
                setVersionIndex('0');
              }}
              role="tab"
              type="button"
            >
              {entry.platformLabel}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[0.66rem] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
          {command ? command.tool : ' '}
        </span>
        <span className="relative shrink-0">
          <label className="sr-only" htmlFor={versionId}>
            {copy.versionLabel(group.label)}
          </label>
          <select
            className="h-9 appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id={versionId}
            onChange={(event) => setVersionIndex(event.target.value)}
            value={versionIndex}
          >
            {versions.map((version, index) => (
              <option
                key={getVersionKey(activePlatform.platformId, version)}
                value={String(index)}
              >
                {getVersionMeta(version, index, locale).optionLabel}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </span>
      </div>

      {activeVersion ? (
        <InstallArea command={command} copy={copy} version={activeVersion} />
      ) : null}
    </article>
  );
}

function useSdkCatalogQueryFilters(
  platforms: readonly SdkDownloadPlatform[],
  defaults: {
    platformId: string | null;
    productId: ProductFilterId | null;
  },
) {
  const search = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearch,
    getServerLocationSearch,
  );

  return useMemo(
    () => readQueryFilters(search, platforms, defaults),
    [search, platforms, defaults.platformId, defaults.productId],
  );
}

function subscribeToLocationSearch(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const restoreHistoryPatch = patchHistoryForLocationChanges();
  window.addEventListener('popstate', onChange);
  window.addEventListener(LOCATION_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(LOCATION_CHANGE_EVENT, onChange);
    restoreHistoryPatch();
  };
}

function patchHistoryForLocationChanges() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  historyPatchDepth += 1;

  if (!restoreHistoryMethods) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const result = originalPushState.call(this, data, unused, url);
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
      return result;
    } as History['pushState'];

    window.history.replaceState = function replaceState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const result = originalReplaceState.call(this, data, unused, url);
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
      return result;
    } as History['replaceState'];

    restoreHistoryMethods = () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }

  return () => {
    historyPatchDepth -= 1;

    if (historyPatchDepth === 0 && restoreHistoryMethods) {
      restoreHistoryMethods();
      restoreHistoryMethods = null;
    }
  };
}

function getLocationSearch() {
  return typeof window === 'undefined' ? '' : window.location.search;
}

function getServerLocationSearch() {
  return '';
}

function readQueryFilters(
  search: string,
  platforms: readonly SdkDownloadPlatform[],
  defaults: {
    platformId: string | null;
    productId: ProductFilterId | null;
  } = { platformId: null, productId: null },
) {
  const params = new URLSearchParams(search);
  const product = params.get('product')?.trim().toLowerCase() ?? '';
  const platform = params.get('platform')?.trim().toLowerCase() ?? '';
  const productId = product
    ? productAliasToFilter.get(product) ?? null
    : defaults.productId;
  const platformIds = new Set(platforms.map((entry) => entry.id));
  const platformId = platform
    ? platformIds.has(platform)
      ? platform
      : null
    : defaults.platformId && platformIds.has(defaults.platformId)
      ? defaults.platformId
      : null;

  return { platformId, productId };
}

function normalizeProductFilter(product: string | undefined) {
  const normalized = product?.trim().toLowerCase();
  return normalized ? productAliasToFilter.get(normalized) ?? null : null;
}

function normalizePlatformFilter(
  platform: string | undefined,
  platforms: readonly SdkDownloadPlatform[],
) {
  const normalized = platform?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return platforms.some((entry) => entry.id === normalized) ? normalized : null;
}

function getProductCatalogId(product: SdkDownloadProduct) {
  const normalizedId = product.id.toLowerCase();

  if (normalizedId.includes('agents-sdk')) {
    return 'agents';
  }
  if (normalizedId.includes('voice-sdk')) {
    return 'voice';
  }
  if (normalizedId.includes('video-sdk')) {
    return 'video';
  }
  if (
    normalizedId.includes('signaling-sdk') ||
    normalizedId.includes('rtm-sdk')
  ) {
    return 'signaling';
  }
  if (normalizedId.includes('chat-sdk')) {
    return 'chat';
  }
  if (normalizedId.includes('meeting-sdk')) {
    return 'meeting';
  }
  if (normalizedId.includes('mediaplayer-kit')) {
    return 'mediaplayer-kit';
  }
  if (normalizedId.includes('proctor-sdk')) {
    return 'proctor';
  }
  if (normalizedId.includes('cloud-scene-sdk')) {
    return 'cloud-scene';
  }
  if (
    normalizedId.includes('flexible-classroom-sdk') ||
    normalizedId.includes('classroom-sdk')
  ) {
    return 'flexible-classroom';
  }
  if (normalizedId.includes('iot-sdk')) {
    return 'iot';
  }
  if (
    normalizedId.includes('fastboard') ||
    normalizedId.includes('interactive-whiteboard-fastboard')
  ) {
    return 'fastboard';
  }
  if (normalizedId.includes('interactive-whiteboard')) {
    return 'whiteboard';
  }
  if (normalizedId.includes('server-gateway')) {
    return 'server-gateway';
  }
  if (normalizedId.includes('on-premise-recording')) {
    return 'on-premise-recording';
  }

  return normalizedId.replace(/-(android|ios|web|macos|windows|linux)$/, '');
}

function getVersionKey(platformId: string, version: SdkDownloadVersion) {
  return [
    platformId,
    version.id,
    version.label,
    version.downloadLink ?? '',
    version.packageManager ?? '',
  ].join('|');
}

function InstallArea({
  command,
  copy,
  version,
}: {
  command: InstallCommand | null;
  copy: CatalogCopy;
  version: SdkDownloadVersion;
}) {
  if (command) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5">
          <code className="min-w-0 truncate font-mono text-[0.82rem] text-foreground">
            {command.command}
          </code>
          <CopyButton copy={copy} value={command.command} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {version.downloadLink ? (
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href={version.downloadLink}
              rel="noreferrer noopener"
              target="_blank"
            >
              {copy.directDownload}
            </a>
          ) : null}
          {version.packageManager ? (
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href={version.packageManager}
              rel="noreferrer noopener"
              target="_blank"
            >
              {copy.packageManager}
            </a>
          ) : null}
        </div>
        <VersionMetadata copy={copy} version={version} />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {version.downloadLink ? (
          <a
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            href={version.downloadLink}
            rel="noreferrer noopener"
            target="_blank"
          >
            <DownloadIcon className="size-4" />
            <span>{copy.downloadSdk}</span>
          </a>
        ) : null}
        {version.packageManager ? (
          <a
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
            href={version.packageManager}
            rel="noreferrer noopener"
            target="_blank"
          >
            {copy.packageManager}
          </a>
        ) : null}
      </div>
      <VersionMetadata copy={copy} version={version} />
    </div>
  );
}

function VersionMetadata({
  copy,
  version,
}: {
  copy: CatalogCopy;
  version: SdkDownloadVersion;
}) {
  const items: Array<{ label: string; value: string }> = [];

  if (version.releaseDate) {
    items.push({ label: copy.releaseDate, value: version.releaseDate });
  }
  if (version.packageName) {
    items.push({ label: copy.packageName, value: version.packageName });
  }
  if (version.md5) {
    items.push({ label: copy.md5, value: version.md5 });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <dl className="grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
      {items.map((item) => (
        <div className="min-w-0" key={item.label}>
          <dt className="inline font-medium text-foreground">{item.label}</dt>
          <dd className="ml-1 inline break-all">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CopyButton({ copy, value }: { copy: CatalogCopy; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label={copied ? copy.copiedButton : copy.copyInstallCommand}
      className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? copy.copiedButton : copy.copyButton}
    </button>
  );
}

// Map an SDK product to the same canonical icon the api-reference overview uses
// (the SolutionCard registry), so product icons stay consistent across pages.
function productIconKind(
  productId: string,
  productLabel: string,
): SolutionCardIconKind {
  const normalized = `${productId} ${productLabel}`.toLowerCase();

  if (normalized.includes('agent')) {
    return 'ai';
  }
  if (normalized.includes('voice')) {
    return 'voice-calling';
  }
  if (normalized.includes('video')) {
    return 'video-calling';
  }
  if (normalized.includes('signaling')) {
    return 'signaling';
  }
  if (normalized.includes('chat')) {
    return 'chat';
  }
  if (
    normalized.includes('classroom') ||
    normalized.includes('proctor') ||
    normalized.includes('cloud scene')
  ) {
    return 'classroom';
  }
  if (normalized.includes('iot')) {
    return 'iot';
  }
  if (normalized.includes('meeting')) {
    return 'meeting';
  }
  if (normalized.includes('whiteboard') || normalized.includes('fastboard')) {
    return 'whiteboard';
  }
  if (normalized.includes('gateway')) {
    return 'server-sdk';
  }
  if (normalized.includes('recording')) {
    return 'on-premise-recording';
  }
  // Media Player Kit and anything else fall back to the overview's "tools" icon.
  return 'tools';
}

function getVersionMeta(
  version: SdkDownloadVersion,
  index: number,
  locale: SdkCatalogLocale,
) {
  const copy = catalogCopy[locale];
  const compactLabel = version.label.trim().replace(/\s+/g, ' ');
  const isLatest = /\(Latest\)|\bLatest\b|（最新）|\(最新\)/i.test(
    compactLabel,
  );
  const isLite = /\bLite\b/i.test(compactLabel);
  const isLegacy = /\bLegacy\b|旧版/i.test(compactLabel);
  const states = [
    isLatest ? copy.states.latest : null,
    isLite ? copy.states.lite : null,
    isLegacy ? copy.states.legacy : null,
    !isLatest && !isLegacy && index > 0 ? copy.states.previous : null,
  ].filter((state) => state !== null);
  const displayLabel = compactLabel
    .replace(/^version\s+/i, 'v')
    .replace(/^版本\s+/i, 'v')
    .replace(/\s*\(Latest\)/gi, '')
    .replace(/\s*[（(]最新[）)]/g, '')
    .trim();

  return {
    optionLabel: states.length
      ? `${displayLabel} - ${states.join(', ')}`
      : displayLabel,
  };
}

function getProductFilterLabel(
  filter: (typeof productFilters)[ProductFilterId],
  locale: SdkCatalogLocale,
) {
  return locale === 'zh-CN' ? filter.zhLabel : filter.label;
}
