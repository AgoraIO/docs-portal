'use client';

import { getMDXComponents } from '@/components/mdx';
import { renderDocsContent } from '@/lib/source.client';

export function DocsContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  return renderDocsContent(contentPath, {
    components: getMDXComponents(),
  });
}
