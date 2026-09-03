import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  filterOpenApiSchemaView,
  getAllOpenApiSchemaExpandableIds,
  getInitialOpenApiSchemaExpandedIds,
  type OpenApiSchemaPathItem,
  type OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import {
  OpenApiSchemaFieldRow,
  type OpenApiSchemaFieldRowLabels,
} from './OpenApiSchemaFieldRow';

export function stableDomId(rootId: string, nodeId: string) {
  const value = nodeId === rootId ? rootId : `${rootId}-${nodeId}`;
  const encoded = encodeStableDomIdValue(value);
  return /^[A-Za-z_]/.test(encoded) ? encoded : `openapi-${encoded}`;
}

function encodeStableDomIdValue(value: string) {
  if (/^[A-Za-z0-9_.-]+$/.test(value) && !/-x[0-9a-f]+-$/.test(value)) {
    return value;
  }

  const escaped = encodeURIComponent(value)
    .replace(/%([0-9A-F]{2})/g, '-$1-')
    .replace(
      /[!~*'()]/g,
      (character) => `-${character.codePointAt(0)?.toString(16)}-`,
    );
  const codePoints = Array.from(value)
    .map((character) => character.codePointAt(0)?.toString(16))
    .join('');
  return `${escaped}-x${codePoints}-`;
}

export type OpenApiSchemaTreeLabels = OpenApiSchemaFieldRowLabels & {
  collapseAll: string;
  expandAll: string;
  filter: string;
  matchCount: string;
  noMatches: string;
};

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
  renderRemainingInfoTags: (node: OpenApiSchemaViewNode) => ReactNode[];
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
    getInitialOpenApiSchemaExpandedIds(nodes),
  );
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string>();
  const copyTimer = useRef<number | undefined>(undefined);
  const [highlightedId, setHighlightedId] = useState<string>();
  const [pendingFocusId, setPendingFocusId] = useState<string>();
  const [searchExpandedIds, setSearchExpandedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchCollapsedIds, setSearchCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const preSearchExpandedIds = useRef<Set<string> | null>(null);
  const lastRevealTarget = useRef<string | undefined>(undefined);
  const treeRef = useRef<HTMLDivElement>(null);

  // rootId is part of the tree identity even though the reset values only use nodes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rootId changes must reset tree interaction state.
  useEffect(() => {
    if (copyTimer.current !== undefined) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = undefined;
    }
    setExpandedIds(getInitialOpenApiSchemaExpandedIds(nodes));
    setQuery('');
    setCopiedId(undefined);
    setHighlightedId(undefined);
    setPendingFocusId(undefined);
    setSearchExpandedIds(new Set());
    setSearchCollapsedIds(new Set());
    preSearchExpandedIds.current = null;
    lastRevealTarget.current = undefined;
  }, [nodes, rootId]);

  useEffect(
    () => () => {
      if (copyTimer.current !== undefined)
        window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const filterResult = useMemo(
    () => filterOpenApiSchemaView(nodes, query),
    [nodes, query],
  );
  const expandableIds = useMemo(
    () => getAllOpenApiSchemaExpandableIds(nodes),
    [nodes],
  );
  const isSearching = query.trim().length > 0;
  const effectiveExpandedIds = useMemo(() => {
    if (!isSearching) return expandedIds;

    return new Set(
      [...filterResult.expandedIds, ...searchExpandedIds].filter(
        (id) => !searchCollapsedIds.has(id),
      ),
    );
  }, [
    expandedIds,
    filterResult.expandedIds,
    isSearching,
    searchCollapsedIds,
    searchExpandedIds,
  ]);

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

      if (isSearching) {
        const chainIds = chain.map((node) => node.id);
        setSearchExpandedIds((current) => new Set([...current, ...chainIds]));
        setSearchCollapsedIds((current) => {
          const next = new Set(current);
          chainIds.forEach((id) => {
            next.delete(id);
          });
          return next;
        });
        return;
      }

      setExpandedIds(
        (current) => new Set([...current, ...chain.map((node) => node.id)]),
      );
    },
    [findNodeChain, isSearching],
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

    const restored = preSearchExpandedIds.current;
    preSearchExpandedIds.current = null;
    setSearchExpandedIds(new Set());
    setSearchCollapsedIds(new Set());
    setQuery('');
    setExpandedIds(
      (current) =>
        new Set([...(restored ?? current), ...chain.map((node) => node.id)]),
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

  useEffect(() => {
    if (!pendingFocusId) return;

    const chain = findNodeChain((node) => node.id === pendingFocusId);
    if (
      chain.length === 0 ||
      !chain.slice(0, -1).every((node) => effectiveExpandedIds.has(node.id))
    ) {
      return;
    }

    const row = findNodeRow(pendingFocusId);
    if (!row || row.closest('[hidden]')) return;

    const originalTabIndex = row.getAttribute('tabindex');
    row.tabIndex = -1;
    row.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setPendingFocusId(undefined);

    return () => restoreTabIndex(row, originalTabIndex);
  }, [effectiveExpandedIds, findNodeChain, findNodeRow, pendingFocusId]);

  function handleSearchChange(nextQuery: string) {
    if (query.trim() && nextQuery.trim() && query.trim() !== nextQuery.trim()) {
      setSearchExpandedIds(new Set());
      setSearchCollapsedIds(new Set());
    }

    if (!query.trim() && nextQuery.trim()) {
      preSearchExpandedIds.current = new Set(expandedIds);
      setSearchExpandedIds(new Set());
      setSearchCollapsedIds(new Set());
    }

    if (!nextQuery.trim()) {
      const restored = preSearchExpandedIds.current;
      if (restored) setExpandedIds(new Set(restored));
      preSearchExpandedIds.current = null;
      setSearchExpandedIds(new Set());
      setSearchCollapsedIds(new Set());
    }

    setQuery(nextQuery);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleSearchChange('');
      return;
    }

    if (event.key !== 'Enter' || filterResult.directMatchIds.size === 0) return;

    const firstMatchId = findFirstDirectMatchId(
      nodes,
      filterResult.directMatchIds,
    );
    if (!firstMatchId) return;

    revealNode(firstMatchId);
    setPendingFocusId(firstMatchId);
  }

  function renderNodes(
    candidates: OpenApiSchemaViewNode[],
    seen: Set<string> = new Set(),
    includeHiddenDescendants = false,
  ): ReactNode[] {
    return candidates.flatMap((node) => {
      if (seen.has(node.id)) return [];
      if (
        isSearching &&
        !includeHiddenDescendants &&
        node.depth !== 0 &&
        !filterResult.visibleIds.has(node.id) &&
        !searchExpandedIds.has(node.id)
      ) {
        return [
          <HiddenDescendants
            key={`${node.id}-search-hidden`}
            onBeforeMatch={() => revealNode(node.id)}
          >
            {renderNodes([node], seen, true)}
          </HiddenDescendants>,
        ];
      }

      const nextSeen = new Set(seen).add(node.id);
      const expandable = node.children.length > 0;
      const expanded = expandable && effectiveExpandedIds.has(node.id);
      const directMatch = filterResult.directMatchIds.has(node.id);
      const remainingInfoTags = renderRemainingInfoTags(node);
      const revealHiddenDescendants =
        includeHiddenDescendants || searchExpandedIds.has(node.id);
      const descendants = expandable
        ? expanded
          ? renderNodes(node.children, nextSeen, revealHiddenDescendants)
          : [
              <HiddenDescendants
                key={`${node.id}-hidden`}
                onBeforeMatch={() => revealNode(node.id)}
              >
                {renderNodes(node.children, nextSeen, true)}
              </HiddenDescendants>,
            ]
        : [];

      return [
        <div
          data-openapi-schema-match={directMatch ? 'direct' : undefined}
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
              if (isSearching) {
                if (nextExpanded) {
                  setSearchExpandedIds(
                    (current) => new Set([...current, node.id]),
                  );
                  setSearchCollapsedIds((current) => {
                    const next = new Set(current);
                    next.delete(node.id);
                    return next;
                  });
                } else {
                  setSearchExpandedIds((current) => {
                    const next = new Set(current);
                    next.delete(node.id);
                    return next;
                  });
                  setSearchCollapsedIds(
                    (current) => new Set([...current, node.id]),
                  );
                }
                return;
              }

              setExpandedIds((current) => {
                const next = new Set(current);
                if (nextExpanded) next.add(node.id);
                else next.delete(node.id);
                return next;
              });
            }}
            remainingInfoTags={remainingInfoTags}
          />
          {isSearching && directMatch ? (
            <div
              className="mt-1 break-words font-mono text-xs text-muted-foreground"
              data-openapi-schema-match-path=""
            >
              {node.path}
            </div>
          ) : null}
          {descendants}
        </div>,
      ];
    });
  }

  async function handleTreeCopy(node: OpenApiSchemaViewNode) {
    try {
      if ((await onCopyFieldLink(node)) !== true) return;
    } catch {
      return;
    }

    setCopiedId(node.id);
    if (copyTimer.current !== undefined) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => {
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
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          aria-label={labels.filter}
          onChange={(event) => handleSearchChange(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={labels.filter}
          type="search"
          value={query}
        />
        {isSearching ? (
          <span
            aria-live="polite"
            className="whitespace-nowrap text-sm text-muted-foreground"
            role="status"
          >
            {`${filterResult.matchCount} ${labels.matchCount}`}
          </span>
        ) : null}
        <div className="flex gap-2">
          <Button
            disabled={expandableIds.size === 0}
            onClick={() => {
              if (isSearching) {
                setSearchExpandedIds(new Set(expandableIds));
                setSearchCollapsedIds(new Set());
              } else {
                setExpandedIds(new Set(expandableIds));
              }
            }}
            type="button"
            variant="outline"
          >
            {labels.expandAll}
          </Button>
          <Button
            disabled={expandableIds.size === 0}
            onClick={() => {
              if (isSearching) {
                setSearchExpandedIds(new Set());
                setSearchCollapsedIds(new Set(expandableIds));
              } else {
                setExpandedIds(new Set());
              }
            }}
            type="button"
            variant="outline"
          >
            {labels.collapseAll}
          </Button>
        </div>
      </div>
      <div data-openapi-schema-fields="">
        {renderNodes(nodes)}
        {isSearching && filterResult.matchCount === 0 ? (
          <p>{`${labels.noMatches} ${query.trim()}`}</p>
        ) : null}
      </div>
    </div>
  );
}

function HiddenDescendants({
  children,
  onBeforeMatch,
}: {
  children: ReactNode;
  onBeforeMatch: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.setAttribute('hidden', 'until-found');
    element.addEventListener('beforematch', onBeforeMatch);
    return () => element.removeEventListener('beforematch', onBeforeMatch);
  }, [onBeforeMatch]);

  return (
    <div data-openapi-schema-hidden-children="" hidden ref={ref}>
      {children}
    </div>
  );
}

function findFirstDirectMatchId(
  nodes: OpenApiSchemaViewNode[],
  directMatchIds: Set<string>,
) {
  const seen = new Set<string>();

  function visit(candidates: OpenApiSchemaViewNode[]): string | undefined {
    for (const node of candidates) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      if (directMatchIds.has(node.id)) return node.id;

      const childMatch = visit(node.children);
      if (childMatch) return childMatch;
    }
    return undefined;
  }

  return visit(nodes);
}

function restoreTabIndex(row: HTMLElement, originalTabIndex: string | null) {
  if (originalTabIndex === null) row.removeAttribute('tabindex');
  else row.setAttribute('tabindex', originalTabIndex);
}
