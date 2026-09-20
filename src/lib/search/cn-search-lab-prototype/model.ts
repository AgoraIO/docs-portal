import { structure } from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';

export type SourcePage = {
  content: string;
  description?: string;
  hidden: boolean;
  locale: 'zh-CN';
  title: string;
  url: string;
};

export type SearchDocument = {
  aliases: string;
  content: string;
  docType: string;
  headingLevel: number;
  headingPath: string[];
  hidden: boolean;
  id: string;
  kind: 'page' | 'section';
  locale: 'zh-CN';
  pageTitle: string;
  platform: string[];
  product: string;
  sectionTitle: string;
  title: string;
  url: string;
  version: string;
};

type PlainSection = {
  anchor: string;
  content: string;
  level: number;
  path: string[];
  title: string;
};

export const GENERIC_SECTION_TITLES = new Set([
  '参数',
  '返回值',
  '示例',
  '注意',
  '注意事项',
  '描述',
  '说明',
  '属性',
  '方法',
  '回调',
  '接口',
  '所属接口类',
  '调用时机',
  '枚举值',
  '详情',
  '适用场景',
  '前提条件',
  '接口方法',
  '接口描述',
  '相关回调',
  '触发时机',
  '成员参数',
]);

const CONTENT_TYPES = [
  'heading',
  'paragraph',
  'blockquote',
  'tableCell',
  'mdxJsxFlowElement',
  'code',
];

const PLATFORM_NAMES = new Set([
  'android',
  'electron',
  'flutter',
  'harmonyos',
  'ios',
  'macos',
  'react-native',
  'unity',
  'unreal',
  'unreal-blueprint',
  'web',
  'windows',
]);

export function buildPageDocuments(pages: SourcePage[]): SearchDocument[] {
  return pages.map((page) => {
    const metadata = metadataFromUrl(page.url);
    const extracted = extractPlainSections(page.content);
    const content = extracted.map((section) => section.content).join('\n');

    return {
      aliases: '',
      ...metadata,
      content,
      headingLevel: 0,
      headingPath: [page.title],
      hidden: page.hidden,
      id: page.url,
      kind: 'page',
      locale: page.locale,
      pageTitle: page.title,
      sectionTitle: '',
      title: page.title,
      url: page.url,
    };
  });
}

export function buildSectionDocuments(pages: SourcePage[]): SearchDocument[] {
  return pages.flatMap((page) => {
    const metadata = metadataFromUrl(page.url);
    const sections = extractPlainSections(page.content);

    if (sections.length === 0) {
      return buildPageDocuments([page]);
    }

    return sections.map((section, index) =>
      toSectionDocument(page, metadata, section, index),
    );
  });
}

export function buildCompactedSectionDocuments(
  pages: SourcePage[],
): SearchDocument[] {
  return pages.flatMap((page) => {
    const metadata = metadataFromUrl(page.url);
    const sections = extractPlainSections(page.content);

    if (sections.length === 0) {
      return buildPageDocuments([page]);
    }

    const compacted: PlainSection[] = [];
    for (const sourceSection of sections) {
      const section = { ...sourceSection };

      if (shouldKeepAsSection(section)) {
        compacted.push(section);
        continue;
      }

      let parent: PlainSection | undefined;
      for (let index = compacted.length - 1; index >= 0; index -= 1) {
        const candidate = compacted[index];
        if (
          candidate.level < section.level &&
          isPathPrefix(candidate.path, section.path)
        ) {
          parent = candidate;
          break;
        }
      }

      if (!parent) {
        compacted.push(section);
        continue;
      }

      parent.content = [parent.content, section.title, section.content]
        .filter(Boolean)
        .join('\n');
    }

    return compacted.map((section, index) =>
      toSectionDocument(page, metadata, section, index),
    );
  });
}

function toSectionDocument(
  page: SourcePage,
  metadata: ReturnType<typeof metadataFromUrl>,
  section: PlainSection,
  index: number,
): SearchDocument {
  const sectionTitle = section.title || page.title;
  const url = section.anchor ? `${page.url}#${section.anchor}` : page.url;

  return {
    aliases: '',
    ...metadata,
    content: section.content,
    headingLevel: section.level,
    headingPath: [page.title, ...section.path],
    hidden: page.hidden,
    id: `${url}:${index}`,
    kind: 'section',
    locale: page.locale,
    pageTitle: page.title,
    sectionTitle,
    title: sectionTitle,
    url,
  };
}

