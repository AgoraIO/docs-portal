'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import {
  captureDocsCodeCopied,
  captureDocsLinkClicked,
  initializePostHog,
  queueDocsPageView,
} from '@/lib/analytics/posthog';
import { subscribeToLocationChange } from '@/lib/location-change';

const IS_TEST_ENVIRONMENT = import.meta.env.MODE === 'test';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const lastPathnameRef = useRef<string | null>(null);
  const pendingFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (IS_TEST_ENVIRONMENT) {
      return;
    }

    initializePostHog();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const captureCurrentPage = () => {
      pendingFrameRef.current = null;

      const { pathname } = window.location;

      if (lastPathnameRef.current === pathname) {
        return;
      }

      lastPathnameRef.current = pathname;
      queueDocsPageView({ pathname });
    };

    const scheduleCaptureCurrentPage = () => {
      if (pendingFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingFrameRef.current);
      }

      pendingFrameRef.current =
        window.requestAnimationFrame(captureCurrentPage);
    };

    const unsubscribeLocationChange = subscribeToLocationChange(
      scheduleCaptureCurrentPage,
    );
    scheduleCaptureCurrentPage();

    return () => {
      if (pendingFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingFrameRef.current);
      }

      unsubscribeLocationChange();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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
            : anchor.closest('[aria-label="Breadcrumb"]')
              ? 'breadcrumb'
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
