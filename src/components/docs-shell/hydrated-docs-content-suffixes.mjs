// Single source of truth for docs pages that must stay on the hydrated-client
// content path instead of being baked into patched static HTML.
//
// Consumed by BOTH:
//   - the runtime hydration decision (src/components/docs-shell/docs-content-hydration.ts)
//   - the static build verifier (scripts/build-static-docs.mjs)
//
// so the two can never drift out of sync. Matching is by content-path SUFFIX,
// which means an entry applies across every IA tab that shares that suffix
// (e.g. `/build/play-media.mdx` covers video, voice, interactive-live-streaming,
// and broadcast-streaming copies at once). Keep this list minimal and
// intentional; see docs/preflight-static-docs.md for the rationale and risks.
//
// This file is plain ESM (.mjs) on purpose: the Node build script imports it
// directly, and TypeScript imports it via allowJs.
export const HYDRATED_DOCS_CONTENT_SUFFIXES = [
  '/build/ai-noise-suppression.mdx',
  '/build/in-call-quality-monitoring.mdx',
  '/client-api/chat-group/manage-group-member-attributes.mdx',
  '/client-api/chat-room/manage-chatroom-members.mdx',
  '/build/play-media.mdx',
  '/build/preload-channels.mdx',
  '/build/receive-notifications.mdx',
  '/build/screen-sharing.mdx',
  '/build/use-an-extension.mdx',
  '/build/voice-activity-detection.mdx',
  '/build/virtual-background.mdx',
  '/reference/common-errors.md',
  '/reference/common-errors.mdx',
  '/agora-console/content-moderation-microsoft.md',
  '/agora-console/content-moderation-microsoft.mdx',
  '/im/client-api/messages/manage-messages.md',
  '/im/client-api/messages/send-receive-messages.md',
  '/im/client-api/messages/translate-messages.md',
  '/im/client-api/presence.md',
  '/im/client-api/reaction.md',
  '/im/client-api/threading/thread-management.md',
  '/im/client-api/threading/thread-messages.md',
  '/im/client-api/user-attributes.md',
  '/im/reference/access-token-2.md',
  '/media-pull/reference/restful-api.md',
  '/media-push/build/restful-api.md',
  '/rtc-server-sdk/build/stringuid.md',
];
