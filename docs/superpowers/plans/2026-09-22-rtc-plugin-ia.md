# RTC Plugin IA Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the zh-CN RTC plugin documentation into a nested 「集成插件能力 → Web 插件」 information architecture, update all canonical links, and preserve old URLs with permanent redirects.

**Architecture:** Use the existing Fumadocs folder metadata model. `rtc/build/meta.json` will expose the `extensions` folder as the 「集成插件能力」 entry; `extensions/meta.json` will contain the face-capture page and the `web` child folder; `extensions/web/meta.json` will own the existing Web plugin pages. Product IA redirects will cover both the old migrated paths and the pre-migration `/build/...` paths, returning the existing 301 payload for zh-CN Build moves.

**Tech Stack:** Fumadocs `meta.json`, MDX content, TypeScript/Vitest, generated docs-last-updated manifest, CSV migration path maps.

---

### Task 1: Move the RTC plugin content and rebuild the navigation metadata

**Files:**
- Move: `content/docs/zh-CN/realtime-media/rtc/build/video/face-capture.mdx` → `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx`
- Move: the nine existing MDX files in `content/docs/zh-CN/realtime-media/rtc/build/extensions/` → the matching paths under `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/`
- Modify: `content/docs/zh-CN/realtime-media/rtc/build/meta.json`
- Modify: `content/docs/zh-CN/realtime-media/rtc/build/extensions/meta.json`
- Create: `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/meta.json`
- Modify: `content/docs/zh-CN/realtime-media/rtc/build/video/meta.json`

- [ ] **Step 1: Move the files with Git-aware renames**

Run:

```bash
git mv content/docs/zh-CN/realtime-media/rtc/build/video/face-capture.mdx content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx
mkdir -p content/docs/zh-CN/realtime-media/rtc/build/extensions/web
for page in overview release image-enhancement noise-reduction super-clarity video-compositing virtual-background voice-activity-detection watermark; do
  git mv "content/docs/zh-CN/realtime-media/rtc/build/extensions/$page.mdx" "content/docs/zh-CN/realtime-media/rtc/build/extensions/web/$page.mdx"
done
```

Expected: no source file remains at the old physical path.

- [ ] **Step 2: Make `extensions` the nested 「集成插件能力」 folder**

Change the final group entry in `content/docs/zh-CN/realtime-media/rtc/build/meta.json` to the folder string `"extensions"`. Set `content/docs/zh-CN/realtime-media/rtc/build/extensions/meta.json` to:

```json
{
  "title": "集成插件能力",
  "pages": ["face-capture", "web"]
}
```

Remove `"face-capture"` from the 「视频效果」 group in `content/docs/zh-CN/realtime-media/rtc/build/video/meta.json`.

- [ ] **Step 3: Add the Web plugin child metadata**

Create `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/meta.json`:

```json
{
  "title": "Web 插件",
  "pages": [
    "overview",
    "release",
    "image-enhancement",
    "virtual-background",
    "noise-reduction",
    "super-clarity",
    "video-compositing",
    "voice-activity-detection",
    "watermark"
  ]
}
```

- [ ] **Step 4: Check the structural diff**

Run `git diff --check` and `git status --short`. Expected: only the intended RTC metadata and MDX moves are present, with no duplicate old/new content files.

### Task 2: Add canonical redirects and IA regression coverage

**Files:**
- Modify: `src/lib/zh-cn-product-ia-redirects.ts`
- Modify: `src/lib/zh-cn-product-ia-standard.test.ts`

- [ ] **Step 1: Update historical RTC plugin targets**

Change the existing targets for `realtime-media/rtc/advanced-features/extensions/{overview,release,image-enhancement,virtual-background,noise-reduction,super-clarity,video-compositing,voice-activity-detection,watermark}` to `/zh-CN/realtime-media/rtc/build/extensions/web/<slug>`. Change the existing face-capture target to `/zh-CN/realtime-media/rtc/build/extensions/face-capture`.

- [ ] **Step 2: Add direct redirects for superseded Build paths**

Add these exact entries to `ZH_CN_PRODUCT_IA_REDIRECTS`:

```ts
'realtime-media/rtc/build/extensions/overview': '/zh-CN/realtime-media/rtc/build/extensions/web/overview',
'realtime-media/rtc/build/extensions/release': '/zh-CN/realtime-media/rtc/build/extensions/web/release',
'realtime-media/rtc/build/extensions/image-enhancement': '/zh-CN/realtime-media/rtc/build/extensions/web/image-enhancement',
'realtime-media/rtc/build/extensions/virtual-background': '/zh-CN/realtime-media/rtc/build/extensions/web/virtual-background',
'realtime-media/rtc/build/extensions/noise-reduction': '/zh-CN/realtime-media/rtc/build/extensions/web/noise-reduction',
'realtime-media/rtc/build/extensions/super-clarity': '/zh-CN/realtime-media/rtc/build/extensions/web/super-clarity',
'realtime-media/rtc/build/extensions/video-compositing': '/zh-CN/realtime-media/rtc/build/extensions/web/video-compositing',
'realtime-media/rtc/build/extensions/voice-activity-detection': '/zh-CN/realtime-media/rtc/build/extensions/web/voice-activity-detection',
'realtime-media/rtc/build/extensions/watermark': '/zh-CN/realtime-media/rtc/build/extensions/web/watermark',
'realtime-media/rtc/build/video/face-capture': '/zh-CN/realtime-media/rtc/build/extensions/face-capture',
```

