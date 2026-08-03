'use client';

import { type ReactNode, useEffect } from 'react';
import {
  captureDocsCodeCopied,
  captureDocsLinkClicked,
  initializePostHog,
} from '@/lib/analytics/posthog';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializePostHog();
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const locale = window.location.pathname.split('/').filter(Boolean)[0];
      const anchor = target.closest<HTMLAnchorElement>('a[href]');

      if (anchor) {
        captureDocsLinkClicked({
          href: anchor.href,
          locale,
          source: anchor.closest('[data-testid="docs-feedback"]')
            ? 'feedback'
            : anchor.closest('article')
              ? 'article'
              : 'navigation',
        });
      }

      const copyButton = target.closest<HTMLButtonElement>('button');

      if (copyButton?.getAttribute('aria-label') !== 'Copy Text') {
        return;
      }

      const code = copyButton.closest('figure')?.querySelector('code');
      const language = Array.from(code?.classList ?? [])
        .find((className) => className.startsWith('language-'))
        ?.slice('language-'.length);

      captureDocsCodeCopied({
        language,
        locale,
        source: 'code-block',
      });
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return children;
}
