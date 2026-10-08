import { load } from 'cheerio';
import GithubSlugger from 'github-slugger';
import type { Root, RootContent } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type { SearchEntry } from '../docs-search';
import { isKnownPlatform } from '../platforms/registry';
import type { PublishedDocsRoute } from '../published-docs-routes';
import { isPublicCnSearchUrl } from './cn-search-page';
import { assertValidSearchSection, type SearchSection } from './kb-record';

function text(node: Root | RootContent): string {
  if ('value' in node) {
    return node.type === 'html' ? load(node.value).text() : node.value;
  }
  return 'children' in node
    ? node.children
        .map((child) => text(child))
        .join(node.type === 'paragraph' || node.type === 'heading' ? '' : '\n')
    : '';
}

export function extractPublishedCnSections(
  route: PublishedDocsRoute,
  page: SearchEntry,
  markdown: string,
): SearchSection[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const [, tab, firstProduct, secondProduct] = route.canonicalPath
    .split('/')
    .filter(Boolean);
  const product =
    tab === 'api-reference' && firstProduct === 'api-ref'
      ? secondProduct
      : tab === 'ai'
        ? 'conversational-ai'
        : ['realtime-media', 'api-reference'].includes(tab)
          ? firstProduct
          : tab;
  const platform =
    route.platform ?? route.canonicalPath.split('/').find(isKnownPlatform);
  const version = route.canonicalPath
    .split('/')
    .find((segment) => /^v?\d+\.\d+(?:\.\d+)?$/.test(segment));
  const metadata = {
    pageTitle: page.title,
    locale: 'zh-CN',
    tab,
    product,
    version,
    platform: platform ? [platform] : undefined,
    docType: page.objectType ?? 'docs',
    audience: ['developer', 'customer-support'],
    status: 'published',
    hidden: false,
  } as const;
  if (metadata.docType === 'openapi') {
    // OpenAPI Markdown headings differ from the interactive renderer's anchors.
    // Index the endpoint page so every result resolves to a real target.
    const content = tree.children
      .filter((node, index) => !(index === 0 && node.type === 'heading'))
      .map(text)
      .filter((value) => !value.startsWith('For AI agents:'))
      .join('\n')
      .trim();
    const record: SearchSection = {
      ...metadata,
      audience: [...metadata.audience],
      id: `${route.url}::page`,
      url: route.url,
      sectionTitle: page.title,
      content,
      headingPath: [page.title],
    };
    assertValidSearchSection(record);
    return [record];
  }
  const records: SearchSection[] = [];
  const hierarchy: { level: number; title: string }[] = [];
  let current = {
    title: page.title,
    anchor: '',
    path: [page.title],
    parts: [] as string[],
  };
  const flush = () => {
    const content = current.parts.join('\n').trim();
    if (!content) return;
    const record: SearchSection = {
      ...metadata,
      audience: [...metadata.audience],
      id: `${route.url}::${current.anchor ? `heading:${current.anchor}` : 'page'}`,
      url: `${route.url}${current.anchor ? `#${current.anchor}` : ''}`,
      sectionTitle: current.title,
      content,
      headingPath: current.path,
    };
    assertValidSearchSection(record);
    records.push(record);
  };
  for (const [index, node] of tree.children.entries()) {
    if (node.type !== 'heading') {
      const content = text(node);
      if (!content.startsWith('For AI agents:')) current.parts.push(content);
      continue;
    }
    // The generated Markdown starts with a synthetic page title, without a page anchor.
    if (index === 0 && node.depth === 1) continue;
    const headingText = text(node).trim();
    // Fumadocs processed Markdown carries the renderer's actual heading ID.
    const headingWithId = headingText.match(/^(.*?)\s*\[#(.+)\]$/);
    const title = headingWithId?.[1] ?? headingText;
    if (!title) continue;
    flush();
    const automaticAnchor = slugger.slug(title);
    const prefix = markdown.slice(
      Math.max(0, (node.position?.start.offset ?? 0) - 300),
      node.position?.start.offset,
    );
    const explicitAnchor = prefix.match(
      /<a\s+id=["']([^"']+)["'][^>]*>\s*<\/a>\s*$/,
    )?.[1];
    while (
      hierarchy.length &&
      hierarchy[hierarchy.length - 1].level >= node.depth
    )
      hierarchy.pop();
    current = {
      title,
      anchor: explicitAnchor ?? headingWithId?.[2] ?? automaticAnchor,
      path: [page.title, ...hierarchy.map((item) => item.title), title],
      parts: [title],
    };
    hierarchy.push({ level: node.depth, title });
  }
  flush();
  const unique = new Map<string, SearchSection>();
  for (const record of records) {
    const existing = unique.get(record.id);
    if (!existing) {
      unique.set(record.id, record);
      continue;
    }
    const content = `${existing.content}\n${record.content}`;
    // Some migrated pages attach a parent heading and child to the same ID.
    unique.set(record.id, {
      ...(record.headingPath.length > existing.headingPath.length
        ? record
        : existing),
      content,
    });
  }
  return [...unique.values()];
}

export async function exportPublishedCnRecords({
  routes,
  pages,
  readMarkdown,
}: {
  routes: PublishedDocsRoute[];
  pages: SearchEntry[];
  readMarkdown: (markdownPath: string) => Promise<string>;
}): Promise<SearchSection[]> {
  // The same navigation allowlist used by the site excludes hidden/redirect-only docs.
  const pagesByUrl = new Map(
    pages
      .filter((page) => isPublicCnSearchUrl(page.url))
      .map((page) => [page.url, page]),
  );
  const records: SearchSection[] = [];
  const variantPages = new Set(
    routes
      .filter((route) => route.platform)
      .map((route) => route.canonicalPath),
  );
  for (const route of [...routes].sort((a, b) => a.url.localeCompare(b.url))) {
    const page = pagesByUrl.get(route.canonicalPath);
    if (!page || !isPublicCnSearchUrl(route.url)) continue;
    // Search a specific rendered platform instead of canonical Markdown containing
    // every hidden tab. Platform links open the matching content directly.
    if (
      !route.platform &&
      page.objectType !== 'openapi' &&
      variantPages.has(route.canonicalPath)
    )
      continue;
    const markdown = await readMarkdown(route.markdownPath);
    records.push(...extractPublishedCnSections(route, page, markdown));
  }
  if (!records.length)
    throw new Error(
      'No published CN search records; build the CN static artifacts first',
    );
  return records;
}
