import { describe, expect, it } from 'vitest';
import {
  buildRequestExampleContext,
  completeRequestExample,
  documentationCurl,
} from './request-examples';

describe('OpenAPI request example completion', () => {
  it('quotes literal header values without stripping nested quotes in shell commands', () => {
    const command = documentationCurl.generate(
      {
        method: 'get',
        url: 'https://example.com/items',
        path: {},
        query: {},
        cookie: {},
        header: {
          Authorization: { value: 'agora token="token"' },
          'X-Name': { value: "it's literal" },
        },
      },
      { mediaAdapters: {}, custom: null },
    );
    expect(command).toContain(
      '--header \'Authorization: agora token="token"\'',
    );
    expect(command).toContain("--header 'X-Name: it'\\''s literal'");
  });

  const document = {
    servers: [{ url: 'https://example.com' }],
    security: [{ basic: [] }],
    components: {
      securitySchemes: { basic: { type: 'http', scheme: 'basic' } },
    },
  };
  const data = {
    method: 'post' as const,
    url: 'https://example.com/items/string?fields=id',
    path: {},
    query: {},
    cookie: {},
    header: {
      'content-type': { value: 'string' },
      'Content-Type': { value: 'string' },
    },
    body: { name: 'authored' },
    bodyMediaType: 'application/json',
  };

  it('retains inherited optional headers and auth while keeping the source contract immutable', () => {
    const pathItem = {
      parameters: [
        {
          in: 'header',
          name: 'X-Request-ID',
          required: false,
          schema: { type: 'string' },
        },
      ],
    };
    const operation = { __path: '/items/{itemId}' };
    const before = JSON.stringify({ document, pathItem, operation, data });
    const result = completeRequestExample(
      data,
      buildRequestExampleContext(document, pathItem, operation, 'post'),
    );
    expect(result.header).toEqual({
      Authorization: { value: 'Basic <credentials>' },
      'X-Request-ID': { value: '<string>' },
    });
    expect(result.url).toBe('https://example.com/items/:itemId?fields=id');
    expect(result.body).toEqual(data.body);
    expect(JSON.stringify({ document, pathItem, operation, data })).toBe(
      before,
    );
  });

  it('honors anonymous operations and explicit auth examples instead of guessing credentials', () => {
    expect(
      buildRequestExampleContext(document, {}, { security: [] }, 'get').headers,
    ).toEqual({});
    expect(
      buildRequestExampleContext(
        document,
        {},
        {
          parameters: [
            {
              in: 'header',
              name: 'authorization',
              example: 'Bearer authored-token',
            },
          ],
        },
        'get',
      ).headers,
    ).toEqual({ authorization: 'Bearer authored-token' });
  });

  it('preserves falsy header examples and prefers operation overrides', () => {
    const context = buildRequestExampleContext(
      {},
      { parameters: [{ in: 'header', name: 'X-Version', example: 3 }] },
      {
        parameters: [
          { in: 'header', name: 'x-version', example: 0 },
          { in: 'header', name: 'X-Enabled', example: false },
        ],
      },
      'get',
    );
    expect(context.headers).toEqual({ 'x-version': '0', 'X-Enabled': 'false' });
  });

  it('does not invent Chinese request bodies while preserving other sampling and authored examples', () => {
    const schema = {
      type: 'object',
      properties: {
        requiredName: { type: 'string' },
        optionalFlag: { type: 'boolean', default: false },
        serverOnly: { type: 'string', readOnly: true },
      },
      required: ['requiredName'],
    };
    const operation = {
      requestBody: { content: { 'application/json': { schema } } },
    };
    const legacy = buildRequestExampleContext({}, {}, operation, 'post', true);
    expect(completeRequestExample(data, legacy).body).toBeUndefined();
    expect(completeRequestExample(data, legacy).header['Content-Type']).toEqual(
      { value: 'application/json' },
    );
    const standard = buildRequestExampleContext({}, {}, operation, 'post');
    expect(completeRequestExample(data, standard).body).toBe(data.body);
    const authored = {
      requestBody: {
        content: {
          'application/json': { schema, example: { requiredName: 'original' } },
        },
      },
    };
    expect(
      buildRequestExampleContext({}, {}, authored, 'post', true).omitBody,
    ).toBe(false);
  });

  it('includes API-key authentication in the declared query and cookie locations', () => {
    const context = buildRequestExampleContext(
      {
        security: [{ queryKey: [], cookieKey: [] }],
        components: {
          securitySchemes: {
            queryKey: { type: 'apiKey', in: 'query', name: 'api_key' },
            cookieKey: { type: 'apiKey', in: 'cookie', name: 'session' },
          },
        },
      },
      {},
      {},
      'get',
    );
    const result = completeRequestExample(data, context);
    expect(new URL(result.url).searchParams.get('api_key')).toBe('<api-key>');
    expect(result.cookie.session).toEqual({ value: '<api-key>' });
  });
});
