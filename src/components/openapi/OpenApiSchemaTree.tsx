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
  onCopyFieldLink: (node: OpenApiSchemaViewNode) => void;
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
  const [highlightedId, setHighlightedId] = useState<string>();
  const searchExpandedIds = useRef<Set<string> | null>(null);
  const lastRevealTarget = useRef<string | undefined>(undefined);
  const treeRef = useRef<HTMLDivElement>(null);

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
    return isSearching ? filterResult.expandedIds : expandedIds;
  }, [expandedIds, filterResult.expandedIds, isSearching]);

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

  useEffect(() => {
    if (!revealTarget) return;

    const targetKey = JSON.stringify(revealTarget);
    if (lastRevealTarget.current === targetKey) return;
    lastRevealTarget.current = targetKey;

    const chain = findNodeChain(
      (node) =>
        node.name === revealTarget.fieldName &&
        JSON.stringify(node.parentPath) ===
          JSON.stringify(revealTarget.parentPath),
    );
    const target = chain.at(-1);
    if (!target) return;

    searchExpandedIds.current = null;
    setQuery('');
    setExpandedIds(
      (current) => new Set([...current, ...chain.map((node) => node.id)]),
    );
    setHighlightedId(target.id);
  }, [findNodeChain, revealTarget]);

  useEffect(() => {
    const tree = treeRef.current;
    if (!tree || !highlightedId) return;

    const row = document.getElementById(highlightedId);
    if (!row || !tree.contains(row)) return;

    row.setAttribute('data-openapi-schema-highlighted', '');
    row.tabIndex = -1;
    row
      .querySelector('code')
      ?.classList.add('rounded-sm', 'bg-primary', 'text-primary-foreground');
    row.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return () => {
      row.removeAttribute('data-openapi-schema-highlighted');
      row
        .querySelector('code')
        ?.classList.remove(
          'rounded-sm',
          'bg-primary',
          'text-primary-foreground',
        );
    };
  }, [highlightedId]);

  function handleSearchChange(nextQuery: string) {
    if (!query.trim() && nextQuery.trim()) {
      searchExpandedIds.current = new Set(expandedIds);
    }

    if (!nextQuery.trim()) {
      const restored = searchExpandedIds.current;
      if (restored) setExpandedIds(new Set(restored));
      searchExpandedIds.current = null;
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

    const row = document.getElementById(firstMatchId);
    if (!row) return;

    row.tabIndex = -1;
    row.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        !filterResult.visibleIds.has(node.id)
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
      const descendants = expandable
        ? expanded
          ? renderNodes(node.children, nextSeen)
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
          data-openapi-schema-path={node.path}
          key={node.id}
        >
          <OpenApiSchemaFieldRow
            copied={copiedId === node.id}
            expanded={expanded}
            labels={labels}
            node={node}
            onCopy={() => {
              setCopiedId(node.id);
              onCopyFieldLink(node);
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

  return (
    <div
      className="openapi-schema-tree"
      data-openapi-schema-as={client.as}
      data-openapi-schema-client={client.name}
      id={rootId}
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
        <div className="flex gap-2">
          <Button
            disabled={expandableIds.size === 0}
            onClick={() => setExpandedIds(new Set(expandableIds))}
            type="button"
            variant="outline"
          >
            {labels.expandAll}
          </Button>
          <Button
            disabled={expandableIds.size === 0}
            onClick={() => setExpandedIds(new Set())}
            type="button"
            variant="outline"
          >
            {labels.collapseAll}
          </Button>
        </div>
      </div>
      <div aria-live="polite" className="sr-only" role="status">
        {isSearching ? `${filterResult.matchCount} ${labels.matchCount}` : null}
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
