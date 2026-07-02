'use client';

import { type ReactNode, useEffect } from 'react';
import { initializePostHog } from '@/lib/analytics/posthog';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializePostHog();
  }, []);

  return children;
}
