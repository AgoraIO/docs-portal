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
      activeTab: 'api-reference',
      body: {
        kind: 'openapi',
      },
      markdownUrl:
        '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
      title: 'Start a conversational AI agent',
    });
  });
});
