import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { cn } from '@/lib/cn';
import { buildSdkCapabilityGroups } from './sdk-download-capabilities';
import { SolutionCardIcon, type SolutionCardIconKind } from './mdx-components';
import {
  getSdkDownloadProductCatalogId,
  getSdkDownloadProductGroupRank,
  getSdkDownloadProductSectionId,
} from './sdk-download-navigation';
import {
  getZhCNSdkDownloadProductCopy,
  ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY,
} from './sdk-download-products';
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
    installCommandScrollDescription:
      'The command extends beyond the current width. Scroll horizontally to view it in full.',
    installCommandScrollLabel: 'Horizontally scrollable install command',
    directDownload: 'Direct download',
    downloadSdk: 'Download SDK',
    allPlatforms: 'All platforms',
    allProducts: 'All products',
    md5: 'MD5',
    packageManager: 'Package manager ↗',
    packageName: 'Package',
    platformFilter: 'Platform',
    platformTabsLabel: (product: string) => `${product} platform`,
    productFilter: 'Product',
    releaseDate: 'Release date',
    showAll: 'Show all SDKs',
    showing: (label: string) => `Showing SDKs for ${label}`,
    versionLabel: (product: string) => `${product} version`,
    states: {
      latest: 'Latest',
      legacy: 'Legacy',
    },
  },
  'zh-CN': {
    catalogPath: '/zh-CN/reference/sdks',
    copyButton: '复制',
    copiedButton: '已复制',
    copyInstallCommand: '复制集成命令',
    installCommandScrollDescription:
      '命令超出当前宽度，可横向滚动查看完整内容。',
    installCommandScrollLabel: '可横向滚动的集成命令',
    directDownload: '直接下载',
    downloadSdk: '下载 SDK',
    allPlatforms: '全部平台',
    allProducts: '全部产品',
    md5: 'MD5',
    packageManager: '包管理器 ↗',
    packageName: '包名',
    platformFilter: '平台',
    platformTabsLabel: (product: string) => `${product} 平台`,
    productFilter: '产品',
    releaseDate: '发布日期',
    showAll: '查看全部 SDK',
    showing: (label: string) => `正在显示 ${label}`,
    versionLabel: (product: string) => `${product} 版本`,
    states: {
      latest: '最新',
      legacy: '旧版',
    },
  },
} as const;

type CatalogCopy = (typeof catalogCopy)[SdkCatalogLocale];

let historyPatchDepth = 0;
let restoreHistoryMethods: (() => void) | null = null;

