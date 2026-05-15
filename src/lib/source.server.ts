import { docs } from 'collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import {
  buildDocPath,
  getContentPathSegments,
  parseSourceSlugs,
} from './docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/i18n-config';
import { docsContentRoute, docsRoute } from './shared';

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  i18n: {
    defaultLanguage: DEFAULT_LOCALE,
    hideLocale: 'never',
    languages: [...SUPPORTED_LOCALES],
    parser: 'dir',
  },
  url: (slugs, locale) => {
    const route = parseSourceSlugs(slugs);
    return buildDocPath(locale ?? DEFAULT_LOCALE, route.tab, route.slug);
  },
  plugins: [lucideIconsPlugin()],
});

export type PageWithSource = InferPageType<typeof source>;

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const locale = page.locale ?? 'en';
  const [tab, slug] = page.slugs;
  const segments = getContentPathSegments({
    locale,
    tab: tab ?? 'introduction',
    slug,
  });

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
