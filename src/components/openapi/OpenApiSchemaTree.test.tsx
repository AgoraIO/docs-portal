import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type {
  OpenApiSchemaPathItem,
  OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import { OpenApiSchemaTree, stableDomId } from './OpenApiSchemaTree';
import type { OpenApiSchemaMetadataItem } from './OpenApiSchemaMetadata';

const labels = {
  allowedValues: 'Allowed values',
  collapse: 'Collapse',
  copiedLink: 'Copied link to',
  copyLink: 'Copy link to',
  default: 'Default',
  deprecated: 'Deprecated',
  expand: 'Expand',
  optional: 'Optional',
  properties: 'properties',
  range: 'Range',
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
  rootContainer = false,
}: {
  children?: OpenApiSchemaViewNode[];
  depth?: number;
  name: string;
  parentPath?: OpenApiSchemaPathItem[];
  required?: boolean;
  rootContainer?: boolean;
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
    rootContainer,
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
      onCopyFieldLink={() => Promise.resolve(false)}
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
  it('does not render a custom filter or global expansion toolbar', () => {
    renderTree();

    expect(
      screen.queryByRole('searchbox', { name: 'Filter properties' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Expand all' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Collapse all' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    ).toBeInTheDocument();
  });

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

  it('initially expands required top-level fields regardless of depth metadata', () => {
    const requiredChild = makeNode({
      depth: 2,
      name: 'requiredChild',
      parentPath: [
        rootPath,
        { $ref: 'required-root-type', name: 'requiredRoot' },
      ],
    });
    const optionalChild = makeNode({
      depth: 2,
      name: 'optionalChild',
      parentPath: [
        rootPath,
        { $ref: 'optional-root-type', name: 'optionalRoot' },
      ],
    });
    const requiredRoot = makeNode({
      children: [requiredChild],
      depth: 1,
      name: 'requiredRoot',
      parentPath: [rootPath],
      required: true,
    });
    const optionalRoot = makeNode({
      children: [optionalChild],
      depth: 1,
      name: 'optionalRoot',
      parentPath: [rootPath],
    });

    renderTree({ nodes: [requiredRoot, optionalRoot] });

    expect(
      screen.getByRole('button', { name: 'Collapse requiredRoot properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('requiredChild')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Expand optionalRoot properties' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('optionalChild')).not.toBeVisible();
  });

  it('initially expands a non-object root container even when optional', () => {
    const item = makeNode({
      depth: 1,
      name: 'item',
      parentPath: [rootPath, { $ref: 'item', name: 'body[]' }],
    });
    const rootContainer = makeNode({
      children: [item],
      name: 'body',
      rootContainer: true,
    });

    renderTree({ nodes: [rootContainer] });

    expect(
      screen.getByRole('button', { name: 'Collapse body properties' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('item')).toBeVisible();
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

  it('wraps recursive descendants in nested continuous guide-line containers', () => {
    renderTree({ nodes: [advanced] });

    fireEvent.click(
      screen.getByRole('button', { name: 'Expand advanced properties' }),
    );

    const advancedRow = getRow(advanced);
    const advancedChildren = advancedRow.parentElement?.querySelector(
      ':scope > .openapi-schema-children',
    );
    const advancedChildRow = getRow(advancedChild);
    const nestedChildren = advancedChildRow.parentElement?.querySelector(
      ':scope > .openapi-schema-children',
    );

    expect(advancedChildren).toBeTruthy();
    expect(advancedChildren).toContainElement(advancedChildRow);
    expect(nestedChildren).toBeTruthy();
    expect(nestedChildren).toContainElement(
      screen.getByText('advancedGrandchild'),
    );
  });

  it('keeps long nested schema descriptions shrinkable and wrappable', () => {
    const longDescription =
      'https://example.com/api/v1/projects/with-a-very-long-resource-name/that-must-wrap-within-the-schema-tree';
    const longChild = makeNode({
      depth: 1,
      name: 'longChild',
      parentPath: [rootPath, configPath],
    });
    longChild.schema.description = longDescription;
    const parent = makeNode({ children: [longChild], name: 'parent' });

    renderTree({ nodes: [parent] });
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand parent properties' }),
    );

    const row = getRow(longChild);
    const description = row.querySelector('.openapi-schema-field-description');

    expect(row).toHaveClass('min-w-0');
    expect(description).toHaveClass(
      'min-w-0',
      'break-words',
      '[overflow-wrap:anywhere]',
    );
  });

  it('keeps collapsed guide-line containers hidden while retaining descendants', () => {
    renderTree({ nodes: [advanced] });

    const advancedChildren = getRow(advanced).parentElement?.querySelector(
      ':scope > [data-openapi-schema-hidden-children]',
    );
    const nestedChildren = getRow(advancedChild).parentElement?.querySelector(
      ':scope > [data-openapi-schema-hidden-children]',
    );

    expect(advancedChildren).toHaveClass('openapi-schema-children');
    expect(advancedChildren).toHaveAttribute('hidden', 'until-found');
    expect(advancedChildren).toContainElement(
      screen.getByText('advancedChild'),
    );
    expect(nestedChildren).toHaveClass('openapi-schema-children');
    expect(nestedChildren).toHaveAttribute('hidden', 'until-found');
    expect(nestedChildren).toContainElement(
      screen.getByText('advancedGrandchild'),
    );
  });

  it('renders hidden descendants with until-found during SSR', () => {
    const html = renderToString(
      <OpenApiSchemaTree
        client={{ as: 'body', name: 'body', required: true }}
        labels={labels}
        nodes={[advanced]}
        onCopyFieldLink={() => Promise.resolve(false)}
        renderRemainingInfoTags={() => []}
        rootId="schema-root"
      />,
    );

    expect(html).toContain('hidden="until-found"');
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
        onCopyFieldLink={() => Promise.resolve(false)}
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
        onCopyFieldLink={() => Promise.resolve(false)}
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

  it('passes field rows the copy callback and remaining info tag renderer', () => {
    const onCopyFieldLink = vi.fn();
    const renderRemainingInfoTags = vi.fn(
      (): OpenApiSchemaMetadataItem[] => [
        { label: 'Custom', value: 'Custom tag' },
      ],
    );
    renderTree({ onCopyFieldLink, renderRemainingInfoTags });

    fireEvent.click(
      within(getRow(config)).getByRole('button', {
        name: 'Copy link to config',
      }),
    );
    expect(onCopyFieldLink).toHaveBeenCalledWith(config);
    expect(within(getRow(config)).getByText('Custom tag')).toBeVisible();
  });

  it('uses HTML-safe namespaced ids for body trees and special union node ids', () => {
    const specialRootId = 'body|union\0root';
    const specialNode = makeNode({ name: 'mode' });
    specialNode.id = 'variant\0branch|mode';

    renderTree({
      nodes: [specialNode],
      rootId: specialRootId,
    });

    const tree = document.querySelector('.openapi-schema-tree') as HTMLElement;
    const row = getRow(specialNode);

    expect(tree).toHaveAttribute('id', specialRootId);
    expect(row).toHaveAttribute('id', expect.not.stringMatching(/[\0|]/));
    expect(row).toHaveAttribute(
      'id',
      stableDomId(specialRootId, specialNode.id),
    );
    expect(row.closest('[data-openapi-schema-node-id]')).toHaveAttribute(
      'data-openapi-schema-node-id',
      specialNode.id,
    );
  });

  it('ignores stale copy requests after a newer request resolves', async () => {
    let resolveFirst!: (value: boolean) => void;
    let resolveSecond!: (value: boolean) => void;
    const onCopyFieldLink = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise<boolean>((resolve) => (resolveFirst = resolve)),
      )
      .mockImplementationOnce(
        () => new Promise<boolean>((resolve) => (resolveSecond = resolve)),
      );
    renderTree({ onCopyFieldLink });

    fireEvent.click(
      within(getRow(config)).getByRole('button', {
        name: 'Copy link to config',
      }),
    );
    fireEvent.click(
      within(getRow(advanced)).getByRole('button', {
        name: 'Copy link to advanced',
      }),
    );

    resolveSecond(true);
    await waitFor(() =>
      expect(
        within(getRow(advanced)).getByRole('button', {
          name: 'Copied link to advanced',
        }),
      ).toBeVisible(),
    );
    resolveFirst(true);
    await act(async () => {
      await Promise.resolve();
    });

    expect(
      within(getRow(advanced)).getByRole('button', {
        name: 'Copied link to advanced',
      }),
    ).toBeVisible();
    expect(
      within(getRow(config)).queryByRole('button', {
        name: 'Copied link to config',
      }),
    ).not.toBeInTheDocument();
  });

  it('does not schedule copy feedback after the tree unmounts', async () => {
    vi.useFakeTimers();
    let resolveCopy!: (value: boolean) => void;
    const onCopyFieldLink = vi.fn(
      () => new Promise<boolean>((resolve) => (resolveCopy = resolve)),
    );
    const { unmount } = renderTree({ onCopyFieldLink });

    fireEvent.click(
      within(getRow(config)).getByRole('button', {
        name: 'Copy link to config',
      }),
    );
    unmount();
    resolveCopy(true);
    await act(async () => {
      await Promise.resolve();
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
