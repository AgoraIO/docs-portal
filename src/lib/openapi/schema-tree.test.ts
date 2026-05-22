import { describe, expect, it } from 'vitest';
import { OPENAPI_LANES } from './lanes';
import { buildOpenApiSchemaTree } from './schema-tree';
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
