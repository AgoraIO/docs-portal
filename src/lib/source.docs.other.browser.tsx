import { browser } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';
import type * as Config from '../../source.config';

const create = browser<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: Record<string, never>;
  }
>();

const docsCollection = create.doc(
  'docs' as never,
  import.meta.glob(
    [
      '../../content/docs/*/best-practices/**/*.{mdx,md}',
      '../../content/docs/*/introduction/**/*.{mdx,md}',
      '../../content/docs/*/overview/**/*.{mdx,md}',
      '../../content/docs/*/realtime-media/**/*.{mdx,md}',
      '../../content/docs/*/solutions/**/*.{mdx,md}',
    ],
    {
      base: './../../content/docs',
      eager: false,
      query: {
        collection: 'docs',
      },
    },
  ),
);

const docsClientLoader = (
  docsCollection as {
    createClientLoader: (options: {
      id: string;
      component: (
        doc: { default: React.ComponentType<{ components?: MDXComponents }> },
        props?: { components?: MDXComponents },
      ) => React.ReactNode;
    }) => {
      preload: (path: string) => Promise<unknown>;
      useContent: (
        path: string,
        props?: { components?: MDXComponents },
      ) => React.ReactNode;
    };
  }
).createClientLoader({
  id: 'docs-other-content',
  component: (doc, props?: { components?: MDXComponents }) => {
    const Content = doc.default;
    return <Content components={props?.components} />;
  },
});

export function preloadOtherDocsContent(path: string) {
  return docsClientLoader.preload(path);
}

export function useOtherDocsContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  return docsClientLoader.useContent(path, props);
}
