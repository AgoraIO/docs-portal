import {
  BoxesIcon,
  ChevronDownIcon,
  DownloadIcon,
  MessageSquareIcon,
  MicIcon,
  MonitorPlayIcon,
  RadioTowerIcon,
  ServerCogIcon,
  SmartphoneIcon,
  VideoIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  type SdkDownloadPlatform,
  type SdkDownloadProduct,
  type SdkDownloadVersion,
  sdkDownloadPlatforms,
} from './sdk-downloads-data';
import {
  deriveInstallCommand,
  type InstallCommand,
} from './sdk-install-command';

const platformGroups = [
  {
    label: 'Mobile',
    platformIds: ['android', 'ios', 'react-native', 'flutter'],
  },
  {
    label: 'Web',
    platformIds: ['web', 'react-js', 'electron'],
  },
  {
    label: 'Desktop',
    platformIds: ['windows', 'macos', 'linux'],
  },
  {
    label: 'Game engines',
    platformIds: ['unity', 'unreal-engine'],
  },
] as const;

export function SdksCatalog() {
  const initialPlatformId = useMemo(getInitialPlatformId, []);
  const [activePlatformId, setActivePlatformId] = useState(initialPlatformId);
  const activePlatform =
    sdkDownloadPlatforms.find((platform) => platform.id === activePlatformId) ??
    sdkDownloadPlatforms[0];

  return (
    <section className="not-prose my-8 flex flex-col gap-8">
      <PlatformSelector
        activePlatform={activePlatform}
        onPlatformChange={(platformId) => {
          setActivePlatformId(platformId);
          syncPlatformQuery(platformId);
        }}
      />

      <div className="flex flex-col gap-8">
        <SdkProductSection
          products={activePlatform.core}
          platform={activePlatform}
          title="Core products"
        />
        {activePlatform.addOns?.length ? (
          <SdkProductSection
            products={activePlatform.addOns}
            platform={activePlatform}
            title="Add-ons"
          />
        ) : null}
      </div>
    </section>
  );
}

function PlatformSelector({
  activePlatform,
  onPlatformChange,
}: {
  activePlatform: SdkDownloadPlatform;
  onPlatformChange: (platformId: string) => void;
}) {
  const groupedPlatformIds = new Set<string>(
    platformGroups.flatMap((group) => group.platformIds),
  );
  const resolvedGroups = platformGroups
    .map((group) => ({
      ...group,
      platforms: group.platformIds
        .map((platformId) =>
          sdkDownloadPlatforms.find((platform) => platform.id === platformId),
        )
        .filter((platform): platform is SdkDownloadPlatform =>
          Boolean(platform),
        ),
    }))
    .filter((group) => group.platforms.length > 0);
  const ungroupedPlatforms = sdkDownloadPlatforms.filter(
    (platform) => !groupedPlatformIds.has(platform.id),
  );
  const allGroups = ungroupedPlatforms.length
    ? [
        ...resolvedGroups,
        {
          label: 'Other',
          platformIds: ungroupedPlatforms.map((platform) => platform.id),
          platforms: ungroupedPlatforms,
        },
      ]
    : resolvedGroups;

  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
      {allGroups.map((group) => (
        <fieldset
          className="m-0 flex min-w-0 items-center gap-2 border-0 p-0"
          key={group.label}
        >
          <legend className="sr-only">{`${group.label} platforms`}</legend>
          <span
            aria-hidden="true"
            className="text-[0.66rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
          >
            {group.label}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {group.platforms.map((platform) => {
              const isActive = platform.id === activePlatform.id;

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                  key={platform.id}
                  onClick={() => onPlatformChange(platform.id)}
                  type="button"
                >
                  {platform.label}
                </button>
              );
            })}
          </span>
        </fieldset>
      ))}
    </div>
  );
}

