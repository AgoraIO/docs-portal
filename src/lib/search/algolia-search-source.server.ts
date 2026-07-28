import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { source as createSource, loader, multiple } from 'fumadocs-core/source';
import yaml from 'js-yaml';
import { docsMetaSchema } from '../docs-meta-schema';
import { buildDocPath, parseSourceSlugs } from '../docs-routing';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/i18n-config';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from '../openapi/fumadocs-source.server';
import {
  filterPlatformGroupPanelNodes,
  getPlatformGroupPanelUrls,
} from '../platforms/platform-group-pages';
import { docsRoute } from '../shared';
import { buildDocsSearchNavigation } from './docs-search-navigation';

type StaticDocsPageData = {
  _openapi?: Record<string, unknown>;
  defaultPlatform?: string;
  description?: string;
  layout?: 'platform-group';
  platforms?: string[];
  title?: string;
};

export async function getAlgoliaSearchNavigation() {
  const source = await createAlgoliaSearchSource();

  return new Map(
    SUPPORTED_LOCALES.map((locale) => {
      const pages = source.getPages(locale);
      const pageTree = filterPlatformGroupPanelNodes(
        source.getPageTree(locale),
        getPlatformGroupPanelUrls(pages),
      );

      return [locale, buildDocsSearchNavigation(pageTree)] as const;
    }),
  );
}

async function createAlgoliaSearchSource() {
  const docsSource = await createStaticDocsSource();
  const openApiSource = await createLocalizedOpenApiSource();

  return loader({
    source: multiple({ docs: docsSource, openapi: openApiSource }),
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
}

async function createStaticDocsSource() {
  const docsRoot = path.join(process.cwd(), 'content/docs');
  const files = await scanContentFiles(docsRoot);
  const pages = await Promise.all(
    files.pages.map(async (filePath) => ({
      type: 'page' as const,
      path: path.relative(docsRoot, filePath),
      data: parseFrontmatter(await readFile(filePath, 'utf8')),
    })),
  );
  const metas = await Promise.all(
    files.metas.map(async (filePath) => ({
      type: 'meta' as const,
      path: path.relative(docsRoot, filePath),
      data: docsMetaSchema.parse(yaml.load(await readFile(filePath, 'utf8'))),
    })),
  );

  return createSource({ pages, metas });
}

async function scanContentFiles(dir: string): Promise<{
  metas: string[];
  pages: string[];
}> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return scanContentFiles(entryPath);
      }

      if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        return { metas: [], pages: [entryPath] };
      }

      if (entry.isFile() && /^meta\.(json|yaml)$/.test(entry.name)) {
        return { metas: [entryPath], pages: [] };
      }

      return { metas: [], pages: [] };
    }),
  );

  return {
    metas: nested.flatMap((item) => item.metas),
    pages: nested.flatMap((item) => item.pages),
  };
}

function parseFrontmatter(raw: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);

  return match ? ((yaml.load(match[1]) ?? {}) as StaticDocsPageData) : {};
}
