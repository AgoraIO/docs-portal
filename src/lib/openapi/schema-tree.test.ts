import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import { buildOpenApiSchemaRows, buildOpenApiSchemaTree } from './schema-tree';
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
          type: 'string',
        },
        count: {
          maximum: 10,
          minimum: 1,
          type: 'integer',
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
          path: 'mode',
        }),
        expect.objectContaining({
          maximum: 10,
          minimum: 1,
          path: 'count',
        }),
      ]),
    );
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
