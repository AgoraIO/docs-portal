import { docs } from 'collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsRoute } from './shared';
import {
  buildDocPath,
  getContentPathSegments,
  parseSourceSlugs,
} from './docs-routing';

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  url: (slugs) => {
    const route = parseSourceSlugs(slugs);
    return buildDocPath(route.locale, route.tab, route.slug);
  },
  plugins: [lucideIconsPlugin()],
});

export type PageWithSource = InferPageType<typeof source>;

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const [locale, tab, slug] = page.slugs;
  const segments = getContentPathSegments({
    locale: locale ?? 'en',
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
