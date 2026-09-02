import { AnchorSection } from '@fumadocs/api-docs/auto-anchor/client';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { buildOpenApiSchemaFindTargets, OpenApiSchema } from './OpenApiSchema';

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

  it('gives each field permalink control an accessible name', () => {
    renderSchema();

    const nameRow = getRenderedSchemaText('name')?.closest('div.border-t');

    expect(
      within(nameRow as HTMLElement).getByRole('button', {
        name: 'Copy link to name',
      }),
    ).toBeVisible();
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
