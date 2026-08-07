import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { useDocsContent } from '@/lib/source.browser';

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

  return (
    <div className="docs-body">
      <MDXAccordionProvider>{content}</MDXAccordionProvider>
    </div>
  );
}
