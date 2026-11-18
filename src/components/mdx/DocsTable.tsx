import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactNode,
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

function tableHeaderText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      return isValidElement<{ children?: ReactNode }>(child)
        ? tableHeaderText(child.props.children)
        : '';
    })
    .join('');
}

type TableCellProps = ComponentProps<'td'> & {
  'data-table-column-kind'?: 'required' | 'requirement';
};

const elements = (value: ReactNode) =>
  Children.toArray(value).filter(isValidElement<TableCellProps>);

function hasMergedCells(value: ReactNode): boolean {
  return elements(value).some(
    ({ props }) =>
      (props.colSpan ?? 1) > 1 ||
      (props.rowSpan ?? 1) > 1 ||
      hasMergedCells(props.children),
  );
}

function simpleTableHeaders(children: ReactNode): string[] | undefined {
  if (hasMergedCells(children)) return;
  const head = elements(children).find((node) => node.type === 'thead');
  const rows = elements(head?.props.children);
  if (rows.length !== 1 || rows[0].type !== 'tr') return;
  const cells = elements(rows[0].props.children);
  if (cells.some((node) => node.type !== 'th')) return;
  return cells.map((cell) =>
    tableHeaderText(cell.props.children).trim().toLowerCase(),
  );
}

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

function requiredColumnCells(
  children: ReactNode,
  headers: string[] | undefined,
) {
  if (!headers || headers.length < 3 || headers.length > 5) return children;
  const required = headers.findIndex((label) =>
    /^(?:(?:是否)?(?:必填|必选|必需|必须|可选)|required|optional|mandatory|填写要求)$/.test(
      label,
    ),
  );
  if (required < 0) return children;
  const sections = elements(children).filter((node) =>
    ['thead', 'tbody', 'tfoot'].includes(String(node.type)),
  );
  // A positional match is safe only for a rectangular, unmerged table.
  if (
    sections.some((section) =>
      elements(section.props.children).some(
        (row) =>
          row.type !== 'tr' ||
          elements(row.props.children).length !== headers.length,
      ),
    )
  )
    return children;

  return Children.map(children, (section) => {
    if (
      !isValidElement<TableCellProps>(section) ||
      !['thead', 'tbody', 'tfoot'].includes(String(section.type))
    )
      return section;
    return cloneElement(section, {
      children: Children.map(section.props.children, (row) => {
        if (!isValidElement<TableCellProps>(row) || row.type !== 'tr')
          return row;
        let column = 0;
        return cloneElement(row, {
          children: Children.map(row.props.children, (cell) => {
            if (!isValidElement<TableCellProps>(cell)) return cell;
            if (column++ !== required) return cell;
            return cloneElement(cell, {
              'data-table-column-kind':
                headers[required] === '填写要求' ? 'requirement' : 'required',
              style: { ...cell.props.style, textAlign: 'center' },
            });
          }),
        });
      }),
    });
  });
}

export function DocsTable({
  locale,
  className,
  compact,
  children,
  ...props
}: ComponentProps<'table'> & { compact?: boolean; locale?: string }) {
  const { i18n } = useTranslation('common');
  const normalizedLocale = normalizeLocale(locale ?? i18n.language) ?? 'en';
  const copy = resources[normalizedLocale].common.docs;
  const headers = useMemo(() => simpleTableHeaders(children), [children]);
  const parameterTable = isSimpleParameterTable(headers);
  const tableChildren = useMemo(
    () => requiredColumnCells(children, headers),
    [children, headers],
  );
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
    }

    return () => {
      window.removeEventListener('resize', updateOverflowState);
      resizeObserver?.disconnect();
    };
  }, [updateOverflowState]);

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
          data-table-layout={parameterTable ? 'parameters' : undefined}
          className={cn(
            // Physical first-child changes when earlier columns span rows.
            // The MDX compiler marks logical columns and final-row edges.
            '[&_[data-table-column]:not([data-table-column="0"])]:[border-inline-start:1px_solid_var(--docs-prose-table-border,var(--color-fd-border))]!',
            '[&_[data-table-column="0"]]:[border-inline-start:0]!',
            '[&_[data-table-bottom-edge]]:border-b-0!',
            compact &&
              'w-full! min-w-[40rem]! table-fixed! [&_th]:min-w-0! [&_td]:min-w-0! [&_th]:p-1.5! [&_td]:p-1.5! [&_th]:whitespace-normal! [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere]',
            parameterTable &&
              '[&_:is(th,td):nth-child(2)]:min-w-24 [&_:is(th,td):nth-child(3)]:min-w-16 [&_:is(th,td):nth-child(4)]:min-w-20 [&_:is(th,td):nth-child(5)]:min-w-[min(24rem,calc(100vw_-_4rem))]',
            className,
          )}
          {...props}
        >
          {tableChildren}
        </table>
      </section>
      <span className="sr-only" id={descriptionId}>
        {copy.tableOverflowDescription}
      </span>
    </div>
  );
}
