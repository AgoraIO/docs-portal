import {
  type ComponentProps,
  createElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  OpenApiSchemaPathItem,
  OpenApiSchemaViewNode,
} from '@/lib/openapi/schema-view';
import {
  OpenApiSchemaFieldRow,
  type OpenApiSchemaFieldRowLabels,
} from './OpenApiSchemaFieldRow';
import {
  OpenApiSchemaMetadata,
  type OpenApiSchemaMetadataItem,
} from './OpenApiSchemaMetadata';

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
          (node.required || node.rootContainer) &&
          (node.children.length > 0 || node.detailsCollapsible),
      )
      .map((node) => node.id),
  );
}

function getExpandableNodeIds(nodes: OpenApiSchemaViewNode[]): string[] {
  return nodes.flatMap((node) => [
    ...((node.children.length > 0 || node.detailsCollapsible) &&
    !(node.rootContainer && node.schema.type === 'or') &&
    !(node.branchContainer && node.choices?.length)
      ? [node.id]
      : []),
    ...getExpandableNodeIds(node.children),
  ]);
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
    node.branchContainer,
    node.choices?.map((choice) => [
      choice.id,
      choice.value,
      choice.options.map((option) => [option.value, option.name]),
    ]),
    node.depth,
    node.detailsCollapsible,
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

export type OpenApiSchemaTreeLabels = OpenApiSchemaFieldRowLabels & {
  collapseAll: string;
  expandAll: string;
  fields?: string;
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
  legacyAnchorIdsByFieldPath?: ReadonlyMap<string, string[]>;
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
  legacyAnchorIdsByFieldPath,
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
  const [selectedChoices, setSelectedChoices] = useState<
    Record<string, string>
  >({});
  const latestNodesRef = useRef(nodes);
  const mountedRef = useRef(false);
  const copyRequestRef = useRef(0);
  const lastRevealTarget = useRef<string | undefined>(undefined);
  const treeRef = useRef<HTMLDivElement>(null);
  const expandableNodeIds = useMemo(() => getExpandableNodeIds(nodes), [nodes]);
  const allExpanded =
    expandableNodeIds.length > 0 &&
    expandableNodeIds.every((nodeId) => expandedIds.has(nodeId));

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
    setSelectedChoices({});
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

  const revealChoices = useCallback(
    (chain: OpenApiSchemaViewNode[], throughChoiceId?: string) => {
      setSelectedChoices((current) => {
        const next = { ...current };
        for (const node of chain) {
          for (const choice of node.choices ?? []) {
            next[choice.id] = choice.value;
            // An ancestor's beforematch must not overwrite a child's selection.
            if (choice.id === throughChoiceId) return next;
          }
        }
        return next;
      });
    },
    [],
  );

  const revealNode = useCallback(
    (nodeId: string, highlight = false, throughChoiceId?: string) => {
      const chain = findNodeChain((node) => node.id === nodeId);
      if (chain.length === 0) return;

      setExpandedIds(
        (current) => new Set([...current, ...chain.map((node) => node.id)]),
      );
      revealChoices(chain, throughChoiceId);
      if (highlight) setHighlightedId(nodeId);
    },
    [findNodeChain, revealChoices],
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
    revealChoices(chain);
    setHighlightedId(target.id);
  }, [findNodeChain, revealChoices, revealTarget]);

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
    choiceDepth = 0,
    active = true,
  ): ReactNode[] {
    const renderedChoices = new Set<string>();
    return candidates.flatMap((node) => {
      const choice = node.choices?.[choiceDepth];
      if (choice) {
        if (renderedChoices.has(choice.id)) return [];
        renderedChoices.add(choice.id);
        const selected = selectedChoices[choice.id] ?? choice.options[0].value;
        const members = candidates.filter(
          (candidate) => candidate.choices?.[choiceDepth]?.id === choice.id,
        );
        return [
          <StableChoiceTabs
            className="openapi-schema-choice min-w-0 max-w-full"
            key={choice.id}
            value={selected}
            onValueChange={(value) => {
              setHighlightedId(undefined);
              setSelectedChoices((current) => ({
                ...current,
                [choice.id]: value,
              }));
            }}
          >
            <TabsList
              aria-label={client.name}
              className="min-h-11 max-w-full flex-wrap justify-start gap-1 group-data-[orientation=horizontal]/tabs:h-auto"
            >
              {choice.options.map((option) => (
                <TabsTrigger
                  className="min-h-11 h-auto whitespace-normal text-left"
                  key={option.value}
                  value={option.value}
                >
                  {option.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* until-found panels still participate in layout. Keep them out of
                the tabs flex gap so every choice starts at the same position. */}
            <div className="min-w-0" data-openapi-choice-panels="">
              {choice.options.map((option) => (
                <ChoicePanel
                  active={selected === option.value}
                  key={option.value}
                  value={option.value}
                  onBeforeMatch={() => {
                    const member = members.find(
                      (candidate) =>
                        candidate.choices?.[choiceDepth]?.value ===
                        option.value,
                    );
                    if (member) revealNode(member.id, false, choice.id);
                  }}
                >
                  {option.schema &&
                  !members.some((member) => member.schema === option.schema) ? (
                    <div className="openapi-schema-description prose-no-margin text-fd-muted-foreground">
                      {option.schema.description}
                      <OpenApiSchemaMetadata
                        items={renderRemainingInfoTags({
                          ...node,
                          schema: option.schema,
                        })}
                      />
                    </div>
                  ) : null}
                  {renderNodes(
                    members.filter(
                      (member) =>
                        member.choices?.[choiceDepth]?.value === option.value,
                    ),
                    seen,
                    choiceDepth + 1,
                    active && selected === option.value,
                  )}
                </ChoicePanel>
              ))}
            </div>
          </StableChoiceTabs>,
        ];
      }
      if (seen.has(node.id)) return [];

      const nextSeen = new Set(seen).add(node.id);
      if (node.rootContainer && node.schema.type === 'or') {
        return [
          <div key={node.id}>
            {renderNodes(node.children, nextSeen, 0, active)}
          </div>,
        ];
      }
      if (node.branchContainer && choiceDepth > 0) {
        return [
          <div
            data-openapi-schema-node=""
            data-openapi-schema-node-id={node.id}
            data-openapi-schema-path={node.path}
            key={node.id}
          >
            <div className="openapi-schema-description prose-no-margin text-fd-muted-foreground">
              {node.schema.description}
              <OpenApiSchemaMetadata items={renderRemainingInfoTags(node)} />
            </div>
            {renderNodes(node.children, nextSeen, 0, active)}
          </div>,
        ];
      }
      const hasChildren = node.children.length > 0;
      const expandable = hasChildren || node.detailsCollapsible === true;
      const expanded = expandable && expandedIds.has(node.id);
      const remainingInfoTags = renderRemainingInfoTags(node);
      const descendants = hasChildren
        ? expanded
          ? [
              <div
                className="openapi-schema-children"
                key={`${node.id}-children`}
              >
                {renderNodes(node.children, nextSeen, 0, active)}
              </div>,
            ]
          : [
              <HiddenDescendants
                className="openapi-schema-children"
                key={`${node.id}-hidden`}
                onBeforeMatch={() => revealNode(node.id)}
              >
                {renderNodes(node.children, nextSeen, 0, active)}
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
          {node.path.includes('.') ? (
            <HiddenSearchPath
              onBeforeMatch={() => revealNode(node.id, true)}
              path={node.path}
            />
          ) : null}
          <OpenApiSchemaFieldRow
            copied={copiedId === node.id}
            detailsCollapsible={node.detailsCollapsible}
            domId={stableDomId(rootId, node.id)}
            expanded={expanded}
            labels={labels}
            legacyAnchorIds={
              active ? legacyAnchorIdsByFieldPath?.get(node.path) : undefined
            }
            node={choiceDepth > 0 ? { ...node, variant: undefined } : node}
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

  function handleToggleAll() {
    setExpandedIds((current) => {
      if (allExpanded) {
        const next = new Set(current);
        for (const nodeId of expandableNodeIds) next.delete(nodeId);
        return next;
      }

      return new Set([...current, ...expandableNodeIds]);
    });
  }

  return (
    <div
      className="openapi-schema-tree"
      data-openapi-schema-as={client.as}
      data-openapi-schema-client={client.name}
      id={stableDomId(rootId, rootId)}
      ref={treeRef}
    >
      {expandableNodeIds.length > 0 ? (
        <div className="openapi-schema-toolbar mb-1 flex flex-wrap items-center justify-between gap-x-3 border-fd-border border-b">
          <span className="text-fd-muted-foreground text-sm">
            {labels.fields ?? labels.properties}
          </span>
          <Button
            aria-label={allExpanded ? labels.collapseAll : labels.expandAll}
            className="h-auto min-h-11 cursor-pointer px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
            onClick={handleToggleAll}
            type="button"
            variant="ghost"
          >
            {allExpanded ? labels.collapseAll : labels.expandAll}
          </Button>
        </div>
      ) : null}
      <div data-openapi-schema-fields="">{renderNodes(nodes)}</div>
    </div>
  );
}

function StableChoiceTabs({ value, ...props }: ComponentProps<typeof Tabs>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<{
    list: HTMLElement;
    owner: HTMLElement | null;
    top: number;
    value: typeof value;
    timer: number;
  } | null>(null);

  function capture(target: EventTarget | null) {
    const tab =
      target instanceof Element
        ? target.closest<HTMLElement>('[role="tab"]')
        : null;
    if (
      !tab ||
      tab.closest('.openapi-schema-choice') !== rootRef.current ||
      anchorRef.current
    )
      return;
    const list = tab.closest<HTMLElement>('[role="tablist"]');
    if (!list) return;
    let owner = list.parentElement;
    while (
      owner &&
      owner !== document.body &&
      owner !== document.documentElement
    ) {
      const style = getComputedStyle(owner);
      if (
        /(auto|scroll|overlay)/.test(style.overflowY || style.overflow) &&
        owner.scrollHeight > owner.clientHeight
      )
        break;
      owner = owner.parentElement;
    }
    const anchor = {
      list,
      owner:
        owner === document.body || owner === document.documentElement
          ? null
          : owner,
      top: list.getBoundingClientRect().top,
      value,
      timer: 0,
    };
    anchorRef.current = anchor;
    // Only compensate the initiating interaction, not later hash or find-in-page navigation.
    anchor.timer = window.setTimeout(() => {
      if (anchorRef.current === anchor) anchorRef.current = null;
    }, 0);
  }

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (!anchor) return;
    window.clearTimeout(anchor.timer);
    if (anchor.value === value || !anchor.list.isConnected) return;
    const delta = anchor.list.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) < 1) return;
    if (anchor.owner)
      anchor.owner.scrollTo({
        top: anchor.owner.scrollTop + delta,
        behavior: 'instant',
      });
    else window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
  }, [value]);

  useEffect(
    () => () => {
      if (anchorRef.current) window.clearTimeout(anchorRef.current.timer);
    },
    [],
  );

  return (
    <Tabs
      {...props}
      ref={rootRef}
      value={value}
      onMouseDownCapture={(event) => {
        props.onMouseDownCapture?.(event);
        if (!event.defaultPrevented && event.button === 0)
          capture(event.target);
      }}
      onKeyDownCapture={(event) => {
        props.onKeyDownCapture?.(event);
        if (
          !event.defaultPrevented &&
          ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(
            event.key,
          )
        )
          capture(event.target);
      }}
      onFocusCapture={(event) => {
        props.onFocusCapture?.(event);
        if (!event.defaultPrevented) capture(event.target);
      }}
    />
  );
}

function ChoicePanel({
  active,
  children,
  onBeforeMatch,
  value,
}: {
  active: boolean;
  children: ReactNode;
  onBeforeMatch: () => void;
  value: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel || active) return;
    panel.setAttribute('hidden', 'until-found');
    panel.addEventListener('beforematch', onBeforeMatch);
    return () => panel.removeEventListener('beforematch', onBeforeMatch);
  }, [active, onBeforeMatch]);
  return (
    <TabsContent
      className="min-w-0"
      forceMount
      hidden={!active}
      ref={ref}
      tabIndex={active ? 0 : -1}
      value={value}
    >
      {children}
    </TabsContent>
  );
}

function HiddenSearchPath({
  onBeforeMatch,
  path,
}: {
  onBeforeMatch: () => void;
  path: string;
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
    'openapi-schema-search-path',
    {
      'aria-hidden': 'true',
      className: 'sr-only',
      'data-openapi-schema-search-path': '',
      hidden: 'until-found',
      ref,
    },
    path,
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
