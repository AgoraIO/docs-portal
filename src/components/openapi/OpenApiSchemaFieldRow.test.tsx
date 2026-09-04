import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OpenApiSchemaViewNode } from '@/lib/openapi/schema-view';
import { OpenApiSchemaFieldRow } from './OpenApiSchemaFieldRow';

const labels = {
  allowedValues: 'Allowed values',
  collapse: 'Collapse',
  copiedLink: 'Copied link to',
  copyLink: 'Copy link to',
  deprecated: 'Deprecated',
  expand: 'Expand',
  optional: 'Optional',
  properties: 'properties',
  required: 'Required',
};

const node: OpenApiSchemaViewNode = {
  $type: 'UserId',
  children: [],
  depth: 0,
  id: 'user-id',
  name: 'id',
  parentPath: [],
  path: 'id',
  required: true,
  schema: {
    aliasName: 'string',
    allowedValues: ['user'],
    description: 'The user identifier.',
    infoTags: [],
    type: 'primitive',
    typeName: 'string',
  },
};

function makeNode(
  overrides: Partial<OpenApiSchemaViewNode> = {},
): OpenApiSchemaViewNode {
  return {
    ...node,
    ...overrides,
    schema: { ...node.schema, ...(overrides.schema ?? {}) },
  };
}

