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

    expect(requiredRow).toBeInstanceOf(HTMLElement);
    expect(optionalRow).toBeInstanceOf(HTMLElement);
    expect(within(requiredRow as HTMLElement).getByText('*')).toBeVisible();
    expect(within(optionalRow as HTMLElement).getByText('?')).toBeVisible();
    expect(screen.queryByText('required')).not.toBeInTheDocument();
    expect(screen.queryByText('optional')).not.toBeInTheDocument();

    fireEvent.change(filter, { target: { value: 'name' } });

    expect(getRenderedSchemaText('name')).toBeVisible();
    expect(queryRenderedSchemaText('config')).toHaveLength(0);
    expect(queryRenderedSchemaText('advanced')).toHaveLength(0);

    fireEvent.change(filter, { target: { value: '' } });
    expect(getRenderedSchemaText('config')).toBeVisible();
    expect(getRenderedSchemaText('advanced')).toBeVisible();
  });

  it('opens the official nested-object navigation and focuses its filter', async () => {
    renderSchema();

    const configRow = getRenderedSchemaText('config')?.closest('div.border-t');
    const typeTrigger = within(configRow as HTMLElement)
      .getByText('object')
      .closest('button');

    expect(typeTrigger).toBeInstanceOf(HTMLButtonElement);
    fireEvent.click(typeTrigger as HTMLButtonElement);

    await waitFor(() => {
      const visibleField = screen
        .getAllByText('idleTimeout')
        .find(
          (element) => !element.closest('[data-openapi-schema-find-index]'),
        );
      expect(visibleField).toBeVisible();
    });
    const filters = screen.getAllByPlaceholderText('Filter Properties');
    expect(filters).toHaveLength(2);
    expect(filters[1]).toHaveFocus();
  });

  it('restores a nested browser-find match through the official path protocol', async () => {
    renderSchema();

    const target = document.querySelector(
      '[data-openapi-schema-find-target="config.idleTimeout"]',
    );

    expect(target).toBeInstanceOf(HTMLElement);
    expect(target).toHaveAttribute('hidden', 'until-found');

    fireEvent(target as HTMLElement, new Event('beforematch'));

    await waitFor(() => {
      expect(
        new URL(window.location.href).searchParams.get('s-highlight'),
      ).toBe('idleTimeout');
      expect(screen.getAllByPlaceholderText('Filter Properties')).toHaveLength(
        2,
      );
    });
    expect(window.location.hash).toBe('#request-body.application-json.body');
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
      'request-body',
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
