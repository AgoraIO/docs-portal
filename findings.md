# Findings

## 2026-06-11
- The real migration scope is the entire `Doc-Source-Private/agora-chat` tree, not just `overview/product-overview.mdx`.
- Source navigation is defined by top-level and nested `_category_.json` files plus per-page `sidebar_position` values; the main top-level groups are `overview`, `get-started`, `develop`, `client-api`, `restful-api`, `agora-console`, and `reference`.
- Most `agora-chat` source pages are thin wrappers whose real content lives under `shared/chat-sdk/**` and `shared/common/**`. Any migration pipeline must recursively expand imports such as `import Foo from '@docs/shared/chat-sdk/...';`.
- Common legacy patterns in this tree include `ProductOverview`, `PlatformWrapper`, `ProductWrapper`, `Link`, `Vg`, `Vpd`, `Vpl`, `Admonition`, `Tabs`, and `CodeBlock`.
- Platform-specific content is often composed by importing an `index.mdx` that then imports platform files like `android.mdx`, `ios.mdx`, and `web.mdx`; those platform files are usually wrapped in `PlatformWrapper`.
- The source repo includes a useful exporter at `scripts/export/mdx2md.py` that already knows how to expand imports, convert several legacy components, and copy images, but it currently cannot run in this environment because `yaml` and `bs4` are missing and the script assumes a `docs/` directory wrapper that `Doc-Source-Private` no longer has.
- The source image pool for chat content lives under `Doc-Source-Private/assets/images/chat`, with many referenced files such as `chat-overview.png`, `get-started-sdk-understand.png`, `chat-call-logic-*.svg`, and offline push screenshots.
- Existing portal content already contains dedicated AI-tooling pages such as `introduction/agora-mcp.mdx` and `introduction/agora-skills.mdx`, which may overlap semantically with `agora-chat/get-started/mcp.mdx` and `skills.mdx`.

## 2026-06-09
- Current RTC platform switching is driven through `navScope` metadata on `content/docs/en/realtime-media/rtc/meta.json`, with `versions` set to `android` and `macOS`.
- The existing UI renders nav-scope switching from `DocsSidebarHeaderBlock.tsx` as a dropdown in the left sidebar header unless the scope explicitly requests `presentation: 'tabs'`.
- `DocsContent.tsx` already supports page-header tabs through `sidebarHeader.versionSwitcher.presentation === 'tabs'`, but the switcher is still produced from sidebar-scoped nav-scope logic.
- `docs-page.server.ts` currently scopes the RTC sidebar to `navScope.sidebarRoot`, which means the left sidebar collapses to the active platform subtree instead of staying shared.
- RTC guide content is asymmetric today: Android has `quick-start`, `audio`, `video`, `security`, `quality-and-diagnostics`, `media`, and `reference`; macOS currently has only `audio` and `channel-and-connection`.
- The desired UX is closer to a shared thematic tree plus page-level sibling platform tabs than to the current "switch platform, then scope the whole sidebar" model.

## 2026-05-20
- The English `introduction` tab lives at `content/docs/en/introduction` and is still organized as a flat Fumadocs section with separator strings in `meta.json`.
- The target directory currently contains one migrated `.mdx` page, `content/docs/en/introduction/about-agora.mdx`, while the rest of the pages are `.md`.
- `Doc-Source-Private` does not provide a standalone `introduction` content tree. Each introduction page must be sourced from one or more product overview, pricing, release note, security, or shared-account pages.
- The strongest source mappings are:
  - `about-agora`, `start-with-ai`, `ai-agents`: `conversational-ai/*`
  - `realtime-audio-video`: `video-calling/overview/product-overview.mdx`
  - `messaging`: `signaling/overview/product-overview.mdx` plus shared signaling docs
  - `speech-to-text`: `real-time-stt/overview/product-overview.mdx`
  - `rtsa`: `iot/overview/product-overview.mdx`
  - `rtc-server-sdk`: `server-gateway/overview/product-overview.mdx`
  - `fusion-cdn`: `broadcast-streaming/overview/product-overview.mdx`
  - `whiteboard`: `interactive-whiteboard/overview/product-overview.mdx`
  - `recording`: `cloud-recording/overview/product-overview.mdx` and `on-premise-recording/overview/product-overview.mdx`
  - `ppt-transcoding`: `cloud-transcoding/overview/product-overview.mdx`
  - `account`, `projects`, `members-roles`, `usage-analytics`, `support`: `shared/common/manage-agora-account/*` and `agora-analytics/*`
  - `security-compliance`, `security-privacy`: `shared/common/security/*` plus product `reference/security.mdx`
  - `pricing-access`, `release-notes`, `community-resources`: product `overview/pricing.mdx`, `overview/release-notes.mdx`, and related support pages
- Many source pages are MDX-first and depend on components such as `ProductOverview`, `Tabs`, `TabItem`, `Admonition`, `Link`, and token macros like `<Vg />`. For the migration target these must be flattened into plain Markdown, while the original MDX fragments can be preserved inside HTML comments.
- Existing image coverage in `docs-portal/public/images` already includes `conversational-ai`, `open-ai-integration`, and `convo-ai-device-kit`, but does not yet include `signaling`, `interactive-whiteboard`, `cloud-recording`, `on-premise-recording`, `cloud-transcoding`, `analytics`, `iot`, or `broadcast-streaming`.
