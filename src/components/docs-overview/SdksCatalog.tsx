import {
  ArrowUpRightIcon,
  BoxesIcon,
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
  sdkDownloadPlatforms,
  type SdkDownloadPlatform,
  type SdkDownloadProduct,
} from './sdk-downloads-data';

export function SdksCatalog() {
  const initialPlatformId = useMemo(getInitialPlatformId, []);
  const [activePlatformId, setActivePlatformId] = useState(initialPlatformId);
  const activePlatform =
    sdkDownloadPlatforms.find((platform) => platform.id === activePlatformId) ??
    sdkDownloadPlatforms[0];

  return (
    <section className="not-prose my-8">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-border border-b px-5 py-4">
            <h3 className="m-0 text-sm font-semibold text-foreground">
              Platforms
            </h3>
          </div>
          <div className="grid gap-1 p-3">
            {sdkDownloadPlatforms.map((platform) => (
              <button
                aria-pressed={platform.id === activePlatform.id}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors',
                  platform.id === activePlatform.id
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                key={platform.id}
                onClick={() => {
                  setActivePlatformId(platform.id);
                  syncPlatformQuery(platform.id);
                }}
                type="button"
              >
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border',
                    platform.id === activePlatform.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background',
                  )}
                >
                  {platform.id === activePlatform.id ? (
                    <span className="size-1.5 rounded-full bg-current" />
                  ) : null}
                </span>
                <span>{platform.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-8">
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
    <section className="space-y-4">
      <h2 className="m-0 text-xl font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <SdkProductRow
            key={`${platform.id}-${product.id}`}
            platformId={platform.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

function SdkProductRow({
  platformId,
  product,
}: {
  platformId: string;
  product: SdkDownloadProduct;
}) {
  const [activeVersionId, setActiveVersionId] = useState(
    product.versions[0]?.id ?? '',
  );
  const activeVersion =
    product.versions.find((version) => version.id === activeVersionId) ??
    product.versions[0];

  return (
    <article className="grid gap-4 rounded-lg bg-muted/35 p-4 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(12rem,1fr)_minmax(14rem,18rem)_auto] lg:items-center lg:p-6">
      <span className="flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-xs sm:size-16">
        <SdkProductIcon productId={product.id} productLabel={product.label} />
      </span>

      <div className="min-w-0">
        <h3 className="m-0 text-lg font-semibold text-foreground">
          {product.label}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {product.info}
        </p>
      </div>

      <label className="min-w-0">
        <span className="sr-only">{`${product.label} version`}</span>
        <select
          className="h-11 w-full rounded-md border border-transparent bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:border-border focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          onChange={(event) => setActiveVersionId(event.target.value)}
          value={activeVersion?.id ?? ''}
        >
          {product.versions.map((version) => (
            <option key={`${platformId}-${product.id}-${version.id}`} value={version.id}>
              {formatVersionLabel(version.label)}
            </option>
          ))}
        </select>
      </label>

      {activeVersion ? (
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {activeVersion.packageManager ? (
            <SdkDownloadButton href={activeVersion.packageManager} type="package" />
          ) : null}
          {activeVersion.downloadLink ? (
            <SdkDownloadButton href={activeVersion.downloadLink} type="download" />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function SdkDownloadButton({
  href,
  type,
}: {
  href: string;
  type: 'download' | 'package';
}) {
  const label = type === 'package' ? 'Package Manager' : 'Direct Download';
  const Icon = type === 'package' ? ArrowUpRightIcon : DownloadIcon;

  return (
    <a
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-foreground/80 bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      href={href}
      rel="noreferrer noopener"
      target="_blank"
    >
      <span>{label}</span>
      <Icon className="size-4" />
    </a>
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
  } else if (normalized.includes('recording') || normalized.includes('gateway')) {
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

  const queryValue = new URLSearchParams(window.location.search).get('platform');

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

function formatVersionLabel(label: string) {
  return label
    .replace(/^version\s+/i, 'v')
    .replace(/^vVersion\s+/i, 'v')
    .replace(/\s+\(Latest\)$/i, ' (Latest)');
}
