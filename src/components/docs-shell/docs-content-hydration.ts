import { isAiContentPath } from '@/lib/docs-source-buckets';

export function shouldHydrateDocsMdxContent(contentPath: string) {
  return false;
}

export function shouldUseStaticDocsHtmlBody(contentPath: string) {
  return !shouldHydrateDocsMdxContent(contentPath) || isAiContentPath(contentPath);
}

export function shouldPreloadDocsMdxContent(contentPath: string) {
  return shouldHydrateDocsMdxContent(contentPath);
}
