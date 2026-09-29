import type { SearchHit } from './meilisearch-client';

export const demoSearchDocsIndexUid = 'cn-kb-demo-v1';
const maxQueryLength = 500;
const maxResults = 5;
const maxContentLength = 1200;

export type SearchDocsInput = {
  query: string;
  locale?: string;
  product?: string;
  platform?: string[];
  version?: string;
  audience?: 'developer' | 'customer-support';
};

export type SearchDocsResult = {
  id: string;
  title: string;
  content: string;
  url: string;
  headingPath: string[];
  score?: number;
};

export type SearchDocsOutput = {
  results: SearchDocsResult[];
};

export type SearchDocsTool = {
  searchDocs(input: SearchDocsInput): Promise<SearchDocsOutput>;
};

type SearchDocsToolConfig = {
  host: string;
  masterKey: string;
};

type SearchEngineHit = Pick<
  SearchHit,
  | 'id'
  | 'sourceId'
  | 'pageTitle'
  | 'sectionTitle'
  | 'content'
  | 'url'
  | 'headingPath'
  | 'locale'
  | 'docType'
  | 'audience'
  | 'status'
  | 'hidden'
> & {
  product?: string;
  platform?: string[];
  version?: string;
  _rankingScore?: number;
};

type SearchEngineResponse = {
  hits: SearchEngineHit[];
};

export function createSearchDocsTool({
  host,
  masterKey,
}: SearchDocsToolConfig): SearchDocsTool {
  if (!host || !masterKey) {
    throw new Error('search_docs requires server-side Meilisearch settings');
  }

  return {
    async searchDocs(input) {
      const normalized = validateInput(input);
      const filters = [
        'locale = "zh-CN"',
        'hidden = false',
        'status = "published"',
        ...(normalized.product
          ? [`product = ${quoteFilterValue(normalized.product)}`]
          : []),
        ...(normalized.platform ?? []).map(
          (platform) => `platform = ${quoteFilterValue(platform)}`,
        ),
        ...(normalized.version
          ? [`version = ${quoteFilterValue(normalized.version)}`]
          : []),
        ...(normalized.audience
          ? [`audience = ${quoteFilterValue(normalized.audience)}`]
          : []),
      ];

      let response: Response;
      try {
        response = await fetch(
          `${host.replace(/\/$/, '')}/indexes/${demoSearchDocsIndexUid}/search`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${masterKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: normalized.query,
              filter: filters.join(' AND '),
              limit: maxResults,
              attributesToRetrieve: [
                'id',
                'sourceId',
                'pageTitle',
                'sectionTitle',
                'content',
                'url',
                'headingPath',
                'locale',
                'product',
                'platform',
                'version',
                'docType',
                'audience',
                'status',
                'hidden',
              ],
              showRankingScore: true,
            }),
            signal: AbortSignal.timeout(10000),
          },
        );
      } catch {
        throw new Error('search service unavailable');
      }

      if (!response.ok) throw new Error('search service unavailable');

      let result: SearchEngineResponse;
      try {
        result = (await response.json()) as SearchEngineResponse;
      } catch {
        throw new Error('search service unavailable');
      }

      return {
        results: result.hits
          .filter(isPublicCnHit)
          .slice(0, maxResults)
          .map(toSearchDocsResult),
      };
    },
  };
}

function validateInput(input: SearchDocsInput): SearchDocsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('invalid search_docs input');
  }
  const query = typeof input.query === 'string' ? input.query.trim() : '';
  if (!query) throw new Error('query must not be empty');
  if (query.length > maxQueryLength) throw new Error('query is too long');
  if (input.locale && input.locale !== 'zh-CN') {
    throw new Error('search_docs only supports locale zh-CN');
  }
  if (input.platform !== undefined && !Array.isArray(input.platform)) {
    throw new Error('invalid platform filter');
  }

  return {
    query,
    locale: 'zh-CN',
    product: validateFilterValue(input.product, 'product'),
    platform: input.platform?.map((value) => {
      const normalized = validateFilterValue(value, 'platform');
      if (!normalized) throw new Error('invalid platform filter');
      return normalized;
    }),
    version: validateFilterValue(input.version, 'version'),
    audience: input.audience,
  };
}

function validateFilterValue(value: string | undefined, name: string) {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > 100 || /[\r\n]/.test(normalized)) {
    throw new Error(`invalid ${name} filter`);
  }
  return normalized;
}

function quoteFilterValue(value: string): string {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function isPublicCnHit(hit: SearchEngineHit): boolean {
  return (
    hit.locale === 'zh-CN' &&
    hit.status === 'published' &&
    hit.hidden === false &&
    (hit.docType === 'docs' || hit.docType === 'openapi')
  );
}

function toSearchDocsResult(hit: SearchEngineHit): SearchDocsResult {
  return {
    id: hit.id,
    title: stripSearchMarkup(hit.sectionTitle),
    content: stripSearchMarkup(hit.content).slice(0, maxContentLength),
    url: hit.url,
    headingPath: hit.headingPath,
    ...(hit._rankingScore === undefined ? {} : { score: hit._rankingScore }),
  };
}

function stripSearchMarkup(value: string): string {
  return value.replace(/<\/?(?:em|mark)>/gi, '');
}
