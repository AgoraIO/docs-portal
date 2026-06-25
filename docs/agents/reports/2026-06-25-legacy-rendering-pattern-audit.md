# Legacy Rendering Pattern Audit

Generated: 2026-06-25T08:58:22.943Z
Source root: `content/docs`

## Summary

- Markdown/MDX files scanned: 1685
- Affected files: 752

### Status Counts

- `manual-html-review`: 177
- `needs-anchor-normalization`: 548
- `needs-frontmatter-cleanup`: 1
- `needs-jsx-review`: 25
- `needs-mdx-extension`: 33
- `needs-table-normalization`: 25

### Severity

- `high`: 57
- `medium`: 695

### Migration Effort

- `high`: 25
- `low`: 554
- `medium`: 173

### Locale

- `en`: 246
- `zh-CN`: 506

## Recommended Follow-up Buckets

- `needs-mdx-extension`: rename `.md` files that contain approved MDX components to `.mdx`, then update incoming relative links.
- `needs-table-normalization`: convert legacy table components or raw HTML tables to GFM tables when possible; keep native HTML only for true rowspan/colspan or block-heavy cells.
- `manual-html-review`: inspect raw HTML blocks and inline HTML for whether a Markdown/directive equivalent exists.
- `needs-jsx-review`: classify unapproved JSX as approved editorial widgets, legacy components, or content that should be rewritten.
- `needs-frontmatter-cleanup`: remove Docusaurus or old-build frontmatter that is outside the portal schema.

## Files by Status

### manual-html-review

- en/ai/best-practices/optimize-latency.mdx
- en/ai/build/audio-output.mdx
- en/ai/build/presets.mdx
- en/ai/build/short-term-memory.mdx
- en/ai/build/start-stop-agent.mdx
- en/ai/build/transcripts.md
- en/ai/device-kit/build/configure-device-network.md
- en/ai/get-started/test-mdx-comps.mdx
- en/ai/openai-realtime/get-started/mcp.mdx
- en/ai/reference/event-types.mdx
- en/ai/studio/deploy/sip-trunk.md
- en/introduction/index.mdx
- en/realtime-media/broadcast-streaming/build/app-size-optimization.mdx
- en/realtime-media/broadcast-streaming/build/audio-mixing-and-sound-effects.mdx
- en/realtime-media/broadcast-streaming/build/camera-movement.mdx
- en/realtime-media/broadcast-streaming/build/connection-status-management.mdx
- en/realtime-media/broadcast-streaming/build/in-call-quality-monitoring.mdx
- en/realtime-media/broadcast-streaming/build/metakit.mdx
- en/realtime-media/broadcast-streaming/build/pre-call-tests.mdx
- en/realtime-media/broadcast-streaming/build/prevent-stream-bombing.mdx
- en/realtime-media/broadcast-streaming/build/receive-notifications.mdx
- en/realtime-media/broadcast-streaming/build/screen-sharing.mdx
- en/realtime-media/broadcast-streaming/build/screenshot-upload.mdx
- en/realtime-media/broadcast-streaming/build/spatial-audio.mdx
- en/realtime-media/broadcast-streaming/build/virtual-background.mdx
- en/realtime-media/broadcast-streaming/mcp.mdx
- en/realtime-media/broadcast-streaming/quickstart.mdx
- en/realtime-media/broadcast-streaming/reference/agora-console-rest-api.md
- en/realtime-media/broadcast-streaming/reference/error-codes.md
- en/realtime-media/broadcast-streaming/reference/migration-guide.mdx
- en/realtime-media/broadcast-streaming/reference/pricing-legacy.md
- en/realtime-media/broadcast-streaming/reference/pricing.md
- en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/configuration.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/domain-names.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/custom.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/standard.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-authentication.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-reports.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-transfer.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/transcoding/custom.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/watermarks.mdx
- en/realtime-media/broadcast-streaming/reference/supported-platforms.md
- en/realtime-media/cloud-recording/build/merge-files.mdx
- en/realtime-media/cloud-recording/build/receive-notifications.mdx
- en/realtime-media/cloud-recording/build/screen-capture.mdx
- en/realtime-media/cloud-recording/build/webpage-best-practices.mdx
- en/realtime-media/cloud-recording/mcp.mdx
- en/realtime-media/cloud-recording/reference/pricing.mdx
- en/realtime-media/foundation-realtime.md
- en/realtime-media/marketplace/build/camera-movement.mdx
- en/realtime-media/marketplace/build/metakit.mdx
- en/realtime-media/marketplace/build/provisioning.md
- en/realtime-media/marketplace/build/publish-extension.md
- en/realtime-media/marketplace/build/usage.md
- en/realtime-media/marketplace/build/virtual-background.mdx
- en/realtime-media/marketplace/reference/downloads.mdx
- en/realtime-media/marketplace/reference/supported-platforms.mdx
- en/realtime-media/media-processing-and-distribution.md
- en/realtime-media/media-pull/build/integration-best-practices.md
- en/realtime-media/media-pull/build/mcp.mdx
- en/realtime-media/media-pull/build/receive-notifications.md
- en/realtime-media/media-pull/reference/restful-api.md
- en/realtime-media/media-pull/reference/security.md
- en/realtime-media/media-push/build/integration-best-practices.md
- en/realtime-media/media-push/build/mcp.mdx
- en/realtime-media/media-push/build/receive-notifications.md
- en/realtime-media/media-push/build/restful-api.md
- en/realtime-media/media-push/reference/pricing.md
- en/realtime-media/media-push/reference/restful-type-definition.mdx
- en/realtime-media/media-push/reference/security.md
- en/realtime-media/media-push/reference/sei-information.md
- en/realtime-media/rtm/quickstart.mdx
- en/realtime-media/rtm/reference/error-codes.md
- en/realtime-media/rtm/reference/migration-guide.md
- en/realtime-media/rtm/reference/pricing.md
- en/realtime-media/rtmp-gateway/reference/rest-api/response-status-codes.md
- en/realtime-media/server-and-extensions.md
- en/realtime-media/speech-to-text/build/parse-data.mdx
- en/realtime-media/speech-to-text/build/record-captions.md
- en/realtime-media/speech-to-text/build/translation.md
- en/realtime-media/speech-to-text/get-started/quickstart.md
- en/realtime-media/speech-to-text/reference/api-callback-service.mdx
- en/realtime-media/speech-to-text/reference/security.md
- en/realtime-media/transcoding/build/receive-ncs-events.md
- en/realtime-media/video/build/app-size-optimization.mdx
- en/realtime-media/video/build/audio-mixing-and-sound-effects.mdx
- en/realtime-media/video/build/camera-movement.mdx
- en/realtime-media/video/build/connection-status-management.mdx
- en/realtime-media/video/build/metakit.mdx
- en/realtime-media/video/build/pre-call-tests.mdx
- en/realtime-media/video/build/prevent-stream-bombing.mdx
- en/realtime-media/video/build/receive-notifications.mdx
- en/realtime-media/video/build/screen-sharing.mdx
- en/realtime-media/video/build/screenshot-upload.mdx
- en/realtime-media/video/build/spatial-audio.mdx
- en/realtime-media/video/build/virtual-background.mdx
- en/realtime-media/video/quickstart.mdx
- en/realtime-media/video/reference/agora-console-rest-api.md
- en/realtime-media/video/reference/migration-guide.mdx
- en/realtime-media/voice/build/app-size-optimization.mdx
- en/realtime-media/voice/build/audio-mixing-and-sound-effects.mdx
- en/realtime-media/voice/build/connection-status-management.mdx
- en/realtime-media/voice/build/in-call-quality-monitoring.mdx
- en/realtime-media/voice/build/pre-call-tests.mdx
- en/realtime-media/voice/build/prevent-stream-bombing.mdx
- en/realtime-media/voice/build/receive-notifications.mdx
- en/realtime-media/voice/build/spatial-audio.mdx
- en/realtime-media/voice/mcp.mdx
- en/realtime-media/voice/quickstart.mdx
- en/realtime-media/voice/reference/agora-console-rest-api.md
- en/realtime-media/voice/reference/migration-guide.mdx
- en/realtime-media/voice/reference/pricing.md
- en/realtime-media/voice/reference/release-notes.mdx
- en/realtime-media/voice/reference/supported-platforms.md
- en/realtime-media/whiteboard/build/authentication-workflow.md
- en/realtime-media/whiteboard/build/file-conversion-overview.md
- en/realtime-media/whiteboard/build/generate-token-rest.md
- en/realtime-media/whiteboard/build/get-started-sdk.mdx
- en/realtime-media/whiteboard/build/get-started-uikit.mdx
- en/realtime-media/whiteboard/build/scenes/overview.mdx
- en/realtime-media/whiteboard/overview/pricing.md
- en/realtime-media/whiteboard/reference/file-conversion-overview-deprecated.mdx
- en/realtime-media/whiteboard/reference/firewall.md
- en/realtime-media/whiteboard/reference/rest-api/file-conversion-deprecated.mdx
- en/realtime-media/whiteboard/reference/rest-api/file-conversion.md
- en/realtime-media/whiteboard/reference/rest-api/room-management.md
- en/realtime-media/whiteboard/reference/rest-api/scene-management.md
- en/realtime-media/whiteboard/reference/rest-api/screenshots.md
- en/solutions/agora-analytics/build/alarm.md
- en/solutions/agora-analytics/build/call-search.md
- en/solutions/agora-analytics/build/chat-data-insights.md
- en/solutions/agora-analytics/build/data-insight-plus.md
- en/solutions/agora-analytics/build/data-insight.md
- en/solutions/agora-analytics/build/embedded.md
- en/solutions/agora-analytics/reference/agora-console-rest-api.md
- en/solutions/agora-analytics/reference/call-search-terms.md
- en/solutions/agora-analytics/reference/pricing.md
- en/solutions/agora-analytics/reference/supported-platforms.md
- en/solutions/flexible-classroom/build/customize-classroom.md
- en/solutions/flexible-classroom/reference/agora-console-rest-api.md
- en/solutions/flexible-classroom/reference/classroom-rest-api.mdx
- en/solutions/interactive-live-streaming/build/app-size-optimization.mdx
- en/solutions/interactive-live-streaming/build/audio-mixing-and-sound-effects.mdx
- en/solutions/interactive-live-streaming/build/camera-movement.mdx
- en/solutions/interactive-live-streaming/build/connection-status-management.mdx
- en/solutions/interactive-live-streaming/build/in-call-quality-monitoring.mdx
- en/solutions/interactive-live-streaming/build/metakit.mdx
- en/solutions/interactive-live-streaming/build/pre-call-tests.mdx
- en/solutions/interactive-live-streaming/build/prevent-stream-bombing.mdx
- en/solutions/interactive-live-streaming/build/receive-notifications.mdx
- en/solutions/interactive-live-streaming/build/screen-sharing.mdx
- en/solutions/interactive-live-streaming/build/screenshot-upload.mdx
- en/solutions/interactive-live-streaming/build/spatial-audio.mdx
- en/solutions/interactive-live-streaming/build/virtual-background.mdx
- en/solutions/interactive-live-streaming/quickstart.mdx
- en/solutions/interactive-live-streaming/reference/agora-console-rest-api.md
- en/solutions/interactive-live-streaming/reference/migration-guide.md
- en/solutions/interactive-live-streaming/reference/pricing-legacy.md
- en/solutions/interactive-live-streaming/reference/pricing.md
- en/solutions/interactive-live-streaming/reference/release-notes.md
- en/solutions/interactive-live-streaming/reference/supported-platforms.md
- en/solutions/iot/reference/agora-console-rest-api.md
- en/solutions/iot/reference/communicate-with-rtc-sdk.md
- en/solutions/iot/reference/licensing.md
- en/solutions/iot/reference/supported-platforms.md
- zh-CN/ai/best-practices/optimize-latency.mdx
- zh-CN/ai/best-practices/regional-restrictions.mdx
- zh-CN/ai/billing.md
- zh-CN/api-reference/ncs-events.mdx
- zh-CN/best-practices/geofencing.mdx
- zh-CN/best-practices/governance.md
- zh-CN/best-practices/opt-latency.mdx
- zh-CN/introduction/index.mdx
- zh-CN/realtime-media/foundation-realtime.md
- zh-CN/realtime-media/media-processing-and-distribution.md
- zh-CN/realtime-media/server-and-extensions.md
- zh-CN/realtime-media/speech-to-text/audio-modality.mdx

### needs-anchor-normalization

- en/ai/get-started/test-mdx-comps.mdx
- en/ai/index.mdx
- en/realtime-media/broadcast-streaming/build/virtual-background.mdx
- en/realtime-media/broadcast-streaming/core-concepts.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/asynchronous-playback.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/configuration.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/entry-point.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/live-stream.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/domain-names.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/entry-points.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/pull-from-origin.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/custom.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/standard.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/configuration.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/entry-point.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/live-stream.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/post-processing.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-authentication.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-management.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-reports.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/stream-transfer.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/transcoding/custom.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/transcoding/standard.mdx
- en/realtime-media/broadcast-streaming/reference/restful-api/watermarks.mdx
- en/realtime-media/cloud-recording/build/authentication-workflow.mdx
- en/realtime-media/im/build/authentication.md
- en/realtime-media/im/build/offline-push/overview.md
- en/realtime-media/im/get-started/manage-agora-account.md
- en/realtime-media/im/reference/pricing.md
- en/realtime-media/im/reference/server-api/chatroom-management/manage-chatrooms.md
- en/realtime-media/im/reference/server-api/offline-push/offline-push-configuration.md
- en/realtime-media/im/reference/server-api/user-system-registration.md
- en/realtime-media/marketplace/build/ains.mdx
- en/realtime-media/marketplace/build/virtual-background.mdx
- en/realtime-media/media-pull/build/manage-agora-account.mdx
- en/realtime-media/media-pull/reference/restful-api.md
- en/realtime-media/media-push/build/manage-agora-account.mdx
- en/realtime-media/media-push/build/restful-api.md
- en/realtime-media/media-push/reference/billing-policies.md
- en/realtime-media/rtc-server-sdk/build/cloud-proxy.md
- en/realtime-media/rtm/core-concepts.md
- en/realtime-media/rtm/reference/pricing.md
- en/realtime-media/speech-to-text/reference/core-concepts.md
- en/realtime-media/video/build/ai-noise-suppression.mdx
- en/realtime-media/video/build/virtual-background.mdx
- en/realtime-media/voice/reference/release-notes.mdx
- en/realtime-media/whiteboard/build/get-started-sdk.mdx
- en/realtime-media/whiteboard/build/get-started-uikit.mdx
- en/solutions/agora-analytics/reference/core-concepts.md
- en/solutions/interactive-live-streaming/build/ai-noise-suppression.mdx
- en/solutions/interactive-live-streaming/build/virtual-background.mdx
- en/solutions/interactive-live-streaming/reference/release-notes.md
- en/solutions/iot/reference/core-concepts.md
- zh-CN/api-reference/ncs-events.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-basic.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-capture.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-custom-capturenrendering.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-encoded.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-raw.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/audio-spectrum.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/index.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/audio-effect.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/audiomixer.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/index.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/sound-position.mdx
- zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/spatial-audio.mdx
- zh-CN/api-reference/rtc/android/(current)/channel.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advancedaudiooptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advancedconfiginfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advanceoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-agorafacepositioninfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-agorarhythmplayerconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-areacode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioencodedframeobserverconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioframe.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioparams.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiorecordingconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiospectrumdata.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiotrackconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiovolumeinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-beautyoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-cachestatistics.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-cameracapturerconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediainfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediaoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediarelayconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-clientroleoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-climaxsegment.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-codeccapinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-codeccaplevels.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-colorenhanceoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-config.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-contentinspectconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-contentinspectmodule.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-datastreamconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-deviceinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-echotestconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-encodedvideoframeinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-encryptionconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-extensioncontext.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-externalvideoframe.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-faceshapeareaoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-faceshapebeautyoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-filtereffectoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-focallengthinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-imagetrackoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileprobeconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileprobeonewayresult.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileproberesult.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-leavechanneloptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-livetranscoding.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaccesspointconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaudiomixerconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaudiostats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localspatialaudioconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localtranscoderconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localvideostats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-logconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-loguploadserverinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lowlightenhanceoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mediarecorderconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mediasource.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-metadata.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mixedaudiostream.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-multipathstats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-music.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccacheinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccachestatustype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musicchartinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccontentcenterconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccontentcenterstatereason.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-pathstats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerplaybackstats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerstreaminfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerupdatedinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-preloadstate-android.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-recorderinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-recorderstreaminfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rectangle.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remoteaudiostats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remotevideostats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remotevoicepositioninfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcconnection.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcengineconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcimage.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcstats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rteexception.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rteplayerstats.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screenaudioparameters.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screencaptureparameters2.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screenvideoparameters.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-segmentationproperty.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-simulcaststreamconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-snapshotconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-spatialaudioparams.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-spatialaudiozone.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-srcinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-transcodinguser.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-transcodingvideostream.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-uplinknetworkinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-useraudiospectruminfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-userinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videocanvas.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videodenoiseroptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videodimensions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videoencoderconfiguration.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videoformat.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videolayout.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videolayoutinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videorenderingtracinginfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videosubscriptionoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-virtualbackgroundsource.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkbuffer.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkconfig.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiocodecprofiletype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiodualmonomode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioequalizationbandfrequency.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiomixingdualmonomode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioprocessingchannels.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioprofiletype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioreverbtype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiosampleratetype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiosourcetype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiotracktype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-cameradirection.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-camerafocallengthtype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-compressionpreference.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-degradationpreference.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-encodingpreference.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-encryptionmode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-externalvideosourcetype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-framerate.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-loglevel.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerevent.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayermetadatatype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerreason.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerstate.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediasourcetype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediastreamtype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediatraceevent.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-multipathmode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-multipathtype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-musicplaymode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-orientationmode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-playerpreloadevent.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-renewtokenerrorcode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteabrfallbacklayer.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteabrsubscriptionlayer.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteerrorcode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteplayerevent.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteplayerstate.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rtevideomirrormode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rtevideorendermode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-screenscenariotype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-simulcaststreammode.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-streamfallbackoptions.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoapplicationscenariotype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodecprofiletype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodectype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodectypeforstream.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoeffectaction.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoeffectnodeid.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videomoduleposition.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videosourcetype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videostreamtype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-voiceaitunertype.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/index.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-removedestchannelinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setdestchannelinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setsrcchannelinfo.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-addbackgroundimage.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-adduser.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-addwatermark.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getadvancedfeatures.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundcolor.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundimagelist.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getblue.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getgreen.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getred.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getusercount.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getusers.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getwatermarklist.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removebackgroundimage.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removeuser.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removewatermark.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setadvancedfeatures.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor2.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setblue.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setgreen.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setred.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setusers.mdx
- zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setusers2.mdx
- zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/channel-media-relay.mdx
- zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/index.mdx
- zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/media-push.mdx
- zh-CN/api-reference/rtc/android/(current)/device-management/audio-device.mdx
- zh-CN/api-reference/rtc/android/(current)/device-management/audio-route.mdx
- zh-CN/api-reference/rtc/android/(current)/device-management/index.mdx
- zh-CN/api-reference/rtc/android/(current)/device-management/video-device.mdx
- zh-CN/api-reference/rtc/android/(current)/extensions.mdx
- zh-CN/api-reference/rtc/android/(current)/full-sdk-api-list.mdx
- zh-CN/api-reference/rtc/android/(current)/initialize.mdx
- zh-CN/api-reference/rtc/android/(current)/metadata/datastream.mdx
- zh-CN/api-reference/rtc/android/(current)/metadata/index.mdx
- zh-CN/api-reference/rtc/android/(current)/metadata/metadata-observer.mdx
- zh-CN/api-reference/rtc/android/(current)/network-and-other.mdx
- zh-CN/api-reference/rtc/android/(current)/overview.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/audio-effect-file.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/audio-mixing.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/drm.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/index.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/index.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-cache.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-control.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-info.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-initialize.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-observer.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-open.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-playnrender.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/rhythmplayer.mdx
- zh-CN/api-reference/rtc/android/(current)/playback/rte-player.mdx
- zh-CN/api-reference/rtc/android/(current)/publish-and-subscribe.mdx
- zh-CN/api-reference/rtc/android/(current)/recording.mdx
- zh-CN/api-reference/rtc/android/(current)/video/camera-capture.mdx
- zh-CN/api-reference/rtc/android/(current)/video/index.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/face-detection.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/image-source.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/index.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/local-transcoder.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/snapshot.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/video-enhance-option.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/virtualbackground.mdx
- zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/watermark.mdx
- zh-CN/api-reference/rtc/android/(current)/video/screencapture.mdx
- zh-CN/api-reference/rtc/android/(current)/video/video-basic.mdx
- zh-CN/api-reference/rtc/android/(current)/video/video-custom-capturenrendering.mdx
- zh-CN/api-reference/rtc/android/(current)/video/video-encoded.mdx
- zh-CN/api-reference/rtc/android/(current)/video/video-raw.mdx
- zh-CN/api-reference/rtc/android/(current)/video/video-rendering.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-basic.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-capture.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-custom-capturenrendering.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-encoded.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-raw.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/audio-spectrum.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/audio-effect.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/audiomixer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/sound-position.mdx
- zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/spatial-audio.mdx
- zh-CN/api-reference/rtc/android/4.6.0/channel.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advancedaudiooptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advancedconfiginfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advanceoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-agorafacepositioninfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-agorarhythmplayerconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-areacode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioencodedframeobserverconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioframe.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioparams.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiorecordingconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiospectrumdata.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiotrackconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiovolumeinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-beautyoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-cachestatistics.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-cameracapturerconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediainfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediaoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediarelayconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-clientroleoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-climaxsegment.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-codeccapinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-codeccaplevels.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-colorenhanceoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-config.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-contentinspectconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-contentinspectmodule.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-datastreamconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-deviceinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-echotestconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-encodedvideoframeinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-encryptionconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-extensioncontext.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-externalvideoframe.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-faceshapeareaoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-faceshapebeautyoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-filtereffectoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-focallengthinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-imagetrackoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileprobeconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileprobeonewayresult.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileproberesult.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-leavechanneloptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-livetranscoding.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaccesspointconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaudiomixerconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaudiostats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localspatialaudioconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localtranscoderconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localvideostats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-logconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-loguploadserverinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lowlightenhanceoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mediarecorderconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mediasource.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-metadata.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mixedaudiostream.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-multipathstats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-music.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccacheinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccachestatustype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musicchartinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccontentcenterconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccontentcenterstatereason.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-pathstats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerplaybackstats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerstreaminfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerupdatedinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-preloadstate-android.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-recorderinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-recorderstreaminfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rectangle.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remoteaudiostats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remotevideostats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remotevoicepositioninfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcconnection.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcengineconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcimage.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcstats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rteexception.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rteplayerstats.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screenaudioparameters.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screencaptureparameters2.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screenvideoparameters.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-segmentationproperty.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-simulcaststreamconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-snapshotconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-spatialaudioparams.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-spatialaudiozone.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-srcinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-transcodinguser.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-transcodingvideostream.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-uplinknetworkinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-useraudiospectruminfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-userinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videocanvas.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videodenoiseroptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videodimensions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videoencoderconfiguration.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videoformat.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videolayout.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videolayoutinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videorenderingtracinginfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videosubscriptionoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-virtualbackgroundsource.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkbuffer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkconfig.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiocodecprofiletype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiodualmonomode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioequalizationbandfrequency.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiomixingdualmonomode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioprocessingchannels.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioprofiletype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioreverbtype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiosampleratetype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiosourcetype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiotracktype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-cameradirection.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-camerafocallengthtype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-compressionpreference.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-degradationpreference.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-encodingpreference.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-encryptionmode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-externalvideosourcetype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-framerate.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-loglevel.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerevent.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayermetadatatype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerreason.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerstate.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediasourcetype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediastreamtype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediatraceevent.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-multipathmode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-multipathtype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-musicplaymode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-orientationmode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-playerpreloadevent.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-renewtokenerrorcode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteabrfallbacklayer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteabrsubscriptionlayer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteerrorcode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteplayerevent.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteplayerstate.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rtevideomirrormode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rtevideorendermode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-screenscenariotype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-simulcaststreammode.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-streamfallbackoptions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoapplicationscenariotype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodecprofiletype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodectype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodectypeforstream.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoeffectaction.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoeffectnodeid.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videomoduleposition.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videosourcetype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videostreamtype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-voiceaitunertype.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-removedestchannelinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setdestchannelinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setsrcchannelinfo.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-addbackgroundimage.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-adduser.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-addwatermark.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getadvancedfeatures.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundcolor.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundimagelist.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getblue.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getgreen.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getred.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getusercount.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getusers.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getwatermarklist.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removebackgroundimage.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removeuser.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removewatermark.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setadvancedfeatures.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor2.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setblue.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setgreen.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setred.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setusers.mdx
- zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setusers2.mdx
- zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/channel-media-relay.mdx
- zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/media-push.mdx
- zh-CN/api-reference/rtc/android/4.6.0/device-management/audio-device.mdx
- zh-CN/api-reference/rtc/android/4.6.0/device-management/audio-route.mdx
- zh-CN/api-reference/rtc/android/4.6.0/device-management/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/device-management/video-device.mdx
- zh-CN/api-reference/rtc/android/4.6.0/extensions.mdx
- zh-CN/api-reference/rtc/android/4.6.0/full-sdk-api-list.mdx
- zh-CN/api-reference/rtc/android/4.6.0/initialize.mdx
- zh-CN/api-reference/rtc/android/4.6.0/metadata/datastream.mdx
- zh-CN/api-reference/rtc/android/4.6.0/metadata/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/metadata/metadata-observer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/network-and-other.mdx
- zh-CN/api-reference/rtc/android/4.6.0/overview.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/audio-effect-file.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/audio-mixing.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/drm.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-cache.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-control.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-info.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-initialize.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-observer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-open.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-playnrender.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/rhythmplayer.mdx
- zh-CN/api-reference/rtc/android/4.6.0/playback/rte-player.mdx
- zh-CN/api-reference/rtc/android/4.6.0/publish-and-subscribe.mdx
- zh-CN/api-reference/rtc/android/4.6.0/recording.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/camera-capture.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/face-detection.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/image-source.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/index.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/local-transcoder.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/snapshot.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/video-enhance-option.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/virtualbackground.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/watermark.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/screencapture.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/video-basic.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/video-custom-capturenrendering.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/video-encoded.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/video-raw.mdx
- zh-CN/api-reference/rtc/android/4.6.0/video/video-rendering.mdx

### needs-frontmatter-cleanup

- en/solutions/iot/build/manage-agora-account.md

### needs-jsx-review

- en/realtime-media/broadcast-streaming/build/ai-noise-suppression.mdx
- en/realtime-media/broadcast-streaming/build/screen-sharing.mdx
- en/realtime-media/broadcast-streaming/build/use-an-extension.mdx
- en/realtime-media/broadcast-streaming/build/voice-activity-detection.mdx
- en/realtime-media/broadcast-streaming/quickstart.mdx
- en/realtime-media/cloud-recording/build/authentication-workflow.mdx
- en/realtime-media/cloud-recording/build/manage-files.mdx
- en/realtime-media/cloud-recording/build/online-play.mdx
- en/realtime-media/cloud-recording/build/receive-notifications.mdx
- en/realtime-media/cloud-recording/reference/pricing.mdx
- en/realtime-media/marketplace/build/ains.mdx
- en/realtime-media/on-premise-recording/build/authentication-workflow.mdx
- en/realtime-media/rtm/build/channels/stream-channel.mdx
- en/realtime-media/video/build/ai-noise-suppression.mdx
- en/realtime-media/video/build/authentication-workflow.mdx
- en/realtime-media/video/build/compile-run-sample-project.mdx
- en/realtime-media/video/build/deploy-token-server.mdx
- en/realtime-media/video/build/screen-sharing.mdx
- en/realtime-media/video/build/use-an-extension.mdx
- en/realtime-media/video/build/voice-activity-detection.mdx
- en/realtime-media/video/quickstart.mdx
- en/realtime-media/voice/quickstart.mdx
- en/solutions/flexible-classroom/reference/classroom-rest-api.mdx
- en/solutions/interactive-live-streaming/build/screen-sharing.mdx
- en/solutions/interactive-live-streaming/quickstart.mdx

### needs-mdx-extension

- en/ai/build/event-notifications.md
- en/ai/build/send-multimodal-messages.md
- en/ai/build/transcripts.md
- en/ai/release-notes.md
- en/realtime-media/broadcast-streaming/build/deploy-token-server.md
- en/realtime-media/cloud-recording/rest-quickstart.md
- en/realtime-media/im/build/offline-push/parse-push-fields.md
- en/realtime-media/im/build/offline-push/translate-push-notifications.md
- en/realtime-media/im/reference/console/content-moderation-microsoft.md
- en/realtime-media/on-premise-recording/quickstart.md
- en/realtime-media/rtm/build/channels/message-channel.md
- en/realtime-media/rtm/build/channels/topics.md
- en/realtime-media/rtm/build/channels/user-channel.md
- en/realtime-media/rtm/build/client-configuration.md
- en/realtime-media/rtm/build/connection/connection-management.md
- en/realtime-media/rtm/build/messaging/add-event-listener.md
- en/realtime-media/rtm/build/messaging/message-payload-structuring.md
- en/realtime-media/rtm/build/presence.md
- en/realtime-media/rtm/build/storage/store-channel-metadata.md
- en/realtime-media/rtm/build/storage/store-user-metadata.md
- en/realtime-media/voice/build/deploy-token-server.md
- en/realtime-media/voice/reference/api-sunset.md
- en/realtime-media/voice/reference/error-codes.md
- en/realtime-media/voice/reference/service-limits.md
- en/realtime-media/whiteboard/build/generate-token-app-server.md
- en/realtime-media/whiteboard/overview/supported-platforms.md
- en/solutions/agora-analytics/product-overview.md
- en/solutions/flexible-classroom/product-overview.md
- en/solutions/interactive-live-streaming/build/deploy-token-server.md
- en/solutions/interactive-live-streaming/product-overview.md
- en/solutions/interactive-live-streaming/reference/migration-guide.md
- en/solutions/interactive-live-streaming/reference/release-notes.md
- en/solutions/iot/product-overview.md

