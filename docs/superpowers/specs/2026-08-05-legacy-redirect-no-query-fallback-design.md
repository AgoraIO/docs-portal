# Legacy Redirect No-Query Fallback Design

## Context

The current branch adds Vercel 301 redirects for legacy docs URLs. Preview verification found that the remaining 404 cases are not missing query-specific redirects. They are legacy paths whose configured redirect only matches when a `platform` query parameter is present.

For example:

- `/en/Interactive%20Broadcast/set_subscribing_state?platform=Windows` redirects to the Windows-specific target.
- `/en/Interactive%20Broadcast/set_subscribing_state` has no matching no-query redirect and returns 404.

## Goal

Add scoped no-query fallback redirects for the seven confirmed legacy paths that currently return 404 without `platform`.

The existing query-specific redirects must remain unchanged. When a request includes the known `platform` value, it should keep redirecting to the platform-specific or fragment-specific target. When the same legacy path has no `platform` query, it should redirect to the agreed fallback target.

## Non-Goals

- Do not add broad automatic fallbacks for every query-specific legacy redirect.
- Do not change redirects where one legacy path maps to multiple platform targets unless an owner-approved no-query fallback target exists.
- Do not hand-edit generated artifacts in a way that can be overwritten by the redirect generation script.
- Do not change app runtime routing or docs content.

## Confirmed Fallback Targets

| Legacy request without query | Fallback target |
| --- | --- |
| `/en/Agora%20Platform/get_appid_token` | `/en/introduction/account` |
| `/en/Agora%20Platform/terms` | `/en/introduction/core-concepts` |
| `/en/Interactive%20Broadcast/cdn_streaming_web` | `/en/realtime-media/media-push/get-started/enable-media-push` |
| `/en/Interactive%20Broadcast/cdn_streaming_windows` | `/en/realtime-media/media-push/get-started/enable-media-push` |
| `/en/Interactive%20Broadcast/cloud_proxy_web_ng` | `/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/cloud-proxy` |
| `/en/Interactive%20Broadcast/in-call_quality_windows` | `/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/in-call-quality-monitoring` |
| `/en/Interactive%20Broadcast/set_subscribing_state` | `/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute` |

## Redirect Behavior

Each fallback should behave as a 301 redirect with query parameters stripped.

For `set_subscribing_state`, the intended behavior is:

- `/en/Interactive%20Broadcast/set_subscribing_state?platform=Windows` redirects to `/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute/windows`.
- `/en/Interactive%20Broadcast/set_subscribing_state` redirects to `/en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute`.

The same pattern applies to the other six confirmed paths: keep the existing query-specific redirect and add a no-query fallback.

## Implementation Design

Add owner-approved fallback rules to the source redirect data rather than editing generated Vercel artifacts directly. The fallback rules should have the same decoded `legacyPath` as the existing query-specific rules, omit `legacySearch`, set `preserveSearch` to `false`, and use the fallback target listed above.

Regenerate redirect artifacts with the existing generator so the following files stay aligned:

- `src/lib/legacy-sitemap/redirects.json`
- `src/lib/legacy-sitemap/static-redirects.json`
- `vercel-legacy-redirects.json`
- `vercel.json`

The generator must continue to place query-split paths in `vercel.json.redirects` when needed. For paths that now have both a no-query fallback and one or more query-specific rules, generated redirects should allow both forms to work:

- query-specific rule for known `platform` values
- no-query fallback rule for requests without `platform`

## Testing

Add or update focused tests for redirect artifact generation and verification:

- The seven no-query fallbacks are present in generated Vercel artifacts.
- Existing query-specific redirects for these paths remain present and keep their original targets.
- `preserveQueryParams` is `false` for the new fallback rules.
- The existing API reference redirect verifier still passes.

After implementation, verify locally with:

- `bun run test -- src/lib/legacy-sitemap/vercel-redirect-artifacts.test.ts`
- `/Users/yejiayi/.bun/bin/bun scripts/verify-api-ref-docs-redirects.mjs`

After deployment, verify the preview URL returns 301 for both the no-query fallback paths and the existing query-specific paths.
