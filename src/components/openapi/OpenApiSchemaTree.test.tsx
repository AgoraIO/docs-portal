import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { OpenApiSchemaRow } from '@/lib/openapi/schema-tree';
import { OpenApiSchemaTree } from './OpenApiSchemaTree';

const labels = {
  collapse: 'Collapse',
  collapseAll: 'Collapse all',
  copyLink: 'Copy link to',
  deprecated: 'Deprecated',
  expand: 'Expand',
  expandAll: 'Expand all',
  optional: 'optional',
  properties: 'properties',
  required: 'required',
  schemaFields: 'schema fields',
};

const root = {
  properties: {
    properties: {
      properties: {
        channel: { type: 'string' },
        llm: {
          nullable: true,
          properties: {
            url: { type: 'string' },
          },
          type: 'object',
        },
        optionalObject: {
          properties: {
            enabled: { type: 'boolean' },
          },
          type: 'object',
        },
      },
      required: ['channel', 'llm'],
      type: 'object',
    },
  },
  required: ['properties'],
  type: 'object',
};

function renderTree(usage: 'request' | 'response' = 'request') {
  return render(
    <OpenApiSchemaTree
      anchorPrefix="request-body"
      labels={labels}
      renderCallouts={() => null}
      renderDescription={(markdown) => <span>{markdown}</span>}
      renderMetadata={() => null}
      root={root}
      usage={usage}
    />,
  );
}

