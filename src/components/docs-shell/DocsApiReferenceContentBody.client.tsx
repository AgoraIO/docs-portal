'use client';

import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';
import { useApiReferenceContent } from '@/lib/source.api-reference.browser';

export function DocsApiReferenceContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useApiReferenceContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), { contentPath }),
  });

  return <div className="docs-body">{content}</div>;
}
