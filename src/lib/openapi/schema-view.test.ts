import type {
  SchemaData,
  SchemaUIGeneratedData,
} from '@fumadocs/api-docs/components/schema';
import { describe, expect, it } from 'vitest';
import {
  buildOpenApiSchemaView,
  filterOpenApiSchemaView,
  flattenOpenApiSchemaView,
  getAllOpenApiSchemaExpandableIds,
  getInitialOpenApiSchemaExpandedIds,
} from './schema-view';

function primitive(aliasName = 'string'): SchemaData {
  return {
    aliasName,
    type: 'primitive',
    typeName: aliasName,
  };
}

const generatedFixture: SchemaUIGeneratedData = {
  $root: 'root',
  refs: {
    root: {
      aliasName: 'Root',
      props: [
        { $type: 'properties', name: 'properties', required: true },
        { $type: 'advanced', name: 'advanced', required: false },
      ],
      type: 'object',
      typeName: 'Root',
    },
    properties: {
      aliasName: 'Properties',
      props: [
        { $type: 'channel', name: 'channel', required: true },
        { $type: 'nested', name: 'nested', required: false },
        { $type: 'map-any', name: '[key: string]', required: false },
        { $type: 'items-array', name: 'items', required: false },
        { $type: 'choice', name: 'choice', required: false },
      ],
      type: 'object',
      typeName: 'Properties',
    },
    channel: primitive(),
    nested: {
      aliasName: 'Nested',
      props: [
        { $type: 'nested-required', name: 'requiredChild', required: true },
      ],
      type: 'object',
      typeName: 'Nested',
    },
    'nested-required': primitive('integer'),
    'map-any': primitive('any'),
    'items-array': {
      aliasName: 'Item[]',
      item: { $type: 'item' },
      type: 'array',
      typeName: 'Item[]',
    },
    item: {
      aliasName: 'Item',
      props: [{ $type: 'item-name', name: 'name', required: false }],
      type: 'object',
      typeName: 'Item',
    },
    'item-name': primitive(),
    choice: {
      aliasName: 'Choice',
      items: [
        { $type: 'choice-a', name: 'alpha' },
        { $type: 'choice-b', name: 'beta' },
      ],
      type: 'or',
      typeName: 'Choice',
    },
    'choice-a': {
      aliasName: 'Alpha',
      props: [{ $type: 'alpha-field', name: 'alphaField', required: false }],
      type: 'object',
      typeName: 'Alpha',
    },
    'choice-b': {
      aliasName: 'Beta',
      props: [{ $type: 'beta-field', name: 'betaField', required: false }],
      type: 'object',
      typeName: 'Beta',
    },
    'alpha-field': primitive(),
    'beta-field': primitive(),
    advanced: {
      aliasName: 'Advanced',
      props: [{ $type: 'advanced-field', name: 'field', required: false }],
      type: 'object',
      typeName: 'Advanced',
    },
    'advanced-field': primitive(),
  },
};

const recursiveGeneratedFixture: SchemaUIGeneratedData = {
  $root: 'root',
  refs: {
    root: {
      aliasName: 'Root',
      props: [{ $type: 'node', name: 'node', required: false }],
      type: 'object',
      typeName: 'Root',
    },
    node: {
      aliasName: 'Node',
      props: [{ $type: 'node', name: 'self', required: false }],
      type: 'object',
      typeName: 'Node',
    },
  },
};

describe('openapi schema view', () => {
  it('opens only required root expandable fields and hides synthetic map rows', () => {
    const view = buildOpenApiSchemaView(generatedFixture, 'body');
    const flattened = flattenOpenApiSchemaView(view);

    expect(flattened.map((node) => node.path)).toContain('properties.channel');
    expect(flattened.map((node) => node.path)).not.toContain(
      'properties.[key: string]',
    );

    const properties = view.find((node) => node.path === 'properties');
    const nestedRequired = flattened.find(
      (node) => node.path === 'properties.nested.requiredChild',
    );

    expect(properties).toBeDefined();
    expect(getInitialOpenApiSchemaExpandedIds(view)).toEqual(
      new Set([properties?.id]),
    );
    expect(getInitialOpenApiSchemaExpandedIds(view)).not.toContain(
      nestedRequired?.id,
    );
    expect(getAllOpenApiSchemaExpandableIds(view).size).toBeGreaterThan(1);
  });

  it('preserves array and union descendants with variant-specific paths', () => {
    const view = buildOpenApiSchemaView(generatedFixture, 'body');
    const flattened = flattenOpenApiSchemaView(view);

    expect(flattened.map((node) => node.path)).toContain(
      'properties.items.name',
    );
    expect(flattened.map((node) => node.path)).toEqual(
      expect.arrayContaining([
        'properties.choice.alphaField',
        'properties.choice.betaField',
      ]),
    );

    const variants = flattened.filter((node) =>
      node.path.startsWith('properties.choice.'),
    );
    expect(
      variants.find((node) => node.variant === 'alpha')?.parentPath.at(-1),
    ).toEqual({
      $ref: 'choice',
      name: 'choice',
      tabValues: ['choice-a'],
    });
    expect(variants.map((node) => node.variant)).toEqual(
      expect.arrayContaining(['alpha', 'beta']),
    );
    expect(new Set(variants.map((node) => node.id)).size).toBe(variants.length);
  });

  it('stops traversal when a generated ref repeats in its ancestor chain', () => {
    const view = buildOpenApiSchemaView(recursiveGeneratedFixture, 'body');
    const flattened = flattenOpenApiSchemaView(view);

    expect(
      flattened.filter((node) => node.path.endsWith('.self')),
    ).toHaveLength(1);
  });

  it('matches nested names and dotted paths while retaining only matching branches', () => {
    const view = buildOpenApiSchemaView(generatedFixture, 'body');
    const channel = flattenOpenApiSchemaView(view).find(
      (node) => node.path === 'properties.channel',
    );
    const properties = view.find((node) => node.path === 'properties');
    const advanced = view.find((node) => node.path === 'advanced');

    for (const query of ['channel', 'properties.channel']) {
      const result = filterOpenApiSchemaView(view, query);

      expect(result.matchCount).toBe(1);
      expect(result.directMatchIds).toContain(channel?.id);
      expect(result.visibleIds).toContain(properties?.id);
      expect(result.visibleIds).toContain(channel?.id);
      expect(result.expandedIds).toContain(properties?.id);
      expect(result.visibleIds).not.toContain(advanced?.id);
      expect([...result.visibleIds].some((id) => id.includes('advanced'))).toBe(
        false,
      );
    }
  });

  it('visits every child when a later branch is the direct match', () => {
    const view = buildOpenApiSchemaView(generatedFixture, 'body');
    const result = filterOpenApiSchemaView(view, 'betaField');
    const beta = flattenOpenApiSchemaView(view).find(
      (node) => node.path === 'properties.choice.betaField',
    );
    const choice = view
      .flatMap((node) => node.children)
      .find((node) => node.path === 'properties.choice');

    expect(result.matchCount).toBe(1);
    expect(result.directMatchIds).toContain(beta?.id);
    expect(result.visibleIds).toContain(choice?.id);
  });
});
