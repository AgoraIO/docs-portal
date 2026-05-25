import { describe, expect, it } from 'vitest';
import { createOpenApiExamples } from './examples';

describe('openapi examples', () => {
  it('prefers explicit media examples over generated fallback', () => {
    const examples = createOpenApiExamples({
      method: 'POST',
      operationId: 'create-item',
      parameters: [],
      path: '/v1/items',
      requestBody: {
        content: {
          'application/json': {
            examples: {
              sample: {
                value: {
                  name: 'real example',
                },
              },
            },
            schema: {
              properties: {
                name: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
        contentTypes: ['application/json'],
        required: true,
      },
      responses: {},
      servers: [{ url: 'https://api.example.com' }],
    });

    expect(examples.requestBodyJson).toEqual({ name: 'real example' });
  });

  it('generates minimal fallback request bodies from required schema fields', () => {
    const examples = createOpenApiExamples({
      method: 'POST',
      operationId: 'create-item',
      parameters: [],
      path: '/v1/items',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              properties: {
                enabled: { default: true, type: 'boolean' },
                name: { type: 'string' },
                optional: { type: 'string' },
              },
              required: ['name', 'enabled'],
              type: 'object',
            },
          },
        },
        contentTypes: ['application/json'],
        required: true,
      },
      responses: {},
      servers: [{ url: 'https://api.example.com' }],
    });

    expect(examples.requestBodyJson).toEqual({
      enabled: true,
      name: 'string',
    });
  });

  it('skips readOnly fields for requests and writeOnly fields for responses', () => {
    const examples = createOpenApiExamples({
      method: 'POST',
      operationId: 'create-item',
      parameters: [],
      path: '/v1/items',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              properties: {
                id: { readOnly: true, type: 'string' },
                name: { type: 'string' },
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
              schema: {
                properties: {
                  id: { type: 'string' },
                  secret: { type: 'string', writeOnly: true },
                },
                type: 'object',
              },
            },
          },
        },
      },
      servers: [{ url: 'https://api.example.com' }],
    });

    expect(examples.requestBodyJson).toEqual({ name: 'string' });
    expect(examples.responseBodyJson).toEqual({ id: 'string' });
  });
});
