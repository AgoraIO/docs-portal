import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import { buildUniqueOpenApiAnchorIds } from '@/lib/openapi/anchors';
import {
  buildOpenApiSchemaRows,
  getInitialOpenApiSchemaExpandedPaths,
  getOpenApiSchemaRowLayout,
  type OpenApiSchemaCallout,
  type OpenApiSchemaRow,
  type OpenApiSchemaUsage,
} from '@/lib/openapi/schema-tree';
import { type OpenApiFieldLabels, OpenApiFieldRow } from './OpenApiFieldRow';

export type OpenApiSchemaTreeLabels = OpenApiFieldLabels & {
  collapseAll: string;
  expandAll: string;
  schemaFields: string;
};

export function OpenApiSchemaTree({
  anchorPrefix,
  document,
  labels,
  omitArrayItemWrapperRows,
  renderCallouts,
  renderDescription,
  renderMetadata,
  root,
  usage,
}: {
  anchorPrefix: string;
  document?: unknown;
  labels: OpenApiSchemaTreeLabels;
  omitArrayItemWrapperRows?: boolean;
  renderCallouts: (callouts?: OpenApiSchemaCallout[]) => ReactNode;
  renderDescription: (markdown: string) => ReactNode;
  renderMetadata: (row: OpenApiSchemaRow) => ReactNode;
  root: unknown;
  usage: OpenApiSchemaUsage;
}) {
  const rows = useMemo(
    () =>
      buildOpenApiSchemaRows(root, {
        document,
        omitArrayItemWrapperRows,
        usage,
      }),
    [document, omitArrayItemWrapperRows, root, usage],
  );
  const anchorIds = useMemo(
    () =>
      buildUniqueOpenApiAnchorIds(
        anchorPrefix,
        rows.map((row) => row.path),
      ),
    [anchorPrefix, rows],
  );
  const layout = useMemo(() => getOpenApiSchemaRowLayout(rows), [rows]);
  const collapsibleRowIds = useMemo(
    () => anchorIds.filter((_, index) => layout.hasChildren[index]),
    [anchorIds, layout],
  );
  const initialExpandedRowIds = useMemo(() => {
    const paths = getInitialOpenApiSchemaExpandedPaths(rows, layout, usage);
    return new Set(anchorIds.filter((_, index) => paths.has(rows[index].path)));
  }, [anchorIds, layout, rows, usage]);
  const [expandedRowIds, setExpandedRowIds] = useState(
    () => new Set(initialExpandedRowIds),
  );

  useEffect(() => {
    setExpandedRowIds(new Set(initialExpandedRowIds));
  }, [initialExpandedRowIds]);

  useOpenApiSchemaHashExpansion(
    anchorIds,
    layout.parentIndex,
    setExpandedRowIds,
  );

  const visibleFlags = useMemo(() => {
    const flags: boolean[] = [];

    rows.forEach((_row, index) => {
      const parent = layout.parentIndex[index];
      flags[index] =
        parent === -1
          ? true
          : flags[parent] && expandedRowIds.has(anchorIds[parent]);
    });

    return flags;
  }, [anchorIds, expandedRowIds, layout, rows]);

  if (rows.length === 0) {
    return null;
  }

  const hasExpandedRows = expandedRowIds.size > 0;

  return (
    <div
      className="openapi-schema-tree not-prose my-4 overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground"
      data-testid="openapi-schema-tree"
    >
      {collapsibleRowIds.length > 0 ? (
        <div className="flex justify-end border-fd-border border-b px-4 py-2">
          <button
            aria-label={`${hasExpandedRows ? labels.collapseAll : labels.expandAll} ${labels.schemaFields}`}
            className="rounded-md border border-fd-border px-2.5 py-1 font-medium text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            onClick={() =>
              setExpandedRowIds(
                hasExpandedRows ? new Set() : new Set(collapsibleRowIds),
              )
            }
            type="button"
          >
            {hasExpandedRows ? labels.collapseAll : labels.expandAll}
          </button>
        </div>
      ) : null}
      {rows.map((row, index) => {
        if (!visibleFlags[index]) return null;

        const anchorId = anchorIds[index];
        const expandable = layout.hasChildren[index];
        const depth = Math.min(row.depth, 3);
        const style = {
          '--openapi-schema-indent-desktop': `${depth * 20}px`,
          '--openapi-schema-indent-mobile': `${Math.min(row.depth, 3) * 16}px`,
        } as CSSProperties;
        const type =
          row.nullable && !row.type.split(' | ').includes('null')
            ? `${row.type} | null`
            : row.type;
        const details = (
          <>
            {row.description ? renderDescription(row.description) : null}
            {renderCallouts(row.docsCallouts)}
            {renderMetadata(row)}
          </>
        );

        return (
          <div
            className={`openapi-schema-depth${row.depth > 0 ? ' openapi-schema-depth-nested' : ''}`}
            key={row.path}
            style={style}
          >
            {expandable ? (
              <OpenApiFieldRow
                anchorId={anchorId}
                deprecated={row.deprecated}
                details={details}
                expandable
                expanded={expandedRowIds.has(anchorId)}
                labels={labels}
                name={row.name}
                onExpandedChange={(expanded) => {
                  setExpandedRowIds((current) => {
                    const next = new Set(current);
                    if (expanded) next.add(anchorId);
                    else next.delete(anchorId);
                    return next;
                  });
                }}
                requiredState={row.required ? 'required' : 'optional'}
                type={type}
              />
            ) : (
              <OpenApiFieldRow
                anchorId={anchorId}
                deprecated={row.deprecated}
                details={details}
                labels={labels}
                name={row.name}
                requiredState={row.required ? 'required' : 'optional'}
                type={type}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function useOpenApiSchemaHashExpansion(
  anchorIds: string[],
  parentIndex: number[],
  setExpandedIds: (updater: (current: Set<string>) => Set<string>) => void,
) {
  useEffect(() => {
    const openCurrentHashTarget = () => {
      const targetIndex = anchorIds.indexOf(getCurrentOpenApiHashAnchorId());
      if (targetIndex === -1) return;

      const ancestors: string[] = [];
      for (
        let parent = parentIndex[targetIndex];
        parent !== -1;
        parent = parentIndex[parent]
      ) {
        ancestors.push(anchorIds[parent]);
      }

      if (ancestors.length > 0) {
        setExpandedIds((current) => {
          if (ancestors.every((id) => current.has(id))) return current;
          return new Set([...current, ...ancestors]);
        });
      }

      window.requestAnimationFrame(() =>
        syncDocsHashTargetFromLocation('auto'),
      );
    };

    const frame = window.requestAnimationFrame(openCurrentHashTarget);
    window.addEventListener('hashchange', openCurrentHashTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', openCurrentHashTarget);
    };
  }, [anchorIds, parentIndex, setExpandedIds]);
}

function getCurrentOpenApiHashAnchorId() {
  const hash = window.location.hash;
  if (!hash.startsWith('#')) return '';
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}
