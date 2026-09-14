import { useEffect } from 'react';
import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import { useDocsContent } from '@/lib/source.browser';

export function DocsContentBody({ contentPath }: { contentPath: string }) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), { contentPath }),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reposition after each content-path change even when the hash is unchanged.
  useEffect(() => {
    // The page shell can commit before a lazy platform body exposes its anchor.
    const frame = window.requestAnimationFrame(() => {
      syncDocsHashTargetFromLocation('auto');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentPath]);

  return (
    <div className="docs-body">
      <MDXAccordionProvider>{content}</MDXAccordionProvider>
    </div>
  );
}
