import { WrapText } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

export type OpenApiCodeRole = 'request' | 'response';

export function OpenApiCodePreview({
  children,
  codeRole = 'request',
  resetKey,
  wrapLabel = 'Wrap lines',
}: {
  children: ReactNode;
  codeRole?: OpenApiCodeRole;
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
      data-openapi-code-role={codeRole}
      data-testid="openapi-code-preview"
      data-wrap-lines={wrap}
      ref={rootRef}
    >
      <button
        aria-label={wrapLabel}
        aria-pressed={wrap}
        className="openapi-code-wrap-toggle"
        onClick={() => setWrap((value) => !value)}
        title={wrapLabel}
        type="button"
      >
        <WrapText aria-hidden="true" className="size-3.5" />
      </button>
      {children}
    </div>
  );
}
