import whiteboardRestZhCnYaml from '../../../content/openapi/whiteboard/restful-wb.zh-CN.yaml?raw';
import voipCallkitRestZhCnYaml from '../../../content/openapi/voip-callkit/call.zh-CN.yaml?raw';
import rtcRestZhCnYaml from '../../../content/openapi/rtc/channel-management.zh-CN.yaml?raw';
import pptConversionRestZhCnYaml from '../../../content/openapi/ppt-conversion-service/rest-api.zh-CN.yaml?raw';
import mediaPushRestZhCnYaml from '../../../content/openapi/media-push/media-push.zh-CN.yaml?raw';
import mediaPullRestZhCnYaml from '../../../content/openapi/media-pull/media-pull.zh-CN.yaml?raw';
import mediaGatewayRestZhCnYaml from '../../../content/openapi/media-gateway/media-gateway.zh-CN.yaml?raw';
import fusionCdnRestZhCnYaml from '../../../content/openapi/fusion-cdn/streaming.zh-CN.yaml?raw';
import danmakuRestZhCnYaml from '../../../content/openapi/danmaku/danmaku.zh-CN.yaml?raw';
import consoleRestZhCnYaml from '../../../content/openapi/console/rest-api.zh-CN.yaml?raw';
import cloudTranscodingRestZhCnYaml from '../../../content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml?raw';
import agoraAnalyticsRestZhCnYaml from '../../../content/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml?raw';
import channelManagementBanUserPrivilegesEnYaml from '../../../content/openapi/channel-management/ban-user-privileges.en.yaml?raw';
import channelManagementMessageNotificationServiceEnYaml from '../../../content/openapi/channel-management/message-notification-service.en.yaml?raw';
import channelManagementQueryChannelInformationEnYaml from '../../../content/openapi/channel-management/query-channel-information.en.yaml?raw';
import cloudRecordingRestEnYaml from '../../../content/openapi/cloud-recording/cloud-recording.en.yaml?raw';
import cloudRecordingRestZhCnYaml from '../../../content/openapi/cloud-recording/cloud-recording.zh-CN.yaml?raw';
import cloudTranscodingRestEnYaml from '../../../content/openapi/cloud-transcoding/cloud-transcoding.en.yaml?raw';
import convoAiRestEnYaml from '../../../content/openapi/conversational-ai/rest-api.en.yaml?raw';
import convoAiRestZhCnYaml from '../../../content/openapi/conversational-ai/rest-api.zh-CN.yaml?raw';
import mediaGatewayRestEnYaml from '../../../content/openapi/media-gateway/media-gateway.en.yaml?raw';
import rtcRestEnYaml from '../../../content/openapi/rtc/channel-management.en.yaml?raw';
import signalingRestEnYaml from '../../../content/openapi/rtm/signaling-rest.en.yaml?raw';
import speechToTextEnYaml from '../../../content/openapi/speech-to-text/v7.en.yaml?raw';
import speechToTextYaml from '../../../content/openapi/speech-to-text/v7.yaml?raw';
import speechToTextZhCnYaml from '../../../content/openapi/speech-to-text/v7.zh-CN.yaml?raw';
import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/whiteboard/restful-wb.zh-CN.yaml': whiteboardRestZhCnYaml,
  'content/openapi/voip-callkit/call.zh-CN.yaml': voipCallkitRestZhCnYaml,
  'content/openapi/rtc/channel-management.zh-CN.yaml': rtcRestZhCnYaml,
  'content/openapi/ppt-conversion-service/rest-api.zh-CN.yaml':
    pptConversionRestZhCnYaml,
  'content/openapi/media-push/media-push.zh-CN.yaml': mediaPushRestZhCnYaml,
  'content/openapi/media-pull/media-pull.zh-CN.yaml': mediaPullRestZhCnYaml,
  'content/openapi/media-gateway/media-gateway.zh-CN.yaml':
    mediaGatewayRestZhCnYaml,
  'content/openapi/fusion-cdn/streaming.zh-CN.yaml': fusionCdnRestZhCnYaml,
  'content/openapi/danmaku/danmaku.zh-CN.yaml': danmakuRestZhCnYaml,
  'content/openapi/console/rest-api.zh-CN.yaml': consoleRestZhCnYaml,
  'content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml':
    cloudTranscodingRestZhCnYaml,
  'content/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml':
    agoraAnalyticsRestZhCnYaml,
  'content/openapi/channel-management/ban-user-privileges.en.yaml':
    channelManagementBanUserPrivilegesEnYaml,
  'content/openapi/channel-management/message-notification-service.en.yaml':
    channelManagementMessageNotificationServiceEnYaml,
  'content/openapi/channel-management/query-channel-information.en.yaml':
    channelManagementQueryChannelInformationEnYaml,
  'content/openapi/conversational-ai/rest-api.en.yaml': convoAiRestEnYaml,
  'content/openapi/conversational-ai/rest-api.zh-CN.yaml': convoAiRestZhCnYaml,
  'content/openapi/cloud-recording/cloud-recording.en.yaml':
    cloudRecordingRestEnYaml,
  'content/openapi/cloud-recording/cloud-recording.zh-CN.yaml':
    cloudRecordingRestZhCnYaml,
  'content/openapi/cloud-transcoding/cloud-transcoding.en.yaml':
    cloudTranscodingRestEnYaml,
  'content/openapi/media-gateway/media-gateway.en.yaml': mediaGatewayRestEnYaml,
  'content/openapi/rtm/signaling-rest.en.yaml': signalingRestEnYaml,
  'content/openapi/rtc/channel-management.en.yaml': rtcRestEnYaml,
  'content/openapi/speech-to-text/v7.en.yaml': speechToTextEnYaml,
  'content/openapi/speech-to-text/v7.yaml': speechToTextYaml,
  'content/openapi/speech-to-text/v7.zh-CN.yaml': speechToTextZhCnYaml,
};

export function getBundledOpenApiSourcePaths() {
  return Object.keys(OPENAPI_SOURCE_TEXT);
}

export function getOpenApiSourceText(lane: OpenApiLane, locale: AppLocale) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath[locale]];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
