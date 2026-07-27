import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import {
  buildOpenApiSchemaRows,
  buildOpenApiSchemaTree,
  getOpenApiSchemaRowLayout,
} from './schema-tree';
import { getOpenApiOperation } from './source.server';

describe('openapi schema tree', () => {
  it('renders nested object and array fields', async () => {
    const operation = await getOpenApiOperation(
      OPENAPI_LANES[0],
      'start-agent',
    );
    const schema = operation.requestBody?.content['application/json']?.schema;

    const tree = buildOpenApiSchemaTree(schema);
    const paths = flattenPaths(tree);

    expect(paths).toContain('properties');
    expect(paths.some((path) => path.includes('llm'))).toBe(true);
    expect(paths.some((path) => path.includes('system_messages'))).toBe(true);
  });

  it('guards recursion depth and cycles', () => {
    const schema: Record<string, unknown> = { type: 'object' };
    schema.properties = { self: schema };

    expect(() => buildOpenApiSchemaTree(schema)).not.toThrow();
  });

  it('flattens nested fields into expanded path rows', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        properties: {
          properties: {
            llm: {
              properties: {
                url: {
                  description: 'LLM endpoint URL.',
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
          required: ['llm'],
          type: 'object',
        },
      },
      required: ['properties'],
      type: 'object',
    });

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          depth: 0,
          path: 'properties',
          required: true,
          type: 'object',
        }),
        expect.objectContaining({
          depth: 1,
          path: 'properties.llm',
          required: true,
          type: 'object',
        }),
        expect.objectContaining({
          depth: 2,
          path: 'properties.llm.url',
          required: false,
          type: 'string',
        }),
      ]),
    );
  });

  it('does not leak parent required fields into child object properties', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        profile: {
          properties: {
            avatar: { type: 'string' },
          },
          type: 'object',
        },
      },
      required: ['profile'],
      type: 'object',
    });

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'profile', required: true }),
        expect.objectContaining({ path: 'profile.avatar', required: false }),
      ]),
    );
  });

  it('includes metadata used by the renderer', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        mode: {
          default: 'auto',
          enum: ['auto', 'manual'],
          format: 'text',
          maxLength: 24,
          minLength: 3,
          pattern: '^[a-z]+$',
          type: 'string',
        },
        tags: {
          items: { type: 'string' },
          maxItems: 8,
          minItems: 1,
          type: 'array',
        },
        count: {
          maximum: 10,
          minimum: 1,
          type: 'integer',
        },
        ratio: {
          exclusiveMaximum: 1,
          exclusiveMinimum: 0,
          type: 'number',
        },
      },
      type: 'object',
    });

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          defaultValue: 'auto',
          enumValues: ['auto', 'manual'],
          format: 'text',
          maxLength: 24,
          minLength: 3,
          path: 'mode',
          pattern: '^[a-z]+$',
        }),
        expect.objectContaining({
          maxItems: 8,
          minItems: 1,
          path: 'tags',
        }),
        expect.objectContaining({
          maximum: 10,
          minimum: 1,
          path: 'count',
        }),
        expect.objectContaining({
          exclusiveMaximum: 1,
          exclusiveMinimum: 0,
          path: 'ratio',
        }),
      ]),
    );
  });

  it('preserves field-level callouts when merging composed schemas', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        startParameter: {
          allOf: [
            {
              properties: {
                recordingConfig: {
                  type: 'object',
                },
              },
              type: 'object',
            },
          ],
          type: 'object',
          'x-docs-callouts': [
            {
              markdown: 'Use values that match the following start request.',
              title: 'Note',
              type: 'info',
            },
          ],
        },
      },
      type: 'object',
    });

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          docsCallouts: [
            expect.objectContaining({
              markdown: 'Use values that match the following start request.',
            }),
          ],
          path: 'startParameter',
        }),
      ]),
    );
  });

  it('resolves local refs before expanding nested allOf response schemas', () => {
    const document = {
      components: {
        schemas: {
          baseSession: {
            properties: {
              cname: {
                description: 'The name of the channel being recorded.',
                type: 'string',
              },
              uid: {
                description:
                  'The UID used by the cloud recording service in the RTC channel.',
                type: 'string',
              },
            },
            type: 'object',
          },
          queryResponse: {
            allOf: [
              {
                allOf: [
                  { $ref: '#/components/schemas/baseSession' },
                  {
                    properties: {
                      resourceId: { type: 'string' },
                      sid: { type: 'string' },
                    },
                    type: 'object',
                  },
                ],
              },
              {
                properties: {
                  serverResponse: {
                    properties: {
                      status: { type: 'integer' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            ],
          },
        },
      },
    };

    const rows = buildOpenApiSchemaRows(
      { $ref: '#/components/schemas/queryResponse' },
      { document, usage: 'response' },
    );

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'The name of the channel being recorded.',
          path: 'cname',
        }),
        expect.objectContaining({
          description:
            'The UID used by the cloud recording service in the RTC channel.',
          path: 'uid',
        }),
        expect.objectContaining({
          path: 'serverResponse.status',
          type: 'integer',
        }),
      ]),
    );
  });

  it('derives parent index and has-children from row depths', () => {
    const rows = [
      { depth: 0, name: 'name', path: 'name', required: false, type: 'string' },
      {
        depth: 0,
        name: 'config',
        path: 'config',
        required: false,
        type: 'object',
      },
      {
        depth: 1,
        name: 'ttl',
        path: 'config.ttl',
        required: false,
        type: 'integer',
      },
      {
        depth: 1,
        name: 'llm',
        path: 'config.llm',
        required: false,
        type: 'object',
      },
      {
        depth: 2,
        name: 'url',
        path: 'config.llm.url',
        required: false,
        type: 'string',
      },
      { depth: 0, name: 'tail', path: 'tail', required: false, type: 'string' },
    ];

    const layout = getOpenApiSchemaRowLayout(rows);

    expect(layout.hasChildren).toEqual([
      false,
      true,
      false,
      true,
      false,
      false,
    ]);
    expect(layout.parentIndex).toEqual([-1, -1, 1, 1, 3, -1]);
  });

  it('returns empty layout arrays for no rows', () => {
    const layout = getOpenApiSchemaRowLayout([]);
    expect(layout.hasChildren).toEqual([]);
    expect(layout.parentIndex).toEqual([]);
  });
});

function flattenPaths(
  nodes: { children?: unknown[]; path: string }[],
): string[] {
  return nodes.flatMap((node) => [
    node.path,
    ...flattenPaths(
      (node.children ?? []) as { children?: unknown[]; path: string }[],
    ),
  ]);
}
