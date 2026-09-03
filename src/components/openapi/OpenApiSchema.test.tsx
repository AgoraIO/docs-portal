import { AnchorSection } from '@fumadocs/api-docs/auto-anchor/client';
import { generateSchemaUI } from '@fumadocs/api-docs/components/schema';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildOpenApiSchemaView,
  flattenOpenApiSchemaView,
} from '@/lib/openapi/schema-view';
import {
  appendOpenApiSchemaAllowedValues,
  buildOpenApiSchemaFindTargets,
  decodeOpenApiSchemaPath,
  encodeOpenApiSchemaPath,
  OpenApiSchema,
} from './OpenApiSchema';
import { stableDomId } from './OpenApiSchemaTree';

const schema = {
  properties: {
    name: {
      description: 'Unique agent name.',
      type: 'string',
    },
    config: {
      description: 'Agent runtime settings.',
      properties: {
        idleTimeout: {
          description: 'Idle timeout in seconds.',
          type: 'integer',
        },
        transport: {
          properties: {
            codec: {
              description: 'Audio codec name.',
              type: 'string',
            },
          },
          type: 'object',
        },
      },
      required: ['idleTimeout'],
      type: 'object',
    },
    advanced: {
      properties: {
        tracing: { type: 'boolean' },
      },
      type: 'object',
    },
  },
  required: ['name', 'config'],
  type: 'object',
};

function renderSchema() {
  return render(
    <AnchorSection segments={['request-body', 'application-json']}>
      <OpenApiSchema
        client={{ as: 'body', name: 'body' }}
        renderCodeblock={({ code }) => <pre>{code}</pre>}
        renderMarkdown={(markdown) => <p>{markdown}</p>}
        root={schema}
        writeOnly
      />
    </AnchorSection>,
  );
}

function getRenderedSchemaText(text: string) {
  return screen
    .getAllByText(text)
    .find((element) => !element.closest('[data-openapi-schema-find-index]'));
}

function queryRenderedSchemaText(text: string) {
  return screen
    .queryAllByText(text)
    .filter((element) => !element.closest('[data-openapi-schema-find-index]'));
}

