# SDKs Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the "Download SDKs" page to "SDKs" and redesign its catalog into an install-first layout — each product shows a copyable install command (derived from the existing package-registry URL) with direct download as a secondary action, falling back to a download button where no command can be derived.

**Architecture:** A new pure function `deriveInstallCommand` maps a version's `packageManager` URL to a `{ tool, command }` (or `null`). `SdksCatalog` consumes it to render install panels, keeping the existing platform-selector and version-selector behavior. A small local copy button handles clipboard. Existing data (`sdk-downloads-data.ts`) is unchanged.

**Tech Stack:** React, Tailwind (existing design tokens), Vitest + Testing Library, TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-27-sdks-page-redesign-design.md`

---

## File Structure

- Create: `src/components/docs-overview/sdk-install-command.ts` — pure `deriveInstallCommand`.
- Create: `src/components/docs-overview/sdk-install-command.test.ts` — derivation unit tests.
- Modify: `content/docs/en/api-reference/sdks.mdx` — rename title + reword description.
- Modify: `src/components/docs-overview/SdksCatalog.tsx` — install-first redesign.
- Modify: `src/components/docs-overview/SdksCatalog.test.tsx` — rewrite to the new structure.

Tasks: (1) derivation util, (2) rename, (3) component redesign + test rewrite, (4) manual check. Order matters: Task 3 imports the util from Task 1.

---

### Task 1: `deriveInstallCommand` pure function

**Files:**
- Create: `src/components/docs-overview/sdk-install-command.ts`
- Test: `src/components/docs-overview/sdk-install-command.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/docs-overview/sdk-install-command.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { deriveInstallCommand } from './sdk-install-command';

const v = (packageManager?: string) => ({
  id: 'x',
  label: 'Version 1.0.0',
  packageManager,
});

