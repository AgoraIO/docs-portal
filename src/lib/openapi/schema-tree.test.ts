import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import {
  buildOpenApiSchemaRows,
  buildOpenApiSchemaTree,
  getInitialOpenApiSchemaExpandedPaths,
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

  it('omits array item wrapper rows that add no details beyond their type', () => {
    const rows = buildOpenApiSchemaRows(
      {
        properties: {
          describedStringArray: {
            items: {
              description: 'Allowed value.',
              type: 'string',
            },
            type: 'array',
          },
          enumStringArray: {
            items: {
              enum: ['auto', 'manual'],
              type: 'string',
            },
            type: 'array',
          },
          objectArray: {
            items: {
              properties: {
                name: {
                  type: 'string',
                },
              },
              type: 'object',
            },
            type: 'array',
          },
          plainIntegerArray: {
            items: {
              type: 'integer',
            },
            type: 'array',
          },
          plainStringArray: {
            description: 'Subscribed user IDs.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          rangedNumberArray: {
            items: {
              maximum: 1,
              minimum: 0,
              type: 'number',
            },
            type: 'array',
          },
          unannotatedObjectArray: {
            items: {
              type: 'object',
            },
            type: 'array',
          },
        },
        required: ['plainStringArray'],
        type: 'object',
      },
      {
        omitArrayItemWrapperRows: true,
      },
    );

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'plainStringArray',
          required: true,
          type: 'array',
        }),
        expect.objectContaining({
          description: 'Allowed value.',
          path: 'describedStringArray.items',
          type: 'string',
        }),
        expect.objectContaining({
          enumValues: ['auto', 'manual'],
          path: 'enumStringArray.items',
          type: 'string',
        }),
        expect.objectContaining({
          path: 'objectArray.items.name',
          type: 'string',
        }),
        expect.objectContaining({
          maximum: 1,
          minimum: 0,
          path: 'rangedNumberArray.items',
          type: 'number',
        }),
      ]),
    );
    const paths = rows.map((row) => row.path);
    expect(paths).not.toContain('objectArray.items');
    expect(paths).not.toContain('plainIntegerArray.items');
    expect(paths).not.toContain('plainStringArray.items');
    expect(paths).not.toContain('unannotatedObjectArray.items');
  });

  it('keeps array item wrapper rows by default', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        objectArray: {
          items: {
            properties: {
              name: {
                type: 'string',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        plainStringArray: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
      },
      type: 'object',
    });

    expect(rows.map((row) => row.path)).toEqual(
      expect.arrayContaining([
        'objectArray.items',
        'objectArray.items.name',
        'plainStringArray.items',
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

  it('initially expands a required top-level object for request schemas', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        name: { type: 'string' },
        properties: {
          properties: {
            channel: { type: 'string' },
            llm: { properties: { url: { type: 'string' } }, type: 'object' },
          },
          required: ['channel'],
          type: 'object',
        },
      },
      required: ['properties'],
      type: 'object',
    });
    const layout = getOpenApiSchemaRowLayout(rows);

    expect(
      getInitialOpenApiSchemaExpandedPaths(rows, layout, 'request'),
    ).toEqual(new Set(['properties']));
  });

  it('initially expands the only optional top-level object for requests', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        properties: {
          properties: { channel: { type: 'string' } },
          type: 'object',
        },
      },
      type: 'object',
    });
    const layout = getOpenApiSchemaRowLayout(rows);

    expect(
      getInitialOpenApiSchemaExpandedPaths(rows, layout, 'request'),
    ).toEqual(new Set(['properties']));
  });

  it('expands the only optional top-level object alongside a leaf', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        name: { type: 'string' },
        properties: {
          properties: { token: { type: 'string' } },
          type: 'object',
        },
      },
      type: 'object',
    });
    const layout = getOpenApiSchemaRowLayout(rows);

    expect(
      getInitialOpenApiSchemaExpandedPaths(rows, layout, 'request'),
    ).toEqual(new Set(['properties']));
  });

  it('does not expand arrays from required status or any response schema', () => {
    const rows = buildOpenApiSchemaRows({
      properties: {
        properties: {
          items: { type: 'string' },
          type: 'array',
        },
      },
      required: ['properties'],
      type: 'object',
    });
    const layout = getOpenApiSchemaRowLayout(rows);

    expect(
      getInitialOpenApiSchemaExpandedPaths(rows, layout, 'request'),
    ).toEqual(new Set());
    expect(
      getInitialOpenApiSchemaExpandedPaths(rows, layout, 'response'),
    ).toEqual(new Set());
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
