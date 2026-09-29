import { readFile } from 'node:fs/promises';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import {
  isKnownPlatform,
  normalizePlatformKey,
} from '../../src/lib/platforms/registry';
import {
  assertValidSearchSection,
  type SearchSection,
} from '../../src/lib/search/kb-record';
import type { CnKbManifestEntry } from './cn-kb-manifest';

export type SourceDocument = {
  route: string;
  platform?: string;
  title: string;
  content: string;
  headings: readonly {
    title: string;
    anchor: string;
    content: string;
    level?: number;
  }[];
  hidden: boolean;
};

type ExtractionInput = {
  manifest: readonly CnKbManifestEntry[];
  source: readonly SourceDocument[];
};

const genericSectionTitles = new Set([
  'Parameters',
  'Returns',
  '参数',
  '返回值',
  '示例代码',
  'Example',
  'Examples',
]);
const maxSectionCharacters = 30000;

function canonicalRoute(route: string): string {
  return route.replace(/\.(?:md|mdx)$/, '');
}

function createRecord(
  document: SourceDocument,
  manifestEntry: CnKbManifestEntry,
  heading: SourceDocument['headings'][number] | undefined,
  headingPath: string[],
): SearchSection {
  const route = `${canonicalRoute(document.route)}${document.platform ? `/${document.platform}` : ''}`;
  const sectionTitle = heading?.title ?? document.title;
  const content = heading?.content.trim() || document.content.trim();
  const record: SearchSection = {
    id: `${route.replace(/^\/+/, '')}:${heading?.anchor ?? 'page'}`.replaceAll(
      '/',
      ':',
    ),
    url: heading ? `${route}#${heading.anchor}` : route,
    pageTitle: document.title,
    sectionTitle,
    content,
    headingPath,
    locale: 'zh-CN',
    product: manifestEntry.product,
    platform: document.platform ? [document.platform] : manifestEntry.platform,
    version: manifestEntry.version,
    docType: 'docs',
    audience: [...manifestEntry.audience],
    status: 'published',
    hidden: false,
  };

  assertValidSearchSection(record);
  return record;
}

export function mergeGenericChildSection(
  parent: SearchSection,
  child: SearchSection,
): SearchSection {
  return {
    ...parent,
    content: `${parent.content}\n\n${child.content}`.trim(),
  };
}

export function extractCnKbRecords({
  manifest,
  source,
}: ExtractionInput): SearchSection[] {
  const manifestByRoute = new Map(
    manifest.map((entry) => [canonicalRoute(entry.route), entry]),
  );
  const seenRoutes = new Set<string>();
  const records: SearchSection[] = [];

  for (const document of [...source].sort((a, b) =>
    a.route.localeCompare(b.route),
  )) {
    const route = canonicalRoute(document.route);
    const manifestEntry = manifestByRoute.get(route);
    const variantKey = `${route}:${document.platform ?? ''}`;

    if (!manifestEntry || document.hidden || seenRoutes.has(variantKey)) {
      continue;
    }

    seenRoutes.add(variantKey);
    const hierarchy: {
      level: number;
      title: string;
      record?: SearchSection;
    }[] = [];
    let included = false;
    for (const heading of document.headings) {
      const level = heading.level ?? 2;
      while (
        hierarchy.length &&
        hierarchy[hierarchy.length - 1].level >= level
      ) {
        hierarchy.pop();
      }
      const path = [
        document.title,
        ...hierarchy.map((item) => item.title),
        heading.title,
      ];
      const parent = hierarchy.at(-1)?.record;
      if (heading.content.trim()) {
        if (isGenericTitle(heading.title) && parent) {
          parent.content = `${parent.content}\n\n${heading.title}\n${heading.content}`;
        } else {
          const record = createRecord(document, manifestEntry, heading, path);
          records.push(record);
          hierarchy.push({ level, title: heading.title, record });
          included = true;
          continue;
        }
      }
      hierarchy.push({ level, title: heading.title, record: parent });
    }
    if (!included && document.content.trim()) {
      records.push(
        createRecord(document, manifestEntry, undefined, [document.title]),
      );
    }
  }

  const result = records
    .filter((record) => record.content.length > 0)
    .sort((left, right) => left.id.localeCompare(right.id));
  for (const record of result) {
    if (record.content.length > maxSectionCharacters) {
      throw new Error(
        `section exceeds ${maxSectionCharacters} characters: ${record.id}`,
      );
    }
  }
  return result;
}

