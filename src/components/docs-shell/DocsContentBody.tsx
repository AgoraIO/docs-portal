import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { useDocsContent } from '@/lib/source.browser';

export function DocsContentBody({ contentPath }: { contentPath: string }) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), { contentPath }),
  });

  return (
    <div className="docs-body">
      <MDXAccordionProvider>{content}</MDXAccordionProvider>
    </div>
  );
}
