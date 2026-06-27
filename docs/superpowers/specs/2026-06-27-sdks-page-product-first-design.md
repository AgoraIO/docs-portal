# SDKs page — product-first, install-first redesign (per-product platform tabs)

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan
**Supersedes:** the reverted install-first redesign (`2026-06-27-sdks-page-redesign-design.md`). The page rename to "SDKs" and `hideToc: true` from that work remain in place.

## Problem

The SDKs catalog uses a **global platform picker**: you choose one platform up
top and see only that platform's products. The user wants an install-first
redesign but without the global picker — each product should let you pick the
platform locally.

## Decision

Invert the layout to **product-first**: list each product **once** in a single
flat list (no Core/Add-ons section split), and give each product its **own
platform tabs**. Selecting a platform tab swaps that product's version list,
install command, and download. There is no page-level platform selector.

This reintroduces the install-first treatment (copyable, derived install
command) and keeps the original product icon.

## Data inversion

Today the data is `platform → { core[], addOns[] }`, where the same product
(e.g. "Voice SDK") appears under each platform it supports. Confirmed by
introspection: 12 distinct products, product `label` is consistent across
platforms, and each product's core/add-on kind is consistent (10 core; 2
Linux-only add-ons).

Build, in the component, a product-first view by grouping on product `label`:

```
ProductGroup = {
  label: string;            // e.g. "Voice SDK"
  info: string;             // from the product's first (default) platform
  productId: string;        // from the default platform (for the icon + ids)
  platforms: Array<{
    platformId: string;     // e.g. "android"
    platformLabel: string;  // e.g. "Android"
    versions: readonly SdkDownloadVersion[];
  }>;
}
```

- **Grouping key:** product `label`.
- **Order of the flat list:** first appearance while scanning platforms in data
  order, `core` before `addOns` within each platform. This naturally lists the
  core products first and the two Linux-only add-ons last — without section
  headings.
- **Default platform** for a product: the first entry in its `platforms` list
  (the platform where it first appeared).
- **`info`/`productId`/icon:** taken from the default platform's product entry.

## Layout

`SdksCatalog` renders a flat list of product panels (no platform picker, no
section headings, no per-platform page heading):

Each product panel (`article`, labelled by the product name):
- **Header:** the product icon (the existing `SdkProductIcon`, kept) + product
  name (`h3`) + one-line description.
- **Platform tabs:** underline-style tabs listing only the platforms that offer
  this product. The active tab uses the brand token; tabs are buttons with
  `aria-selected`/pressed state. Default = the product's first platform.
- **Per selected platform:**
  - A **version selector** (the existing `getVersionMeta` option labels), latest
    default.
  - If the selected version's `packageManager` URL yields a command via
    `deriveInstallCommand`: a **command box** (tool label + command on the
    site's code surface `bg-card`/`border-border` + a local copy button), with
    secondary "Direct download (.zip)" and "Package manager ↗" links.
  - Else (no derivable command): a primary **Download** button + optional
    package-manager link (no command box).

State is per-product: selected `platformId` and selected version index.
Switching the platform tab resets the version to that platform's latest.

## Reused / removed pieces

- **Reuse** `deriveInstallCommand` (re-add the util + tests, identical to the
  reverted version: pin from the URL only; npmjs `/v/` + scoped handled;
  github/unknown/missing → null → download-only).
- **Reuse** `SdkProductIcon` and `getVersionMeta` (already in the restored
  `SdksCatalog.tsx`).
- **Remove** the global `PlatformMatrix`, the `?platform=` URL query sync, and
  the `getInitialPlatformId` / `syncPlatformQuery` helpers — platform is now a
  per-product, non-persisted choice.
- **Tokens:** existing only (neutral brand `primary`, `bg-card`/`border-border`
  command box, `muted-foreground`). No new colors. No global picker card.

## Content

`content/docs/en/api-reference/sdks.mdx` is already `title: SDKs` + reworded
description + `hideToc: true` + `<SdksCatalog />`. No content change needed.

## Testing

- **Derivation unit tests** (`sdk-install-command.test.ts`, re-added): every
  registry host + the null cases, including the versioned npmjs `/v/<version>`
  and scoped `@scope/name` cases.
- **Component tests** (`SdksCatalog.test.tsx`, rewritten):
  - A product appears **once** even though it spans multiple platforms (e.g.
    exactly one `article` named "Video SDK").
  - Its platform tabs list only its platforms; the default tab shows the
    default platform's derived command (Android Video SDK → Gradle
    `implementation 'io.agora.rtc:full-sdk:4.6.3'`).
  - Selecting a different platform tab changes the command flavor (e.g. Web →
    `npm i …`).
  - Selecting a different version changes the command's version.
  - A product/platform with no derivable command shows the Download button and
    no command box.
  - The product icon renders; there is no global "Platforms" picker.

Manual check (once): load `/en/api-reference/sdks`; confirm products are listed
once with per-product platform tabs, install-first command boxes with working
copy, version switching, and download-only fallback — all in the site palette.

## Out of scope

- Editing `sdk-downloads-data.ts` (grouping is computed at render time).
- Any change to other api-reference pages.
- Persisting the selected platform in the URL.
