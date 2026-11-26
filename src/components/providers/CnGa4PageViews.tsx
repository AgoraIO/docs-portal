import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { captureCnGa4PageView } from '@/lib/analytics/cn-ga4';

export function CnGa4PageViews() {
  // A history change can precede an async loader and the new document title.
  const pathname = useRouterState({
    select: (state) => state.resolvedLocation?.publicHref.split(/[?#]/, 1)[0],
  });
  useEffect(() => {
    if (pathname) void captureCnGa4PageView(pathname);
  }, [pathname]);
  return null;
}
