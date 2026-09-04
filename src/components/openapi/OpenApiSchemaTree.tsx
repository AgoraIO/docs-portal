import {
  createElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  OpenApiSchemaPathItem,
  OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import {
  OpenApiSchemaFieldRow,
  type OpenApiSchemaFieldRowLabels,
} from './OpenApiSchemaFieldRow';
import type { OpenApiSchemaMetadataItem } from './OpenApiSchemaMetadata';

export function stableDomId(rootId: string, nodeId: string) {
  if (nodeId === rootId) return rootId;

  const encodedRoot = encodeURIComponent(rootId);
  const encodedNode = encodeURIComponent(nodeId);
  return `openapi-node-${encodedRoot.length}-${encodedRoot}-${encodedNode.length}-${encodedNode}`;
}

function getInitialExpandedIds(nodes: OpenApiSchemaViewNode[]) {
  return new Set(
    nodes
      .filter(
        (node) =>
          (node.required || node.rootContainer) && node.children.length > 0,
      )
      .map((node) => node.id),
  );
}

export function getOpenApiSchemaTreeIdentity(nodes: OpenApiSchemaViewNode[]) {
  return JSON.stringify(nodes.map(getOpenApiSchemaNodeIdentity));
}

function getOpenApiSchemaNodeIdentity(node: OpenApiSchemaViewNode): unknown[] {
  return [
    node.id,
    node.path,
    node.$type,
    node.name,
    node.variant,
    node.depth,
    node.required,
    node.rootContainer,
    node.parentPath.map((item) => [item.$ref, item.name, item.tabValues ?? []]),
    getOpenApiSchemaIdentity(node.schema),
    node.children.map(getOpenApiSchemaNodeIdentity),
  ];
}

function getOpenApiSchemaIdentity(schema: OpenApiSchemaViewNode['schema']) {
  const base = [schema.type, schema.typeName, schema.aliasName];

  if (schema.type === 'object') {
    return [
      ...base,
      schema.props.map((property) => [
        property.name,
        property.$type,
        property.required,
      ]),
    ];
  }

  if (schema.type === 'array') return [...base, schema.item.$type];

  if (schema.type === 'or' || schema.type === 'and') {
    return [...base, schema.items.map((item) => [item.$type, item.name])];
  }

  return base;
}

export type OpenApiSchemaTreeLabels = OpenApiSchemaFieldRowLabels & {};

export type OpenApiSchemaRevealTarget = {
  fieldName: string;
  parentPath: OpenApiSchemaPathItem[];
};

export type OpenApiSchemaTreeProps = {
  client: {
    as?: 'property' | 'body';
    name: string;
    required?: boolean;
  };
  labels: OpenApiSchemaTreeLabels;
  nodes: OpenApiSchemaViewNode[];
  onCopyFieldLink: (node: OpenApiSchemaViewNode) => Promise<boolean>;
  renderRemainingInfoTags: (
    node: OpenApiSchemaViewNode,
  ) => OpenApiSchemaMetadataItem[];
  revealTarget?: OpenApiSchemaRevealTarget;
  rootId: string;
};

export function OpenApiSchemaTree({
  client,
  labels,
  nodes,
  onCopyFieldLink,
  renderRemainingInfoTags,
  revealTarget,
  rootId,
}: OpenApiSchemaTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    getInitialExpandedIds(nodes),
  );
  const [copiedId, setCopiedId] = useState<string>();
  const copyTimer = useRef<number | undefined>(undefined);
  const [highlightedId, setHighlightedId] = useState<string>();
  const latestNodesRef = useRef(nodes);
  const mountedRef = useRef(false);
  const copyRequestRef = useRef(0);
  const lastRevealTarget = useRef<string | undefined>(undefined);
  const treeRef = useRef<HTMLDivElement>(null);

  latestNodesRef.current = nodes;
  const schemaIdentity = useMemo(
    () => getOpenApiSchemaTreeIdentity(nodes),
    [nodes],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: schema identity and root ID intentionally trigger a full interaction reset.
  useEffect(() => {
    copyRequestRef.current += 1;
    if (copyTimer.current !== undefined) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = undefined;
    }
    setExpandedIds(getInitialExpandedIds(latestNodesRef.current));
    setCopiedId(undefined);
    setHighlightedId(undefined);
    lastRevealTarget.current = undefined;
  }, [rootId, schemaIdentity]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      copyRequestRef.current += 1;
    };
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current !== undefined)
        window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const findNodeChain = useCallback(
    (
      predicate: (node: OpenApiSchemaViewNode) => boolean,
    ): OpenApiSchemaViewNode[] => {
      function visit(
        candidates: OpenApiSchemaViewNode[],
        ancestors: OpenApiSchemaViewNode[],
      ): OpenApiSchemaViewNode[] {
        for (const node of candidates) {
          if (predicate(node)) return [...ancestors, node];
          if (node.children.length === 0) continue;

          const chain = visit(node.children, [...ancestors, node]);
          if (chain.length > 0) return chain;
        }
        return [];
      }

      return visit(nodes, []);
    },
    [nodes],
  );

  const revealNode = useCallback(
    (nodeId: string) => {
      const chain = findNodeChain((node) => node.id === nodeId);
      if (chain.length === 0) return;

      setExpandedIds(
        (current) => new Set([...current, ...chain.map((node) => node.id)]),
      );
    },
    [findNodeChain],
  );

  const findNodeRow = useCallback((nodeId: string) => {
    const tree = treeRef.current;
    if (!tree) return;

    const wrapper = Array.from(
      tree.querySelectorAll<HTMLElement>('[data-openapi-schema-node-id]'),
    ).find((element) => element.dataset.openapiSchemaNodeId === nodeId);
    return wrapper?.querySelector<HTMLElement>('.openapi-schema-field-row');
  }, []);

  useEffect(() => {
    if (!revealTarget) return;

    const targetKey = JSON.stringify(revealTarget);
    if (lastRevealTarget.current === targetKey) return;

    const chain = findNodeChain(
      (node) =>
        node.name === revealTarget.fieldName &&
        JSON.stringify(node.parentPath) ===
          JSON.stringify(revealTarget.parentPath),
    );
    const target = chain.at(-1);
    if (!target) return;
    lastRevealTarget.current = targetKey;

    setExpandedIds(
      (current) => new Set([...current, ...chain.map((node) => node.id)]),
    );
    setHighlightedId(target.id);
  }, [findNodeChain, revealTarget]);

  useEffect(() => {
    if (!highlightedId) return;

    const row = findNodeRow(highlightedId);
    if (!row) return;

    const originalTabIndex = row.getAttribute('tabindex');
    row.setAttribute('data-openapi-schema-highlighted', '');
    row.tabIndex = -1;
    row
      .querySelector('code')
      ?.classList.add('rounded-sm', 'bg-primary', 'text-primary-foreground');
    row.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return () => {
      restoreTabIndex(row, originalTabIndex);
      row.removeAttribute('data-openapi-schema-highlighted');
      row
        .querySelector('code')
        ?.classList.remove(
          'rounded-sm',
          'bg-primary',
          'text-primary-foreground',
        );
    };
  }, [findNodeRow, highlightedId]);

  function renderNodes(
    candidates: OpenApiSchemaViewNode[],
    seen: Set<string> = new Set(),
  ): ReactNode[] {
    return candidates.flatMap((node) => {
      if (seen.has(node.id)) return [];

      const nextSeen = new Set(seen).add(node.id);
      const expandable = node.children.length > 0;
      const expanded = expandable && expandedIds.has(node.id);
      const remainingInfoTags = renderRemainingInfoTags(node);
      const descendants = expandable
        ? expanded
          ? [
              <div
                className="openapi-schema-children"
                key={`${node.id}-children`}
              >
                {renderNodes(node.children, nextSeen)}
              </div>,
            ]
          : [
              <HiddenDescendants
                className="openapi-schema-children"
                key={`${node.id}-hidden`}
                onBeforeMatch={() => revealNode(node.id)}
              >
                {renderNodes(node.children, nextSeen)}
              </HiddenDescendants>,
            ]
        : [];

      return [
        <div
          data-openapi-schema-node=""
          data-openapi-schema-node-id={node.id}
          data-openapi-schema-path={node.path}
          key={node.id}
        >
          <OpenApiSchemaFieldRow
            copied={copiedId === node.id}
            domId={stableDomId(rootId, node.id)}
            expanded={expanded}
            labels={labels}
            node={node}
            onCopy={() => {
              void handleTreeCopy(node);
            }}
            onExpandedChange={(nextExpanded) => {
              setExpandedIds((current) => {
                const next = new Set(current);
                if (nextExpanded) next.add(node.id);
                else next.delete(node.id);
                return next;
              });
            }}
            remainingInfoTags={remainingInfoTags}
          />
          {descendants}
        </div>,
      ];
    });
  }

  async function handleTreeCopy(node: OpenApiSchemaViewNode) {
    const requestId = copyRequestRef.current + 1;
    copyRequestRef.current = requestId;
    try {
      if ((await onCopyFieldLink(node)) !== true) return;
    } catch {
      return;
    }

    if (!mountedRef.current || copyRequestRef.current !== requestId) return;

    setCopiedId(node.id);
    if (copyTimer.current !== undefined) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => {
      if (!mountedRef.current || copyRequestRef.current !== requestId) return;
      setCopiedId(undefined);
      copyTimer.current = undefined;
    }, 1000);
  }

  return (
    <div
      className="openapi-schema-tree"
      data-openapi-schema-as={client.as}
      data-openapi-schema-client={client.name}
      id={stableDomId(rootId, rootId)}
      ref={treeRef}
    >
      <div data-openapi-schema-fields="">{renderNodes(nodes)}</div>
    </div>
  );
}

function HiddenDescendants({
  children,
  className,
  onBeforeMatch,
}: {
  children: ReactNode;
  className?: string;
  onBeforeMatch: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.setAttribute('hidden', 'until-found');
    element.addEventListener('beforematch', onBeforeMatch);
    return () => element.removeEventListener('beforematch', onBeforeMatch);
  }, [onBeforeMatch]);

  return createElement(
    'openapi-schema-hidden',
    {
      className: ['openapi-schema-hidden-children', className]
        .filter(Boolean)
        .join(' '),
      'data-openapi-schema-hidden-children': '',
      hidden: 'until-found',
      ref,
    },
    children,
  );
}

function restoreTabIndex(row: HTMLElement, originalTabIndex: string | null) {
  if (originalTabIndex === null) row.removeAttribute('tabindex');
  else row.setAttribute('tabindex', originalTabIndex);
}
