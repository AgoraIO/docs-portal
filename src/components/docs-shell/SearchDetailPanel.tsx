'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type DetailPlacement = 'right' | 'left' | 'strip';

const PANEL_WIDTH = 260;
const GAP = 14;
const NEED = PANEL_WIDTH + GAP;

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
    const list = dialog.querySelector<HTMLElement>(
      '[data-slot="command-list"]',
    );

    function compute() {
      if (!dialog) {
        return;
      }
      const dr = dialog.getBoundingClientRect();
      let next: DetailPlacement;
      if (window.innerWidth - dr.right >= NEED) {
        next = 'right';
      } else if (dr.left >= NEED) {
        next = 'left';
      } else {
        next = 'strip';
      }
      setPlacement(next);

      if (next !== 'strip') {
        const row = dialog.querySelector<HTMLElement>(
          '[data-slot="command-item"][aria-selected="true"]',
        );
        const rr = row?.getBoundingClientRect();
        const top = Math.min(
          Math.max(rr ? rr.top : dr.top, dr.top + 8),
          Math.max(dr.top + 8, dr.bottom - 96),
        );
        setStyle({
          left: next === 'right' ? dr.right + GAP : dr.left - GAP - PANEL_WIDTH,
          position: 'fixed',
          top,
          width: PANEL_WIDTH,
        });
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
          <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
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
    <div
      className="pointer-events-none fixed z-[60] w-[260px] rounded-xl border border-border bg-popover/95 p-3 shadow-2xl backdrop-blur"
      data-mode="beside"
      data-testid="search-active-detail"
      style={style}
    >
      {title ? (
        <div className="mb-1 font-medium text-sm text-foreground">{title}</div>
      ) : null}
      <div className="text-xs leading-5 text-muted-foreground">
        {renderText(description)}
      </div>
    </div>,
    document.body,
  );
}
