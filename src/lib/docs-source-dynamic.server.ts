import { server } from 'fumadocs-mdx/runtime/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import type * as Config from '../../source.config';
import { buildDocPath, parseSourceSlugs } from './docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/i18n-config';

const create = server<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: Record<string, never>;
  }
>({ doc: { passthroughs: ['extractedReferences'] } });

const realtimeMediaDocs = await create.docsLazy(
  'docs' as never,
  'content/docs',
  import.meta.glob(['../../content/docs/*/realtime-media/**/*.{json,yaml}'], {
    base: './../../content/docs',
    eager: true,
    import: 'default',
    query: {
      collection: 'docs',
    },
  }),
  import.meta.glob(['../../content/docs/*/realtime-media/**/*.{mdx,md}'], {
    base: './../../content/docs',
    eager: true,
    import: 'frontmatter',
    query: {
      collection: 'docs',
      only: 'frontmatter',
    },
  }),
  import.meta.glob(['../../content/docs/*/realtime-media/**/*.{mdx,md}'], {
    base: './../../content/docs',
    eager: false,
    query: {
      collection: 'docs',
    },
  }),
);

export const docsDynamicSource = loader({
  source: realtimeMediaDocs.toFumadocsSource(),
  baseUrl: '/docs',
  i18n: {
    defaultLanguage: DEFAULT_LOCALE,
    hideLocale: 'never',
    languages: [...SUPPORTED_LOCALES],
    parser: 'dir',
  },
  url: (slugs, locale) => {
    const route = parseSourceSlugs(slugs);
    return buildDocPath(
      locale ?? DEFAULT_LOCALE,
      route.tab,
      route.slugSegments,
    );
  },
});

export type DynamicDocsPage = InferPageType<typeof docsDynamicSource>;