### needs-table-normalization

- en/ai/pricing.md
- en/realtime-media/broadcast-streaming/build/geofencing.mdx
- en/realtime-media/broadcast-streaming/build/spatial-audio.mdx
- en/realtime-media/broadcast-streaming/quickstart.mdx
- en/realtime-media/broadcast-streaming/reference/migration-guide.mdx
- en/realtime-media/broadcast-streaming/reference/pricing-legacy.md
- en/realtime-media/cloud-recording/reference/pricing.mdx
- en/realtime-media/on-premise-recording/reference/pricing.mdx
- en/realtime-media/rtm/reference/pricing.md
- en/realtime-media/video/build/geofencing.mdx
- en/realtime-media/video/build/spatial-audio.mdx
- en/realtime-media/video/quickstart.mdx
- en/realtime-media/video/reference/migration-guide.mdx
- en/realtime-media/voice/build/geofencing.mdx
- en/realtime-media/voice/build/spatial-audio.mdx
- en/realtime-media/voice/quickstart.mdx
- en/realtime-media/whiteboard/overview/pricing.md
- en/solutions/agora-analytics/build/alarm.md
- en/solutions/agora-analytics/reference/call-search-terms.md
- en/solutions/agora-analytics/reference/pricing.md
- en/solutions/interactive-live-streaming/build/geofencing.mdx
- en/solutions/interactive-live-streaming/build/spatial-audio.mdx
- en/solutions/interactive-live-streaming/quickstart.mdx
- en/solutions/interactive-live-streaming/reference/migration-guide.md
- en/solutions/interactive-live-streaming/reference/pricing-legacy.md


## Affected Files

### en/ai/best-practices/optimize-latency.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (4), TabsContent (10), TabsList (4), TabsTrigger (10)
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L33 `inline-html:br`: | LLM | `llm_ttfb` / `llm_ttfs` | TTFB: Time To First Byte, the first byte latency.<br/>TTFS: Time To First Sentence, the first sentence latency. | 250-1000 |

### en/ai/build/audio-output.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 3
  - `raw-html:li`: 4
- Samples:
  - L61 `raw-html:li`: | Audio data<br/>`data` | Base64-encoded PCM byte stream array | <li>LLM generation with audio processing capabilities</li> <li>Custom audio processing service generation</li> | Pl
  - L61 `inline-html:br`: | Audio data<br/>`data` | Base64-encoded PCM byte stream array | <li>LLM generation with audio processing capabilities</li> <li>Custom audio processing service generation</li> | Pl
  - L62 `inline-html:br`: | Transcription content<br/>`transcript` | The complete text content corresponding to the audio | LLM generation | Stores the text in short-term memory (context) |
  - L63 `inline-html:br`: | Verbatim subtitles<br/>`words` | Subtitle content with word-by-word timestamps | Supports LLM generation with verbatim output | Processes into verbatim real-time subtitles |

### en/ai/build/event-notifications.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (18), CodeBlockTabs (6), CodeBlockTabsList (6), CodeBlockTabsTrigger (18)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 18
  - `md-with-mdx-jsx:CodeBlockTabs`: 6
  - `md-with-mdx-jsx:CodeBlockTabsList`: 6
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 18
- Samples:
  - L39 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="android">
  - L40 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L41 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  - L46 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="android">

### en/ai/build/presets.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (2), TabsContent (6), TabsList (2), TabsTrigger (6)
- Patterns:
  - `raw-html:li`: 18
  - `raw-html:ul`: 6
- Samples:
  - L31 `raw-html:li`: | ASR | <ul><li>`deepgram_nova_2`</li><li>`deepgram_nova_3`</li></ul> |
  - L32 `raw-html:li`: | LLM | <ul><li>`openai_gpt_4o_mini`</li><li>`openai_gpt_4_1_mini`</li><li>`openai_gpt_5_nano`</li><li>`openai_gpt_5_mini`</li></ul> |
  - L33 `raw-html:li`: | TTS | <ul><li>`minimax_speech_2_6_turbo`</li><li>`minimax_speech_2_8_turbo`</li><li>`openai_tts_1`</li></ul> |
  - L31 `raw-html:ul`: | ASR | <ul><li>`deepgram_nova_2`</li><li>`deepgram_nova_3`</li></ul> |
  - L32 `raw-html:ul`: | LLM | <ul><li>`openai_gpt_4o_mini`</li><li>`openai_gpt_4_1_mini`</li><li>`openai_gpt_5_nano`</li><li>`openai_gpt_5_mini`</li></ul> |
  - L33 `raw-html:ul`: | TTS | <ul><li>`minimax_speech_2_6_turbo`</li><li>`minimax_speech_2_8_turbo`</li><li>`openai_tts_1`</li></ul> |

### en/ai/build/send-multimodal-messages.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: Tabs (6), TabsContent (18), TabsList (6), TabsTrigger (18)
- Patterns:
  - `md-with-mdx-jsx:Tabs`: 6
  - `md-with-mdx-jsx:TabsContent`: 18
  - `md-with-mdx-jsx:TabsList`: 6
  - `md-with-mdx-jsx:TabsTrigger`: 18
- Samples:
  - L35 `md-with-mdx-jsx:Tabs`: <Tabs>
  - L36 `md-with-mdx-jsx:TabsList`: <TabsList>
  - L37 `md-with-mdx-jsx:TabsTrigger`: <TabsTrigger value="android">Android</TabsTrigger>
  - L42 `md-with-mdx-jsx:TabsContent`: <TabsContent value="android">

### en/ai/build/short-term-memory.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 2
- Samples:
  - L103 `inline-html:br`: | Value | Description | `user`<br/>message | `assistant`<br/>message |

### en/ai/build/start-stop-agent.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (2), TabsContent (6), TabsList (2), TabsTrigger (6)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L17 `raw-html:details`: <details>
  - L21 `raw-html:details`: </details>
  - L18 `raw-html:summary`: <summary>Conversational AI Engine workflow</summary>

### en/ai/build/transcripts.md

- Statuses: `manual-html-review`, `needs-mdx-extension`
- Severity: high
- Effort: medium
- Components: Tabs (6), TabsContent (18), TabsList (6), TabsTrigger (18)
- Patterns:
  - `md-with-mdx-jsx:Tabs`: 6
  - `md-with-mdx-jsx:TabsContent`: 18
  - `md-with-mdx-jsx:TabsList`: 6
  - `md-with-mdx-jsx:TabsTrigger`: 18
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L25 `raw-html:details`: <details>
  - L30 `raw-html:details`: </details>
  - L26 `raw-html:summary`: <summary>Transcript rendering workflow</summary>
  - L45 `md-with-mdx-jsx:Tabs`: <Tabs>
  - L46 `md-with-mdx-jsx:TabsList`: <TabsList>
  - L47 `md-with-mdx-jsx:TabsTrigger`: <TabsTrigger value="android">Android</TabsTrigger>
  - L52 `md-with-mdx-jsx:TabsContent`: <TabsContent value="android">

### en/ai/device-kit/build/configure-device-network.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 6
- Samples:
  - L21 `raw-html:div`: <div class="flex flex-col gap-4 md:flex-row md:items-start">
  - L22 `raw-html:div`: <div class="md:w-1/2">
  - L30 `raw-html:div`: </div>
  - L32 `raw-html:div`: <div class="md:w-1/2">
  - L34 `raw-html:div`: </div>
  - L35 `raw-html:div`: </div>

### en/ai/get-started/test-mdx-comps.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: Accordion (4), Accordions (2), Callout (4), Card (3), Cards (2), CommandBlock (1), File (4), Files (2), Folder (4), PlatformInline (4), PlatformStructured (4), Step (6), Steps (2), Tab (6), Tabs (4), TabsContent (4), TabsList (2), TabsTrigger (4)
- Patterns:
  - `inline-html:br`: 1
  - `legacy-anchor-id`: 3
- Samples:
  - L190 `legacy-anchor-id`: <a id="native-links-headings" />
  - L281 `legacy-anchor-id`: <a id="api-reference-fallback" />
  - L285 `legacy-anchor-id`: <a id="post-project-agent" />
  - L203 `inline-html:br`: | Parameter descriptions | Default value includes all users.<br />An empty array excludes all audio streams. |

### en/ai/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Components: Card (2), Cards (4)
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L30 `legacy-anchor-id`: <a id="on-software-clients" />
  - L31 `legacy-anchor-id`: <a id="for-software-clients" />
  - L51 `legacy-anchor-id`: <a id="on-dedicated-devices" />

### en/ai/openai-realtime/get-started/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (2), TabsContent (10), TabsList (2), TabsTrigger (10)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L100 `raw-html:details`: <details>
  - L119 `raw-html:details`: </details>
  - L101 `raw-html:summary`: <summary>System prompt for LLMs</summary>

### en/ai/pricing.md

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `native-html-table`: 164
- Samples:
  - L17 `native-html-table`: <table>
  - L18 `native-html-table`: <thead>
  - L19 `native-html-table`: <tr>
  - L20 `native-html-table`: <th>Usage Type</th>
  - L21 `native-html-table`: <th>Pricing (USD / minute)</th>
  - L22 `native-html-table`: <th>Free Minutes</th>
  - L23 `native-html-table`: </tr>
  - L24 `native-html-table`: </thead>

### en/ai/reference/event-types.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 4
  - `raw-html:ul`: 2
