import { type ReactNode, useEffect, useRef } from 'react';

export function OpenApiCodePreview({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const markCodeViewports = () => {
      for (const viewport of root.querySelectorAll<HTMLElement>(
        '[role="tabpanel"] .fd-scroll-container',
      )) {
        viewport.setAttribute('data-openapi-code-viewport', '');
      }
    };

    markCodeViewports();

    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(markCodeViewports);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
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