function SdkProductSection({
  platform,
  products,
  title,
}: {
  platform: SdkDownloadPlatform;
  products: readonly SdkDownloadProduct[];
  title: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-[1.05rem] font-semibold text-foreground">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <SdkProductCard
            key={`${platform.id}-${product.id}`}
            platformId={platform.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

function SdkProductCard({
  platformId,
  product,
}: {
  platformId: string;
  product: SdkDownloadProduct;
}) {
  const [activeVersionIndex, setActiveVersionIndex] = useState('0');
  const activeVersion =
    product.versions[Number(activeVersionIndex)] ?? product.versions[0];
  const productTitleId = `${platformId}-${product.id}-title`;
  const productVersionId = `${platformId}-${product.id}-version`;
  const installCommand = activeVersion
    ? deriveInstallCommand(activeVersion)
    : null;

  return (
    <article
      aria-labelledby={productTitleId}
      className="rounded-xl border border-border p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <SdkProductIcon
              productId={product.id}
              productLabel={product.label}
            />
          </span>
          <div className="min-w-0">
            <h3
              className="m-0 text-base font-semibold text-foreground"
              id={productTitleId}
            >
              {product.label}
            </h3>
            <p className="m-0 mt-1 text-sm leading-6 text-muted-foreground">
              {product.info}
            </p>
          </div>
        </div>

        <span className="relative shrink-0">
          <label className="sr-only" htmlFor={productVersionId}>
            {`${product.label} version`}
          </label>
          <select
            className="h-9 appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            id={productVersionId}
            onChange={(event) => setActiveVersionIndex(event.target.value)}
            value={activeVersionIndex}
          >
            {product.versions.map((version, index) => (
              <option
                key={`${platformId}-${product.id}-${version.id}`}
                value={String(index)}
              >
                {getVersionMeta(version, index).optionLabel}
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
        <SdkGetSection command={installCommand} version={activeVersion} />
      ) : null}
    </article>
  );
}

function SdkGetSection({
  command,
  version,
}: {
  command: InstallCommand | null;
  version: SdkDownloadVersion;
}) {
  if (command) {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          {command.tool}
        </span>
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
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
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
      aria-label="Copy install command"
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

function SdkProductIcon({
  productId,
  productLabel,
}: {
  productId: string;
  productLabel: string;
}) {
  const normalized = `${productId} ${productLabel}`.toLowerCase();
  const iconClassName = 'size-7';
  let icon: ReactNode;

  if (normalized.includes('voice')) {
    icon = <MicIcon className={iconClassName} />;
  } else if (normalized.includes('video')) {
    icon = <VideoIcon className={iconClassName} />;
  } else if (normalized.includes('chat')) {
    icon = <MessageSquareIcon className={iconClassName} />;
  } else if (normalized.includes('signaling') || normalized.includes('rtm')) {
    icon = <RadioTowerIcon className={iconClassName} />;
  } else if (normalized.includes('iot')) {
    icon = <SmartphoneIcon className={iconClassName} />;
  } else if (
    normalized.includes('recording') ||
    normalized.includes('gateway')
  ) {
    icon = <ServerCogIcon className={iconClassName} />;
  } else if (normalized.includes('media')) {
    icon = <MonitorPlayIcon className={iconClassName} />;
  } else {
    icon = <BoxesIcon className={iconClassName} />;
  }

  return icon;
}

function getInitialPlatformId() {
  if (typeof window === 'undefined') {
    return sdkDownloadPlatforms[0]?.id ?? 'android';
  }

  const queryValue = new URLSearchParams(window.location.search).get(
    'platform',
  );

  if (!queryValue) {
    return sdkDownloadPlatforms[0]?.id ?? 'android';
  }

  const normalizedQueryValue = normalizePlatformId(queryValue);
  const matchingPlatform = sdkDownloadPlatforms.find((platform) => {
    return (
      platform.id === normalizedQueryValue ||
      normalizePlatformId(platform.label) === normalizedQueryValue
    );
  });

  return matchingPlatform?.id ?? sdkDownloadPlatforms[0]?.id ?? 'android';
}

function syncPlatformQuery(platformId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('platform', platformId);
  window.history.replaceState(window.history.state, '', url);
}

function normalizePlatformId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function getVersionMeta(version: SdkDownloadVersion, index: number) {
  const compactLabel = version.label.trim().replace(/\s+/g, ' ');
  const isLatest = /\(Latest\)|\bLatest\b/i.test(compactLabel);
  const isLite = /\bLite\b/i.test(compactLabel);
  const isLegacy = /\bLegacy\b/i.test(compactLabel);
  const tags = [
    isLatest ? 'Latest' : null,
    isLite ? 'Lite' : null,
    isLegacy ? 'Legacy' : null,
    !isLatest && !isLegacy && index > 0 ? 'Previous' : null,
  ].filter(Boolean);
  const displayLabel = compactLabel
    .replace(/^version\s+/i, 'v')
    .replace(/^vVersion\s+/i, 'v')
    .replace(/\s*\(Latest\)/gi, '')
    .trim();

  return {
    optionLabel: tags.length
      ? `${displayLabel} - ${tags.join(', ')}`
      : displayLabel,
  };
}
