import {
  type ComponentProps,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { normalizeLocale } from '@/lib/i18n/i18n-config';
import { resources } from '@/lib/i18n/resources';

export function DocsTable({
  locale,
  className,
  compact,
  ...props
}: ComponentProps<'table'> & { compact?: boolean; locale?: string }) {
  const { i18n } = useTranslation('common');
  const normalizedLocale = normalizeLocale(locale ?? i18n.language) ?? 'en';
  const copy = resources[normalizedLocale].common.docs;
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
      className="docs-table-container relative my-6"
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
          className={cn(
            // Physical first-child changes when earlier columns span rows.
            // The MDX compiler marks logical columns and final-row edges.
            '[&_[data-table-column]:not([data-table-column="0"])]:[border-inline-start:1px_solid_var(--docs-prose-table-border,var(--color-fd-border))]!',
            '[&_[data-table-column="0"]]:[border-inline-start:0]!',
            '[&_[data-table-bottom-edge]]:border-b-0!',
            compact &&
              'w-full! min-w-[40rem]! table-fixed! [&_th]:min-w-0! [&_td]:min-w-0! [&_th]:p-1.5! [&_td]:p-1.5! [&_th]:whitespace-normal! [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere]',
            className,
          )}
          {...props}
        />
      </section>
      <span className="sr-only" id={descriptionId}>
        {copy.tableOverflowDescription}
      </span>
    </div>
  );
}
