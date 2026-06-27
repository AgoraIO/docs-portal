# Product-First SDKs Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the SDKs catalog as a product-first, install-first list — each product appears once with its own per-product platform tabs (no global platform picker), showing a derived install command (or download fallback) per selected platform + version.

**Architecture:** A pure `deriveInstallCommand` util (restored from git) maps a version's registry URL to a command. `SdksCatalog` inverts the platform→product data into product groups (grouped by `label`), and renders one `ProductCard` per product with underline platform tabs ordered by the canonical platform grouping.

**Tech Stack:** React, Tailwind (existing tokens), Vitest + Testing Library, TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-27-sdks-page-product-first-design.md`

---

## File Structure

- Restore: `src/components/docs-overview/sdk-install-command.ts` (+ test) from commit `7f7965f` (the fixed version: pin-from-URL, npmjs `/v/` + scoped, null fallbacks).
- Rewrite: `src/components/docs-overview/SdksCatalog.tsx` — product-first inversion + per-product platform tabs + install-first panels.
- Rewrite: `src/components/docs-overview/SdksCatalog.test.tsx` — product-first behavior.

`content/docs/en/api-reference/sdks.mdx` already has the "SDKs" rename + `hideToc`; no change. The data file is unchanged.

---

### Task 1: Restore the install-command util

**Files:**
- Restore: `src/components/docs-overview/sdk-install-command.ts`
- Restore: `src/components/docs-overview/sdk-install-command.test.ts`

- [ ] **Step 1: Restore both files from the commit that last had them (fixed version)**

```bash
git checkout 7f7965f -- src/components/docs-overview/sdk-install-command.ts src/components/docs-overview/sdk-install-command.test.ts
```

- [ ] **Step 2: Run the util tests to verify they pass**

Run: `bun run test src/components/docs-overview/sdk-install-command.test.ts`
Expected: PASS (13 tests — every registry host, the versioned/scoped npmjs cases, and the null fallbacks).

- [ ] **Step 3: Commit**

```bash
git add src/components/docs-overview/sdk-install-command.ts src/components/docs-overview/sdk-install-command.test.ts
git commit -m "feat: restore deriveInstallCommand util for product-first SDKs"
```

---

### Task 2: Rewrite SdksCatalog as product-first

**Files:**
- Modify: `src/components/docs-overview/SdksCatalog.tsx`
- Test: `src/components/docs-overview/SdksCatalog.test.tsx`

- [ ] **Step 1: Write the product-first tests**

Replace the entire contents of `src/components/docs-overview/SdksCatalog.test.tsx` with:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

describe('SdksCatalog', () => {
  it('lists each product once with platform tabs and a default install command', () => {
    render(<SdksCatalog />);

    // Product appears exactly once even though it spans many platforms.
    const videoCard = screen.getByRole('article', { name: 'Video SDK' });

    // Default platform (Android, first in canonical order) → Gradle command.
    expect(
      within(videoCard).getByText("implementation 'io.agora.rtc:full-sdk:4.6.3'"),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'true');
    // Tabs list other platforms this product supports.
    expect(within(videoCard).getByRole('tab', { name: 'Web' })).toBeInTheDocument();

    // No global platform picker remains.
    expect(
      screen.queryByRole('heading', { name: 'Platforms' }),
    ).not.toBeInTheDocument();
  });

  it('switches the install command when the platform tab changes', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });

    fireEvent.click(within(videoCard).getByRole('tab', { name: 'Web' }));

    expect(
      within(videoCard).getByText('npm i agora-rtc-sdk-ng@4.24.3'),
    ).toBeVisible();
    expect(within(videoCard).getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('updates the command when the version changes', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    const select = within(voiceCard).getByRole('combobox', {
      name: 'Voice SDK version',
    });

    fireEvent.change(select, { target: { value: '1' } });

    expect(
      within(voiceCard).getByText("implementation 'io.agora.rtc:voice-sdk:4.6.2'"),
    ).toBeVisible();
  });

  it('falls back to a download button when the platform has no derivable command', () => {
    render(<SdksCatalog />);

    const chatCard = screen.getByRole('article', { name: 'Chat SDK' });

    fireEvent.click(within(chatCard).getByRole('tab', { name: 'iOS' }));

    expect(
      within(chatCard).queryByRole('button', { name: /copy/i }),
    ).not.toBeInTheDocument();
    expect(
      within(chatCard).getByRole('link', { name: /download sdk/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/AgoraChat1_3_1.xcframework.zip',
    );
  });

  it('renders a product icon in each card', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });
    expect(videoCard.querySelector('svg')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test src/components/docs-overview/SdksCatalog.test.tsx`
