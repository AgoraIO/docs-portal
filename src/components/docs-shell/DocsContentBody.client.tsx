'use client';

import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';
import { useDocsContent } from '@/lib/source.client';

const overviewContentPaths = new Set([
  'en/introduction/index.mdx',
  'en/introduction/about-agora.mdx',
  'zh-CN/introduction/about-agora.mdx',
  'en/introduction/conversational-ai.mdx',
  'en/introduction/realtime-audio-video.mdx',
  'en/introduction/messaging-presence.mdx',
  'en/introduction/cloud-media-services.mdx',
  'en/solutions/index.mdx',
  'zh-CN/solutions/index.mdx',
]);

export function DocsContentBodyClient({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useDocsContent(contentPath, {
    components: getMDXComponents(
      overviewContentPaths.has(contentPath)
        ? getOverviewMDXComponents()
        : undefined,
      { contentPath },
    ),
  });

  return <div className="docs-body">{content}</div>;
}
