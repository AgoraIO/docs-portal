'use client';

import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';
import { useDocsContent } from '@/lib/source.browser';

export function DocsAiContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), { contentPath }),
  });

  return <div className="docs-body">{content}</div>;
}
