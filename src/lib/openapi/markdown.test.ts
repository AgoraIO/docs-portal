import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import {
  getOpenApiMarkdownByContentPath,
  serializeOpenApiOperationMarkdown,
} from './markdown';
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
      publicSourceUrl: OPENAPI_LANES[0].publicSourceUrl.en,
      title: 'Start a conversational AI agent',
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/join)',
    );
    expect(markdown).toContain(
      '- OpenAPI: /openapi/conversational-ai/convoai.en.yaml',
    );
    expect(markdown).toContain('- Operation ID: start-agent');
    expect(markdown).toContain('- Method: POST');
    expect(markdown).toContain('- Path: /v2/projects/{appid}/join');
  });

  it('resolves published openapi markdown content paths that end in .md', async () => {
    const markdown = await getOpenApiMarkdownByContentPath(
      'en/api-reference/conversational-ai/rest-api/agent/join.md',
    );

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/join)',
    );
  });
});
