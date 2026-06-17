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

const rtcAndroidApiReferenceCollection = create.doc(
  'docs' as never,
  import.meta.glob(
    [
      '../../content/docs/*/api-reference/rtc/android/**/*.{mdx,md}',
      '!../../content/docs/*/api-reference/rtc/android/(current)/**/*.{mdx,md}',
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

const rtcAndroidApiReferenceClientLoader = (
  rtcAndroidApiReferenceCollection as {
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
  id: 'api-reference-rtc-android-content',
  component: (doc, props?: { components?: MDXComponents }) => {
    const Content = doc.default;
    return <Content components={props?.components} />;
  },
});

export function preloadRtcAndroidApiReferenceContent(path: string) {
  return rtcAndroidApiReferenceClientLoader.preload(
    resolveDocsBrowserContentPath(path),
  );
}

export function useRtcAndroidApiReferenceContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  return rtcAndroidApiReferenceClientLoader.useContent(
    resolveDocsBrowserContentPath(path),
    props,
  );
}