Expected: FAIL — the current (restored original) component has a global platform picker, no per-product tabs, and no install command text.

- [ ] **Step 3: Replace the component with the product-first implementation**

Replace the entire contents of `src/components/docs-overview/SdksCatalog.tsx` with:

```tsx
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
  { label: 'Web', platformIds: ['web', 'react-js', 'electron'] },
  { label: 'Desktop', platformIds: ['windows', 'macos', 'linux'] },
  { label: 'Game engines', platformIds: ['unity', 'unreal-engine'] },
] as const;

const PLATFORM_ORDER = platformGroups.flatMap((group) => group.platformIds);

function platformRank(platformId: string) {
  const index = PLATFORM_ORDER.indexOf(platformId);
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
          <SdkProductIcon
            productId={group.defaultProduct.id}
            productLabel={group.label}
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
          {command ? command.tool : ' '}
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
  const iconClassName = 'size-5';
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test src/components/docs-overview/SdksCatalog.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit -p tsconfig.json` (expect exit 0).
Run: `bunx biome check --write src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx` then re-run without `--write` (expect no errors). If biome reformats the test file, re-run the test.

- [ ] **Step 6: Commit**

```bash
git add src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: product-first SDKs catalog with per-product platform tabs"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: serves locally (note the URL/port).

- [ ] **Step 2: Check the page**

Open `/en/api-reference/sdks`. Confirm:
- Products are listed **once** (Voice SDK, Video SDK, Chat SDK, Signaling SDK, …), each with its product icon, name, and description.
- Each product has **underline platform tabs** (only its platforms, in Mobile → Web → Desktop → Game order); no global platform picker exists.
- The default tab shows a derived command (Android products → Gradle); switching tabs changes the flavor (Web → `npm i …`, Flutter → `flutter pub add …`, iOS → Swift Package URL or a Download button for the github-sourced Chat SDK).
- The copy button works; changing the version updates the command; download-only products/platforms show a Download button.
- Everything uses the site palette (no blue).

- [ ] **Step 3: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Restore `deriveInstallCommand` (fixed version) → Task 1. ✓
- Product-first flat list, group by label, core-first order → Task 2 `buildProductGroups` + `SdksCatalog`. ✓
- Per-product underline platform tabs, canonical order, default first available, single-platform still a tab → Task 2 `ProductCard` (tabs from `group.platforms`, sorted by `platformRank`; default `platforms[0]`). ✓
- Install-first command/copy + secondary links; download-only fallback → Task 2 `InstallArea`. ✓
- Fixed per-product description/icon from default platform → `group.defaultProduct.info` / `.id`. ✓
- Remove global picker + `?platform=` sync + helpers → not present in the rewritten file. ✓
- Existing tokens, `bg-card` command box → Task 2. ✓
- Tests: util (Task 1) + product-first component (Task 2). ✓
- Manual check → Task 3. ✓

**Placeholder scan:** No TBD/TODO; full code in every step.

**Type consistency:** `deriveInstallCommand(version): InstallCommand | null` (Task 1) is consumed in Task 2 with that signature; `ProductGroup`/`ProductPlatformEntry` are defined and used consistently; `getVersionMeta` returns `{ optionLabel }` and is only read for `.optionLabel`. The download-only anchor (iOS Chat SDK) and command anchors (Android/Web Video SDK, Android Voice SDK v4.6.2) match the data verified during planning.
