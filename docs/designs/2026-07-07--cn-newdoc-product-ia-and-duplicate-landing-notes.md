# CN-NEWDOC product IA and duplicate landing-page notes

## Goal

Adjust the zh-CN documentation IA so products under `realtime-media` and `solutions` appear as clickable second-level entries in their parent sidebars. Keep product-internal sidebars scoped after navigation.

## Confirmed Behavior

- Parent sidebars for `实时与媒体` and `解决方案` show product entries as clickable second-level items.
- Clicking `语音与视频` opens `/zh-CN/realtime-media/rtc`, which is the existing `语音与视频概览` page.
- After entering a product, the sidebar switches to that product's scoped navigation.

## Implementation

- Use the existing `navScope: {}` metadata mechanism.
- Add `navScope: {}` to product-level `meta.json` files under:
  - `content/docs/zh-CN/realtime-media`
  - `content/docs/zh-CN/solutions`
- Do not change route resolution or DITA/API generation.

## Duplicate Landing-Page Investigation

The reported repeated `热门文档`, `推荐阅读`, and `快速入门` sections are not caused by duplicated RTC HarmonyOS source pages. `zh-CN/realtime-media/rtc/harmonyos` is resolved as the HarmonyOS platform view of the RTC index page because platform routes are recognized only when the last URL segment is a known platform.

The repeated sections found in this worktree are concentrated in product `index.mdx` landing pages that contain several consecutive `PlatformStructured` blocks with mostly identical headings and lists:

- `content/docs/zh-CN/solutions/flexible-classroom/index.mdx`
- `content/docs/zh-CN/solutions/meeting/index.mdx`
- `content/docs/zh-CN/realtime-media/sdk-extensions/metakit/index.mdx`
- `content/docs/zh-CN/realtime-media/sdk-extensions/portrait-rhythm/index.mdx`

A full zh-CN Markdown scan for repeated exact `## 快速入门`, `## 推荐阅读`, and `## 热门文档` headings found only these four files.

Per user direction, these landing-page content cleanups are deferred. Recommended later fix: collapse shared Android/iOS/Web/Electron landing content into common Markdown, keep only genuinely platform-specific or RESTful-specific content in platform blocks, and add a regression check for repeated landing headings.

## Shared Concept Content

Fully shared concept pages belong in `introduction`, not in every product. MCP and Skills integration docs are identical across zh-CN product folders, so the canonical files are:

- `content/docs/zh-CN/introduction/mcp-integrate.mdx`
- `content/docs/zh-CN/introduction/skills-integrate.mdx`

All product-level `mcp-integrate.mdx` and `skills-integrate.mdx` copies are removed, and product `meta.json` files no longer list or hide these entries. Product documentation can link to the introduction pages when needed, but the shared concept content itself has a single source.

Historical zh-CN product URLs ending in `mcp-integrate` or `skills-integrate` redirect to the canonical introduction pages, so external links do not fail after the duplicate files are removed.

## Tests

- Add a focused regression test that checks zh-CN product folders under `realtime-media` and `solutions` have `navScope` metadata.
- Add an assertion that RTC's nav scope keeps `/zh-CN/realtime-media/rtc` as the clickable overview target.
- Add a regression check that fully shared MCP and Skills docs exist only under `introduction` and do not appear in product navigation.
- Add redirect coverage for old zh-CN product MCP and Skills URLs.
