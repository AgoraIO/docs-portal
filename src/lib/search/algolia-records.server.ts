import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { structure } from 'fumadocs-core/mdx-plugins';
import type { DocumentRecord } from 'fumadocs-core/search/algolia';
import yaml from 'js-yaml';
import remarkDirective from 'remark-directive';
import { buildDocPath } from '../docs-routing';
import type { AppLocale } from '../i18n/i18n-config';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
} from '../openapi/lanes';
import { buildOpenApiSchemaTree } from '../openapi/schema-tree';
import { getOpenApiOperations } from '../openapi/source.server';

type AlgoliaExtraData = {
  locale: AppLocale;
  objectType: 'docs' | 'openapi';
  platform?: string[];
  product?: string;
  tab: string;
};

export type AlgoliaDocsRecord = DocumentRecord & {
  extra_data: AlgoliaExtraData;
};

const MAX_CHUNK_LENGTH = 4500;
const INDEXED_LOCALES: readonly AppLocale[] = ['en'];

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
  const [docsRecords, openApiRecords] = await Promise.all([
    getContentDocsRecords(),
    getOpenApiRecords(),
  ]);

  return [...docsRecords, ...openApiRecords];
}

async function getContentDocsRecords() {
  const pages = await getContentDocsPages();

  return pages.flatMap((page): AlgoliaDocsRecord[] => {
    const route = parseDocsUrl(page.url);

    if (!route) {
      return [];
    }

    const title = page.title ?? route.slugSegments.at(-1) ?? page.url;
    const { contents, headings } = extractDocSearchContent(page.content);

    if (contents.length === 0 && page.description) {
      contents.push({ content: page.description, heading: undefined });
    }

    return [
      {
        _id: `docs:${page.url}`,
        breadcrumbs: route.slugSegments,
        description: page.description,
        extra_data: {
          locale: route.locale,
          objectType: 'docs',
          platform: inferPlatforms(page.url, page.content),
          product: inferProduct(route),
          tab: route.tab,
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

async function getOpenApiRecords() {
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
        {
          _id: `openapi:${url}`,
          breadcrumbs: [locale === 'zh-CN' ? 'API 参考' : 'API Reference'],
          extra_data: {
            locale,
            objectType: 'openapi',
            platform: inferPlatforms(url, content),
            product: lane.id,
            tab: lane.tab,
          },
          structured: {
            contents: chunkText(content, MAX_CHUNK_LENGTH).map((chunk) => ({
              content: chunk,
              heading: operation.operationId,
            })),
            headings: [
              {
                content: `${operation.method.toUpperCase()} ${operation.path}`,
                id: operation.operationId,
              },
            ],
          },
          title,
          url,
        } satisfies AlgoliaDocsRecord,
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

function inferProduct(route: { slugSegments: string[]; tab: string }) {
  return route.slugSegments[0] ?? route.tab;
}

function inferPlatforms(url: string, content: string) {
  const sourceText = `${url}\n${content}`.toLowerCase();
  const platforms = [
    'android',
    'ios',
    'web',
    'windows',
    'macos',
    'unity',
    'flutter',
    'react-native',
    'electron',
    'unreal',
  ];

  return platforms.filter((platform) => sourceText.includes(platform));
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
