import browserCollections from 'collections/browser';
import type { MDXComponents } from 'mdx/types';

const docsClientLoader = browserCollections.docs.createClientLoader({
  id: 'docs-content',
  component: (doc, props?: { components?: MDXComponents }) => {
    const Content = doc.default;
    return <Content components={props?.components} />;
  },
});

export function preloadDocsContent(path: string) {
  return docsClientLoader.preload(path);
}

export function useDocsContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  return docsClientLoader.useContent(path, props);
}
