import type { LoaderPlugin, Source } from 'fumadocs-core/source';
import type { Document } from 'fumadocs-openapi';
import {
  createOpenAPI,
  type OpenAPIPageData,
  openapiPlugin,
} from 'fumadocs-openapi/server';
import yaml from 'js-yaml';
import { type AppLocale } from '../i18n/i18n-config';
import {
  getOpenApiLaneLocales,
  getOpenApiLanes,
  type OpenApiLane,
} from './lanes';
import { getOpenApiSourceText } from './source-text.server';

type OpenApiStaticSource = Source<{
  metaData: {
    description?: string;
    title?: string;
  };
  pageData: OpenAPIPageData;
}>;

export async function createLocalizedOpenApiSource(): Promise<OpenApiStaticSource> {
  const sources = await Promise.all(
    getOpenApiLanes().flatMap((lane) =>
      getOpenApiLaneLocales(lane).map((locale) =>
        createLaneSource(lane, locale),
      ),
    ),
  );

  return {
    files: sources.flatMap((source) => source.files),
  };
}

export function getOpenApiLoaderPlugin(): LoaderPlugin {
  return openapiPlugin();
}

export function getOpenApiDocumentId(lane: OpenApiLane, locale: AppLocale) {
  return `${lane.id}-${locale}`;
}

async function createLaneSource(lane: OpenApiLane, locale: AppLocale) {
  const document = yaml.load(getOpenApiSourceText(lane, locale)) as Document;
  const documentId = getOpenApiDocumentId(lane, locale);
  const openapi = createOpenAPI({
    input: () => ({
      [documentId]: document,
    }),
  });

  return openapi.staticSource({
    baseDir: `${locale}/${lane.routePrefix}`,
    meta: false,
    name(output, dereferencedDocument) {
      if (output.type !== 'operation') {
        return output.info.title;
      }

      const operationId =
        dereferencedDocument.paths?.[output.item.path]?.[output.item.method]
          ?.operationId;
      const routeLeaf = operationId && lane.operations[operationId]?.routeLeaf;

      if (!routeLeaf) {
        throw new Error(
          `Unknown OpenAPI operation "${operationId ?? '(missing operationId)'}" for lane "${lane.id}"`,
        );
      }

      return routeLeaf;
    },
    per: 'operation',
  });
}