describe('OpenApiSchemaTree', () => {
  it('initially expands required request objects while response children stay hidden', () => {
    const { rerender } = renderTree();

    expect(screen.getByText('channel')).toBeVisible();
    expect(screen.getByText('llm')).toBeVisible();
    expect(screen.getByText('url')).not.toBeVisible();
    expect(screen.getByText('optionalObject')).toBeVisible();
    expect(screen.getByText('enabled')).not.toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Collapse all schema fields' }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand llm properties' }),
    );
    expect(screen.getByText('object | null')).toBeVisible();
    expect(screen.queryByText('null | null')).not.toBeInTheDocument();

    rerender(
      <OpenApiSchemaTree
        anchorPrefix="response-body"
        labels={labels}
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={root}
        usage="response"
      />,
    );
    expect(screen.getByText('properties')).toBeVisible();
    expect(screen.getByText('channel')).not.toBeVisible();
  });

  it('collapses and expands all rows from the request default state', () => {
    renderTree();
    const tree = screen.getByTestId('openapi-schema-tree');

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse all schema fields' }),
    );
    expect(within(tree).getByText('channel')).not.toBeVisible();
    expect(within(tree).getByText('url')).not.toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Expand all schema fields' }),
    );
    expect(within(tree).getByText('url')).toBeVisible();
    expect(within(tree).getByText('enabled')).toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse llm properties' }),
    );
    expect(within(tree).getByText('url')).not.toBeVisible();
  });

  it('lets nested object parameters collapse independently from sibling branches', () => {
    renderTree();
    const tree = screen.getByTestId('openapi-schema-tree');

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Expand llm properties' }),
    );
    expect(within(tree).getByText('url')).toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', {
        name: 'Expand optionalObject properties',
      }),
    );
    expect(within(tree).getByText('enabled')).toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', {
        name: 'Collapse llm properties',
      }),
    );
    expect(within(tree).getByText('url')).not.toBeVisible();
    expect(within(tree).getByText('enabled')).toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', {
        name: 'Expand llm properties',
      }),
    );
    expect(within(tree).getByText('url')).toBeVisible();
  });

  it('keeps collapsed fields findable and reveals only the matched ancestor chain', () => {
    renderTree();
    const tree = screen.getByTestId('openapi-schema-tree');
    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse all schema fields' }),
    );

    const matchedRow = within(tree)
      .getByText('enabled')
      .closest('[data-openapi-schema-row]');
    const unrelatedRow = within(tree)
      .getByText('url')
      .closest('[data-openapi-schema-row]');

    expect(matchedRow).toHaveAttribute('hidden', 'until-found');
    expect(matchedRow).not.toBeVisible();
    expect(unrelatedRow).toHaveAttribute('hidden', 'until-found');

    fireEvent(matchedRow as HTMLElement, new Event('beforematch'));

    expect(matchedRow).not.toHaveAttribute('hidden');
    expect(matchedRow).toBeVisible();
    expect(
      within(tree).getByRole('button', {
        name: 'Collapse properties properties',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(tree).getByRole('button', {
        name: 'Collapse optionalObject properties',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(unrelatedRow).toHaveAttribute('hidden', 'until-found');
    expect(unrelatedRow).not.toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', {
        name: 'Collapse properties properties',
      }),
    );
    expect(matchedRow).toHaveAttribute('hidden', 'until-found');
    expect(matchedRow).not.toBeVisible();
  });

  it('clears collapsed descendant disclosure so one toolbar expansion restores the full branch', () => {
    renderTree();
    const tree = screen.getByTestId('openapi-schema-tree');

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse all schema fields' }),
    );
    fireEvent.click(
      within(tree).getByRole('button', { name: 'Expand all schema fields' }),
    );
    fireEvent.click(
      within(tree).getByRole('button', {
        name: 'Collapse properties properties',
      }),
    );

    expect(
      within(tree).getByRole('button', { name: 'Expand all schema fields' }),
    ).toBeVisible();
    fireEvent.click(
      within(tree).getByRole('button', { name: 'Expand all schema fields' }),
    );
    expect(within(tree).getByText('url')).toBeVisible();
  });

  it('preserves user disclosure on ordinary rerenders and resets it for a new identity', () => {
    const { rerender } = renderTree();

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse all schema fields' }),
    );
    rerender(
      <OpenApiSchemaTree
        anchorPrefix="request-body"
        labels={labels}
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={root}
        usage="request"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Expand all schema fields' }),
    ).toBeVisible();

    rerender(
      <OpenApiSchemaTree
        anchorPrefix="request-body"
        labels={labels}
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={{ ...root }}
        usage="request"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Collapse all schema fields' }),
    ).toBeVisible();
  });

  it('resets disclosure when array item wrapper rendering changes', () => {
    const { rerender } = renderTree();

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse all schema fields' }),
    );
    expect(screen.getByText('channel')).not.toBeVisible();

    rerender(
      <OpenApiSchemaTree
        anchorPrefix="request-body"
        labels={labels}
        omitArrayItemWrapperRows
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={root}
        usage="request"
      />,
    );

    expect(screen.getByText('channel')).toBeVisible();
  });

  it('resets disclosure when a referenced document changes', () => {
    const refRoot = { $ref: '#/components/schemas/request' };
    const documentA = {
      components: {
        schemas: {
          request: {
            properties: {
              config: {
                properties: { token: { type: 'string' } },
                type: 'object',
              },
            },
            required: ['config'],
            type: 'object',
          },
        },
      },
    };
    const documentB = {
      components: {
        schemas: {
          request: {
            properties: {
              settings: {
                properties: { region: { type: 'string' } },
                type: 'object',
              },
            },
            required: ['settings'],
            type: 'object',
          },
        },
      },
    };
    const renderReferencedTree = (document: unknown) => (
      <OpenApiSchemaTree
        anchorPrefix="request-body"
        document={document}
        labels={labels}
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={refRoot}
        usage="request"
      />
    );
    const { rerender } = render(renderReferencedTree(documentA));

    expect(screen.getByText('token')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse all schema fields' }),
    );
    expect(screen.getByText('token')).not.toBeVisible();

    rerender(renderReferencedTree(documentB));

    expect(screen.getByText('settings')).toBeVisible();
    expect(screen.getByText('region')).toBeVisible();
  });

  it('opens every ancestor of a nested hash target', async () => {
    window.history.replaceState(
      null,
      '',
      '#request-body-properties-optional-object-enabled',
    );
    renderTree();

    await waitFor(() => {
      expect(screen.getByText('enabled')).toBeVisible();
    });
    window.history.replaceState(null, '', '/');
  });

  it('cancels initial and hash scroll animation frames on unmount', () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    const cancelled: number[] = [];
    let nextFrameId = 1;
    const requestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        const frameId = nextFrameId;
        nextFrameId += 1;
        callbacks.set(frameId, callback);
        return frameId;
      });
    const cancelAnimationFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation((frameId) => {
        cancelled.push(frameId);
        callbacks.delete(frameId);
      });
    const scrollTo = vi.spyOn(window, 'scrollTo');

    const { unmount } = renderTree();
    window.history.replaceState(
      null,
      '',
      '#request-body-properties-optional-object-enabled',
    );
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(Array.from(callbacks.keys())).toEqual([1, 2]);

    unmount();

    expect(cancelled).toEqual(expect.arrayContaining([1, 2]));
    expect(callbacks.size).toBe(0);
    expect(scrollTo).not.toHaveBeenCalled();

    requestAnimationFrame.mockRestore();
    cancelAnimationFrame.mockRestore();
    scrollTo.mockRestore();
    window.history.replaceState(null, '', '/');
  });

  it('initially expands a sole optional object alongside a leaf request field', () => {
    render(
      <OpenApiSchemaTree
        anchorPrefix="request-body"
        labels={labels}
        renderCallouts={() => null}
        renderDescription={(markdown) => <span>{markdown}</span>}
        renderMetadata={() => null}
        root={{
          properties: {
            name: { type: 'string' },
            properties: {
              properties: {
                token: { type: 'string' },
              },
              type: 'object',
            },
          },
          type: 'object',
        }}
        usage="request"
      />,
    );

    expect(screen.getByText('name')).toBeVisible();
    expect(screen.getByText('token')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Collapse properties properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses stable prebuilt rows instead of rebuilding an invalid root and resets for a new rows identity', async () => {
    const prebuiltRows: OpenApiSchemaRow[] = [
      {
        depth: 0,
        name: 'manual',
        path: 'manual',
        required: false,
        type: 'object',
      },
      {
        depth: 1,
        name: 'field',
        path: 'manual.field',
        required: false,
        type: 'string',
      },
    ];
    const props = {
      anchorPrefix: 'responses-200',
      labels,
      prebuiltRows,
      renderCallouts: () => null,
      renderDescription: (markdown: string) => <span>{markdown}</span>,
      renderMetadata: () => null,
      root: null,
      usage: 'request' as const,
    };
    const { rerender } = render(<OpenApiSchemaTree {...props} />);

    expect(screen.getByText('manual')).toBeVisible();
    expect(screen.getByText('field')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse manual properties' }),
    );

    rerender(<OpenApiSchemaTree {...props} />);
    expect(screen.getByText('field')).not.toBeVisible();

    rerender(<OpenApiSchemaTree {...props} prebuiltRows={[...prebuiltRows]} />);
    await waitFor(() => expect(screen.getByText('field')).toBeVisible());
  });
});