These entries make the old Build URLs return the existing 301 payload and prevent redirect chains.

- [ ] **Step 3: Add IA and redirect tests**

In `src/lib/zh-cn-product-ia-standard.test.ts`, add an `rtcRoot` for `content/docs/zh-CN/realtime-media/rtc`. Assert that `build/meta.json` contains `extensions`, `build/extensions/meta.json` equals `{ title: '集成插件能力', pages: ['face-capture', 'web'] }`, and `build/extensions/web/meta.json` has the nine-page order shown in Task 1.

Add a table-driven test for all ten direct old Build paths. Each call to `loadDocsPagePayload('zh-CN', 'realtime-media', slugSegments)` must equal `{ redirectUrl, statusCode: 301 }`; each target must resolve to a real content page and must not itself resolve to another IA redirect.

- [ ] **Step 4: Run the focused test**

Run `pnpm exec vitest run src/lib/zh-cn-product-ia-standard.test.ts`. Expected: PASS, including the existing routability test for every redirect map entry.

### Task 3: Update live references and maintained migration records

**Files:**
- Modify: matching live MDX/source fixtures under `content/docs/zh-CN` and `src`
- Modify: `docs/migration/path-map.csv`
- Modify: `docs/2026-07-03-legacy-file-redirects.csv`

- [ ] **Step 1: Update live documentation links**

Insert `/web` after `extensions` for the nine Web plugin URL slugs. Replace `/zh-CN/realtime-media/rtc/build/video/face-capture` with `/zh-CN/realtime-media/rtc/build/extensions/face-capture`. Preserve anchors, query strings, external URLs, and generated historical reports under `docs/migration/generated`.

- [ ] **Step 2: Update maintained path records**

In both CSV files, update only rows whose target content path or canonical target URL refers to these pages: Web plugin content paths become `content/docs/zh-CN/realtime-media/rtc/build/extensions/web/<slug>.mdx`; face-capture becomes `content/docs/zh-CN/realtime-media/rtc/build/extensions/face-capture.mdx`; their canonical target URLs receive the same path changes. Keep legacy source URLs in the first columns unchanged.

- [ ] **Step 3: Audit stale live references**

Run:

```bash
rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!docs/migration/generated/**' '/zh-CN/realtime-media/rtc/build/(video/face-capture|extensions/(overview|release|image-enhancement|noise-reduction|super-clarity|video-compositing|virtual-background|voice-activity-detection|watermark))' content/docs/zh-CN src docs
```

Expected: matches are limited to explicit redirect-map sources, redirect tests, and maintained historical CSV rows that intentionally identify old URLs; no live documentation link uses an old canonical path.

### Task 4: Regenerate metadata and verify the branch

**Files:**
- Modify: `src/generated/docs-last-updated-manifest.ts`
- Modify only if generated output changes: `src/lib/legacy-sitemap/static-redirects.json`, `vercel-legacy-redirects.json`, `vercel.json`

- [ ] **Step 1: Commit the physical move before Git-history generation**

Run `git add content/docs/zh-CN/realtime-media/rtc/build && git commit -m "docs: reorganize RTC plugin IA"`. Expected: the commit records the physical renames and metadata structure, making new paths visible to the last-updated generator.

- [ ] **Step 2: Regenerate tracked artifacts**

Run:

```bash
pnpm run docs:last-updated
pnpm run legacy-redirects:generate
```

Expected: the manifest contains the new paths and no old live content paths. Redirect artifacts remain unchanged unless their maintained source data requires a change.

- [ ] **Step 3: Run repository verification**

Run:

```bash
pnpm run legacy-redirects:check
pnpm exec vitest run src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts
pnpm run types:check
pnpm run lint
git diff --check
```

Expected: every command exits 0; inspect and retain only generated files caused by this migration.

- [ ] **Step 4: Verify the final branch state**

Run `git status --short --branch`, `git diff --stat codex/cn-newdoc-html-api-migration...HEAD`, and `git log --oneline -4`. Expected: branch `codex/cn-newdoc-html-api-migration-plugin-ia`, with only the design, IA migration, redirect/reference updates, and generated metadata commits.
