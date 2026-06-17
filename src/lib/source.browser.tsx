import type { MDXComponents } from 'mdx/types';
import { isApiReferenceContentPath } from './docs-source-buckets';
import {
  preloadApiReferenceContent,
  useApiReferenceContent,
} from './source.api-reference.browser';
import {
  preloadDocsSectionContent,
  useDocsSectionContent,
} from './source.docs.browser';

export function preloadDocsContent(path: string) {
  if (isApiReferenceContentPath(path)) {
    return preloadApiReferenceContent(path);
  }

  return preloadDocsSectionContent(path);
}

export function useDocsContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  if (isApiReferenceContentPath(path)) {
    return useApiReferenceContent(path, props);
  }

  return useDocsSectionContent(path, props);
}
