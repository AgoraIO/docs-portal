import { describe, expect, it } from 'vitest';
import { loadOpenApiEndpointPage } from './docs-page.server';

describe('openapi docs page payload', () => {
  it('loads canonical endpoint route payloads', async () => {
    const page = await loadOpenApiEndpointPage('en', 'api-reference', [
      'conversational-ai',
      'rest-api',
      'agent',
      'join',
    ]);

    expect(page).toMatchObject({
      activePath: '/en/api-reference/conversational-ai/rest-api/agent/join',
      body: {
        kind: 'openapi',
        operationPayload: {
          examples: {
            curl: expect.stringContaining('curl -X POST'),
            javascript: expect.stringContaining('fetch('),
          },
          operation: {
            method: 'POST',
            path: '/v2/projects/{appid}/join',
          },
          publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
          requestSchemaRows: expect.arrayContaining([
            expect.objectContaining({ path: expect.any(String) }),
          ]),
        },
      },
      layoutMode: 'openapi',
      markdownUrl:
        '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
      operationId: 'start-agent',
      title: 'Start a conversational AI agent',
      toc: [],
    });
    expect(page?.body.operationPayload).not.toHaveProperty('clientPayload');
  });
});
