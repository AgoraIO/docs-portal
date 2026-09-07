import { type ReactNode, useEffect, useRef } from 'react';

export function OpenApiCodePreview({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const hideTimers = new Map<HTMLElement, number>();
    const cleanupScrollListeners = new Map<HTMLElement, () => void>();

    const bindScrollListener = (viewport: HTMLElement) => {
      if (cleanupScrollListeners.has(viewport)) return;

      const showScrollbar = () => {
        viewport.setAttribute('data-scrollbar-visible', '');
        const previousTimer = hideTimers.get(viewport);
        if (previousTimer !== undefined) {
          window.clearTimeout(previousTimer);
        }
        hideTimers.set(
          viewport,
          window.setTimeout(() => {
            viewport.removeAttribute('data-scrollbar-visible');
            hideTimers.delete(viewport);
          }, 700),
        );
      };

      viewport.addEventListener('scroll', showScrollbar, { passive: true });
      cleanupScrollListeners.set(viewport, () => {
        viewport.removeEventListener('scroll', showScrollbar);
        const timer = hideTimers.get(viewport);
        if (timer !== undefined) window.clearTimeout(timer);
        hideTimers.delete(viewport);
        viewport.removeAttribute('data-scrollbar-visible');
      });
    };

    const markCodeViewports = () => {
      for (const viewport of root.querySelectorAll<HTMLElement>(
        '[role="tabpanel"] .fd-scroll-container',
      )) {
        viewport.setAttribute('data-openapi-code-viewport', '');
        bindScrollListener(viewport);
      }
    };

    markCodeViewports();

    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(markCodeViewports);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const cleanup of cleanupScrollListeners.values()) cleanup();
      cleanupScrollListeners.clear();
      hideTimers.clear();
    };
  }, []);

  return (
    <div
      className="openapi-code-preview"
      data-testid="openapi-code-preview"
      ref={rootRef}
    >
      {children}
    </div>
  );
}
