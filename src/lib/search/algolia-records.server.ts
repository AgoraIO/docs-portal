import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { structure } from 'fumadocs-core/mdx-plugins';
import type { DocumentRecord } from 'fumadocs-core/search/algolia';
import yaml from 'js-yaml';
import remarkDirective from 'remark-directive';
import { faqItems } from '../../components/faq/faq-data';
import { buildDocPath } from '../docs-routing';
import { getSearchEntryMetadata } from '../docs-search';
import type { AppLocale } from '../i18n/i18n-config';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
} from '../openapi/lanes';
import { buildOpenApiSchemaTree } from '../openapi/schema-tree';
import { getOpenApiOperations } from '../openapi/source.server';
import { getPublishedDocsLocales } from '../site-region';
import { getAlgoliaSearchNavigation } from './algolia-search-source.server';

// Search-ranking category. Glossary pages cross-reference every term so they
// match almost any query; legacy/deprecated pages are rarely the intent. Both
// are demoted at query time (via optionalFilters) so real feature/reference
// docs rank above them. Everything else — features AND normal reference — is
// 'default' and keeps Algolia's own relevance.
type SearchCategory = 'glossary' | 'deprecated' | 'default';

type AlgoliaExtraData = {
  category: SearchCategory;
  locale: AppLocale;
  objectType: 'docs' | 'openapi';
  platform?: string[];
  product?: string;
  tab: string;
};

export type AlgoliaDocsRecord = DocumentRecord & {
  extra_data: AlgoliaExtraData;
};

type AlgoliaContentDocsPage = {
  content: string;
  description?: string;
  title?: string;
  url: string;
};

const MAX_CHUNK_LENGTH = 4500;
const INDEXED_LOCALES: readonly AppLocale[] = getPublishedDocsLocales('global');
const PUBLIC_FAQ_URLS = new Set(faqItems.map(({ href }) => href));
const APPROVED_HIDDEN_PRODUCT_OVERVIEW_URLS = new Set([
  '/en/realtime-media/interactive-live-streaming/product-overview',
  '/en/realtime-media/broadcast-streaming/product-overview',
]);

// Classify a doc by its URL for search ranking. No taxonomy exists in
// frontmatter, so this derives it once, at index time, from path conventions:
// glossary pages live at `.../glossary`; legacy/deprecated pages carry those
// words in the slug.
export function classifySearchCategory(url: string): SearchCategory {
  if (/(^|\/)glossary(\/|$)/i.test(url)) {
    return 'glossary';
  }

  if (/legacy|deprecated/i.test(url)) {
    return 'deprecated';
  }

  return 'default';
}

// MDAST node types extracted as searchable plain text by `structure()`. These
// are its defaults plus `code`, so identifiers that only appear in fenced code
// blocks stay searchable (dropping `code` would silently reduce recall).
const STRUCTURE_CONTENT_TYPES = [
  'heading',
  'paragraph',
  'blockquote',
  'tableCell',
  'mdxJsxFlowElement',
  'code',
];

export async function getAlgoliaDocsRecords(): Promise<AlgoliaDocsRecord[]> {
  const [pages, navigationByLocale] = await Promise.all([
    getContentDocsPages(),
    getAlgoliaSearchNavigation(),
  ]);
  const [docsRecords, openApiRecords] = await Promise.all([
    buildAlgoliaContentDocsRecords(pages, navigationByLocale),
    getOpenApiRecords(navigationByLocale),
  ]);

  return [...docsRecords, ...openApiRecords];
}

export async function getAlgoliaContentDocsRecords() {
  const [pages, navigationByLocale] = await Promise.all([
    getContentDocsPages(),
    getAlgoliaSearchNavigation(),
  ]);

  return buildAlgoliaContentDocsRecords(pages, navigationByLocale);
}

export function buildAlgoliaContentDocsRecords(
  pages: AlgoliaContentDocsPage[],
  navigationByLocale: ReadonlyMap<string, ReadonlyMap<string, string[]>>,
) {
  return pages.flatMap((page): AlgoliaDocsRecord[] => {
    const route = parseDocsUrl(page.url);

    if (!route) {
      return [];
    }

    const breadcrumbs =
      navigationByLocale.get(route.locale)?.get(page.url) ??
      getHiddenSearchablePageBreadcrumbs(page.url, route);

    if (!breadcrumbs) {
      return [];
    }

    const title = page.title ?? route.slugSegments.at(-1) ?? page.url;
    const { contents, headings } = extractDocSearchContent(page.content);
    const metadata = getSearchEntryMetadata(page.url, page.content);

    if (contents.length === 0 && page.description) {
      contents.push({ content: page.description, heading: undefined });
    }

    return [
      {
        _id: `docs:${page.url}`,
        breadcrumbs,
        description: page.description,
        extra_data: {
          category: classifySearchCategory(page.url),
          locale: route.locale,
          ...metadata,
        },
        structured: {
          contents,
          headings,
        },
        title,
        url: page.url,
      },
    ];
  });
}