export function isGenericChildSection(record: SearchSection): boolean {
  return isGenericTitle(record.sectionTitle);
}

function isGenericTitle(title: string): boolean {
  return genericSectionTitles.has(title);
}

function parseFrontmatter(source: string): {
  body: string;
  data: Record<string, unknown>;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  return match
    ? {
        body: source.slice(match[0].length),
        data: (yaml.load(match[1]) ?? {}) as Record<string, unknown>,
      }
    : { body: source, data: {} };
}

function parseHeadings(source: string): SourceDocument['headings'] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  const slugger = new GithubSlugger();
  const headings: Extract<
    (typeof tree.children)[number],
    { type: 'heading' }
  >[] = [];
  visit(tree, 'heading', (node) => {
    if (node.depth >= 2) headings.push(node);
  });
  return headings.map((heading, index) => {
    const headingStart = heading.position?.start.offset;
    const headingEnd = heading.position?.end.offset;
    if (headingStart === undefined || headingEnd === undefined) {
      throw new Error('heading must have source offsets');
    }
    const title = source
      .slice(headingStart + heading.depth + 1, headingEnd)
      .trim();
    const end = headings[index + 1]?.position?.start.offset ?? source.length;
    const prefix = source.slice(Math.max(0, headingStart - 160), headingStart);
    const explicitAnchor = prefix.match(/<a id="([^"]+)"><\/a>\s*$/)?.[1];
    const introduction = index === 0 ? source.slice(0, headingStart) : '';
    const content = `${introduction}${source.slice(headingEnd, end)}`
      .replace(/<a id="[^"]+"><\/a>\s*$/, '')
      .trim();
    return {
      title,
      anchor: explicitAnchor ?? slugger.slug(title),
      content,
      level: heading.depth,
    };
  });
}

function splitStructuredPlatforms(
  body: string,
): { content: string; platform?: string }[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const variants = new Map<string, string[]>();
  const shared: string[] = [];
  for (const node of tree.children) {
    if (
      node.type === 'mdxJsxFlowElement' &&
      node.name === 'PlatformStructured'
    ) {
      const value = node.attributes.find(
        (attribute) =>
          attribute.type === 'mdxJsxAttribute' && attribute.name === 'platform',
      );
      const platform =
        value && typeof value.value === 'string'
          ? normalizePlatformKey(value.value)
          : undefined;
      if (!platform || !isKnownPlatform(platform)) {
        throw new Error('PlatformStructured requires a known string platform');
      }
      const children = node.children;
      const first = children[0]?.position?.start.offset;
      const last = children.at(-1)?.position?.end.offset;
      if (first !== undefined && last !== undefined) {
        const parts = variants.get(platform) ?? [];
        parts.push(body.slice(first, last));
        variants.set(platform, parts);
      }
    } else {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start !== undefined && end !== undefined)
        shared.push(body.slice(start, end));
    }
  }
  if (!variants.size) return [{ content: body }];
  return [...variants].map(([platform, parts]) => ({
    platform,
    content: [...shared, ...parts].join('\n\n'),
  }));
}

export async function readCnKbSourceDocuments(
  manifest: readonly CnKbManifestEntry[],
  load: (path: string) => Promise<string> = (path) => readFile(path, 'utf8'),
): Promise<SourceDocument[]> {
  const documents = await Promise.all(
    manifest.map(async (entry) => {
      const raw = await load(entry.sourcePath);
      const { body, data } = parseFrontmatter(raw);
      return splitStructuredPlatforms(body).map(
        ({ content, platform }) =>
          ({
            route: entry.route,
            platform,
            title:
              typeof data.title === 'string'
                ? data.title
                : (entry.route.split('/').at(-1) ?? entry.route),
            content,
            headings: parseHeadings(content),
            hidden:
              data.hidden === true ||
              data.draft === true ||
              data.status === 'internal',
          }) satisfies SourceDocument,
      );
    }),
  );
  return documents.flat();
}