describe('deriveInstallCommand', () => {
  it('derives a Gradle command from a Maven Central URL', () => {
    expect(
      deriveInstallCommand(
        v('https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.3/aar'),
      ),
    ).toEqual({
      tool: 'Gradle',
      command: "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
    });
  });

  it('derives a Gradle command from a search.maven.org URL', () => {
    expect(
      deriveInstallCommand(
        v('https://search.maven.org/artifact/io.agora.rtc/chat-sdk/1.3.2/aar'),
      ),
    ).toEqual({
      tool: 'Gradle',
      command: "implementation 'io.agora.rtc:chat-sdk:1.3.2'",
    });
  });

  it('derives a pinned Flutter command from a pub.dev versions URL', () => {
    expect(
      deriveInstallCommand(
        v('https://pub.dev/packages/agora_rtc_engine/versions/6.6.2'),
      ),
    ).toEqual({ tool: 'Flutter', command: 'flutter pub add agora_rtc_engine:6.6.2' });
  });

  it('derives an unpinned Flutter command from a pub.dev package URL', () => {
    expect(
      deriveInstallCommand(v('https://pub.dev/packages/agora_rtc_engine')),
    ).toEqual({ tool: 'Flutter', command: 'flutter pub add agora_rtc_engine' });
  });

  it('derives a pinned npm command from an unpkg URL', () => {
    expect(
      deriveInstallCommand(v('https://unpkg.com/agora-rtc-react@2.3.0/dist/')),
    ).toEqual({ tool: 'npm', command: 'npm i agora-rtc-react@2.3.0' });
  });

  it('derives an unpinned npm command from an npmjs URL', () => {
    expect(
      deriveInstallCommand(v('https://www.npmjs.com/package/agora-chat')),
    ).toEqual({ tool: 'npm', command: 'npm i agora-chat' });
  });

  it('derives a Swift Package URL from a Swift Package Index URL', () => {
    expect(
      deriveInstallCommand(v('https://swiftpackageindex.com/AgoraIO/AgoraAudio_iOS')),
    ).toEqual({
      tool: 'Swift Package Manager',
      command: 'https://github.com/AgoraIO/AgoraAudio_iOS',
    });
  });

  it('derives a pip command from a pypi URL', () => {
    expect(
      deriveInstallCommand(v('https://pypi.org/project/agora-python-server-sdk/')),
    ).toEqual({ tool: 'pip', command: 'pip install agora-python-server-sdk' });
  });

  it('returns null for github release/source pages', () => {
    expect(
      deriveInstallCommand(
        v('https://github.com/AgoraIO/AgoraChat_iOS.git'),
      ),
    ).toBeNull();
  });

  it('returns null for an unknown host', () => {
    expect(
      deriveInstallCommand(v('https://downloadsdk.easemob.com/whatever')),
    ).toBeNull();
  });

  it('returns null when packageManager is missing', () => {
    expect(deriveInstallCommand(v(undefined))).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test src/components/docs-overview/sdk-install-command.test.ts`
Expected: FAIL — module `./sdk-install-command` does not exist.

- [ ] **Step 3: Implement the function**

Create `src/components/docs-overview/sdk-install-command.ts`:

```ts
import type { SdkDownloadVersion } from './sdk-downloads-data';

export type InstallCommand = { tool: string; command: string };

/**
 * Derive a copyable install command from a version's package-registry URL.
 * The version is pinned only when the URL itself carries it (Maven, pub, unpkg);
 * npmjs / Swift Package Index / pypi URLs have no version, so those are
 * unpinned. Unknown hosts (github release pages, easemob, etc.) and a missing
 * URL return null, which the UI renders as a download-only product.
 */
export function deriveInstallCommand(
  version: SdkDownloadVersion,
): InstallCommand | null {
  const raw = version.packageManager;
  if (!raw) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);

  switch (url.hostname) {
    case 'central.sonatype.com':
    case 'search.maven.org': {
      // /artifact/<group>/<artifact>/<version>/...
      if (segments[0] === 'artifact' && segments.length >= 4) {
        const [, group, artifact, mavenVersion] = segments;
        return {
          tool: 'Gradle',
          command: `implementation '${group}:${artifact}:${mavenVersion}'`,
        };
      }
      return null;
    }
    case 'pub.dev': {
      // /packages/<name>[/versions/<version>]
      if (segments[0] === 'packages' && segments[1]) {
        const name = segments[1];
        const pinned =
          segments[2] === 'versions' && segments[3] ? `:${segments[3]}` : '';
        return { tool: 'Flutter', command: `flutter pub add ${name}${pinned}` };
      }
      return null;
    }
    case 'unpkg.com': {
      // /<name>@<version>/...
      const spec = segments[0];
      return spec ? { tool: 'npm', command: `npm i ${spec}` } : null;
    }
    case 'www.npmjs.com': {
      // /package/<name>
      if (segments[0] === 'package' && segments[1]) {
        return { tool: 'npm', command: `npm i ${segments[1]}` };
      }
      return null;
    }
    case 'swiftpackageindex.com': {
      // /<owner>/<repo>
      if (segments.length >= 2) {
        return {
          tool: 'Swift Package Manager',
          command: `https://github.com/${segments[0]}/${segments[1]}`,
        };
      }
      return null;
    }
    case 'pypi.org': {
      // /project/<name>/
      if (segments[0] === 'project' && segments[1]) {
        return { tool: 'pip', command: `pip install ${segments[1]}` };
      }
      return null;
    }
    default:
      return null;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test src/components/docs-overview/sdk-install-command.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/docs-overview/sdk-install-command.ts src/components/docs-overview/sdk-install-command.test.ts
git commit -m "feat: derive SDK install command from package-registry URL"
```

---

### Task 2: Rename the page to "SDKs"

**Files:**
- Modify: `content/docs/en/api-reference/sdks.mdx`

- [ ] **Step 1: Update the frontmatter**

Replace the frontmatter of `content/docs/en/api-reference/sdks.mdx`:

```mdx
---
title: Download SDKs
description: Download Agora SDKs by product, platform, and version.
hideToc: true
---
```

with:

```mdx
---
title: SDKs
description: Add Agora SDKs to your project by platform, product, and version. The latest version is selected by default.
hideToc: true
---
```

Leave `<SdksCatalog />` unchanged.

- [ ] **Step 2: Verify**

Run: `grep -nE "^title:|^description:" content/docs/en/api-reference/sdks.mdx`
Expected: `title: SDKs` and the new description.

- [ ] **Step 3: Commit**

```bash
git add content/docs/en/api-reference/sdks.mdx
git commit -m "feat: rename Download SDKs page to SDKs"
```

---

### Task 3: Install-first redesign of SdksCatalog

**Files:**
- Modify: `src/components/docs-overview/SdksCatalog.tsx`
- Test: `src/components/docs-overview/SdksCatalog.test.tsx`

Context: keep `getInitialPlatformId`, `syncPlatformQuery`, `normalizePlatformId`, `getVersionMeta`, `SdkProductIcon`, `platformGroups`, and the data imports. This task replaces the platform selector chrome, the per-platform headings, and the product card body with install-first panels. It removes the `Card`/`CardContent`/`CardHeader`, `Badge`, `Button`, and `ArrowUpRightIcon`/`DownloadIcon` usages where they no longer apply (see imports note at the end of Step 3).

- [ ] **Step 1: Rewrite the component tests to the new structure**

Replace the entire body of `src/components/docs-overview/SdksCatalog.test.tsx` with:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

describe('SdksCatalog', () => {
  it('keeps platform buttons as a pressed-state selector synced to the URL', () => {
    window.history.pushState(null, '', '/en/api-reference/sdks?platform=ios');

    render(<SdksCatalog />);

    expect(screen.getByRole('button', { name: 'iOS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Android' }));

    expect(window.location.search).toBe('?platform=android');
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: 'Core products' }),
    ).toBeVisible();
  });

  it('shows a copyable install command for a product with a derivable registry', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    // Derived Gradle command is the hero.
    expect(
      within(voiceCard).getByText("implementation 'io.agora.rtc:voice-sdk:4.6.3'"),
    ).toBeVisible();
    expect(
      within(voiceCard).getByRole('button', { name: /copy/i }),
    ).toBeVisible();
    // Direct download is a secondary link, not a primary button.
    expect(
      within(voiceCard).getByRole('link', { name: /direct download/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_VOICE.zip',
    );
  });

  it('updates the command when the selected version changes', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    const versionSelect = within(voiceCard).getByRole('combobox', {
      name: 'Voice SDK version',
    });

    fireEvent.change(versionSelect, { target: { value: '1' } });

    expect(
      within(voiceCard).getByText("implementation 'io.agora.rtc:voice-sdk:4.6.2'"),
    ).toBeVisible();
  });

  it('falls back to a download button when no command can be derived', () => {
    window.history.pushState(null, '', '/en/api-reference/sdks?platform=ios');

    render(<SdksCatalog />);

    const chatCard = screen.getByRole('article', { name: 'Chat SDK' });

    // github source → no derived command → primary download, no command box.
    expect(
      within(chatCard).queryByRole('button', { name: /copy/i }),
    ).not.toBeInTheDocument();
    expect(
      within(chatCard).getByRole('link', { name: /download/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/AgoraChat1_3_1.xcframework.zip',
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test src/components/docs-overview/SdksCatalog.test.tsx`
Expected: FAIL — the current UI has no command text, copy button, or "Direct download" link; headings/labels differ.

- [ ] **Step 3: Implement the redesign**

In `src/components/docs-overview/SdksCatalog.tsx`:

(a) Replace the top of the file's `SdksCatalog` return so the catalog drops the "Platforms" card heading and the per-platform heading, and renames the sections. Replace the existing `SdksCatalog` function's `return (...)` body (the `<section className="not-prose my-8 ...">...</section>` block, currently lines ~53-87) with:

```tsx
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
```

(b) Replace the entire `PlatformMatrix` function with a `PlatformSelector` that renders grouped pills (no "Platforms" card heading/badge), keeping the `aria-pressed` buttons and groups:

```tsx
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
        <fieldset className="m-0 flex min-w-0 items-center gap-2 border-0 p-0" key={group.label}>
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
```

(c) Update `SdkProductSection` heading style (keep the prop-driven title, now "Core products" / "Add-ons"):

```tsx
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
```

(d) Replace `SdkProductCard` and `SdkDownloadActions` with the install-first panel + a local copy button. Replace both functions entirely with:

```tsx
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
            <SdkProductIcon productId={product.id} productLabel={product.label} />
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
            aria-label={`${product.label} version`}
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
        <div className="flex items-center justify-between gap-3 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2.5">
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
```

(e) Fix imports. At the top of `SdksCatalog.tsx`:
- Add: `import { deriveInstallCommand, type InstallCommand } from './sdk-install-command';`
- Remove now-unused imports: `ArrowUpRightIcon`, `BoxesIcon` stays (used by SdkProductIcon), `Badge` (from `@/components/ui/badge`), `Button` (from `@/components/ui/button`), `Card`, `CardContent`, `CardHeader` (from `@/components/ui/card`). Remove the `getVersionStateVariant` function and the `VersionState` type only if they become unused (the `getVersionMeta` `states` field is still computed internally but no longer rendered as Badges — if `VersionState`/`getVersionStateVariant` are unused after the edit, delete them).
- Keep: `ChevronDownIcon`, `DownloadIcon`, the lucide product icons used by `SdkProductIcon`, `cn`, `useMemo`, `useState`, and the `sdk-downloads-data` imports.

Run `bunx tsc --noEmit -p tsconfig.json` after editing to catch any unused-import / type errors and fix them (remove dead imports the editor flags).

- [ ] **Step 4: Run the component tests to verify they pass**

Run: `bun run test src/components/docs-overview/SdksCatalog.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit -p tsconfig.json` (expect exit 0).
Run: `bunx biome check --write src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx src/components/docs-overview/sdk-install-command.ts src/components/docs-overview/sdk-install-command.test.ts` then re-run without `--write` (expect no errors). If biome reformats a test file, re-run that test.

- [ ] **Step 6: Commit**

```bash
git add src/components/docs-overview/SdksCatalog.tsx src/components/docs-overview/SdksCatalog.test.tsx
git commit -m "feat: install-first redesign of the SDKs catalog"
```

---

### Task 4: Manual verification

- [ ] **Step 1: Start the dev server**

Run: `bun run dev`
Expected: serves locally (note the URL/port).

- [ ] **Step 2: Check the redesigned page**

Open `/en/api-reference/sdks`. Confirm:
- The page title/sidebar/breadcrumb read "SDKs" (not "Download SDKs").
- Platform pills are grouped (Mobile/Web/Desktop/Game) in the site's neutral palette (no blue); the active pill uses the primary token.
- Android products show a Gradle command box with a working Copy button + a "Direct download" secondary link.
- Switching to Web shows `npm i …`, Flutter shows `flutter pub add …`, iOS shows a Swift Package URL (for SPM products) and a Download button for the github-sourced Chat SDK.
- Changing a version updates the command (e.g. Android Voice SDK 4.6.3 → 4.6.2).

- [ ] **Step 3: Stop the dev server**

Stop the `bun run dev` process.

---

## Self-Review

**Spec coverage:**
- Rename to "SDKs" + reworded description → Task 2. ✓
- `deriveInstallCommand` pure function with the per-host rules + null fallbacks → Task 1 (impl + tests cover every host and the null cases). ✓
- Install-first panels (command hero + version selector + secondary download/registry) → Task 3 Step 3(d) `SdkGetSection` (command branch). ✓
- Download-only fallback → Task 3 Step 3(d) `SdkGetSection` (null branch). ✓
- Pin only from the URL → encoded in Task 1's rules (Maven/pub/unpkg pinned; npmjs/SPM/pypi unpinned). ✓
- Existing tokens only; dark code surface; local copy button → Task 3 `CopyButton` + token-based classes. ✓
- Keep platform/version behavior + data unchanged → Task 3 keeps `getInitialPlatformId`/`syncPlatformQuery`/`getVersionMeta`; data untouched. ✓
- Tests: derivation unit (Task 1) + component (Task 3). ✓
- Manual check → Task 4. ✓

**Placeholder scan:** No TBD/TODO; full code in every step.

**Type consistency:** `deriveInstallCommand(version: SdkDownloadVersion): InstallCommand | null` is defined in Task 1 and consumed with that exact signature in Task 3 (`installCommand = deriveInstallCommand(activeVersion)`, passed as `command: InstallCommand | null` to `SdkGetSection`). `SdkProductIcon`, `getVersionMeta`, `syncPlatformQuery`, `platformGroups`, and the data types are reused unchanged.
