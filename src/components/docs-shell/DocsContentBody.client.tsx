'use client';

import { getMDXComponents } from '@/components/mdx';
import { useDocsContent } from '@/lib/source.client';

export function DocsContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  return useDocsContent(contentPath, {
    components: getMDXComponents(),
  });
}
