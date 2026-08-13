'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import {
  captureDocsPageViewed,
  initializePostHog,
} from '@/lib/analytics/posthog';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    initializePostHog();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const captureCurrentPage = () => {
      const { pathname } = window.location;

      if (lastPathnameRef.current === pathname) {
        return;
      }

      lastPathnameRef.current = pathname;
      captureDocsPageViewed({ pathname });
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args);
      captureCurrentPage();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      captureCurrentPage();
      return result;
    };

    window.addEventListener('popstate', captureCurrentPage);
    captureCurrentPage();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', captureCurrentPage);
    };
  }, []);

  return children;
}
