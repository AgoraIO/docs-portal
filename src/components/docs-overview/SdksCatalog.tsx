import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';
import { subscribeToLocationChange } from '@/lib/location-change';
import { SolutionCardIcon, type SolutionCardIconKind } from './mdx-components';
import {
  type SdkDownloadProduct,
  type SdkDownloadVersion,
  sdkDownloadPlatforms,
} from './sdk-downloads-data';
import {
  deriveInstallCommand,
  type InstallCommand,
} from './sdk-install-command';

const platformGroups = [
  { label: 'Server', platformIds: ['python', 'typescript', 'go'] },
  {
    label: 'Mobile',
    platformIds: ['android', 'ios', 'react-native', 'flutter'],
  },
  { label: 'Web', platformIds: ['web', 'react-js', 'electron'] },
  { label: 'Desktop', platformIds: ['windows', 'macos', 'linux'] },
  { label: 'Game engines', platformIds: ['unity', 'unreal-engine'] },
] as const;

const PLATFORM_ORDER = platformGroups.flatMap((group) => group.platformIds);
const SDKS_CATALOG_PATH = '/en/api-reference/sdks';

const productFilters = {
  agents: {
    label: 'Agora Agents SDK',
    aliases: ['agents', 'agora-agents', 'ai-agents'],
    productIds: ['agents'],
  },
  chat: {
    label: 'Chat SDK',
    aliases: ['chat', 'im'],
    productIds: ['chat'],
  },
  fastboard: {
    label: 'Interactive Whiteboard Fastboard',
    aliases: ['fastboard'],
    productIds: ['fastboard'],
  },
  iot: {
    label: 'IoT SDK',
    aliases: ['iot'],
    productIds: ['iot'],
  },
  'on-premise-recording': {
    label: 'Agora On-Premise Recording SDK',
    aliases: ['on-premise-recording', 'onpremise-recording', 'recording'],
    productIds: ['on-premise-recording'],
  },
  'server-gateway': {
    label: 'Server Gateway SDK',
    aliases: ['server-gateway', 'rtc-server-sdk'],
    productIds: ['server-gateway'],
  },
  signaling: {
    label: 'Signaling SDK',
    aliases: ['signaling', 'rtm'],
    productIds: ['signaling'],
  },
  video: {
    label: 'RTC SDK',
    aliases: [
      'video',
      'video-calling',
      'rtc',
      'rtc-video',
      'interactive-live-streaming',
      'broadcast-streaming',
      'ils',
    ],
    productIds: ['video'],
  },
  voice: {
    label: 'RTC Voice SDK',
    aliases: ['voice', 'voice-calling', 'rtc-voice'],
    productIds: ['voice'],
  },
  whiteboard: {
    label: 'Whiteboard SDKs',
    aliases: ['whiteboard', 'interactive-whiteboard'],
    productIds: ['fastboard', 'whiteboard'],
  },
} as const;

type ProductFilterId = keyof typeof productFilters;

const productAliasToFilter = new Map<string, ProductFilterId>(
  Object.entries(productFilters).flatMap(([filterId, filter]) =>
    filter.aliases.map((alias) => [alias, filterId as ProductFilterId]),
  ),
);
const platformIds = new Set(
  sdkDownloadPlatforms.map((platform) => platform.id),
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
  label: string;
  productId: string;
  defaultProduct: SdkDownloadProduct;
  platforms: ProductPlatformEntry[];
};

function buildProductGroups(): ProductGroup[] {
  const order: string[] = [];
  const entriesByProductId = new Map<string, ProductPlatformEntry[]>();
  const labelsByProductId = new Map<string, string>();

  for (const platform of sdkDownloadPlatforms) {
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
        entries.push({
          platformId: platform.id,
          platformLabel: platform.label,
          product,
        });
      }
    }
  }

  return order.map((productId) => {
    const platforms = (entriesByProductId.get(productId) ?? [])
      .slice()
      .sort((a, b) => platformRank(a.platformId) - platformRank(b.platformId));

    return {
      label: labelsByProductId.get(productId) ?? platforms[0].product.label,
      productId,
      defaultProduct: platforms[0].product,
      platforms,
    };
  });
}

