import type { LoaderPlugin, PageData, Source } from 'fumadocs-core/source';
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure';
import type { TOCItemType } from 'fumadocs-core/toc';
import { createElement, Fragment } from 'react';
import { type AppLocale, SUPPORTED_LOCALES } from '../i18n/i18n-config';
import { getOpenApiLanes, type OpenApiLane } from './lanes';
import { getOpenApiPayloadAssetPath } from './openapi-payload-path';
import { getOpenApiRouteManifestEntry } from './openapi-route-manifest.server';

type OpenApiStaticSource = Source<{
  metaData: {
    description?: string;
    title?: string;
  };
  pageData: OpenApiPageData;
}>;

type OpenApiMethod = Lowercase<
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE'
>;

type OpenApiPageData = {
  _openapi: {
    deprecated?: boolean;
    method?: OpenApiMethod;
    webhook: boolean;
  };
  deprecated?: boolean;
  description?: string;
  openApiPayloadAssetPath: string;
  openApiPayloadMeta: {
    document: string;
    operations: Array<{
      method: OpenApiMethod;
      path: string;
    }>;
    showDescription: true;
  };
  structuredData: StructuredData;
  title: string;
  toc: TOCItemType[];
};

type OpenApiStaticPageFile = {
  data: OpenApiPageData;
  path: string;
  type: 'page';
};

export async function createLocalizedOpenApiSource(): Promise<OpenApiStaticSource> {
  return {
    files: getOpenApiLanes().flatMap((lane) =>
      SUPPORTED_LOCALES.flatMap((locale) => createLanePageFiles(lane, locale)),
    ),
  };
}

export function getOpenApiLoaderPlugin(): LoaderPlugin {
  return {
    enforce: 'pre',
    name: 'fumadocs:openapi',
    transformPageTree: {
      file(node, filePath) {
        if (!filePath) {
          return node;
        }

        const file = this.storage.read(filePath);
        if (!file || file.format !== 'page') {
          return node;
        }

        const openApiData = (file.data as PageData & OpenApiPageData)._openapi;
        if (!openApiData || typeof openApiData !== 'object') {
          return node;
        }

        if (openApiData.deprecated) {
          node.name = createElement(
            'span',
            {
              className: 'fd-page-tree-item-name line-through',
            },
            node.name,
          );
        }

        if (openApiData.webhook) {
          node.name = createElement(Fragment, null, [
            node.name,
            ' ',
            createElement(
              'span',
              {
                className:
                  'ms-auto rounded-lg border border-current px-1 text-xs font-mono text-nowrap',
              },
              'Webhook',
            ),
          ]);
          return node;
        }

        if (openApiData.method) {
          node.name = createElement(Fragment, null, [
            node.name,
            ' ',
            createElement(
              'span',
              {
                className: `ms-auto text-xs text-nowrap font-mono font-medium ${getMethodLabelClassName(
                  openApiData.method,
                )}`,
              },
              openApiData.method.toUpperCase(),
            ),
          ]);
        }

        return node;
      },
    },
  };
}

export function getOpenApiDocumentId(lane: OpenApiLane, locale: AppLocale) {
  return `${lane.id}-${locale}`;
}

function createLanePageFiles(
  lane: OpenApiLane,
  locale: AppLocale,
): OpenApiStaticPageFile[] {
  const routeManifest = getOpenApiRouteManifestEntry(lane, locale);
  const documentId = getOpenApiDocumentId(lane, locale);

  return Object.entries(lane.operations).flatMap(([operationId, operation]) => {
    const resolvedOperation = routeManifest[operationId];

    if (!resolvedOperation) {
      throw new Error(
        `Unknown OpenAPI operation "${operationId}" for lane "${lane.id}"`,
      );
    }

    const method = normalizeOpenApiMethod(resolvedOperation.method);

    if (!method) {
      throw new Error(
        `Unsupported OpenAPI method "${resolvedOperation.method}" for lane "${lane.id}" operation "${operationId}"`,
      );
    }

    return [
      {
        data: {
          _openapi: {
            deprecated: resolvedOperation.deprecated === true,
            method,
            webhook: false,
          },
          ...(resolvedOperation.deprecated === true ? { deprecated: true } : {}),
          ...(resolvedOperation.description
            ? {
                description: resolvedOperation.description,
              }
            : {}),
          openApiPayloadAssetPath: getOpenApiPayloadAssetPath(
            lane,
            locale,
            operationId,
          ),
          openApiPayloadMeta: {
            document: documentId,
            operations: [
              {
                method,
                path: resolvedOperation.path,
              },
            ],
            showDescription: true,
          },
          structuredData: {
            contents: resolvedOperation.description
              ? [
                  {
                    content: resolvedOperation.description,
                    heading: '',
                  },
                ]
              : [],
            headings: [],
          },
          title: resolvedOperation.title,
          toc: [],
        },
        path: `${locale}/${lane.routePrefix}/${resolvedOperation.routeLeaf}.mdx`,
        type: 'page' as const,
      },
    ];
  });
}

function normalizeOpenApiMethod(methodName: string): OpenApiMethod | null {
  const method = methodName.toLowerCase();

  switch (method) {
    case 'delete':
    case 'get':
    case 'head':
    case 'options':
    case 'patch':
    case 'post':
    case 'put':
    case 'trace':
      return method;
    default:
      return null;
  }
}

function getMethodLabelClassName(method: OpenApiMethod) {
  switch (method) {
    case 'put':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'patch':
      return 'text-orange-600 dark:text-orange-400';
    case 'post':
      return 'text-blue-600 dark:text-blue-400';
    case 'delete':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-green-600 dark:text-green-400';
  }
}
