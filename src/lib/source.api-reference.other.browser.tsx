import { browser } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';
import type * as Config from '../../source.config';

const create = browser<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: Record<string, never>;
  }
>();

const otherApiReferenceCollection = create.doc(
  'docs' as never,
  import.meta.glob(
    [
      '../../content/docs/*/api-reference/**/*.{mdx,md}',
      '!../../content/docs/*/api-reference/conversational-ai/server-sdk/**/*.{mdx,md}',
      '!../../content/docs/*/api-reference/rtc/android/**/*.{mdx,md}',
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

const otherApiReferenceClientLoader = (
  otherApiReferenceCollection as {
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
  id: 'api-reference-content',
  component: (doc, props?: { components?: MDXComponents }) => {
    const Content = doc.default;
    return <Content components={props?.components} />;
  },
});

export function preloadOtherApiReferenceContent(path: string) {
  return otherApiReferenceClientLoader.preload(path);
}

export function useOtherApiReferenceContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  return otherApiReferenceClientLoader.useContent(path, props);
}