- Samples:
  - L84 `raw-html:li`: | [103](#103-agent-history) | agent history | After an agent stops, this event notifies the stored history, which includes the following information:<ul><li>Messages exchanged betw
  - L84 `raw-html:ul`: | [103](#103-agent-history) | agent history | After an agent stops, this event notifies the stored history, which includes the following information:<ul><li>Messages exchanged betw

### en/ai/release-notes.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: Tabs (2), TabsContent (6), TabsList (2), TabsTrigger (6)
- Patterns:
  - `md-with-mdx-jsx:Tabs`: 2
  - `md-with-mdx-jsx:TabsContent`: 6
  - `md-with-mdx-jsx:TabsList`: 2
  - `md-with-mdx-jsx:TabsTrigger`: 6
- Samples:
  - L478 `md-with-mdx-jsx:Tabs`: <Tabs>
  - L479 `md-with-mdx-jsx:TabsList`: <TabsList>
  - L480 `md-with-mdx-jsx:TabsTrigger`: <TabsTrigger value="android">Android</TabsTrigger>
  - L485 `md-with-mdx-jsx:TabsContent`: <TabsContent value="android">

### en/ai/studio/deploy/sip-trunk.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 6
  - `raw-html:summary`: 6
- Samples:
  - L99 `raw-html:details`: <details>
  - L106 `raw-html:details`: </details>
  - L108 `raw-html:details`: <details>
  - L125 `raw-html:details`: </details>
  - L127 `raw-html:details`: <details>
  - L144 `raw-html:details`: </details>
  - L100 `raw-html:summary`: <summary>+1 (United States)</summary>
  - L109 `raw-html:summary`: <summary>+52 (Mexico), +54 (Argentina), +55 (Brazil), +56 (Chile), +51 (Peru), +44 (United Kingdom), +33 (France), +49 (Germany), +39 (Italy), +34 (Spain), +61 (Australia), +64 (Ne

### en/introduction/index.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: HelpHub (1), OverviewLinkBanner (2), SolutionCard (6), SolutionCardGrid (6), ToolkitGroup (6), ToolkitItem (11)
- Patterns:
  - `raw-html:div`: 2
- Samples:
  - L78 `raw-html:div`: <div className="not-prose my-8 grid gap-4 lg:grid-cols-3">
  - L98 `raw-html:div`: </div>

### en/realtime-media/broadcast-streaming/build/ai-noise-suppression.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), Link (10), PlatformStructured (10)
- Patterns:
  - `unapproved-jsx-component:Link`: 10
- Samples:
  - L84 `unapproved-jsx-component:Link`: * <Link to = "{{global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_setainsmode">`setAINSMode`</Link>

### en/realtime-media/broadcast-streaming/build/app-size-optimization.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 406
- Samples:
  - L290 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1413 |
  - L291 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1014 |
  - L292 `raw-html:li`: | Android | x86 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1403 |
  - L293 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1444 |
  - L399 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 945 |
  - L400 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 873 |
  - L401 `raw-html:li`: | Android | x86 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1125 |
  - L402 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1126 |

### en/realtime-media/broadcast-streaming/build/audio-mixing-and-sound-effects.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `inline-html:br`: 126
- Samples:
  - L52 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L53 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L54 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L349 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L350 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L351 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L516 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L517 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |

### en/realtime-media/broadcast-streaming/build/camera-movement.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (12), CodeBlockTabs (6), CodeBlockTabsList (6), CodeBlockTabsTrigger (12), PlatformStructured (4)
- Patterns:
  - `inline-html:img`: 2
  - `raw-html:li`: 8
  - `raw-html:ul`: 4
- Samples:
  - L44 `raw-html:li`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L183 `raw-html:li`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L44 `raw-html:ul`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L183 `raw-html:ul`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L31 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695546999-camera_portrait_6s.gif" width="200"/>
  - L34 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695552716-camera_lock_3s.gif" width="200"/>

### en/realtime-media/broadcast-streaming/build/connection-status-management.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 406
  - `raw-html:ul`: 122
- Samples:
  - L93 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannel`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L96 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L107 `raw-html:li`: |**Disconnected** |<ul><li>`LEAVE_CHANNEL` (5): The user leaves the channel.</li><li>`INVALID_TOKEN` (8):The token is invalid. Please use a valid token to join the channel.</li></u
  - L110 `raw-html:li`: |**Reconnecting** |<ul><li>`INTERRUPTED` (2): When the network connection is interrupted, the SDK automatically reconnects to the channel and the connection state continues to chan
  - L111 `raw-html:li`: |**Failed** |<ul><li>`BANNED_BY_SERVER` (3): The user is banned by the server.</li><li>`JOIN_FAILED` (4): The SDK stopped trying to reconnect after continued failed attempts to joi
  - L187 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannelByToken`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L190 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L201 `raw-html:li`: |**Disconnected** |<ul><li>`LeaveChannel` (5): The user leaves the channel.</li><li>`InvalidToken` (8):The token is invalid. Please use a valid token to join the channel.</li></ul>

### en/realtime-media/broadcast-streaming/build/deploy-token-server.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 8
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 8
- Samples:
  - L203 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L204 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L205 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L209 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/broadcast-streaming/build/geofencing.mdx

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `native-html-table`: 240
- Samples:
  - L17 `native-html-table`: <thead>
  - L18 `native-html-table`: <tr>
  - L19 `native-html-table`: <th>Designated access zone</th>
  - L20 `native-html-table`: <th>User's location</th>
  - L21 `native-html-table`: <th>Zone actually accessed by the SDK</th>
  - L22 `native-html-table`: <th>User experience</th>
  - L23 `native-html-table`: </tr>
  - L24 `native-html-table`: </thead>

### en/realtime-media/broadcast-streaming/build/in-call-quality-monitoring.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (20)
- Patterns:
  - `inline-html:br`: 16
- Samples:
  - L596 `inline-html:br`: | 1001 | `FRAMERATE_INPUT_TOO_LOW` <br/> Video capture frame rate is too low | 3001 | `FRAMERATE_INPUT_TOO_LOW_RECOVER` <br/> Video capture frame rate returns to normal|
  - L597 `inline-html:br`: | 1002 | `FRAMERATE_SENT_TOO_LOW` <br/> Video sending bitrate is too low | 3002 | `FRAMERATE_SENT_TOO_LOW_RECOVER` <br/> Video sending frame rate returns to normal |
  - L598 `inline-html:br`: | 1003 | `SEND_VIDEO_BITRATE_TOO_LOW` <br/> Video sending bitrate is too low | 3003 | `SEND_VIDEO_BITRATE_TOO_LOW_RECOVER` <br/> Video sending bitrate returns to normal |
  - L599 `inline-html:br`: | 1005 | `RECV_VIDEO_DECODE_FAILED` <br/> Receiving video decoding failed | 3005 | `RECV_VIDEO_DECODE_FAILED_RECOVER` <br/> Receiving video decoding returns to normal |
  - L600 `inline-html:br`: | 2001 | `AUDIO_INPUT_LEVEL_TOO_LOW` <br/> Send volume too low | 4001 | `AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER` <br/> Send volume back to normal |
  - L601 `inline-html:br`: | 2002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW` <br/> Receive volume too low | 4002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER` <br/> Receiving volume returns to normal |
  - L602 `inline-html:br`: | 2003 | `SEND_AUDIO_BITRATE_TOO_LOW` <br/> Audio sending bitrate is too low | 4003 | `SEND_AUDIO_BITRATE_TOO_LOW_RECOVER` <br/> Audio sending bitrate returns to normal |
  - L603 `inline-html:br`: | 2005 | `RECV_AUDIO_DECODE_FAILED` <br/> Failed to decode received audio | 4005 | `RECV_AUDIO_DECODE_FAILED_RECOVER` <br/> Received audio decoding returns to normal |

### en/realtime-media/broadcast-streaming/build/metakit.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (96), CodeBlockTabs (48), CodeBlockTabsList (48), CodeBlockTabsTrigger (96), PlatformStructured (4)
- Patterns:
  - `inline-html:br`: 23
  - `inline-html:img`: 9
  - `raw-html:li`: 18
  - `raw-html:ul`: 8
  - `raw-html:video`: 20
- Samples:
  - L56 `raw-html:li`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:li`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:li`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:li`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir
  - L56 `raw-html:ul`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:ul`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:ul`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:ul`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir

### en/realtime-media/broadcast-streaming/build/pre-call-tests.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 242
  - `raw-html:ul`: 110
- Samples:
  - L238 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L239 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L240 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L241 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi
  - L406 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L407 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L408 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L409 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi

### en/realtime-media/broadcast-streaming/build/prevent-stream-bombing.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 16
  - `raw-html:ol`: 6
- Samples:
  - L56 `raw-html:li`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:li`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:li`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew
  - L56 `raw-html:ol`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:ol`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:ol`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew

### en/realtime-media/broadcast-streaming/build/receive-notifications.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 1494
  - `raw-html:ul`: 252
  - `raw-html:video`: 18
- Samples:
  - L632 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L719 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L720 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L743 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L744 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L746 `raw-html:li`: | `reason` | Number | The reason why the host leaves the channel:<ul><li>1: The host quits the call.</li><li>2: The connection between the app client and the Agora RTC server times
  - L772 `raw-html:li`: | `platform` | Number | The platform type of the audience member's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li
  - L773 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie

### en/realtime-media/broadcast-streaming/build/screen-sharing.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: AgoraReplayKitExtDelegate (2), CodeBlockTab (48), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (48), Link (2), NSString (3), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 4
  - `raw-html:ul`: 2
  - `unapproved-jsx-component:AgoraReplayKitExtDelegate`: 2
  - `unapproved-jsx-component:Link`: 2
  - `unapproved-jsx-component:NSString`: 3
- Samples:
  - L2370 `raw-html:li`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L2370 `raw-html:ul`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L355 `unapproved-jsx-component:Link`: - <Link to="{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_setscreencapturescenario">`setScreenCaptureScenario
  - L1698 `unapproved-jsx-component:NSString`: - (void)broadcastStartedWithSetupInfo:(NSDictionary<NSString *,NSObject *> *)setupInfo {
  - L2043 `unapproved-jsx-component:AgoraReplayKitExtDelegate`: @interface SampleHandler ()<AgoraReplayKitExtDelegate>

### en/realtime-media/broadcast-streaming/build/screenshot-upload.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (14)
- Patterns:
  - `raw-html:li`: 98
  - `raw-html:p`: 14
  - `raw-html:ul`: 14
- Samples:
  - L165 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L225 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L403 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L463 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L641 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L701 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L885 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L945 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|

### en/realtime-media/broadcast-streaming/build/spatial-audio.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), PlatformStructured (14)
- Patterns:
  - `native-html-table`: 168
  - `raw-html:div`: 14
  - `raw-html:li`: 84
  - `raw-html:ul`: 28
- Samples:
  - L517 `native-html-table`: <tr>
  - L518 `native-html-table`: <td><strong>Audio Blurring</strong></td>
  - L519 `native-html-table`: <td>
  - L523 `native-html-table`: </td>
  - L524 `native-html-table`: </tr>
  - L525 `native-html-table`: <tr>
  - L526 `native-html-table`: <td><strong>Range Audio</strong></td>
  - L527 `native-html-table`: <td>

### en/realtime-media/broadcast-streaming/build/use-an-extension.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), Link (2), PlatformStructured (18)
- Patterns:
  - `unapproved-jsx-component:Link`: 2
- Samples:
  - L612 `unapproved-jsx-component:Link`: - <Link to= "{{global.API_REF_WEB_ROOT}}/interfaces/iagorartc.html#registerextensions">`AgoraRTC.registerExtensions`</Link>

### en/realtime-media/broadcast-streaming/build/virtual-background.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), PlatformStructured (16)
- Patterns:
  - `legacy-anchor-name`: 2
  - `raw-html:video`: 16
- Samples:
  - L683 `legacy-anchor-name`: <a name="setoptions"></a>
  - L737 `legacy-anchor-name`: <a name="virtualbackgroundeffectoptions"></a>
  - L16 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L266 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L373 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L788 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L927 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L1030 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he

### en/realtime-media/broadcast-streaming/build/voice-activity-detection.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Link (4), PlatformStructured (2)
- Patterns:
  - `unapproved-jsx-component:Link`: 4
- Samples:
  - L98 `unapproved-jsx-component:Link`: Call the <Link to = "{{global.API_REF_WEB_ROOT}}/interfaces/iagorartc.html#registerextensions">`AgoraRTC.registerExtensions`</Link> method and pass the created `VADExtension` insta

### en/realtime-media/broadcast-streaming/core-concepts.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L14 `legacy-anchor-name`: <a name="agora-sd-rtn"></a>

### en/realtime-media/broadcast-streaming/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:img`: 1
- Samples:
  - L21 `inline-html:img`: <img

### en/realtime-media/broadcast-streaming/quickstart.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (56), CodeBlockTabs (28), CodeBlockTabsList (28), CodeBlockTabsTrigger (56), FString (1), PlatformStructured (26)
- Patterns:
  - `inline-html:br`: 1
  - `native-html-table`: 24
  - `raw-html:iframe`: 2
  - `raw-html:li`: 36
  - `raw-html:ol`: 4
  - `raw-html:p`: 1
  - `raw-html:ul`: 14
  - `unapproved-jsx-component:FString`: 1
- Samples:
  - L5325 `native-html-table`: <tr>
  - L5326 `native-html-table`: <td>Key</td>
  - L5327 `native-html-table`: <td>Type</td>
  - L5328 `native-html-table`: <td>Value</td>
  - L5329 `native-html-table`: </tr>
  - L5330 `native-html-table`: <tr>
  - L5331 `native-html-table`: <td>Privacy - Microphone Usage Description</td>
  - L5332 `native-html-table`: <td>String</td>

### en/realtime-media/broadcast-streaming/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/realtime-media/broadcast-streaming/reference/error-codes.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 36
  - `raw-html:ul`: 12
- Samples:
  - L29 `raw-html:li`: | `3` | The SDK is not ready yet. There are usually the following reasons: <ul><li>`RtcEngine` initialization failed. Please reinitialize `RtcEngine`.</li> <li>The user has not joi
  - L30 `raw-html:li`: | `4` | The current state of `RtcEngine` does not support this operation. There are generally the following reasons: <ul><li>Incorrect encryption mode set when using built-in encry
  - L31 `raw-html:li`: | `5` | The method call is rejected. There are generally the following reasons: <ul><li>`RtcEngine` initialization failed. Please reinitialize `RtcEngine`.</li> <li>The channel nam
  - L37 `raw-html:li`: | `17` | Joining a channel is rejected. There are usually the following reasons: <ul><li>The user is already in the channel. Agora recommends using the `onConnectionStateChanged` c
  - L38 `raw-html:li`: | `18` | Failed to leave the channel. There are generally the following reasons: <ul><li>The user has already left the channel, and this error is returned when the method to exit t
  - L53 `raw-html:li`: | `110` | Token is invalid. There are generally the following reasons: <ul><li>App certificate is enabled in the Agora Console, but App ID + Token authentication is not used. When
  - L29 `raw-html:ul`: | `3` | The SDK is not ready yet. There are usually the following reasons: <ul><li>`RtcEngine` initialization failed. Please reinitialize `RtcEngine`.</li> <li>The user has not joi
  - L30 `raw-html:ul`: | `4` | The current state of `RtcEngine` does not support this operation. There are generally the following reasons: <ul><li>Incorrect encryption mode set when using built-in encry

### en/realtime-media/broadcast-streaming/reference/migration-guide.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: PlatformStructured (6)
- Patterns:
  - `native-html-table`: 52
  - `raw-html:li`: 44
  - `raw-html:p`: 32
  - `raw-html:ul`: 12
- Samples:
  - L233 `native-html-table`: <thead>
  - L234 `native-html-table`: <tr>
  - L235 `native-html-table`: <th>API</th>
  - L236 `native-html-table`: <th>v3.x</th>
  - L237 `native-html-table`: <th>v4.x</th>
  - L238 `native-html-table`: </tr>
  - L239 `native-html-table`: </thead>
  - L240 `native-html-table`: <tr class="odd">

### en/realtime-media/broadcast-streaming/reference/pricing-legacy.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `inline-html:br`: 4
  - `native-html-table`: 44
  - `raw-html:p`: 4
  - `raw-html:span`: 8
- Samples:
  - L168 `native-html-table`: <tr>
  - L169 `native-html-table`: <th>Billed service (video type)</th>
  - L170 `native-html-table`: <th>Total usage (minutes) = Sum of all individual usage</th>
  - L171 `native-html-table`: <th>Unit price (US$<span>/1,000 minutes)</span></th>
  - L172 `native-html-table`: <th colspan="1">Cost of each service (US$)</th>
  - L173 `native-html-table`: <th colspan="1">Total cost (US$)(rounded to two decimal places)</th>
  - L174 `native-html-table`: </tr>
  - L175 `native-html-table`: <tr>

### en/realtime-media/broadcast-streaming/reference/pricing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: RTCMinutesCalculator (1)
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:div`: 2
- Samples:
  - L207 `raw-html:div`: <div style={{ height: '20px' }}></div>
  - L59 `inline-html:br`: | **Advanced audio processing**<br/>(AGC, AEC and ANS) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | - |

### en/realtime-media/broadcast-streaming/reference/restful-api/asynchronous-playback.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L96 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/configuration.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:details`: 18
  - `raw-html:li`: 214
  - `raw-html:summary`: 22
  - `raw-html:ul`: 14
- Samples:
  - L346 `legacy-anchor-name`: <a name="http-code"></a>
  - L180 `raw-html:details`: <details>
  - L189 `raw-html:details`: </details>
  - L191 `raw-html:details`: <details>
  - L220 `raw-html:details`: </details>
  - L222 `raw-html:details`: <details>
  - L250 `raw-html:details`: </details>
  - L252 `raw-html:details`: <details>

### en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/entry-point.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L63 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/custom-recording/live-stream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L90 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/domain-names.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:li`: 24
- Samples:
  - L253 `legacy-anchor-name`: <a name="http-code"></a>
  - L36 `raw-html:li`: | `type` | String | Required. The domain name type:<li>`"publish"`: The stream-pushing domain name.</li><li>`"play"`: The stream-playing domain name.</li> |
  - L37 `raw-html:li`: | `region` | String | Required when the domain name type is set as `"publish"`. This parameter only applies to stream-pushing domain names. The region of the Agora server used for
  - L47 `raw-html:li`: | `type` | String | Set the domain name type:<li>`"publish"`: The stream-pushing domain name.</li><li>`"play"`: The stream-playing domain name.</li> |
  - L152 `raw-html:li`: | `type` | String | The domain name type.<li>`"publish"`: The stream-pushing domain name.</li><li>`"play"`: The stream-playing domain name.</li> |
  - L220 `raw-html:li`: | `type` | String | The domain name type.<li>`"publish"`: The stream-pushing domain name.</li><li>`"play"`: The stream-playing domain name.</li> |

### en/realtime-media/broadcast-streaming/reference/restful-api/entry-points.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L141 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/pull-from-origin.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 3
- Samples:
  - L11 `legacy-anchor-name`: <a name="pull"></a>
  - L120 `legacy-anchor-name`: <a name="callback"></a>
  - L147 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/custom.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:details`: 18
  - `raw-html:li`: 230
  - `raw-html:summary`: 22
  - `raw-html:ul`: 14
- Samples:
  - L327 `legacy-anchor-name`: <a name="http-code"></a>
  - L161 `raw-html:details`: <details>
  - L170 `raw-html:details`: </details>
  - L172 `raw-html:details`: <details>
  - L201 `raw-html:details`: </details>
  - L203 `raw-html:details`: <details>
  - L231 `raw-html:details`: </details>
  - L233 `raw-html:details`: <details>

### en/realtime-media/broadcast-streaming/reference/restful-api/snapshot-moderation/standard.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:li`: 16
- Samples:
  - L124 `legacy-anchor-name`: <a name="http-code"></a>
  - L34 `raw-html:li`: | `enabled` | Bool | Required. Whether to enable the snapshot capturing function:<li>`true`: Enable snapshot capturing.</li><li>`false`: Disable snapshot capturing.</li> |
  - L36 `raw-html:li`: | `enableModeration` | Bool | Optional. Whether to enable content moderation:<li>`true`: Enable content moderation.</li><li>`false`: (default) Disable content moderation.</li> |
  - L93 `raw-html:li`: | `enabled` | Bool | Whether the snapshot capturing function is enabled:<li>`true`: Snapshot capturing is enabled.</li><li>`false`: Snapshot capturing is disabled.</li> |
  - L95 `raw-html:li`: | `enableModeration` | Bool | Whether content moderation is enabled:<li>`true`: Content moderation is enabled.</li><li>`false`: Content moderation is not enabled.</li> |

### en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/configuration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 2
- Samples:
  - L136 `legacy-anchor-name`: <a name="hlsconfig"></a>
  - L143 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/entry-point.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L63 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/live-stream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L90 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/standard-recording/post-processing.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L197 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/stream-authentication.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:li`: 8
- Samples:
  - L189 `legacy-anchor-name`: <a name="http-code"></a>
  - L83 `raw-html:li`: | `enabled` | Boolean | Required. Whether to enable origin authentication: <li>`true`: Enable origin authentication.</li><li>`false`: (Default) Disable origin authentication.</li>
  - L139 `raw-html:li`: | `enabled` | Bool | Required. Whether origin authentication is enabled : <li>`true`: Origin authentication is enabled.</li><li>`false`: Origin authentication is disabled.</li> |

### en/realtime-media/broadcast-streaming/reference/restful-api/stream-management.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L159 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/stream-reports.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:div`: 6
- Samples:
  - L357 `legacy-anchor-name`: <a name="http-code"></a>
  - L142 `raw-html:div`: <div class="alert info">If the <code>start_time</code> and <code>end_time</code> parameters are not specified, the default time range to query stream-pushing records is the last 7
  - L221 `raw-html:div`: <div class="alert info">If the <code>start_time</code> and <code>end_time</code> parameters are not specified, the default time range to query stream-pushing quality is the last 6
  - L307 `raw-html:div`: <div class="alert info">If the <code>start_time</code> and <code>end_time</code> parameters are not specified, the default time range to query stream-playing statistics is the last

### en/realtime-media/broadcast-streaming/reference/restful-api/stream-transfer.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 2
  - `raw-html:div`: 2
  - `raw-html:li`: 8
- Samples:
  - L117 `legacy-anchor-name`: <a name="callback"></a>
  - L144 `legacy-anchor-name`: <a name="http-code"></a>
  - L8 `raw-html:div`: <div class="alert info">Stream transfer is also known as Rebroadcasting, Restreaming or RTMP Passthrough.</div>
  - L34 `raw-html:li`: | `enabled` | Bool | Optional. Whether to enable the transfer function:<li>`true`: Enable the transfer function.</li><li>`false`: (Default) Disable the transfer function.</li> |
  - L89 `raw-html:li`: | `enabled` | Bool | Whether the transfer function is enabled:<li>`true`: The transfer function is enabled.</li><li>`false`: The transfer function is disabled.</li> |

### en/realtime-media/broadcast-streaming/reference/restful-api/transcoding/custom.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:li`: 18
- Samples:
  - L253 `legacy-anchor-name`: <a name="http-code"></a>
  - L34 `raw-html:li`: | `profile` | String | Optional. The encoding profile. Each profile represents a set of encoding parameters. Generally speaking, a higher profile means better video quality and req
  - L102 `raw-html:li`: | `profile` | String | Optional. The encoding profile. Each profile represents a set of encoding parameters. Generally speaking, a higher profile means better video quality and req
  - L211 `raw-html:li`: | `profile` | String | Optional. The encoding profile.<li>`base`: The base profile, which is suitable for mobile devices.</li><li>`main`: The standard profile, which is suitable fo

### en/realtime-media/broadcast-streaming/reference/restful-api/transcoding/standard.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L137 `legacy-anchor-name`: <a name="http-code"></a>

### en/realtime-media/broadcast-streaming/reference/restful-api/watermarks.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:li`: 4
- Samples:
  - L159 `legacy-anchor-name`: <a name="http-code"></a>
  - L152 `raw-html:li`: | `url` | String | Required. The URL of the watermark image. Only PNG files are supported. To easily set different watermarks for different entry points or live streams, you can us

### en/realtime-media/broadcast-streaming/reference/supported-platforms.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
  - `raw-html:ul`: 2
- Samples:
  - L12 `raw-html:li`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|
  - L12 `raw-html:ul`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|

### en/realtime-media/cloud-recording/build/authentication-workflow.mdx

- Statuses: `needs-anchor-normalization`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Accordion (4), Accordions (4), Tabs (4), TabsContent (24), TabsList (4), TabsTrigger (24), YOUR (2)
- Patterns:
  - `legacy-anchor-name`: 1
  - `unapproved-jsx-component:YOUR`: 2
- Samples:
  - L908 `legacy-anchor-name`: <a name="api-reference"></a>
  - L695 `unapproved-jsx-component:YOUR`: var appID = "<YOUR APP ID>";

### en/realtime-media/cloud-recording/build/manage-files.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: YourinputPath (1)
- Patterns:
  - `unapproved-jsx-component:YourinputPath`: 1
- Samples:
  - L135 `unapproved-jsx-component:YourinputPath`: ./ha_transcoder.exe -inputPath "<YourinputPath>" -ignoreNotExist -concatM3u8 -concatStrategy 0

### en/realtime-media/cloud-recording/build/merge-files.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 38
- Samples:
  - L112 `raw-html:li`: | Linux | <li>VLC</li><li>ffplayer</li> |
  - L113 `raw-html:li`: | Windows | <li>Media Player</li><li>KM Player</li><li>VLC Player</li><li>Chrome (49.0.2623 or later)</li> |
  - L114 `raw-html:li`: | macOS | <li>QuickTime Player</li><li>Movist</li><li>MPlayerX</li><li>Chrome (49.0.2623 or later)</li><li>Safari (11.0.3 or later)</li> |
  - L115 `raw-html:li`: | iOS | <li>iOS default player</li><li>KMPlayer</li><li>Safari (9.0 or later)</li> |
  - L116 `raw-html:li`: | Android | <li>Android default player</li><li>MXPlayer</li><li>VLC</li><li>KMPlayer</li><li>Chrome (9.0.2623 or later)</li> |

### en/realtime-media/cloud-recording/build/online-play.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: YourBucketName (2)
- Patterns:
  - `unapproved-jsx-component:YourBucketName`: 2
- Samples:
  - L46 `unapproved-jsx-component:YourBucketName`: "arn:aws:s3:::<YourBucketName>",

### en/realtime-media/cloud-recording/build/receive-notifications.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Accordion (2), Accordions (2), Replace (1)
- Patterns:
  - `raw-html:video`: 2
  - `unapproved-jsx-component:Replace`: 1
- Samples:
  - L259 `raw-html:video`: <video src="/images/video-sdk/enable-notifications.mp4" controls style={{ width: '100%', height: 'auto' }} loop>
  - L261 `raw-html:video`: </video>
  - L299 `unapproved-jsx-component:Replace`: const secret = "<Replace with your secret code>"

### en/realtime-media/cloud-recording/build/screen-capture.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 4
- Samples:
  - L59 `raw-html:li`: | [`snapshotConfig`](/en/api-reference/cloud-recording/restful#snapshotconfig) | Configures the time interval between two successive screenshots and the file format of the screensh

### en/realtime-media/cloud-recording/build/webpage-best-practices.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:img`: 2
- Samples:
  - L77 `inline-html:img`: <img src="https://web-cdn.agora.io/docs-files/1634550897083"/>
  - L83 `inline-html:img`: <img src="https://web-cdn.agora.io/docs-files/1634550920718" />

### en/realtime-media/cloud-recording/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:img`: 1
- Samples:
  - L21 `inline-html:img`: <img

### en/realtime-media/cloud-recording/reference/pricing.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: Accordion (2), Accordions (2), PricingCalculator (1)
- Patterns:
  - `native-html-table`: 194
  - `raw-html:div`: 2
  - `raw-html:p`: 4
  - `unapproved-jsx-component:PricingCalculator`: 1
- Samples:
  - L147 `native-html-table`: <table>
  - L161 `native-html-table`: <tbody>
  - L162 `native-html-table`: <tr>
  - L163 `native-html-table`: <th rowspan="2">Date</th>
  - L164 `native-html-table`: <th colspan="5">Actual usage duration in seconds</th>
  - L165 `native-html-table`: <th colspan="5">Usage duration displayed on Agora Console in minutes</th>
  - L166 `native-html-table`: </tr>
  - L167 `native-html-table`: <tr>

### en/realtime-media/cloud-recording/rest-quickstart.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: Accordion (4), Accordions (4)
- Patterns:
  - `md-with-mdx-jsx:Accordion`: 4
  - `md-with-mdx-jsx:Accordions`: 4
- Samples:
  - L49 `md-with-mdx-jsx:Accordions`: <Accordions>
  - L50 `md-with-mdx-jsx:Accordion`: <Accordion title="Supported third-party cloud storage services">

### en/realtime-media/foundation-realtime.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 10
- Samples:
  - L6 `raw-html:div`: <div id="rm-rtc"></div>
  - L12 `raw-html:div`: <div id="rm-rtm"></div>
  - L18 `raw-html:div`: <div id="rm-im"></div>
  - L24 `raw-html:div`: <div id="rm-speech-to-text"></div>
  - L30 `raw-html:div`: <div id="rm-rtsa"></div>

### en/realtime-media/im/build/authentication.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L39 `legacy-anchor-id`: <a id="use-tokens-for-user-authentication"></a>
  - L44 `legacy-anchor-id`: <a id="deploy-a-token-server"></a>

### en/realtime-media/im/build/offline-push/overview.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L6 `legacy-anchor-id`: <a id="custom-displays"></a>

### en/realtime-media/im/build/offline-push/parse-push-fields.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (10), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (10)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 10
  - `md-with-mdx-jsx:CodeBlockTabs`: 2
  - `md-with-mdx-jsx:CodeBlockTabsList`: 2
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 10
- Samples:
  - L6 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="android">
  - L7 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L8 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  - L15 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="android">

### en/realtime-media/im/build/offline-push/translate-push-notifications.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (10), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (10)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 10
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 10
- Samples:
  - L16 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="android">
  - L17 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L18 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  - L23 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="android">

### en/realtime-media/im/get-started/manage-agora-account.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 6
- Samples:
  - L9 `legacy-anchor-id`: <a id="create-an-agora-account"></a>
  - L22 `legacy-anchor-id`: <a id="create-an-agora-project"></a>
  - L45 `legacy-anchor-id`: <a id="create-and-manage-projects"></a>
  - L50 `legacy-anchor-id`: <a id="manage-app-certificates"></a>
  - L51 `legacy-anchor-id`: <a id="enable-the-primary-certificate"></a>
  - L66 `legacy-anchor-id`: <a id="generate-a-temporary-token"></a>

### en/realtime-media/im/reference/console/content-moderation-microsoft.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (14), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (14)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 14
  - `md-with-mdx-jsx:CodeBlockTabs`: 2
  - `md-with-mdx-jsx:CodeBlockTabsList`: 2
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 14
- Samples:
  - L50 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="android">
  - L51 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L52 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="android">Android</CodeBlockTabsTrigger>
  - L61 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="android">

### en/realtime-media/im/reference/pricing.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L83 `legacy-anchor-id`: <a id="subscribe-to-the-pricing-plan"></a>
  - L84 `legacy-anchor-id`: <a id="subscription-packages"></a>
  - L85 `legacy-anchor-id`: <a id="top-up-packages"></a>
  - L110 `legacy-anchor-id`: <a id="aggregate-resolution"></a>

### en/realtime-media/im/reference/server-api/chatroom-management/manage-chatrooms.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L49 `legacy-anchor-id`: <a id="creating-a-chat-room"></a>

### en/realtime-media/im/reference/server-api/offline-push/offline-push-configuration.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L540 `legacy-anchor-id`: <a id="create-a-push-template"></a>

### en/realtime-media/im/reference/server-api/user-system-registration.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L832 `legacy-anchor-id`: <a id="unbanning-a-user"></a>

### en/realtime-media/marketplace/build/ains.mdx

- Statuses: `needs-anchor-normalization`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), Link (10), PlatformStructured (10)
- Patterns:
  - `legacy-anchor-name`: 5
  - `unapproved-jsx-component:Link`: 10
- Samples:
  - L9 `legacy-anchor-name`: <a name="type"></a>
  - L87 `legacy-anchor-name`: <a name="type"></a>
  - L159 `legacy-anchor-name`: <a name="type"></a>
  - L640 `legacy-anchor-name`: <a name="type"></a>
  - L699 `legacy-anchor-name`: <a name="type"></a>
  - L83 `unapproved-jsx-component:Link`: * <Link to = "{{global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_setainsmode">`setAINSMode`</Link>

### en/realtime-media/marketplace/build/camera-movement.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Callout (8), PlatformStructured (12), Tabs (8), TabsContent (16), TabsList (8), TabsTrigger (16)
- Patterns:
  - `inline-html:img`: 2
- Samples:
  - L36 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695546999-camera_portrait_6s.gif" width="200"/>
  - L39 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695552716-camera_lock_3s.gif" width="200"/>

### en/realtime-media/marketplace/build/metakit.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (96), CodeBlockTabs (48), CodeBlockTabsList (48), CodeBlockTabsTrigger (96), PlatformStructured (4)
- Patterns:
  - `inline-html:br`: 23
  - `inline-html:img`: 9
  - `raw-html:li`: 18
  - `raw-html:ul`: 8
  - `raw-html:video`: 20
- Samples:
  - L56 `raw-html:li`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:li`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:li`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:li`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir
  - L56 `raw-html:ul`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:ul`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:ul`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:ul`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir

### en/realtime-media/marketplace/build/provisioning.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 22
- Samples:
  - L47 `raw-html:li`: | `status` | String | The status of the request: <li>`success`: The request succeeds.</li><li>`failed`: The request fails.</li> |
  - L103 `raw-html:li`: | `status` | String | The status of the request: <li>`success`: The request succeeds.</li><li>`failed`: The request fails. </li> |
  - L105 `raw-html:li`: | `data` | Object | This object includes the following properties:<li>`appKey`: String (32–255 bytes). The app key of the project. You use this field to authenticate the user.</li>
  - L158 `raw-html:li`: | `status` | String | The status of the request: <li>`success`: The request succeeds.</li><li>`failed`: The request fails.</li> |
  - L211 `raw-html:li`: | `status` | String | The status of the request:<li>`success`: The request succeeds.</li><li>`failed`: The request fails.</li> |

### en/realtime-media/marketplace/build/publish-extension.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 4
- Samples:
  - L38 `raw-html:li`: | 4 | Extension category | Currently must be one of the following: <li>Audio and video modifiers: Extensions that modify the audio or video source.</li><li>Tools: Extensions that p

### en/realtime-media/marketplace/build/usage.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 30
  - `raw-html:ul`: 2
- Samples:
  - L50 `raw-html:li`: | `hasNext` | Boolean | Whether the usage page list has the next page:<li>`true`: The usage page list has the next page. The request repeats.</li><li>`false`: The usage page list d
  - L51 `raw-html:li`: | `data` | Array | The usage data, which contains the following properties: <li>`projectId`: The project ID. </li> <li>`amount`: The usage amount. The data format is BigDecimal. Th
  - L113 `raw-html:li`: | `hasNext` | Boolean | Whether the billing page list has the next page:<li>`true`: The billing page list has the next page. The request repeats.</li> <li>`false`: The billing page
  - L114 `raw-html:li`: | `data` | Array | The billing data, which contains the following properties:<li>`projectId`: The project ID.</li> <li>`amount`: The billing amount. The data format is BigDecimal.
  - L175 `raw-html:li`: | `status` | String | The status of the request:<li>`success`: The request succeeds.</li><li>`failed`: The request fails.</li> |
  - L51 `raw-html:ul`: | `data` | Array | The usage data, which contains the following properties: <li>`projectId`: The project ID. </li> <li>`amount`: The usage amount. The data format is BigDecimal. Th

### en/realtime-media/marketplace/build/virtual-background.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), PlatformStructured (16)
- Patterns:
  - `legacy-anchor-name`: 2
  - `raw-html:video`: 16
- Samples:
  - L683 `legacy-anchor-name`: <a name="setoptions"></a>
  - L737 `legacy-anchor-name`: <a name="virtualbackgroundeffectoptions"></a>
  - L16 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L266 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L373 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L788 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L927 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L1030 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he

### en/realtime-media/marketplace/reference/downloads.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 406
- Samples:
  - L290 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1413 |
  - L291 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1014 |
  - L292 `raw-html:li`: | Android | x86 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1403 |
  - L293 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1444 |
  - L399 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 945 |
  - L400 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 873 |
  - L401 `raw-html:li`: | Android | x86 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1125 |
  - L402 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1126 |

### en/realtime-media/marketplace/reference/supported-platforms.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 14
  - `raw-html:ul`: 4
- Samples:
  - L55 `raw-html:li`: |macOS|<ul><li>Chrome</li><li>Firefox</li><li>Safari</li><li>Edge</li></ul>|Supported |Supported|
  - L56 `raw-html:li`: |Windows|<ul><li>Chrome</li><li>Firefox</li><li>Edge</li></ul>|Supported |Supported|
  - L55 `raw-html:ul`: |macOS|<ul><li>Chrome</li><li>Firefox</li><li>Safari</li><li>Edge</li></ul>|Supported |Supported|
  - L56 `raw-html:ul`: |Windows|<ul><li>Chrome</li><li>Firefox</li><li>Edge</li></ul>|Supported |Supported|

### en/realtime-media/media-processing-and-distribution.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 16
- Samples:
  - L6 `raw-html:div`: <div id="rm-cloud-recording"></div>
  - L16 `raw-html:div`: <div id="rm-local-recording"></div>
  - L22 `raw-html:div`: <div id="rm-media-push"></div>
  - L28 `raw-html:div`: <div id="rm-media-pull"></div>
  - L34 `raw-html:div`: <div id="rm-cloud-transcoding"></div>
  - L44 `raw-html:div`: <div id="rm-rtmp-gateway"></div>
  - L50 `raw-html:div`: <div id="rm-fusion-cdn"></div>
  - L56 `raw-html:div`: <div id="rm-ppt-conversion"></div>

### en/realtime-media/media-pull/build/integration-best-practices.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 72
  - `raw-html:ul`: 28
- Samples:
  - L27 `raw-html:li`: |Create|<ul><li>Creating Media Pull tasks (cloud players) with names is limited to 2 queries per second. </li><li>Creating cloud players without names is limited to 50 queries per
  - L29 `raw-html:li`: |List|<ul><li>For a project with filter, the limit of the query rate is 2 times per second and 15 times per minute.</li><li>When there is no filter, the limit of query rate is 10 t
  - L45 `raw-html:li`: | Media Pull | <ul><li>SD 20</li> <li>HD 20</li> <li>FHD 10</li></ul> | <ul><li>SD 20</li> <li>HD 10</li> <li>FHD 5</li></ul> |<ul><li>SD 20</li> <li>HD 10</li> <li>FHD 5</li></ul>
  - L60 `raw-html:li`: | Media Pull | <ul><li>SD 20</li> <li>HD 20</li> <li>FHD 10</li></ul> | <ul><li>SD 20</li> <li>HD 10</li> <li>FHD 5</li></ul> |<ul><li>SD 20</li> <li>HD 10</li> <li>FHD 5</li></ul>
  - L63 `raw-html:li`: If you need to inject multiple streams of different resolutions at the same time, make sure you meet the following requirements:<ul><li>The number of streams per resolution cannot
  - L191 `raw-html:li`: |Optional |Cloud player user name |<ul><li>Set UID or account as the user name for cloud player. Do not set both fields at the same time.</li><li>Use the name field to manage the c
  - L192 `raw-html:li`: |Required |Region |<ul><li>Set the region in the same area as your media streaming.</li><li>Pass region value in lowercase.</li></ul>|
  - L194 `raw-html:li`: |Optional |Troubleshooting |Rectify the errors as follows: <ul><li>Use the retreat strategy.</li><li>Check the error code.</li></ul>If the preceding troubleshooting methods do not

### en/realtime-media/media-pull/build/manage-agora-account.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Components: Tabs (2), TabsContent (4), TabsList (2), TabsTrigger (4)
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L10 `legacy-anchor-id`: <a id="create-an-agora-account"></a>
  - L56 `legacy-anchor-id`: <a id="create-an-agora-project"></a>
  - L71 `legacy-anchor-id`: <a id="get-the-app-id"></a>
  - L84 `legacy-anchor-id`: <a id="manage-app-certificates"></a>

### en/realtime-media/media-pull/build/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (2), TabsContent (10), TabsList (2), TabsTrigger (10)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L100 `raw-html:details`: <details>
  - L146 `raw-html:details`: </details>
  - L101 `raw-html:summary`: <summary>System prompt for LLMs</summary>

### en/realtime-media/media-pull/build/receive-notifications.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Replace (1)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:li`: 8
  - `raw-html:summary`: 2
  - `raw-html:ul`: 2
  - `raw-html:video`: 2
- Samples:
  - L262 `raw-html:details`: <details>
  - L267 `raw-html:details`: </details>
  - L354 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L263 `raw-html:summary`: <summary>Video walkthrough</summary>
  - L354 `raw-html:ul`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L264 `raw-html:video`: <video src="/images/video-sdk/enable-notifications.mp4" controls loop>
  - L266 `raw-html:video`: </video>

### en/realtime-media/media-pull/reference/restful-api.md

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `legacy-anchor-id`: 1
  - `raw-html:div`: 2
  - `raw-html:li`: 26
- Samples:
  - L586 `legacy-anchor-id`: <a id="code"></a>
  - L525 `raw-html:div`: <div class="alert info"> Agora recommends using this field. If you do not pass in any value, Agora's server automatically generates a UUID to pass in.</div>
  - L582 `raw-html:li`: | `Create` | <li>In a project, when creating cloud players with `name`, the maximum rate of creating each cloud player with a different name is 2 times per second.</li><li>In a pro
  - L584 `raw-html:li`: | `List` | <li>In a project, the maximum rate of querying a cloud player with `filter`(`channelName`) is 2 times per second and 15 times per minute.</li><li>In a project, the maxim
  - L595 `raw-html:li`: | 400 Bad Request | <li>Parameter 'streamUrl' is invalid formatted.</li><li>Parameter channelName is invalid. Fix it in your request and retry.</li> |
  - L597 `raw-html:li`: | 403 Forbidden | <li>This project has not enabled Cloud Player product yet. Contact us to enable it.</li><li>This project's permission to use Cloud Player was revoked. Contact us
  - L600 `raw-html:li`: | 429 Too Many Requests | <li>Request rate limit exceeded.</li><li>Resources quota limit exceeded.</li><li>no available resources</li> |
  - L602 `raw-html:li`: | 503 Service Unavailable | <li>Service overload. Retry with back off strategy, and contact us to help fix it.</li><li>Service unavailable temporarily. Retry with back off strategy

### en/realtime-media/media-pull/reference/security.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 18
  - `raw-html:summary`: 18
- Samples:
  - L12 `raw-html:details`: <details>
  - L17 `raw-html:details`: </details>
  - L35 `raw-html:details`: <details>
  - L45 `raw-html:details`: </details>
  - L85 `raw-html:details`: <details>
  - L94 `raw-html:details`: </details>
  - L117 `raw-html:details`: <details>
  - L131 `raw-html:details`: </details>

### en/realtime-media/media-push/build/integration-best-practices.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 60
  - `raw-html:ul`: 22
- Samples:
  - L46 `raw-html:li`: | RESTful API | <ul><li>SD 300</li><li>HD 50</li><li>FHD 20</li></ul> | <ul><li>SD 20</li><li>HD 5</li><li>FHD - Contact support@agora.io to enable</li></ul> |<ul><li>SD 20</li><li
  - L61 `raw-html:li`: | Media Push | <ul><li>SD 300</li><li>HD 50</li><li>FHD 20</li></ul> | <ul><li>SD 20</li><li>HD 5</li><li>FHD - Contact support@agora.io to enable</li></ul> |<ul><li>SD 20</li><li>
  - L64 `raw-html:li`: If you need to upload multiple streams of different resolutions at the same time, make sure you meet the following requirements:<ul><li>The number of streams per resolution cannot
  - L247 `raw-html:li`: |Required |Region |<ul><li>Set the region in the same area as your media streaming.</li><li>Pass region value in lowercase.</li></ul>|
  - L249 `raw-html:li`: |Optional |Troubleshooting |Rectify the errors as follows: <ul><li>Use the retreat strategy.</li><li>Check the error code.</li></ul>If the preceding troubleshooting methods do not
  - L46 `raw-html:ul`: | RESTful API | <ul><li>SD 300</li><li>HD 50</li><li>FHD 20</li></ul> | <ul><li>SD 20</li><li>HD 5</li><li>FHD - Contact support@agora.io to enable</li></ul> |<ul><li>SD 20</li><li
  - L61 `raw-html:ul`: | Media Push | <ul><li>SD 300</li><li>HD 50</li><li>FHD 20</li></ul> | <ul><li>SD 20</li><li>HD 5</li><li>FHD - Contact support@agora.io to enable</li></ul> |<ul><li>SD 20</li><li>
  - L64 `raw-html:ul`: If you need to upload multiple streams of different resolutions at the same time, make sure you meet the following requirements:<ul><li>The number of streams per resolution cannot

### en/realtime-media/media-push/build/manage-agora-account.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Components: Tabs (2), TabsContent (4), TabsList (2), TabsTrigger (4)
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L12 `legacy-anchor-id`: <a id="create-an-agora-account"></a>
  - L58 `legacy-anchor-id`: <a id="create-an-agora-project"></a>
  - L73 `legacy-anchor-id`: <a id="get-the-app-id"></a>
  - L86 `legacy-anchor-id`: <a id="manage-app-certificates"></a>

### en/realtime-media/media-push/build/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tabs (2), TabsContent (10), TabsList (2), TabsTrigger (10)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L100 `raw-html:details`: <details>
  - L146 `raw-html:details`: </details>
  - L101 `raw-html:summary`: <summary>System prompt for LLMs</summary>

### en/realtime-media/media-push/build/receive-notifications.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Replace (1)
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:li`: 8
  - `raw-html:summary`: 2
  - `raw-html:ul`: 2
  - `raw-html:video`: 2
- Samples:
  - L262 `raw-html:details`: <details>
  - L267 `raw-html:details`: </details>
  - L354 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L263 `raw-html:summary`: <summary>Video walkthrough</summary>
  - L354 `raw-html:ul`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L264 `raw-html:video`: <video src="/images/video-sdk/enable-notifications.mp4" controls loop>
  - L266 `raw-html:video`: </video>

### en/realtime-media/media-push/build/restful-api.md

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `inline-html:img`: 3
  - `legacy-anchor-id`: 2
  - `raw-html:li`: 88
- Samples:
  - L65 `legacy-anchor-id`: <a id="createbody"></a>
  - L914 `legacy-anchor-id`: <a id="code"></a>
  - L80 `raw-html:li`: | name | (Optional) String | The name of the Converter. The maximum length is 64 characters. The supported character set range is:<li>All lowercase English letters (a-z)</li><li>Al
  - L87 `raw-html:li`: | transcodeOptions | (Required) JSON Object | The Converter’s transcoding configuration. <li>When the `audioOptions` and `videoOptions` fields in `converter.transcodeOptions` are n
  - L88 `raw-html:li`: | transcodeOptions.rtcChannel | (Required) String | The Agora channel name. This is the channel to which the stream processed by the Converter belongs. The maximum length of the st
  - L92 `raw-html:li`: <li>There is no need to set <code>audioOptions</code> and related fields in a video stream only (without audio) use-case.</li> <li>In an audio & video use-case, `audioOptions` is a
  - L99 `raw-html:li`: <li>There is no need to set <code>videoOptions</code> and related fields in an audio stream only (without video) use-case. </li> <li>In an audio & video use-case, `videoOptions` is
  - L104 `raw-html:li`: |transcodeOptions.videoOptions.layoutType | (Optional) Number | The screen layout type of the output video: <li>`0` or empty: (Default) Custom layout, which is set through the`tran

### en/realtime-media/media-push/reference/billing-policies.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L88 `legacy-anchor-id`: <a id="agoras-free-of-charge-policy-for-the-first-10000-minutes"></a>

### en/realtime-media/media-push/reference/pricing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
- Samples:
  - L64 `raw-html:li`: | H.264 video stream |<li> High-Definition (HD): 7.99 </li><li>Full High-Definition (Full HD): 15.99 </li>|
  - L65 `raw-html:li`: | H.265 video stream |<li> High-Definition (HD): 19.99</li><li> Full High-Definition (Full HD): 39.99 </li>|

### en/realtime-media/media-push/reference/restful-type-definition.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: ParamTable (18)
- Patterns:
  - `raw-html:li`: 24
- Samples:
  - L83 `raw-html:li`: |`fillMode` |(Optional) String| The display types of the screen.<li>`fill`: (Default) Under the premise of maintaining the aspect ratio, zoom the screen to fill the container. ![16
  - L99 `raw-html:li`: |`fillMode` | (Optional) String |The display types of the image. <li>`fill`: Under the premise of maintaining the aspect ratio, zoom the image so that the image fills the container
  - L109 `raw-html:li`: |`maxResolutionUid` |Number | The user ID of the user who is displayed in the large window. If `maxResolutionUid` is not set, the user with the loudest volume when the layout refre
  - L110 `raw-html:li`: |`fillMode` | String |The display options of the screen:<li>`fill`: (Default) Zoom the image to fill the window completely while maintaining the aspect ratio of the image.![1628837
  - L119 `raw-html:li`: | `source.metadata` | Bool | Set whether to pass in metadata-type SEI information.<li>`true`: Metadata-type SEI information is passed in.</li><li>(Default) `false`: Metadata-type S
  - L120 `raw-html:li`: | `source.datastream` | Bool | Set whether to pass in Agora Datastream-type SEI information type.<li>true: Agora Datastream-type SEI information is passed in.</li><li>(Default) fal

### en/realtime-media/media-push/reference/security.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 60
  - `raw-html:summary`: 60
- Samples:
  - L12 `raw-html:details`: <details>
  - L17 `raw-html:details`: </details>
  - L35 `raw-html:details`: <details>
  - L45 `raw-html:details`: </details>
  - L85 `raw-html:details`: <details>
  - L94 `raw-html:details`: </details>
  - L117 `raw-html:details`: <details>
  - L131 `raw-html:details`: </details>

### en/realtime-media/media-push/reference/sei-information.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 25
  - `raw-html:ul`: 4
- Samples:
  - L47 `raw-html:li`: | `canvas` | The canvas information. It contains the following properties:<ul><li>`w`: Width (pixel) of the canvas. It corresponds to the `width` member in the `LiveTranscoding` cl
  - L48 `raw-html:li`: | `regions` | The layout information of the host. It corresponds to the `transcodingUsers` member in the `LiveTranscoding` class. It contains the following properties:<ul><li>`suid
  - L47 `raw-html:ul`: | `canvas` | The canvas information. It contains the following properties:<ul><li>`w`: Width (pixel) of the canvas. It corresponds to the `width` member in the `LiveTranscoding` cl
  - L48 `raw-html:ul`: | `regions` | The layout information of the host. It corresponds to the `transcodingUsers` member in the `LiveTranscoding` class. It contains the following properties:<ul><li>`suid

### en/realtime-media/on-premise-recording/build/authentication-workflow.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Tabs (8), TabsContent (24), TabsList (4), TabsTrigger (24), YOUR (2)
- Patterns:
  - `unapproved-jsx-component:YOUR`: 2
- Samples:
  - L728 `unapproved-jsx-component:YOUR`: var appID = "<YOUR APP ID>";

### en/realtime-media/on-premise-recording/quickstart.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: Tabs (4), TabsContent (4), TabsList (2), TabsTrigger (4)
- Patterns:
  - `md-with-mdx-jsx:Tabs`: 4
  - `md-with-mdx-jsx:TabsContent`: 4
  - `md-with-mdx-jsx:TabsList`: 2
  - `md-with-mdx-jsx:TabsTrigger`: 4
- Samples:
  - L88 `md-with-mdx-jsx:Tabs`: <Tabs defaultValue="maven">
  - L90 `md-with-mdx-jsx:TabsList`: <TabsList>
  - L91 `md-with-mdx-jsx:TabsTrigger`: <TabsTrigger value="maven">Add using Maven</TabsTrigger>
  - L95 `md-with-mdx-jsx:TabsContent`: <TabsContent value="maven">

### en/realtime-media/on-premise-recording/reference/pricing.mdx

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `native-html-table`: 242
- Samples:
  - L57 `native-html-table`: <table>
  - L63 `native-html-table`: <thead>
  - L64 `native-html-table`: <tr>
  - L65 `native-html-table`: <th>Service type</th>
  - L66 `native-html-table`: <th>Category</th>
  - L67 `native-html-table`: <th>Pricing ($US/1,000 minutes)</th>
  - L68 `native-html-table`: </tr>
  - L69 `native-html-table`: </thead>

### en/realtime-media/rtc-server-sdk/build/cloud-proxy.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L28 `legacy-anchor-name`: <a name="implementation"></a>

### en/realtime-media/rtm/build/channels/message-channel.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (16), CodeBlockTabs (8), CodeBlockTabsList (8), CodeBlockTabsTrigger (16), Void (4)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 16
  - `md-with-mdx-jsx:CodeBlockTabs`: 8
  - `md-with-mdx-jsx:CodeBlockTabsList`: 8
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 16
- Samples:
  - L38 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L39 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L40 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L44 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/channels/stream-channel.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (24), CodeBlockTabs (12), CodeBlockTabsList (12), CodeBlockTabsTrigger (24), Void (4)
- Patterns:
  - `unapproved-jsx-component:Void`: 4
- Samples:
  - L234 `unapproved-jsx-component:Void`: mStreamChannel.publishTopicMessage(topicName, message, options, new ResultCallback<Void>() {

### en/realtime-media/rtm/build/channels/topics.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (16), CodeBlockTabs (8), CodeBlockTabsList (8), CodeBlockTabsTrigger (16)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 16
  - `md-with-mdx-jsx:CodeBlockTabs`: 8
  - `md-with-mdx-jsx:CodeBlockTabsList`: 8
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 16
- Samples:
  - L44 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L45 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L46 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L50 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/channels/user-channel.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), Void (4)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 8
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 8
- Samples:
  - L33 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L34 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L35 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L39 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/client-configuration.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (16), CodeBlockTabs (8), CodeBlockTabsList (8), CodeBlockTabsTrigger (16)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 16
  - `md-with-mdx-jsx:CodeBlockTabs`: 8
  - `md-with-mdx-jsx:CodeBlockTabsList`: 8
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 16
- Samples:
  - L36 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L37 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L38 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L42 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/connection/connection-management.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (24), CodeBlockTabs (12), CodeBlockTabsList (12), CodeBlockTabsTrigger (24)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 24
  - `md-with-mdx-jsx:CodeBlockTabs`: 12
  - `md-with-mdx-jsx:CodeBlockTabsList`: 12
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 24
- Samples:
  - L39 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L40 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L41 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L45 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/messaging/add-event-listener.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 8
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 8
- Samples:
  - L20 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L21 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L22 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L26 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/messaging/message-payload-structuring.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (14), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (14)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 14
  - `md-with-mdx-jsx:CodeBlockTabs`: 2
  - `md-with-mdx-jsx:CodeBlockTabsList`: 2
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 14
- Samples:
  - L41 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L42 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L43 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L52 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/presence.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (28), CodeBlockTabs (14), CodeBlockTabsList (14), CodeBlockTabsTrigger (28)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 28
  - `md-with-mdx-jsx:CodeBlockTabs`: 14
  - `md-with-mdx-jsx:CodeBlockTabsList`: 14
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 28
- Samples:
  - L43 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L44 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L45 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L49 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/storage/store-channel-metadata.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (28), CodeBlockTabs (14), CodeBlockTabsList (14), CodeBlockTabsTrigger (28)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 28
  - `md-with-mdx-jsx:CodeBlockTabs`: 14
  - `md-with-mdx-jsx:CodeBlockTabsList`: 14
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 28
- Samples:
  - L34 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L35 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L36 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L40 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/build/storage/store-user-metadata.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (36), CodeBlockTabs (18), CodeBlockTabsList (18), CodeBlockTabsTrigger (36)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 36
  - `md-with-mdx-jsx:CodeBlockTabs`: 18
  - `md-with-mdx-jsx:CodeBlockTabsList`: 18
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 36
- Samples:
  - L32 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L33 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L34 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L38 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/rtm/core-concepts.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L13 `legacy-anchor-name`: <a name="agora-sd-rtn"></a>

### en/realtime-media/rtm/quickstart.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (72), CodeBlockTabs (36), CodeBlockTabsList (36), CodeBlockTabsTrigger (72), PlatformStructured (12)
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L177 `inline-html:br`: <br/>

### en/realtime-media/rtm/reference/error-codes.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 2
- Samples:
  - L24 `inline-html:br`: | `403` | Unauthorized or feature not enabled | The App ID is invalid or does not have access to the required features. | - Verify that the App ID is correct.<br/>- Confirm that th

### en/realtime-media/rtm/reference/migration-guide.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: String (1), Void (6)
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L612 `inline-html:br`: || Event Listener| `void addEventListener(RtmEventListener listener)`<br/> `void removeEventListener(RtmEventListener listener)`|

### en/realtime-media/rtm/reference/pricing.md

- Statuses: `manual-html-review`, `needs-anchor-normalization`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `inline-html:br`: 3
  - `legacy-anchor-id`: 1
  - `native-html-table`: 122
  - `raw-html:li`: 18
  - `raw-html:ul`: 6
- Samples:
  - L276 `legacy-anchor-id`: <a id="storage-cost"></a>
  - L136 `native-html-table`: <table>
  - L137 `native-html-table`: <thead>
  - L138 `native-html-table`: <tr>
  - L139 `native-html-table`: <th align="left"></th>
  - L140 `native-html-table`: <th align="center">Free</th>
  - L141 `native-html-table`: <th align="center">Lite</th>
  - L142 `native-html-table`: <th align="center">Starter</th>

### en/realtime-media/rtmp-gateway/reference/rest-api/response-status-codes.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 18
- Samples:
  - L16 `inline-html:br`: | `400 Bad Request` | `Invalid settings.`<br />`Invalid 'channel' format.`<br />`Streaming key exists in region:na.` | Request parameter error. | Troubleshoot based on the specific
  - L18 `inline-html:br`: | `403 Forbidden` | `Media Gateway is not enabled for this project. Contact us to enable.`<br />`Stream does not belong to this app ID.` | The Media Gateway service has not been ac
  - L21 `inline-html:br`: | `429 Too Many Requests` | `Request rate limit exceeded.`<br />`Resources quota limit exceeded.`<br />`No available resources.` | Request rate or resource quota exceeded. | Use a
  - L23 `inline-html:br`: | `503 Service Unavailable` | `Service overload. Retry with the back-off strategy and contact us to fix it.`<br />`Service unavailable temporarily. Retry with the back-off strategy
  - L31 `inline-html:br`: | `400 Bad Request` | `Invalid settings.`<br />`Invalid template ID.`<br />`Missing field: "transcoding.video.enabled"`<br />`Unsupported codec: "AV1".` | Request parameter error.
  - L33 `inline-html:br`: | `403 Forbidden` | `Media Gateway is not enabled for this project. Contact us to enable.`<br />`Too many templates have been created.` | The service has not been activated, or too
  - L35 `inline-html:br`: | `429 Too Many Requests` | `Request rate limit exceeded.`<br />`Resources quota limit exceeded.`<br />`No available resources.` | Too many concurrent requests. | Use a backoff str
  - L38 `inline-html:br`: | `503 Service Unavailable` | `Service overload. Retry with the back-off strategy and contact us to fix it.`<br />`Service unavailable temporarily. Retry with the back-off strategy

### en/realtime-media/server-and-extensions.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 6
- Samples:
  - L6 `raw-html:div`: <div id="rm-rtc-server-sdk"></div>
  - L12 `raw-html:div`: <div id="rm-sdk-extension"></div>
  - L18 `raw-html:div`: <div id="rm-marketplace"></div>

### en/realtime-media/speech-to-text/build/parse-data.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tab (18), Tabs (8), TabsContent (8), TabsList (2), TabsTrigger (8)
- Patterns:
  - `raw-html:details`: 4
  - `raw-html:li`: 12
  - `raw-html:summary`: 4
  - `raw-html:ul`: 6
- Samples:
  - L137 `raw-html:details`: <details>
  - L157 `raw-html:details`: </details>
  - L222 `raw-html:details`: <details>
  - L248 `raw-html:details`: </details>
  - L470 `raw-html:li`: | `data_type` | `string` | The type of data: <ul><li> `transcribe`: Transcription </li><li> `translate`: Text translation </li></ul> |
  - L482 `raw-html:li`: | `is_final` | `bool` | Indicates whether this sentence is the final transcription result. <ul><li> `true`: The transcription engine has determined the result for this sentence, an
  - L488 `raw-html:li`: | `is_final` | `bool` | Indicates whether this sentence is the final translation result. <ul><li> `true`: The translation engine has determined that the translation result is final
  - L138 `raw-html:summary`: <summary>Install Protobuf Dependencies</summary>

### en/realtime-media/speech-to-text/build/record-captions.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L31 `raw-html:details`: <details>
  - L61 `raw-html:details`: </details>
  - L32 `raw-html:summary`: <summary>Sample Cloud Recording `start` request body</summary>

### en/realtime-media/speech-to-text/build/translation.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 14
  - `raw-html:ul`: 2
- Samples:
  - L104 `raw-html:li`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S
  - L104 `raw-html:ul`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S
  - L104 `inline-html:br`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S

### en/realtime-media/speech-to-text/get-started/quickstart.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 14
  - `raw-html:ul`: 2
- Samples:
  - L133 `raw-html:li`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S
  - L133 `raw-html:ul`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S
  - L133 `inline-html:br`: | `status` | String | Agent Status:<br/><ul><li>`IDLE`: The agent is not initialized.</li><li>`STARTING`: The agent is starting.</li><li>`RUNNING`: The agent is running.</li><li>`S

### en/realtime-media/speech-to-text/reference/api-callback-service.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Tab (10), Tabs (2)
- Patterns:
  - `inline-html:br`: 7
- Samples:
  - L83 `inline-html:br`: | `status` | `String` | The status of the task:<br/>= `STOPPED`: The task ended normally or due to idle timeout.<br/>- `FAILED`: The task failed. |
  - L84 `inline-html:br`: | `message` | `String` | The reason the agent exited the channel:<br/>- `OK`: The agent exited normally.<br/>- `Idle for too long`: The task timed out due to inactivity.<br/>- `RTC

### en/realtime-media/speech-to-text/reference/core-concepts.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L53 `legacy-anchor-id`: <a id="agora-sd-rtn"></a>

### en/realtime-media/speech-to-text/reference/security.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 60
  - `raw-html:summary`: 60
- Samples:
  - L12 `raw-html:details`: <details>
  - L17 `raw-html:details`: </details>
  - L35 `raw-html:details`: <details>
  - L45 `raw-html:details`: </details>
  - L85 `raw-html:details`: <details>
  - L94 `raw-html:details`: </details>
  - L117 `raw-html:details`: <details>
  - L131 `raw-html:details`: </details>

### en/realtime-media/transcoding/build/receive-ncs-events.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Replace (1)
- Patterns:
  - `raw-html:video`: 2
- Samples:
  - L259 `raw-html:video`: <video src="/images/video-sdk/enable-notifications.mp4" controls style={{ width: '100%', height: 'auto' }} loop>
  - L261 `raw-html:video`: </video>

### en/realtime-media/video/build/ai-noise-suppression.mdx

- Statuses: `needs-anchor-normalization`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), Link (10), PlatformStructured (10)
- Patterns:
  - `legacy-anchor-name`: 5
  - `unapproved-jsx-component:Link`: 10
- Samples:
  - L9 `legacy-anchor-name`: <a name="type"></a>
  - L87 `legacy-anchor-name`: <a name="type"></a>
  - L159 `legacy-anchor-name`: <a name="type"></a>
  - L640 `legacy-anchor-name`: <a name="type"></a>
  - L699 `legacy-anchor-name`: <a name="type"></a>
  - L83 `unapproved-jsx-component:Link`: * <Link to = "{{global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_setainsmode">`setAINSMode`</Link>

### en/realtime-media/video/build/app-size-optimization.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 406
- Samples:
  - L290 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1413 |
  - L291 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1014 |
  - L292 `raw-html:li`: | Android | x86 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1403 |
  - L293 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1444 |
  - L399 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 945 |
  - L400 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 873 |
  - L401 `raw-html:li`: | Android | x86 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1125 |
  - L402 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1126 |

### en/realtime-media/video/build/audio-mixing-and-sound-effects.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `inline-html:br`: 126
- Samples:
  - L52 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L53 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L54 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L349 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L350 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L351 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L516 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L517 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |

### en/realtime-media/video/build/authentication-workflow.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Accordion (2), Accordions (2), Dictionary (1), IRtcEngine (1), IRtcEngineEventHandler (1), JoinChannelVideoToken (1), MyApp (2), PlatformStructured (48), RawImage (1), React (4), RtcSurfaceView (2), SafeAreaView (2), ScrollView (2), StatefulWidget (1), String (2), Switch (1), Tabs (6), TabsContent (12), TabsList (6), TabsTrigger (12), Text (20), TokenObject (2), UIElementDrag (1), VideoSurface (2), View (4), Your (13)
- Patterns:
  - `unapproved-jsx-component:Dictionary`: 1
  - `unapproved-jsx-component:IRtcEngine`: 1
  - `unapproved-jsx-component:IRtcEngineEventHandler`: 1
  - `unapproved-jsx-component:JoinChannelVideoToken`: 1
  - `unapproved-jsx-component:MyApp`: 2
  - `unapproved-jsx-component:RawImage`: 1
  - `unapproved-jsx-component:React`: 4
  - `unapproved-jsx-component:RtcSurfaceView`: 2
  - `unapproved-jsx-component:SafeAreaView`: 2
  - `unapproved-jsx-component:ScrollView`: 2
  - `unapproved-jsx-component:StatefulWidget`: 1
  - `unapproved-jsx-component:String`: 2
  - `unapproved-jsx-component:Switch`: 1
  - `unapproved-jsx-component:Text`: 20
  - `unapproved-jsx-component:TokenObject`: 2
  - `unapproved-jsx-component:UIElementDrag`: 1
  - `unapproved-jsx-component:VideoSurface`: 2
  - `unapproved-jsx-component:View`: 4
  - `unapproved-jsx-component:Your`: 13
- Samples:
  - L258 `unapproved-jsx-component:Your`: .url("http://<Your Host URL and port>/fetch_rtc_token")
  - L441 `unapproved-jsx-component:String`: val map: Map<String, Any> = gson.fromJson(result, Map::class.java)
  - L706 `unapproved-jsx-component:MyApp`: State<MyApp> createState() => _MyAppState();
  - L730 `unapproved-jsx-component:StatefulWidget`: State<StatefulWidget> createState() => _State();
  - L733 `unapproved-jsx-component:JoinChannelVideoToken`: class _State extends State<JoinChannelVideoToken> {
  - L1230 `unapproved-jsx-component:IRtcEngine`: const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  - L1231 `unapproved-jsx-component:IRtcEngineEventHandler`: const eventHandlerRef = useRef<IRtcEngineEventHandler>(); // IRtcEngine event handler
  - L1370 `unapproved-jsx-component:SafeAreaView`: <SafeAreaView style={styles.main}>

### en/realtime-media/video/build/camera-movement.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (12), CodeBlockTabs (6), CodeBlockTabsList (6), CodeBlockTabsTrigger (12), PlatformStructured (4)
- Patterns:
  - `inline-html:img`: 2
  - `raw-html:li`: 8
  - `raw-html:ul`: 4
- Samples:
  - L44 `raw-html:li`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L183 `raw-html:li`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L44 `raw-html:ul`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L183 `raw-html:ul`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L31 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695546999-camera_portrait_6s.gif" width="200"/>
  - L34 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695552716-camera_lock_3s.gif" width="200"/>

### en/realtime-media/video/build/compile-run-sample-project.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (12), CodeBlockTabs (6), CodeBlockTabsList (6), CodeBlockTabsTrigger (12), PlatformStructured (96), TEST_APP_ID (1), TEST_CHANNEL_ID (1), TEST_TOKEN (1)
- Patterns:
  - `unapproved-jsx-component:TEST_APP_ID`: 1
  - `unapproved-jsx-component:TEST_CHANNEL_ID`: 1
  - `unapproved-jsx-component:TEST_TOKEN`: 1
- Samples:
  - L296 `unapproved-jsx-component:TEST_APP_ID`: return '<TEST_APP_ID>';
  - L300 `unapproved-jsx-component:TEST_TOKEN`: return '<TEST_TOKEN>';
  - L304 `unapproved-jsx-component:TEST_CHANNEL_ID`: return '<TEST_CHANNEL_ID>';

### en/realtime-media/video/build/connection-status-management.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (82), Tabs (2), TabsContent (4), TabsList (2), TabsTrigger (4)
- Patterns:
  - `raw-html:li`: 60
  - `raw-html:ul`: 40
- Samples:
  - L465 `raw-html:li`: <ul><li>`REJECTED_BY_SERVER` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannel` again after the local use
  - L510 `raw-html:li`: <ul><li>`RejectedByServer` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannel` again after the local user
  - L555 `raw-html:li`: <ul><li>`RejectedByServer` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannel` again after the local user
  - L600 `raw-html:li`: <ul><li>`RejectedByServer` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannelByToken` again after the loca
  - L645 `raw-html:li`: <ul><li>`RejectedByServer` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannelByToken` again after the loca
  - L690 `raw-html:li`: <ul><li>`RejectedByServer` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannel` again after the local user
  - L735 `raw-html:li`: <ul><li>`REJECTED_BY_SERVER` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `JoinChannel` again after the local use
  - L780 `raw-html:li`: <ul><li>`REJECTED_BY_SERVER` (10): The user is banned by the server. May also occurs under the following circumstances:<ul><li>The app calls `joinChannel` again after the local use

### en/realtime-media/video/build/deploy-token-server.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Accordion (4), Accordions (4), Tabs (4), TabsContent (24), TabsList (4), TabsTrigger (24), YOUR (2)
- Patterns:
  - `unapproved-jsx-component:YOUR`: 2
- Samples:
  - L705 `unapproved-jsx-component:YOUR`: var appID = "<YOUR APP ID>";

### en/realtime-media/video/build/geofencing.mdx

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `native-html-table`: 240
- Samples:
  - L17 `native-html-table`: <thead>
  - L18 `native-html-table`: <tr>
  - L19 `native-html-table`: <th>Designated access zone</th>
  - L20 `native-html-table`: <th>User's location</th>
  - L21 `native-html-table`: <th>Zone actually accessed by the SDK</th>
  - L22 `native-html-table`: <th>User experience</th>
  - L23 `native-html-table`: </tr>
  - L24 `native-html-table`: </thead>

### en/realtime-media/video/build/metakit.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (96), CodeBlockTabs (48), CodeBlockTabsList (48), CodeBlockTabsTrigger (96), PlatformStructured (4)
- Patterns:
  - `inline-html:br`: 23
  - `inline-html:img`: 9
  - `raw-html:li`: 18
  - `raw-html:ul`: 8
  - `raw-html:video`: 20
- Samples:
  - L56 `raw-html:li`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:li`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:li`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:li`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir
  - L56 `raw-html:ul`: <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses t
  - L2305 `raw-html:ul`: <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses th
  - L2354 `raw-html:ul`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:ul`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir

### en/realtime-media/video/build/pre-call-tests.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: Accordion (6), Accordions (4), PlatformStructured (48), Tabs (4), TabsContent (8), TabsList (4), TabsTrigger (8)
- Patterns:
  - `raw-html:li`: 10
  - `raw-html:ul`: 4
- Samples:
  - L1291 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi
  - L1291 `raw-html:ul`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi

### en/realtime-media/video/build/prevent-stream-bombing.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 16
  - `raw-html:ol`: 6
- Samples:
  - L56 `raw-html:li`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:li`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:li`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew
  - L56 `raw-html:ol`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:ol`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:ol`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew

### en/realtime-media/video/build/receive-notifications.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 1494
  - `raw-html:ul`: 252
  - `raw-html:video`: 18
- Samples:
  - L632 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L719 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L720 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L743 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L744 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L746 `raw-html:li`: | `reason` | Number | The reason why the host leaves the channel:<ul><li>1: The host quits the call.</li><li>2: The connection between the app client and the Agora RTC server times
  - L772 `raw-html:li`: | `platform` | Number | The platform type of the audience member's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li
  - L773 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie

### en/realtime-media/video/build/screen-sharing.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: AgoraReplayKitExtDelegate (2), CodeBlockTab (48), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (48), Link (2), NSString (3), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 4
  - `raw-html:ul`: 2
  - `unapproved-jsx-component:AgoraReplayKitExtDelegate`: 2
  - `unapproved-jsx-component:Link`: 2
  - `unapproved-jsx-component:NSString`: 3
- Samples:
  - L2370 `raw-html:li`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L2370 `raw-html:ul`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L355 `unapproved-jsx-component:Link`: - <Link to="{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_setscreencapturescenario">`setScreenCaptureScenario
  - L1698 `unapproved-jsx-component:NSString`: - (void)broadcastStartedWithSetupInfo:(NSDictionary<NSString *,NSObject *> *)setupInfo {
  - L2043 `unapproved-jsx-component:AgoraReplayKitExtDelegate`: @interface SampleHandler ()<AgoraReplayKitExtDelegate>

### en/realtime-media/video/build/screenshot-upload.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (14)
- Patterns:
  - `raw-html:li`: 98
  - `raw-html:p`: 14
  - `raw-html:ul`: 14
- Samples:
  - L165 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L225 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L403 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L463 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L641 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L701 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L885 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L945 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|

### en/realtime-media/video/build/spatial-audio.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), PlatformStructured (14)
- Patterns:
  - `native-html-table`: 168
  - `raw-html:div`: 14
  - `raw-html:li`: 84
  - `raw-html:ul`: 28
- Samples:
  - L517 `native-html-table`: <tr>
  - L518 `native-html-table`: <td><strong>Audio Blurring</strong></td>
  - L519 `native-html-table`: <td>
  - L523 `native-html-table`: </td>
  - L524 `native-html-table`: </tr>
  - L525 `native-html-table`: <tr>
  - L526 `native-html-table`: <td><strong>Range Audio</strong></td>
  - L527 `native-html-table`: <td>

### en/realtime-media/video/build/use-an-extension.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), Link (2), PlatformStructured (18)
- Patterns:
  - `unapproved-jsx-component:Link`: 2
- Samples:
  - L612 `unapproved-jsx-component:Link`: - <Link to= "{{global.API_REF_WEB_ROOT}}/interfaces/iagorartc.html#registerextensions">`AgoraRTC.registerExtensions`</Link>

### en/realtime-media/video/build/virtual-background.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), PlatformStructured (16)
- Patterns:
  - `legacy-anchor-name`: 2
  - `raw-html:video`: 16
- Samples:
  - L683 `legacy-anchor-name`: <a name="setoptions"></a>
  - L737 `legacy-anchor-name`: <a name="virtualbackgroundeffectoptions"></a>
  - L16 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L266 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L373 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L788 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L927 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L1030 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he

### en/realtime-media/video/build/voice-activity-detection.mdx

- Statuses: `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: Link (4), PlatformStructured (2)
- Patterns:
  - `unapproved-jsx-component:Link`: 4
- Samples:
  - L98 `unapproved-jsx-component:Link`: Call the <Link to = "{{global.API_REF_WEB_ROOT}}/interfaces/iagorartc.html#registerextensions">`AgoraRTC.registerExtensions`</Link> method and pass the created `VADExtension` insta

### en/realtime-media/video/quickstart.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), FString (1), PlatformStructured (26)
- Patterns:
  - `inline-html:br`: 1
  - `native-html-table`: 16
  - `raw-html:li`: 36
  - `raw-html:ol`: 4
  - `raw-html:ul`: 14
  - `unapproved-jsx-component:FString`: 1
- Samples:
  - L4218 `native-html-table`: <tr>
  - L4219 `native-html-table`: <td>Key</td>
  - L4220 `native-html-table`: <td>Type</td>
  - L4221 `native-html-table`: <td>Value</td>
  - L4222 `native-html-table`: </tr>
  - L4223 `native-html-table`: <tr>
  - L4224 `native-html-table`: <td>Privacy - Microphone Usage Description</td>
  - L4225 `native-html-table`: <td>String</td>

### en/realtime-media/video/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/realtime-media/video/reference/migration-guide.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: PlatformStructured (6)
- Patterns:
  - `native-html-table`: 52
  - `raw-html:li`: 44
  - `raw-html:p`: 32
  - `raw-html:ul`: 12
- Samples:
  - L233 `native-html-table`: <thead>
  - L234 `native-html-table`: <tr>
  - L235 `native-html-table`: <th>API</th>
  - L236 `native-html-table`: <th>v3.x</th>
  - L237 `native-html-table`: <th>v4.x</th>
  - L238 `native-html-table`: </tr>
  - L239 `native-html-table`: </thead>
  - L240 `native-html-table`: <tr class="odd">

### en/realtime-media/voice/build/app-size-optimization.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 406
- Samples:
  - L279 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1413 |
  - L280 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1014 |
  - L281 `raw-html:li`: | Android | x86 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1403 |
  - L282 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1444 |
  - L388 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 945 |
  - L389 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 873 |
  - L390 `raw-html:li`: | Android | x86 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1125 |
  - L391 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1126 |

### en/realtime-media/voice/build/audio-mixing-and-sound-effects.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `inline-html:br`: 126
- Samples:
  - L52 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L53 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L54 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L349 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L350 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L351 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L516 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L517 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |

### en/realtime-media/voice/build/connection-status-management.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 406
  - `raw-html:ul`: 122
- Samples:
  - L93 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannel`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L96 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L107 `raw-html:li`: |**Disconnected** |<ul><li>`LEAVE_CHANNEL` (5): The user leaves the channel.</li><li>`INVALID_TOKEN` (8):The token is invalid. Please use a valid token to join the channel.</li></u
  - L110 `raw-html:li`: |**Reconnecting** |<ul><li>`INTERRUPTED` (2): When the network connection is interrupted, the SDK automatically reconnects to the channel and the connection state continues to chan
  - L111 `raw-html:li`: |**Failed** |<ul><li>`BANNED_BY_SERVER` (3): The user is banned by the server.</li><li>`JOIN_FAILED` (4): The SDK stopped trying to reconnect after continued failed attempts to joi
  - L187 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannelByToken`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L190 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L201 `raw-html:li`: |**Disconnected** |<ul><li>`LeaveChannel` (5): The user leaves the channel.</li><li>`InvalidToken` (8):The token is invalid. Please use a valid token to join the channel.</li></ul>

### en/realtime-media/voice/build/deploy-token-server.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 8
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 8
- Samples:
  - L203 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L204 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L205 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L209 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/realtime-media/voice/build/geofencing.mdx

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `native-html-table`: 240
- Samples:
  - L17 `native-html-table`: <thead>
  - L18 `native-html-table`: <tr>
  - L19 `native-html-table`: <th>Designated access zone</th>
  - L20 `native-html-table`: <th>User's location</th>
  - L21 `native-html-table`: <th>Zone actually accessed by the SDK</th>
  - L22 `native-html-table`: <th>User experience</th>
  - L23 `native-html-table`: </tr>
  - L24 `native-html-table`: </thead>

### en/realtime-media/voice/build/in-call-quality-monitoring.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (20)
- Patterns:
  - `inline-html:br`: 16
- Samples:
  - L596 `inline-html:br`: | 1001 | `FRAMERATE_INPUT_TOO_LOW` <br/> Video capture frame rate is too low | 3001 | `FRAMERATE_INPUT_TOO_LOW_RECOVER` <br/> Video capture frame rate returns to normal|
  - L597 `inline-html:br`: | 1002 | `FRAMERATE_SENT_TOO_LOW` <br/> Video sending bitrate is too low | 3002 | `FRAMERATE_SENT_TOO_LOW_RECOVER` <br/> Video sending frame rate returns to normal |
  - L598 `inline-html:br`: | 1003 | `SEND_VIDEO_BITRATE_TOO_LOW` <br/> Video sending bitrate is too low | 3003 | `SEND_VIDEO_BITRATE_TOO_LOW_RECOVER` <br/> Video sending bitrate returns to normal |
  - L599 `inline-html:br`: | 1005 | `RECV_VIDEO_DECODE_FAILED` <br/> Receiving video decoding failed | 3005 | `RECV_VIDEO_DECODE_FAILED_RECOVER` <br/> Receiving video decoding returns to normal |
  - L600 `inline-html:br`: | 2001 | `AUDIO_INPUT_LEVEL_TOO_LOW` <br/> Send volume too low | 4001 | `AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER` <br/> Send volume back to normal |
  - L601 `inline-html:br`: | 2002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW` <br/> Receive volume too low | 4002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER` <br/> Receiving volume returns to normal |
  - L602 `inline-html:br`: | 2003 | `SEND_AUDIO_BITRATE_TOO_LOW` <br/> Audio sending bitrate is too low | 4003 | `SEND_AUDIO_BITRATE_TOO_LOW_RECOVER` <br/> Audio sending bitrate returns to normal |
  - L603 `inline-html:br`: | 2005 | `RECV_AUDIO_DECODE_FAILED` <br/> Failed to decode received audio | 4005 | `RECV_AUDIO_DECODE_FAILED_RECOVER` <br/> Received audio decoding returns to normal |

### en/realtime-media/voice/build/pre-call-tests.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 242
  - `raw-html:ul`: 110
- Samples:
  - L238 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L239 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L240 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L241 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi
  - L406 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L407 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L408 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L409 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi

### en/realtime-media/voice/build/prevent-stream-bombing.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 16
  - `raw-html:ol`: 6
- Samples:
  - L56 `raw-html:li`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:li`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:li`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew
  - L56 `raw-html:ol`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:ol`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:ol`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew

### en/realtime-media/voice/build/receive-notifications.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 1494
  - `raw-html:ul`: 252
- Samples:
  - L631 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L712 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L713 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L736 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L737 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L739 `raw-html:li`: | `reason` | Number | The reason why the host leaves the channel:<ul><li>1: The host quits the call.</li><li>2: The connection between the app client and the Agora RTC server times
  - L765 `raw-html:li`: | `platform` | Number | The platform type of the audience member's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li
  - L766 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie

### en/realtime-media/voice/build/spatial-audio.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), PlatformStructured (14)
- Patterns:
  - `native-html-table`: 168
  - `raw-html:div`: 14
  - `raw-html:li`: 84
  - `raw-html:ul`: 28
- Samples:
  - L517 `native-html-table`: <tr>
  - L518 `native-html-table`: <td><strong>Audio Blurring</strong></td>
  - L519 `native-html-table`: <td>
  - L523 `native-html-table`: </td>
  - L524 `native-html-table`: </tr>
  - L525 `native-html-table`: <tr>
  - L526 `native-html-table`: <td><strong>Range Audio</strong></td>
  - L527 `native-html-table`: <td>

### en/realtime-media/voice/mcp.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:img`: 1
- Samples:
  - L21 `inline-html:img`: <img

### en/realtime-media/voice/quickstart.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), FString (1), PlatformStructured (26)
- Patterns:
  - `inline-html:br`: 1
  - `native-html-table`: 16
  - `raw-html:li`: 36
  - `raw-html:ol`: 4
  - `raw-html:ul`: 14
  - `unapproved-jsx-component:FString`: 1
- Samples:
  - L4218 `native-html-table`: <tr>
  - L4219 `native-html-table`: <td>Key</td>
  - L4220 `native-html-table`: <td>Type</td>
  - L4221 `native-html-table`: <td>Value</td>
  - L4222 `native-html-table`: </tr>
  - L4223 `native-html-table`: <tr>
  - L4224 `native-html-table`: <td>Privacy - Microphone Usage Description</td>
  - L4225 `native-html-table`: <td>String</td>

### en/realtime-media/voice/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/realtime-media/voice/reference/api-sunset.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: PlatformStructured (26)
- Patterns:
  - `md-with-mdx-jsx:PlatformStructured`: 26
- Samples:
  - L6 `md-with-mdx-jsx:PlatformStructured`: <PlatformStructured platform="android">

### en/realtime-media/voice/reference/error-codes.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: PlatformStructured (26)
- Patterns:
  - `md-with-mdx-jsx:PlatformStructured`: 26
- Samples:
  - L6 `md-with-mdx-jsx:PlatformStructured`: <PlatformStructured platform="web">

### en/realtime-media/voice/reference/migration-guide.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (20)
- Patterns:
  - `raw-html:li`: 98
  - `raw-html:ul`: 6
- Samples:
  - L156 `raw-html:li`: | <li>`setBeautyEffectOptions`</li><li>`setVideoDenoiserOptions`</li><li>`setLowlightEnhanceOptions`</li><li>`setColorEnhanceOptions`</li> | Video enhancement extension |
  - L158 `raw-html:li`: |<li> `setAudioEffectPreset`</li><li>`setVoiceBeautifierPreset`</li><li>`setVoiceConversionPreset`</li> | Voice beautifier extension |
  - L543 `raw-html:li`: | <ul><li>`setBeautyEffectOptions`</li><li>`setVideoDenoiserOptions`</li><li>`setLowlightEnhanceOptions`</li><li>`setColorEnhanceOptions`</li></ul> | Video enhancement extension |
  - L545 `raw-html:li`: | <ul><li>`setAudioEffectPreset`</li><li>`setVoiceBeautifierPreset`</li><li>`setVoiceConversionPreset`</li></ul> | Voice beautifier extension |
  - L1003 `raw-html:li`: | <ul><li>`setBeautyEffectOptions`</li><li>`setVideoDenoiserOptions`</li><li>`setLowlightEnhanceOptions`</li><li>`setColorEnhanceOptions`</li></ul> | Video enhancement extension |
  - L1005 `raw-html:li`: | <li>`setAudioEffectPreset`</li><li>`setVoiceBeautifierPreset`</li><li>`setVoiceConversionPreset`</li> | Voice beautifier extension |
  - L1637 `raw-html:li`: |<li>`setBeautyEffectOption`</li><li>`setVideoDenoiserOptions`</li><li>`setLowlightEnhanceOptions`</li><li>`setColorEnhanceOptions`</li> | Video enhancement extension |
  - L1639 `raw-html:li`: | <li>`setAudioEffectPreset`</li><li>`setVoiceBeautifierPreset`</li><li>`setVoiceConversionPreset`</li> | Voice beautifier extension |

### en/realtime-media/voice/reference/pricing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: RTCMinutesCalculator (1)
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:div`: 2
- Samples:
  - L207 `raw-html:div`: <div style={{ height: '20px' }}></div>
  - L59 `inline-html:br`: | **Advanced audio processing**<br/>(AGC, AEC and ANS) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | - |

### en/realtime-media/voice/reference/release-notes.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (24)
- Patterns:
  - `legacy-anchor-name`: 1
  - `raw-html:div`: 24
  - `raw-html:li`: 110
  - `raw-html:p`: 6
  - `raw-html:ul`: 38
- Samples:
  - L6355 `legacy-anchor-name`: <a name="bugfix"></a>
  - L6520 `raw-html:div`: <div class="alert info">To experience this feature, contact [support@agora.io](mailto:support@agora.io ).</div>
  - L6528 `raw-html:div`: <div class="alert info">This feature is in experimental status. To enable this feature, contact [support@agora.io](mailto:support@agora.io ). Contact [technical support](mailto:sup
  - L7341 `raw-html:div`: <div class="alert info">To enable this function, contact [support@agora.io](mailto:support@agora.io/).</div>
  - L7367 `raw-html:div`: <div class="alert info">To enable this feature, contact [support@agora.io](mailto:support@agora.io).</div>
  - L8584 `raw-html:div`: <div class="alert info">To enable this function, contact [support@agora.io](mailto:support@agora.io/).</div>
  - L8610 `raw-html:div`: <div class="alert info">To enable this feature, contact [support@agora.io](mailto:support@agora.io).</div>
  - L9675 `raw-html:div`: <div class="alert info">To enable this function, contact [support@agora.io](mailto:support@agora.io/).</div>

### en/realtime-media/voice/reference/service-limits.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: PlatformStructured (26)
- Patterns:
  - `md-with-mdx-jsx:PlatformStructured`: 26
- Samples:
  - L6 `md-with-mdx-jsx:PlatformStructured`: <PlatformStructured platform="android">

### en/realtime-media/voice/reference/supported-platforms.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
  - `raw-html:ul`: 2
- Samples:
  - L12 `raw-html:li`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|
  - L12 `raw-html:ul`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|

### en/realtime-media/whiteboard/build/authentication-workflow.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 6
- Samples:
  - L172 `inline-html:br`: | `invalid format of token` | The data format of the token is wrong. Please check:- Whether the data type is string.<br />- Whether there are extra spaces or characters before and

### en/realtime-media/whiteboard/build/file-conversion-overview.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 74
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L14 `raw-html:details`: <details>
  - L18 `raw-html:details`: </details>
  - L15 `raw-html:summary`: <summary>File conversion process</summary>
  - L147 `inline-html:br`: | Word | Font | - Font style: See the list of [Supported fonts](#supported-fonts)<br />- Font size: All<br />- Color and underline: All<br />- Effect: Supports strikethrough, doubl
  - L148 `inline-html:br`: | | Paragraph | - Bullet<br />- Serial number<br />- Text alignment: All<br />- Indentation<br />- Spacing<br />- Chinese version: All<br />- Multi-column layout<br /> | - |
  - L149 `inline-html:br`: | Shape | Shape Format | - Shape Fill: All<br />- Shape Outlines/Lines: All<br /> | - |
  - L150 `inline-html:br`: | Sheet | Table Design | - Table style options: All<br />- Table style:- Subject: All<br />- Shading<br />- Frame<br />- Fill: color fill, picture fill, texture fill, gradient fill
  - L152 `inline-html:br`: | Picture | Image Format | - Remove background<br />- Adjustments: All<br />- Image style:- Style templates<br />- Frame<br />- Format<br />- Effects: shadow, reflection, glow, sof

### en/realtime-media/whiteboard/build/generate-token-app-server.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (6), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (6)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 6
  - `md-with-mdx-jsx:CodeBlockTabs`: 2
  - `md-with-mdx-jsx:CodeBlockTabsList`: 2
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 6
- Samples:
  - L20 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="javascript">
  - L21 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L22 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="javascript">JavaScript</CodeBlockTabsTrigger>
  - L27 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="javascript">

### en/realtime-media/whiteboard/build/generate-token-rest.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 30
- Samples:
  - L25 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L34 `inline-html:br`: | `role` | string | Required | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md). |
  - L84 `inline-html:br`: | `token` | string | Required | The SDK Token, which can be obtained through one of the following methods:- Get a test-purpose SDK token from Agora Console. See [Get security crede
  - L85 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L100 `inline-html:br`: | `role` | string | Required | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md). |
  - L149 `inline-html:br`: | `token` | string | Required | The SDK Token, which can be obtained through one of the following methods:- Get a test-purpose SDK Token from Agora Console. See [Get security crede
  - L150 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L166 `inline-html:br`: | `role` | string | Required | The token role:- `admin`<br />- `writer`<br />- `reader`<br />See [Token Overview](authentication-workflow.md). |

### en/realtime-media/whiteboard/build/get-started-sdk.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (6)
- Patterns:
  - `legacy-anchor-id`: 1
  - `raw-html:details`: 6
  - `raw-html:summary`: 6
- Samples:
  - L10 `legacy-anchor-id`: <a id="join-the-interactive-whiteboard-room-from-your-app-client" />
  - L17 `raw-html:details`: <details>
  - L21 `raw-html:details`: </details>
  - L191 `raw-html:details`: <details>
  - L195 `raw-html:details`: </details>
  - L346 `raw-html:details`: <details>
  - L350 `raw-html:details`: </details>
  - L18 `raw-html:summary`: <summary>Interactive Whiteboard room joining workflow</summary>

### en/realtime-media/whiteboard/build/get-started-uikit.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (6)
- Patterns:
  - `legacy-anchor-id`: 1
  - `raw-html:details`: 6
  - `raw-html:summary`: 6
- Samples:
  - L10 `legacy-anchor-id`: <a id="join-the-whiteboard-room" />
  - L17 `raw-html:details`: <details>
  - L21 `raw-html:details`: </details>
  - L191 `raw-html:details`: <details>
  - L195 `raw-html:details`: </details>
  - L345 `raw-html:details`: <details>
  - L349 `raw-html:details`: </details>
  - L18 `raw-html:summary`: <summary>Interactive Whiteboard room joining workflow</summary>

### en/realtime-media/whiteboard/build/scenes/overview.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:details`: 2
  - `raw-html:summary`: 2
- Samples:
  - L20 `raw-html:details`: <details>
  - L24 `raw-html:details`: </details>
  - L21 `raw-html:summary`: <summary>Interactive Whiteboard scene structure example</summary>

### en/realtime-media/whiteboard/overview/pricing.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `inline-html:br`: 4
  - `native-html-table`: 106
  - `raw-html:div`: 2
  - `raw-html:span`: 44
- Samples:
  - L14 `native-html-table`: <table>
  - L15 `native-html-table`: <thead>
  - L16 `native-html-table`: <tr>
  - L17 `native-html-table`: <th>Whiteboard feature</th>
  - L18 `native-html-table`: <th>Volume</th>
  - L19 `native-html-table`: <th>Pricing per volume/month</th>
  - L20 `native-html-table`: <th>Pricing per PCW/month</th>
  - L21 `native-html-table`: </tr>

### en/realtime-media/whiteboard/overview/supported-platforms.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: PlatformStructured (6)
- Patterns:
  - `md-with-mdx-jsx:PlatformStructured`: 6
- Samples:
  - L6 `md-with-mdx-jsx:PlatformStructured`: <PlatformStructured platform="android">

### en/realtime-media/whiteboard/reference/file-conversion-overview-deprecated.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 2
- Samples:
  - L90 `inline-html:br`: - To get the above information about a third-party storage service, see the documentation provided by the vendor.<br />
  - L91 `inline-html:br`: - You should enable <b>public access</b> or higher permission for third-party storage spaces so that your app clients can access files saved in the space.<br />

### en/realtime-media/whiteboard/reference/firewall.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 8
- Samples:
  - L30 `inline-html:br`: | `api.netless.link` | https/443 | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br /> |
  - L31 `inline-html:br`: | `api.whiteboard.agora.io` | https/443 | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br /> |
  - L32 `inline-html:br`: | `api.whiteboard.sd-rtn.com` | https/443 | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br /> |
  - L33 `inline-html:br`: | `api.whiteboard.rtelink.com` | https/443 | - Get whiteboard configuration<br /> - Server-side RESTful requests, such as transcoding.<br /> |

### en/realtime-media/whiteboard/reference/rest-api/file-conversion-deprecated.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 54
- Samples:
  - L12 `inline-html:br`: - You have enabled <b>Docs to Picture</b> or <b>Docs to Web</b> and configured storage settings in [Agora Console](https://console.agora.io/v2). See [Enable whiteboard server-side
  - L30 `inline-html:br`: | `token` | string | Required | A SDK token with the `writer` or `admin` role. <br />To get a SDK Token, you can:- Get a test-purpose SDK token from Agora Console. See [Get securit
  - L31 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L40 `inline-html:br`: | `type` | string | Required | The conversion type:- `dynamic`: Dynamic-file conversion, converting the file to web pages.<br />- `static`: Static-file conversion, converting the f
  - L41 `inline-html:br`: | `preview` | boolean | Optional | Whether to generate a preview of the generated web pages:- `true`: Generate a preview.<br />- `false`: Do not generate a preview.<br />:::info
  - L47 `inline-html:br`: | `outputFormat` | string | Optional | The format of the generated image:- `png`<br />- `jpg` or `jpeg`<br />- `webp`<br />The default value is `png.` :::info
  - L50 `inline-html:br`: | `pack` | boolean | Optional | Whether to generate a resource package when performing a static document conversion task: - `true`: Generate a resource package. <br />When this par
  - L95 `inline-html:br`: | `type` | string | The conversion type:- `dynamic`: Dynamic-file conversion, converting the file to web pages.<br />- `static`: Static-file conversion, converting the file to imag

### en/realtime-media/whiteboard/reference/rest-api/file-conversion.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 70
- Samples:
  - L34 `inline-html:br`: | `token` | string | Required | A `writer` or `admin` SDK token. You can obtain a token using one of the following methods:- Get an SDK token for testing purposes from Agora Consol
  - L35 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L44 `inline-html:br`: | `type` | string | Required | The conversion type:- `dynamic`: Dynamic-file conversion, converting the file to web pages.<br />- `static`: Static-file conversion, converting the f
  - L45 `inline-html:br`: | `preview` | boolean | Optional | Whether to generate a preview of the generated files:- `true`: Generate a preview.<br />- `false`: Do not generate a preview.<br /> |
  - L47 `inline-html:br`: | `outputFormat` | string | Optional | The format of the generated image:- `png`<br />- `jpg`<br /> - `jpeg`<br />The default value is `png`. This parameter only takes effect when
  - L50 `inline-html:br`: | `imageCompressionLevel` | number | Optional | The compression level of the output image. You can only pass in the following values: - `0`: (Default) Output the original image.<br
  - L53 `inline-html:br`: | `buildSpa` | boolean | Optional | Specifies whether to build a Single-page Application (SPA) after conversion. - `true`: (Default) Builds an SPA file. The output is an HTML file
  - L94 `inline-html:br`: | `status` | string | The status of the file-conversion task:- `Waiting`: Conversion is `waiting` to start.<br />- `Converting`: Conversion is in progress.<br />- `Finished`: Conve

### en/realtime-media/whiteboard/reference/rest-api/room-management.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 50
- Samples:
  - L21 `inline-html:br`: | `token` | string | Required | The SDK token, which can be obtained through one of the following methods:- Get a test-purpose SDK token from Agora Console. See [Get security crede
  - L22 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L74 `inline-html:br`: | `isRecord` | boolean | Whether recording is enabled for the room:- `true`: Enabled.<br />- `false`: Not enabled.<br /> |
  - L75 `inline-html:br`: | `isBan` | boolean | Whether the room is disabled:- `true`: Disabled.<br />- `false`: Not disabled.<br /> |
  - L96 `inline-html:br`: | `token` | string | Required | A SDK token or room token with the `writer` or `admin` role. To get a SDK token, you can:- Get a test-purpose SDK token from Agora Console. See [Get
  - L97 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L146 `inline-html:br`: | `isRecord` | boolean | Whether recording is enabled for the room:- `true`: Enabled.<br />- `false`: Not enabled.<br /> |
  - L147 `inline-html:br`: | `isBan` | boolean | Whether the room is disabled:- `true`: Disabled.<br />- `false`: Not disabled.<br /> |

### en/realtime-media/whiteboard/reference/rest-api/scene-management.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 35
- Samples:
  - L21 `inline-html:br`: | `token` | string | Required | An SDK token or room token with the `writer` or `admin` role. To get an SDK token, you can:- Get a test-purpose SDK token from Agora Console. See [G
  - L22 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L86 `inline-html:br`: | `token` | string | Required | An SDK token or room token with the `writer` or `admin` role. To get an SDK Token, you can:- Get a test-purpose SDK token from Agora Console. See [G
  - L87 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L101 `inline-html:br`: | `scenes` | array | Required | An array of scenes, each containing the following parameters:- `name`: String. Sets the scene name. It cannot be the same as another scene in the sa
  - L169 `inline-html:br`: | `token` | string | Required | An SDK token or room token with the `admin` role. To get an SDK token, you can:- Get a test-purpose SDK token from Agora Console. See [Get security
  - L170 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `

### en/realtime-media/whiteboard/reference/rest-api/screenshots.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 20
- Samples:
  - L32 `inline-html:br`: | `token` | string | Required | An SDK token or room token with the `writer` or `admin` role. To get an SDK token, you can:- Get a test-purpose SDK token from Agora Console. See [G
  - L33 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `
  - L115 `inline-html:br`: | `token` | string | Required | An SDK token or room token with the `writer` or `admin` role. To get an SDK token, you can:- Get a test-purpose SDK token from Agora Console. See [G
  - L116 `inline-html:br`: | `region` | string | Required | Specifies a data center to process the request: - `us-sv`: Silicon Valley, US, which provides services to North America and South America.<br />- `

### en/solutions/agora-analytics/build/alarm.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `native-html-table`: 150
  - `raw-html:p`: 128
- Samples:
  - L42 `native-html-table`: <table>
  - L48 `native-html-table`: <thead>
  - L49 `native-html-table`: <tr>
  - L50 `native-html-table`: <th>Item</th>
  - L51 `native-html-table`: <th>Description</th>
  - L52 `native-html-table`: <th>Limitations</th>
  - L53 `native-html-table`: </tr>
  - L54 `native-html-table`: </thead>

### en/solutions/agora-analytics/build/call-search.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 30
  - `raw-html:ul`: 10
- Samples:
  - L60 `raw-html:li`: | Statistical insights | Important conclusions related to audio and video freezing. | <ul><li>If the number of [ACU](../reference/call-search-terms.md) for the current call is less
  - L75 `raw-html:li`: | Top video freezing users/Video freeze details | <ul><li>If the number of [ACU](../reference/call-search-terms.md) does not exceed 20 in the current call, this subsection is shown
  - L76 `raw-html:li`: | TOP audio freezing users/Audio freeze details | <ul><li>If the number of ACU does not exceed 20 in the current call, this subsection is shown as **Top audio freezing users**, ran
  - L77 `raw-html:li`: | Trend tracking | Relations between the following metrics and time:<ul><li>Audio freezing users: The number of users whose audio freeze rate is greater than 3%.</li><li>Video free
  - L60 `raw-html:ul`: | Statistical insights | Important conclusions related to audio and video freezing. | <ul><li>If the number of [ACU](../reference/call-search-terms.md) for the current call is less
  - L75 `raw-html:ul`: | Top video freezing users/Video freeze details | <ul><li>If the number of [ACU](../reference/call-search-terms.md) does not exceed 20 in the current call, this subsection is shown
  - L76 `raw-html:ul`: | TOP audio freezing users/Audio freeze details | <ul><li>If the number of ACU does not exceed 20 in the current call, this subsection is shown as **Top audio freezing users**, ran
  - L77 `raw-html:ul`: | Trend tracking | Relations between the following metrics and time:<ul><li>Audio freezing users: The number of users whose audio freeze rate is greater than 3%.</li><li>Video free

### en/solutions/agora-analytics/build/chat-data-insights.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
  - `raw-html:ul`: 4
- Samples:
  - L37 `raw-html:li`: | Historical Data | Line charts and bar charts showing how the metric values change in a certain time range. | <ul><li>The maximum time range to query is the past 30 days.</li><li>
  - L57 `raw-html:li`: | Message Count Trends | Line charts showing how the total numbers of messages change within a certain time range. For a detailed description of each metric, see [Chat glossary](ch
  - L37 `raw-html:ul`: | Historical Data | Line charts and bar charts showing how the metric values change in a certain time range. | <ul><li>The maximum time range to query is the past 30 days.</li><li>
  - L57 `raw-html:ul`: | Message Count Trends | Line charts showing how the total numbers of messages change within a certain time range. For a detailed description of each metric, see [Chat glossary](ch

### en/solutions/agora-analytics/build/data-insight-plus.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 9
- Samples:
  - L186 `inline-html:br`: | Number of calls | A call is counted from the time the first user joins the channel until the last user leaves the channel.<br/>Calls is the total number of calls that occurred du
  - L187 `inline-html:br`: | Concurrent calls | A call is counted from the time the first user joins the channel until the last user leaves the channel.<br/>Concurrent Calls is the number of simultaneous cal
  - L188 `inline-html:br`: | Number of calling users (according to user ID + channel name)| Each user ID + channel name is counted as one user, and the same user repeatedly joining the same channel is counte
  - L189 `inline-html:br`: | Concurrent users | Each user ID + channel name is counted as one user.<br/>The number of concurrent users is the number of users who are online at the same time during the select
  - L191 `inline-html:br`: | 500ms video freeze rate | If the frame-free time exceeds 500 ms after the remote video is decoded, it is recorded as a video freeze.<br/>Video Freezing Rate = Video Freezing Dura
  - L192 `inline-html:br`: | 200ms audio freeze rate | If the frame-free time exceeds 200 ms after receiving the remote audio decoding, it is recorded as an audio freeze.<br/>Audio freeze rate = audio freeze
  - L200 `inline-html:br`: | Number of calling users (by user ID) | Each user ID is counted as one user.<br/>The number of users is the total number of users who made calls during the selected time range. |
  - L204 `inline-html:br`: | Active calls | Each time a user enters and exits a channel is counted as one active call, and the same user repeatedly joins the same channel as multiple active calls.<br/>Active

### en/solutions/agora-analytics/build/data-insight.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 2
- Samples:
  - L34 `raw-html:div`: <div class="alert warning">**Disclaimer**: The usage data provided in the Usage Overview page is for reference only and is not used for billing calculation.</div>

### en/solutions/agora-analytics/build/embedded.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 14
  - `raw-html:ul`: 8
- Samples:
  - L72 `raw-html:li`: | **Language** | The language of the report. | `locale` | <ul><li>`zh`: Chinese</li><li>`en`: English</li></ul> |
  - L73 `raw-html:li`: | **Time Zone** | The timezone used in the report. | `timezone` | <ul><li>`Local`: The local timezone</li><li>`UTC`: The UTC timezone</li></ul> |
  - L74 `raw-html:li`: | **Project Permission** | **All projects**: Users can access reports of all projects where the specified `feature` is enabled.<br/>**Specify a project by code**: Users can only ac
  - L75 `raw-html:li`: | **Default Project** | The default project displayed in the report. | *(Optional)* `projectId` | <ul><li>The ID of the project. Set this parameter only when `showProjectSelector`
  - L72 `raw-html:ul`: | **Language** | The language of the report. | `locale` | <ul><li>`zh`: Chinese</li><li>`en`: English</li></ul> |
  - L73 `raw-html:ul`: | **Time Zone** | The timezone used in the report. | `timezone` | <ul><li>`Local`: The local timezone</li><li>`UTC`: The UTC timezone</li></ul> |
  - L74 `raw-html:ul`: | **Project Permission** | **All projects**: Users can access reports of all projects where the specified `feature` is enabled.<br/>**Specify a project by code**: Users can only ac
  - L75 `raw-html:ul`: | **Default Project** | The default project displayed in the report. | *(Optional)* `projectId` | <ul><li>The ID of the project. Set this parameter only when `showProjectSelector`

### en/solutions/agora-analytics/product-overview.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CardGrid (2), FeatureCard (12)
- Patterns:
  - `md-with-mdx-jsx:CardGrid`: 2
  - `md-with-mdx-jsx:FeatureCard`: 12
- Samples:
  - L17 `md-with-mdx-jsx:CardGrid`: <CardGrid>
  - L18 `md-with-mdx-jsx:FeatureCard`: <FeatureCard title="Call Inspector">

### en/solutions/agora-analytics/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/solutions/agora-analytics/reference/call-search-terms.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `native-html-table`: 130
  - `raw-html:p`: 70
- Samples:
  - L84 `native-html-table`: <table>
  - L90 `native-html-table`: <thead>
  - L91 `native-html-table`: <tr>
  - L92 `native-html-table`: <th>Sender-side metric</th>
  - L93 `native-html-table`: <th>Receiver-side metric</th>
  - L94 `native-html-table`: <th>Description</th>
  - L95 `native-html-table`: </tr>
  - L96 `native-html-table`: </thead>

### en/solutions/agora-analytics/reference/core-concepts.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L101 `legacy-anchor-name`: <a name="agora-sd-rtn"></a>

### en/solutions/agora-analytics/reference/pricing.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `native-html-table`: 152
  - `raw-html:p`: 112
- Samples:
  - L31 `native-html-table`: <table>
  - L40 `native-html-table`: <thead>
  - L41 `native-html-table`: <tr>
  - L42 `native-html-table`: <th>Module</th>
  - L43 `native-html-table`: <th>Feature</th>
  - L44 `native-html-table`: <th style={{ textAlign: 'center' }}>Starter</th>
  - L45 `native-html-table`: <th style={{ textAlign: 'center' }}>Standard</th>
  - L46 `native-html-table`: <th style={{ textAlign: 'center' }}>Premium</th>

### en/solutions/agora-analytics/reference/supported-platforms.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 14
  - `raw-html:ul`: 4
- Samples:
  - L22 `raw-html:li`: |macOS|<ul><li>Chrome</li><li>Firefox</li><li>Safari</li><li>Edge</li></ul>|Supported |Supported|
  - L23 `raw-html:li`: |Windows|<ul><li>Chrome</li><li>Firefox</li><li>Edge</li></ul>|Supported |Supported|
  - L22 `raw-html:ul`: |macOS|<ul><li>Chrome</li><li>Firefox</li><li>Safari</li><li>Edge</li></ul>|Supported |Supported|
  - L23 `raw-html:ul`: |Windows|<ul><li>Chrome</li><li>Firefox</li><li>Edge</li></ul>|Supported |Supported|

### en/solutions/flexible-classroom/build/customize-classroom.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: AgoraDemo (1)
- Patterns:
  - `raw-html:div`: 2
- Samples:
  - L159 `raw-html:div`: <div className="agora-demo">AgoraDemo</div>

### en/solutions/flexible-classroom/product-overview.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CardGrid (2), FeatureCard (12)
- Patterns:
  - `md-with-mdx-jsx:CardGrid`: 2
  - `md-with-mdx-jsx:FeatureCard`: 12
- Samples:
  - L20 `md-with-mdx-jsx:CardGrid`: <CardGrid>
  - L21 `md-with-mdx-jsx:FeatureCard`: <FeatureCard title="Scalable">

### en/solutions/flexible-classroom/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/solutions/flexible-classroom/reference/classroom-rest-api.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: String (3)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 250
  - `unapproved-jsx-component:String`: 3
- Samples:
  - L43 `raw-html:li`: | `region` | String | (Required) The region for connection. Flexible Classroom supports the following regions:<ul><li>`cn`: Mainland China.</li><li>`ap`: Asia Pacific.</li><li>`eu`
  - L45 `raw-html:li`: | `roomUuid` | String | (Required) The classroom ID. This is the globally unique identifier of a classroom. It is also used as the channel name when a user joins an RTC or RTM chan
  - L53 `raw-html:li`: | `roomType` | String | (Required) The type of the classroom. You can set the value to : <ul><li>`0`: One-to-one classroom.</li><li>`2`: Lecture hall. </li><li>`4`: Small classroom
  - L67 `raw-html:li`: | `roomProperties.widgets.netlessBoard.state` | Integer | (Optional) The state of the whiteboard widget in the classroom: <li>`0`: Disabled.</li><li>`1`: Enabled.</li> |
  - L69 `raw-html:li`: | `roomProperties.widgets.easemobIM.state` | Integer | (Optional) The state of the chat widget in the classroom: <li>`0`: Disabled.</li><li>`1`: Enabled.</li> |
  - L74 `raw-html:li`: | `roleConfig.2.defaultStream.state` | Integer | (Optional) The state of the default stream type of the student: <li>`0`: Disabled.</li><li>`1`: Enabled.</li> |
  - L75 `raw-html:li`: | `roleConfig.2.defaultStream.videoState` | Integer | (Optional) The video state of the default stream of the student: <li>`0`: Disabled.</li><li>`1`: Enabled.</li> |
  - L76 `raw-html:li`: | `roleConfig.2.defaultStream.audioState` | Integer | (Optional) The audio state of the default stream of the student: <li>`0`: Disabled.</li><li>`1`: Enabled.</li> |

### en/solutions/interactive-live-streaming/build/ai-noise-suppression.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (10)
- Patterns:
  - `legacy-anchor-name`: 5
- Samples:
  - L9 `legacy-anchor-name`: <a name="type"></a>
  - L87 `legacy-anchor-name`: <a name="type"></a>
  - L159 `legacy-anchor-name`: <a name="type"></a>
  - L640 `legacy-anchor-name`: <a name="type"></a>
  - L699 `legacy-anchor-name`: <a name="type"></a>

### en/solutions/interactive-live-streaming/build/app-size-optimization.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 852
  - `raw-html:ul`: 406
- Samples:
  - L290 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1413 |
  - L291 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1014 |
  - L292 `raw-html:li`: | Android | x86 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1403 |
  - L293 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_drm_loader_extension.so`</li><li>`libagora_udrm3_extension.so`</li></ul> | 1444 |
  - L399 `raw-html:li`: | Android | arm64-v8a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 945 |
  - L400 `raw-html:li`: | Android | armeabi-v7a | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 873 |
  - L401 `raw-html:li`: | Android | x86 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1125 |
  - L402 `raw-html:li`: | Android | x86_64 | <ul><li>`libagora_video_encoder_extension.so`</li><li>`video_enc.so`</li></ul> | 1126 |

### en/solutions/interactive-live-streaming/build/audio-mixing-and-sound-effects.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `inline-html:br`: 126
- Samples:
  - L52 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L53 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L54 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L349 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L350 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |
  - L351 `inline-html:br`: | Get and adjust playback position and volume | `setEffectPosition`<br/> `getEffectCurrentPosition`<br/> `getEffectsVolume`<br/> `setEffectsVolume`<br/> `setVolumeOfEffect` | `getA
  - L516 `inline-html:br`: | Play or stop playing a specific audio file | `preloadEffect`<br/> `unloadEffect`<br/> `playEffect`<br/> `stopEffect`<br/> `stopAllEffects` | `startAudioMixing`<br/> `stopAudioMix
  - L517 `inline-html:br`: | Pause or resume playing an audio file | `pauseEffect`<br/> `pauseAllEffects`<br/> `resumeEffect`<br/> `resumeAllEffects` | `pauseAudioMixing`<br/> `resumeAudioMixing` |

### en/solutions/interactive-live-streaming/build/camera-movement.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (12), CodeBlockTabs (6), CodeBlockTabsList (6), CodeBlockTabsTrigger (12), PlatformStructured (4)
- Patterns:
  - `inline-html:img`: 2
  - `raw-html:li`: 8
  - `raw-html:ul`: 4
- Samples:
  - L44 `raw-html:li`: > <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L183 `raw-html:li`: > <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L44 `raw-html:ul`: > <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L183 `raw-html:ul`: > <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L31 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695546999-camera_portrait_6s.gif" width="200"/>
  - L34 `inline-html:img`: <img src="https://web-cdn.agora.io/doc-cms/uploads/1706695552716-camera_lock_3s.gif" width="200"/>

### en/solutions/interactive-live-streaming/build/connection-status-management.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 406
  - `raw-html:ul`: 122
- Samples:
  - L93 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannel`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L96 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L107 `raw-html:li`: |**Disconnected** |<ul><li>`LEAVE_CHANNEL` (5): The user leaves the channel.</li><li>`INVALID_TOKEN` (8):The token is invalid. Please use a valid token to join the channel.</li></u
  - L110 `raw-html:li`: |**Reconnecting** |<ul><li>`INTERRUPTED` (2): When the network connection is interrupted, the SDK automatically reconnects to the channel and the connection state continues to chan
  - L111 `raw-html:li`: |**Failed** |<ul><li>`BANNED_BY_SERVER` (3): The user is banned by the server.</li><li>`JOIN_FAILED` (4): The SDK stopped trying to reconnect after continued failed attempts to joi
  - L187 `raw-html:li`: |**Disconnected** |Initial connection state. Usually occurs: <ul><li>Before calling `joinChannelByToken`.</li><li>After calling `leaveChannel`.</li></ul> |
  - L190 `raw-html:li`: |**Reconnecting** |Occurs when the connection is interrupted. The SDK automatically tries to reconnect after an interruption. <ul><li>If the client successfully rejoins the channel
  - L201 `raw-html:li`: |**Disconnected** |<ul><li>`LeaveChannel` (5): The user leaves the channel.</li><li>`InvalidToken` (8):The token is invalid. Please use a valid token to join the channel.</li></ul>

### en/solutions/interactive-live-streaming/build/deploy-token-server.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8)
- Patterns:
  - `md-with-mdx-jsx:CodeBlockTab`: 8
  - `md-with-mdx-jsx:CodeBlockTabs`: 4
  - `md-with-mdx-jsx:CodeBlockTabsList`: 4
  - `md-with-mdx-jsx:CodeBlockTabsTrigger`: 8
- Samples:
  - L203 `md-with-mdx-jsx:CodeBlockTabs`: <CodeBlockTabs defaultValue="java">
  - L204 `md-with-mdx-jsx:CodeBlockTabsList`: <CodeBlockTabsList>
  - L205 `md-with-mdx-jsx:CodeBlockTabsTrigger`: <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
  - L209 `md-with-mdx-jsx:CodeBlockTab`: <CodeBlockTab value="java">

### en/solutions/interactive-live-streaming/build/geofencing.mdx

- Statuses: `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (16)
- Patterns:
  - `native-html-table`: 240
- Samples:
  - L17 `native-html-table`: <thead>
  - L18 `native-html-table`: <tr>
  - L19 `native-html-table`: <th>Designated access zone</th>
  - L20 `native-html-table`: <th>User's location</th>
  - L21 `native-html-table`: <th>Zone actually accessed by the SDK</th>
  - L22 `native-html-table`: <th>User experience</th>
  - L23 `native-html-table`: </tr>
  - L24 `native-html-table`: </thead>

### en/solutions/interactive-live-streaming/build/in-call-quality-monitoring.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (20)
- Patterns:
  - `inline-html:br`: 16
- Samples:
  - L596 `inline-html:br`: | 1001 | `FRAMERATE_INPUT_TOO_LOW` <br/> Video capture frame rate is too low | 3001 | `FRAMERATE_INPUT_TOO_LOW_RECOVER` <br/> Video capture frame rate returns to normal|
  - L597 `inline-html:br`: | 1002 | `FRAMERATE_SENT_TOO_LOW` <br/> Video sending bitrate is too low | 3002 | `FRAMERATE_SENT_TOO_LOW_RECOVER` <br/> Video sending frame rate returns to normal |
  - L598 `inline-html:br`: | 1003 | `SEND_VIDEO_BITRATE_TOO_LOW` <br/> Video sending bitrate is too low | 3003 | `SEND_VIDEO_BITRATE_TOO_LOW_RECOVER` <br/> Video sending bitrate returns to normal |
  - L599 `inline-html:br`: | 1005 | `RECV_VIDEO_DECODE_FAILED` <br/> Receiving video decoding failed | 3005 | `RECV_VIDEO_DECODE_FAILED_RECOVER` <br/> Receiving video decoding returns to normal |
  - L600 `inline-html:br`: | 2001 | `AUDIO_INPUT_LEVEL_TOO_LOW` <br/> Send volume too low | 4001 | `AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER` <br/> Send volume back to normal |
  - L601 `inline-html:br`: | 2002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW` <br/> Receive volume too low | 4002 | `AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER` <br/> Receiving volume returns to normal |
  - L602 `inline-html:br`: | 2003 | `SEND_AUDIO_BITRATE_TOO_LOW` <br/> Audio sending bitrate is too low | 4003 | `SEND_AUDIO_BITRATE_TOO_LOW_RECOVER` <br/> Audio sending bitrate returns to normal |
  - L603 `inline-html:br`: | 2005 | `RECV_AUDIO_DECODE_FAILED` <br/> Failed to decode received audio | 4005 | `RECV_AUDIO_DECODE_FAILED_RECOVER` <br/> Received audio decoding returns to normal |

### en/solutions/interactive-live-streaming/build/metakit.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (96), CodeBlockTabs (48), CodeBlockTabsList (48), CodeBlockTabsTrigger (96), PlatformStructured (4)
- Patterns:
  - `inline-html:br`: 23
  - `inline-html:img`: 9
  - `raw-html:li`: 18
  - `raw-html:ul`: 8
  - `raw-html:video`: 20
- Samples:
  - L56 `raw-html:li`: > <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L2305 `raw-html:li`: > <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L2354 `raw-html:li`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:li`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir
  - L56 `raw-html:ul`: > <ul><li>When integrating through Maven Central, specify `io.agora.rtc:full-sdk:x.y.z` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L2305 `raw-html:ul`: > <ul><li>When integrating through CocoaPods, specify pod `AgoraRtcEngine_Special_iOS` and replace `x.y.z` with the specific SDK version number.</li><li>The MetaKit extension uses
  - L2354 `raw-html:ul`: | `Avatar` | Function-specific | Virtual human model resources, including the virtual human figures `girl` and `huamulan`. Supports face capture, face pinching, and dress-up capabi
  - L2355 `raw-html:ul`: | `Animoji` | Function-specific | Animoji model resources, including the Animoji figures `dog`, `girlhead`, and `arkit`. Supports face capture. | <ul><li>`dog`: 1.5 MB</li><li>`gir

### en/solutions/interactive-live-streaming/build/pre-call-tests.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (8), CodeBlockTabs (4), CodeBlockTabsList (4), CodeBlockTabsTrigger (8), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 242
  - `raw-html:ul`: 110
- Samples:
  - L238 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L239 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L240 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L241 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi
  - L406 `raw-html:li`: | Can't hear sound when testing audio devices. | <ul><li>Check that the recording device and the playback device are working properly, and are not occupied by other programs.</li><
  - L407 `raw-html:li`: | Cannot see the screen when testing video devices. | <ul><li>Check that the video device is working properly and not occupied by other programs.</li><li>Check whether the network
  - L408 `raw-html:li`: | Poor uplink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the bitrate of the
  - L409 `raw-html:li`: | Poor downlink network quality detected (packet loss > 5%; network jitter > 100ms) | <ul><li>Check that the local network is working properly.</li><li>Ensure that the total bandwi

### en/solutions/interactive-live-streaming/build/prevent-stream-bombing.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 16
  - `raw-html:ol`: 6
- Samples:
  - L56 `raw-html:li`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:li`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:li`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew
  - L56 `raw-html:ol`: | Host joins the channel to send streams | <ol><li>Request a token with the `role` set to `kRolePublisher`. This token gives the host permission to send streams. </li><li>Call `set
  - L57 `raw-html:ol`: | Audience members join the channel | <ol><li>Request a token with the `role` set to `kRoleSubscriber`. This token does not permit the user to send streams</li><li>Since a user's r
  - L58 `raw-html:ol`: | Audience gets the mic after joining the channel | <ol><li>Request a token with the `role` set to `kRolePublisher` to give the user permission to send streams.</li><li>Call `renew

### en/solutions/interactive-live-streaming/build/receive-notifications.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: PlatformStructured (18)
- Patterns:
  - `raw-html:li`: 1494
  - `raw-html:ul`: 252
  - `raw-html:video`: 18
- Samples:
  - L632 `raw-html:li`: | `productId` | Number | The product ID: <ul><li> `1`: Realtime Communication (RTC) service</li><li>`3`: Cloud Recording</li><li>`4`: Media Pull</li><li>`5`: Media Push</li></ul> |
  - L713 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L714 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L737 `raw-html:li`: | `platform` | Number | The platform type of the host's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li><li>0: Oth
  - L738 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie
  - L740 `raw-html:li`: | `reason` | Number | The reason why the host leaves the channel:<ul><li>1: The host quits the call.</li><li>2: The connection between the app client and the Agora RTC server times
  - L766 `raw-html:li`: | `platform` | Number | The platform type of the audience member's device: <ul><li>1: Android</li><li>2: iOS</li><li>5: Windows</li><li>6: Linux</li><li>7: Web</li><li>8: macOS</li
  - L767 `raw-html:li`: | `clientType` | Number | The type of services used by the host on Linux. Common return values include:<ul><li>3: On-premise Recording</li><li>10: Cloud Recording</li></ul>This fie

### en/solutions/interactive-live-streaming/build/screen-sharing.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`
- Severity: medium
- Effort: medium
- Components: AgoraReplayKitExtDelegate (2), CodeBlockTab (48), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (48), NSString (3), PlatformStructured (22)
- Patterns:
  - `raw-html:li`: 4
  - `raw-html:ul`: 2
  - `unapproved-jsx-component:AgoraReplayKitExtDelegate`: 2
  - `unapproved-jsx-component:NSString`: 3
- Samples:
  - L2369 `raw-html:li`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L2369 `raw-html:ul`: <ul><li>Make sure your app and extension have the same **TARGETS/Deployment/iOS** version. The memory usage of **Broadcast Upload Extension** is limited to 50 MB. </li><li>Make sur
  - L1697 `unapproved-jsx-component:NSString`: - (void)broadcastStartedWithSetupInfo:(NSDictionary<NSString *,NSObject *> *)setupInfo {
  - L2042 `unapproved-jsx-component:AgoraReplayKitExtDelegate`: @interface SampleHandler ()<AgoraReplayKitExtDelegate>

### en/solutions/interactive-live-streaming/build/screenshot-upload.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (4), CodeBlockTabs (2), CodeBlockTabsList (2), CodeBlockTabsTrigger (4), PlatformStructured (14)
- Patterns:
  - `raw-html:li`: 98
  - `raw-html:p`: 14
  - `raw-html:ul`: 14
- Samples:
  - L165 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L225 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L403 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L463 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L641 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L701 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|
  - L885 `raw-html:li`: | `object` | String | Name of the screenshot file. The naming convention for this file is: `<OSS prefix>/<year month day>/<sid>_<cname>__uid_s_<uid>__uid_e_<type>_utc.jpg`. The mea
  - L945 `raw-html:li`: | QPS Overage Fee | $1.5 per QPS | Includes 500 QPS per month: <li> ≤ 500 QPS: No charge </li> <li> > 500 QPS: Charged based on monthly peak QPS </li>|

### en/solutions/interactive-live-streaming/build/spatial-audio.mdx

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (44), CodeBlockTabs (22), CodeBlockTabsList (22), CodeBlockTabsTrigger (44), PlatformStructured (14)
- Patterns:
  - `native-html-table`: 168
  - `raw-html:div`: 14
  - `raw-html:li`: 84
  - `raw-html:ul`: 28
- Samples:
  - L517 `native-html-table`: <tr>
  - L518 `native-html-table`: <td><strong>Audio Blurring</strong></td>
  - L519 `native-html-table`: <td>
  - L523 `native-html-table`: </td>
  - L524 `native-html-table`: </tr>
  - L525 `native-html-table`: <tr>
  - L526 `native-html-table`: <td><strong>Range Audio</strong></td>
  - L527 `native-html-table`: <td>

### en/solutions/interactive-live-streaming/build/virtual-background.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Components: CodeBlockTab (20), CodeBlockTabs (10), CodeBlockTabsList (10), CodeBlockTabsTrigger (20), PlatformStructured (16)
- Patterns:
  - `legacy-anchor-name`: 2
  - `raw-html:video`: 16
- Samples:
  - L683 `legacy-anchor-name`: <a name="setoptions"></a>
  - L737 `legacy-anchor-name`: <a name="virtualbackgroundeffectoptions"></a>
  - L16 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L266 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L373 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L788 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L927 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he
  - L1030 `raw-html:video`: | Video/Animated background | <video src="/images/extensions-marketplace/virtual-background.mp4" poster="https://web-cdn.agora.io/docs-files/1654571689670" controls width="100%" he

### en/solutions/interactive-live-streaming/product-overview.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CardGrid (2), FeatureCard (12)
- Patterns:
  - `md-with-mdx-jsx:CardGrid`: 2
  - `md-with-mdx-jsx:FeatureCard`: 12
- Samples:
  - L19 `md-with-mdx-jsx:CardGrid`: <CardGrid>
  - L20 `md-with-mdx-jsx:FeatureCard`: <FeatureCard title="Global coverage">

### en/solutions/interactive-live-streaming/quickstart.mdx

- Statuses: `manual-html-review`, `needs-jsx-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: CodeBlockTab (56), CodeBlockTabs (28), CodeBlockTabsList (28), CodeBlockTabsTrigger (56), FString (1), PlatformStructured (26)
- Patterns:
  - `inline-html:br`: 1
  - `native-html-table`: 24
  - `raw-html:iframe`: 2
  - `raw-html:li`: 36
  - `raw-html:ol`: 4
  - `raw-html:p`: 1
  - `raw-html:ul`: 14
  - `unapproved-jsx-component:FString`: 1
- Samples:
  - L5325 `native-html-table`: <tr>
  - L5326 `native-html-table`: <td>Key</td>
  - L5327 `native-html-table`: <td>Type</td>
  - L5328 `native-html-table`: <td>Value</td>
  - L5329 `native-html-table`: </tr>
  - L5330 `native-html-table`: <tr>
  - L5331 `native-html-table`: <td>Privacy - Microphone Usage Description</td>
  - L5332 `native-html-table`: <td>String</td>

### en/solutions/interactive-live-streaming/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/solutions/interactive-live-streaming/reference/migration-guide.md

- Statuses: `manual-html-review`, `needs-mdx-extension`, `needs-table-normalization`
- Severity: high
- Effort: high
- Components: PlatformStructured (6)
- Patterns:
  - `md-with-mdx-jsx:PlatformStructured`: 6
  - `native-html-table`: 52
  - `raw-html:li`: 44
  - `raw-html:p`: 32
  - `raw-html:ul`: 12
- Samples:
  - L229 `native-html-table`: <thead>
  - L230 `native-html-table`: <tr>
  - L231 `native-html-table`: <th>API</th>
  - L232 `native-html-table`: <th>v3.x</th>
  - L233 `native-html-table`: <th>v4.x</th>
  - L234 `native-html-table`: </tr>
  - L235 `native-html-table`: </thead>
  - L236 `native-html-table`: <tr class="odd">

### en/solutions/interactive-live-streaming/reference/pricing-legacy.md

- Statuses: `manual-html-review`, `needs-table-normalization`
- Severity: high
- Effort: high
- Patterns:
  - `inline-html:br`: 4
  - `native-html-table`: 44
  - `raw-html:p`: 4
  - `raw-html:span`: 8
- Samples:
  - L168 `native-html-table`: <tr>
  - L169 `native-html-table`: <th>Billed service (video type)</th>
  - L170 `native-html-table`: <th>Total usage (minutes) = Sum of all individual usage</th>
  - L171 `native-html-table`: <th>Unit price (US$<span>/1,000 minutes)</span></th>
  - L172 `native-html-table`: <th colspan="1">Cost of each service (US$)</th>
  - L173 `native-html-table`: <th colspan="1">Total cost (US$)(rounded to two decimal places)</th>
  - L174 `native-html-table`: </tr>
  - L175 `native-html-table`: <tr>

### en/solutions/interactive-live-streaming/reference/pricing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: RTCMinutesCalculator (1)
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:div`: 2
- Samples:
  - L207 `raw-html:div`: <div style={{ height: '20px' }}></div>
  - L59 `inline-html:br`: | **Advanced audio processing**<br/>(AGC, AEC and ANS) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | - |

### en/solutions/interactive-live-streaming/reference/release-notes.md

- Statuses: `manual-html-review`, `needs-anchor-normalization`, `needs-mdx-extension`
- Severity: high
- Effort: medium
- Components: PlatformStructured (6)
- Patterns:
  - `inline-html:br`: 1
  - `legacy-anchor-name`: 3
  - `md-with-mdx-jsx:PlatformStructured`: 6
  - `raw-html:div`: 14
  - `raw-html:li`: 70
  - `raw-html:p`: 6
  - `raw-html:ul`: 12
- Samples:
  - L4000 `legacy-anchor-name`: <a name="chrome"></a>
  - L4022 `legacy-anchor-name`: <a name="safari"></a>
  - L4045 `legacy-anchor-name`: <a name="firefox"></a>
  - L2779 `raw-html:div`: <div class="alert info">All 4.x SDKs support using wildcard tokens.</div>
  - L2795 `raw-html:div`: <div class="alert info"> The video source type specified in this method must match the video source type set in the `AgoraRtcVideoCanvas` of the `setupLocalVideo` method.</div>
  - L3246 `raw-html:div`: <div class="alert info"><li>The UHD resolution (4K, 60 fps) is currently in beta and requires certain device performance and network bandwidth. If you want to experience this featu
  - L3248 `raw-html:div`: <li>The increase in the default resolution affects the aggregate resolution and thus the billing rate. See <a href="./billing_rtc_ng">Pricing</a>.</li></div>
  - L3260 `raw-html:div`: <div class="alert info">All 4.x SDKs support using wildcard tokens.</div>

### en/solutions/interactive-live-streaming/reference/supported-platforms.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
  - `raw-html:ul`: 2
- Samples:
  - L12 `raw-html:li`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|
  - L12 `raw-html:ul`: | Android | Android 4.1 or later. Video SDK supports the following ABIs. <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later|

### en/solutions/iot/build/manage-agora-account.md

- Statuses: `needs-frontmatter-cleanup`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-frontmatter:sidebar_position`: 1
- Samples:
  - L4 `legacy-frontmatter:sidebar_position`: sidebar_position: 2

### en/solutions/iot/product-overview.md

- Statuses: `needs-mdx-extension`
- Severity: high
- Effort: low
- Components: CardGrid (2), FeatureCard (12)
- Patterns:
  - `md-with-mdx-jsx:CardGrid`: 2
  - `md-with-mdx-jsx:FeatureCard`: 12
- Samples:
  - L21 `md-with-mdx-jsx:CardGrid`: <CardGrid>
  - L22 `md-with-mdx-jsx:FeatureCard`: <FeatureCard title="Highly integrated">

### en/solutions/iot/reference/agora-console-rest-api.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 234
  - `raw-html:ul`: 68
- Samples:
  - L49 `raw-html:li`: |`enable_sign_key` |Boolean|(Required) Whether to enable the primary app certificate: <ul><li>true: Enable the primary app certificate.</li><li>false: (Default) Do not enable the p
  - L72 `raw-html:li`: |`project`|Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID </li><li>`name`: String. The project name.</li><li>`vendor_key
  - L130 `raw-html:li`: |`projects` |Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields: <ul
  - L178 `raw-html:li`: |`projects`|Array|The information on the projects. This Array consists of multiple Objects. Each Object shows the information on one project and includes the following fields:<ul><
  - L228 `raw-html:li`: |`status`|Number|(Required) Whether to enable or disable the project:<ul><li>`0`: Disable the project. </li><li>`1`: Enable the project.</li></ul>|
  - L251 `raw-html:li`: |`project` |Object|The information on the project, including the following fields: <ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_k
  - L313 `raw-html:li`: |`project` |Object|The information on the project, including the following fields:<ul><li>`id`: String. The project ID.</li><li>`name`: String. The project name.</li><li>`vendor_ke
  - L352 `raw-html:li`: |`enable` |Boolean|(Required) Whether to enable or disable the primary app certificate for the project:<ul><li>true: (Default) Enable the primary app certificate. </li><li> false:

### en/solutions/iot/reference/communicate-with-rtc-sdk.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
  - `raw-html:li`: 26
  - `raw-html:ul`: 8
- Samples:
  - L11 `raw-html:li`: | Native/third-party frameworks: <ul> <li>Android</li><li>iOS/macOS</li><li>Windows</li><li>Electron</li><li>Unity</li><li>Flutter</li><li>React Native</li></ul> | <ul><li>Audio: G
  - L12 `raw-html:li`: | Web (v4.x) | <ul><li>Audio: G722, G711, Opus</li><li>Video: H.264</li></ul> |
  - L13 `raw-html:li`: | Embedded systems | <ul><li>Audio: G711, Opus</li><li>Video: H.264, JPEG</li></ul> |
  - L11 `raw-html:ul`: | Native/third-party frameworks: <ul> <li>Android</li><li>iOS/macOS</li><li>Windows</li><li>Electron</li><li>Unity</li><li>Flutter</li><li>React Native</li></ul> | <ul><li>Audio: G
  - L12 `raw-html:ul`: | Web (v4.x) | <ul><li>Audio: G722, G711, Opus</li><li>Video: H.264</li></ul> |
  - L13 `raw-html:ul`: | Embedded systems | <ul><li>Audio: G711, Opus</li><li>Video: H.264, JPEG</li></ul> |
  - L61 `inline-html:br`: | Windows | `agora::base::AParameter apm(agoraEngine);`<br/>`apm->setParameters("{\"engine.video.codec_type\": \"20\"}")` |

### en/solutions/iot/reference/core-concepts.md

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-name`: 1
- Samples:
  - L100 `legacy-anchor-name`: <a name="agora-sd-rtn"></a>

### en/solutions/iot/reference/licensing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 42
  - `raw-html:ul`: 14
- Samples:
  - L24 `raw-html:li`: | License type | Choose from the following:<ul><li>Trial license</li><li>Commercial license</li></ul>Agora recommends that you use a trial license during integration testing, and s
  - L25 `raw-html:li`: | Stock keeping unit (SKU) | Specify the capability set of the license, including the following parameters: <ul><li>License capabilities: <ul><li>Audio</li><li>Video</li><li>Both a
  - L26 `raw-html:li`: | Validity period | The validity period of the license starts on the day of activation.<ul><li>Trial license: Specify the period in months. Minimum is 3 months.</li><li>Commercial
  - L61 `raw-html:li`: | `skuView` | Object | SKU capability set:<ul><li>`product` (Integer):<ul><li>1: Video SDK</li><li>2: IoT SDK SDK</li><li>3: FPA</li></ul></li><li>`name` (String): The name of the
  - L24 `raw-html:ul`: | License type | Choose from the following:<ul><li>Trial license</li><li>Commercial license</li></ul>Agora recommends that you use a trial license during integration testing, and s
  - L25 `raw-html:ul`: | Stock keeping unit (SKU) | Specify the capability set of the license, including the following parameters: <ul><li>License capabilities: <ul><li>Audio</li><li>Video</li><li>Both a
  - L26 `raw-html:ul`: | Validity period | The validity period of the license starts on the day of activation.<ul><li>Trial license: Specify the period in months. Minimum is 3 months.</li><li>Commercial
  - L61 `raw-html:ul`: | `skuView` | Object | SKU capability set:<ul><li>`product` (Integer):<ul><li>1: Video SDK</li><li>2: IoT SDK SDK</li><li>3: FPA</li></ul></li><li>`name` (String): The name of the

### en/solutions/iot/reference/supported-platforms.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:li`: 8
  - `raw-html:ul`: 2
- Samples:
  - L11 `raw-html:li`: | Android | Android 4.1 or later. IoT SDK supports the following ABIs: <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later
  - L11 `raw-html:ul`: | Android | Android 4.1 or later. IoT SDK supports the following ABIs: <ul><li>armeabi-v7a</li><li>arm64-v8a</li><li>x86</li><li>x86-64</li></ul> | Android Studio 3.0 or later

### zh-CN/ai/best-practices/optimize-latency.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L22 `inline-html:br`: | **LLM** | `llm_ttfb` / `llm_ttfs` | TTFB: Time To First Byte，首字节延迟<br/>TTFS: Time To First Sentence，首句延迟 | 250-1000 ms |

### zh-CN/ai/best-practices/regional-restrictions.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 11
  - `raw-html:p`: 2
- Samples:
  - L12 `raw-html:p`: | 北美 | 新加坡 | 北美 | 可能受到较大影响。由于指定区域与 App 用户所在区域之间存在跨区域公共互联网，公共互联网网络质量较差会导致音视频体验受到影响。<p>如果指定区域的服务器都不可用，服务会直接报错。</p> |
  - L35 `inline-html:br`: | `area` | String | 是 | 允许访问的区域。可选以下值：<br />- `GLOBAL`：全球<br />- `NORTH_AMERICA`：北美<br />- `EUROPE`：欧洲<br />- `ASIA`：亚洲<br />- `INDIA`：印度<br />- `JAPAN`：日本 |
  - L36 `inline-html:br`: | `exclude_area` | String | 否 | 排除的区域。仅当 `area` 为 `GLOBAL` 时可用。可选以下值：<br />- `NORTH_AMERICA`：北美<br />- `EUROPE`：欧洲<br />- `ASIA`：亚洲<br />- `INDIA`：印度<br />- `JAPAN`：日本 |

### zh-CN/ai/billing.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 11
- Samples:
  - L13 `inline-html:br`: | ASR 处理费用 | - （默认）凤鸣 ASR：0.077 元 / 分钟<br>- 第三方 ASR：查看供应商文档 | 凤鸣 ASR 1000 分钟总量（一次性赠予） |
  - L41 `inline-html:br`: | 对话式 AI 引擎加油包 5K | 469 元 | - 对话式 AI 引擎音频任务时长 5K 分钟<br>- 凤鸣 ASR 处理时长 5K 分钟 | 96% |
  - L42 `inline-html:br`: | 对话式 AI 引擎加油包 20K | 1799 元 | - 对话式 AI 引擎音频任务时长 20K 分钟<br>- 凤鸣 ASR 处理时长 20K 分钟 | 92% |
  - L43 `inline-html:br`: | 对话式 AI 引擎加油包（优雅打断版）5K | 669 元 | - 对话式 AI 引擎音频任务时长 5K 分钟<br>- 对话式 AI 引擎优雅打断时长 5K 分钟<br>- 凤鸣 ASR 处理时长 5K 分钟 | 96% |
  - L44 `inline-html:br`: | 对话式 AI 引擎加油包（优雅打断版）20K | 2579 元 | - 对话式 AI 引擎音频任务时长 20K 分钟<br>- 对话式 AI 引擎优雅打断时长 20K 分钟<br>- 凤鸣 ASR 处理时长 20K 分钟 | 92% |
  - L92 `inline-html:br`: | LLM 调用 | - 输入 500 tokens<br>- 输出 800 tokens | - 输入：2 元/百万 tokens<br>- 输出：8 元/百万 tokens | 2 * 500 / 1000000 + 8 * 800 / 1000000 = 0.0074 元 | |
  - L114 `inline-html:br`: | LLM 调用 | - 输入 500 tokens<br>- 输出 800 tokens | - 输入：2 元/百万 tokens<br>- 输出：8 元/百万 tokens | 2 * 500 / 1000000 + 8 * 800 / 1000000 = 0.0074 元 | |

### zh-CN/api-reference/ncs-events.mdx

- Statuses: `manual-html-review`, `needs-anchor-normalization`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 11
  - `legacy-anchor-id`: 6
- Samples:
  - L43 `legacy-anchor-id`: <a id="eventtype"></a>
  - L59 `legacy-anchor-id`: <a id="101"></a>
  - L87 `legacy-anchor-id`: <a id="102"></a>
  - L202 `legacy-anchor-id`: <a id="110"></a>
  - L230 `legacy-anchor-id`: <a id="111"></a>
  - L281 `legacy-anchor-id`: <a id="201"></a>
  - L52 `inline-html:br`: | 103 | `agent history` | 智能体停止后回调其储存的短期记忆（最大条数由[创建智能体](../operations/start-agent.md#llm-max_history)时传入的 `llm.max_history` 参数决定，默认为 32 条），包括以下信息：<br />- 用户和智能体对话消息<br />- 智能体创建和停止
  - L214 `inline-html:br`: | `errors` | Array | 错误信息。包含以下字段：<br />- `module`：错误发生的模块。<br />- `turn_id`：字幕对话轮次。<br />- `code`：错误码。你可以前往错误模块对应供应商的错误码文档查看详细信息。<br />- `message`：错误信息。 |

### zh-CN/api-reference/rtc/android/(current)/audio/audio-basic.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 123
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_basic"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_adjustuserplaybacksignalvolume"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/audio-capture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 39
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_capture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_enableinearmonitoring"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/audio-custom-capturenrendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 61
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_custom_capturenrendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__parameters"></a>
  - L42 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__return_values"></a>
  - L52 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudiopublishvolume"></a>
  - L58 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudiopublishvolume__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/audio-encoded.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 19
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_encoded"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__parameters"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__return_values"></a>
  - L47 `legacy-anchor-id`: <a id="callback_iaudioencodedframeobserver_onmixedaudioencodedframe"></a>
  - L53 `legacy-anchor-id`: <a id="callback_iaudioencodedframeobserver_onmixedaudioencodedframe__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/audio-raw.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 90
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_raw"></a>
  - L7 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams"></a>
  - L13 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__return_values"></a>
  - L36 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams"></a>
  - L42 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams__prototype"></a>
  - L48 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/audio-spectrum.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 34
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_spectrum"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor__prototype"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/audio-effect.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 76
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_effect"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__scenario"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__timing"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__parameters"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/audiomixer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 19
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audiomixer"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__detailed_desc"></a>
  - L30 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__scenario"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__timing"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__parameters"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_prenpost"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/sound-position.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 17
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_sound_position"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__return_values"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_setremotevoiceposition"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_setremotevoiceposition__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/audio/pre-and-post-processing/spatial-audio.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 109
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_spatial_audio"></a>
  - L7 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions"></a>
  - L13 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__return_values"></a>
  - L33 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine"></a>
  - L39 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine__prototype"></a>
  - L45 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/channel.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 225
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_channel"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengineex_getuserinfobyuidex"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advancedaudiooptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advancedaudiooptions__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_advancedaudiooptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advancedconfiginfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advancedconfiginfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_advancedconfiginfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-advanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advanceoptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_advanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-agorafacepositioninfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_agorafacepositioninfo__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_agorafacepositioninfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-agorarhythmplayerconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_agorarhythmplayerconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_agorarhythmplayerconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-areacode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_areacode__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_areacode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioencodedframeobserverconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioencodedframeobserverconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audioencodedframeobserverconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioframe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioframe__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_audioframe__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audioparams.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioparams__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_audioparams__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_audioparams__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiorecordingconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiorecordingconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_audiorecordingconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiospectrumdata.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiospectrumdata__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audiospectrumdata__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiotrackconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiotrackconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audiotrackconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-audiovolumeinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiovolumeinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_audiovolumeinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-beautyoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_beautyoptions__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_beautyoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-cachestatistics.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_cachestatistics__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_cachestatistics__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-cameracapturerconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_cameracapturerconfiguration__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_cameracapturerconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediainfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediainfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_channelmediainfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediaoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediaoptions__prototype"></a>
  - L50 `legacy-anchor-id`: <a id="class_channelmediaoptions__detailed_desc"></a>
  - L58 `legacy-anchor-id`: <a id="class_channelmediaoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-channelmediarelayconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediarelayconfiguration__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_channelmediarelayconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-clientroleoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_clientroleoptions__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_clientroleoptions__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_clientroleoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-climaxsegment.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_climaxsegment__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_climaxsegment__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-codeccapinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_codeccapinfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_codeccapinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-codeccaplevels.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_codeccaplevels__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_codeccaplevels__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-colorenhanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_colorenhanceoptions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_colorenhanceoptions__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_colorenhanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-config.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_config__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_config__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-contentinspectconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_contentinspectconfig__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_contentinspectconfig__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_contentinspectconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-contentinspectmodule.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_contentinspectmodule__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_contentinspectmodule__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_contentinspectmodule__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-datastreamconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_datastreamconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_datastreamconfig__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_datastreamconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-deviceinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_deviceinfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_deviceinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-echotestconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_echotestconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_echotestconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-encodedvideoframeinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_encodedvideoframeinfo__prototype"></a>
  - L22 `legacy-anchor-id`: <a id="class_encodedvideoframeinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-encryptionconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_encryptionconfig__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_encryptionconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-extensioncontext.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_extensioncontext__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_extensioncontext__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-externalvideoframe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_externalvideoframe__prototype"></a>
  - L40 `legacy-anchor-id`: <a id="class_externalvideoframe__detailed_desc"></a>
  - L51 `legacy-anchor-id`: <a id="class_externalvideoframe__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-faceshapeareaoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__detailed_desc"></a>
  - L50 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-faceshapebeautyoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-filtereffectoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_filtereffectoptions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_filtereffectoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-focallengthinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_focallengthinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_focallengthinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-imagetrackoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_imagetrackoptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_imagetrackoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileprobeconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileprobeconfig__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_lastmileprobeconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileprobeonewayresult.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileprobeonewayresult__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_lastmileprobeonewayresult__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lastmileproberesult.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileproberesult__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_lastmileproberesult__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-leavechanneloptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_leavechanneloptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_leavechanneloptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-livetranscoding.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_livetranscoding__prototype"></a>
  - L32 `legacy-anchor-id`: <a id="class_livetranscoding__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaccesspointconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaccesspointconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_localaccesspointconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaudiomixerconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaudiomixerconfiguration__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_localaudiomixerconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localaudiostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaudiostats__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_localaudiostats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localspatialaudioconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localspatialaudioconfig__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_localspatialaudioconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localtranscoderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localtranscoderconfiguration__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_localtranscoderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-localvideostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localvideostats__prototype"></a>
  - L36 `legacy-anchor-id`: <a id="class_localvideostats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-logconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_logconfig__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_logconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-loguploadserverinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_loguploadserverinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_loguploadserverinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-lowlightenhanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mediarecorderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mediasource.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mediasource__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_mediasource__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-metadata.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_metadata__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_metadata__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-mixedaudiostream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mixedaudiostream__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_mixedaudiostream__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-multipathstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_multipathstats__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_multipathstats__detailed_desc"></a>
  - L26 `legacy-anchor-id`: <a id="class_multipathstats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-music.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_music__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_music__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccacheinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccacheinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musiccacheinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccachestatustype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccachestatustype__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musiccachestatustype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musicchartinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musicchartinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musicchartinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccontentcenterconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccontentcenterconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_musiccontentcenterconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-musiccontentcenterstatereason.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccontentcenterstatereason__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_musiccontentcenterstatereason__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-pathstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_pathstats__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_pathstats__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="class_pathstats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerplaybackstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerplaybackstats__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_playerplaybackstats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerstreaminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerstreaminfo__prototype"></a>
  - L25 `legacy-anchor-id`: <a id="class_playerstreaminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-playerupdatedinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerupdatedinfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_playerupdatedinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-preloadstate-android.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_preloadstate_android__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_preloadstate_android__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-recorderinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_recorderinfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_recorderinfo__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="class_recorderinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-recorderstreaminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_recorderstreaminfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_recorderstreaminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rectangle.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rectangle__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_rectangle__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_rectangle__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remoteaudiostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remoteaudiostats__prototype"></a>
  - L33 `legacy-anchor-id`: <a id="class_remoteaudiostats__detailed_desc"></a>
  - L37 `legacy-anchor-id`: <a id="class_remoteaudiostats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remotevideostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remotevideostats__prototype"></a>
  - L30 `legacy-anchor-id`: <a id="class_remotevideostats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-remotevoicepositioninfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remotevoicepositioninfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_remotevoicepositioninfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcconnection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcconnection__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rtcconnection__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcengineconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcengineconfig__prototype"></a>
  - L26 `legacy-anchor-id`: <a id="class_rtcengineconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcimage__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_rtcimage__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="class_rtcimage__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcstats__prototype"></a>
  - L37 `legacy-anchor-id`: <a id="class_rtcstats__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rteexception.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rteexception__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rteexception__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_rteexception__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rteplayerstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rteplayerstats__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rteplayerstats__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screenaudioparameters.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screenaudioparameters__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_screenaudioparameters__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_screenaudioparameters__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screencaptureparameters2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screencaptureparameters2__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_screencaptureparameters2__detailed_desc"></a>
  - L22 `legacy-anchor-id`: <a id="class_screencaptureparameters2__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-screenvideoparameters.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screenvideoparameters__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_screenvideoparameters__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_screenvideoparameters__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-segmentationproperty.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_segmentationproperty__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_segmentationproperty__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-simulcaststreamconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-snapshotconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_snapshotconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_snapshotconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-spatialaudioparams.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_spatialaudioparams__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_spatialaudioparams__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-spatialaudiozone.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_spatialaudiozone__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_spatialaudiozone__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-srcinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_srcinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_srcinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-transcodinguser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_transcodinguser__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_transcodinguser__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-transcodingvideostream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_transcodingvideostream__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_transcodingvideostream__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="class_transcodingvideostream__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-uplinknetworkinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_uplinknetworkinfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_uplinknetworkinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-useraudiospectruminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_useraudiospectruminfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_useraudiospectruminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-userinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_userinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_userinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videocanvas.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videocanvas__prototype"></a>
  - L31 `legacy-anchor-id`: <a id="class_videocanvas__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videodenoiseroptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videodenoiseroptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_videodenoiseroptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_videodenoiseroptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videodimensions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videodimensions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_videodimensions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videoencoderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__prototype"></a>
  - L47 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__detailed_desc"></a>
  - L51 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videoformat.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videoformat__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_videoformat__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videolayout.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videolayout__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_videolayout__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videolayoutinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videolayoutinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_videolayoutinfo__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_videolayoutinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videorenderingtracinginfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videorenderingtracinginfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_videorenderingtracinginfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-videosubscriptionoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videosubscriptionoptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_videosubscriptionoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-virtualbackgroundsource.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_virtualbackgroundsource__prototype"></a>
  - L24 `legacy-anchor-id`: <a id="class_virtualbackgroundsource__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkbuffer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkbuffer__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_watermarkbuffer__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="class_watermarkbuffer__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkconfig__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_watermarkconfig__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_watermarkconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-watermarkoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkoptions__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_watermarkoptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_watermarkoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiocodecprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiocodecprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiodualmonomode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiodualmonomode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioequalizationbandfrequency.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioequalizationbandfrequency__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiomixingdualmonomode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiomixingdualmonomode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioprocessingchannels.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioprocessingchannels__detailed_desc"></a>
  - L16 `legacy-anchor-id`: <a id="enum_audioprocessingchannels__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audioreverbtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioreverbtype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiosampleratetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiosampleratetype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-audiotracktype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiotracktype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-cameradirection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_cameradirection__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-camerafocallengthtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_camerafocallengthtype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-compressionpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_compressionpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-degradationpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_degradationpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-encodingpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_encodingpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-encryptionmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_encryptionmode__detailed_desc"></a>
  - L9 `legacy-anchor-id`: <a id="enum_encryptionmode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-externalvideosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_externalvideosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-framerate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_framerate__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-loglevel.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_loglevel__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerevent__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayermetadatatype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayermetadatatype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerreason.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerreason__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediaplayerstate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerstate__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediasourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediasourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediastreamtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediastreamtype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-mediatraceevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediatraceevent__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-multipathmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_multipathmode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_multipathmode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-multipathtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_multipathtype__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_multipathtype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-musicplaymode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_musicplaymode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-orientationmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_orientationmode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-playerpreloadevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_playerpreloadevent__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-renewtokenerrorcode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_renewtokenerrorcode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_renewtokenerrorcode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteabrfallbacklayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteabrfallbacklayer__detailed_desc"></a>
  - L16 `legacy-anchor-id`: <a id="enum_rteabrfallbacklayer__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteabrsubscriptionlayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteabrsubscriptionlayer__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="enum_rteabrsubscriptionlayer__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteerrorcode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteerrorcode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteerrorcode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteplayerevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteplayerevent__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteplayerevent__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteplayerstate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteplayerstate__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteplayerstate__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rtevideomirrormode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rtevideomirrormode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rtevideomirrormode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rtevideorendermode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rtevideorendermode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rtevideorendermode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-screenscenariotype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_screenscenariotype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-simulcaststreammode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_simulcaststreammode__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-streamfallbackoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_streamfallbackoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoapplicationscenariotype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoapplicationscenariotype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodecprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodecprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodectype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodectype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videocodectypeforstream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodectypeforstream__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videocodectypeforstream__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoeffectaction.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoeffectaction__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videoeffectaction__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videoeffectnodeid.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoeffectnodeid__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videoeffectnodeid__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videomoduleposition.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videomoduleposition__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-videostreamtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videostreamtype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-voiceaitunertype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_voiceaitunertype__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_api_data_type__class"></a>
  - L118 `legacy-anchor-id`: <a id="rtc_api_data_type__enum"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-removedestchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setdestchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setsrcchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-addbackgroundimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-adduser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-addwatermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getadvancedfeatures.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundcolor.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundimagelist.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getblue.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getgreen.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getred.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getred__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getred__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getred__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getusercount.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getusers.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-getwatermarklist.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removebackgroundimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removeuser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-removewatermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setadvancedfeatures.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setblue.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setgreen.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setred.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setred__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setred__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setred__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setusers.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/class-and-enum/standalone-apis/api-livetranscoding-setusers2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/channel-media-relay.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_channel_media_relay"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__return_values"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex__prototype"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_cloud_media_relay"></a>

### zh-CN/api-reference/rtc/android/(current)/cloud-media-relay/media-push.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 62
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_media_push"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__related"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__parameters"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__return_values"></a>
  - L56 `legacy-anchor-id`: <a id="api_irtcengineex_startrtmpstreamwithouttranscodingex"></a>

### zh-CN/api-reference/rtc/android/(current)/device-management/audio-device.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_device"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__return_values"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/device-management/audio-route.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 32
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_route"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_setdefaultaudioroutetospeakerphone"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_setdefaultaudioroutetospeakerphone__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/device-management/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_device_management"></a>

### zh-CN/api-reference/rtc/android/(current)/device-management/video-device.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 103
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_device"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__return_values"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/extensions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 59
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_extension"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addextension"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addextension__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addextension__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_addextension__parameters"></a>
  - L32 `legacy-anchor-id`: <a id="api_irtcengine_enableextension"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_enableextension__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_enableextension__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/full-sdk-api-list.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 53
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_interface_class"></a>
  - L9 `legacy-anchor-id`: <a id="class_asynccallback"></a>
  - L18 `legacy-anchor-id`: <a id="class_canvas"></a>
  - L24 `legacy-anchor-id`: <a id="class_canvas__detailed_desc"></a>
  - L37 `legacy-anchor-id`: <a id="class_canvasconfig"></a>
  - L43 `legacy-anchor-id`: <a id="class_canvasconfig__detailed_desc"></a>
  - L55 `legacy-anchor-id`: <a id="class_error"></a>
  - L61 `legacy-anchor-id`: <a id="class_error__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/initialize.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 31
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_initialize"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addhandler"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_create"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_create__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_create__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/metadata/datastream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 52
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_datastream"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__timing"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__related"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__parameters"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/metadata/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_metadata"></a>

### zh-CN/api-reference/rtc/android/(current)/metadata/metadata-observer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 26
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_metadata_observer"></a>
  - L7 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize"></a>
  - L13 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__return_values"></a>
  - L32 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/network-and-other.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 242
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_network"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_complain"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_complain__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_complain__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_complain__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_complain__return_values"></a>
  - L48 `legacy-anchor-id`: <a id="api_irtcengine_enableencryption"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_enableencryption__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/overview.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_api_overview__toc_initialize"></a>
  - L19 `legacy-anchor-id`: <a id="rtc_api_overview__toc_channel"></a>
  - L54 `legacy-anchor-id`: <a id="rtc_api_overview__toc_publishnsubscribe"></a>
  - L92 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_basic"></a>
  - L116 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_capture"></a>
  - L129 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_effect"></a>
  - L149 `legacy-anchor-id`: <a id="rtc_api_overview__toc_sound_position"></a>
  - L159 `legacy-anchor-id`: <a id="rtc_api_overview__toc_spatial_audio"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/audio-effect-file.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 132
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_effect_file"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__parameters"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__return_values"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_geteffectduration"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_geteffectduration__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/audio-mixing.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 119
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_mixing"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__parameters"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__return_values"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingpublishvolume"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/drm.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 155
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_drm"></a>
  - L7 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__return_values"></a>
  - L33 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter"></a>
  - L39 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter__prototype"></a>
  - L45 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_play"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-cache.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 55
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_cache"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__return_values"></a>
  - L44 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_getcachedir"></a>
  - L50 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_getcachedir__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-control.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 55
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_control"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__parameters"></a>
  - L38 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__return_values"></a>
  - L48 `legacy-anchor-id`: <a id="api_imediaplayer_adjustpublishsignalvolume"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-info.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 52
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_info"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__return_values"></a>
  - L31 `legacy-anchor-id`: <a id="api_imediaplayer_getduration"></a>
  - L37 `legacy-anchor-id`: <a id="api_imediaplayer_getduration__prototype"></a>
  - L43 `legacy-anchor-id`: <a id="api_imediaplayer_getduration__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-initialize.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 15
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_initialize"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__return_values"></a>
  - L38 `legacy-anchor-id`: <a id="api_imediaplayer_destroy_imediaplayer"></a>
  - L44 `legacy-anchor-id`: <a id="api_imediaplayer_destroy_imediaplayer__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-observer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 80
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_observer"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__parameters"></a>
  - L36 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__return_values"></a>
  - L46 `legacy-anchor-id`: <a id="api_imediaplayer_registerplayersourceobserver"></a>
  - L52 `legacy-anchor-id`: <a id="api_imediaplayer_registerplayersourceobserver__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-open.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 34
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_open"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_open"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_open__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_open__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_open__timing"></a>
  - L33 `legacy-anchor-id`: <a id="api_imediaplayer_open__related"></a>
  - L39 `legacy-anchor-id`: <a id="api_imediaplayer_open__parameters"></a>
  - L51 `legacy-anchor-id`: <a id="api_imediaplayer_open__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/media-player/mediaplayer-playnrender.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 46
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_playnrender"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="api_imediaplayer_setaudiodualmonomode"></a>
  - L51 `legacy-anchor-id`: <a id="api_imediaplayer_setaudiodualmonomode__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/rhythmplayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_rhythmplayer"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__timing"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_startrhythmplayer"></a>

### zh-CN/api-reference/rtc/android/(current)/playback/rte-player.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 393
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_rte_player"></a>
  - L7 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__return_values"></a>
  - L32 `legacy-anchor-id`: <a id="api_canvas_addview"></a>
  - L38 `legacy-anchor-id`: <a id="api_canvas_addview__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_canvas_addview__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/publish-and-subscribe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 214
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_publishnsubscribe"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__detailed_desc"></a>
  - L36 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__parameters"></a>
  - L47 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__return_values"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode3"></a>
  - L63 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode3__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/recording.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_recording"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__parameters"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__return_values"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_destroymediarecorder"></a>
  - L47 `legacy-anchor-id`: <a id="api_irtcengine_destroymediarecorder__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/camera-capture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_camera_capture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__parameters"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__return_values"></a>
  - L53 `legacy-anchor-id`: <a id="api_irtcengine_stopcameracapture"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengine_stopcameracapture__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/face-detection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 12
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_face_detection"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__related"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__parameters"></a>
  - L48 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/image-source.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 7
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_image_source"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__parameters"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__return_values"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_prenpro"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/local-transcoder.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_local_transcoder"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__detailed_desc"></a>
  - L36 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__scenario"></a>
  - L42 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__timing"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__related"></a>
  - L55 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__parameters"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/snapshot.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_snapshot"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__timing"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__parameters"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__return_values"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengineex_enablecontentinspectex"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/video-enhance-option.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 173
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_enhance_option"></a>
  - L7 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect"></a>
  - L13 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__detailed_desc"></a>
  - L35 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__parameters"></a>
  - L50 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__return_values"></a>
  - L60 `legacy-anchor-id`: <a id="api_irtcengine_createvideoeffectobject"></a>
  - L66 `legacy-anchor-id`: <a id="api_irtcengine_createvideoeffectobject__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/virtualbackground.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_virtualbackground"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__detailed_desc"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__parameters"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__return_values"></a>
  - L68 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground2"></a>
  - L74 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground2__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/pre-and-post-processing/watermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 93
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_watermark"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__detailed_desc"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark2"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark2__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/screencapture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 36
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_screencapture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__scenario"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="api_irtcengine_setexternalmediaprojection"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_setexternalmediaprojection__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/video-basic.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 135
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_basic"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__timing"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__related"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__return_values"></a>
  - L53 `legacy-anchor-id`: <a id="api_irtcengine_enablelocalvideo"></a>

### zh-CN/api-reference/rtc/android/(current)/video/video-custom-capturenrendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_custom_capturenrendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack__prototype"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/(current)/video/video-encoded.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_encoded"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="callback_ivideoencodedframeobserver_onencodedvideoframereceived"></a>
  - L51 `legacy-anchor-id`: <a id="callback_ivideoencodedframeobserver_onencodedvideoframereceived__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/video-raw.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_raw"></a>
  - L7 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied"></a>
  - L13 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__timing"></a>
  - L34 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__return_values"></a>
  - L46 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getobservedframeposition"></a>
  - L52 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getobservedframeposition__prototype"></a>

### zh-CN/api-reference/rtc/android/(current)/video/video-rendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 93
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_rendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__detailed_desc"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__scenario"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__timing"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__return_values"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_setlocalrendermode1"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-basic.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 123
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_basic"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_adjustplaybacksignalvolume__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_adjustuserplaybacksignalvolume"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-capture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 39
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_capture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_adjustrecordingsignalvolume__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_enableinearmonitoring"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-custom-capturenrendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 61
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_custom_capturenrendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__parameters"></a>
  - L42 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudioplayoutvolume__return_values"></a>
  - L52 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudiopublishvolume"></a>
  - L58 `legacy-anchor-id`: <a id="api_irtcengine_adjustcustomaudiopublishvolume__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-encoded.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 19
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_encoded"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__parameters"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_registeraudioencodedframeobserver__return_values"></a>
  - L47 `legacy-anchor-id`: <a id="callback_iaudioencodedframeobserver_onmixedaudioencodedframe"></a>
  - L53 `legacy-anchor-id`: <a id="callback_iaudioencodedframeobserver_onmixedaudioencodedframe__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-raw.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 90
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_raw"></a>
  - L7 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams"></a>
  - L13 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getearmonitoringaudioparams__return_values"></a>
  - L36 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams"></a>
  - L42 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams__prototype"></a>
  - L48 `legacy-anchor-id`: <a id="api_iaudioframeobserver_getmixedaudioparams__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/audio-spectrum.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 34
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_spectrum"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_disableaudiospectrummonitor__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor__prototype"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_enableaudiospectrummonitor__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/audio-effect.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 76
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_effect"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__scenario"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__timing"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__parameters"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_enablevoiceaituner__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/audiomixer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 19
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audiomixer"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__detailed_desc"></a>
  - L30 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__scenario"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__timing"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__parameters"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_startlocalaudiomixer__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_prenpost"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/sound-position.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 17
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_sound_position"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_enablesoundpositionindication__return_values"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_setremotevoiceposition"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_setremotevoiceposition__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/audio/pre-and-post-processing/spatial-audio.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 109
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_spatial_audio"></a>
  - L7 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions"></a>
  - L13 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_ibasespatialaudioengine_clearremotepositions__return_values"></a>
  - L33 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine"></a>
  - L39 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine__prototype"></a>
  - L45 `legacy-anchor-id`: <a id="api_ilocalspatialaudioengine_create_ilocalspatialaudioengine__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/channel.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 225
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_channel"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_getuserinfobyuid__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengineex_getuserinfobyuidex"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advancedaudiooptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advancedaudiooptions__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_advancedaudiooptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advancedconfiginfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advancedconfiginfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_advancedconfiginfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-advanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_advanceoptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_advanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-agorafacepositioninfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_agorafacepositioninfo__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_agorafacepositioninfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-agorarhythmplayerconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_agorarhythmplayerconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_agorarhythmplayerconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-areacode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_areacode__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_areacode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioencodedframeobserverconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioencodedframeobserverconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audioencodedframeobserverconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioframe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioframe__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_audioframe__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audioparams.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audioparams__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_audioparams__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_audioparams__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiorecordingconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiorecordingconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_audiorecordingconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiospectrumdata.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiospectrumdata__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audiospectrumdata__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiotrackconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiotrackconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_audiotrackconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-audiovolumeinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_audiovolumeinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_audiovolumeinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-beautyoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_beautyoptions__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_beautyoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-cachestatistics.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_cachestatistics__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_cachestatistics__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-cameracapturerconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_cameracapturerconfiguration__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_cameracapturerconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediainfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediainfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_channelmediainfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediaoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediaoptions__prototype"></a>
  - L50 `legacy-anchor-id`: <a id="class_channelmediaoptions__detailed_desc"></a>
  - L58 `legacy-anchor-id`: <a id="class_channelmediaoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-channelmediarelayconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_channelmediarelayconfiguration__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_channelmediarelayconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-clientroleoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_clientroleoptions__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_clientroleoptions__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_clientroleoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-climaxsegment.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_climaxsegment__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_climaxsegment__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-codeccapinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_codeccapinfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_codeccapinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-codeccaplevels.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_codeccaplevels__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_codeccaplevels__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-colorenhanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_colorenhanceoptions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_colorenhanceoptions__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_colorenhanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-config.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_config__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_config__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-contentinspectconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_contentinspectconfig__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_contentinspectconfig__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_contentinspectconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-contentinspectmodule.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_contentinspectmodule__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_contentinspectmodule__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_contentinspectmodule__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-datastreamconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_datastreamconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_datastreamconfig__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_datastreamconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-deviceinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_deviceinfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_deviceinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-echotestconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_echotestconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_echotestconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-encodedvideoframeinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_encodedvideoframeinfo__prototype"></a>
  - L22 `legacy-anchor-id`: <a id="class_encodedvideoframeinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-encryptionconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_encryptionconfig__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_encryptionconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-extensioncontext.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_extensioncontext__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_extensioncontext__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-externalvideoframe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_externalvideoframe__prototype"></a>
  - L40 `legacy-anchor-id`: <a id="class_externalvideoframe__detailed_desc"></a>
  - L51 `legacy-anchor-id`: <a id="class_externalvideoframe__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-faceshapeareaoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__detailed_desc"></a>
  - L50 `legacy-anchor-id`: <a id="class_faceshapeareaoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-faceshapebeautyoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="class_faceshapebeautyoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-filtereffectoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_filtereffectoptions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_filtereffectoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-focallengthinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_focallengthinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_focallengthinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-imagetrackoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_imagetrackoptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_imagetrackoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileprobeconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileprobeconfig__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_lastmileprobeconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileprobeonewayresult.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileprobeonewayresult__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_lastmileprobeonewayresult__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lastmileproberesult.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lastmileproberesult__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_lastmileproberesult__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-leavechanneloptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_leavechanneloptions__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_leavechanneloptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-livetranscoding.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_livetranscoding__prototype"></a>
  - L32 `legacy-anchor-id`: <a id="class_livetranscoding__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaccesspointconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaccesspointconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_localaccesspointconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaudiomixerconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaudiomixerconfiguration__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_localaudiomixerconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localaudiostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localaudiostats__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_localaudiostats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localspatialaudioconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localspatialaudioconfig__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_localspatialaudioconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localtranscoderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localtranscoderconfiguration__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_localtranscoderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-localvideostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_localvideostats__prototype"></a>
  - L36 `legacy-anchor-id`: <a id="class_localvideostats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-logconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_logconfig__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_logconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-loguploadserverinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_loguploadserverinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_loguploadserverinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-lowlightenhanceoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_lowlightenhanceoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mediarecorderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="class_mediarecorderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mediasource.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mediasource__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_mediasource__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-metadata.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_metadata__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_metadata__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-mixedaudiostream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_mixedaudiostream__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_mixedaudiostream__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-multipathstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_multipathstats__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_multipathstats__detailed_desc"></a>
  - L26 `legacy-anchor-id`: <a id="class_multipathstats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-music.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_music__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_music__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccacheinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccacheinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musiccacheinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccachestatustype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccachestatustype__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musiccachestatustype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musicchartinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musicchartinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_musicchartinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccontentcenterconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccontentcenterconfiguration__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_musiccontentcenterconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-musiccontentcenterstatereason.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_musiccontentcenterstatereason__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_musiccontentcenterstatereason__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-pathstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_pathstats__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_pathstats__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="class_pathstats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerplaybackstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerplaybackstats__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_playerplaybackstats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerstreaminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerstreaminfo__prototype"></a>
  - L25 `legacy-anchor-id`: <a id="class_playerstreaminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-playerupdatedinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_playerupdatedinfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_playerupdatedinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-preloadstate-android.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_preloadstate_android__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_preloadstate_android__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-recorderinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_recorderinfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_recorderinfo__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="class_recorderinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-recorderstreaminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_recorderstreaminfo__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_recorderstreaminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rectangle.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rectangle__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_rectangle__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_rectangle__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remoteaudiostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remoteaudiostats__prototype"></a>
  - L33 `legacy-anchor-id`: <a id="class_remoteaudiostats__detailed_desc"></a>
  - L37 `legacy-anchor-id`: <a id="class_remoteaudiostats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remotevideostats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remotevideostats__prototype"></a>
  - L30 `legacy-anchor-id`: <a id="class_remotevideostats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-remotevoicepositioninfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_remotevoicepositioninfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_remotevoicepositioninfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcconnection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcconnection__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rtcconnection__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcengineconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcengineconfig__prototype"></a>
  - L26 `legacy-anchor-id`: <a id="class_rtcengineconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcimage__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_rtcimage__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="class_rtcimage__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rtcstats__prototype"></a>
  - L37 `legacy-anchor-id`: <a id="class_rtcstats__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rteexception.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rteexception__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rteexception__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_rteexception__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rteplayerstats.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_rteplayerstats__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_rteplayerstats__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screenaudioparameters.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screenaudioparameters__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_screenaudioparameters__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_screenaudioparameters__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screencaptureparameters2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screencaptureparameters2__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_screencaptureparameters2__detailed_desc"></a>
  - L22 `legacy-anchor-id`: <a id="class_screencaptureparameters2__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-screenvideoparameters.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_screenvideoparameters__prototype"></a>
  - L17 `legacy-anchor-id`: <a id="class_screenvideoparameters__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_screenvideoparameters__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-segmentationproperty.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_segmentationproperty__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_segmentationproperty__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-simulcaststreamconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__detailed_desc"></a>
  - L19 `legacy-anchor-id`: <a id="class_simulcaststreamconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-snapshotconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_snapshotconfig__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_snapshotconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-spatialaudioparams.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_spatialaudioparams__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_spatialaudioparams__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-spatialaudiozone.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_spatialaudiozone__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_spatialaudiozone__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-srcinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_srcinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_srcinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-transcodinguser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_transcodinguser__prototype"></a>
  - L21 `legacy-anchor-id`: <a id="class_transcodinguser__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-transcodingvideostream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_transcodingvideostream__prototype"></a>
  - L23 `legacy-anchor-id`: <a id="class_transcodingvideostream__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="class_transcodingvideostream__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-uplinknetworkinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_uplinknetworkinfo__prototype"></a>
  - L13 `legacy-anchor-id`: <a id="class_uplinknetworkinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-useraudiospectruminfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_useraudiospectruminfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_useraudiospectruminfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-userinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_userinfo__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_userinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videocanvas.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videocanvas__prototype"></a>
  - L31 `legacy-anchor-id`: <a id="class_videocanvas__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videodenoiseroptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videodenoiseroptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_videodenoiseroptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_videodenoiseroptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videodimensions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videodimensions__prototype"></a>
  - L14 `legacy-anchor-id`: <a id="class_videodimensions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videoencoderconfiguration.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__prototype"></a>
  - L47 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__detailed_desc"></a>
  - L51 `legacy-anchor-id`: <a id="class_videoencoderconfiguration__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videoformat.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videoformat__prototype"></a>
  - L15 `legacy-anchor-id`: <a id="class_videoformat__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videolayout.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videolayout__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_videolayout__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videolayoutinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videolayoutinfo__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_videolayoutinfo__detailed_desc"></a>
  - L20 `legacy-anchor-id`: <a id="class_videolayoutinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videorenderingtracinginfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videorenderingtracinginfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_videorenderingtracinginfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-videosubscriptionoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_videosubscriptionoptions__prototype"></a>
  - L18 `legacy-anchor-id`: <a id="class_videosubscriptionoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-virtualbackgroundsource.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_virtualbackgroundsource__prototype"></a>
  - L24 `legacy-anchor-id`: <a id="class_virtualbackgroundsource__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkbuffer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkbuffer__prototype"></a>
  - L20 `legacy-anchor-id`: <a id="class_watermarkbuffer__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="class_watermarkbuffer__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkconfig.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkconfig__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="class_watermarkconfig__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="class_watermarkconfig__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-watermarkoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="class_watermarkoptions__prototype"></a>
  - L16 `legacy-anchor-id`: <a id="class_watermarkoptions__detailed_desc"></a>
  - L24 `legacy-anchor-id`: <a id="class_watermarkoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiocodecprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiocodecprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiodualmonomode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiodualmonomode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioequalizationbandfrequency.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioequalizationbandfrequency__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiomixingdualmonomode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiomixingdualmonomode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioprocessingchannels.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioprocessingchannels__detailed_desc"></a>
  - L16 `legacy-anchor-id`: <a id="enum_audioprocessingchannels__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audioreverbtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audioreverbtype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiosampleratetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiosampleratetype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-audiotracktype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_audiotracktype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-cameradirection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_cameradirection__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-camerafocallengthtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_camerafocallengthtype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-compressionpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_compressionpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-degradationpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_degradationpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-encodingpreference.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_encodingpreference__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-encryptionmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_encryptionmode__detailed_desc"></a>
  - L9 `legacy-anchor-id`: <a id="enum_encryptionmode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-externalvideosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_externalvideosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-framerate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_framerate__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-loglevel.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_loglevel__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerevent__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayermetadatatype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayermetadatatype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerreason.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerreason__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediaplayerstate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediaplayerstate__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediasourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediasourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediastreamtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediastreamtype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-mediatraceevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_mediatraceevent__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-multipathmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_multipathmode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_multipathmode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-multipathtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_multipathtype__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_multipathtype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-musicplaymode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_musicplaymode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-orientationmode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_orientationmode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-playerpreloadevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_playerpreloadevent__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-renewtokenerrorcode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_renewtokenerrorcode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_renewtokenerrorcode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteabrfallbacklayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteabrfallbacklayer__detailed_desc"></a>
  - L16 `legacy-anchor-id`: <a id="enum_rteabrfallbacklayer__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteabrsubscriptionlayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteabrsubscriptionlayer__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="enum_rteabrsubscriptionlayer__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteerrorcode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteerrorcode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteerrorcode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteplayerevent.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteplayerevent__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteplayerevent__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rteplayerstate.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rteplayerstate__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rteplayerstate__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rtevideomirrormode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rtevideomirrormode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rtevideomirrormode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-rtevideorendermode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_rtevideorendermode__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_rtevideorendermode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-screenscenariotype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_screenscenariotype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-simulcaststreammode.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_simulcaststreammode__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-streamfallbackoptions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_streamfallbackoptions__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoapplicationscenariotype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoapplicationscenariotype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodecprofiletype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodecprofiletype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodectype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodectype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videocodectypeforstream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videocodectypeforstream__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videocodectypeforstream__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoeffectaction.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoeffectaction__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videoeffectaction__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videoeffectnodeid.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videoeffectnodeid__detailed_desc"></a>
  - L11 `legacy-anchor-id`: <a id="enum_videoeffectnodeid__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videomoduleposition.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videomoduleposition__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videosourcetype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videosourcetype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-videostreamtype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_videostreamtype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/enums/enum-voiceaitunertype.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="enum_voiceaitunertype__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 2
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_api_data_type__class"></a>
  - L118 `legacy-anchor-id`: <a id="rtc_api_data_type__enum"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-removedestchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_removedestchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setdestchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setdestchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-channelmediarelayconfiguration-setsrcchannelinfo.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_channelmediarelayconfiguration_setsrcchannelinfo__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-addbackgroundimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_addbackgroundimage__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-adduser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_adduser__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-addwatermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_addwatermark__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getadvancedfeatures.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getadvancedfeatures__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundcolor.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundcolor__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getbackgroundimagelist.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getbackgroundimagelist__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getblue.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getblue__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getgreen.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getgreen__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getred.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getred__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getred__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_getred__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getusercount.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getusercount__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getusers.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_getusers__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-getwatermarklist.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_getwatermarklist__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removebackgroundimage.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removebackgroundimage__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removeuser.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removeuser__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-removewatermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 4
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__parameters"></a>
  - L21 `legacy-anchor-id`: <a id="api_livetranscoding_removewatermark__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setadvancedfeatures.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_setadvancedfeatures__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setbackgroundcolor2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__detailed_desc"></a>
  - L13 `legacy-anchor-id`: <a id="api_livetranscoding_setbackgroundcolor2__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setblue.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setblue__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setgreen.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setgreen__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setred.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setred__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setred__detailed_desc"></a>
  - L17 `legacy-anchor-id`: <a id="api_livetranscoding_setred__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setusers.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setusers__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/standalone-apis/api-livetranscoding-setusers2.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 3
- Samples:
  - L5 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__prototype"></a>
  - L11 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__detailed_desc"></a>
  - L15 `legacy-anchor-id`: <a id="api_livetranscoding_setusers2__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/channel-media-relay.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_channel_media_relay"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_pauseallchannelmediarelay__return_values"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex__prototype"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengineex_pauseallchannelmediarelayex__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_cloud_media_relay"></a>

### zh-CN/api-reference/rtc/android/4.6.0/cloud-media-relay/media-push.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 62
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_media_push"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__detailed_desc"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__related"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__parameters"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_startrtmpstreamwithouttranscoding__return_values"></a>
  - L56 `legacy-anchor-id`: <a id="api_irtcengineex_startrtmpstreamwithouttranscodingex"></a>

### zh-CN/api-reference/rtc/android/4.6.0/device-management/audio-device.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_device"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_getaudiodeviceinfo__return_values"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_startplaybackdevicetest__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/device-management/audio-route.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 32
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_route"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_isspeakerphoneenabled__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_setdefaultaudioroutetospeakerphone"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_setdefaultaudioroutetospeakerphone__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/device-management/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_device_management"></a>

### zh-CN/api-reference/rtc/android/4.6.0/device-management/video-device.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 103
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_device"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_getcameramaxzoomfactor__return_values"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_iscameraautofocusfacemodesupported__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/extensions.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 59
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_extension"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addextension"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addextension__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addextension__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_addextension__parameters"></a>
  - L32 `legacy-anchor-id`: <a id="api_irtcengine_enableextension"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_enableextension__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_enableextension__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/full-sdk-api-list.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 53
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_interface_class"></a>
  - L9 `legacy-anchor-id`: <a id="class_asynccallback"></a>
  - L18 `legacy-anchor-id`: <a id="class_canvas"></a>
  - L24 `legacy-anchor-id`: <a id="class_canvas__detailed_desc"></a>
  - L37 `legacy-anchor-id`: <a id="class_canvasconfig"></a>
  - L43 `legacy-anchor-id`: <a id="class_canvasconfig__detailed_desc"></a>
  - L55 `legacy-anchor-id`: <a id="class_error"></a>
  - L61 `legacy-anchor-id`: <a id="class_error__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/initialize.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 31
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_initialize"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addhandler"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_addhandler__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_create"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_create__prototype"></a>
  - L46 `legacy-anchor-id`: <a id="api_irtcengine_create__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/metadata/datastream.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 52
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_datastream"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__timing"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__related"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__parameters"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengine_createdatastream1__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/metadata/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_metadata"></a>

### zh-CN/api-reference/rtc/android/4.6.0/metadata/metadata-observer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 26
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_metadata_observer"></a>
  - L7 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize"></a>
  - L13 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imetadataobserver_getmaxmetadatasize__return_values"></a>
  - L32 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_registermediametadataobserver__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/network-and-other.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 242
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_network"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_complain"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_complain__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_complain__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_complain__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_complain__return_values"></a>
  - L48 `legacy-anchor-id`: <a id="api_irtcengine_enableencryption"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_enableencryption__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/overview.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="rtc_api_overview__toc_initialize"></a>
  - L19 `legacy-anchor-id`: <a id="rtc_api_overview__toc_channel"></a>
  - L54 `legacy-anchor-id`: <a id="rtc_api_overview__toc_publishnsubscribe"></a>
  - L92 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_basic"></a>
  - L116 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_capture"></a>
  - L129 `legacy-anchor-id`: <a id="rtc_api_overview__toc_audio_effect"></a>
  - L149 `legacy-anchor-id`: <a id="rtc_api_overview__toc_sound_position"></a>
  - L159 `legacy-anchor-id`: <a id="rtc_api_overview__toc_spatial_audio"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/audio-effect-file.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 132
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_effect_file"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__detailed_desc"></a>
  - L25 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__parameters"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_geteffectcurrentposition__return_values"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_geteffectduration"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_geteffectduration__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/audio-mixing.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 119
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_audio_mixing"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__parameters"></a>
  - L40 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingplayoutvolume__return_values"></a>
  - L50 `legacy-anchor-id`: <a id="api_irtcengine_adjustaudiomixingpublishvolume"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/drm.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 155
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_drm"></a>
  - L7 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imusiccontentcenter_createmusicplayer__return_values"></a>
  - L33 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter"></a>
  - L39 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter__prototype"></a>
  - L45 `legacy-anchor-id`: <a id="api_imusiccontentcenter_destroy_imusiccontentcenter__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_play"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-cache.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 55
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_cache"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__parameters"></a>
  - L34 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_enableautoremovecache__return_values"></a>
  - L44 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_getcachedir"></a>
  - L50 `legacy-anchor-id`: <a id="api_imediaplayercachemanager_getcachedir__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-control.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 55
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_control"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__parameters"></a>
  - L38 `legacy-anchor-id`: <a id="api_imediaplayer_adjustplayoutvolume__return_values"></a>
  - L48 `legacy-anchor-id`: <a id="api_imediaplayer_adjustpublishsignalvolume"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-info.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 52
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_info"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_getaudiobufferdelay__return_values"></a>
  - L31 `legacy-anchor-id`: <a id="api_imediaplayer_getduration"></a>
  - L37 `legacy-anchor-id`: <a id="api_imediaplayer_getduration__prototype"></a>
  - L43 `legacy-anchor-id`: <a id="api_imediaplayer_getduration__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-initialize.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 15
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_initialize"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_createmediaplayer__return_values"></a>
  - L38 `legacy-anchor-id`: <a id="api_imediaplayer_destroy_imediaplayer"></a>
  - L44 `legacy-anchor-id`: <a id="api_imediaplayer_destroy_imediaplayer__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-observer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 80
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_observer"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__parameters"></a>
  - L36 `legacy-anchor-id`: <a id="api_imediaplayer_registeraudioframeobserver2_imediaplayer__return_values"></a>
  - L46 `legacy-anchor-id`: <a id="api_imediaplayer_registerplayersourceobserver"></a>
  - L52 `legacy-anchor-id`: <a id="api_imediaplayer_registerplayersourceobserver__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-open.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 34
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_open"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_open"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_open__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_open__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_open__timing"></a>
  - L33 `legacy-anchor-id`: <a id="api_imediaplayer_open__related"></a>
  - L39 `legacy-anchor-id`: <a id="api_imediaplayer_open__parameters"></a>
  - L51 `legacy-anchor-id`: <a id="api_imediaplayer_open__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/media-player/mediaplayer-playnrender.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 46
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_mediaplayer_playnrender"></a>
  - L7 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_imediaplayer_selectaudiotrack_imediaplayer__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="api_imediaplayer_setaudiodualmonomode"></a>
  - L51 `legacy-anchor-id`: <a id="api_imediaplayer_setaudiodualmonomode__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/rhythmplayer.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_rhythmplayer"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__timing"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_configrhythmplayer__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_startrhythmplayer"></a>

### zh-CN/api-reference/rtc/android/4.6.0/playback/rte-player.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 393
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_rte_player"></a>
  - L7 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer"></a>
  - L13 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_rteplayerinfo_abrsubscriptionlayer__return_values"></a>
  - L32 `legacy-anchor-id`: <a id="api_canvas_addview"></a>
  - L38 `legacy-anchor-id`: <a id="api_canvas_addview__prototype"></a>
  - L44 `legacy-anchor-id`: <a id="api_canvas_addview__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/publish-and-subscribe.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 214
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_publishnsubscribe"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__detailed_desc"></a>
  - L36 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__parameters"></a>
  - L47 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode__return_values"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode3"></a>
  - L63 `legacy-anchor-id`: <a id="api_irtcengine_enabledualstreammode3__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/recording.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_recording"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__parameters"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_createmediarecorder__return_values"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_destroymediarecorder"></a>
  - L47 `legacy-anchor-id`: <a id="api_irtcengine_destroymediarecorder__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/camera-capture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_camera_capture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__parameters"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_startcameracapture__return_values"></a>
  - L53 `legacy-anchor-id`: <a id="api_irtcengine_stopcameracapture"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengine_stopcameracapture__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/face-detection.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 12
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_face_detection"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__detailed_desc"></a>
  - L21 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__timing"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__related"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__parameters"></a>
  - L48 `legacy-anchor-id`: <a id="api_irtcengine_enablefacedetection__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/image-source.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 7
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_image_source"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__detailed_desc"></a>
  - L23 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__timing"></a>
  - L29 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__parameters"></a>
  - L44 `legacy-anchor-id`: <a id="api_irtcengine_enablevideoimagesource__return_values"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/index.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 1
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_prenpro"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/local-transcoder.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 23
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_local_transcoder"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__detailed_desc"></a>
  - L36 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__scenario"></a>
  - L42 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__timing"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__related"></a>
  - L55 `legacy-anchor-id`: <a id="api_irtcengine_startlocalvideotranscoder__parameters"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/snapshot.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 49
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_snapshot"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__timing"></a>
  - L34 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__parameters"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_enablecontentinspect__return_values"></a>
  - L59 `legacy-anchor-id`: <a id="api_irtcengineex_enablecontentinspectex"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/video-enhance-option.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 173
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_enhance_option"></a>
  - L7 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect"></a>
  - L13 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__detailed_desc"></a>
  - L35 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__parameters"></a>
  - L50 `legacy-anchor-id`: <a id="api_ivideoeffectobject_addorupdatevideoeffect__return_values"></a>
  - L60 `legacy-anchor-id`: <a id="api_irtcengine_createvideoeffectobject"></a>
  - L66 `legacy-anchor-id`: <a id="api_irtcengine_createvideoeffectobject__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/virtualbackground.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_virtualbackground"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__detailed_desc"></a>
  - L38 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__parameters"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground__return_values"></a>
  - L68 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground2"></a>
  - L74 `legacy-anchor-id`: <a id="api_irtcengine_enablevirtualbackground2__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/pre-and-post-processing/watermark.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 93
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_watermark"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__detailed_desc"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__parameters"></a>
  - L41 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark1__return_values"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark2"></a>
  - L57 `legacy-anchor-id`: <a id="api_irtcengine_addvideowatermark2__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/screencapture.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 36
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_screencapture"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__scenario"></a>
  - L33 `legacy-anchor-id`: <a id="api_irtcengine_queryscreencapturecapability__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="api_irtcengine_setexternalmediaprojection"></a>
  - L51 `legacy-anchor-id`: <a id="api_irtcengine_setexternalmediaprojection__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/video-basic.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 135
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_basic"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__timing"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__related"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_disablevideo__return_values"></a>
  - L53 `legacy-anchor-id`: <a id="api_irtcengine_enablelocalvideo"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/video-custom-capturenrendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_custom_capturenrendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_createcustomvideotrack__return_values"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack__prototype"></a>
  - L49 `legacy-anchor-id`: <a id="api_irtcengine_destroycustomvideotrack__detailed_desc"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/video-encoded.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 11
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_encoded"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__detailed_desc"></a>
  - L27 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__parameters"></a>
  - L35 `legacy-anchor-id`: <a id="api_irtcengine_registervideoencodedframeobserver__return_values"></a>
  - L45 `legacy-anchor-id`: <a id="callback_ivideoencodedframeobserver_onencodedvideoframereceived"></a>
  - L51 `legacy-anchor-id`: <a id="callback_ivideoencodedframeobserver_onencodedvideoframereceived__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/video-raw.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 47
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_raw"></a>
  - L7 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied"></a>
  - L13 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__detailed_desc"></a>
  - L28 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__timing"></a>
  - L34 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getmirrorapplied__return_values"></a>
  - L46 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getobservedframeposition"></a>
  - L52 `legacy-anchor-id`: <a id="api_ivideoframeobserver_getobservedframeposition__prototype"></a>

### zh-CN/api-reference/rtc/android/4.6.0/video/video-rendering.mdx

- Statuses: `needs-anchor-normalization`
- Severity: medium
- Effort: low
- Patterns:
  - `legacy-anchor-id`: 93
- Samples:
  - L5 `legacy-anchor-id`: <a id="toc_video_rendering"></a>
  - L7 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering"></a>
  - L13 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__prototype"></a>
  - L19 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__detailed_desc"></a>
  - L31 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__scenario"></a>
  - L37 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__timing"></a>
  - L43 `legacy-anchor-id`: <a id="api_irtcengine_enableinstantmediarendering__return_values"></a>
  - L54 `legacy-anchor-id`: <a id="api_irtcengine_setlocalrendermode1"></a>

### zh-CN/best-practices/geofencing.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 11
  - `raw-html:p`: 2
- Samples:
  - L12 `raw-html:p`: | 北美 | 新加坡 | 北美 | 可能受到较大影响。由于指定区域与 App 用户所在区域之间存在跨区域公共互联网，公共互联网网络质量较差会导致音视频体验受到影响。<p>如果指定区域的服务器都不可用，服务会直接报错。</p> |
  - L35 `inline-html:br`: | `area` | String | 是 | 允许访问的区域。可选以下值：<br />- `GLOBAL`：全球<br />- `NORTH_AMERICA`：北美<br />- `EUROPE`：欧洲<br />- `ASIA`：亚洲<br />- `INDIA`：印度<br />- `JAPAN`：日本 |
  - L36 `inline-html:br`: | `exclude_area` | String | 否 | 排除的区域。仅当 `area` 为 `GLOBAL` 时可用。可选以下值：<br />- `NORTH_AMERICA`：北美<br />- `EUROPE`：欧洲<br />- `ASIA`：亚洲<br />- `INDIA`：印度<br />- `JAPAN`：日本 |

### zh-CN/best-practices/governance.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 10
- Samples:
  - L6 `raw-html:div`: <div id="rm-console"></div>
  - L12 `raw-html:div`: <div id="rm-analytics"></div>
  - L18 `raw-html:div`: <div id="rm-status-page"></div>
  - L24 `raw-html:div`: <div id="rm-billing-quotas"></div>
  - L30 `raw-html:div`: <div id="rm-auth-security"></div>

### zh-CN/best-practices/opt-latency.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L22 `inline-html:br`: | **LLM** | `llm_ttfb` / `llm_ttfs` | TTFB: Time To First Byte，首字节延迟<br/>TTFS: Time To First Sentence，首句延迟 | 250-1000 ms |

### zh-CN/introduction/index.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Components: CapabilityMatrix (1), OverviewSpotlightCard (6), OverviewSpotlightGrid (4), OverviewToolkits (2), ToolkitGroup (10), ToolkitItem (17)
- Patterns:
  - `raw-html:div`: 2
- Samples:
  - L31 `raw-html:div`: <div className="not-prose my-6">
  - L38 `raw-html:div`: </div>

### zh-CN/realtime-media/foundation-realtime.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 10
- Samples:
  - L6 `raw-html:div`: <div id="rm-rtc"></div>
  - L12 `raw-html:div`: <div id="rm-rtm"></div>
  - L18 `raw-html:div`: <div id="rm-im"></div>
  - L24 `raw-html:div`: <div id="rm-speech-to-text"></div>
  - L30 `raw-html:div`: <div id="rm-rtsa"></div>

### zh-CN/realtime-media/media-processing-and-distribution.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 16
- Samples:
  - L6 `raw-html:div`: <div id="rm-cloud-recording"></div>
  - L16 `raw-html:div`: <div id="rm-local-recording"></div>
  - L22 `raw-html:div`: <div id="rm-media-push"></div>
  - L28 `raw-html:div`: <div id="rm-media-pull"></div>
  - L34 `raw-html:div`: <div id="rm-cloud-transcoding"></div>
  - L44 `raw-html:div`: <div id="rm-rtmp-gateway"></div>
  - L50 `raw-html:div`: <div id="rm-fusion-cdn"></div>
  - L56 `raw-html:div`: <div id="rm-ppt-conversion"></div>

### zh-CN/realtime-media/server-and-extensions.md

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `raw-html:div`: 6
- Samples:
  - L6 `raw-html:div`: <div id="rm-rtc-server-sdk"></div>
  - L12 `raw-html:div`: <div id="rm-sdk-extension"></div>
  - L18 `raw-html:div`: <div id="rm-marketplace"></div>

### zh-CN/realtime-media/speech-to-text/audio-modality.mdx

- Statuses: `manual-html-review`
- Severity: medium
- Effort: medium
- Patterns:
  - `inline-html:br`: 1
- Samples:
  - L55 `inline-html:br`: | 音频数据 (`data`) | 经过 Base64 编码的 PCM 字节流数组 | - 具备音频处理能力的 LLM 生成<br />- 自定义音频处理服务生成 | 直接播放音频 |
