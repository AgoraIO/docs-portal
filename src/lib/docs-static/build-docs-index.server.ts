import { existsSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import type { DocsMeta } from '../docs-meta-schema';
import { type DocsManifestPage, getDocsManifest } from '../docs-manifest.server';
import { type AppLocale, SUPPORTED_LOCALES } from '../i18n/i18n-config';
import type { DocsIndex, DocsIndexNode, DocsIndexPage } from './docs-index-types';

const CONTENT_ROOT = 'content/docs';

export function buildDocsIndex(): DocsIndex {
  const manifest = getDocsManifest();
  const pages = manifest.pages.map(toDocsIndexPage);
  const nodesByKey = new Map<string, DocsIndexNode>();

  for (const locale of SUPPORTED_LOCALES) {
    const localeKey = locale;

    nodesByKey.set(localeKey, {
      children: [],
      key: localeKey,
      locale,
      name: locale,
      type: 'folder',
    });
  }

  for (const page of pages) {
    const folderSegments = page.contentPath.split('/').slice(0, -1);
    let parentKey = page.locale;

    for (let index = 1; index < folderSegments.length; index += 1) {
      const key = folderSegments.slice(0, index + 1).join('/');
      const name = folderSegments[index] ?? key;
      const existing = nodesByKey.get(key);

      if (!existing) {
        nodesByKey.set(key, {
          children: [],
          key,
          locale: page.locale,
          meta: readDocsMeta(key),
          name,
          parentKey,
          routePath: buildFolderRoutePath(page, index),
          type: 'folder',
        });
      }

      const parent = nodesByKey.get(parentKey);
      if (parent && !parent.children.includes(key)) {
        parent.children.push(key);
      }

      parentKey = key;
    }

    const pageKey = page.contentPath.replace(/\.(md|mdx)$/, '');
    nodesByKey.set(pageKey, {
      children: [],
      key: pageKey,
      locale: page.locale,
      name: page.slugSegments.at(-1) ?? page.tab,
      page,
      parentKey,
      routePath: page.routePath,
      type: 'page',
    });

    const parent = nodesByKey.get(parentKey);
    if (parent && !parent.children.includes(pageKey)) {
      parent.children.push(pageKey);
    }
  }

  const pagesByLocale = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, [] as DocsIndexPage[]]),
  ) as Record<AppLocale, DocsIndexPage[]>;

  for (const page of pages) {
    pagesByLocale[page.locale].push(page);
  }

  for (const locale of SUPPORTED_LOCALES) {
    pagesByLocale[locale].sort((left, right) =>
      left.routePath.localeCompare(right.routePath),
    );
  }

  return {
    nodesByKey,
    pages,
    pagesByLocale,
    pagesByRoutePath: new Map(pages.map((page) => [page.routePath, page])),
  };
}

function toDocsIndexPage(page: DocsManifestPage): DocsIndexPage {
  return {
    contentPath: page.contentPath,
    description: page.description,
    locale: page.locale,
    markdownUrl: page.markdownUrl,
    routePath: page.routePath,
    slugSegments: [...page.slugSegments],
    sourceSlugs: [...page.sourceSlugs],
    tab: page.tab,
    title: page.title,
  };
}

function buildFolderRoutePath(page: DocsIndexPage, folderDepth: number) {
  if (folderDepth === 1) {
    return `/${page.locale}/${page.tab}`;
  }

  const slugSegments = page.contentPath
    .split('/')
    .slice(2, folderDepth + 1)
    .filter(Boolean);

  return `/${page.locale}/${page.tab}/${slugSegments.join('/')}`;
}

function readDocsMeta(key: string) {
  const metaPath = join(CONTENT_ROOT, ...key.split('/'), 'meta.json');
  if (!existsSync(metaPath)) {
    return undefined;
  }

  return parseDocsMetaJson(readFileSync(metaPath, 'utf8'));
}

export function parseDocsMetaJson(sourceText: string): DocsMeta {
  const parsed = JSON.parse(sourceText) as Record<string, unknown>;
  const meta: DocsMeta = {};

  if (parsed.title !== undefined) {
    if (typeof parsed.title !== 'string') {
      throw new Error('meta.json title must be a string');
    }
    meta.title = parsed.title;
  }

  if (parsed.icon !== undefined) {
    if (typeof parsed.icon !== 'string') {
      throw new Error('meta.json icon must be a string');
    }
    meta.icon = parsed.icon;
  }

  if (parsed.root !== undefined) {
    if (typeof parsed.root !== 'boolean') {
      throw new Error('meta.json root must be a boolean');
    }
    meta.root = parsed.root;
  }

  if (parsed.pages !== undefined) {
    if (!Array.isArray(parsed.pages) || parsed.pages.some((value) => typeof value !== 'string')) {
      throw new Error('meta.json pages must be an array of strings');
    }
    meta.pages = [...parsed.pages];
  }

  if (parsed.navScope !== undefined) {
    meta.navScope = parseDocsNavScope(parsed.navScope);
  }

  return meta;
}

function parseDocsNavScope(value: unknown): NonNullable<DocsMeta['navScope']> {
  if (!isPlainObject(value)) {
    throw new Error('meta.json navScope must be an object');
  }

  const navScope: NonNullable<DocsMeta['navScope']> = {};

  if (value.defaultVersion !== undefined) {
    if (typeof value.defaultVersion !== 'string' || value.defaultVersion.length === 0) {
      throw new Error('meta.json navScope.defaultVersion must be a non-empty string');
    }
    navScope.defaultVersion = value.defaultVersion;
  }

  if (value.platformTabs !== undefined) {
    if (typeof value.platformTabs !== 'boolean') {
      throw new Error('meta.json navScope.platformTabs must be a boolean');
    }
    navScope.platformTabs = value.platformTabs;
  }

  if (value.presentation !== undefined) {
    if (value.presentation !== 'dropdown' && value.presentation !== 'tabs') {
      throw new Error('meta.json navScope.presentation must be "dropdown" or "tabs"');
    }
    navScope.presentation = value.presentation;
  }

  if (value.sharedSidebar !== undefined) {
    if (typeof value.sharedSidebar !== 'boolean') {
      throw new Error('meta.json navScope.sharedSidebar must be a boolean');
    }
    navScope.sharedSidebar = value.sharedSidebar;
  }

  if (value.versions !== undefined) {
    if (!Array.isArray(value.versions) || value.versions.length === 0) {
      throw new Error('meta.json navScope.versions must be a non-empty array');
    }

    navScope.versions = value.versions.map((entry) => {
      if (!isPlainObject(entry)) {
        throw new Error('meta.json navScope.versions entries must be objects');
      }

      if (
        typeof entry.id !== 'string' ||
        entry.id.length === 0 ||
        typeof entry.label !== 'string' ||
        entry.label.length === 0 ||
        typeof entry.path !== 'string' ||
        entry.path.length === 0
      ) {
        throw new Error(
          'meta.json navScope.versions entries require non-empty id, label, and path',
        );
      }

      return {
        id: entry.id,
        label: entry.label,
        path: entry.path,
      };
    });
  }

  return navScope;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
