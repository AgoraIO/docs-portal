import { type InferPageType, loader } from 'fumadocs-core/source';
import { buildDocPath, parseSourceSlugs } from './docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './openapi/fumadocs-source.server';
import { docsRoute } from './shared';

const openApiSource = await createLocalizedOpenApiSource();

export const openApiPageSource = loader({
  source: openApiSource,
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

export type OpenApiPage = InferPageType<typeof openApiPageSource>;
