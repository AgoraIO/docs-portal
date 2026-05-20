# Findings

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
