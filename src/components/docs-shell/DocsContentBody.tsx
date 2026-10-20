import { useRef } from 'react';
import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
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

  const root = useRef<HTMLDivElement>(null);
  useMeasuredDocsBody(root);
  return (
    <div className="docs-body" ref={root}>
      <MDXAccordionProvider key={contentPath}>{content}</MDXAccordionProvider>
    </div>
  );
}