function shouldKeepAsSection(section: PlainSection) {
  return (
    section.level <= 2 ||
    looksLikeApiIdentifier(section.title) ||
    (!GENERIC_SECTION_TITLES.has(section.title.trim()) &&
      section.content.length > 120)
  );
}

function looksLikeApiIdentifier(title: string) {
  return (
    /[a-z][A-Z]/.test(title) ||
    /[_().]/.test(title) ||
    /^[a-z]+\d+$/i.test(title)
  );
}

function isPathPrefix(candidate: string[], path: string[]) {
  return candidate.every((part, index) => path[index] === part);
}

function extractPlainSections(markdown: string): PlainSection[] {
  const extracted = structure(markdown, [remarkDirective], {
    types: CONTENT_TYPES,
  });
  const sourceHeadings = scanSourceHeadings(markdown);
  const headings = new Map(
    extracted.headings.map((heading, index) => {
      const sourceHeading = sourceHeadings[index];
      return [
        heading.id,
        {
          anchor: sourceHeading?.anchor || heading.id,
          level: sourceHeading?.level ?? 0,
          path: sourceHeading?.path ?? [],
          title: toPlainText(heading.content),
        },
      ];
    }),
  );
  const sections = new Map<
    string,
    {
      anchor: string;
      content: string[];
      level: number;
      path: string[];
      title: string;
    }
  >();
  const order: string[] = [];

  for (const block of extracted.contents) {
    const key = block.heading ?? '';
    const content = toPlainText(block.content);

    if (!content) {
      continue;
    }

    if (!sections.has(key)) {
      const heading = headings.get(key);
      sections.set(key, {
        anchor: heading?.anchor ?? '',
        content: [],
        level: heading?.level ?? 0,
        path: heading?.path ?? [],
        title: heading?.title ?? '',
      });
      order.push(key);
    }

    sections.get(key)?.content.push(content);
  }

  return order.flatMap((key) => {
    const section = sections.get(key);
    return section
      ? [
          {
            anchor: section.anchor,
            content: section.content.join('\n'),
            level: section.level,
            path: section.path,
            title: section.title,
          },
        ]
      : [];
  });
}

function scanSourceHeadings(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const headings: Array<{
    anchor: string;
    level: number;
    path: string[];
    title: string;
  }> = [];
  const headingStack: Array<{ level: number; title: string }> = [];
  let pendingAnchor = '';

  for (const line of lines) {
    const anchor = /^\s*<a\s+id=["']([^"']+)["'][^>]*><\/a>\s*$/.exec(line);
    if (anchor) {
      pendingAnchor = anchor[1];
      continue;
    }

    const heading = /^\s*#{1,6}\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const level = line.trimStart().indexOf(' ');
      const title = toPlainText(heading[1].replace(/\s+\{#[^}]+\}\s*$/, ''));
      const inlineAnchor = /\{#([^}]+)\}\s*$/.exec(heading[1]);
      while ((headingStack.at(-1)?.level ?? 0) >= level) {
        headingStack.pop();
      }
      const headingPath = [...headingStack.map((item) => item.title), title];
      headings.push({
        anchor: pendingAnchor || inlineAnchor?.[1] || slugify(title),
        level,
        path: headingPath,
        title,
      });
      headingStack.push({ level, title });
      pendingAnchor = '';
      continue;
    }

    if (line.trim()) {
      pendingAnchor = '';
    }
  }

  return headings;
}

function metadataFromUrl(url: string) {
  const [, , docType = '', product = '', ...rest] = url.split('/');
  const pathParts = [product, ...rest];
  const platform = pathParts.filter((part) => PLATFORM_NAMES.has(part));
  const version =
    pathParts.find(
      (part) => part === '(current)' || /^v?\d+(?:\.\d+)*$/i.test(part),
    ) ?? '';

  return {
    docType,
    platform,
    product,
    version,
  };
}

function slugify(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function toPlainText(markdown: string) {
  return markdown
    .replace(/^\s*```[^\n]*$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
