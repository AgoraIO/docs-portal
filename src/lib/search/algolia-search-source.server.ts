import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { loader, multiple } from 'fumadocs-core/source';
import * as yaml from 'js-yaml';
import { docsMetaSchema } from '../docs-meta-schema';
import { buildDocPath, parseSourceSlugs } from '../docs-routing';
import type { AppLocale } from '../i18n/i18n-config';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from '../openapi/fumadocs-source.server';
import {
  extendPlatformGroupPanelSearchNavigation,
  filterPlatformGroupPanelNodes,
  getPlatformGroupPanelUrls,
} from '../platforms/platform-group-pages';
import { docsRoute } from '../shared';
import { getDefaultDocsLocale } from '../site-region';
import { buildDocsSearchNavigation } from './docs-search-navigation';

type StaticDocsPageData = {
  _openapi?: Record<string, unknown>;
  defaultPlatform?: string;
  description?: string;
  layout?: 'platform-group';
  platforms?: string[];
  title?: string;
};

export async function getAlgoliaSearchNavigation(
  locales: readonly AppLocale[],
) {
  const source = await createAlgoliaSearchSource(locales);

  return new Map(
    locales.map((locale) => {
      const pages = source.getPages(locale);
      const pageTree = filterPlatformGroupPanelNodes(
        source.getPageTree(locale),
        getPlatformGroupPanelUrls(pages),
      );

      return [
        locale,
        extendPlatformGroupPanelSearchNavigation(
          buildDocsSearchNavigation(pageTree),
          pages,
        ),
      ] as const;
    }),
  );
}

async function createAlgoliaSearchSource(locales: readonly AppLocale[]) {
  const defaultLocale = getDefaultDocsLocale('global');
  const docsSource = await createStaticDocsSource(locales);
  const openApiSource = await createLocalizedOpenApiSource(locales);

  return loader({
    source: multiple({ docs: docsSource, openapi: openApiSource }),
    baseUrl: docsRoute,
    i18n: {
      defaultLanguage: defaultLocale,
      hideLocale: 'never',
      languages: [...locales],
      parser: 'dir',
    },
    url: (slugs, locale) => {
      const route = parseSourceSlugs(slugs);
      return buildDocPath(
        locale ?? defaultLocale,
        route.tab,
        route.slugSegments,
      );
    },
    plugins: [getOpenApiLoaderPlugin()],
  });
}

async function createStaticDocsSource(locales: readonly AppLocale[]) {
  const docsRoot = path.join(process.cwd(), 'content/docs');
  const files = await Promise.all(
    locales.map((locale) => scanContentFiles(path.join(docsRoot, locale))),
  );
  const pages = await Promise.all(
    files
      .flatMap((group) => group.pages)
      .map(async (filePath) => ({
        type: 'page' as const,
        path: path.relative(docsRoot, filePath),
        data: parseFrontmatter(await readFile(filePath, 'utf8')),
      })),
  );
  const metas = await Promise.all(
    files
      .flatMap((group) => group.metas)
      .map(async (filePath) => ({
        type: 'meta' as const,
        path: path.relative(docsRoot, filePath),
        data: docsMetaSchema.parse(yaml.load(await readFile(filePath, 'utf8'))),
      })),
  );

  return { files: [...pages, ...metas] };
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
