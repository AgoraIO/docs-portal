import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type BuildExpectation = { productPath: string; pages: string[] };
type Migration = { productPath: string; oldRelativePath: string; newRelativePath: string; oldUrl: string; newUrl: string };

const contentRoot = resolve(process.cwd(), 'content/docs/zh-CN');

const buildExpectations: BuildExpectation[] = [
  { productPath: "realtime-media/meeting", pages: ["enable-service","http-token-auth","generate-token","configure-meeting","high-availability"] },
  { productPath: "realtime-media/media-pull", pages: ["enable-service","http-basic-auth","call-api","ensure-player-created","enable-event-notification","checklist","rest-availability"] },
  { productPath: "realtime-media/rtmp-gateway", pages: ["enable-service","http-auth","call-api","rtmp-domain-switch","enable-ncs","checklist","rest-availability"] },
  { productPath: "realtime-media/transcoding", pages: ["enable-service","http-auth","call-api","enable-multiple-bitrate","enable-event-notification","check-service","rest-availability"] },
  { productPath: "realtime-media/rtc-server-sdk", pages: ["enable-service","send-receive","string-uid","mix-video","encryption","cloud-proxy","set-region"] },
  { productPath: "realtime-media/fusion-cdn", pages: ["enable-service","http-hmac-auth","obs-config","streaming-url","stream-recording","enable-ncs","analytics","rest-availability"] },
  { productPath: "solutions/art-class", pages: ["enable-service","brightness-correction","trapezoid-correction"] },
  { productPath: "solutions/chatroom/sdk", pages: ["enable-service","quick-integration","mic-seat-management","set-audio"] },
  { productPath: "solutions/chatroom/uikit", pages: ["enable-service","run-github-project","run-github-project-backend","quick-integration"] },
  { productPath: "solutions/game-voice", pages: ["enable-service","audio-experience-optimization","spatial-audio-sdk","spatial-audio-wwise"] },
  { productPath: "solutions/meta-world", pages: ["enable-service","demo","metachat","metalive","mixed-scenario","dress-face","share-audio-video","spatial-audio"] },
  { productPath: "solutions/smart-camera", pages: ["enable-service","amazon-alexa","google-assistant"] },
  { productPath: "solutions/teleoperation", pages: ["enable-service","device-linux","operator-linux","operator-android"] },
  { productPath: "solutions/voip-call", pages: ["enable-service","http-basic-auth","license","set-source-sink","receive-webhook"] },
];

