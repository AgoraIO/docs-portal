'use client';

import { type ReactNode, useEffect } from 'react';
import { applySecuritiConsentBannerParams } from '@/lib/analytics/securiti-consent';

export function SecuritiConsentProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return applySecuritiConsentBannerParams();
  }, []);

  return children;
}
