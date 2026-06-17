import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocsIndex } from './docs-index.server';

type DocsIndexPageSource = {
  contentPath: string;
  routePath: string;
  sourceText: string;
  title: string;
};

export function getDocsIndexPageSource(
  locale: string,
  sourceSlugs: string[],
): DocsIndexPageSource | null {
  const page = getDocsIndex().pages.find(
    (entry) =>
      entry.locale === locale &&
      entry.sourceSlugs.length === sourceSlugs.length &&
      entry.sourceSlugs.every((segment, index) => segment === sourceSlugs[index]),
  );

  if (!page) {
    return null;
  }

  return loadDocsIndexPageSource(page.contentPath, page.routePath, page.title);
}

export function getDocsIndexPageSourceByRoutePath(routePath: string) {
  const page = getDocsIndex().pagesByRoutePath.get(routePath);

  if (!page) {
    return null;
  }

  return loadDocsIndexPageSource(page.contentPath, page.routePath, page.title);
}

export function getDocsIndexPageSourceByContentPath(contentPath: string) {
  const normalizedPath = contentPath.replace(/\.md$/, '.mdx');
  const page = getDocsIndex().pages.find(
    (entry) => entry.contentPath === normalizedPath || entry.contentPath === contentPath,
  );

  if (!page) {
    return null;
  }

  return loadDocsIndexPageSource(page.contentPath, page.routePath, page.title);
}

export function getDocsIndexPageTocFromSource(sourceText: string) {
  return sourceText
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^(#{2,6})\s+(.+?)\s*$/);
      if (!match) {
        return [];
      }

      const [, hashes, rawTitle] = match;
      const title = rawTitle
        .replace(/<[^>]+>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();

      if (!title) {
        return [];
      }

      return [
        {
          depth: hashes.length,
          title,
          url: `#${slugifyHeading(title)}`,
        },
      ];
    });
}

function loadDocsIndexPageSource(
  contentPath: string,
  routePath: string,
  title: string,
): DocsIndexPageSource | null {
  const filePath = join('content/docs', contentPath);
  if (!existsSync(filePath)) {
    return null;
  }

  return {
    contentPath,
    routePath,
    sourceText: readFileSync(filePath, 'utf8'),
    title,
  };
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[`'"“”‘’]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
