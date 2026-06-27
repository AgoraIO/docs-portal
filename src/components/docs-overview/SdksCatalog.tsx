import {
  ArrowUpRightIcon,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import {
  type SdkDownloadPlatform,
  type SdkDownloadProduct,
  type SdkDownloadVersion,
  sdkDownloadPlatforms,
} from './sdk-downloads-data';

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
      <PlatformMatrix
        activePlatform={activePlatform}
        onPlatformChange={(platformId) => {
          setActivePlatformId(platformId);
          syncPlatformQuery(platformId);
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-2xl font-semibold text-foreground">
            {activePlatform.label} SDKs
          </h2>
          <p className="m-0 text-sm leading-6 text-muted-foreground">
            Latest versions are selected by default.
          </p>
        </div>

        <SdkProductSection
          products={activePlatform.core}
          platform={activePlatform}
          title="Core Products"
        />
        {activePlatform.addOns?.length ? (
          <SdkProductSection
            products={activePlatform.addOns}
            platform={activePlatform}
            title="Product Add-ons"
          />
        ) : null}
      </div>
    </section>
  );
}

function PlatformMatrix({
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
    <section
      aria-labelledby="sdk-platforms-heading"
      className="rounded-lg border border-border bg-card/80 p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="m-0 text-sm font-semibold text-foreground"
          id="sdk-platforms-heading"
        >
          Platforms
        </h2>
        <Badge variant="outline">{activePlatform.label}</Badge>
      </div>

      <div className="grid gap-3">
        {allGroups.map((group) => (
          <fieldset className="m-0 min-w-0 border-0 p-0" key={group.label}>
            <legend className="sr-only">{`${group.label} platforms`}</legend>
            <div className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start">
              <div
                aria-hidden="true"
                className="pt-1 text-xs font-semibold uppercase text-muted-foreground"
              >
                {group.label}
              </div>
              <div className="flex min-w-0 flex-wrap gap-2">
                {group.platforms.map((platform) => {
                  const isActive = platform.id === activePlatform.id;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={cn(
                        'inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
                      )}
                      key={platform.id}
                      onClick={() => onPlatformChange(platform.id)}
                      type="button"
                    >
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
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
    <section className="flex flex-col gap-4">
      <h2 className="m-0 text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4">
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
  const selectedVersionIndex = Number(activeVersionIndex);
  const activeVersionMeta = getVersionMeta(activeVersion, selectedVersionIndex);
  const productTitleId = `${platformId}-${product.id}-title`;
  const productVersionId = `${platformId}-${product.id}-version`;

  return (
    <Card
      aria-labelledby={productTitleId}
      className="flex min-h-[18rem] flex-col rounded-lg shadow-sm"
      role="article"
    >
      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-14">
            <SdkProductIcon
              productId={product.id}
              productLabel={product.label}
            />
          </span>
          <div className="min-w-0">
            <h3
              className="m-0 text-lg font-semibold text-foreground"
              id={productTitleId}
            >
              {product.label}
            </h3>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {product.info}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:items-end">
          <div className="flex min-w-0 flex-col gap-2">
            <label
              className="text-xs font-semibold uppercase text-muted-foreground"
              htmlFor={productVersionId}
            >
              Selected version
            </label>
            <span className="relative">
              <select
                aria-label={`${product.label} version`}
                className="h-11 w-full appearance-none rounded-md border border-border bg-background px-3 pr-10 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                id={productVersionId}
                onChange={(event) => setActiveVersionIndex(event.target.value)}
                value={activeVersionIndex}
              >
                {product.versions.map((version, index) => {
                  const versionMeta = getVersionMeta(version, index);

                  return (
                    <option
                      key={`${platformId}-${product.id}-${version.id}-${version.downloadLink ?? version.packageManager ?? version.label}`}
                      value={String(index)}
                    >
                      {versionMeta.optionLabel}
                    </option>
                  );
                })}
              </select>
              <ChevronDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeVersionMeta.states.map((state) => (
              <Badge key={state} variant={getVersionStateVariant(state)}>
                {state}
              </Badge>
            ))}
          </div>
        </div>

        {activeVersion ? <SdkDownloadActions version={activeVersion} /> : null}
      </CardContent>
    </Card>
  );
}

function SdkDownloadActions({ version }: { version: SdkDownloadVersion }) {
  return (
    <div className="mt-auto border-border border-t pt-4">
      <p className="m-0 text-xs font-semibold uppercase text-muted-foreground">
        Download options
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {version.downloadLink ? (
          <Button asChild size="sm">
            <a
              href={version.downloadLink}
              rel="noreferrer noopener"
              target="_blank"
            >
              <DownloadIcon data-icon="inline-start" />
              <span>Download SDK</span>
            </a>
          </Button>
        ) : null}
        {version.packageManager ? (
          <Button asChild size="sm" variant="outline">
            <a
              href={version.packageManager}
              rel="noreferrer noopener"
              target="_blank"
            >
              <span>Package Manager</span>
              <ArrowUpRightIcon data-icon="inline-end" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
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
  const states = [
    isLatest ? 'Latest' : null,
    isLite ? 'Lite' : null,
    isLegacy ? 'Legacy' : null,
    !isLatest && !isLegacy && index > 0 ? 'Previous' : null,
  ].filter((state): state is VersionState => Boolean(state));
  const displayLabel = compactLabel
    .replace(/^version\s+/i, 'v')
    .replace(/^vVersion\s+/i, 'v')
    .replace(/\s*\(Latest\)/gi, '')
    .trim();

  return {
    displayLabel,
    optionLabel: states.length
      ? `${displayLabel} - ${states.join(', ')}`
      : displayLabel,
    states: states.length ? states : (['Previous'] satisfies VersionState[]),
  };
}

type VersionState = 'Latest' | 'Lite' | 'Legacy' | 'Previous';

function getVersionStateVariant(state: VersionState) {
  if (state === 'Latest') {
    return 'default';
  }

  if (state === 'Previous') {
    return 'outline';
  }

  return 'secondary';
}
