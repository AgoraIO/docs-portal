import { createContext, type RefObject, useContext, useEffect } from 'react';
import { getDocsMeasurement } from '@/lib/analytics/measurement';
import { observeVisible } from '@/lib/analytics/visibility';
import { usePlatformPageContext } from '../mdx/PlatformTabsGroup';

export const DocsMeasurementContext = createContext<{
  contentType: string;
  version?: string;
  platform?: string;
  contentPath?: string;
}>({ contentType: 'mdx' });

/** Render inside the resolved body, after Suspense; skeletons cannot count as reading. */
export function useMeasuredDocsBody(root: RefObject<HTMLDivElement | null>) {
  const context = useContext(DocsMeasurementContext);
  const platform = usePlatformPageContext()?.activePlatform ?? context.platform;
  useEffect(() => {
    if (!context.contentPath || !root.current) return;
    const path = window.location.pathname;
    const measurement = getDocsMeasurement();
    if (!measurement) return;
    let stop = () => {};
    const watch = () => {
      stop();
      if (root.current)
        stop = observeVisible(root.current, () =>
          measurement.viewContent({
            path,
            platform,
            version: context.version,
            contentType: context.contentType,
          }),
        );
    };
    watch();
    const unsubscribe = measurement.subscribe(watch);
    return () => {
      unsubscribe();
      stop();
      measurement.leaveContent();
    };
  }, [
    platform,
    context.version,
    context.contentType,
    context.contentPath,
    root,
  ]);
}
