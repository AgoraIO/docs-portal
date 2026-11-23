import {
  type ComponentProps,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { normalizeLocale } from '@/lib/i18n/i18n-config';
import { resources } from '@/lib/i18n/resources';

import { type DocsTableColumnKind, prepareTableColumns } from './table-columns';
import { applyTableContentSizing } from './table-sizing.dom';

function isSimpleParameterTable(headers: string[] | undefined): boolean {
  const labels = headers?.join('|') ?? '';
  return (
    /^(?:参数|属性|名称)\|类型\|是否必填\|默认值\|(?:描述|说明)$/.test(
      labels,
    ) ||
    /^(?:parameter|property|name)\|type\|required\|default(?: value)?\|description$/.test(
      labels,
    )
  );
}

export function DocsTable({
  locale,
  className,
  compact,
  columns,
  layout = compact ? 'fixed' : 'auto',
  density = compact ? 'compact' : 'normal',
  children,
  style,
  ...props
}: ComponentProps<'table'> & {
  compact?: boolean;
  locale?: string;
  columns?: readonly DocsTableColumnKind[];
  layout?: 'auto' | 'fixed';
  density?: 'normal' | 'compact';
}) {
  const { i18n } = useTranslation('common');
  const normalizedLocale = normalizeLocale(locale ?? i18n.language) ?? 'en';
  const copy = resources[normalizedLocale].common.docs;
  const table = useMemo(
    () => prepareTableColumns(children, columns),
    [children, columns],
  );
  const parameterTable = isSimpleParameterTable(table.headers);
  const scrollRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateOverflowState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const overflow = element.scrollWidth > element.clientWidth + 1;
    setHasOverflow(overflow);
    setIsAtEnd(
      !overflow ||
        element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    updateOverflowState();
    window.addEventListener('resize', updateOverflowState);
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateOverflowState);
    if (scrollRef.current) {
      resizeObserver?.observe(scrollRef.current);
      const nativeTable = scrollRef.current.querySelector(':scope > table');
      if (nativeTable) resizeObserver?.observe(nativeTable);
    }

    return () => {
      window.removeEventListener('resize', updateOverflowState);
      resizeObserver?.disconnect();
    };
  }, [updateOverflowState]);

  useEffect(() => {
    const nativeTable = scrollRef.current?.querySelector(':scope > table');
    if (!(nativeTable instanceof HTMLTableElement)) return;
    const updateContent = () => {
      applyTableContentSizing(nativeTable, columns);
      updateOverflowState();
    };
    updateContent();
    let frame: number | undefined;
    const observer = new MutationObserver(() => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        updateContent();
      });
    });
    // Structural span changes alter logical columns even when text is stable.
    // Exclude our own style/data writes from the attribute filter.
    observer.observe(nativeTable, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['rowspan', 'colspan'],
    });
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [columns, updateOverflowState]);

  return (
    <div
      className="docs-table-container relative my-[var(--docs-space-block)]"
      data-table-overflow={hasOverflow ? 'true' : 'false'}
      data-table-scroll-end={isAtEnd ? 'true' : 'false'}
    >
      <section
        aria-describedby={hasOverflow ? descriptionId : undefined}
        aria-label={copy.tableOverflowLabel}
        className="prose-no-margin relative overflow-auto"
        onScroll={updateOverflowState}
        ref={scrollRef}
        tabIndex={hasOverflow ? 0 : undefined}
      >
        <table
          data-table-content-layout={
            table.sizing
              ? table.sizing.intrinsic
                ? 'intrinsic'
                : 'mixed'
              : undefined
          }
          data-table-layout={
            layout === 'fixed'
              ? 'fixed'
              : parameterTable
                ? 'parameters'
                : undefined
          }
          data-table-density={density === 'compact' ? 'compact' : undefined}
          className={cn(
            // Physical first-child changes when earlier columns span rows.
            // The MDX compiler marks logical columns and final-row edges.
            '[&_[data-table-column]:not([data-table-column="0"])]:[border-inline-start:1px_solid_var(--docs-prose-table-border,var(--color-fd-border))]!',
            '[&_[data-table-column="0"]]:[border-inline-start:0]!',
            '[&_[data-table-bottom-edge]]:border-b-0!',
            layout === 'fixed' && 'w-full! min-w-[40rem]! table-fixed!',
            className,
          )}
          style={
            {
              '--docs-table-flex-columns': Math.max(
                1,
                table.sizing?.flexible ?? 1,
              ),
              '--docs-table-compact-width': `${table.sizing?.compactCh ?? 0}ch`,
              ...style,
            } as CSSProperties
          }
          {...props}
        >
          {table.children}
        </table>
      </section>
      <span className="sr-only" id={descriptionId}>
        {copy.tableOverflowDescription}
      </span>
    </div>
  );
}
