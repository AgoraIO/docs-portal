'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DetailPlacement = 'right' | 'left' | 'strip';

const PANEL_WIDTH = 260;
const GAP = 14;
const MIN_PANEL_WIDTH = 200;
const VIEWPORT_MARGIN = 16;

export function SearchDetailPanel({
  activeValue,
  description,
  open,
  placement: placementOverride,
  renderText,
  showStrip = true,
  title,
}: {
  activeValue: string | null;
  description?: string;
  open: boolean;
  // Test seam: force a mode instead of measuring the DOM.
  placement?: DetailPlacement;
  renderText: (value: string) => ReactNode;
  showStrip?: boolean;
  title?: string;
}) {
  const [placement, setPlacement] = useState<DetailPlacement>(
    placementOverride ?? 'strip',
  );
  const [style, setStyle] = useState<CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<{
    placement: DetailPlacement;
    left: number;
    top: number;
    width: number;
  } | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeValue is intentional — it triggers repositioning when the active result changes
  useLayoutEffect(() => {
    if (placementOverride) {
      setPlacement(placementOverride);
      return;
    }
    if (!open) {
      return;
    }
    const dialog = document.querySelector<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    if (!dialog) {
      return;
    }
    const d: HTMLElement = dialog;
    const list = d.querySelector<HTMLElement>('[data-slot="command-list"]');

    function compute() {
      const dr = d.getBoundingClientRect();
      const rightWidth = Math.min(
        PANEL_WIDTH,
        window.innerWidth - dr.right - GAP - VIEWPORT_MARGIN,
      );
      const leftWidth = Math.min(PANEL_WIDTH, dr.left - GAP - VIEWPORT_MARGIN);
      let next: DetailPlacement;
      let width = PANEL_WIDTH;
      if (rightWidth >= MIN_PANEL_WIDTH) {
        next = 'right';
        width = rightWidth;
      } else if (leftWidth >= MIN_PANEL_WIDTH) {
        next = 'left';
        width = leftWidth;
      } else {
        next = 'strip';
      }

      let left = 0;
      let top = 0;
      if (next !== 'strip') {
        const row = d.querySelector<HTMLElement>(
          '[data-slot="command-item"][aria-selected="true"]',
        );
        const rr = row?.getBoundingClientRect();
        top = Math.max(
          VIEWPORT_MARGIN,
          Math.min(
            rr?.top ?? dr.top,
            window.innerHeight -
              (cardRef.current?.offsetHeight || 96) -
              VIEWPORT_MARGIN,
          ),
        );
        left = next === 'right' ? dr.right + GAP : dr.left - GAP - width;
      }

      const prev = lastRef.current;
      if (
        prev &&
        prev.placement === next &&
        prev.left === left &&
        prev.top === top &&
        prev.width === width
      ) {
        return;
      }
      lastRef.current = { left, placement: next, top, width };

      setPlacement(next);
      if (next !== 'strip') {
        setStyle({ left, position: 'fixed', top, width });
      }
    }

    compute();
    window.addEventListener('resize', compute);
    list?.addEventListener('scroll', compute);
    return () => {
      window.removeEventListener('resize', compute);
      list?.removeEventListener('scroll', compute);
    };
  }, [
    activeValue,
    open,
    placementOverride,
    placement,
    description,
    style.width,
  ]);

  if (!open) return null;

  if (placement === 'strip') {
    if (!showStrip) return null;
    // Fixed-height reserved strip, rendered in place (the footer). Blank when
    // there is no description so the dialog stays height-stable in strip mode.
    return (
      <div
        className="h-[54px] shrink-0 overflow-hidden border-t px-4 py-2"
        data-mode="strip"
        data-testid="search-active-detail"
      >
        {description ? (
          // Keyed on activeValue so the fade replays when the selection changes.
          <div
            className="search-detail-enter line-clamp-2 break-words text-xs leading-5 text-muted-foreground"
            key={activeValue ?? 'first'}
          >
            {renderText(description)}
          </div>
        ) : null}
      </div>
    );
  }

  // Beside: nothing lives in the footer; the card floats out of layout flow.
  if (!description) {
    return null;
  }
  return createPortal(
    // Keyed on activeValue so the fade/nudge replays when the selection changes.
    <div
      className="search-detail-enter pointer-events-none fixed z-[60] max-h-[calc(100dvh-2rem)] w-[260px] overflow-hidden rounded-xl border border-border bg-popover/95 p-3 shadow-2xl backdrop-blur"
      data-mode="beside"
      data-testid="search-active-detail"
      key={activeValue ?? 'first'}
      ref={cardRef}
      style={style}
    >
      {title ? (
        <div className="mb-1 break-words font-medium text-sm text-foreground">
          {renderText(title)}
        </div>
      ) : null}
      <div className="break-words text-xs leading-5 text-muted-foreground">
        {renderText(description)}
      </div>
    </div>,
    document.body,
  );
}
