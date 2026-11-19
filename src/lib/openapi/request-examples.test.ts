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

  it('uses legacy Chinese defaults and empty required values instead of schema sampling', () => {
    const operation = {
      parameters: [
        {
          in: 'query',
          name: 'state',
          schema: { default: '2', examples: ['1'] },
        },
        { in: 'query', name: 'limit', schema: { default: 20 } },
        {
          in: 'query',
          name: 'appid',
          required: true,
          schema: { type: 'string' },
        },
        { in: 'query', name: 'metric', required: true },
        { in: 'query', name: 'optional', example: 'sample' },
      ],
    };
    const generated = {
      ...data,
      url: 'https://example.com/items?fields=id&state=1&appid=string&optional=sample',
    };
    const before = JSON.stringify({ document, operation, generated });
    const result = completeRequestExample(
      generated,
      buildRequestExampleContext(document, {}, operation, 'get', true),
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      fields: 'id',
      state: '2',
      limit: '20',
      appid: '',
      metric: '',
    });
    expect(JSON.stringify({ document, operation, generated })).toBe(before);
  });

  it('resolves referenced and inherited queries with case-sensitive operation overrides', () => {
    const source = {
      components: {
        parameters: {
          page: { in: 'query', name: 'page', schema: { default: 1 } },
          pageSize: { in: 'query', name: 'Page', schema: { default: 50 } },
        },
      },
    };
    const result = completeRequestExample(
      { ...data, url: 'https://example.com/items?page=1&Page=10&unused=x' },
      buildRequestExampleContext(
        source,
        { parameters: [{ $ref: '#/components/parameters/page' }] },
        {
          parameters: [
            { in: 'query', name: 'page', schema: { default: 2 } },
            { $ref: '#/components/parameters/pageSize' },
            { in: 'query', name: 'unused', schema: { type: 'string' } },
          ],
        },
        'get',
        true,
      ),
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      page: '2',
      Page: '50',
    });
  });

  it('preserves the legacy truthy-value rule for zero and false without changing schemas', () => {
    const operation = {
      parameters: [
        { in: 'query', name: 'optionalZero', schema: { default: 0 } },
        { in: 'query', name: 'optionalFalse', schema: { default: false } },
        {
          in: 'query',
          name: 'requiredZero',
          required: true,
          schema: { default: 0 },
        },
        {
          in: 'query',
          name: 'requiredFalse',
          required: true,
          schema: { default: false },
        },
        {
          in: 'query',
          name: 'value',
          value: 'authored',
          schema: { default: 'fallback' },
        },
      ],
    };
    const result = completeRequestExample(
      {
        ...data,
        url: 'https://example.com/items?optionalZero=0&optionalFalse=false',
      },
      buildRequestExampleContext({}, {}, operation, 'get', true),
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      requiredZero: '',
      requiredFalse: '',
      value: 'authored',
    });
  });

  it('keeps standard query sampling and query-key authentication outside legacy replacements', () => {
    const operation = {
      parameters: [
        { in: 'query', name: 'state', schema: { default: '2' } },
        {
          in: 'query',
          name: 'api_key',
          required: true,
          schema: { default: 'source-default' },
        },
      ],
    };
    const generated = { ...data, url: 'https://example.com/items?state=1' };
    expect(
      completeRequestExample(
        generated,
        buildRequestExampleContext({}, {}, operation, 'get'),
      ).url,
    ).toBe(generated.url);
    const source = {
      security: [{ key: [] }],
      components: {
        securitySchemes: {
          key: { type: 'apiKey', in: 'query', name: 'api_key' },
        },
      },
    };
    const result = completeRequestExample(
      { ...generated, url: `${generated.url}&api_key=authored-key` },
      buildRequestExampleContext(source, {}, operation, 'get', true),
    );
    expect(Object.fromEntries(new URL(result.url).searchParams)).toEqual({
      state: '2',
      api_key: 'authored-key',
    });
    const placeholder = completeRequestExample(
      generated,
      buildRequestExampleContext(source, {}, operation, 'get', true),
    );
    expect(new URL(placeholder.url).searchParams.get('api_key')).toBe(
      '<api-key>',
    );
  });
});