const productFilters = {
  agents: {
    label: 'Agora Agents SDK',
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY.agents.label,
    aliases: ['agents', 'agora-agents', 'ai-agents'],
    productIds: ['agents'],
  },
  chat: {
    label: 'Chat SDK',
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY.chat.label,
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
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY.iot.label,
    aliases: ['iot'],
    productIds: ['iot'],
  },
  'mediaplayer-kit': {
    label: 'Mediaplayer Kit SDK',
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY['mediaplayer-kit'].label,
    aliases: ['mediaplayer-kit', 'mediaplayer'],
    productIds: ['mediaplayer-kit'],
  },
  meeting: {
    label: 'Meeting SDK',
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY.meeting.label,
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
    zhLabel: ZH_CN_SDK_DOWNLOAD_PRODUCT_COPY.signaling.label,
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

type ProductPlatformEntry = {
  platformId: string;
  platformLabel: string;
  product: SdkDownloadProduct;
};

type ProductGroup = {
  info: string;
  label: string;
  productId: string;
  defaultProduct: SdkDownloadProduct;
  platforms: ProductPlatformEntry[];
};

function buildProductGroups(
  platforms: readonly SdkDownloadPlatform[],
  locale: SdkCatalogLocale,
): ProductGroup[] {
  const order: string[] = [];
  const entriesByProductId = new Map<string, ProductPlatformEntry[]>();
  const labelsByProductId = new Map<string, string>();

  for (const platform of platforms) {
    for (const kind of ['core', 'addOns'] as const) {
      for (const product of platform[kind] ?? []) {
        const productId = getSdkDownloadProductCatalogId(product);
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
        .sort(
          (a, b) => platformRank(a.platformId) - platformRank(b.platformId),
        );
      const localizedCopy =
        locale === 'zh-CN'
          ? getZhCNSdkDownloadProductCopy(productId)
          : undefined;

      return {
        info: localizedCopy?.info ?? platforms[0].product.info,
        label:
          localizedCopy?.label ??
          labelsByProductId.get(productId) ??
          platforms[0].product.label,
        productId,
        defaultProduct: platforms[0].product,
        platforms,
      };
    })
    .sort(
      (a, b) =>
        getSdkDownloadProductGroupRank(a.productId) -
        getSdkDownloadProductGroupRank(b.productId),
    );
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
    () => buildProductGroups(platforms, locale),
    [locale, platforms],
  );
  const capabilityGroups = useMemo(
    () => buildSdkCapabilityGroups(platforms),
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
  const isEmbedded = Boolean(
    product || platform || (versionIdPrefixes && versionIdPrefixes.length > 0),
  );
  const redesigned = locale === 'zh-CN';
  const showsCatalogFilters = redesigned && !isEmbedded;
  const visibleProductGroupsById = new Map(
    visibleProductGroupsWithVersionFilter.map((group) => [
      group.productId,
      group,
    ]),
  );
  const visibleCapabilityGroups = capabilityGroups.flatMap((capability) => {
    const products = capability.products
      .map((product) => visibleProductGroupsById.get(product.productId))
      .filter((group): group is ProductGroup => group !== undefined);

    return products.length ? [{ ...capability, products }] : [];
  });

  return (
    <section
      className={cn(
        'not-prose my-8',
        redesigned ? 'gap-4' : 'gap-3',
        'flex flex-col',
      )}
      data-layout={isEmbedded ? 'embedded' : 'catalog'}
      data-sdk-download-catalog
    >
      {showsCatalogFilters ? (
        <div className="grid gap-3 border-border border-b pb-5 sm:grid-cols-2">
          <label
            className="grid gap-1.5 text-sm font-medium text-foreground"
            htmlFor="sdk-product-filter"
          >
            {copy.productFilter}
            <select
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              id="sdk-product-filter"
              onChange={(event) =>
                updateSdkCatalogSearch({ product: event.target.value })
              }
              value={queryFilters.productId ?? 'all'}
            >
              <option value="all">{copy.allProducts}</option>
              {Object.entries(productFilters).map(([value, filter]) => (
                <option key={value} value={value}>
                  {getProductFilterLabel(filter, locale)}
                </option>
              ))}
            </select>
          </label>
          <label
            className="grid gap-1.5 text-sm font-medium text-foreground"
            htmlFor="sdk-platform-filter"
          >
            {copy.platformFilter}
            <select
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              id="sdk-platform-filter"
              onChange={(event) =>
                updateSdkCatalogSearch({ platform: event.target.value })
              }
              value={queryFilters.platformId ?? 'all'}
            >
              <option value="all">{copy.allPlatforms}</option>
              {platforms.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {summaryLabel && (!redesigned || !isEmbedded) ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3',
          )}
        >
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
      {visibleCapabilityGroups.map((capability) => (
        <section
          aria-labelledby={`sdk-capability-${capability.id}`}
          className="flex flex-col"
          key={capability.id}
        >
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2
              className="m-0 text-lg font-semibold text-foreground"
              id={`sdk-capability-${capability.id}`}
            >
              {capability.label}
            </h2>
            <span className="text-xs text-muted-foreground">
              {capability.products.length} 个产品
            </span>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {capability.products.map((group, index) => (
              <ProductCard
                copy={copy}
                defaultOpen={index === 0}
                group={group}
                initialPlatformId={queryFilters.platformId}
                key={`${group.productId}-${queryFilters.platformId ?? 'default'}`}
                locale={locale}
                redesigned={redesigned}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function ProductCard({
  copy,
  defaultOpen,
  group,
  initialPlatformId,
  locale,
  redesigned,
}: {
  copy: CatalogCopy;
  defaultOpen: boolean;
  group: ProductGroup;
  initialPlatformId: string | null;
  locale: SdkCatalogLocale;
  redesigned: boolean;
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
  const versions = getLatestVersions(activePlatform.product.versions);
  const activeVersion = versions[Number(versionIndex)] ?? versions[0];
  const command = activeVersion ? deriveInstallCommand(activeVersion) : null;

  const titleId = `sdk-${group.defaultProduct.id}-title`;
  const versionId = `sdk-${group.defaultProduct.id}-version`;

  return (
    <article
      aria-label={group.label}
      className={cn(
        'scroll-mt-40',
        !redesigned && 'rounded-xl border border-border p-5',
      )}
      data-sdk-download-product-id={group.productId}
      id={getSdkDownloadProductSectionId(group.productId)}
    >
      <details open={defaultOpen}>
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <ChevronDownIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <SolutionCardIcon
              kind={productIconKind(group.productId, group.label)}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              {group.label}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {group.info}
            </span>
          </span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {group.platforms.length} 个平台
          </span>
        </summary>
        <div className="border-border border-t px-4 py-4 sm:pl-16">
          <div className="flex items-end justify-between gap-3">
            <label
              className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium text-foreground"
              htmlFor={`${titleId}-platform`}
            >
              {copy.platformTabsLabel(group.label)}
              <select
                className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                id={`${titleId}-platform`}
                onChange={(event) => {
                  setPlatformId(event.target.value);
                  setVersionIndex('0');
                }}
                value={platformId}
              >
                {group.platforms.map((entry) => (
                  <option key={entry.platformId} value={entry.platformId}>
                    {entry.platformLabel}
                  </option>
                ))}
              </select>
            </label>
            <span className="shrink-0 pb-2 text-[0.66rem] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              {command ? command.tool : ' '}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="sr-only">{copy.versionLabel(group.label)}</span>
            {versions.length > 1 ? (
              <span className="relative ml-auto shrink-0">
                <label className="sr-only" htmlFor={versionId}>
                  {copy.versionLabel(group.label)}
                </label>
                <select
                  className="min-h-11 appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  id={versionId}
                  onChange={(event) => setVersionIndex(event.target.value)}
                  value={versionIndex}
                >
                  {versions.map((version, index) => (
                    <option
                      key={getVersionKey(activePlatform.platformId, version)}
                      value={String(index)}
                    >
                      {getVersionMeta(version, locale).optionLabel}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </span>
            ) : activeVersion ? (
              <span className="ml-auto shrink-0 text-sm font-medium text-foreground">
                {getVersionMeta(activeVersion, locale).optionLabel}
              </span>
            ) : null}
          </div>

          {activeVersion ? (
            <InstallArea
              command={command}
              copy={copy}
              redesigned={redesigned}
              version={activeVersion}
            />
          ) : null}
        </div>
      </details>
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
  const { platformId, productId } = defaults;
  const search = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearch,
    getServerLocationSearch,
  );

  return useMemo(
    () => readQueryFilters(search, platforms, { platformId, productId }),
    [search, platforms, platformId, productId],
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

function updateSdkCatalogSearch(changes: {
  platform?: string;
  product?: string;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(changes)) {
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
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
    ? (productAliasToFilter.get(product) ?? null)
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
  return normalized ? (productAliasToFilter.get(normalized) ?? null) : null;
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

function getVersionKey(platformId: string, version: SdkDownloadVersion) {
  return [
    platformId,
    version.id,
    version.label,
    version.downloadLink ?? '',
    version.packageManager ?? '',
  ].join('|');
}

function getLatestVersions(versions: readonly SdkDownloadVersion[]) {
  const [latestVersion, ...otherVersions] = versions;

  if (!latestVersion) {
    return [];
  }

  return [
    latestVersion,
    ...otherVersions.filter((version) => version.latestVariant),
  ];
}

function isLatestVersion(version: SdkDownloadVersion) {
  return /\(Latest\)|\bLatest\b|（最新）|\(最新\)/i.test(version.label);
}

function InstallArea({
  command,
  copy,
  redesigned,
  version,
}: {
  command: InstallCommand | null;
  copy: CatalogCopy;
  redesigned: boolean;
  version: SdkDownloadVersion;
}) {
  if (command) {
    return (
      <div className={cn('mt-3 flex flex-col gap-2', redesigned && 'flex-1')}>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5">
          <ScrollableInstallCommand
            copy={copy}
            key={command.command}
            value={command.command}
          />
          <CopyButton copy={copy} value={command.command} />
        </div>
        <div
          className={cn(
            'flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground',
            redesigned ? 'gap-y-2' : 'gap-y-1',
          )}
        >
          {version.downloadLink ? (
            <a
              className={cn(
                redesigned
                  ? 'inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                  : 'underline underline-offset-2 hover:text-foreground',
              )}
              href={version.downloadLink}
              rel="noreferrer noopener"
              target="_blank"
            >
              {redesigned ? (
                <DownloadIcon aria-hidden="true" className="size-4" />
              ) : null}
              {redesigned ? copy.downloadSdk : copy.directDownload}
            </a>
          ) : null}
          {version.packageManager ? (
            <a
              className={cn(
                'underline underline-offset-2 hover:text-foreground',
                redesigned && 'inline-flex min-h-11 items-center',
              )}
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
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
            className={cn(
              'text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground',
              redesigned && 'inline-flex min-h-11 items-center',
            )}
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

function ScrollableInstallCommand({
  copy,
  value,
}: {
  copy: CatalogCopy;
  value: string;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const descriptionId = useId();
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateOverflowState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const overflow = element.scrollWidth > element.clientWidth + 1;
    setHasOverflow(overflow);
    setIsAtEnd(
      !overflow ||
        element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollLeft = 0;
    }
    updateOverflowState();
    window.addEventListener('resize', updateOverflowState);
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateOverflowState);
    if (element) {
      resizeObserver?.observe(element);
    }

    return () => {
      window.removeEventListener('resize', updateOverflowState);
      resizeObserver?.disconnect();
    };
  }, [updateOverflowState]);

  return (
    <div
      className="relative min-w-0 flex-1"
      data-command-overflow={hasOverflow ? 'true' : 'false'}
      data-command-scroll-end={isAtEnd ? 'true' : 'false'}
    >
      <section
        aria-describedby={hasOverflow ? descriptionId : undefined}
        aria-label={copy.installCommandScrollLabel}
        className="min-w-0 overflow-x-auto overscroll-x-contain rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onScroll={updateOverflowState}
        ref={scrollRef}
        tabIndex={hasOverflow ? 0 : undefined}
      >
        <code className="block w-max whitespace-nowrap font-mono text-[0.82rem] text-foreground">
          {value}
        </code>
      </section>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-card transition-opacity',
          hasOverflow && !isAtEnd ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span className="sr-only" id={descriptionId}>
        {copy.installCommandScrollDescription}
      </span>
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
      className="min-h-11 min-w-11 shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

function getVersionMeta(version: SdkDownloadVersion, locale: SdkCatalogLocale) {
  const copy = catalogCopy[locale];
  const compactLabel = version.label.trim().replace(/\s+/g, ' ');
  const isLatest = isLatestVersion(version);
  const isLegacy = /\bLegacy\b|旧版/i.test(compactLabel);
  const states = [
    isLatest ? copy.states.latest : null,
    isLegacy ? copy.states.legacy : null,
  ].filter((state) => state !== null);
  const normalizedLabel = compactLabel
    .replace(/^version\s+/i, 'v')
    .replace(/^版本\s+/i, 'v')
    .replace(/\s*\(Latest\)/gi, '')
    .replace(/\s*[（(]最新[）)]/g, '')
    .trim();
  const displayLabel =
    locale === 'zh-CN'
      ? normalizedLabel
          .replace(/\bFull\b/gi, '完整版')
          .replace(/\bLite\b/gi, '轻量版')
          .replace(/\bfor\s+(?=C\+\+|Java|Go|Python)/gi, '')
      : normalizedLabel;

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
