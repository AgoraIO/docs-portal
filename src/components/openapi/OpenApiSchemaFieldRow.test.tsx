import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OpenApiSchemaViewNode } from '@/lib/openapi/schema-view';
import { OpenApiSchemaFieldRow } from './OpenApiSchemaFieldRow';

const labels = {
  allowedValues: 'Allowed values',
  collapse: 'Collapse',
  copiedLink: 'Copied link to',
  copyLink: 'Copy link to',
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
    expect(screen.getByText('Optional')).toBeInTheDocument();
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
        remainingInfoTags={[<span key="format">Format: slug</span>]}
      />,
    );

    const allowedValues = screen.getByText('Allowed values').parentElement;
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
    expect(screen.getByText('Format: slug')).toBeInTheDocument();
  });
});