describe('OpenApiSchema', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.useRealTimers();
  });

  it('uses the official compact property filter and requiredness syntax', () => {
    renderSchema();

    const filter = screen.getByPlaceholderText('Filter Properties');
    const requiredRow = getRenderedSchemaText('name')?.closest('div.border-t');
    const optionalRow =
      getRenderedSchemaText('advanced')?.closest('div.border-t');

    expect(filter).toHaveAttribute('aria-label', 'Filter Properties');
    expect(filter).toHaveAttribute('data-slot', 'input');
    expect(filter).toHaveAttribute('type', 'search');
    expect(filter.closest('.openapi-schema-tree')).toBeInTheDocument();
    expect(requiredRow).toBeInstanceOf(HTMLElement);
    expect(optionalRow).toBeInstanceOf(HTMLElement);
    expect(
      within(requiredRow as HTMLElement).getByText('Required'),
    ).toBeVisible();
    expect(
      within(optionalRow as HTMLElement).getByText('Optional'),
    ).toBeVisible();

    fireEvent.change(filter, { target: { value: 'name' } });

    expect(getRenderedSchemaText('name')).toBeVisible();
    expect(queryRenderedSchemaText('config')[0]).toBeVisible();
    expect(queryRenderedSchemaText('advanced')[0]).toBeVisible();

    fireEvent.change(filter, { target: { value: '' } });
    expect(getRenderedSchemaText('config')).toBeVisible();
    expect(getRenderedSchemaText('advanced')).toBeVisible();
  });

  it('keeps nested request body wrappers, hidden descendants, and statuses integrated', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              properties: {
                properties: {
                  provider: {
                    deprecated: true,
                    description: 'Provider configuration.',
                    properties: {
                      name: { type: 'string' },
                    },
                    required: ['name'],
                    type: 'object',
                  },
                  channel: { type: 'string' },
                },
                type: 'object',
              },
            },
            required: ['properties'],
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    const schemaTree = screen
      .getByPlaceholderText('Filter Properties')
      .closest('.openapi-schema-tree') as HTMLElement;
    const propertiesNode = getRenderedSchemaText('properties')?.closest(
      '[data-openapi-schema-path]',
    ) as HTMLElement;
    const providerNode = getRenderedSchemaText('provider')?.closest(
      '[data-openapi-schema-path]',
    ) as HTMLElement;
    const providerRow = providerNode.querySelector(
      '.openapi-schema-field-row',
    ) as HTMLElement;
    const nameRow = getRenderedSchemaText('name')?.closest(
      '.openapi-schema-field-row',
    ) as HTMLElement;
    const channelNode = getRenderedSchemaText('channel')?.closest(
      '[data-openapi-schema-path]',
    ) as HTMLElement;

    expect(schemaTree).toBeInTheDocument();
    expect(
      schemaTree.querySelector('[data-openapi-schema-fields]'),
    ).toBeInTheDocument();
    expect(propertiesNode).toHaveAttribute(
      'data-openapi-schema-path',
      'properties',
    );
    expect(providerNode).toBeInTheDocument();
    expect(providerNode).toHaveAttribute(
      'data-openapi-schema-path',
      'properties.provider',
    );
    expect(
      propertiesNode.querySelector(':scope > .openapi-schema-children'),
    ).toBeInTheDocument();
    expect(
      providerNode.querySelector(':scope > .openapi-schema-children'),
    ).toBeInTheDocument();
    expect(
      providerNode.querySelector(':scope > .openapi-schema-children'),
    ).toHaveAttribute('hidden', 'until-found');
    expect(within(providerRow).getByText('Optional')).toBeVisible();
    expect(within(providerRow).getByText('Deprecated')).toBeVisible();
    expect(within(nameRow).getByText('Required')).toBeInTheDocument();
    expect(within(channelNode).getByText('Optional')).toBeVisible();
    expect(within(providerRow).getByText('Deprecated')).toHaveClass(
      'openapi-schema-status',
    );
    const description = providerRow.querySelector(
      '.openapi-schema-field-description',
    );
    expect(description).not.toHaveTextContent('Deprecated');
  });

  it('renders deprecated as a status badge without a duplicate metadata tag', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              legacy: {
                deprecated: true,
                description: 'Legacy field.',
                type: 'string',
              },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('legacy')?.closest('div.border-t');
    expect(row).toBeInstanceOf(HTMLElement);
    expect(within(row as HTMLElement).getAllByText('Deprecated')).toHaveLength(
      1,
    );
    expect(within(row as HTMLElement).getByText('Deprecated')).toHaveClass(
      'openapi-schema-status',
    );
  });

  it('uses the singular English match label for one result', () => {
    renderSchema();

    const filter = screen.getByPlaceholderText('Filter Properties');
    fireEvent.change(filter, { target: { value: 'name' } });

    expect(screen.getByRole('status')).toHaveTextContent('1 match');
  });

  it('renders raw enum metadata as allowed value code tokens', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              status: {
                default: 'ready',
                description: 'Current status.',
                enum: ['ready', 'running'],
                format: 'status-code',
                type: 'string',
              },
            },
            required: ['status'],
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('status')?.closest('div.border-t');
    expect(row).toBeInstanceOf(HTMLElement);
    expect(
      within(row as HTMLElement).getByText('Allowed values'),
    ).toBeVisible();
    expect(within(row as HTMLElement).getByText('ready')).toHaveAttribute(
      'data-openapi-allowed-value-key',
    );
    expect(within(row as HTMLElement).getByText('running')).toBeVisible();
    expect(within(row as HTMLElement).getByText('Default')).toBeVisible();
    expect(within(row as HTMLElement).getByText('Format')).toBeVisible();
    expect(screen.queryByText('Value in')).not.toBeInTheDocument();
  });

  it('preserves a property literally named enum while rendering its schema enum', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              enum: {
                enum: ['property-value'],
                type: 'string',
              },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('enum')?.closest('div.border-t');
    expect(row).toBeInstanceOf(HTMLElement);
    expect(
      within(row as HTMLElement).getByText('property-value'),
    ).toBeVisible();
  });

  it('preserves enum data in properties, examples, and default objects', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            default: { enum: 'default-data' },
            examples: [{ enum: 'example-data' }],
            properties: {
              enum: {
                enum: ['property-value'],
                type: 'string',
              },
            },
            type: 'object',
          }}
          showExample
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('enum')?.closest('div.border-t');
    expect(
      within(row as HTMLElement).getByText('property-value'),
    ).toBeVisible();
    expect(screen.getByText(/"enum": "default-data"/)).toBeVisible();
    expect(screen.getByText(/"enum": "example-data"/)).toBeVisible();
  });

  it('keeps allowed values with the visible union branch after filtering', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              variant: {
                oneOf: [
                  {
                    properties: {
                      mode: { enum: ['hidden'], type: 'string' },
                    },
                    readOnly: true,
                    type: 'object',
                  },
                  {
                    properties: {
                      mode: { enum: ['visible'], type: 'string' },
                    },
                    type: 'object',
                  },
                ],
              },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand variant properties' }),
    );
    expect(screen.getByText('visible')).toBeVisible();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('keeps oneOf and anyOf branch values in their own generated branches', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              variant: {
                anyOf: [
                  {
                    properties: {
                      anyMode: { enum: ['any-value'], type: 'string' },
                    },
                    type: 'object',
                  },
                ],
                oneOf: [
                  {
                    properties: {
                      oneMode: { enum: ['one-value'], type: 'string' },
                    },
                    type: 'object',
                  },
                ],
              },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand variant properties' }),
    );
    expect(screen.getByText('one-value')).toBeVisible();
    expect(screen.getByText('any-value')).toBeVisible();
  });

  it('keeps property enum values inherited through allOf', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            allOf: [
              {
                properties: {
                  status: { enum: ['inherited'], type: 'string' },
                },
                type: 'object',
              },
            ],
          }}
        />
      </AnchorSection>,
    );

    expect(screen.getByText('inherited')).toBeVisible();
  });

  it('intersects enum values for duplicate properties inherited through allOf', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            allOf: [
              {
                properties: {
                  mode: { enum: ['a', 'b'], type: 'string' },
                },
                type: 'object',
              },
              {
                properties: {
                  mode: { enum: ['b', 'c'], type: 'string' },
                },
                type: 'object',
              },
            ],
          }}
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('mode')?.closest('div.border-t');
    expect(within(row as HTMLElement).getByText('b')).toBeVisible();
    expect(within(row as HTMLElement).queryByText('a')).not.toBeInTheDocument();
    expect(within(row as HTMLElement).queryByText('c')).not.toBeInTheDocument();
  });

  it('merges metadata from duplicate allOf properties without dropping later constraints', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderExtraDescription={(value) => {
            const record = value as Record<string, unknown>;
            const callouts = record['x-docs-callouts'] as
              | { body: string }[]
              | undefined;
            return (
              <div>
                <span>{record.description as string}</span>
                <span>{record.example as string}</span>
                <span>{record.deprecated ? 'deprecated' : 'active'}</span>
                {callouts?.map((callout) => (
                  <span key={callout.body}>{callout.body}</span>
                ))}
              </div>
            );
          }}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            allOf: [
              {
                properties: {
                  mode: {
                    description: 'First description',
                    enum: ['a', 'b'],
                    example: 'first-example',
                    'x-docs-callouts': [{ body: 'First callout' }],
                    type: 'string',
                  },
                },
                type: 'object',
              },
              {
                properties: {
                  mode: {
                    deprecated: true,
                    description: 'Second description',
                    enum: ['b', 'c'],
                    example: 'second-example',
                    'x-docs-callouts': [{ body: 'Second callout' }],
                    type: 'string',
                  },
                },
                type: 'object',
              },
            ],
          }}
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('mode')?.closest('div.border-t');
    expect(within(row as HTMLElement).getByText('b')).toBeVisible();
    expect(within(row as HTMLElement).queryByText('a')).not.toBeInTheDocument();
    expect(within(row as HTMLElement).queryByText('c')).not.toBeInTheDocument();
    const description = (row as HTMLElement).querySelector(
      '.openapi-schema-field-description',
    );
    expect(description).toBeInstanceOf(HTMLElement);
    expect(description).toHaveTextContent('First description');
    expect(description).toHaveTextContent('Second description');
    expect(screen.getByText('second-example')).toBeVisible();
    expect(screen.getByText('deprecated')).toBeVisible();
    expect(screen.getByText('First callout')).toBeVisible();
    expect(screen.getByText('Second callout')).toBeVisible();
  });

  it('renders examples from every duplicate allOf property schema', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            allOf: [
              {
                properties: {
                  mode: { examples: ['first-example'], type: 'string' },
                },
                type: 'object',
              },
              {
                properties: {
                  mode: { examples: ['second-example'], type: 'string' },
                },
                type: 'object',
              },
            ],
          }}
          showExample
        />
      </AnchorSection>,
    );

    const row = getRenderedSchemaText('mode')?.closest('div.border-t');
    expect(
      within(row as HTMLElement).getByText('"first-example"'),
    ).toBeVisible();
    expect(
      within(row as HTMLElement).getByText('"second-example"'),
    ).toBeVisible();
  });

  it.each([
    {
      name: 'type array',
      root: {
        properties: {
          value: { enum: ['text', 7], type: ['string', 'number'] },
        },
        type: 'object',
      },
    },
    {
      name: 'oneOf',
      root: {
        properties: {
          value: {
            oneOf: [
              { enum: ['text'], type: 'string' },
              { enum: [7], type: 'number' },
            ],
          },
        },
        type: 'object',
      },
    },
  ])(
    'keeps scalar enum values associated with each $name branch',
    ({ root }) => {
      const rawValue = root.properties.value;
      const generated = generateSchemaUI({
        renderCodeblock: ({ code }) => <pre>{code}</pre>,
        renderMarkdown: (markdown) => <p>{markdown}</p>,
        root: {
          properties: {
            value: rawValue.oneOf
              ? { oneOf: rawValue.oneOf.map(({ type }) => ({ type })) }
              : { type: rawValue.type },
          },
          type: 'object',
        },
      });
      appendOpenApiSchemaAllowedValues(generated, root, {
        readOnly: true,
        writeOnly: true,
      });

      const generatedRoot = generated.refs[generated.$root] as {
        props: { $type: string }[];
      };
      const union = generated.refs[generatedRoot.props[0].$type] as {
        items: { $type: string }[];
      };
      expect(
        union.items.map(
          (item) =>
            (generated.refs[item.$type] as { allowedValues?: unknown[] })
              .allowedValues,
        ),
      ).toEqual([['text'], [7]]);
    },
  );
  it('round-trips JSON-encoded schema paths with delimiter characters', () => {
    const path = [
      {
        $ref: 'root|ref\0',
        name: 'field|name\0',
        tabValues: ['branch|ref\0'],
      },
    ];
    const generated = {
      refs: {
        'root|ref\0': {},
        'branch|ref\0': {},
      },
    };
    const encoded = encodeOpenApiSchemaPath(path);
    const search = new URLSearchParams({
      path: encoded,
      's-highlight': path[0].name,
    });

    expect(encoded).not.toContain('\0');
    expect(decodeOpenApiSchemaPath(`?${search}`, generated as never)).toEqual({
      fieldName: path[0].name,
      parentPath: path,
    });
  });

  it('keeps decoding the legacy delimiter schema path format', () => {
    const generated = { refs: { root: {}, branch: {} } };
    const search = new URLSearchParams({
      path: 'field\0root\0branch',
      's-highlight': 'field',
    });

    expect(decodeOpenApiSchemaPath(`?${search}`, generated as never)).toEqual({
      fieldName: 'field',
      parentPath: [{ $ref: 'root', name: 'field', tabValues: ['branch'] }],
    });
  });

  it('renders enum metadata for pattern and additional properties', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              metadata: {
                additionalProperties: { enum: ['map-value'], type: 'string' },
                patternProperties: {
                  '^x-': { enum: ['pattern-value'], type: 'string' },
                },
                type: 'object',
              },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand metadata properties' }),
    );

    expect(screen.getByText('pattern-value')).toBeVisible();
    expect(screen.getByText('map-value')).toBeVisible();
  });

  it('renders callouts from local references inside union branches', () => {
    const document = {
      components: {
        schemas: {
          Choice: {
            oneOf: [
              { $ref: '#/components/schemas/FirstChoice' },
              { $ref: '#/components/schemas/SecondChoice' },
            ],
          },
          FirstChoice: {
            properties: {
              value: { $ref: '#/components/schemas/FirstValue' },
            },
            type: 'object',
          },
          FirstValue: {
            type: 'string',
            'x-docs-callouts': [{ body: 'First branch callout.' }],
          },
          SecondChoice: {
            properties: {
              value: { $ref: '#/components/schemas/SecondValue' },
            },
            type: 'object',
          },
          SecondValue: {
            type: 'string',
            'x-docs-callouts': [{ body: 'Second branch callout.' }],
          },
        },
      },
    };

    const schemaProps = {
      client: { as: 'body', name: 'body' },
      document,
      renderCodeblock: ({ code }: { code: string }) => <pre>{code}</pre>,
      renderExtraDescription: (value: unknown) => {
        const callout = (value as { 'x-docs-callouts'?: { body: string }[] })[
          'x-docs-callouts'
        ]?.[0];
        return callout ? <span>{callout.body}</span> : null;
      },
      renderMarkdown: (markdown: string) => <p>{markdown}</p>,
      root: {
        properties: {
          choice: { $ref: '#/components/schemas/Choice' },
        },
        type: 'object',
      },
    } as unknown as ComponentProps<typeof OpenApiSchema>;

    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema {...schemaProps} />
      </AnchorSection>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand choice properties' }),
    );

    expect(screen.getByText('First branch callout.')).toBeVisible();
    expect(screen.getByText('Second branch callout.')).toBeVisible();
  });

  it('gives each field permalink control an accessible name', () => {
    renderSchema();

    const nameRow = getRenderedSchemaText('name')?.closest('div.border-t');

    expect(
      within(nameRow as HTMLElement).getByRole('button', {
        name: 'Copy link to name',
      }),
    ).toBeVisible();
  });

  it('clears body tree copy feedback without resetting search or expansion state', async () => {
    vi.useFakeTimers();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      renderSchema();
      fireEvent.click(
        within(
          getRenderedSchemaText('transport')?.closest(
            'div.border-t',
          ) as HTMLElement,
        ).getByRole('button', { name: 'Expand transport properties' }),
      );
      const filter = screen.getByPlaceholderText('Filter Properties');
      fireEvent.change(filter, { target: { value: 'codec' } });
      expect(filter).toHaveValue('codec');
      fireEvent.click(
        within(
          getRenderedSchemaText('transport')?.closest(
            'div.border-t',
          ) as HTMLElement,
        ).getByRole('button', { name: 'Copy link to transport' }),
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(
        screen.getByRole('button', { name: 'Copied link to transport' }),
      ).toBeVisible();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(
        screen.getByRole('button', { name: 'Copy link to transport' }),
      ).toBeVisible();
      expect(filter).toHaveValue('codec');
      expect(screen.getByText('codec')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Collapse transport properties' }),
      ).toHaveAttribute('aria-expanded', 'true');
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('renders every nested object field inline without a popup', () => {
    renderSchema();

    const configRow = getRenderedSchemaText('config')?.closest('div.border-t');
    const idleTimeout = getRenderedSchemaText('idleTimeout');
    const transport = getRenderedSchemaText('transport');
    const codec = getRenderedSchemaText('codec');

    expect(configRow).toBeInstanceOf(HTMLElement);
    expect(idleTimeout).toBeVisible();
    expect(transport).toBeVisible();
    expect(codec).not.toBeVisible();
    fireEvent.click(
      within(
        (transport as HTMLElement).closest('div.border-t') as HTMLElement,
      ).getByRole('button', { name: 'Expand transport properties' }),
    );
    expect(getRenderedSchemaText('codec')).toBeVisible();
    expect(
      within(
        (configRow as HTMLElement).firstElementChild as HTMLElement,
      ).getByText('object'),
    ).not.toHaveRole('button');
    expect(screen.getAllByPlaceholderText('Filter Properties')).toHaveLength(1);
    expect(
      document.querySelector('[data-openapi-schema-popover]'),
    ).not.toBeInTheDocument();
  });

  it('keeps nested fields directly visible to native browser find', () => {
    renderSchema();

    expect(getRenderedSchemaText('idleTimeout')).toBeVisible();
    fireEvent.click(
      within(
        getRenderedSchemaText('transport')?.closest(
          'div.border-t',
        ) as HTMLElement,
      ).getByRole('button', { name: 'Expand transport properties' }),
    );
    expect(getRenderedSchemaText('codec')).toBeVisible();
    expect(
      document.querySelector('[data-openapi-schema-find-index]'),
    ).not.toBeInTheDocument();
  });

  it('stops expanding a recursive object while preserving sibling fields', () => {
    const recursiveNode: Record<string, unknown> = {
      properties: {
        label: { type: 'string' },
      },
      type: 'object',
    };
    (recursiveNode.properties as Record<string, unknown>).child = recursiveNode;

    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={recursiveNode}
          writeOnly
        />
      </AnchorSection>,
    );

    expect(screen.getAllByText('label')).toHaveLength(1);
    expect(screen.getAllByText('child')).toHaveLength(1);
    expect(document.querySelector('.openapi-schema-tree')).toBeInTheDocument();
  });

  it('converts a legacy nested-field hash into the official path protocol', async () => {
    window.history.replaceState(
      null,
      '',
      '#request-body-properties-config-idle-timeout',
    );

    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          legacyAnchorPrefix="request-body"
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              properties: {
                properties: {
                  config: {
                    properties: {
                      idleTimeout: { type: 'integer' },
                    },
                    type: 'object',
                  },
                },
                type: 'object',
              },
            },
            type: 'object',
          }}
          writeOnly
        />
      </AnchorSection>,
    );

    await waitFor(() => {
      const url = new URL(window.location.href);
      expect(url.searchParams.get('s-highlight')).toBe('idleTimeout');
      expect(url.searchParams.get('path')).toContain('properties');
      expect(url.searchParams.get('path')).toContain('config');
    });
    expect(window.location.hash).toBe('#request-body.application-json.body');
    expect(
      screen.getByText('idleTimeout').closest('.openapi-schema-field-row'),
    ).toHaveAttribute('data-openapi-schema-highlighted');
  });

  it.each([
    ['path', 'path-parameters'],
    ['query', 'query-parameters'],
    ['header', 'header-parameters'],
    ['cookie', 'cookie-parameters'],
  ] as const)(
    'converts a legacy %s parameter hash into the official path protocol',
    async (location, legacyPrefix) => {
      window.history.replaceState(null, '', `#${legacyPrefix}-item-id`);

      render(
        <AnchorSection segments={['parameters', location]}>
          <OpenApiSchema
            client={{ name: 'itemId', required: location === 'path' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{ type: 'string' }}
            writeOnly
          />
        </AnchorSection>,
      );

      await waitFor(() => {
        const url = new URL(window.location.href);
        expect(url.searchParams.get('s-highlight')).toBe('itemId');
        expect(url.searchParams.get('path')).toContain('itemId');
      });
      expect(window.location.hash).toBe(`#parameters.${location}.itemid`);
    },
  );

  it('renders object parameter fields inline for native browser find', () => {
    render(
      <AnchorSection segments={['parameters', 'query']}>
        <OpenApiSchema
          client={{ name: 'filter' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              state: { type: 'string' },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    expect(getRenderedSchemaText('state')).toBeVisible();
    expect(screen.getByText('object')).not.toHaveRole('button');
    expect(screen.queryByPlaceholderText('Filter Properties')).toBeNull();
  });

  it('names same fields from separate parameter schemas with unique safe ids', () => {
    render(
      <>
        <AnchorSection segments={['parameters', 'path']}>
          <OpenApiSchema
            client={{ name: 'filter' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{
              properties: { state: { type: 'string' } },
              type: 'object',
            }}
          />
        </AnchorSection>
        <AnchorSection segments={['parameters', 'query']}>
          <OpenApiSchema
            client={{ name: 'filter' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{
              properties: { state: { type: 'string' } },
              type: 'object',
            }}
          />
        </AnchorSection>
      </>,
    );

    const rows = Array.from(
      document.querySelectorAll('.openapi-schema-parameter-fields .border-t'),
    );
    const ids = rows.map((row) => row.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => !/[\0|]/.test(id))).toBe(true);
    const stateIds = screen
      .getAllByText('state')
      .map((element) => element.closest('.openapi-schema-field-row')?.id);
    expect(new Set(stateIds).size).toBe(2);
  });

  it('reveals and highlights a nested parameter field from its legacy hash', async () => {
    window.history.replaceState(null, '', '#query-parameters-state');
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});

    render(
      <AnchorSection segments={['parameters', 'query']}>
        <OpenApiSchema
          client={{ name: 'filter' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            properties: {
              state: { type: 'string' },
            },
            type: 'object',
          }}
        />
      </AnchorSection>,
    );

    await waitFor(() => {
      expect(
        new URL(window.location.href).searchParams.get('s-highlight'),
      ).toBe('state');
    });
    const row = screen.getByText('state').closest('.openapi-schema-field-row');
    expect(row).toHaveAttribute('data-openapi-schema-highlighted');
    expect(row).toHaveAttribute(
      'id',
      expect.stringContaining('parameters.query.filter'),
    );
    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockRestore();
  });

  it('shows parameter copy feedback briefly and then clears it', async () => {
    vi.useFakeTimers();
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      render(
        <AnchorSection segments={['parameters', 'query']}>
          <OpenApiSchema
            client={{ name: 'state' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{ type: 'string' }}
          />
        </AnchorSection>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Copy link to state' }),
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(clipboardWriteText).toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Copied link to state' }),
      ).toBeVisible();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(
        screen.getByRole('button', { name: 'Copy link to state' }),
      ).toBeVisible();
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('does not schedule parameter copy feedback after unmount', async () => {
    vi.useFakeTimers();
    let resolveClipboard!: () => void;
    const clipboardWriteText = vi.fn(
      () => new Promise<void>((resolve) => (resolveClipboard = resolve)),
    );
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      const { unmount } = render(
        <AnchorSection segments={['parameters', 'query']}>
          <OpenApiSchema
            client={{ name: 'state' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{ type: 'string' }}
          />
        </AnchorSection>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Copy link to state' }),
      );
      await act(async () => {
        await Promise.resolve();
      });
      expect(clipboardWriteText).toHaveBeenCalled();
      unmount();
      resolveClipboard();
      await act(async () => {
        await Promise.resolve();
      });

      expect(vi.getTimerCount()).toBe(0);
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('does not show body copy feedback when clipboard rejects', async () => {
    const clipboardWriteText = vi
      .fn()
      .mockRejectedValue(new Error('clipboard unavailable'));
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      renderSchema();
      fireEvent.click(
        within(
          getRenderedSchemaText('name')?.closest('div.border-t') as HTMLElement,
        ).getByRole('button', { name: 'Copy link to name' }),
      );

      await waitFor(() => expect(clipboardWriteText).toHaveBeenCalled());
      expect(
        screen.queryByRole('button', { name: 'Copied link to name' }),
      ).not.toBeInTheDocument();
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('does not show parameter copy feedback when clipboard rejects', async () => {
    const clipboardWriteText = vi
      .fn()
      .mockRejectedValue(new Error('clipboard unavailable'));
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      render(
        <AnchorSection segments={['parameters', 'query']}>
          <OpenApiSchema
            client={{ name: 'state' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{ type: 'string' }}
          />
        </AnchorSection>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Copy link to state' }),
      );

      await waitFor(() => expect(clipboardWriteText).toHaveBeenCalled());
      expect(
        screen.queryByRole('button', { name: 'Copied link to state' }),
      ).not.toBeInTheDocument();
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('encodes DOM ids without collisions between encoded and literal names', () => {
    const encodedQuestion = stableDomId('schema-root', 'a?b');
    const literalDash = stableDomId('schema-root', 'a-3f-b');
    const firstTuple = stableDomId('a', 'b-c');
    const secondTuple = stableDomId('a-b', 'c');
    const special = stableDomId('root/带空格', 'node|\0?');
    const rootTuple = stableDomId('openapi-1-a-1-b', 'openapi-1-a-1-b');
    const nonRootTuple = stableDomId('a', 'b');

    expect(encodedQuestion).not.toBe(literalDash);
    expect(firstTuple).not.toBe(secondTuple);
    expect(rootTuple).not.toBe(nonRootTuple);
    expect(rootTuple).toBe('openapi-1-a-1-b');
    expect(encodedQuestion).not.toMatch(/[\0|]/);
    expect(literalDash).not.toMatch(/[\0|]/);
    expect(special).toBe(stableDomId('root/带空格', 'node|\0?'));
    expect(special).not.toMatch(/[\0|]/);
  });

  it('copies and reveals fields whose names contain path delimiters', async () => {
    const fieldName = 'field|name\0value';
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });

    try {
      render(
        <AnchorSection segments={['request-body', 'application-json']}>
          <OpenApiSchema
            client={{ as: 'body', name: 'body' }}
            legacyAnchorPrefix="request-body"
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{
              properties: { [fieldName]: { type: 'string' } },
              type: 'object',
            }}
          />
        </AnchorSection>,
      );

      fireEvent.click(
        within(
          screen.getByText(fieldName).closest('div.border-t') as HTMLElement,
        ).getByRole('button', { name: `Copy link to ${fieldName}` }),
      );
      await waitFor(() => expect(clipboardWriteText).toHaveBeenCalled());
      const copiedUrlText = clipboardWriteText.mock.calls[0][0] as string;
      const copiedUrl = new URL(copiedUrlText);
      expect(copiedUrl.searchParams.get('s-highlight')).toBe(fieldName);
      expect(copiedUrlText).toContain('s-highlight=field%7Cname%00value');

      cleanup();
      window.history.replaceState(null, '', copiedUrl);
      render(
        <AnchorSection segments={['request-body', 'application-json']}>
          <OpenApiSchema
            client={{ as: 'body', name: 'body' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={{
              properties: { [fieldName]: { type: 'string' } },
              type: 'object',
            }}
          />
        </AnchorSection>,
      );
      await waitFor(() => {
        expect(
          screen.getByText(fieldName).closest('.openapi-schema-field-row'),
        ).toHaveAttribute('data-openapi-schema-highlighted');
      });
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
  });

  it('reveals nested fields in array parameter schemas through legacy and official paths', async () => {
    const fieldName = 'state|value\0x';
    const root = {
      items: {
        properties: { [fieldName]: { type: 'string' } },
        type: 'object',
      },
      type: 'array',
    };

    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    try {
      window.history.replaceState(null, '', '#query-parameters-state-value-x');
      const first = render(
        <AnchorSection segments={['parameters', 'query']}>
          <OpenApiSchema
            client={{ name: 'filters' }}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            root={root}
          />
        </AnchorSection>,
      );

      await waitFor(() => {
        const stateRow = screen
          .getByText(fieldName)
          .closest('.openapi-schema-field-row');
        expect(stateRow).toHaveAttribute('data-openapi-schema-highlighted');
        expect(stateRow).toHaveAttribute(
          'id',
          expect.stringContaining('parameters.query.filters'),
        );
      });
      expect(scrollIntoView).toHaveBeenCalled();
      const path = new URL(window.location.href).searchParams.get('path');
      expect(path).toBeTruthy();
      if (!path) throw new Error('Expected the legacy hash to create a path');

      first.unmount();
      const currentPath = JSON.parse(decodeURIComponent(path ?? '')) as Array<{
        $ref: string;
        name: string;
      }>;
      const generated = generateSchemaUI({
        renderCodeblock: ({ code }) => <pre>{code}</pre>,
        renderMarkdown: (markdown) => <p>{markdown}</p>,
        root: root as never,
      });
      const stateViewNode = flattenOpenApiSchemaView(
        buildOpenApiSchemaView(generated, 'filters'),
      ).find((node) => node.path === 'state|value\0x');
      const stateTarget = buildOpenApiSchemaFindTargets(generated, 'filters', {
        anchorPrefix: 'query-parameters',
        rootDisplay: 'property-trigger',
      }).find((target) => target.fieldPath === 'state|value\0x');
      expect(stateTarget?.parentPath).toEqual(stateViewNode?.parentPath);
      expect(currentPath).toEqual(stateViewNode?.parentPath);
      const legacyPath = [
        { $ref: generated.$root, name: 'filters' },
        ...currentPath,
      ];
      const officialPaths = [
        path,
        encodeOpenApiSchemaPath(legacyPath),
        legacyPath
          .map((item) => encodeURIComponent(JSON.stringify(item)))
          .join('|'),
      ];

      for (const officialPath of officialPaths) {
        window.history.replaceState(
          null,
          '',
          `/?path=${encodeURIComponent(officialPath)}&s-highlight=${encodeURIComponent(fieldName)}#parameters.query.filters`,
        );
        const next = render(
          <AnchorSection segments={['parameters', 'query']}>
            <OpenApiSchema
              client={{ name: 'filters' }}
              renderCodeblock={({ code }) => <pre>{code}</pre>}
              renderMarkdown={(markdown) => <p>{markdown}</p>}
              root={root}
            />
          </AnchorSection>,
        );

        await waitFor(() => {
          const stateRow = screen
            .getByText(fieldName)
            .closest('.openapi-schema-field-row');
          expect(stateRow).toHaveAttribute('data-openapi-schema-highlighted');
          expect(stateRow).toHaveAttribute(
            'id',
            expect.stringContaining('parameters.query.filters'),
          );
        });
        expect(scrollIntoView).toHaveBeenCalledTimes(
          officialPaths.indexOf(officialPath) + 2,
        );
        next.unmount();
      }
    } finally {
      scrollIntoView.mockRestore();
    }
  });

  it('renders array object parameter fields inline for native browser find', () => {
    render(
      <AnchorSection segments={['parameters', 'query']}>
        <OpenApiSchema
          client={{ name: 'filters' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            items: {
              properties: {
                state: { type: 'string' },
              },
              type: 'object',
            },
            type: 'array',
          }}
        />
      </AnchorSection>,
    );

    expect(getRenderedSchemaText('state')).toBeVisible();
    expect(screen.getByText('array<object>')).not.toHaveRole('button');
    expect(screen.queryByPlaceholderText('Filter Properties')).toBeNull();
  });

  it('renders root array body fields beneath the array container', () => {
    render(
      <AnchorSection segments={['request-body', 'application-json']}>
        <OpenApiSchema
          client={{ as: 'body', name: 'body' }}
          renderCodeblock={({ code }) => <pre>{code}</pre>}
          renderMarkdown={(markdown) => <p>{markdown}</p>}
          root={{
            description: 'The array response.',
            items: {
              properties: {
                state: { type: 'string' },
              },
              type: 'object',
            },
            type: 'array',
          }}
        />
      </AnchorSection>,
    );

    expect(getRenderedSchemaText('body')).toBeVisible();
    expect(getRenderedSchemaText('state')).toBeVisible();
    expect(screen.getAllByText('The array response.')).toHaveLength(1);
    expect(screen.getByPlaceholderText('Filter Properties')).toBeVisible();
  });

  it('encodes an official union selection when indexing nested fields', () => {
    const targets = buildOpenApiSchemaFindTargets(
      {
        $root: 'root',
        refs: {
          root: {
            aliasName: 'object',
            props: [{ $type: 'variant', name: 'mode', required: false }],
            type: 'object',
            typeName: 'object',
          },
          variant: {
            aliasName: 'A | B',
            items: [
              { $type: 'a', name: 'A' },
              { $type: 'b', name: 'B' },
            ],
            type: 'or',
            typeName: 'A | B',
          },
          a: {
            aliasName: 'object',
            props: [{ $type: 'string', name: 'alpha', required: false }],
            type: 'object',
            typeName: 'object',
          },
          b: {
            aliasName: 'object',
            props: [{ $type: 'string', name: 'beta', required: false }],
            type: 'object',
            typeName: 'object',
          },
          string: {
            aliasName: 'string',
            type: 'primitive',
            typeName: 'string',
          },
        },
      },
      'body',
      { anchorPrefix: 'request-body', rootDisplay: 'inline' },
    );

    expect(targets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          legacyAnchorId: 'request-body-mode-alpha',
          parentPath: [
            { $ref: 'root', name: 'body' },
            { $ref: 'variant', name: 'mode', tabValues: ['a'] },
          ],
        }),
        expect.objectContaining({
          legacyAnchorId: 'request-body-mode-beta',
          parentPath: [
            { $ref: 'root', name: 'body' },
            { $ref: 'variant', name: 'mode', tabValues: ['b'] },
          ],
        }),
      ]),
    );
  });
});
