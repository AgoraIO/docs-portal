import { isAiContentPath } from '@/lib/docs-source-buckets';
import { HYDRATED_DOCS_CONTENT_SUFFIXES } from './hydrated-docs-content-suffixes.mjs';

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
