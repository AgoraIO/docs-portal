import { load } from 'cheerio';
import GithubSlugger from 'github-slugger';
import type { Root, RootContent } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { zhCNApiReferenceCards } from '../api-reference-cards-data.zh-cn';
import type { SearchEntry } from '../docs-search';
import { isKnownPlatform, platformRegistry } from '../platforms/registry';
import type { PublishedDocsRoute } from '../published-docs-routes';
import { getCnFaqMetadata } from './cn-faq-metadata';
import { normalizeCnProduct, normalizeCnProductList } from './cn-products';
import { isPublicCnSearchUrl } from './cn-search-page';
import {
  toCnContentSearchUrl,
  toCnPublicSearchUrl,
} from './cn-search-urls.mjs';
import { assertValidSearchSection, type SearchSection } from './kb-record';

function getRouteMetadata(route: PublishedDocsRoute) {
  const card = zhCNApiReferenceCards.all.find(
    (entry) => entry.href === route.canonicalPath,
  );
  // 平台入口卡片的映射也适用于同一产品、同一 SDK 目录下的子章节。
  // 有歧义的目录不继承，避免把混合客户端/REST API 误标为单一平台。
  const scope = route.canonicalPath.split('/').slice(0, 5).join('/');
  const scopePlatforms = new Set(
    zhCNApiReferenceCards.all
      .filter((entry) => entry.href.startsWith(`${scope}/`))
      .map((entry) => entry.platformId),
  );
  const inheritedPlatform =
    scopePlatforms.size === 1 ? [...scopePlatforms][0] : undefined;
  const [, tab, firstProduct, secondProduct] = route.canonicalPath
    .split('/')
    .filter(Boolean);
  const product =
    card?.productId ??
    (tab === 'solutions'
      ? firstProduct
      : tab === 'api-reference' && firstProduct === 'api-ref'
        ? secondProduct
        : tab === 'ai'
          ? 'conversational-ai'
          : ['realtime-media', 'api-reference'].includes(tab)
            ? firstProduct
            : tab);
  const platform =
    route.platform ??
    (card?.platformId && isKnownPlatform(card.platformId)
      ? card.platformId
      : inheritedPlatform && isKnownPlatform(inheritedPlatform)
        ? inheritedPlatform
        : route.canonicalPath.split('/').find(isKnownPlatform));
  return {
    product: normalizeCnProduct(product),
    platform,
    version: route.version,
  };
}

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
  renderedHeadingIds?: ReadonlySet<string>,
): SearchSection[] {
  // Metadata/card/FAQ lookups use content paths, regardless of public routing.
  route = {
    ...route,
    canonicalPath: toCnContentSearchUrl(route.canonicalPath),
  };
  let tree = unified().use(remarkParse).parse(markdown);
  // 平台和折叠容器导出后可能保留四空格缩进，remark 会把正文误当代码。
  // 非平台页必须由真实 HTML 标题确认锚点，不能把普通代码示例提升成章节。
  if (route.platform || renderedHeadingIds?.size) {
    const accordionOpening = /^[ \t]*<Accordion\b[^\r\n]*>\r?\n/;
    while (true) {
      const blocks = tree.children.filter((node) => {
        if ((node.type !== 'code' && node.type !== 'html') || !node.position)
          return false;
        const headingIds = [
          ...node.value.matchAll(/^\s*#{1,6}\s+.+\s+\[#(.+)\]\s*$/gm),
        ].map((match) => match[1]);
        if (node.type === 'html') {
          // 紧跟开标签的第一个标题会被 remark 吞进 HTML 节点，而不是缩进代码块。
          return (
            accordionOpening.test(node.value) &&
            headingIds.some((id) => renderedHeadingIds?.has(id))
          );
        }
        if (node.lang) return false;
        const start = node.position.start.offset ?? 0;
        const source = markdown.slice(start, node.position.end.offset);
        return (
          /^(?: {4}|\t)/.test(source) &&
          !/^\s*(?:`{3,}|~{3,})/.test(source) &&
          headingIds.some((id) => route.platform || renderedHeadingIds?.has(id))
        );
      });
      if (!blocks.length) break;
      for (const node of blocks.reverse()) {
        if ((node.type !== 'code' && node.type !== 'html') || !node.position)
          continue;
        let value = node.value;
        if (node.type === 'html') {
          value = value.replace(accordionOpening, '$&\n');
        }
        // Slot 中的代码被序列化到表格单元格时，闭合 fence 后会残留列分隔符。
        // 只在确认存在表格代码单元格的生成块内恢复两列代码的 fence 边界。
        if (
          node.type === 'code' &&
          /^\s*\|\s*`{3,}[^`\r\n]*$/m.test(value) &&
          /^\s*\|[\s:|-]+\|\s*$/m.test(value)
        ) {
          value = value
            .replace(/^([ \t]*)\|[ \t]*(`{3,}[^`\r\n]*)$/gm, '$1$2')
            .replace(
              /^([ \t]*)(`{3,})[ \t]*\|[ \t]*(`{3,}[^`\r\n]*)$/gm,
              '$1$2\n\n$1$3',
            )
            .replace(/^([ \t]*)(`{3,})\s*\|\s*$/gm, '$1$2');
        }
        markdown =
          markdown.slice(0, node.position.start.offset) +
          value +
          markdown.slice(node.position.end.offset);
      }
      tree = unified().use(remarkParse).parse(markdown);
    }
  }
  const slugger = new GithubSlugger();
  const [, tab] = route.canonicalPath.split('/').filter(Boolean);
  const routeMetadata = getRouteMetadata(route);
  const faq = getCnFaqMetadata(route.canonicalPath);
  const version = route.canonicalPath
    .split('/')
    .find((segment) => /^v?\d+\.\d+(?:\.\d+)?$/.test(segment));
  const faqProducts = faq
    ? faq.unscoped
      ? ['reference']
      : faq.products
    : routeMetadata.product
      ? [routeMetadata.product]
      : [];
  const products = normalizeCnProductList(faqProducts);
  const metadata = {
    pageTitle: page.title,
    locale: 'zh-CN',
    tab,
    product: products[0],
    products,
    canonicalUrl: route.canonicalPath,
    defaultPlatform: route.defaultPlatform,
    isDefaultPlatform:
      !route.platform || route.platform === route.defaultPlatform,
    ...(route.platform ? { availablePlatforms: [route.platform] } : {}),
    version: routeMetadata.version ?? version,
    platform: faq
      ? faq.platform.length
        ? faq.platform
        : undefined
      : routeMetadata.platform
        ? [routeMetadata.platform]
        : undefined,
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
  readRenderedHtml,
}: {
  routes: PublishedDocsRoute[];
  pages: SearchEntry[];
  readMarkdown: (markdownPath: string) => Promise<string>;
  readRenderedHtml?: (url: string) => Promise<string>;
}): Promise<SearchSection[]> {
  // The same navigation allowlist used by the site excludes hidden/redirect-only docs.
  const pagesByUrl = new Map(
    pages
      .filter((page) => isPublicCnSearchUrl(page.url))
      .map((page) => [toCnPublicSearchUrl(page.url), page]),
  );
  const records: SearchSection[] = [];
  const variantPages = new Set(
    routes
      .filter((route) => route.platform)
      .map((route) => toCnPublicSearchUrl(route.canonicalPath)),
  );
  for (const route of [...routes].sort((a, b) => a.url.localeCompare(b.url))) {
    const page = pagesByUrl.get(toCnPublicSearchUrl(route.canonicalPath));
    if (!page || !isPublicCnSearchUrl(route.url)) continue;
    // Search a specific rendered platform instead of canonical Markdown containing
    // every hidden tab. Platform links open the matching content directly.
    if (
      !route.platform &&
      page.objectType !== 'openapi' &&
      variantPages.has(toCnPublicSearchUrl(route.canonicalPath))
    )
      continue;
    if (route.platform && !route.defaultPlatform)
      throw new Error(
        `Missing default platform for ${route.canonicalPath}; rebuild static docs payloads`,
      );
    const markdown = await readMarkdown(route.markdownPath);
    const $ = readRenderedHtml
      ? load(await readRenderedHtml(route.url))
      : undefined;
    const renderedHeadingIds =
      $ &&
      new Set(
        $('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]')
          .map((_, element) => $(element).attr('id'))
          .get(),
      );
    const sections = extractPublishedCnSections(
      route,
      page,
      markdown,
      renderedHeadingIds,
    );
    if ($) {
      const ids = new Set(
        $('[id]')
          .map((_, element) => $(element).attr('id'))
          .get(),
      );
      for (const section of sections) {
        const anchor = section.url.split('#')[1];
        if (!anchor || ids.has(anchor)) continue;
        const title = section.sectionTitle.replace(/\s+/g, ' ').trim();
        const candidates = new Set(
          $('h1,h2,h3,h4,h5,h6')
            .toArray()
            .filter(
              (element) =>
                $(element).text().replace(/\s+/g, ' ').trim() === title,
            )
            .map((element) => $(element).attr('id'))
            .filter(Boolean),
        );
        if (candidates.size !== 1)
          throw new Error(`Unresolved rendered search anchor: ${section.url}`);
        section.url = `${route.url}#${[...candidates][0]}`;
        section.id = `${route.url}::heading:${[...candidates][0]}`;
      }
    }
    // 旧锚点修正后可能与另一记录指向同一章节，统一身份并保留两边正文。
    const byUrl = new Map<string, SearchSection>();
    for (const section of sections) {
      const previous = byUrl.get(section.url);
      if (!previous) {
        byUrl.set(section.url, section);
        continue;
      }
      byUrl.set(section.url, {
        ...(section.headingPath.length > previous.headingPath.length
          ? section
          : previous),
        content:
          previous.content === section.content
            ? previous.content
            : `${previous.content}\n${section.content}`,
      });
    }
    records.push(...byUrl.values());
  }
  if (!records.length)
    throw new Error(
      'No published CN search records; build the CN static artifacts first',
    );
  const availablePlatformsByCanonicalUrl = new Map<string, Set<string>>();
  for (const record of records) {
    if (!record.canonicalUrl || !record.platform) continue;
    const platforms =
      availablePlatformsByCanonicalUrl.get(record.canonicalUrl) ?? new Set();
    for (const platform of record.platform) {
      if (isKnownPlatform(platform)) platforms.add(platform);
    }
    availablePlatformsByCanonicalUrl.set(record.canonicalUrl, platforms);
  }
  for (const record of records) {
    if (
      record.defaultPlatform &&
      record.canonicalUrl &&
      !availablePlatformsByCanonicalUrl
        .get(record.canonicalUrl)
        ?.has(record.defaultPlatform)
    )
      throw new Error(
        `Default platform ${record.defaultPlatform} has no indexed content: ${record.canonicalUrl}`,
      );
  }

  return records
    .filter((record) => record.products?.length || record.product)
    .map((record) => {
      const platforms = record.canonicalUrl
        ? availablePlatformsByCanonicalUrl.get(record.canonicalUrl)
        : undefined;
      const availablePlatforms = platforms
        ? [...platforms].sort(
            (a, b) =>
              platformRegistry[a as keyof typeof platformRegistry].order -
              platformRegistry[b as keyof typeof platformRegistry].order,
          )
        : record.availablePlatforms;
      const section = availablePlatforms?.length
        ? { ...record, availablePlatforms }
        : record;
      return {
        ...section,
        url: toCnPublicSearchUrl(section.url),
        canonicalUrl: section.canonicalUrl
          ? toCnPublicSearchUrl(section.canonicalUrl)
          : undefined,
      };
    });
}
