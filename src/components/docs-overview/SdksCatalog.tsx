import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
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
  { label: 'Server', platformIds: ['typescript', 'python', 'go'] },
  {
    label: 'Mobile',
    platformIds: ['android', 'ios', 'react-native', 'flutter'],
  },
  { label: 'Web', platformIds: ['web', 'react-js', 'electron'] },
  { label: 'Desktop', platformIds: ['windows', 'macos', 'linux'] },
  { label: 'Game engines', platformIds: ['unity', 'unreal-engine'] },
] as const;

const PLATFORM_ORDER = platformGroups.flatMap((group) => group.platformIds);

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
  defaultProduct: SdkDownloadProduct;
  platforms: ProductPlatformEntry[];
};

function buildProductGroups(): ProductGroup[] {
  const order: string[] = [];
  const entriesByLabel = new Map<string, ProductPlatformEntry[]>();

  for (const platform of sdkDownloadPlatforms) {
    for (const kind of ['core', 'addOns'] as const) {
      for (const product of platform[kind] ?? []) {
        let entries = entriesByLabel.get(product.label);
        if (!entries) {
          entries = [];
          entriesByLabel.set(product.label, entries);
          order.push(product.label);
        }
        entries.push({
          platformId: platform.id,
          platformLabel: platform.label,
          product,
        });
      }
    }
  }

  return order.map((label) => {
    const platforms = (entriesByLabel.get(label) ?? [])
      .slice()
      .sort((a, b) => platformRank(a.platformId) - platformRank(b.platformId));

    return {
      label,
      defaultProduct: platforms[0].product,
      platforms,
    };
  });
}

export function SdksCatalog() {
  const productGroups = useMemo(buildProductGroups, []);

  return (
    <section className="not-prose my-8 flex flex-col gap-3">
      {productGroups.map((group) => (
        <ProductCard group={group} key={group.label} />
      ))}
    </section>
  );
}

function ProductCard({ group }: { group: ProductGroup }) {
  const [platformId, setPlatformId] = useState(group.platforms[0].platformId);
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
                key={`${activePlatform.platformId}-${version.id}`}
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
        <InstallArea command={command} version={activeVersion} />
      ) : null}
    </article>
  );
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
  if (normalized.includes('video')) {
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