const migrations: Migration[] = [
  { productPath: "realtime-media/meeting", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/meeting/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/meeting/build/enable-service" },
  { productPath: "realtime-media/meeting", oldRelativePath: "build/customize-and-extend/http-token-auth.mdx", newRelativePath: "build/http-token-auth.mdx", oldUrl: "/zh-CN/realtime-media/meeting/build/customize-and-extend/http-token-auth", newUrl: "/zh-CN/realtime-media/meeting/build/http-token-auth" },
  { productPath: "realtime-media/meeting", oldRelativePath: "build/customize-and-extend/generate-token.mdx", newRelativePath: "build/generate-token.mdx", oldUrl: "/zh-CN/realtime-media/meeting/build/customize-and-extend/generate-token", newUrl: "/zh-CN/realtime-media/meeting/build/generate-token" },
  { productPath: "realtime-media/meeting", oldRelativePath: "build/manage-classroom/configure-meeting.mdx", newRelativePath: "build/configure-meeting.mdx", oldUrl: "/zh-CN/realtime-media/meeting/build/manage-classroom/configure-meeting", newUrl: "/zh-CN/realtime-media/meeting/build/configure-meeting" },
  { productPath: "realtime-media/meeting", oldRelativePath: "build/manage-classroom/high-availability.mdx", newRelativePath: "build/high-availability.mdx", oldUrl: "/zh-CN/realtime-media/meeting/build/manage-classroom/high-availability", newUrl: "/zh-CN/realtime-media/meeting/build/high-availability" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/media-pull/build/enable-service" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/setup-and-access/http-basic-auth.mdx", newRelativePath: "build/http-basic-auth.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/setup-and-access/http-basic-auth", newUrl: "/zh-CN/realtime-media/media-pull/build/http-basic-auth" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/setup-and-access/call-api.mdx", newRelativePath: "build/call-api.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/setup-and-access/call-api", newUrl: "/zh-CN/realtime-media/media-pull/build/call-api" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/optimize-and-operate/ensure-player-created.mdx", newRelativePath: "build/ensure-player-created.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/optimize-and-operate/ensure-player-created", newUrl: "/zh-CN/realtime-media/media-pull/build/ensure-player-created" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/monitor-events/enable-event-notification.mdx", newRelativePath: "build/enable-event-notification.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/monitor-events/enable-event-notification", newUrl: "/zh-CN/realtime-media/media-pull/build/enable-event-notification" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/optimize-and-operate/checklist.mdx", newRelativePath: "build/checklist.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/optimize-and-operate/checklist", newUrl: "/zh-CN/realtime-media/media-pull/build/checklist" },
  { productPath: "realtime-media/media-pull", oldRelativePath: "build/optimize-and-operate/rest-availability.mdx", newRelativePath: "build/rest-availability.mdx", oldUrl: "/zh-CN/realtime-media/media-pull/build/optimize-and-operate/rest-availability", newUrl: "/zh-CN/realtime-media/media-pull/build/rest-availability" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/enable-service" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/setup-and-access/http-auth.mdx", newRelativePath: "build/http-auth.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/setup-and-access/http-auth", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/http-auth" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/setup-and-access/call-api.mdx", newRelativePath: "build/call-api.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/setup-and-access/call-api", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/call-api" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/manage-media-streams/rtmp-domain-switch.mdx", newRelativePath: "build/rtmp-domain-switch.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/manage-media-streams/rtmp-domain-switch", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/rtmp-domain-switch" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/monitor-events/enable-ncs.mdx", newRelativePath: "build/enable-ncs.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/monitor-events/enable-ncs", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/enable-ncs" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/optimize-and-operate/checklist.mdx", newRelativePath: "build/checklist.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/optimize-and-operate/checklist", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/checklist" },
  { productPath: "realtime-media/rtmp-gateway", oldRelativePath: "build/optimize-and-operate/rest-availability.mdx", newRelativePath: "build/rest-availability.mdx", oldUrl: "/zh-CN/realtime-media/rtmp-gateway/build/optimize-and-operate/rest-availability", newUrl: "/zh-CN/realtime-media/rtmp-gateway/build/rest-availability" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/transcoding/build/enable-service" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/setup-and-access/http-auth.mdx", newRelativePath: "build/http-auth.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/setup-and-access/http-auth", newUrl: "/zh-CN/realtime-media/transcoding/build/http-auth" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/setup-and-access/call-api.mdx", newRelativePath: "build/call-api.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/setup-and-access/call-api", newUrl: "/zh-CN/realtime-media/transcoding/build/call-api" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/setup-and-access/enable-multiple-bitrate.mdx", newRelativePath: "build/enable-multiple-bitrate.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/setup-and-access/enable-multiple-bitrate", newUrl: "/zh-CN/realtime-media/transcoding/build/enable-multiple-bitrate" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/monitor-events/enable-event-notification.mdx", newRelativePath: "build/enable-event-notification.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/monitor-events/enable-event-notification", newUrl: "/zh-CN/realtime-media/transcoding/build/enable-event-notification" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/optimize-and-operate/check-service.mdx", newRelativePath: "build/check-service.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/optimize-and-operate/check-service", newUrl: "/zh-CN/realtime-media/transcoding/build/check-service" },
  { productPath: "realtime-media/transcoding", oldRelativePath: "build/optimize-and-operate/rest-availability.mdx", newRelativePath: "build/rest-availability.mdx", oldUrl: "/zh-CN/realtime-media/transcoding/build/optimize-and-operate/rest-availability", newUrl: "/zh-CN/realtime-media/transcoding/build/rest-availability" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/enable-service" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/implement-core-features/send-receive.mdx", newRelativePath: "build/send-receive.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/implement-core-features/send-receive", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/send-receive" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/implement-core-features/string-uid.mdx", newRelativePath: "build/string-uid.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/implement-core-features/string-uid", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/string-uid" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/implement-core-features/mix-video.mdx", newRelativePath: "build/mix-video.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/implement-core-features/mix-video", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/mix-video" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/implement-core-features/encryption.mdx", newRelativePath: "build/encryption.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/implement-core-features/encryption", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/encryption" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/setup-and-access/cloud-proxy.mdx", newRelativePath: "build/cloud-proxy.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/setup-and-access/cloud-proxy", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/cloud-proxy" },
  { productPath: "realtime-media/rtc-server-sdk", oldRelativePath: "build/setup-and-access/set-region.mdx", newRelativePath: "build/set-region.mdx", oldUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/setup-and-access/set-region", newUrl: "/zh-CN/realtime-media/rtc-server-sdk/build/set-region" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/setup-and-access/enable-service", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/enable-service" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/setup-and-access/http-hmac-auth.mdx", newRelativePath: "build/http-hmac-auth.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/setup-and-access/http-hmac-auth", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/http-hmac-auth" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/setup-and-access/obs-config.mdx", newRelativePath: "build/obs-config.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/setup-and-access/obs-config", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/obs-config" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/manage-media-streams/streaming-url.mdx", newRelativePath: "build/streaming-url.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/manage-media-streams/streaming-url", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/streaming-url" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/optimize-and-operate/stream-recording.mdx", newRelativePath: "build/stream-recording.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/optimize-and-operate/stream-recording", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/stream-recording" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/monitor-events/enable-ncs.mdx", newRelativePath: "build/enable-ncs.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/monitor-events/enable-ncs", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/enable-ncs" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/optimize-and-operate/analytics.mdx", newRelativePath: "build/analytics.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/optimize-and-operate/analytics", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/analytics" },
  { productPath: "realtime-media/fusion-cdn", oldRelativePath: "build/optimize-and-operate/rest-availability.mdx", newRelativePath: "build/rest-availability.mdx", oldUrl: "/zh-CN/realtime-media/fusion-cdn/build/optimize-and-operate/rest-availability", newUrl: "/zh-CN/realtime-media/fusion-cdn/build/rest-availability" },
  { productPath: "solutions/art-class", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/art-class/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/art-class/build/enable-service" },
  { productPath: "solutions/art-class", oldRelativePath: "build/customize-and-extend/brightness-correction.mdx", newRelativePath: "build/brightness-correction.mdx", oldUrl: "/zh-CN/solutions/art-class/build/customize-and-extend/brightness-correction", newUrl: "/zh-CN/solutions/art-class/build/brightness-correction" },
  { productPath: "solutions/art-class", oldRelativePath: "build/customize-and-extend/trapezoid-correction.mdx", newRelativePath: "build/trapezoid-correction.mdx", oldUrl: "/zh-CN/solutions/art-class/build/customize-and-extend/trapezoid-correction", newUrl: "/zh-CN/solutions/art-class/build/trapezoid-correction" },
  { productPath: "solutions/chatroom/sdk", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/chatroom/sdk/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/chatroom/sdk/build/enable-service" },
  { productPath: "solutions/chatroom/sdk", oldRelativePath: "build/implement-core-features/quick-integration.mdx", newRelativePath: "build/quick-integration.mdx", oldUrl: "/zh-CN/solutions/chatroom/sdk/build/implement-core-features/quick-integration", newUrl: "/zh-CN/solutions/chatroom/sdk/build/quick-integration" },
  { productPath: "solutions/chatroom/sdk", oldRelativePath: "build/implement-core-features/mic-seat-management.mdx", newRelativePath: "build/mic-seat-management.mdx", oldUrl: "/zh-CN/solutions/chatroom/sdk/build/implement-core-features/mic-seat-management", newUrl: "/zh-CN/solutions/chatroom/sdk/build/mic-seat-management" },
  { productPath: "solutions/chatroom/sdk", oldRelativePath: "build/implement-core-features/set-audio.mdx", newRelativePath: "build/set-audio.mdx", oldUrl: "/zh-CN/solutions/chatroom/sdk/build/implement-core-features/set-audio", newUrl: "/zh-CN/solutions/chatroom/sdk/build/set-audio" },
  { productPath: "solutions/chatroom/uikit", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/chatroom/uikit/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/chatroom/uikit/build/enable-service" },
  { productPath: "solutions/chatroom/uikit", oldRelativePath: "build/implement-core-features/run-github-project.mdx", newRelativePath: "build/run-github-project.mdx", oldUrl: "/zh-CN/solutions/chatroom/uikit/build/implement-core-features/run-github-project", newUrl: "/zh-CN/solutions/chatroom/uikit/build/run-github-project" },
  { productPath: "solutions/chatroom/uikit", oldRelativePath: "build/implement-core-features/run-github-project-backend.mdx", newRelativePath: "build/run-github-project-backend.mdx", oldUrl: "/zh-CN/solutions/chatroom/uikit/build/implement-core-features/run-github-project-backend", newUrl: "/zh-CN/solutions/chatroom/uikit/build/run-github-project-backend" },
  { productPath: "solutions/chatroom/uikit", oldRelativePath: "build/implement-core-features/quick-integration.mdx", newRelativePath: "build/quick-integration.mdx", oldUrl: "/zh-CN/solutions/chatroom/uikit/build/implement-core-features/quick-integration", newUrl: "/zh-CN/solutions/chatroom/uikit/build/quick-integration" },
  { productPath: "solutions/game-voice", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/game-voice/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/game-voice/build/enable-service" },
  { productPath: "solutions/game-voice", oldRelativePath: "build/implement-core-features/audio-experience-optimization.mdx", newRelativePath: "build/audio-experience-optimization.mdx", oldUrl: "/zh-CN/solutions/game-voice/build/implement-core-features/audio-experience-optimization", newUrl: "/zh-CN/solutions/game-voice/build/audio-experience-optimization" },
  { productPath: "solutions/game-voice", oldRelativePath: "build/customize-and-extend/spatial-audio-sdk.mdx", newRelativePath: "build/spatial-audio-sdk.mdx", oldUrl: "/zh-CN/solutions/game-voice/build/customize-and-extend/spatial-audio-sdk", newUrl: "/zh-CN/solutions/game-voice/build/spatial-audio-sdk" },
  { productPath: "solutions/game-voice", oldRelativePath: "build/customize-and-extend/spatial-audio-wwise.mdx", newRelativePath: "build/spatial-audio-wwise.mdx", oldUrl: "/zh-CN/solutions/game-voice/build/customize-and-extend/spatial-audio-wwise", newUrl: "/zh-CN/solutions/game-voice/build/spatial-audio-wwise" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/meta-world/build/enable-service" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/implement-core-features/demo.mdx", newRelativePath: "build/demo.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/implement-core-features/demo", newUrl: "/zh-CN/solutions/meta-world/build/demo" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/implement-core-features/metachat.mdx", newRelativePath: "build/metachat.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/implement-core-features/metachat", newUrl: "/zh-CN/solutions/meta-world/build/metachat" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/implement-core-features/metalive.mdx", newRelativePath: "build/metalive.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/implement-core-features/metalive", newUrl: "/zh-CN/solutions/meta-world/build/metalive" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/implement-core-features/mixed-scenario.mdx", newRelativePath: "build/mixed-scenario.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/implement-core-features/mixed-scenario", newUrl: "/zh-CN/solutions/meta-world/build/mixed-scenario" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/customize-and-extend/dress-face.mdx", newRelativePath: "build/dress-face.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/customize-and-extend/dress-face", newUrl: "/zh-CN/solutions/meta-world/build/dress-face" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/customize-and-extend/share-audio-video.mdx", newRelativePath: "build/share-audio-video.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/customize-and-extend/share-audio-video", newUrl: "/zh-CN/solutions/meta-world/build/share-audio-video" },
  { productPath: "solutions/meta-world", oldRelativePath: "build/customize-and-extend/spatial-audio.mdx", newRelativePath: "build/spatial-audio.mdx", oldUrl: "/zh-CN/solutions/meta-world/build/customize-and-extend/spatial-audio", newUrl: "/zh-CN/solutions/meta-world/build/spatial-audio" },
  { productPath: "solutions/smart-camera", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/smart-camera/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/smart-camera/build/enable-service" },
  { productPath: "solutions/smart-camera", oldRelativePath: "build/value-added-feature/amazon-alexa.mdx", newRelativePath: "build/amazon-alexa.mdx", oldUrl: "/zh-CN/solutions/smart-camera/build/value-added-feature/amazon-alexa", newUrl: "/zh-CN/solutions/smart-camera/build/amazon-alexa" },
  { productPath: "solutions/smart-camera", oldRelativePath: "build/value-added-feature/google-assistant.mdx", newRelativePath: "build/google-assistant.mdx", oldUrl: "/zh-CN/solutions/smart-camera/build/value-added-feature/google-assistant", newUrl: "/zh-CN/solutions/smart-camera/build/google-assistant" },
  { productPath: "solutions/teleoperation", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/teleoperation/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/teleoperation/build/enable-service" },
  { productPath: "solutions/teleoperation", oldRelativePath: "build/implement-core-features/device-linux.mdx", newRelativePath: "build/device-linux.mdx", oldUrl: "/zh-CN/solutions/teleoperation/build/implement-core-features/device-linux", newUrl: "/zh-CN/solutions/teleoperation/build/device-linux" },
  { productPath: "solutions/teleoperation", oldRelativePath: "build/implement-core-features/operator-linux.mdx", newRelativePath: "build/operator-linux.mdx", oldUrl: "/zh-CN/solutions/teleoperation/build/implement-core-features/operator-linux", newUrl: "/zh-CN/solutions/teleoperation/build/operator-linux" },
  { productPath: "solutions/teleoperation", oldRelativePath: "build/implement-core-features/operator-android.mdx", newRelativePath: "build/operator-android.mdx", oldUrl: "/zh-CN/solutions/teleoperation/build/implement-core-features/operator-android", newUrl: "/zh-CN/solutions/teleoperation/build/operator-android" },
  { productPath: "solutions/voip-call", oldRelativePath: "build/setup-and-access/enable-service.mdx", newRelativePath: "build/enable-service.mdx", oldUrl: "/zh-CN/solutions/voip-call/build/setup-and-access/enable-service", newUrl: "/zh-CN/solutions/voip-call/build/enable-service" },
  { productPath: "solutions/voip-call", oldRelativePath: "build/setup-and-access/http-basic-auth.mdx", newRelativePath: "build/http-basic-auth.mdx", oldUrl: "/zh-CN/solutions/voip-call/build/setup-and-access/http-basic-auth", newUrl: "/zh-CN/solutions/voip-call/build/http-basic-auth" },
  { productPath: "solutions/voip-call", oldRelativePath: "build/setup-and-access/license.mdx", newRelativePath: "build/license.mdx", oldUrl: "/zh-CN/solutions/voip-call/build/setup-and-access/license", newUrl: "/zh-CN/solutions/voip-call/build/license" },
  { productPath: "solutions/voip-call", oldRelativePath: "build/customize-and-extend/set-source-sink.mdx", newRelativePath: "build/set-source-sink.mdx", oldUrl: "/zh-CN/solutions/voip-call/build/customize-and-extend/set-source-sink", newUrl: "/zh-CN/solutions/voip-call/build/set-source-sink" },
  { productPath: "solutions/voip-call", oldRelativePath: "build/monitor-events/receive-webhook.mdx", newRelativePath: "build/receive-webhook.mdx", oldUrl: "/zh-CN/solutions/voip-call/build/monitor-events/receive-webhook", newUrl: "/zh-CN/solutions/voip-call/build/receive-webhook" },
];

const readMeta = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as { pages?: unknown[] };
const pathFor = (productPath: string, relativePath: string) => resolve(contentRoot, productPath, relativePath);
const parseOldUrl = (url: string) => {
  const [, locale, tab, ...segments] = url.split('/');
  expect(locale).toBe('zh-CN');
  expect(['realtime-media', 'solutions']).toContain(tab);
  return { locale, tab, segments };
};

 describe('zh-CN small Build flat IA migration invariants', () => {
  it.each(buildExpectations)('$productPath has the exact direct Build pages order', ({ productPath, pages }) => {
    const actual = readMeta(pathFor(productPath, 'build/meta.json')).pages;
    expect(actual).toEqual(pages);
    expect(actual?.every((entry) => typeof entry === 'string' && !entry.includes('/'))).toBe(true);
  });

  it.each(migrations)('$productPath $oldRelativePath has moved to its final canonical file', ({ productPath, oldRelativePath, newRelativePath }) => {
    expect(existsSync(pathFor(productPath, newRelativePath))).toBe(true);
    expect(existsSync(pathFor(productPath, oldRelativePath))).toBe(false);
  });

  it.each(migrations)('$productPath $oldRelativePath leaves no source files in its old directory', ({ productPath, oldRelativePath }) => {
    const oldDirectory = pathFor(productPath, oldRelativePath.split('/').slice(0, -1).join('/'));
    if (!existsSync(oldDirectory)) {
      return;
    }
    const residual = readdirSync(oldDirectory, { withFileTypes: true, recursive: true })
      .filter((entry) => entry.isFile() && /\.(?:md|mdx|json)$/.test(entry.name))
      .map((entry) => entry.name);
    expect(residual).toEqual([]);
  });

  it.each(buildExpectations)('$productPath has only the approved flat Build files', ({ productPath, pages }) => {
    const buildRoot = pathFor(productPath, 'build');
    const expectedNames = ['meta.json', ...pages.map((page) => `${page}.mdx`)].sort();
    const actualEntries = readdirSync(buildRoot, { withFileTypes: true })
      .filter((entry) => entry.name !== '.DS_Store');
    const actualNames = actualEntries
      .map((entry) => entry.name)
      .sort();
    expect(actualNames).toEqual(expectedNames);
    expect(actualEntries.every((entry) => entry.isFile())).toBe(true);
  });

  it.each(migrations)('$productPath $oldRelativePath ($oldUrl) redirects directly to $newUrl with HTTP 301', async ({ productPath, oldRelativePath, oldUrl, newUrl }) => {
    const { locale, tab, segments } = parseOldUrl(oldUrl);
    await expect(loadDocsPagePayload(locale, tab, segments)).resolves.toEqual({ redirectUrl: newUrl, statusCode: 301 });
  });

  it('keeps every Build sidebar entry as a direct page, never a group object', () => {
    for (const { productPath, pages } of buildExpectations) {
      const actual = readMeta(pathFor(productPath, 'build/meta.json')).pages;
      expect(actual).toEqual(pages);
      expect(actual?.every((entry) => typeof entry === 'string')).toBe(true);
      expect(actual?.some((entry) => typeof entry === 'object')).toBe(false);
    }
  });

  it('uses the flattened Meta World Build targets in both platform card groups', () => {
    const page = readFileSync(
      pathFor('solutions/meta-world', 'get-started/integrate-sdk.mdx'),
      'utf8',
    );

    for (const slug of ['metachat', 'metalive', 'mixed-scenario']) {
      expect(page.match(new RegExp(`href="../build/${slug}"`, 'g'))).toHaveLength(
        2,
      );
    }
  });
});
