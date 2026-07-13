import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import {
  getOpenApiMarkdownByContentPath,
  getOpenApiMarkdownPages,
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

  it('preserves human-visible OpenAPI guidance and examples', async () => {
    const lane = OPENAPI_LANES.find((item) => item.id === 'media-gateway-rest');
    expect(lane).toBeDefined();
    if (!lane) {
      throw new Error('Missing media-gateway-rest OpenAPI lane');
    }

    const operation = await getOpenApiOperation(
      lane,
      'query-media-gateway-streaming-information',
    );
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation,
      publicSourceUrl: lane.publicSourceUrl.en,
      title: 'Query streaming information',
      url: '/en/api-reference/api-ref/rtmp-gateway/query-streaming-information',
    });

    expect(markdown).toContain(
      'This method queries an ongoing push based on SID.',
    );
    expect(markdown).toContain(
      'A streaming session ID is generated for each initiated streaming task.',
    );
    expect(markdown).toContain(
      'The `region` value is the same as for the input source stream.',
    );
    expect(markdown).toContain('Allowed: `na` | `eu` | `ap` | `cn`');
    expect(markdown).toContain('## Authorization');
    expect(markdown).toContain('- `basicAuth`');
    expect(markdown).toContain('## Request examples');
    expect(markdown).toContain('curl --request GET');
    expect(markdown).toContain('## Response examples');
    expect(markdown).toContain('"status": "success"');
  });

  it('preserves grouped request examples', async () => {
    const lane = OPENAPI_LANES.find((item) => item.id === 'convoai');
    expect(lane).toBeDefined();
    if (!lane) {
      throw new Error('Missing conversational AI OpenAPI lane');
    }

    const operation = await getOpenApiOperation(lane, 'start-agent');
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation,
      publicSourceUrl: lane.publicSourceUrl.en,
      title: 'Start a conversational AI agent',
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });

    expect(markdown).toContain('## Request examples');
    expect(markdown).toContain('### Basic configuration');
    expect(markdown).toContain('### Saved agent configuration');
    expect(markdown).toContain('### Advanced configuration');
    expect(markdown).toContain('### String UID');
    expect(markdown).toContain('### MCP server integration');
    expect(markdown).toContain('### Preset models');
    expect(markdown).toContain('full_config_agent');
    expect(markdown).toContain('pipeline_id');
  });

  it('does not append empty-schema markers after leaf fields', () => {
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation: {
        codeSampleGroups: [],
        codeSamples: [],
        docsCallouts: [],
        docsSections: [],
        method: 'GET',
        operationId: 'get-status',
        parameters: [
          {
            docsCallouts: [
              {
                markdown: 'Use the project ID from Agora Console.',
                title: 'Project ID',
                type: 'info',
              },
            ],
            in: 'path',
            name: 'appid',
            required: true,
            schema: { type: 'string' },
          },
        ],
        path: '/status',
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    status: { type: 'string' },
                  },
                  type: 'object',
                },
              },
            },
          },
        },
        servers: [],
      },
      publicSourceUrl: '/openapi/status.yaml',
      title: 'Get status',
      url: '/en/api-reference/status',
    });

    expect(markdown).toContain('- `status` (string)');
    expect(markdown).toContain(
      '  :::info[Project ID]\n  Use the project ID from Agora Console.\n  :::',
    );
    expect(markdown).not.toContain('No schema.');
  });

  it('serializes endpoint, parameter types, and schema constraints', () => {
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation: {
        codeSampleGroups: [],
        codeSamples: [],
        docsCallouts: [],
        docsSections: [],
        method: 'POST',
        operationId: 'create-status',
        parameters: [
          {
            example: 'manual',
            in: 'query',
            name: 'mode',
            required: false,
            schema: {
              default: 'auto',
              enum: ['auto', 'manual'],
              format: 'slug',
              maxLength: 24,
              minLength: 3,
              pattern: '^[a-z]+$',
              type: 'string',
            },
          },
        ],
        path: '/v1/status',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  count: {
                    deprecated: true,
                    exclusiveMaximum: 10,
                    minimum: 1,
                    nullable: true,
                    type: 'integer',
                  },
                  tags: {
                    items: { type: 'string' },
                    maxItems: 8,
                    minItems: 1,
                    type: 'array',
                  },
                },
                type: 'object',
              },
            },
          },
          contentTypes: ['application/json'],
          required: true,
        },
        responses: {},
        servers: [{ url: 'https://api.example.com/' }],
      },
      publicSourceUrl: '/openapi/status.yaml',
      title: 'Create status',
      url: '/en/api-reference/status',
    });

    expect(markdown).toContain('- Endpoint: https://api.example.com/v1/status');
    expect(markdown).toContain('- `mode` (query, optional, string)');
    expect(markdown).toContain('  - Allowed: `auto` | `manual`');
    expect(markdown).toContain('  - Default: `auto`');
    expect(markdown).toContain('  - Format: `slug`');
    expect(markdown).toContain('  - Example: `manual`');
    expect(markdown).toContain('  - Min length: `3`');
    expect(markdown).toContain('  - Max length: `24`');
    expect(markdown).toContain('  - Pattern: `^[a-z]+$`');
    expect(markdown).toContain('  - Range: `[1, 10)`');
    expect(markdown).toContain('- `count` (integer | null, deprecated)');
    expect(markdown).toContain('  - Min items: `1`');
    expect(markdown).toContain('  - Max items: `8`');
  });

  it('places guidance by position and preserves callout semantics', () => {
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation: {
        codeSampleGroups: [],
        codeSamples: [],
        docsCallouts: [
          {
            markdown: 'Check credentials before retrying.',
            position: 'after-parameters',
            title: 'Caution',
            type: 'caution',
          },
        ],
        docsSections: [
          { markdown: 'Description guidance.', position: 'after-description' },
          { markdown: 'Parameter guidance.', position: 'after-parameters' },
          {
            markdown: 'Response body guidance.',
            position: 'before-response-body',
          },
          {
            markdown: 'Response schema guidance.',
            position: 'after-response-body',
          },
          {
            markdown: 'Response example guidance.',
            position: 'after-response-example',
          },
        ],
        method: 'POST',
        operationId: 'create-status',
        parameters: [],
        path: '/status',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  mode: {
                    'x-docs-callouts': [
                      {
                        markdown: 'Use automatic mode unless instructed.',
                        title: 'Mode guidance',
                        type: 'info',
                      },
                    ],
                    type: 'string',
                  },
                },
                type: 'object',
              },
            },
          },
          contentTypes: ['application/json'],
          required: true,
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                example: { status: 'ok' },
                schema: {
                  properties: { status: { type: 'string' } },
                  type: 'object',
                },
              },
            },
          },
        },
        servers: [],
      },
      publicSourceUrl: '/openapi/status.yaml',
      title: 'Create status',
      url: '/en/api-reference/status',
    });

    expect(markdown).toContain(
      ':::warning[Caution]\nCheck credentials before retrying.\n:::',
    );
    expect(markdown).toContain(
      ':::info[Mode guidance]\n  Use automatic mode unless instructed.\n  :::',
    );
    expect(markdown.indexOf('Description guidance.')).toBeLessThan(
      markdown.indexOf('## Parameters'),
    );
    expect(markdown.indexOf('Parameter guidance.')).toBeGreaterThan(
      markdown.indexOf('## Parameters'),
    );
    expect(markdown.indexOf('Response body guidance.')).toBeLessThan(
      markdown.indexOf('## Responses'),
    );
    expect(markdown.indexOf('Response schema guidance.')).toBeGreaterThan(
      markdown.indexOf('- `status` (string)'),
    );
    expect(markdown.indexOf('Response example guidance.')).toBeGreaterThan(
      markdown.indexOf('"status": "ok"'),
    );
  });

  it('resolves published openapi markdown content paths that end in .md', async () => {
    const markdown = await getOpenApiMarkdownByContentPath(
      'en/api-reference/api-ref/conversational-ai/join.md',
    );

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/api-ref/conversational-ai/join)',
    );
  });

  it('publishes only English openapi pages to machine-readable feeds', async () => {
    const pages = await getOpenApiMarkdownPages();

    expect(pages.length).toBeGreaterThan(0);
    expect(pages.every((page) => page.url.startsWith('/en/'))).toBe(true);
    expect(pages.some((page) => page.url.startsWith('/zh-CN/'))).toBe(false);
  });

  it('resolves public RTC REST markdown for zh-CN page paths', async () => {
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
    ).resolves.toContain(
      '# 查询项目的频道列表 (/zh-CN/api-reference/api-ref/rtc/query-channel-list)',
    );
  });
});
