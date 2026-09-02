import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  OpenApiSchemaPathItem,
  OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import { OpenApiSchemaTree } from './OpenApiSchemaTree';

const labels = {
  allowedValues: 'Allowed values',
  collapse: 'Collapse',
  collapseAll: 'Collapse all',
  copiedLink: 'Copied link to',
  copyLink: 'Copy link to',
  expand: 'Expand',
  expandAll: 'Expand all',
  filter: 'Filter properties',
  matchCount: 'matches',
  noMatches: 'No properties matching',
  optional: 'Optional',
  properties: 'properties',
  required: 'Required',
};

const rootPath: OpenApiSchemaPathItem = { $ref: 'root', name: 'body' };
const configPath: OpenApiSchemaPathItem = {
  $ref: 'config-type',
  name: 'config',
};
const advancedPath: OpenApiSchemaPathItem = {
  $ref: 'advanced-type',
  name: 'advanced',
};

function makeNode({
  children = [],
  depth = 0,
  name,
  parentPath = depth === 0 ? [rootPath] : [rootPath, configPath],
  required = false,
}: {
  children?: OpenApiSchemaViewNode[];
  depth?: number;
  name: string;
  parentPath?: OpenApiSchemaPathItem[];
  required?: boolean;
}): OpenApiSchemaViewNode {
  const path = [...parentPath.slice(1).map((item) => item.name), name].join(
    '.',
  );
  const id = `${path || name}-${depth}`;

  return {
    $type: `${name}-type`,
    children,
    depth,
    id,
    name,
    parentPath,
    path,
    required,
    schema: {
      aliasName: children.length > 0 ? 'object' : 'string',
      infoTags: [],
      props: [],
      type: children.length > 0 ? 'object' : 'primitive',
      typeName: children.length > 0 ? 'object' : 'string',
    } as OpenApiSchemaViewNode['schema'],
  };
}

const channel = makeNode({
  depth: 1,
  name: 'channel',
  parentPath: [rootPath, configPath],
  required: true,
});
const remoteRtcUids = makeNode({
  depth: 1,
  name: 'remote_rtc_uids',
  parentPath: [rootPath, configPath],
});
const config = makeNode({
  children: [channel, remoteRtcUids],
  name: 'config',
  required: true,
});
const advancedChild = makeNode({
  depth: 1,
  name: 'advancedChild',
  parentPath: [rootPath, advancedPath],
});
const advancedGrandchild = makeNode({
  depth: 2,
  name: 'advancedGrandchild',
  parentPath: [
    rootPath,
    advancedPath,
    { $ref: 'advancedChild-type', name: 'advancedChild' },
  ],
});
advancedChild.children = [advancedGrandchild];
const advanced = makeNode({
  children: [advancedChild],
  name: 'advanced',
  parentPath: [rootPath],
});
const unrelatedChild = makeNode({
  depth: 1,
  name: 'unrelatedChild',
  parentPath: [rootPath, { $ref: 'unrelated-type', name: 'unrelated' }],
});
const unrelated = makeNode({
  children: [unrelatedChild],
  name: 'unrelated',
  parentPath: [rootPath],
});
const nodes = [config, advanced, unrelated];

function renderTree(
  overrides: Partial<React.ComponentProps<typeof OpenApiSchemaTree>> = {},
) {
  return render(
    <OpenApiSchemaTree
      client={{ as: 'body', name: 'body', required: true }}
      labels={labels}
      nodes={nodes}
      onCopyFieldLink={() => {}}
      renderRemainingInfoTags={() => []}
      rootId="schema-root"
      {...overrides}
    />,
  );
}

function getRow(node: OpenApiSchemaViewNode) {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-openapi-schema-node-id]'),
  )
    .find((element) => element.dataset.openapiSchemaNodeId === node.id)
    ?.querySelector<HTMLElement>('.openapi-schema-field-row') as HTMLElement;
}

