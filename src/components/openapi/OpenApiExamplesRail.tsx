import { type ReactNode, useEffect, useRef, useState } from 'react';

export const DEFAULT_OPENAPI_RAIL_STICKY_TOP = 48;
const MIN_CODE_LINES = 8;
const CODE_LINE_HEIGHT = 20;
const RAIL_BOTTOM_GAP = 16;

export function OpenApiExamplesRail({
  children,
  stickyTop = DEFAULT_OPENAPI_RAIL_STICKY_TOP,
}: {
  children: ReactNode;
  stickyTop?: number;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [constrained, setConstrained] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const getActiveViewport = () => {
      const viewports = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-openapi-code-viewport]'),
      );
      return viewports.find((viewport) => {
        if (
          viewport.hidden ||
          viewport.getAttribute('aria-hidden') === 'true' ||
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
      const viewports = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-openapi-code-viewport]'),
      );
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
      const activeViewport = getActiveViewport();
      if (activeViewport) resizeObserver.observe(activeViewport);
    }

    let mutationObserver: MutationObserver | undefined;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver.observe(rail);
          const activeViewport = getActiveViewport();
          if (activeViewport) resizeObserver.observe(activeViewport);
        }
        scheduleCalculate();
      });
      mutationObserver.observe(rail, {
        attributes: true,
        attributeFilter: ['class', 'hidden', 'aria-hidden', 'data-state'],
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
  }, [stickyTop, stuck]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === 'undefined') return;
    const sentinel = rail.querySelector<HTMLElement>(
      '[data-openapi-examples-rail-sentinel]',
    );
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setStuck(
        !entry.isIntersecting && entry.boundingClientRect.top <= stickyTop,
      );
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyTop]);

  return (
    <div
      className="openapi-examples-rail"
      data-constrained={constrained}
      data-stuck={stuck}
      data-testid="openapi-examples-rail"
      ref={railRef}
    >
      <div aria-hidden="true" data-openapi-examples-rail-sentinel="" />
      <div className="openapi-examples-rail-content">{children}</div>
    </div>
  );
}
