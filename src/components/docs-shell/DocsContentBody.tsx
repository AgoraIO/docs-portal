import { useEffect, useRef } from 'react';
import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import { useDocsContent } from '@/lib/source.browser';
import { useMeasuredDocsBody } from './DocsContentMeasurement';

export function DocsContentBody({
  contentPath,
  locale,
}: {
  contentPath: string;
  locale?: string;
}) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(contentPath), {
      contentPath,
      locale,
    }),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reposition after each content-path change even when the hash is unchanged.
  useEffect(() => {
    // The page shell can commit before a lazy platform body exposes its anchor.
    const frame = window.requestAnimationFrame(() => {
      syncDocsHashTargetFromLocation('auto');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentPath]);

  const root = useRef<HTMLDivElement>(null);
  useMeasuredDocsBody(root);
  return (
    <div className="docs-body" ref={root}>
      <MDXAccordionProvider key={contentPath}>{content}</MDXAccordionProvider>
    </div>
  );
}
