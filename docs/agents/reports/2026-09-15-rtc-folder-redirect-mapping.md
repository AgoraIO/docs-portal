# RTC folder redirect mapping

Redirect plan for retiring the `video`, `voice`, `interactive-live-streaming`, `broadcast-streaming` folders under `content/docs/en/realtime-media/`. Every old page redirects to its `rtc` equivalent with a 301.

## Summary

| | Count |
|---|---|
| Old pages | 279 |
| Same path in `rtc`, covered by folder wildcards | 180 |
| Moved to a different `rtc` path, page rule | 86 |
| Decisions, page rule | 13 |
| Pages that also need a platform rule | 31 |
| **Redirect rules** | **134** (31 platform, 99 page, 4 folder) |

Rules are evaluated in order, and the first match wins:

1. **Platform rules** send platform URLs that the `rtc` page doesn't have to its Android version, or to the page itself when it has no platform versions. Two Python URLs go to `rtc-server-sdk` instead. Without these rules, those URLs would 404.
2. **Page rules** send each moved page, including its platform suffix, to the new path.
3. **Folder rules** send everything else under each folder to the same path under `rtc`, and the folder root to the `rtc` overview.

All 279 old pages resolve to an existing page. Destination URLs were checked against a local dev server.

## Decisions

These decisions shaped the mapping.

### Platform sections not in `rtc`

Some old pages have platform sections that their `rtc` page doesn't. Platform rules send those URLs to the page's Android version, or to the page itself when it has no platform versions, so none of them 404. Removed content isn't being ported.