function getHiddenSearchablePageBreadcrumbs(
  url: string,
  route: NonNullable<ReturnType<typeof parseDocsUrl>>,
) {
  if (route.locale !== 'en') return undefined;

  const [firstSegment, secondSegment, thirdSegment] = route.slugSegments;
  if (
    route.tab === 'api-reference' &&
    firstSegment === 'faq' &&
    secondSegment &&
    thirdSegment &&
    PUBLIC_FAQ_URLS.has(url)
  ) {
    return ['Reference', 'FAQ', humanizeSlug(secondSegment)];
  }

  if (
    route.tab === 'realtime-media' &&
    firstSegment &&
    secondSegment === 'product-overview' &&
    route.slugSegments.length === 2 &&
    APPROVED_HIDDEN_PRODUCT_OVERVIEW_URLS.has(url)
  ) {
    return ['RTC', humanizeSlug(firstSegment)];
  }

  return undefined;
}

function humanizeSlug(value: string) {
  return value
    .split(/[-_]+/u)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export function buildAlgoliaOpenApiRecord({
  breadcrumbs,
  content,
  laneId,
  locale,
  method,
  operationId,
  path: operationPath,
  tab,
  title,
  url,
}: {
  breadcrumbs: string[];
  content: string;
  laneId: string;
  locale: AppLocale;
  method: string;
  operationId: string;
  path: string;
  tab: string;
  title: string;
  url: string;
}): AlgoliaDocsRecord {
  const metadata = getSearchEntryMetadata(url, content, 'openapi');

  return {
    _id: `openapi:${url}`,
    breadcrumbs,
    extra_data: {
      category: classifySearchCategory(url),
      locale,
      ...metadata,
      product: laneId,
      tab,
    },
    structured: {
      contents: chunkText(content, MAX_CHUNK_LENGTH).map((chunk) => ({
        content: chunk,
        heading: operationId,
      })),
      headings: [
        {
          content: `${method.toUpperCase()} ${operationPath}`,
          id: operationId,
        },
      ],
    },
    title,
    url,
  };
}

/**
 * Extract searchable plain text from a doc's MDX source. Uses fumadocs'
 * `structure()` (AST-based) rather than indexing raw Markdown, so search
 * snippets read as prose instead of Markdown/table markup. `code` is kept in
 * the scanned node types so identifiers inside fenced blocks stay searchable.
 */
export function extractDocSearchContent(markdown: string) {
  const extracted = structure(markdown, [remarkDirective], {
    types: STRUCTURE_CONTENT_TYPES,
  });

  // `structure()` emits one block per paragraph / table cell / code block.
  // Re-group them into per-heading sections before indexing — otherwise a
  // single API-reference table becomes hundreds of Algolia records. Section
  // granularity keeps the object count ~1 per heading while still giving the
  // search engine enough text to build a windowed snippet.
  const sectionText = new Map<string, string[]>();
  const sectionOrder: string[] = [];

  for (const block of extracted.contents) {
    const key = block.heading ?? '';
    const text = toPlainText(block.content);

    if (!text) {
      continue;
    }

    if (!sectionText.has(key)) {
      sectionText.set(key, []);
      sectionOrder.push(key);
    }

    sectionText.get(key)?.push(text);
  }

  const contents = sectionOrder.flatMap((key) =>
    chunkText(sectionText.get(key)?.join('\n') ?? '', MAX_CHUNK_LENGTH).map(
      (content) => ({ content, heading: key || undefined }),
    ),
  );

  return { contents, headings: extracted.headings };
}

// Reduce inline Markdown to readable, searchable plain text, keeping every
// word. Cleans two sources: the residue `structure()` leaves after
// re-serializing doc blocks (fenced-code delimiters, paired emphasis/inline
// code), and OpenAPI spec descriptions (raw Markdown, links and all).
// Underscores are deliberately left untouched so identifiers like
// `filler_words.enable` survive. For docs that is lossless (`structure()`
// normalizes `_emphasis_` to `*` upstream); the rare `_emphasis_` in an
// OpenAPI description is accepted verbatim rather than risk mangling an id.
export function toPlainText(markdown: string) {
  return markdown
    .replace(/^\s*```[^\n]*$/gm, '') // fenced-code delimiters (keep code body)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links/images -> text/alt
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*\n]+)\*/g, '$1') // italic
    .replace(/~~([^~]+)~~/g, '$1') // strikethrough
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

async function getContentDocsPages() {
  const docsRoot = path.join(process.cwd(), 'content/docs');
  const files = (
    await Promise.all(
      INDEXED_LOCALES.map((locale) =>
        scanDocsFiles(path.join(docsRoot, locale)).then((items) =>
          items.map((filePath) => ({ filePath, locale })),
        ),
      ),
    )
  ).flat();

  return Promise.all(
    files.map(async ({ filePath, locale }) => {
      const raw = await readFile(filePath, 'utf8');
      const { content, data } = parseFrontmatter(raw);
      const relative = path.relative(path.join(docsRoot, locale), filePath);
      const routeSegments = relative
        .replace(/\.(md|mdx)$/, '')
        .split(path.sep)
        .filter(Boolean);
      const slugSegments =
        routeSegments.at(-1) === 'index'
          ? routeSegments.slice(0, -1)
          : routeSegments;
      const [tab, ...rest] = slugSegments;

      return {
        content,
        description:
          typeof data.description === 'string' ? data.description : undefined,
        title: typeof data.title === 'string' ? data.title : undefined,
        url: buildDocPath(locale, tab ?? '', rest),
      };
    }),
  );
}

async function scanDocsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return scanDocsFiles(entryPath);
      }

      if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nested.flat();
}

function parseFrontmatter(raw: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);

  if (!match) {
    return { content: raw, data: {} as Record<string, unknown> };
  }

  return {
    content: raw.slice(match[0].length),
    data: (yaml.load(match[1]) ?? {}) as Record<string, unknown>,
  };
}

async function getOpenApiRecords(
  navigationByLocale: ReadonlyMap<string, ReadonlyMap<string, string[]>>,
) {
  const lanePages = await Promise.all(
    getOpenApiLanes().flatMap((lane) =>
      getOpenApiLaneLocales(lane)
        .filter((locale) => INDEXED_LOCALES.includes(locale))
        .map(async (locale) => ({
          lane,
          locale,
          operations: await getOpenApiOperations(lane, locale),
        })),
    ),
  );

  return lanePages.flatMap(({ lane, locale, operations }) =>
    getOpenApiOperationIds(lane).flatMap((operationId) => {
      const operation = operations.find(
        (item) => item.operationId === operationId,
      );

      if (!operation) {
        return [];
      }

      const title = lane.operations[operationId].title[locale];
      const url = getOpenApiEndpointUrl(lane, locale, operationId);
      const breadcrumbs = navigationByLocale.get(locale)?.get(url);

      if (!breadcrumbs) {
        return [];
      }

      const content = [
        title,
        operation.operationId,
        operation.method,
        operation.path,
        operation.summary,
        operation.description,
        ...operation.parameters.map((parameter) =>
          [parameter.name, parameter.in, parameter.description]
            .filter(Boolean)
            .join(' '),
        ),
        ...schemaFieldPaths(
          operation.requestBody?.content['application/json']?.schema,
        ),
        ...Object.entries(operation.responses).flatMap(([status, response]) => [
          status,
          response.description,
          ...schemaFieldPaths(response.content?.['application/json']?.schema),
        ]),
      ]
        .filter(Boolean)
        .map((part) => toPlainText(String(part)))
        .join('\n');
      return [
        buildAlgoliaOpenApiRecord({
          breadcrumbs,
          content,
          laneId: lane.id,
          locale,
          method: operation.method,
          operationId: operation.operationId,
          path: operation.path,
          tab: lane.tab,
          title,
          url,
        }),
      ];
    }),
  );
}

function chunkText(text: string, maxLength: number) {
  const normalized = text.replace(/\n{3,}/g, '\n\n').trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    const splitAt = Math.max(
      remaining.lastIndexOf('\n\n', maxLength),
      remaining.lastIndexOf('\n', maxLength),
    );
    const end = splitAt > maxLength * 0.5 ? splitAt : maxLength;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

function parseDocsUrl(url: string) {
  const [locale, tab, ...slugSegments] = url.split('/').filter(Boolean);

  if (!INDEXED_LOCALES.includes(locale as AppLocale) || !tab) {
    return null;
  }

  return {
    locale: locale as AppLocale,
    slugSegments,
    tab,
  };
}

function schemaFieldPaths(schema: unknown) {
  return buildOpenApiSchemaTree(schema).flatMap(flattenSchemaNode);
}

function flattenSchemaNode(node: {
  children: (typeof node)[];
  description?: string;
  enumValues?: unknown[];
  defaultValue?: unknown;
  example?: unknown;
  format?: string;
  path: string;
  type: string;
}): string[] {
  return [
    node.path,
    node.type,
    node.format,
    node.description,
    ...(node.enumValues ?? []).map(String),
    node.defaultValue === undefined ? undefined : String(node.defaultValue),
    node.example === undefined ? undefined : String(node.example),
    ...node.children.flatMap(flattenSchemaNode),
  ].filter(
    (value): value is string => typeof value === 'string' && Boolean(value),
  );
}
