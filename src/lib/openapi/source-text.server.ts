import convoAiRestEnYaml from '../../../content/openapi/conversational-ai/rest-api.en.yaml?raw';
import cloudRecordingRestEnYaml from '../../../content/openapi/cloud-recording/cloud-recording.en.yaml?raw';
import cloudTranscodingRestEnYaml from '../../../content/openapi/cloud-transcoding/cloud-transcoding.en.yaml?raw';
import signalingRestEnYaml from '../../../content/openapi/rtm/signaling-rest.en.yaml?raw';
import speechToTextEnYaml from '../../../content/openapi/speech-to-text/v7.en.yaml?raw';
import speechToTextZhCnYaml from '../../../content/openapi/speech-to-text/v7.zh-CN.yaml?raw';
import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/conversational-ai/rest-api.en.yaml': convoAiRestEnYaml,
  'content/openapi/cloud-recording/cloud-recording.en.yaml':
    cloudRecordingRestEnYaml,
  'content/openapi/cloud-transcoding/cloud-transcoding.en.yaml':
    cloudTranscodingRestEnYaml,
  'content/openapi/rtm/signaling-rest.en.yaml': signalingRestEnYaml,
  'content/openapi/speech-to-text/v7.en.yaml': speechToTextEnYaml,
  'content/openapi/speech-to-text/v7.zh-CN.yaml': speechToTextZhCnYaml,
};

export function getOpenApiSourceText(lane: OpenApiLane, locale: AppLocale) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath[locale]];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
