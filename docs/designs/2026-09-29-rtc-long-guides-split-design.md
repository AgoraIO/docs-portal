# Split the remaining long English RTC guides

## Inventory and decision

| Page | Size | Structure and benefit | Priority |
| --- | --- | --- | --- |
| `rtc/get-started-sdk.mdx` | 8,669 lines / 353 KB | Twelve self-contained SDK workflows; splitting keeps setup, sample code, testing, and reference together for each platform. Android is the largest at 1,301 lines. | P0 |
| `rtc/voice-quickstart.mdx` | 7,912 lines / 291 KB | Thirteen self-contained voice workflows, including Python; each platform has its own setup, sample code, and test steps. | P0 |
| `rtc/build/optimize-and-operate/app-size-optimization.mdx` | 5,970 lines / 294 KB | Nine platform variants; most of the length is repeated platform-specific extension lists, whereas Web is only about 121 lines. Platform pages avoid loading irrelevant extension tables. | P1 |
| `rtc/reference/migration-guide.mdx` | 3,036 lines / 197 KB | Ten platform migration lists, most around 200–500 lines. Less urgent than full quickstarts and large extension inventories. | P2 |
| `rtc/build/capture-and-render-video/screen-sharing.mdx` | 3,033 lines / 159 KB | Eleven platform-specific instructions, mostly 200–300 lines each. Useful to split later, but not part of the first batch. | P2 |

Recommended scope: split the two P0 quickstarts first, verify their navigation and historical links, then split P1 app-size optimization in the same worktree. Leave the P2 pages for a separate review. Alternative: stop after the two quickstarts for a smaller review; or include the P2 guides now at the cost of a much larger URL/anchor surface. The recommended three-page batch yields 34 platform pages while keeping every workflow intact.

## User-facing routes and content

Use the existing `platform-group` index/panel pattern for each page, retaining the old route and title: `get-started-sdk` (12 platforms), `voice-quickstart` (13, including Python), and `build/optimize-and-operate/app-size-optimization` (9). Keep the current default platform and sidebar position. Normalize `react-js` to the existing `javascript` route; retain platform-specific subordinate tabs within each guide. Do not split a single platform workflow into setup/code/testing fragments or duplicate reference tables across products. No Chinese, Video Calling, SDK API/DITA, or Release Notes content changes.

## Link compatibility

Before moving each file, record the processed heading IDs, explicit HTML/accordion IDs, internal `#` links, `?platform=` links, sidebar URLs, sitemap redirects, and Markdown/LLM exports. Preserve historical numbered IDs (for example `#set-up-your-project-5`) on their new platform pages. Keep the old URL as the platform chooser and default page. Route supported old platform parameters, including observed `Electron` and `React%20Native` spellings, without losing other query parameters or the hash; reject unsupported platform values rather than creating nonexistent child routes. Update known internal links with a clear target platform. Shared or ambiguous hash-only links stay on a reachable old entry unless the historical ID uniquely identifies a platform; never claim to know an external link's missing platform context. Preserve search indexing and page-tree behavior using the existing platform-group mechanism.

## Verification and risks

For each page, compare source platform blocks and per-platform headings, code examples, extension lists, and local links before and after. Test canonical and platform routes, query aliases, hash-only and query-plus-hash links, sidebar navigation, search, Markdown/LLM exports, and static prerender. Run focused tests, `bun run test`, `bun run types:check`, docs link audit, and `bun run build`; separate unrelated baseline failures from RTC regressions. Browser-check desktop/mobile layout and platform switches. Third-party inbound hashes are not exhaustively discoverable, and headings repeated between platforms without a platform hint cannot always be routed uniquely.
