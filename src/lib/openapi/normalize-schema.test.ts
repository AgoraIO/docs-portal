import { describe, expect, it } from 'vitest';
import { normalizeOpenApiSchema } from './normalize-schema';

describe('normalizeOpenApiSchema', () => {
  it('preserves own data keys that also name Object prototype members', () => {
    const properties = JSON.parse(
      '{"__proto__":{"type":"string"},"normal":{"type":"integer"}}',
    );
    const payload = JSON.parse('{"__proto__":{"value":"data"},"normal":1}');
    const source = {
      type: 'object',
      properties,
      example: payload,
      default: payload,
      enum: [payload],
    };
    const output = normalizeOpenApiSchema(source, {
      normalizeAnnotations: false,
    });
    expect(JSON.stringify(output)).toBe(JSON.stringify(source));
    expect(Object.keys((output as typeof source).properties)).toEqual([
      '__proto__',
      'normal',
    ]);
  });

  it('distinguishes property names, schema keywords and literal annotation data', () => {
    const payload = {
      example: 'literal',
      nested: { $ref: '#/components/schemas/Value' },
    };
    const source = {
      type: 'object',
      properties: {
        example: { type: 'string' },
        nullable: { type: 'boolean' },
      },
      example: payload,
      default: payload,
      const: payload,
      enum: [payload],
      'x-payload': payload,
    };
    const document = {
      components: { schemas: { Value: { type: 'integer' } } },
    };
    const ui = normalizeOpenApiSchema(source, { document });
    expect(ui).toEqual({ ...source, examples: [payload] });
    expect(
      normalizeOpenApiSchema(source, { document, normalizeAnnotations: false }),
    ).toEqual(source);
    expect(source.properties).not.toHaveProperty('examples');
    expect(source).not.toHaveProperty('examples');
  });

  it('resolves schema positions but preserves refs in example and extension payloads', () => {
    const ref = { $ref: '#/$defs/Value' };
    const root = {
      type: 'object',
      properties: { value: ref },
      additionalProperties: ref,
      allOf: [{ properties: { nested: ref } }],
      examples: [{ data: ref }],
      'x-data': ref,
    };
    const document = { $defs: { Value: { type: 'string' } } };
    expect(
      normalizeOpenApiSchema(root, { document, normalizeAnnotations: false }),
    ).toEqual({
      ...root,
      properties: { value: { type: 'string' } },
      additionalProperties: { type: 'string' },
      allOf: [{ properties: { nested: { type: 'string' } } }],
    });
  });

  it.each([true, false])(
    'preserves boolean reference constraints and annotations (%s)',
    (target) => {
      const booleanSources = new WeakMap<object, boolean>();
      const root = {
        $ref: '#/Value',
        type: 'string',
        description: 'Keep guidance.',
      };
      expect(
        normalizeOpenApiSchema(root, {
          document: { Value: target },
          booleanSources,
        }),
      ).toEqual({
        type: 'string',
        description: 'Keep guidance.',
        ...(!target && { not: true }),
      });
      expect(
        normalizeOpenApiSchema(
          { $ref: '#/Value' },
          { document: { Value: target } },
        ),
      ).toBe(target);
      const annotated = normalizeOpenApiSchema(
        { $ref: '#/Value', description: 'Keep guidance.' },
        { document: { Value: target }, booleanSources },
      ) as object;
      expect(booleanSources.get(annotated)).toBe(target);
    },
  );

  it('normalizes nullable/example annotations only within schemas', () => {
    const source = {
      properties: {
        value: { type: 'string', nullable: true, example: 'value' },
      },
    };
    expect(normalizeOpenApiSchema(source)).toEqual({
      properties: {
        value: {
          type: ['string', 'null'],
          nullable: true,
          example: 'value',
          examples: ['value'],
        },
      },
    });
  });

  it('retains recursive reference boundaries and decodes JSON pointer names', () => {
    const node = {
      type: 'object',
      properties: { next: { $ref: '#/$defs/a~1b~0' } },
    };
    const document = { $defs: { 'a/b~': node } };
    expect(
      normalizeOpenApiSchema({ $ref: '#/$defs/a~1b~0' }, { document }),
    ).toEqual(node);
    expect(normalizeOpenApiSchema(node, { document })).toEqual(node);
  });
});
