import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import { serializeOpenApiOperationMarkdown } from './markdown';
import { getOpenApiOperation } from './source.server';

describe('openapi markdown serializer', () => {
  it('includes source traceability and operation basics', async () => {
    const operation = await getOpenApiOperation(
      OPENAPI_LANES[0],
      'start-agent',
    );
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation,
      publicSourceUrl: OPENAPI_LANES[0].publicSourceUrl,
      title: 'Start a conversational AI agent',
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/join)',
    );
    expect(markdown).toContain(
      '- OpenAPI: /openapi/conversational-ai/convoai.yaml',
    );
    expect(markdown).toContain('- Operation ID: start-agent');
    expect(markdown).toContain('- Method: POST');
    expect(markdown).toContain('- Path: /v2/projects/{appid}/join');
  });
});