describe('OpenApiSchemaTree', () => {
  it('initially expands required root fields and keeps optional roots collapsed', () => {
    renderTree();

    expect(
      screen.getByRole('button', { name: 'Collapse config properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('channel')).toBeVisible();
    expect(screen.getByText('advancedChild')).not.toBeVisible();
    expect(
      getRow(advanced).parentElement?.querySelector(
        '[data-openapi-schema-hidden-children]',
      ),
    ).toBeTruthy();
  });

  it('toggles nested fields through the row button and updates ARIA state', () => {
    renderTree();

    const toggle = screen.getByRole('button', {
      name: 'Expand advanced properties',
    });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('advancedChild')).toBeVisible();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('advancedChild')).not.toBeVisible();
  });

  it('expands every expandable node and collapses them while keeping root rows', () => {
    renderTree();

    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    for (const node of [config, advanced, unrelated]) {
      expect(getRow(node).querySelector('[aria-expanded="true"]')).toBeTruthy();
    }
    expect(screen.getByText('advancedChild')).toBeVisible();
    expect(screen.getByText('unrelatedChild')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(screen.getByText('config')).toBeVisible();
    expect(screen.getByText('advanced')).toBeVisible();
    expect(screen.getByText('unrelated')).toBeVisible();
    expect(screen.getByText('channel')).not.toBeVisible();
    expect(screen.getByText('advancedChild')).not.toBeVisible();
    expect(screen.getByText('unrelatedChild')).not.toBeVisible();
  });

  it('recursively searches names and complete dotted paths with a polite count', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'remote_rtc_uids' } });
    expect(screen.getByText('remote_rtc_uids')).toBeVisible();
    expect(screen.getByText('config')).toBeVisible();
    expect(screen.getByText('channel')).not.toBeVisible();
    const matchCount = screen.getByText('1 matches');
    expect(matchCount).toHaveAttribute('aria-live', 'polite');
    expect(matchCount).not.toHaveClass('sr-only');
    expect(matchCount.tagName).toBe('SPAN');

    fireEvent.change(search, { target: { value: 'channel' } });
    expect(screen.getByText('channel')).toBeVisible();
    expect(screen.getByText('1 matches')).toBeVisible();

    fireEvent.change(search, { target: { value: 'config.remote_rtc_uids' } });
    expect(screen.getByText('remote_rtc_uids')).toBeVisible();
    expect(screen.getByText('config')).toBeVisible();
    expect(screen.getByText('1 matches')).toBeVisible();
  });

  it('lets row toggles override filtered expansion while searching', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'advancedGrandchild' } });
    const childToggle = screen.getByRole('button', {
      name: 'Collapse advancedChild properties',
    });

    fireEvent.click(childToggle);

    expect(
      screen.getByRole('button', { name: 'Expand advancedChild properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('advancedGrandchild')).not.toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand advancedChild properties' }),
    );

    expect(
      screen.getByRole('button', { name: 'Collapse advancedChild properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('advancedGrandchild')).toBeVisible();
  });

  it('lets expand all and collapse all override filtered expansion while searching', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'channel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));

    expect(screen.getByText('advancedChild')).toBeVisible();
    expect(screen.getByText('advancedGrandchild')).toBeVisible();
    expect(screen.getByText('unrelatedChild')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));

    expect(screen.getByText('config')).toBeVisible();
    expect(screen.getByText('advanced')).toBeVisible();
    expect(screen.getByText('unrelated')).toBeVisible();
    expect(screen.getByText('advancedChild')).not.toBeVisible();
    expect(screen.getByText('unrelatedChild')).not.toBeVisible();
  });

  it('resets manual search collapse when the query changes', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'channel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));

    fireEvent.change(search, { target: { value: 'remote_rtc_uids' } });

    expect(screen.getByText('remote_rtc_uids')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Collapse config properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the complete dotted path next to a direct search match', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'channel' } });

    expect(screen.getByText('config.channel')).toBeVisible();
  });

  it('keeps root rows and mounts hidden descendants for unrelated search branches', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    );

    fireEvent.change(search, { target: { value: 'channel' } });

    expect(screen.getByText('advanced')).toBeVisible();
    expect(screen.getByText('unrelated')).toBeVisible();
    expect(screen.getByText('advancedChild')).not.toBeVisible();
    expect(screen.getByText('unrelatedChild')).not.toBeVisible();
    expect(
      getRow(advanced).parentElement?.querySelector(
        '[data-openapi-schema-hidden-children][hidden="until-found"]',
      ),
    ).toBeTruthy();
    expect(
      getRow(unrelated).parentElement?.querySelector(
        '[data-openapi-schema-hidden-children][hidden="until-found"]',
      ),
    ).toBeTruthy();
  });

  it('announces zero search matches in the polite live status', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'does-not-exist' } });

    expect(screen.getByRole('status')).toHaveTextContent('0 matches');
  });

  it('reports no matches and restores the pre-search expansion state on Escape', () => {
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });
    const configToggle = screen.getByRole('button', {
      name: 'Collapse config properties',
    });
    fireEvent.click(configToggle);
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    );

    fireEvent.change(search, { target: { value: 'does-not-exist' } });
    expect(
      screen.getByText('No properties matching does-not-exist'),
    ).toBeVisible();
    fireEvent.keyDown(search, { key: 'Escape' });

    expect(search).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Expand config properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('button', { name: 'Collapse advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('focuses and scrolls the first direct match on Enter', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'advancedChild' } });
    expect(
      screen.getByRole('button', { name: 'Collapse advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() => {
      expect(focus).toHaveBeenCalled();
      expect(scrollIntoView).toHaveBeenCalled();
    });
    focus.mockRestore();
    scrollIntoView.mockRestore();
  });

  it('reveals a collapsed search branch before focusing and scrolling its match on Enter', async () => {
    const focusedElements: HTMLElement[] = [];
    const focus = vi
      .spyOn(HTMLElement.prototype, 'focus')
      .mockImplementation(function (this: HTMLElement) {
        focusedElements.push(this);
      });
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'advancedChild' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Collapse advanced properties' }),
      ).toHaveAttribute('aria-expanded', 'true');
      expect(focusedElements.at(-1)).toBe(getRow(advancedChild));
      expect(scrollIntoView).toHaveBeenCalled();
      expect(getRow(advancedChild)).not.toHaveAttribute('tabindex');
    });
    focus.mockRestore();
    scrollIntoView.mockRestore();
  });

  it('focuses the first direct match inside the current tree when IDs are duplicated', async () => {
    const focusedElements: HTMLElement[] = [];
    const focus = vi
      .spyOn(HTMLElement.prototype, 'focus')
      .mockImplementation(function (this: HTMLElement) {
        focusedElements.push(this);
      });
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});

    render(
      <div>
        <OpenApiSchemaTree
          client={{ as: 'body', name: 'body', required: true }}
          labels={labels}
          nodes={nodes}
          onCopyFieldLink={() => {}}
          renderRemainingInfoTags={() => []}
          rootId="schema-root-one"
        />
        <OpenApiSchemaTree
          client={{ as: 'body', name: 'body', required: true }}
          labels={labels}
          nodes={nodes}
          onCopyFieldLink={() => {}}
          renderRemainingInfoTags={() => []}
          rootId="schema-root-two"
        />
      </div>,
    );
    const searches = screen.getAllByRole('searchbox', {
      name: 'Filter properties',
    });
    const secondTree = document.getElementById(
      'schema-root-two',
    ) as HTMLElement;

    fireEvent.change(searches[1], { target: { value: 'advancedChild' } });
    fireEvent.keyDown(searches[1], { key: 'Enter' });

    const secondTarget = Array.from(
      secondTree.querySelectorAll<HTMLElement>('.openapi-schema-field-row'),
    ).find(
      (row) =>
        row.closest<HTMLElement>('[data-openapi-schema-node-id]')?.dataset
          .openapiSchemaNodeId === advancedChild.id,
    );
    const firstTree = document.getElementById('schema-root-one') as HTMLElement;
    const firstTarget = Array.from(
      firstTree.querySelectorAll<HTMLElement>('[data-openapi-schema-node-id]'),
    )
      .find(
        (element) => element.dataset.openapiSchemaNodeId === advancedChild.id,
      )
      ?.querySelector<HTMLElement>('.openapi-schema-field-row');

    expect(firstTarget).toHaveAttribute(
      'id',
      `schema-root-one-${advancedChild.id}`,
    );
    expect(secondTarget).toHaveAttribute(
      'id',
      `schema-root-two-${advancedChild.id}`,
    );
    expect(new Set([firstTarget?.id, secondTarget?.id]).size).toBe(2);

    await waitFor(() => expect(focusedElements.at(-1)).toBe(secondTarget));

    expect(scrollIntoView).toHaveBeenCalled();
    focus.mockRestore();
    scrollIntoView.mockRestore();
  });

  it('reveals hidden descendants through beforematch without opening unrelated branches', () => {
    renderTree({
      nodes: [advanced, unrelated],
    });
    const hidden = getRow(advanced).parentElement?.querySelector(
      '[data-openapi-schema-hidden-children]',
    );
    expect(hidden).toBeTruthy();

    fireEvent(hidden as HTMLElement, new Event('beforematch'));

    expect(
      screen.getByRole('button', { name: 'Collapse advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('advancedChild')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Expand unrelated properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('reveals a deep hidden descendant through only its ancestor chain', () => {
    renderTree({ nodes: [advanced, unrelated] });
    const deepHidden = getRow(advancedChild).parentElement?.querySelector(
      '[data-openapi-schema-hidden-children][hidden="until-found"]',
    );
    expect(deepHidden).toBeTruthy();

    fireEvent(deepHidden as HTMLElement, new Event('beforematch'));

    expect(
      screen.getByRole('button', { name: 'Collapse advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', {
        name: 'Collapse advancedChild properties',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('advancedGrandchild')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Expand unrelated properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands every ancestor when a deep hidden descendant fires beforematch during search', () => {
    renderTree({ nodes: [advanced, unrelated] });
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'channel' } });
    const deepHidden = getRow(advancedChild).parentElement?.querySelector(
      '[data-openapi-schema-hidden-children][hidden="until-found"]',
    );
    expect(deepHidden).toBeTruthy();

    fireEvent(deepHidden as HTMLElement, new Event('beforematch'));

    expect(
      screen.getByRole('button', { name: 'Collapse advanced properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', {
        name: 'Collapse advancedChild properties',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('advancedGrandchild')).toBeVisible();
  });

  it('reveals a target by parent path, scrolls it, and marks it highlighted', async () => {
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    renderTree({
      nodes: [advanced],
      revealTarget: {
        fieldName: 'advancedChild',
        parentPath: [rootPath, advancedPath],
      },
    });
    const target = getRow(advancedChild);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Collapse advanced properties' }),
      ).toHaveAttribute('aria-expanded', 'true');
      expect(target).toHaveAttribute('data-openapi-schema-highlighted', '');
      expect(scrollIntoView).toHaveBeenCalled();
    });
    scrollIntoView.mockRestore();
  });

  it('retries revealing a target when nodes arrive after the initial render', async () => {
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    const revealTarget = {
      fieldName: 'advancedChild',
      parentPath: [rootPath, advancedPath],
    };
    const { rerender } = renderTree({ nodes: [], revealTarget });

    rerender(
      <OpenApiSchemaTree
        client={{ as: 'body', name: 'body', required: true }}
        labels={labels}
        nodes={[advanced]}
        onCopyFieldLink={() => {}}
        renderRemainingInfoTags={() => []}
        revealTarget={revealTarget}
        rootId="schema-root"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Collapse advanced properties' }),
      ).toHaveAttribute('aria-expanded', 'true');
      expect(getRow(advancedChild)).toHaveAttribute(
        'data-openapi-schema-highlighted',
        '',
      );
      expect(scrollIntoView).toHaveBeenCalled();
    });
    scrollIntoView.mockRestore();
  });

  it('restores the highlighted row tabIndex when focus cleanup runs', async () => {
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    const revealTarget = {
      fieldName: 'channel',
      parentPath: [rootPath, configPath],
    };
    const { rerender, unmount } = renderTree({ nodes: [config] });
    const target = getRow(channel);
    target.tabIndex = 0;

    rerender(
      <OpenApiSchemaTree
        client={{ as: 'body', name: 'body', required: true }}
        labels={labels}
        nodes={[config]}
        onCopyFieldLink={() => {}}
        renderRemainingInfoTags={() => []}
        revealTarget={revealTarget}
        rootId="schema-root"
      />,
    );

    await waitFor(() => {
      expect(target).toHaveAttribute('tabindex', '-1');
    });

    unmount();
    expect(target).toHaveAttribute('tabindex', '0');
    scrollIntoView.mockRestore();
  });

  it('restores the pending focus row tabIndex after focusing', async () => {
    const focusedElements: HTMLElement[] = [];
    const focus = vi
      .spyOn(HTMLElement.prototype, 'focus')
      .mockImplementation(function (this: HTMLElement) {
        focusedElements.push(this);
      });
    const scrollIntoView = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    renderTree();
    const search = screen.getByRole('searchbox', { name: 'Filter properties' });

    fireEvent.change(search, { target: { value: 'advanced' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    const target = getRow(advanced);
    target.tabIndex = 0;
    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() => {
      expect(focusedElements.at(-1)).toBe(target);
      expect(target).toHaveAttribute('tabindex', '0');
      expect(scrollIntoView).toHaveBeenCalled();
    });
    focus.mockRestore();
    scrollIntoView.mockRestore();
  });

  it('passes field rows the copy callback and remaining info tag renderer', () => {
    const onCopyFieldLink = vi.fn();
    const renderRemainingInfoTags = vi.fn(() => [
      <span key="tag">Custom tag</span>,
    ]);
    renderTree({ onCopyFieldLink, renderRemainingInfoTags });

    fireEvent.click(
      within(getRow(config)).getByRole('button', {
        name: 'Copy link to config',
      }),
    );
    expect(onCopyFieldLink).toHaveBeenCalledWith(config);
    expect(within(getRow(config)).getByText('Custom tag')).toBeVisible();
  });
});