export function SdksCatalog() {
  const productGroups = useMemo(buildProductGroups, []);
  const queryFilters = useSdkCatalogQueryFilters();
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
  const platformLabel = queryFilters.platformId
    ? sdkDownloadPlatforms.find(
        (platform) => platform.id === queryFilters.platformId,
      )?.label
    : null;
  const summaryLabel = productFilter?.label ?? platformLabel;

  return (
    <section className="not-prose my-8 flex flex-col gap-3">
      {summaryLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <p className="m-0 text-sm font-medium text-foreground">
            {`Showing SDKs for ${summaryLabel}`}
          </p>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={SDKS_CATALOG_PATH}
          >
            Show all SDKs
          </a>
        </div>
      ) : null}
      {visibleProductGroups.map((group) => (
        <ProductCard
          group={group}
          initialPlatformId={queryFilters.platformId}
          key={`${group.productId}-${queryFilters.platformId ?? 'default'}`}
        />
      ))}
    </section>
  );
}

function ProductCard({
  group,
  initialPlatformId,
}: {
  group: ProductGroup;
  initialPlatformId: string | null;
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
          <SolutionCardIcon kind={productIconKind(group.label)} />
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
        aria-label={`${group.label} platform`}
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
            {`${group.label} version`}
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
                {getVersionMeta(version).optionLabel}
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
        <InstallArea command={command} version={activeVersion} />
      ) : null}
    </article>
  );
}

function useSdkCatalogQueryFilters() {
  const search = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearch,
    getServerLocationSearch,
  );

  return useMemo(() => readQueryFilters(search), [search]);
}

function subscribeToLocationSearch(onChange: () => void) {
  return subscribeToLocationChange(onChange);
}

function getLocationSearch() {
  return typeof window === 'undefined' ? '' : window.location.search;
}

function getServerLocationSearch() {
  return '';
}

function readQueryFilters(search: string) {
  const params = new URLSearchParams(search);
  const product = params.get('product')?.trim().toLowerCase() ?? '';
  const platform = params.get('platform')?.trim().toLowerCase() ?? '';
  const productId = productAliasToFilter.get(product) ?? null;
  const platformId = platformIds.has(platform) ? platform : null;

  return { platformId, productId };
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
  version,
}: {
  command: InstallCommand | null;
  version: SdkDownloadVersion;
}) {
  if (command) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5">
          <code className="min-w-0 truncate font-mono text-[0.82rem] text-foreground">
            {command.command}
          </code>
          <CopyButton value={command.command} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {version.downloadLink ? (
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href={version.downloadLink}
              rel="noreferrer noopener"
              target="_blank"
            >
              Direct download (.zip)
            </a>
          ) : null}
          {version.packageManager ? (
            <a
              className="underline underline-offset-2 hover:text-foreground"
              href={version.packageManager}
              rel="noreferrer noopener"
              target="_blank"
            >
              Package manager ↗
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {version.downloadLink ? (
        <a
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href={version.downloadLink}
          rel="noreferrer noopener"
          target="_blank"
        >
          <DownloadIcon className="size-4" />
          <span>Download SDK</span>
        </a>
      ) : null}
      {version.packageManager ? (
        <a
          className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          href={version.packageManager}
          rel="noreferrer noopener"
          target="_blank"
        >
          Package manager ↗
        </a>
      ) : null}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label={copied ? 'Copied' : 'Copy install command'}
      className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// Map an SDK product to the same canonical icon the api-reference overview uses
// (the SolutionCard registry), so product icons stay consistent across pages.
function productIconKind(productLabel: string): SolutionCardIconKind {
  const normalized = productLabel.toLowerCase();

  if (normalized.includes('agent')) {
    return 'ai';
  }
  if (normalized.includes('voice')) {
    return 'voice-calling';
  }
  if (normalized.includes('video') || normalized.includes('rtc')) {
    return 'video-calling';
  }
  if (normalized.includes('signaling')) {
    return 'signaling';
  }
  if (normalized.includes('chat')) {
    return 'chat';
  }
  if (normalized.includes('iot')) {
    return 'iot';
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

function getVersionMeta(version: SdkDownloadVersion) {
  const compactLabel = version.label.trim().replace(/\s+/g, ' ');
  const isLatest = /\(Latest\)|\bLatest\b/i.test(compactLabel);
  const isLite = /\bLite\b/i.test(compactLabel);
  const isLegacy = /\bLegacy\b/i.test(compactLabel);
  const states = [
    isLatest ? 'Latest' : null,
    isLite ? 'Lite' : null,
    isLegacy ? 'Legacy' : null,
  ].filter((state): state is string => Boolean(state));
  const displayLabel = compactLabel
    .replace(/^version\s+/i, 'v')
    .replace(/\s*\(Latest\)/gi, '')
    .trim();

  return {
    optionLabel: states.length
      ? `${displayLabel} - ${states.join(', ')}`
      : displayLabel,
  };
}
