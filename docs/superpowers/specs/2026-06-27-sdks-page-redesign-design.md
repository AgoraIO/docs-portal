# Redesign the "Download SDKs" page → "SDKs" (install-first)

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan

## Problem

The `/en/api-reference/sdks` page ("Download SDKs") looks dated, and the name
"Download SDKs" reads as outdated now that SDKs are usually consumed through
package managers rather than zip downloads. The page's structure and flow are
fine (pick a platform → see its products → choose a version → get the SDK); the
goals are a **visual refresh** and a **rename**, not a navigation or content
restructure.

## Decisions

- **Rename** the page to **"SDKs"** (frontmatter `title`). The sidebar label,
  breadcrumb, and H1 all derive from it. The description is reworded away from
  the "download" verb.
- **Keep the existing structure**: platform selector → per-product entries →
  version selection. Keep the existing data (`sdk-downloads-data.ts`) and the
  `hideToc: true` catalog layout already on the page.
- **Adopt the "install-first" visual direction (Direction C):** each product is
  a panel whose hero is a **copyable install command** (derived from the
  existing package-registry URL), with the direct `.zip` download and the
  registry link as secondary actions. Products with no derivable command fall
  back to a primary Download button (no command box).
- **Use only existing design tokens** — `primary`/`primary-foreground`
  (the neutral brand token, not blue), `border`, `muted-foreground`, and the
  site's dark code-block surface for the command box. No new colors.

## Layout

Within the existing `SdksCatalog` (a `not-prose` section on the page):

1. **Header** — the page H1 ("SDKs") and a short intro reworded off "download"
   (e.g. "Add an Agora SDK to your project by platform and product. Latest
   version is selected by default.").
2. **Platform selector** — the current grouped platforms (Mobile / Web /
   Desktop / Game engines) rendered as a clean row of pill buttons with the
   small group labels retained. The active platform uses the `primary` token;
   inactive pills are bordered/neutral. (Refines the existing `PlatformMatrix`;
   same grouping and behavior.)
3. **Product sections** — "Core products" and "Add-ons" headings, each listing
   the selected platform's products as **install panels**:
   - Product name + one-line description on the left; **version selector** on
     the top-right (latest selected by default).
   - **Derivable command:** a labeled command box (tool label such as "Gradle"
     / "npm" / "Flutter" + the command + a Copy button) using the dark
     code-block surface. Secondary row: "Direct download (.zip)" and the
     registry link (e.g. "Maven Central ↗").
   - **Non-derivable (download-only):** no command box; a primary Download
     (.zip) button, with any secondary link (e.g. checksum) below.
   - Switching the version updates both the command (version-pinned where
     possible) and the download link.

## Install-command derivation

A new pure, unit-testable function maps a version entry to a command. The data
model is unchanged; the command is derived from the version's existing
`packageManager` registry URL.

`deriveInstallCommand(version: SdkDownloadVersion): { tool: string; command: string } | null`

Rules, keyed by the `packageManager` URL host (version pinned where the version
is cleanly available from the URL or the version label):

- `www.npmjs.com`, `unpkg.com` → `{ tool: 'npm', command: 'npm i <package>' }`
  (package name from `/package/<name>`). Covers Web / React JS / Electron.
- `central.sonatype.com`, `search.maven.org`, `mvnrepository.com` →
  `{ tool: 'Gradle', command: "implementation '<group>:<artifact>:<version>'" }`
  (coordinate parsed from the URL path). Covers Android.
- `pub.dev` → `{ tool: 'Flutter', command: 'flutter pub add <package>' }`
  (`/packages/<name>`). Covers Flutter.
- `swiftpackageindex.com` →
  `{ tool: 'Swift Package Manager', command: 'https://github.com/<owner>/<repo>' }`
  (the package URL to add in Xcode; `<owner>/<repo>` from the path). Covers iOS.
- `pypi.org` → `{ tool: 'pip', command: 'pip install <package>' }`.
- `github.com`, `downloadsdk.easemob.com`, any other/unknown host, or a missing
  `packageManager` → `null` (download-only panel).

When the function returns `null`, the panel renders the download-first variant.

This function lives in its own file (e.g.
`src/components/docs-overview/sdk-install-command.ts`) so it can be tested
independently of the React component.

## Content

`content/docs/en/api-reference/sdks.mdx` frontmatter:
- `title: Download SDKs` → `title: SDKs`.
- Reword `description` off the "download" verb (e.g. "Add Agora SDKs to your
  project by platform, product, and version.").
- `hideToc: true` and `<SdksCatalog />` are unchanged.

`content/docs/en/api-reference/meta.json` keeps the `"sdks"` ordering entry —
no label override exists there, so the rename needs no meta change.

## Testing

- **Derivation unit tests** (`sdk-install-command.test.ts`): one assertion per
  supported registry (npm, Maven/Sonatype, pub.dev, Swift Package Index, pypi)
  producing the expected `{ tool, command }`, plus `null` for github,
  easemob, an unknown host, and a missing `packageManager`.
- **Component tests** (extend `SdksCatalog.test.tsx`): a product with a
  derivable command renders the command box (tool label + command text + a copy
  control) and not a primary download button; a download-only product renders
  the primary Download button and no command box; changing the version updates
  the rendered command/download.

Manual check (once): load `/en/api-reference/sdks`, confirm the new "SDKs" title
and install-first panels in the site palette (no blue), that switching platform
changes the command flavor (Android → Gradle, Web → npm, Flutter → pub, iOS →
Swift Package URL), and that a download-only product shows the Download button.

## Out of scope

- Restructuring the platform → product → version navigation (kept as-is).
- Editing `sdk-downloads-data.ts` content or adding authored install commands
  (commands are derived from existing data only).
- Any change to other api-reference pages.
