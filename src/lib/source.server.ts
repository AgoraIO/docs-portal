import { docs } from 'collections/server';
import { type InferPageType, loader, multiple } from 'fumadocs-core/source';
import { buildDocPath, parseSourceSlugs } from './docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/i18n-config';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './openapi/fumadocs-source.server';
import {
  filterPlatformGroupPanelNodes,
  getCanonicalSourcePages,
  getPlatformGroupPanelUrls,
  isPlatformGroupPanelPage,
  resolvePlatformGroupDefinition,
} from './platforms/platform-group-pages';
import { getPlatformLabel, type PlatformKey } from './platforms/registry';
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

export const canonicalSource = Object.assign(Object.create(source), {
  getLanguages() {
    return source.getLanguages().map((language) => ({
      ...language,
      pages: getCanonicalSourcePages(language.pages),
    }));
  },
  getPage(
    slugs: Parameters<typeof source.getPage>[0],
    language?: Parameters<typeof source.getPage>[1],
  ) {
    const page = source.getPage(slugs, language);

    if (!page) {
      return page;
    }

    return isPlatformGroupPanelPage(page, source.getPages(language))
      ? undefined
      : page;
  },
  getPages(language?: string) {
    return getCanonicalSourcePages(source.getPages(language));
  },
  getPageTree(language?: string) {
    const pages = source.getPages(language);

    return filterPlatformGroupPanelNodes(
      source.getPageTree(language),
      getPlatformGroupPanelUrls(pages),
    );
  },
}) as typeof source;

export function getPageMarkdownUrl(
  page: InferPageType<typeof source>,
  platform?: PlatformKey,
) {
  const pageSegments = page.path
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      if (index !== array.length - 1) {
        return segment;
      }

      return segment.replace(/\.mdx$/, '.md');
    });

  const segments = platform
    ? getPlatformMarkdownSegments(pageSegments, platform)
    : pageSegments;

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

function getPlatformMarkdownSegments(
  segments: string[],
  platform: PlatformKey,
) {
  const leaf = segments.at(-1) ?? 'index.md';

  if (leaf === 'index.md') {
    return [...segments.slice(0, -1), `${platform}.md`];
  }

  return [
    ...segments.slice(0, -1),
    leaf.replace(/\.md$/, ''),
    `${platform}.md`,
  ];
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const platformGroupText = await getPlatformGroupLLMText(page);

  if (platformGroupText) {
    return platformGroupText;
  }

  const processed =
    'getText' in page.data && typeof page.data.getText === 'function'
      ? await page.data.getText('processed')
      : '';

  return `# ${page.data.title} (${page.url})

${processed}`;
}

async function getPlatformGroupLLMText(page: InferPageType<typeof source>) {
  const locale = page.path.split('/').filter(Boolean)[0] ?? DEFAULT_LOCALE;
  const pages = source.getPages(locale);
  const platformGroup = resolvePlatformGroupDefinition(page, pages);

  if (!platformGroup) {
    return null;
  }

  const parentText =
    'getText' in page.data && typeof page.data.getText === 'function'
      ? await page.data.getText('processed')
      : '';
  const panelTexts = await Promise.all(
    platformGroup.panels.map(async (panel) => {
      const panelPage = pages.find((item) => item.path === panel.contentPath);
      const panelText =
        panelPage &&
        'getText' in panelPage.data &&
        typeof panelPage.data.getText === 'function'
          ? await panelPage.data.getText('processed')
          : '';
      const label = getPlatformLabel(
        panel.platform,
        locale === 'zh-CN' ? 'zh-CN' : DEFAULT_LOCALE,
      );

      return `## ${label}

${panelText}`;
    }),
  );

  return `# ${page.data.title} (${page.url})

${[parentText, ...panelTexts].filter((text) => text.trim()).join('\n\n')}`;
}
