import type { MDXComponents } from 'mdx/types';
import { isAiContentPath } from './docs-source-buckets';
import {
  preloadAiDocsContent,
  useAiDocsContent,
} from './source.docs.ai.browser';
import {
  preloadOtherDocsContent,
  useOtherDocsContent,
} from './source.docs.other.browser';

export function preloadDocsSectionContent(path: string) {
  if (isAiContentPath(path)) {
    return preloadAiDocsContent(path);
  }

  return preloadOtherDocsContent(path);
}

export function useDocsSectionContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  if (isAiContentPath(path)) {
    return useAiDocsContent(path, props);
  }

  return useOtherDocsContent(path, props);
}
