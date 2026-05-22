import { describe, expect, it } from 'vitest';
import { getConversationalAiOperation } from './source.server';
import { serializeOpenApiOperationMarkdown } from './markdown';

describe('openapi markdown serializer', () => {
  it('includes source traceability and operation basics', async () => {
    const operation = await getConversationalAiOperation('start-agent');
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation,
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
