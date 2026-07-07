import { describe, expect, it } from 'vitest';
import { getOpenApiSearchDocuments } from './search';

describe('openapi search documents', () => {
  it('creates searchable endpoint documents', async () => {
    const documents = await getOpenApiSearchDocuments();
    const startAgent = documents.find((doc) => doc.id.includes('start-agent'));

    expect(startAgent).toMatchObject({
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });
    expect(startAgent?.content).toContain('start-agent');
    expect(startAgent?.content).toContain('/v2/projects/{appid}/join');
  });

  it('indexes RTC REST endpoints for each configured locale lane', async () => {
    const documents = await getOpenApiSearchDocuments();

    expect(
      documents.find((doc) => doc.url === '/en/api-reference/api-ref/rtc/query-channel-list'),
    ).toBeDefined();
    expect(
      documents.find((doc) => doc.url === '/zh-CN/api-reference/api-ref/rtc/query-channel-list'),
    ).toBeDefined();
  });
});
