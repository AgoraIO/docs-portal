import { WrapText } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

export function OpenApiCodePreview({
  children,
  resetKey,
  wrapLabel = 'Wrap lines',
}: {
  children: ReactNode;
  resetKey: string;
  wrapLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousResetKey = useRef(resetKey);
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    if (previousResetKey.current === resetKey) return;

    previousResetKey.current = resetKey;
    setWrap(false);
  }, [resetKey]);

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
      data-wrap-lines={wrap}
      ref={rootRef}
    >
      <button
        aria-pressed={wrap}
        className="inline-flex items-center gap-1 rounded-md border border-fd-border px-2 py-1 text-fd-muted-foreground text-xs hover:bg-fd-accent hover:text-fd-accent-foreground"
        onClick={() => setWrap((value) => !value)}
        type="button"
      >
        <WrapText aria-hidden="true" className="size-3.5" />
        {wrapLabel}
      </button>
      {children}
    </div>
  );
}