| RTC page | Platforms not in `rtc` | Old folders | Status |
|---|---|---|---|
| `rtc/build/authenticate-users/authentication-workflow` | python, linux-cpp, linux-c | voice, interactive-live-streaming, broadcast-streaming | **Content removed.** Token sections of about 30 lines each, with no `rtc-server-sdk` equivalent. |
| `rtc/build/control-audio-and-devices/volume-control-and-mute` | python | voice, interactive-live-streaming, broadcast-streaming | **Content removed.** Python section, 27 lines. |
| `rtc/build/join-and-manage-channels/join-multiple-channels` | electron, react-native | interactive-live-streaming, broadcast-streaming | **Content removed.** About 100 lines each. `rtc` lists both in `excluded_platforms`, so this looks intentional (#890). |
| `rtc/build/join-and-manage-channels/preload-channels` | ios, macos | interactive-live-streaming, broadcast-streaming | **Content removed.** 319 lines each. `rtc` lists both in `excluded_platforms`, so this looks intentional (#890). |
| `rtc/reference/supported-platforms` | python | voice | **Content removed.** Python section, 5 lines. |
| `rtc/build/join-and-manage-channels/compile-run-sample-project` | python | voice, interactive-live-streaming, broadcast-streaming | Covered elsewhere: Python URLs go to the `rtc-server-sdk` sample project page. |
| `rtc/get-started-sdk` | python | video, interactive-live-streaming, broadcast-streaming | Covered elsewhere: Python URLs go to `rtc-server-sdk/quickstart/python`. |
| `rtc/build/customize-audio-processing/stream-raw-audio` | electron, flutter, react-native | voice, interactive-live-streaming, broadcast-streaming | Not lost. The old sections only said the feature isn't available yet. |
| `rtc/reference/cloud-proxy-allowed-ips` | android, ios, macos, web, windows, electron, flutter, react-native, unity, unreal, blueprint | video, voice, interactive-live-streaming, broadcast-streaming | Not lost. The old page repeated the same content for each platform. `rtc` has one version. |
| `rtc/reference/cloud-proxy-migration-guide` | android, ios, macos, web, windows, electron, flutter, react-native, unity, unreal, blueprint | video, voice, interactive-live-streaming, broadcast-streaming | Not lost. The old page repeated the same content for each platform. `rtc` has one version. |
| `rtc/reference/error-codes` | android, ios, macos, windows, electron, flutter, react-native, javascript, unity, unreal, blueprint, python, web | voice, interactive-live-streaming | Not lost. The old page repeated the same content for each platform. `rtc` has one version. |
| `rtc/reference/service-limits` | android, ios, macos, web, windows, electron, flutter, react-native, javascript, unity, unreal, blueprint, python | voice | Not lost. The old page repeated the same content for each platform. `rtc` has one version. |

### Python platform targets

Two Python pages go to `rtc-server-sdk`, which has the matching content, instead of the `rtc` page.

| Old URLs | Destination |
|---|---|
| `{video,interactive-live-streaming,broadcast-streaming}/quickstart/python` | `rtc-server-sdk/quickstart/python` |
| `{voice,interactive-live-streaming,broadcast-streaming}/build/set-up-your-project/compile-run-sample-project/python` | `rtc-server-sdk/build/set-up-your-project/compile-run-sample-project/python` |

### Release notes platform query rules

PR #1054 added three rules to `vercel.base.json` that sent `video/reference/release-notes?platform=<platform>` to the per-platform release notes pages in the `video` folder. They're removed, so these URLs go to `rtc/reference/release-notes` through the folder rule, which keeps the query string.

### Title changes

The new page has a different title. Each match was reviewed and confirmed.

| Old page | Old title | New page | New title |
|---|---|---|---|
| `video/build/optimize-and-operate/receive-notifications` | Receive webhook notifications | `rtc/build/optimize-and-operate/receive-notifications` | Receive notifications about channel events |
| `video/quickstart` | SDK quickstart | `rtc/get-started-sdk` | Quickstart |
| `voice/build/optimize-and-operate/receive-notifications` | Receive webhook notifications | `rtc/build/optimize-and-operate/receive-notifications` | Receive notifications about channel events |
| `voice/quickstart` | Quickstart | `rtc/voice-quickstart` | Voice-only quickstart |
| `voice/reference/migration-guide` | Migrate from Voice SDK 3.x | `rtc/reference/migration-guide` | Migrate from Video SDK 3.x |
| `interactive-live-streaming/build/connect-across-channels/receive-notifications` | Receive webhook notifications | `rtc/build/optimize-and-operate/receive-notifications` | Receive notifications about channel events |
| `interactive-live-streaming/build/optimize-quality-and-connection/optimize-frame-rendering` | Optimize video rendering | `rtc/build/capture-and-render-video/optimize-frame-rendering` | Optimize first-frame rendering |
| `interactive-live-streaming/product-overview` | Interactive Live Streaming overview | `rtc` | Realtime Communication Overview |
| `interactive-live-streaming/reference/agora-console-rest-api` | Agora Console REST API | `/en/api-reference/api-ref/console/solutions-agora-console-rest-api` | Agora Console |
| `broadcast-streaming/build/connect-across-channels/receive-notifications` | Receive webhook notifications | `rtc/build/optimize-and-operate/receive-notifications` | Receive notifications about channel events |
| `broadcast-streaming/build/optimize-quality-and-connection/optimize-frame-rendering` | Optimize video rendering | `rtc/build/capture-and-render-video/optimize-frame-rendering` | Optimize first-frame rendering |
| `broadcast-streaming/product-overview` | Broadcast Streaming overview | `rtc` | Realtime Communication Overview |

## Verification

- Every old page, and every platform URL the app published for it, was run through `@vercel/routing-utils` (the library Vercel uses to convert redirects), after the existing `vercel.base.json` rules: 1,703 URLs, 0 wrong destinations.
- All 454 destination URLs return 200 on a local dev server.
- The 62 platform URLs that platform rules handle return 404 on the `rtc` page, which confirms the rules are needed.
- Page and folder rules don't match similarly named paths such as `/en/realtime-media/voice-agent`.

## Implementation

- `src/lib/legacy-sitemap/rtc-folder-redirects.json` holds the rules and the expected destination for every retired URL.
- `scripts/generate-legacy-redirect-artifacts.mjs` merges the rules into `vercel.json` right after the `vercel.base.json` redirects. Run `npm run legacy-redirects:generate` after changing them.
- `src/lib/legacy-sitemap/rtc-folder-redirects.test.ts` resolves every expected URL through `vercel.json` in order, and checks that every destination page and platform exists. It fails if an `rtc` page is renamed or loses a platform that a redirect depends on.
- The 20 legacy rules in `redirects.json` that targeted the retired folders now point at their `rtc` destinations directly.

## Page rules

Old paths are relative to `/en/realtime-media/<folder>/`. Each rule also carries any platform suffix.

### video (2)

| Old page | New page | Type |
|---|---|---|
| `build/add-advanced-video-features/metakit` | `marketplace/build/add-video-and-ar-effects/metakit` | Decision: MetaKit lives in Marketplace (#972) |
| `quickstart` | `rtc/get-started-sdk` | Decision: quickstart → SDK quickstart |

### voice (6)

| Old page | New page | Type |
|---|---|---|
| `build/set-up-token-authentication/deploy-token-server` | `rtc/build/authenticate-users/deploy-token-server` | Moved |
| `build/set-up-token-authentication/integrate-token-generation` | `rtc/build/authenticate-users/integrate-token-generation` | Moved |
| `build/set-up-token-authentication/middleware-token-server` | `rtc/build/authenticate-users/middleware-token-server` | Moved |
| `build/set-up-token-authentication/use-tokens` | `rtc/build/authenticate-users/authentication-workflow` | Decision: use-tokens replaced by authentication workflow |
| `build/set-up-your-project/compile-run-sample-project` | `rtc/build/join-and-manage-channels/compile-run-sample-project` | Moved |
| `quickstart` | `rtc/voice-quickstart` | Decision: quickstart → voice quickstart |

### interactive-live-streaming (46)

| Old page | New page | Type |
|---|---|---|
| `build/apply-effects-and-enhancements/ai-noise-suppression` | `rtc/build/enhance-the-audio-experience/ai-noise-suppression` | Moved |
| `build/apply-effects-and-enhancements/alpha-transparency-effect` | `rtc/build/apply-video-effects/alpha-transparency-effect` | Moved |
| `build/apply-effects-and-enhancements/beauty-effect` | `rtc/build/apply-video-effects/beauty-effect` | Moved |
| `build/apply-effects-and-enhancements/face-capture` | `rtc/build/add-advanced-video-features/face-capture` | Moved |
| `build/apply-effects-and-enhancements/metakit` | `marketplace/build/add-video-and-ar-effects/metakit` | Decision: MetaKit lives in Marketplace (#972) |
| `build/apply-effects-and-enhancements/super-clarity` | `rtc/build/apply-video-effects/super-clarity` | Moved |
| `build/apply-effects-and-enhancements/use-an-extension` | `rtc/build/customize-audio-processing/use-an-extension` | Moved |
| `build/apply-effects-and-enhancements/video-compositor` | `rtc/build/apply-video-effects/video-compositor` | Moved |
| `build/apply-effects-and-enhancements/virtual-background` | `rtc/build/apply-video-effects/virtual-background` | Moved |
| `build/apply-effects-and-enhancements/voice-activity-detection` | `rtc/build/enhance-the-audio-experience/voice-activity-detection` | Moved |
| `build/apply-effects-and-enhancements/watermark` | `rtc/build/apply-video-effects/watermark` | Moved |
| `build/authenticate-users/use-tokens` | `rtc/build/authenticate-users/authentication-workflow` | Decision: use-tokens replaced by authentication workflow |
| `build/connect-across-channels/cross-channel-media-relay` | `rtc/build/join-and-manage-channels/cross-channel-media-relay` | Moved |
| `build/connect-across-channels/join-multiple-channels` | `rtc/build/join-and-manage-channels/join-multiple-channels` | Moved |
| `build/connect-across-channels/receive-notifications` | `rtc/build/optimize-and-operate/receive-notifications` | Moved |
| `build/control-audio-and-devices/audio-mixing-and-sound-effects` | `rtc/build/enhance-the-audio-experience/audio-mixing-and-sound-effects` | Moved |
| `build/control-audio-and-devices/audio-strength-stream-selection` | `rtc/build/optimize-and-operate/audio-strength-stream-selection` | Moved |
| `build/control-audio-and-devices/autoplay` | `rtc/build/optimize-and-operate/autoplay` | Moved |
| `build/control-audio-and-devices/spatial-audio` | `rtc/build/enhance-the-audio-experience/spatial-audio` | Moved |
| `build/control-audio-and-devices/voice-effects` | `rtc/build/enhance-the-audio-experience/voice-effects` | Moved |
| `build/manage-video-and-streaming/camera-movement` | `rtc/build/add-advanced-video-features/camera-movement` | Moved |
| `build/manage-video-and-streaming/configure-video-encoding` | `rtc/build/capture-and-render-video/configure-video-encoding` | Moved |
| `build/manage-video-and-streaming/picture-in-picture` | `rtc/build/add-advanced-video-features/picture-in-picture` | Moved |
| `build/manage-video-and-streaming/play-media` | `rtc/build/capture-and-render-video/play-media` | Moved |
| `build/manage-video-and-streaming/screen-sharing` | `rtc/build/capture-and-render-video/screen-sharing` | Moved |
| `build/optimize-quality-and-connection/app-size-optimization` | `rtc/build/optimize-and-operate/app-size-optimization` | Moved |
| `build/optimize-quality-and-connection/best-practices-sound-quality` | `rtc/build/enhance-the-audio-experience/best-practices-sound-quality` | Moved |
| `build/optimize-quality-and-connection/cloud-proxy` | `rtc/build/manage-connection-and-quality/cloud-proxy` | Moved |
| `build/optimize-quality-and-connection/connection-status-management` | `rtc/build/manage-connection-and-quality/connection-status-management` | Moved |
| `build/optimize-quality-and-connection/in-call-quality-monitoring` | `rtc/build/manage-connection-and-quality/in-call-quality-monitoring` | Moved |
| `build/optimize-quality-and-connection/media-stream-fallback` | `rtc/build/manage-connection-and-quality/media-stream-fallback` | Moved |
| `build/optimize-quality-and-connection/optimize-frame-rendering` | `rtc/build/capture-and-render-video/optimize-frame-rendering` | Moved |
| `build/optimize-quality-and-connection/optimize-multihost-video` | `rtc/build/manage-connection-and-quality/optimize-multihost-video` | Moved |
| `build/optimize-quality-and-connection/pre-call-tests` | `rtc/build/manage-connection-and-quality/pre-call-tests` | Moved |
| `build/optimize-quality-and-connection/preload-channels` | `rtc/build/join-and-manage-channels/preload-channels` | Moved |
| `build/optimize-quality-and-connection/video-transmission-optimization` | `rtc/build/manage-connection-and-quality/video-transmission-optimization` | Moved |
| `build/process-raw-and-custom-media/custom-audio` | `rtc/build/customize-audio-processing/custom-audio` | Moved |
| `build/process-raw-and-custom-media/custom-video` | `rtc/build/capture-and-render-video/custom-video` | Moved |
| `build/process-raw-and-custom-media/raw-video-processing` | `rtc/build/capture-and-render-video/raw-video-processing` | Moved |
| `build/process-raw-and-custom-media/screenshot-upload` | `rtc/build/add-advanced-video-features/screenshot-upload` | Moved |
| `build/process-raw-and-custom-media/stream-raw-audio` | `rtc/build/customize-audio-processing/stream-raw-audio` | Moved |
| `build/secure-and-protect-channels/geofencing` | `rtc/build/manage-connection-and-quality/geofencing` | Moved |
| `build/set-up-your-project/compile-run-sample-project` | `rtc/build/join-and-manage-channels/compile-run-sample-project` | Moved |
| `product-overview` | `rtc` | Decision: product overview → RTC overview |
| `quickstart` | `rtc/get-started-sdk` | Decision: quickstart → SDK quickstart |
| `reference/agora-console-rest-api` | `/en/api-reference/api-ref/console/solutions-agora-console-rest-api` | Decision: Console REST API reference |

### broadcast-streaming (45)

| Old page | New page | Type |
|---|---|---|
| `build/apply-effects-and-enhancements/ai-noise-suppression` | `rtc/build/enhance-the-audio-experience/ai-noise-suppression` | Moved |
| `build/apply-effects-and-enhancements/alpha-transparency-effect` | `rtc/build/apply-video-effects/alpha-transparency-effect` | Moved |
| `build/apply-effects-and-enhancements/beauty-effect` | `rtc/build/apply-video-effects/beauty-effect` | Moved |
| `build/apply-effects-and-enhancements/face-capture` | `rtc/build/add-advanced-video-features/face-capture` | Moved |
| `build/apply-effects-and-enhancements/metakit` | `marketplace/build/add-video-and-ar-effects/metakit` | Decision: MetaKit lives in Marketplace (#972) |
| `build/apply-effects-and-enhancements/super-clarity` | `rtc/build/apply-video-effects/super-clarity` | Moved |
| `build/apply-effects-and-enhancements/use-an-extension` | `rtc/build/customize-audio-processing/use-an-extension` | Moved |
| `build/apply-effects-and-enhancements/video-compositor` | `rtc/build/apply-video-effects/video-compositor` | Moved |
| `build/apply-effects-and-enhancements/virtual-background` | `rtc/build/apply-video-effects/virtual-background` | Moved |
| `build/apply-effects-and-enhancements/voice-activity-detection` | `rtc/build/enhance-the-audio-experience/voice-activity-detection` | Moved |
| `build/apply-effects-and-enhancements/watermark` | `rtc/build/apply-video-effects/watermark` | Moved |
| `build/authenticate-users/use-tokens` | `rtc/build/authenticate-users/authentication-workflow` | Decision: use-tokens replaced by authentication workflow |
| `build/connect-across-channels/cross-channel-media-relay` | `rtc/build/join-and-manage-channels/cross-channel-media-relay` | Moved |
| `build/connect-across-channels/join-multiple-channels` | `rtc/build/join-and-manage-channels/join-multiple-channels` | Moved |
| `build/connect-across-channels/receive-notifications` | `rtc/build/optimize-and-operate/receive-notifications` | Moved |
| `build/control-audio-and-devices/audio-mixing-and-sound-effects` | `rtc/build/enhance-the-audio-experience/audio-mixing-and-sound-effects` | Moved |
| `build/control-audio-and-devices/audio-strength-stream-selection` | `rtc/build/optimize-and-operate/audio-strength-stream-selection` | Moved |
| `build/control-audio-and-devices/autoplay` | `rtc/build/optimize-and-operate/autoplay` | Moved |
| `build/control-audio-and-devices/spatial-audio` | `rtc/build/enhance-the-audio-experience/spatial-audio` | Moved |
| `build/control-audio-and-devices/voice-effects` | `rtc/build/enhance-the-audio-experience/voice-effects` | Moved |
| `build/manage-video-and-streaming/camera-movement` | `rtc/build/add-advanced-video-features/camera-movement` | Moved |
| `build/manage-video-and-streaming/configure-video-encoding` | `rtc/build/capture-and-render-video/configure-video-encoding` | Moved |
| `build/manage-video-and-streaming/picture-in-picture` | `rtc/build/add-advanced-video-features/picture-in-picture` | Moved |
| `build/manage-video-and-streaming/play-media` | `rtc/build/capture-and-render-video/play-media` | Moved |
| `build/manage-video-and-streaming/screen-sharing` | `rtc/build/capture-and-render-video/screen-sharing` | Moved |
| `build/optimize-quality-and-connection/app-size-optimization` | `rtc/build/optimize-and-operate/app-size-optimization` | Moved |
| `build/optimize-quality-and-connection/best-practices-sound-quality` | `rtc/build/enhance-the-audio-experience/best-practices-sound-quality` | Moved |
| `build/optimize-quality-and-connection/cloud-proxy` | `rtc/build/manage-connection-and-quality/cloud-proxy` | Moved |
| `build/optimize-quality-and-connection/connection-status-management` | `rtc/build/manage-connection-and-quality/connection-status-management` | Moved |
| `build/optimize-quality-and-connection/in-call-quality-monitoring` | `rtc/build/manage-connection-and-quality/in-call-quality-monitoring` | Moved |
| `build/optimize-quality-and-connection/media-stream-fallback` | `rtc/build/manage-connection-and-quality/media-stream-fallback` | Moved |
| `build/optimize-quality-and-connection/optimize-frame-rendering` | `rtc/build/capture-and-render-video/optimize-frame-rendering` | Moved |
| `build/optimize-quality-and-connection/optimize-multihost-video` | `rtc/build/manage-connection-and-quality/optimize-multihost-video` | Moved |
| `build/optimize-quality-and-connection/pre-call-tests` | `rtc/build/manage-connection-and-quality/pre-call-tests` | Moved |
| `build/optimize-quality-and-connection/preload-channels` | `rtc/build/join-and-manage-channels/preload-channels` | Moved |
| `build/optimize-quality-and-connection/video-transmission-optimization` | `rtc/build/manage-connection-and-quality/video-transmission-optimization` | Moved |
| `build/process-raw-and-custom-media/custom-audio` | `rtc/build/customize-audio-processing/custom-audio` | Moved |
| `build/process-raw-and-custom-media/custom-video` | `rtc/build/capture-and-render-video/custom-video` | Moved |
| `build/process-raw-and-custom-media/raw-video-processing` | `rtc/build/capture-and-render-video/raw-video-processing` | Moved |
| `build/process-raw-and-custom-media/screenshot-upload` | `rtc/build/add-advanced-video-features/screenshot-upload` | Moved |
| `build/process-raw-and-custom-media/stream-raw-audio` | `rtc/build/customize-audio-processing/stream-raw-audio` | Moved |
| `build/secure-and-protect-channels/geofencing` | `rtc/build/manage-connection-and-quality/geofencing` | Moved |
| `build/set-up-your-project/compile-run-sample-project` | `rtc/build/join-and-manage-channels/compile-run-sample-project` | Moved |
| `product-overview` | `rtc` | Decision: product overview → RTC overview |
| `quickstart` | `rtc/get-started-sdk` | Decision: quickstart → SDK quickstart |

## Platform rules

| Old page | Platforms | Destination |
|---|---|---|
| `video/quickstart` | python | `rtc-server-sdk/quickstart/python` |
| `video/reference/cloud-proxy-allowed-ips` | android, ios, macos, web, windows, electron, flutter, react-native, unity, unreal, blueprint | `rtc/reference/cloud-proxy-allowed-ips` |
| `video/reference/cloud-proxy-migration-guide` | android, ios, macos, web, windows, electron, flutter, react-native, unity, unreal, blueprint | `rtc/reference/cloud-proxy-migration-guide` |
| `voice/build/control-audio-and-devices/volume-control-and-mute` | python | `rtc/build/control-audio-and-devices/volume-control-and-mute/android` |
| `voice/build/customize-audio-processing/stream-raw-audio` | electron, flutter, react-native | `rtc/build/customize-audio-processing/stream-raw-audio/android` |
| `voice/build/set-up-token-authentication/use-tokens` | python, linux-cpp, linux-c | `rtc/build/authenticate-users/authentication-workflow/android` |
| `voice/build/set-up-your-project/compile-run-sample-project` | python | `rtc-server-sdk/build/set-up-your-project/compile-run-sample-project/python` |
| `voice/reference/cloud-proxy-allowed-ips` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-allowed-ips` |
| `voice/reference/cloud-proxy-migration-guide` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-migration-guide` |
| `voice/reference/error-codes` | android, ios, macos, windows, electron, flutter, react-native, javascript, unity, unreal, blueprint, python, web | `rtc/reference/error-codes` |
| `voice/reference/service-limits` | android, ios, macos, web, windows, electron, flutter, react-native, javascript, unity, unreal, blueprint, python | `rtc/reference/service-limits` |
| `voice/reference/supported-platforms` | python | `rtc/reference/supported-platforms/android` |
| `interactive-live-streaming/build/authenticate-users/use-tokens` | python, linux-cpp, linux-c | `rtc/build/authenticate-users/authentication-workflow/android` |
| `interactive-live-streaming/build/connect-across-channels/join-multiple-channels` | electron, react-native | `rtc/build/join-and-manage-channels/join-multiple-channels/android` |
| `interactive-live-streaming/build/control-audio-and-devices/volume-control-and-mute` | python | `rtc/build/control-audio-and-devices/volume-control-and-mute/android` |
| `interactive-live-streaming/build/optimize-quality-and-connection/preload-channels` | ios, macos | `rtc/build/join-and-manage-channels/preload-channels/android` |
| `interactive-live-streaming/build/process-raw-and-custom-media/stream-raw-audio` | electron, flutter, react-native | `rtc/build/customize-audio-processing/stream-raw-audio/android` |
| `interactive-live-streaming/build/set-up-your-project/compile-run-sample-project` | python | `rtc-server-sdk/build/set-up-your-project/compile-run-sample-project/python` |
| `interactive-live-streaming/quickstart` | python | `rtc-server-sdk/quickstart/python` |
| `interactive-live-streaming/reference/cloud-proxy-allowed-ips` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-allowed-ips` |
| `interactive-live-streaming/reference/cloud-proxy-migration-guide` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-migration-guide` |
| `interactive-live-streaming/reference/error-codes` | android, ios, macos, web, windows, electron, flutter, react-native, unity, unreal, blueprint | `rtc/reference/error-codes` |
| `broadcast-streaming/build/authenticate-users/use-tokens` | python, linux-cpp, linux-c | `rtc/build/authenticate-users/authentication-workflow/android` |
| `broadcast-streaming/build/connect-across-channels/join-multiple-channels` | electron, react-native | `rtc/build/join-and-manage-channels/join-multiple-channels/android` |
| `broadcast-streaming/build/control-audio-and-devices/volume-control-and-mute` | python | `rtc/build/control-audio-and-devices/volume-control-and-mute/android` |
| `broadcast-streaming/build/optimize-quality-and-connection/preload-channels` | ios, macos | `rtc/build/join-and-manage-channels/preload-channels/android` |
| `broadcast-streaming/build/process-raw-and-custom-media/stream-raw-audio` | electron, flutter, react-native | `rtc/build/customize-audio-processing/stream-raw-audio/android` |
| `broadcast-streaming/build/set-up-your-project/compile-run-sample-project` | python | `rtc-server-sdk/build/set-up-your-project/compile-run-sample-project/python` |
| `broadcast-streaming/quickstart` | python | `rtc-server-sdk/quickstart/python` |
| `broadcast-streaming/reference/cloud-proxy-allowed-ips` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-allowed-ips` |
| `broadcast-streaming/reference/cloud-proxy-migration-guide` | android, ios, macos, web, windows, electron, flutter, react-native, unity | `rtc/reference/cloud-proxy-migration-guide` |

## Same-path pages

These pages exist at the same path in `rtc`, so the folder wildcard covers them.

<details>
<summary>video (76)</summary>

- `(folder root)`
- `build/add-advanced-video-features/camera-movement`
- `build/add-advanced-video-features/face-capture`
- `build/add-advanced-video-features/picture-in-picture`
- `build/add-advanced-video-features/screenshot-upload`
- `build/apply-video-effects/alpha-transparency-effect`
- `build/apply-video-effects/beauty-effect`
- `build/apply-video-effects/super-clarity`
- `build/apply-video-effects/video-compositor`
- `build/apply-video-effects/virtual-background`
- `build/apply-video-effects/watermark`
- `build/authenticate-users/authentication-workflow`
- `build/authenticate-users/deploy-token-server`
- `build/authenticate-users/integrate-token-generation`
- `build/authenticate-users/middleware-token-server`
- `build/capture-and-render-video/configure-video-encoding`
- `build/capture-and-render-video/custom-video`
- `build/capture-and-render-video/optimize-frame-rendering`
- `build/capture-and-render-video/play-media`
- `build/capture-and-render-video/raw-video-processing`
- `build/capture-and-render-video/screen-sharing`
- `build/control-audio-and-devices/configure-audio-encoding`
- `build/control-audio-and-devices/set-audio-route`
- `build/control-audio-and-devices/volume-control-and-mute`
- `build/customize-audio-processing/custom-audio`
- `build/customize-audio-processing/stream-raw-audio`
- `build/customize-audio-processing/use-an-extension`
- `build/enhance-the-audio-experience/ai-noise-suppression`
- `build/enhance-the-audio-experience/audio-mixing-and-sound-effects`
- `build/enhance-the-audio-experience/best-practices-sound-quality`
- `build/enhance-the-audio-experience/spatial-audio`
- `build/enhance-the-audio-experience/voice-activity-detection`
- `build/enhance-the-audio-experience/voice-effects`
- `build/join-and-manage-channels/compile-run-sample-project`
- `build/join-and-manage-channels/join-multiple-channels`
- `build/join-and-manage-channels/preload-channels`
- `build/manage-connection-and-quality/cloud-proxy`
- `build/manage-connection-and-quality/connection-status-management`
- `build/manage-connection-and-quality/geofencing`
- `build/manage-connection-and-quality/in-call-quality-monitoring`
- `build/manage-connection-and-quality/media-stream-fallback`
- `build/manage-connection-and-quality/multipath-transmission`
- `build/manage-connection-and-quality/optimize-multihost-video`
- `build/manage-connection-and-quality/pre-call-tests`
- `build/manage-connection-and-quality/simulcasting`
- `build/manage-connection-and-quality/video-transmission-optimization`
- `build/optimize-and-operate/app-size-optimization`
- `build/optimize-and-operate/audio-strength-stream-selection`
- `build/optimize-and-operate/autoplay`
- `build/optimize-and-operate/receive-notifications`
- `build/secure-and-protect-channels/end-to-end-encryption`
- `build/secure-and-protect-channels/media-stream-encryption`
- `build/secure-and-protect-channels/prevent-stream-bombing`
- `core-concepts`
- `get-started-sdk`
- `mcp`
- `reference/api-examples`
- `reference/billing-policies`
- `reference/channel-management-api`
- `reference/cloud-proxy-allowed-ips`
- `reference/cloud-proxy-migration-guide`
- `reference/common-problems`
- `reference/error-codes`
- `reference/firewall`
- `reference/glossary`
- `reference/magic-leap`
- `reference/migration-guide`
- `reference/pricing`
- `reference/pricing-legacy`
- `reference/release-notes`
- `reference/security`
- `reference/service-limits`
- `reference/status-page`
- `reference/supported-platforms`
- `skills`
- `subscription-packages`

</details>

<details>
<summary>voice (45)</summary>

- `(folder root)`
- `build/control-audio-and-devices/configure-audio-encoding`
- `build/control-audio-and-devices/set-audio-route`
- `build/control-audio-and-devices/volume-control-and-mute`
- `build/customize-audio-processing/custom-audio`
- `build/customize-audio-processing/stream-raw-audio`
- `build/customize-audio-processing/use-an-extension`
- `build/enhance-the-audio-experience/ai-noise-suppression`
- `build/enhance-the-audio-experience/audio-mixing-and-sound-effects`
- `build/enhance-the-audio-experience/best-practices-sound-quality`
- `build/enhance-the-audio-experience/spatial-audio`
- `build/enhance-the-audio-experience/voice-activity-detection`
- `build/enhance-the-audio-experience/voice-effects`
- `build/manage-connection-and-quality/cloud-proxy`
- `build/manage-connection-and-quality/connection-status-management`
- `build/manage-connection-and-quality/geofencing`
- `build/manage-connection-and-quality/in-call-quality-monitoring`
- `build/manage-connection-and-quality/pre-call-tests`
- `build/optimize-and-operate/app-size-optimization`
- `build/optimize-and-operate/audio-strength-stream-selection`
- `build/optimize-and-operate/autoplay`
- `build/optimize-and-operate/receive-notifications`
- `build/secure-and-protect-channels/media-stream-encryption`
- `build/secure-and-protect-channels/prevent-stream-bombing`
- `core-concepts`
- `mcp`
- `reference/api-examples`
- `reference/billing-policies`
- `reference/channel-management-api`
- `reference/cloud-proxy-allowed-ips`
- `reference/cloud-proxy-migration-guide`
- `reference/common-problems`
- `reference/error-codes`
- `reference/firewall`
- `reference/glossary`
- `reference/migration-guide`
- `reference/pricing`
- `reference/pricing-legacy`
- `reference/release-notes`
- `reference/security`
- `reference/service-limits`
- `reference/status-page`
- `reference/supported-platforms`
- `skills`
- `subscription-packages`

</details>

<details>
<summary>interactive-live-streaming (28)</summary>

- `build/authenticate-users/deploy-token-server`
- `build/authenticate-users/integrate-token-generation`
- `build/authenticate-users/middleware-token-server`
- `build/control-audio-and-devices/configure-audio-encoding`
- `build/control-audio-and-devices/set-audio-route`
- `build/control-audio-and-devices/volume-control-and-mute`
- `build/secure-and-protect-channels/end-to-end-encryption`
- `build/secure-and-protect-channels/media-stream-encryption`
- `build/secure-and-protect-channels/prevent-stream-bombing`
- `core-concepts`
- `reference/billing-policies`
- `reference/channel-management-api`
- `reference/cloud-proxy-allowed-ips`
- `reference/cloud-proxy-migration-guide`
- `reference/common-problems`
- `reference/error-codes`
- `reference/firewall`
- `reference/glossary`
- `reference/magic-leap`
- `reference/migration-guide`
- `reference/pricing`
- `reference/pricing-legacy`
- `reference/release-notes`
- `reference/security`
- `reference/service-limits`
- `reference/status-page`
- `reference/supported-platforms`
- `subscription-packages`

</details>

<details>
<summary>broadcast-streaming (31)</summary>

- `(folder root)`
- `build/authenticate-users/deploy-token-server`
- `build/authenticate-users/integrate-token-generation`
- `build/authenticate-users/middleware-token-server`
- `build/control-audio-and-devices/configure-audio-encoding`
- `build/control-audio-and-devices/set-audio-route`
- `build/control-audio-and-devices/volume-control-and-mute`
- `build/secure-and-protect-channels/end-to-end-encryption`
- `build/secure-and-protect-channels/media-stream-encryption`
- `build/secure-and-protect-channels/prevent-stream-bombing`
- `core-concepts`
- `mcp`
- `reference/billing-policies`
- `reference/channel-management-api`
- `reference/cloud-proxy-allowed-ips`
- `reference/cloud-proxy-migration-guide`
- `reference/common-problems`
- `reference/error-codes`
- `reference/firewall`
- `reference/glossary`
- `reference/magic-leap`
- `reference/migration-guide`
- `reference/pricing`
- `reference/pricing-legacy`
- `reference/release-notes`
- `reference/security`
- `reference/service-limits`
- `reference/status-page`
- `reference/supported-platforms`
- `skills`
- `subscription-packages`

</details>
