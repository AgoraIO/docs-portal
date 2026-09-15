'use client';

import { useEffect } from 'react';
import { captureDocsSearchLandingEngaged } from '@/lib/analytics/posthog';
import {
  clearPendingSearchLanding,
  consumePendingSearchLanding,
} from '@/lib/analytics/search-attribution';
import { getActiveDocsScrollContainer } from '@/lib/docs-hash';

const MIN_VISIBLE_TIME_MS = 10_000;
const ENGAGEMENT_CHECK_INTERVAL_MS = 250;

export function DocsSearchLandingEngagement({
  locale,
  pathname,
}: {
  locale: string;
  pathname: string;
}) {
  useEffect(() => {
    const pendingLanding = consumePendingSearchLanding(pathname);
    if (!pendingLanding) return;

    let engaged = false;
    let visibleStartedAt = document.hidden ? null : Date.now();
    let visibleTimeMs = 0;
    let maxScrollDepth = 0;

    const updateVisibleTime = () => {
      if (visibleStartedAt === null) return;
      visibleTimeMs += Date.now() - visibleStartedAt;
      visibleStartedAt = Date.now();
    };

    const getScrollDepth = () => {
      const scrollContainer = getActiveDocsScrollContainer();
      if (scrollContainer) {
        return clampScrollDepth(
          scrollContainer.scrollTop /
            Math.max(
              scrollContainer.scrollHeight - scrollContainer.clientHeight,
              1,
            ),
        );
      }

      return clampScrollDepth(
        window.scrollY /
          Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1,
          ),
      );
    };

    const maybeCaptureEngagement = () => {
      updateVisibleTime();
      if (
        engaged ||
        document.hidden ||
        visibleTimeMs < MIN_VISIBLE_TIME_MS ||
        maxScrollDepth <= 0
      ) {
        return;
      }

      engaged = true;
      clearPendingSearchLanding();
      captureDocsSearchLandingEngaged({
        codeCopied: false,
        dwellTimeMs: visibleTimeMs,
        href: pendingLanding.href,
        locale,
        nextPageClicked: false,
        queryAttemptId: pendingLanding.queryAttemptId,
        scrollDepth: maxScrollDepth,
        searchSessionId: pendingLanding.searchSessionId,
      });
    };

    const handleScroll = () => {
      maxScrollDepth = Math.max(maxScrollDepth, getScrollDepth());
      maybeCaptureEngagement();
    };

    const handleVisibilityChange = () => {
      updateVisibleTime();
      visibleStartedAt = document.hidden ? null : Date.now();
      maybeCaptureEngagement();
    };

    const interval = window.setInterval(
      maybeCaptureEngagement,
      ENGAGEMENT_CHECK_INTERVAL_MS,
    );
    const scrollContainer = getActiveDocsScrollContainer();
    scrollContainer?.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      scrollContainer?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [locale, pathname]);

  return null;
}

function clampScrollDepth(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
