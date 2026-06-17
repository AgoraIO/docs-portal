import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';
import { useApiReferenceContent } from '@/lib/source.api-reference.browser';

export function DocsApiReferenceContentBody({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useApiReferenceContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), {
      contentPath,
      staticRender: true,
    }),
  });

  return <div className="docs-body">{content}</div>;
}
