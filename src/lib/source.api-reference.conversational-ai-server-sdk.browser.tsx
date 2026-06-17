import { browser } from 'fumadocs-mdx/runtime/browser';
import type { MDXComponents } from 'mdx/types';
import type * as Config from '../../source.config';
import { resolveDocsBrowserContentPath } from './docs-browser-content-path';

const create = browser<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: Record<string, never>;
  }
>();

const conversationalAiServerSdkApiReferenceCollection = create.doc(
  'docs' as never,
  import.meta.glob(
    ['../../content/docs/*/api-reference/conversational-ai/server-sdk/**/*.{mdx,md}'],
    {
      base: './../../content/docs',
      eager: false,
      query: {
        collection: 'docs',
      },
    },
  ),
);

const conversationalAiServerSdkApiReferenceClientLoader = (
  conversationalAiServerSdkApiReferenceCollection as {
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
  id: 'api-reference-conversational-ai-server-sdk-content',
  component: (doc, props?: { components?: MDXComponents }) => {
    const Content = doc.default;
    return <Content components={props?.components} />;
  },
});

export function preloadConversationalAiServerSdkApiReferenceContent(
  path: string,
) {
  return conversationalAiServerSdkApiReferenceClientLoader.preload(
    resolveDocsBrowserContentPath(path),
  );
}

export function useConversationalAiServerSdkApiReferenceContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  return conversationalAiServerSdkApiReferenceClientLoader.useContent(
    resolveDocsBrowserContentPath(path),
    props,
  );
}
