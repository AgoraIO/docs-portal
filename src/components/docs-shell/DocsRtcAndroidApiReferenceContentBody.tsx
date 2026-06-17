import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';
import { useRtcAndroidApiReferenceContent } from '@/lib/source.api-reference.rtc-android.browser';

export function DocsRtcAndroidApiReferenceContentBody({
  contentPath,
}: {
  contentPath: string;
}) {
  const content = useRtcAndroidApiReferenceContent(contentPath, {
    components: getMDXComponents(getOverviewMDXComponents(), {
      contentPath,
      staticRender: true,
    }),
  });

  return <div className="docs-body">{content}</div>;
}
