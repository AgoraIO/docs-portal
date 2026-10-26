import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { assertKbPath, requireText } from '../../src/lib/ai-kb/corpus';
import type { SearchEntry } from '../../src/lib/docs-search';
import {
  isKnownPlatform,
  type PlatformKey,
} from '../../src/lib/platforms/registry';
import type { PublishedDocsRoute } from '../../src/lib/published-docs-routes';
import { exportPublishedCnRecords } from '../../src/lib/search/cn-records.server';
import { isPublicCnSearchUrl } from '../../src/lib/search/cn-search-page';
import { toCnContentSearchUrl } from '../../src/lib/search/cn-search-urls.mjs';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid artifact object');
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Invalid artifact array');
  return value;
}
function platform(value: unknown): PlatformKey | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !isKnownPlatform(value))
    throw new Error('Invalid published platform');
  return value;
}

export async function readPublishedKbInputs(
  root: string,
  options: { selectedSourceIds?: string[] } = {},
) {
  const selected = options.selectedSourceIds
    ? new Set(options.selectedSourceIds)
    : undefined;
  const publicRoot = await realpath(path.resolve(root));
  const cache = new Map<string, Promise<string>>();
  const read = (relative: string): Promise<string> => {
    if (
      path.isAbsolute(relative) ||
      relative.split(/[\\/]/).some((p) => p === '..' || p === '.') ||
      relative.includes('\0')
    )
      throw new Error('Invalid artifact path');
    let result = cache.get(relative);
    if (!result) {
      result = (async () => {
        const file = await realpath(path.resolve(publicRoot, relative));
        if (!file.startsWith(publicRoot + path.sep))
          throw new Error('Artifact path escapes outside public root');
        return readFile(file, 'utf8');
      })();
      cache.set(relative, result);
    }
    return result;
  };
  const [routeJson, pageJson, sitemapText] = await Promise.all([
    read('__static/docs-routes.json'),
    read('__static/docs-search/zh-CN.json'),
    read('sitemap.xml'),
  ]);
  const sitemap = load(sitemapText, { xmlMode: true });
  if (!sitemap('urlset').length)
    throw new Error('Expected complete sitemap urlset');
  const published = new Set(
    sitemap('loc')
      .toArray()
      .map((el) => new URL(sitemap(el).text()).pathname),
  );
  if (!published.size) throw new Error('Empty published sitemap');
  const routes: PublishedDocsRoute[] = [];
  const seen = new Set<string>();
  for (const raw of list(JSON.parse(routeJson))) {
    const r = object(raw);
    const url = requireText(r.url, 'route URL');
    if (seen.has(url)) throw new Error('Duplicate route');
    seen.add(url);
    if (!published.has(url) || !isPublicCnSearchUrl(url)) continue;
    assertKbPath(url);
    assertKbPath(r.canonicalPath);
    if (r.markdownPath !== `${url}.md`)
      throw new Error('Invalid published Markdown path');
    routes.push({
      url,
      canonicalPath: r.canonicalPath,
      markdownPath: r.markdownPath,
      platform: platform(r.platform),
      defaultPlatform: platform(r.defaultPlatform),
      ...(r.version !== undefined
        ? { version: requireText(r.version, 'version') }
        : {}),
    });
  }
  const pageIds = new Set<string>();
  const pages: SearchEntry[] = list(JSON.parse(pageJson)).map((raw) => {
    const p = object(raw);
    const url = requireText(p.url, 'page URL');
    if (pageIds.has(url)) throw new Error('Duplicate search page');
    pageIds.add(url);
    if (
      p.objectType !== undefined &&
      p.objectType !== 'docs' &&
      p.objectType !== 'openapi'
    )
      throw new Error('Invalid page type');
    return {
      url,
      title: requireText(p.title, 'page title'),
      ...(p.objectType
        ? { objectType: p.objectType as 'docs' | 'openapi' }
        : {}),
    };
  });
  const allowed = new Set(routes.map((r) => r.markdownPath));
  const readMarkdown = (markdownPath: string) => {
    if (!allowed.has(markdownPath))
      throw new Error('Unregistered Markdown path');
    return read(markdownPath.slice(1));
  };
  const searchSections = await exportPublishedCnRecords({
    routes,
    pages,
    readMarkdown,
    readRenderedHtml: (url) => read(`${url.slice(1)}/index.html`),
  });
  // Search results expose locale-free URLs; build manifests and existing KB
  // identities retain the locale. Convert only at this boundary so a site URL
  // migration does not turn every KB document into a deletion and insertion.
  const sections = searchSections.map((section) => ({
    ...section,
    url: toCnContentSearchUrl(section.url),
    canonicalUrl: section.canonicalUrl
      ? toCnContentSearchUrl(section.canonicalUrl)
      : undefined,
  }));
  const represented = new Set(
    sections.map((section) => section.url.split('#')[0]),
  );
  const routesByUrl = new Map(routes.map((route) => [route.url, route]));
  const variantCanonicals = new Set(
    routes
      .filter((route) => route.platform)
      .map((route) => route.canonicalPath),
  );
  // The navigation manifest qualifies documents; the sitemap additionally
  // inventories their rendered platform URLs, including missing route entries.
  const qualified = new Set<string>();
  for (const url of published) {
    const slash = url.lastIndexOf('/');
    const canonical = url.slice(0, slash);
    const suffix = url.slice(slash + 1);
    if (
      isPublicCnSearchUrl(url) &&
      (pageIds.has(url) || (pageIds.has(canonical) && isKnownPlatform(suffix)))
    )
      qualified.add(url);
  }
  for (const url of qualified) {
    if (!routesByUrl.has(url))
      throw new Error(`Incomplete KB export: no published route for ${url}`);
  }
  const pagesByUrl = new Map(pages.map((page) => [page.url, page]));
  for (const route of routes) {
    // A sample is complete within its explicit selection. Full exports still
    // require every qualified page; publication and anchor checks above remain.
    if (selected && !selected.has(route.url)) continue;
    const page = pagesByUrl.get(route.canonicalPath);
    if (!page) continue;
    if (
      !route.platform &&
      page.objectType !== 'openapi' &&
      variantCanonicals.has(route.canonicalPath)
    )
      continue;
    if (!represented.has(route.url))
      throw new Error(
        `Incomplete KB export: no validated content for ${route.url}`,
      );
  }
  return { routes, sections, readMarkdown };
}
