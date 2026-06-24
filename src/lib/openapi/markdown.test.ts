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
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/api-ref/conversational-ai/join)',
    );
    expect(markdown).toContain(
      '- OpenAPI: /openapi/conversational-ai/rest-api.en.yaml',
    );
    expect(markdown).toContain('- Operation ID: start-agent');
    expect(markdown).toContain('- Method: POST');
    expect(markdown).toContain('- Path: /v2/projects/{appid}/join');
  });

  it('resolves published openapi markdown content paths that end in .md', async () => {
    const markdown = await getOpenApiMarkdownByContentPath(
      'en/api-reference/api-ref/conversational-ai/join.md',
    );

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/api-ref/conversational-ai/join)',
    );
  });

  it('does not publish RTC REST markdown for zh-CN', async () => {
    await expect(
      getOpenApiMarkdownByContentPath(
        'en/api-reference/api-ref/rtc/query-channel-list.md',
      ),
    ).resolves.toContain(
      '# Query the channel list (/en/api-reference/api-ref/rtc/query-channel-list)',
    );
    await expect(
      getOpenApiMarkdownByContentPath(
        'zh-CN/api-reference/api-ref/rtc/query-channel-list.md',
      ),
    ).resolves.toBeNull();
  });
});
