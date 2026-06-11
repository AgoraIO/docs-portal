import { docs } from 'collections/server';
import { type InferPageType, loader, multiple } from 'fumadocs-core/source';
import { buildDocPath, parseSourceSlugs } from './docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './openapi/fumadocs-source.server';
import { docsContentRoute, docsRoute } from './shared';

const openApiSource = await createLocalizedOpenApiSource();

export const source = loader({
  source: multiple({
    docs: docs.toFumadocsSource(),
    openapi: openApiSource,
  }),
  baseUrl: docsRoute,
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
  plugins: [getOpenApiLoaderPlugin()],
});

export type PageWithSource = InferPageType<typeof source>;

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = page.path
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      if (index !== array.length - 1) {
        return segment;
      }

      return segment.replace(/\.mdx$/, '.md');
    });

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed =
    'getText' in page.data && typeof page.data.getText === 'function'
      ? await page.data.getText('processed')
      : '';

  return `# ${page.data.title} (${page.url})

${processed}`;
}