describe('OpenApiSchemaFieldRow', () => {
  it('keeps expandable and leaf fields on the same content column', () => {
    render(
      <>
        <OpenApiSchemaFieldRow
          copied={false}
          expanded={false}
          labels={labels}
          node={makeNode({
            children: [makeNode({ id: 'child', name: 'child' })],
            name: 'profile',
            schema: {
              aliasName: 'object',
              description: 'Profile configuration.',
              props: [],
              type: 'object',
              typeName: 'object',
            },
          })}
          onCopy={() => {}}
          onExpandedChange={() => {}}
        />
        <OpenApiSchemaFieldRow
          copied={false}
          expanded={false}
          labels={labels}
          node={makeNode({
            id: 'pipeline-id',
            name: 'pipeline_id',
            schema: {
              aliasName: 'string',
              description: 'Published agent identifier.',
              type: 'primitive',
              typeName: 'string',
            },
          })}
          onCopy={() => {}}
          onExpandedChange={() => {}}
        />
      </>,
    );

    const expandableLeading = document.querySelector(
      '[data-openapi-field-leading="expandable"]',
    );
    const leafLeading = document.querySelector(
      '[data-openapi-field-leading="leaf"]',
    );

    expect(expandableLeading).toHaveClass('openapi-schema-field-leading');
    expect(leafLeading).toHaveClass('openapi-schema-field-leading');
    expect(
      expandableLeading?.querySelector('[data-openapi-field-gutter]'),
    ).toBeInTheDocument();
    expect(
      leafLeading?.querySelector('[data-openapi-field-gutter]'),
    ).toBeInTheDocument();
    expect(
      leafLeading?.querySelector('[data-openapi-field-gutter] button'),
    ).toBeNull();
    expect(
      expandableLeading?.querySelector('[data-openapi-field-gutter] button'),
    ).toBeInTheDocument();
    expect(
      expandableLeading?.querySelector('.openapi-schema-field-content'),
    ).toBeInTheDocument();
    expect(
      leafLeading?.querySelector('.openapi-schema-field-content'),
    ).toBeInTheDocument();
    expect(screen.getByText('Profile configuration.')).toHaveClass(
      'openapi-schema-field-description',
    );
    expect(screen.getByText('Published agent identifier.')).toHaveClass(
      'openapi-schema-field-description',
    );
    expect(
      screen.getByText('Profile configuration.').parentElement,
    ).toHaveClass('openapi-schema-field-details');
    expect(
      screen.getByText('Published agent identifier.').parentElement,
    ).toHaveClass('openapi-schema-field-details');
  });

  it('renders required and deprecated statuses together in the row status area', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({
          schema: { ...node.schema, deprecated: true },
        })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    const row = screen.getByText('id').closest('.openapi-schema-field-row');
    expect(row).toBeInstanceOf(HTMLElement);

    const required = within(row as HTMLElement).getByText('Required');
    const deprecated = within(row as HTMLElement).getByText('Deprecated');
    expect(required).toHaveClass(
      'openapi-schema-status',
      'border-red-200',
      'bg-red-50',
      'text-red-700',
    );
    expect(deprecated).toHaveClass(
      'openapi-schema-status',
      'border-orange-200',
      'bg-orange-50',
      'text-orange-800',
    );
    expect(screen.getByText('id')).toHaveClass('line-through');
    expect(screen.getByText('string')).not.toHaveClass('line-through');
    expect(screen.getByText('The user identifier.')).not.toHaveClass(
      'line-through',
    );
    expect(
      within(row as HTMLElement).getByRole('button', {
        name: 'Copy link to id',
      }),
    ).toBeInTheDocument();
  });

  it('renders the field name, adjacent type, required badge, and description', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={node}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    expect(screen.getByText('id')).toHaveClass('font-mono', 'font-semibold');
    expect(screen.getByText('string')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('The user identifier.')).toHaveClass(
      'font-normal',
      'text-muted-foreground',
    );
    expect(screen.getByText('id').nextElementSibling).toHaveTextContent(
      'string',
    );
  });

  it('identifies the union branch next to the field type', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({ variant: 'EmailAddress' })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    expect(screen.getByText('(EmailAddress)')).toHaveAttribute(
      'data-openapi-schema-variant',
    );
  });

  it('uses an accessible Button for expandable fields and reports the next state', () => {
    const onExpandedChange = vi.fn();
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({
          children: [makeNode({ id: 'nested-id', name: 'nested' })],
          name: 'profile',
          required: false,
          schema: {
            aliasName: 'object',
            props: [],
            type: 'object',
            typeName: 'object',
          },
        })}
        onCopy={() => {}}
        onExpandedChange={onExpandedChange}
      />,
    );

    const button = screen.getByRole('button', {
      name: 'Expand profile properties',
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Optional')).toHaveClass(
      'openapi-schema-status',
      'border-border',
      'bg-muted',
      'text-muted-foreground',
    );
  });

  it('reflects the expanded state in the accessible button contract', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded
        labels={labels}
        node={makeNode({
          children: [makeNode({ id: 'nested-id', name: 'nested' })],
          name: 'profile',
          schema: {
            aliasName: 'object',
            props: [],
            type: 'object',
            typeName: 'object',
          },
        })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Collapse profile properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('gives mixed duplicate allowed values unique React keys', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({
          name: 'value',
          schema: {
            aliasName: 'string | number',
            allowedValues: ['1', 1, '1', 1],
            type: 'primitive',
            typeName: 'string | number',
          },
        })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    const keys = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-openapi-allowed-value-key]',
      ),
    ).map((token) => token.dataset.openapiAllowedValueKey);
    expect(keys).toHaveLength(4);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps long field identities and allowed values wrappable on narrow layouts', () => {
    const longFieldName = 'field-with-a-very-long-name-that-must-wrap';
    const longTypeName = 'custom-type-with-a-very-long-name-that-must-wrap';
    const longAllowedValue =
      'allowed-value-with-a-very-long-name-that-must-wrap';

    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({
          children: [makeNode({ id: 'nested', name: 'nested' })],
          name: longFieldName,
          schema: {
            aliasName: longTypeName,
            allowedValues: [longAllowedValue],
            props: [],
            type: 'object',
            typeName: longTypeName,
          },
        })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    const expandButton = screen.getByRole('button', {
      name: `Expand ${longFieldName} properties`,
    });
    expect(expandButton).toHaveClass('size-3', 'shrink-0');
    expect(
      expandButton.closest('[data-openapi-field-gutter]'),
    ).toBeInTheDocument();
    expect(
      expandButton
        .closest('[data-openapi-field-leading]')
        ?.querySelector('.openapi-schema-field-content'),
    ).toBeInTheDocument();
    expect(screen.getByText(longFieldName)).toHaveClass(
      'min-w-0',
      'break-words',
    );
    expect(screen.getByText(longTypeName)).toHaveClass(
      'min-w-0',
      'break-words',
    );
    expect(screen.getByText(longAllowedValue)).toHaveClass('break-words');
  });

  it('keeps requiredness badges title case and right-aligned', () => {
    const { rerender } = render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={node}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );

    expect(screen.getByText('Required')).toHaveClass(
      'ml-auto',
      'normal-case',
      'tracking-normal',
    );
    expect(screen.getByText('Required')).toHaveTextContent('Required');

    rerender(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({ required: false })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
      />,
    );
    expect(screen.getByText('Optional')).toHaveClass(
      'ml-auto',
      'normal-case',
      'tracking-normal',
    );
    expect(screen.getByText('Optional')).toHaveTextContent('Optional');
  });

  it('uses the copy callback and keeps the accessible label in the copied state', () => {
    const onCopy = vi.fn();
    const { rerender } = render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={node}
        onCopy={onCopy}
        onExpandedChange={() => {}}
      />,
    );

    const copyButton = screen.getByRole('button', {
      name: 'Copy link to id',
    });
    fireEvent.click(copyButton);
    expect(onCopy).toHaveBeenCalledTimes(1);

    rerender(
      <OpenApiSchemaFieldRow
        copied
        expanded={false}
        labels={labels}
        node={node}
        onCopy={onCopy}
        onExpandedChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Copied link to id' }),
    ).toBeInTheDocument();
  });

  it('renders allowed values as unquoted wrapping code tokens and keeps other info tags', () => {
    render(
      <OpenApiSchemaFieldRow
        copied={false}
        expanded={false}
        labels={labels}
        node={makeNode({
          name: 'mode',
          schema: {
            aliasName: 'string',
            allowedValues: ['draft', 'published', { key: 'value' }],
            type: 'primitive',
            typeName: 'string',
          },
        })}
        onCopy={() => {}}
        onExpandedChange={() => {}}
        remainingInfoTags={[
          <span key="format">Format: slug</span>,
          <span key="default">Default: byok</span>,
        ]}
      />,
    );

    const allowedValues = screen.getByText('Allowed values').parentElement;
    expect(allowedValues?.parentElement).toHaveClass(
      'openapi-schema-field-details',
    );
    expect(allowedValues).toHaveClass('flex-wrap');
    expect(
      within(allowedValues as HTMLElement).getByText('draft'),
    ).toBeInTheDocument();
    expect(
      within(allowedValues as HTMLElement).queryByText('"draft"'),
    ).not.toBeInTheDocument();
    expect(
      within(allowedValues as HTMLElement).getByText('published'),
    ).toBeInTheDocument();
    expect(
      within(allowedValues as HTMLElement).getByText('{"key":"value"}'),
    ).toBeInTheDocument();
    expect(allowedValues?.querySelectorAll('code')).toHaveLength(3);
    expect(allowedValues?.querySelector('ul')).not.toBeInTheDocument();
    expect(allowedValues?.querySelector('ol, li')).not.toBeInTheDocument();
    expect(
      allowedValues?.querySelector('[class*="list-"]'),
    ).not.toBeInTheDocument();
    expect(
      allowedValues?.querySelector('[class*="shadow"]'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Format: slug')).toBeInTheDocument();
    expect(screen.getByText('Default: byok')).toBeInTheDocument();
    expect(
      screen
        .getByText('Default: byok')
        .closest('.openapi-schema-field-details'),
    ).toBeInTheDocument();
  });
});
