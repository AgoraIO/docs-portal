import {
  assertValidSearchSection,
  type SearchSection,
} from '../../src/lib/search/kb-record';
import type { CnKbManifestEntry } from './cn-kb-manifest';
import { readFile } from 'node:fs/promises';

export type SourceDocument = {
  route: string;
  title: string;
  content: string;
  headings: readonly {
    title: string;
    anchor: string;
    content: string;
  }[];
  hidden: boolean;
};

type ExtractionInput = {
  manifest: readonly CnKbManifestEntry[];
  source: readonly SourceDocument[];
};

const genericSectionTitles = new Set(['Parameters', 'Returns', '参数', '返回值']);

function canonicalRoute(route: string): string {
  return route.replace(/\.(?:md|mdx)$/, '');
}

function inferProduct(route: string): string | undefined {
  const productSegment = route.split('/').find((segment) => segment === 'conversational-ai');
  return productSegment;
}

function createRecord(
  document: SourceDocument,
  manifestEntry: CnKbManifestEntry,
  heading: SourceDocument['headings'][number] | undefined,
): SearchSection {
  const route = canonicalRoute(document.route);
  const sectionTitle = heading?.title ?? document.title;
  const content = heading?.content.trim() || document.content.trim();
  const record: SearchSection = {
    id: `${route.replace(/^\/+/, '')}:${heading?.anchor ?? 'page'}`.replaceAll('/', ':'),
    url: heading ? `${route}#${heading.anchor}` : route,
    pageTitle: document.title,
    sectionTitle,
    content,
    headingPath: heading ? [document.title, sectionTitle] : [document.title],
    locale: 'zh-CN',
    product: inferProduct(route),
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

export function extractCnKbRecords({ manifest, source }: ExtractionInput): SearchSection[] {
  const manifestByRoute = new Map(
    manifest.map((entry) => [canonicalRoute(entry.route), entry]),
  );
  const seenRoutes = new Set<string>();
  const records: SearchSection[] = [];

  for (const document of source) {
    const route = canonicalRoute(document.route);
    const manifestEntry = manifestByRoute.get(route);

    if (!manifestEntry || document.hidden || seenRoutes.has(route)) {
      continue;
    }

    seenRoutes.add(route);
    const headings = document.headings.filter((heading) => heading.content.trim());
    records.push(
      ...(headings.length > 0
        ? headings.map((heading) => createRecord(document, manifestEntry, heading))
        : [createRecord(document, manifestEntry, undefined)]),
    );
  }

  return records
    .filter((record) => record.content.length > 0)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function isGenericChildSection(record: SearchSection): boolean {
  return genericSectionTitles.has(record.sectionTitle);
}

function parseTitle(source: string, fallback: string): string {
  return (
    source
      .match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]
      ?.replace(/["']/g, '') ?? fallback
  );
}

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseHeadings(source: string): SourceDocument['headings'] {
  const matches = [...source.matchAll(/^(#{2,4})\s+(.+)$/gm)];

  return matches.map((match, index) => {
    const title = match[2].trim();
    const sectionStart = match.index! + match[0].length;
    const sectionEnd = matches[index + 1]?.index ?? source.length;
    const prefix = source.slice(Math.max(0, match.index! - 120), match.index);
    const explicitAnchor = prefix.match(/<a id="([^"]+)"><\/a>\s*$/)?.[1];

    return {
      title,
      anchor: explicitAnchor ?? slugifyHeading(title),
      content: source.slice(sectionStart, sectionEnd).trim(),
    };
  });
}

export async function readCnKbSourceDocuments(
  manifest: readonly CnKbManifestEntry[],
): Promise<SourceDocument[]> {
  return Promise.all(
    manifest.map(async (entry) => {
      const content = await readFile(entry.sourcePath, 'utf8');
      return {
        route: entry.route,
        title: parseTitle(content, entry.route.split('/').at(-1) ?? entry.route),
        content,
        headings: parseHeadings(content),
        hidden: false,
      } satisfies SourceDocument;
    }),
  );
}
