'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DetailPlacement = 'right' | 'left' | 'strip';

const PANEL_WIDTH = 260;
const GAP = 14;
const MIN_SIDE_CLEARANCE = PANEL_WIDTH + GAP;

export function SearchDetailPanel({
  activeValue,
  description,
  open,
  placement: placementOverride,
  renderText,
  title,
}: {
  activeValue: string | null;
  description?: string;
  open: boolean;
  // Test seam: force a mode instead of measuring the DOM.
  placement?: DetailPlacement;
  renderText: (value: string) => ReactNode;
  title?: string;
}) {
  const [placement, setPlacement] = useState<DetailPlacement>(
    placementOverride ?? 'strip',
  );
  const [style, setStyle] = useState<CSSProperties>({});
  const lastRef = useRef<{
    placement: DetailPlacement;
    left: number;
    top: number;
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
      let next: DetailPlacement;
      if (window.innerWidth - dr.right >= MIN_SIDE_CLEARANCE) {
        next = 'right';
      } else if (dr.left >= MIN_SIDE_CLEARANCE) {
        next = 'left';
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
        top = Math.min(
          Math.max(rr ? rr.top : dr.top, dr.top + 8),
          Math.max(dr.top + 8, dr.bottom - 96),
        );
        left = next === 'right' ? dr.right + GAP : dr.left - GAP - PANEL_WIDTH;
      }

      const prev = lastRef.current;
      if (
        prev &&
        prev.placement === next &&
        prev.left === left &&
        prev.top === top
      ) {
        return;
      }
      lastRef.current = { left, placement: next, top };

      setPlacement(next);
      if (next !== 'strip') {
        setStyle({ left, position: 'fixed', top, width: PANEL_WIDTH });
      }
    }

    compute();
    window.addEventListener('resize', compute);
    list?.addEventListener('scroll', compute);
    return () => {
      window.removeEventListener('resize', compute);
      list?.removeEventListener('scroll', compute);
    };
  }, [activeValue, open, placementOverride]);

  if (placement === 'strip') {
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
      className="search-detail-enter pointer-events-none fixed z-[60] w-[260px] rounded-xl border border-border bg-popover/95 p-3 shadow-2xl backdrop-blur"
      data-mode="beside"
      data-testid="search-active-detail"
      key={activeValue ?? 'first'}
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
