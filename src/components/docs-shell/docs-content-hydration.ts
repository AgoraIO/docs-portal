import { isAiContentPath } from '@/lib/docs-source-buckets';

const HYDRATED_DOCS_CONTENT_SUFFIXES = [
  '/build/ai-noise-suppression.mdx',
  '/build/in-call-quality-monitoring.mdx',
  '/client-api/chat-group/manage-group-member-attributes.mdx',
  '/client-api/chat-room/manage-chatroom-members.mdx',
  '/build/play-media.mdx',
  '/build/preload-channels.mdx',
  '/build/receive-notifications.mdx',
  '/build/screen-sharing.mdx',
  '/build/use-an-extension.mdx',
  '/build/voice-activity-detection.mdx',
  '/reference/common-errors.md',
  '/reference/common-errors.mdx',
  '/agora-console/content-moderation-microsoft.md',
  '/agora-console/content-moderation-microsoft.mdx',
] as const;

export function shouldHydrateDocsMdxContent(contentPath: string) {
  return HYDRATED_DOCS_CONTENT_SUFFIXES.some((suffix) =>
    contentPath.endsWith(suffix),
  );
}

export function shouldUseStaticDocsHtmlBody(contentPath: string) {
  return !shouldHydrateDocsMdxContent(contentPath) || isAiContentPath(contentPath);
}

export function shouldPreloadDocsMdxContent(contentPath: string) {
  return shouldHydrateDocsMdxContent(contentPath);
}
