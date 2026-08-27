import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

export const DEFAULT_OPENAPI_RAIL_STICKY_TOP = 48;
const MIN_CODE_LINES = 8;
const CODE_LINE_HEIGHT = 20;
const RAIL_BOTTOM_GAP = 16;
const DESKTOP_LAYOUT_MIN_REM = 59;

export function OpenApiExamplesRail({
  children,
  stickyTop: stickyTopProp,
}: {
  children: ReactNode;
  stickyTop?: number;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [constrained, setConstrained] = useState(false);
  const [resolvedStickyTop, setResolvedStickyTop] = useState(
    stickyTopProp ?? DEFAULT_OPENAPI_RAIL_STICKY_TOP,
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const syncStickyTop = () => {
      const nextStickyTop = stickyTopProp ?? getRailStickyTop(rail);
      setResolvedStickyTop((current) =>
        current === nextStickyTop ? current : nextStickyTop,
      );
    };
    syncStickyTop();

    const offsetSource = findDocsShellOffsetSource(rail);
    if (!offsetSource || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(syncStickyTop);
    observer.observe(offsetSource, {
      attributeFilter: ['style'],
      attributes: true,
    });
    return () => observer.disconnect();
  }, [stickyTopProp]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const stickyTop = resolvedStickyTop;

    let frame = 0;
    const getActiveViewport = () => {
      const viewports = getRequestCodeViewports(rail);
      return viewports.find((viewport) => {
        if (
          viewport.hidden ||
          viewport.closest('[hidden]') ||
          viewport.closest('[aria-hidden="true"]') ||
          viewport.closest('[data-state="inactive"]') ||
          viewport.closest('[role="tabpanel"][hidden]')
        ) {
          return false;
        }
        const style = window.getComputedStyle?.(viewport);
        return (
          viewport.getClientRects().length > 0 &&
          style?.display !== 'none' &&
          style?.visibility !== 'hidden'
        );
      });
    };
    const calculate = () => {
      frame = 0;
      const availableRailHeight = Math.max(
        0,
        window.innerHeight - stickyTop - RAIL_BOTTOM_GAP,
      );
      const viewports = getRequestCodeViewports(rail);
      const activeViewport = getActiveViewport();
      for (const viewport of viewports) {
        if (viewport === activeViewport)
          viewport.setAttribute('data-openapi-code-viewport-active', '');
        else viewport.removeAttribute('data-openapi-code-viewport-active');
      }
      const naturalCodeHeight = activeViewport?.scrollHeight ?? 0;
      const activeClientHeight = activeViewport?.clientHeight ?? 0;
      const fixedRailHeight = Math.max(
        0,
        rail.scrollHeight - activeClientHeight,
      );
      const availableCodeHeight = Math.max(
        0,
        availableRailHeight - fixedRailHeight,
      );
      const layoutParent = anchorRef.current?.parentElement;
      const layoutWidth = layoutParent?.getBoundingClientRect().width ?? 0;
      const rootFontSize = getRootFontSize();
      const isWideLayout =
        Boolean(layoutParent) &&
        layoutWidth >= DESKTOP_LAYOUT_MIN_REM * rootFontSize;
      rail.style.setProperty(
        '--openapi-rail-available-height',
        `${availableRailHeight}px`,
      );
      rail.style.setProperty(
        '--openapi-code-available-height',
        `${availableCodeHeight}px`,
      );
      const nextConstrained = Boolean(
        stuck &&
          isWideLayout &&
          activeViewport &&
          availableCodeHeight >= MIN_CODE_LINES * CODE_LINE_HEIGHT &&
          naturalCodeHeight > availableCodeHeight,
      );
      setConstrained(nextConstrained);
    };
    const scheduleCalculate = () => {
      if (frame) return;
      if (typeof window.requestAnimationFrame === 'function') {
        frame = window.requestAnimationFrame(calculate);
      } else {
        calculate();
      }
    };

    scheduleCalculate();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => scheduleCalculate());
      resizeObserver.observe(rail);
      const layoutParent = anchorRef.current?.parentElement;
      if (layoutParent) resizeObserver.observe(layoutParent);
      const activeViewport = getActiveViewport();
      if (activeViewport) resizeObserver.observe(activeViewport);
    }

    let mutationObserver: MutationObserver | undefined;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver.observe(rail);
          const layoutParent = anchorRef.current?.parentElement;
          if (layoutParent) resizeObserver.observe(layoutParent);
          const activeViewport = getActiveViewport();
          if (activeViewport) resizeObserver.observe(activeViewport);
        }
        scheduleCalculate();
      });
      mutationObserver.observe(rail, {
        attributes: true,
        attributeFilter: [
          'class',
          'hidden',
          'aria-hidden',
          'data-state',
          'data-wrap-lines',
        ],
        childList: true,
        subtree: true,
      });
    }

    const onWindowResize = () => scheduleCalculate();
    window.addEventListener('resize', onWindowResize);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', onWindowResize);
      if (frame && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [resolvedStickyTop, stuck]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    const stickyTop = resolvedStickyTop;
    const sentinel = anchor.querySelector<HTMLElement>(
      '[data-openapi-examples-rail-sentinel]',
    );
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setStuck(
          !entry.isIntersecting && entry.boundingClientRect.top <= stickyTop,
        );
      },
      { rootMargin: `-${stickyTop}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [resolvedStickyTop]);

  return (
    <div className="openapi-examples-rail-anchor" ref={anchorRef}>
      <div aria-hidden="true" data-openapi-examples-rail-sentinel="" />
      <div
        className="openapi-examples-rail"
        data-constrained={constrained}
        data-stuck={stuck}
        data-testid="openapi-examples-rail"
        ref={railRef}
        style={
          stickyTopProp === undefined
            ? undefined
            : ({
                '--openapi-examples-sticky-top': `${stickyTopProp}px`,
              } as CSSProperties)
        }
      >
        <div className="openapi-examples-rail-content">{children}</div>
      </div>
    </div>
  );
}

function getRailStickyTop(rail: HTMLElement) {
  const value = window
    .getComputedStyle(rail)
    .getPropertyValue('--openapi-examples-sticky-top')
    .trim();
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : DEFAULT_OPENAPI_RAIL_STICKY_TOP;
}

function getRootFontSize() {
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('font-size');
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

function findDocsShellOffsetSource(element: HTMLElement) {
  for (
    let current = element.parentElement;
    current;
    current = current.parentElement
  ) {
    if (current.style.getPropertyValue('--docs-shell-header-offset')) {
      return current;
    }
  }

  return undefined;
}

function getRequestCodeViewports(rail: HTMLElement) {
  const rolePreviews = rail.querySelectorAll(
    '.openapi-code-preview[data-openapi-code-role]',
  );
  if (rolePreviews.length === 0) {
    return Array.from(
      rail.querySelectorAll<HTMLElement>('[data-openapi-code-viewport]'),
    );
  }
  return Array.from(
    rail.querySelectorAll<HTMLElement>(
      '.openapi-code-preview[data-openapi-code-role="request"] [data-openapi-code-viewport]',
    ),
  );
}
