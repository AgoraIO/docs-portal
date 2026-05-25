import convoAiOpenApiYaml from '../../../content/openapi/conversational-ai/convoai.yaml?raw';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/conversational-ai/convoai.yaml': convoAiOpenApiYaml,
};

export function getOpenApiSourceText(lane: OpenApiLane) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
