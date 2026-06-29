import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { DocumentRecord } from 'fumadocs-core/search/algolia';
import yaml from 'js-yaml';
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
    const sections = splitMarkdownSections(page.content);
    const contents = sections.flatMap((section) =>
      chunkText(section.content, MAX_CHUNK_LENGTH).map((content) => ({
        content,
        heading: section.id,
      })),
    );

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
          headings: sections.flatMap((section) =>
            section.id && section.title
              ? [
                  {
                    content: section.title,
                    depth: section.depth,
                    id: section.id,
                  },
                ]
              : [],
          ),
        },
        title,
        url: page.url,
      },
    ];
  });
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

function splitMarkdownSections(markdown: string) {
  const sections: {
    content: string;
    depth: number;
    id?: string;
    title?: string;
  }[] = [];
  let current: {
    content: string[];
    depth: number;
    id?: string;
    title?: string;
  } | null = null;

  for (const line of markdown.split('\n')) {
    const heading = /^(#{2,4})\s+(.+)$/.exec(line);

    if (heading) {
      if (current?.content.join('\n').trim()) {
        sections.push({
          content: current.content.join('\n').trim(),
          depth: current.depth,
          id: current.id,
          title: current.title,
        });
      }

      const title = stripMarkdown(heading[2]);
      current = {
        content: [title],
        depth: heading[1].length,
        id: slugifyHeading(title),
        title,
      };
      continue;
    }

    if (!current) {
      current = { content: [], depth: 2 };
    }

    current.content.push(line);
  }

  if (current?.content.join('\n').trim()) {
    sections.push({
      content: current.content.join('\n').trim(),
      depth: current.depth,
      id: current.id,
      title: current.title,
    });
  }

  return sections;
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

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function stripMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}
