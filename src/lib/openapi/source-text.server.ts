import convoAiOpenApiEnYaml from '../../../content/openapi/conversational-ai/convoai.en.yaml?raw';
import convoAiOpenApiZhCnYaml from '../../../content/openapi/conversational-ai/convoai.zh-CN.yaml?raw';
import mediaGatewayRestEnYaml from '../../../content/openapi/media-gateway/media-gateway-rest.en.yaml?raw';
import signalingRestEnYaml from '../../../content/openapi/rtm/signaling-rest.en.yaml?raw';
import whiteboardRestEnYaml from '../../../content/openapi/whiteboard/whiteboard-rest.en.yaml?raw';
import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/conversational-ai/convoai.en.yaml': convoAiOpenApiEnYaml,
  'content/openapi/conversational-ai/convoai.zh-CN.yaml':
    convoAiOpenApiZhCnYaml,
  'content/openapi/media-gateway/media-gateway-rest.en.yaml':
    mediaGatewayRestEnYaml,
  'content/openapi/rtm/signaling-rest.en.yaml': signalingRestEnYaml,
  'content/openapi/whiteboard/whiteboard-rest.en.yaml': whiteboardRestEnYaml,
};

export function getOpenApiSourceText(lane: OpenApiLane, locale: AppLocale) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath[locale]];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
