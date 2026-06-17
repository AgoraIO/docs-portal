import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { AppLocale } from './i18n/i18n-config';
import { SUPPORTED_LOCALES } from './i18n/i18n-config';
import { buildDocPath } from './docs-routing';

const DOCS_ROOT = 'content/docs';
const DOC_FILE_EXTENSION = /\.(md|mdx)$/;
const INDEX_FILE_NAME = /^index\.(md|mdx)$/;
const ROUTE_GROUP_SEGMENT = /^\(.+\)$/;
const FRONTMATTER_DELIMITER = '---';

export type DocsManifestPage = {
  contentPath: string;
  description?: string;
  locale: AppLocale;
  markdownUrl: string;
  routePath: string;
  slugSegments: string[];
  sourceSlugs: string[];
  tab: string;
  title: string;
};

export type DocsManifest = {
  pages: DocsManifestPage[];
  pagesByLocale: Record<AppLocale, DocsManifestPage[]>;
  pagesByRoutePath: Map<string, DocsManifestPage>;
};

let manifestCache: DocsManifest | null = null;

export function getDocsManifest(): DocsManifest {
  if (manifestCache) {
    return manifestCache;
  }

  const pages = existsSync(DOCS_ROOT)
    ? walkDocFiles(DOCS_ROOT).flatMap((filePath) => {
        const page = readDocsManifestPage(DOCS_ROOT, filePath);
        return page ? [page] : [];
      })
    : [];

  const pagesByLocale = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, [] as DocsManifestPage[]]),
  ) as Record<AppLocale, DocsManifestPage[]>;

  for (const page of pages) {
    pagesByLocale[page.locale].push(page);
  }

  for (const locale of SUPPORTED_LOCALES) {
    pagesByLocale[locale].sort((a, b) => a.routePath.localeCompare(b.routePath));
  }

  manifestCache = {
    pages,
    pagesByLocale,
    pagesByRoutePath: new Map(pages.map((page) => [page.routePath, page])),
  };

  return manifestCache;
}

function walkDocFiles(root: string) {
  const files: string[] = [];
  const entries = readdirSync(root).sort();

  for (const entry of entries) {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...walkDocFiles(entryPath));
      continue;
    }

    if (stats.isFile() && DOC_FILE_EXTENSION.test(entry)) {
      files.push(entryPath);
    }
  }

  return files;
}

function readDocsManifestPage(root: string, filePath: string): DocsManifestPage | null {
  const relativePath = relative(root, filePath);
  const segments = relativePath.split(sep).filter(Boolean);
  const locale = segments[0];
  const fileName = segments.at(-1);

  if (!locale || !isSupportedLocale(locale) || !fileName) {
    return null;
  }

  const localizedRouteSegments = segments
    .slice(1, -1)
    .filter((segment) => !ROUTE_GROUP_SEGMENT.test(segment));

  const slugSegments = INDEX_FILE_NAME.test(fileName)
    ? localizedRouteSegments.slice(1)
    : [
        ...localizedRouteSegments.slice(1),
        fileName.replace(DOC_FILE_EXTENSION, ''),
      ];
  const tab = localizedRouteSegments[0];

  if (!tab) {
    return null;
  }

  const frontmatter = parseFrontmatter(readFileSync(filePath, 'utf8'));
  const fallbackTitle =
    slugSegments.at(-1) ?? tab;
  const routePath = buildDocPath(locale, tab, slugSegments);
  const contentPath = `${locale}/${[
    ...localizedRouteSegments,
    fileName,
  ].join('/')}`;

  return {
    contentPath,
    description: frontmatter.description,
    locale,
    markdownUrl: `/content/docs/${contentPath.replace(/\.mdx?$/, '.md')}`,
    routePath,
    slugSegments,
    sourceSlugs: [tab, ...slugSegments],
    tab,
    title: frontmatter.title ?? fallbackTitle,
  };
}

function parseFrontmatter(sourceText: string) {
  const lines = sourceText.split(/\r?\n/);

  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    return {} as { description?: string; title?: string };
  }

  let lineIndex = 1;
  const frontmatterLines: string[] = [];

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line?.trim() === FRONTMATTER_DELIMITER) {
      break;
    }
    frontmatterLines.push(line ?? '');
    lineIndex += 1;
  }

  const frontmatter: { description?: string; title?: string } = {};

  for (const line of frontmatterLines) {
    const match = line.match(/^(title|description):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '');
    if (value.length === 0) {
      continue;
    }

    if (key === 'title' || key === 'description') {
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function isSupportedLocale(locale: string): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}
