import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
    expect(screen.queryByText('url')).not.toBeInTheDocument();
    expect(screen.getByText('optionalObject')).toBeVisible();
    expect(screen.queryByText('enabled')).not.toBeInTheDocument();
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
    expect(screen.queryByText('channel')).not.toBeInTheDocument();
  });

  it('collapses and expands all rows from the request default state', () => {
    renderTree();
    const tree = screen.getByTestId('openapi-schema-tree');

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse all schema fields' }),
    );
    expect(within(tree).queryByText('channel')).not.toBeInTheDocument();
    expect(within(tree).queryByText('url')).not.toBeInTheDocument();

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Expand all schema fields' }),
    );
    expect(within(tree).getByText('url')).toBeVisible();
    expect(within(tree).getByText('enabled')).toBeVisible();

    fireEvent.click(
      within(tree).getByRole('button', { name: 'Collapse llm properties' }),
    );
    expect(within(tree).queryByText('url')).not.toBeInTheDocument();
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
});
