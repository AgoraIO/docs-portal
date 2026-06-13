import convoAiOpenApiEnYaml from '../../../content/openapi/conversational-ai/convoai.en.yaml?raw';
import convoAiOpenApiZhCnYaml from '../../../content/openapi/conversational-ai/convoai.zh-CN.yaml?raw';
import speechToTextOpenApiEnYaml from '../../../content/openapi/speech-to-text/v7.en.yaml?raw';
import speechToTextOpenApiZhCnYaml from '../../../content/openapi/speech-to-text/v7.zh-CN.yaml?raw';
import type { AppLocale } from '../i18n/i18n-config';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/conversational-ai/convoai.en.yaml': convoAiOpenApiEnYaml,
  'content/openapi/conversational-ai/convoai.zh-CN.yaml':
    convoAiOpenApiZhCnYaml,
  'content/openapi/speech-to-text/v7.en.yaml': speechToTextOpenApiEnYaml,
  'content/openapi/speech-to-text/v7.zh-CN.yaml': speechToTextOpenApiZhCnYaml,
};

export function getOpenApiSourceText(lane: OpenApiLane, locale: AppLocale) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath[locale]];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
