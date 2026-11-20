import { redactSearchQuery } from '../analytics/measurement-privacy';
import { type CnSearchQuery, queryCnSearch } from './cn-search.server';
import type { CnSearchPageResponse } from './cn-search-page';
import { isCnSearchPlatform } from './cn-search-platforms';
import type { MeilisearchClientConfig } from './meilisearch-client';
import { parseSearchPageState } from './search-page-state';

const allowedParams = new Set([
  'q',
  'page',
  'type',
  'product',
  'platform',
  'version',
  'tab',
]);
const identifier = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function handleHealthRequest(
  env: Record<string, string | undefined> = process.env,
): Response {
  const revision = env.DOCS_RELEASE_REVISION;
  return Response.json(
    {
      status: 'ok',
      ...(revision && /^[a-f0-9]{40}$/.test(revision) ? { revision } : {}),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export function parseSearchApiQuery(params: URLSearchParams): CnSearchQuery {
  const input: Record<string, string> = {};
  for (const [key, value] of params) {
    if (!allowedParams.has(key) || key in input)
      throw new Error('Invalid search parameters');
    input[key] = value;
  }
  if (
    (input.q?.length ?? 0) > 500 ||
    (input.page !== undefined &&
      (!/^[1-9]\d{0,2}$/.test(input.page) || Number(input.page) > 500)) ||
    (input.type !== undefined &&
      !['all', 'docs', 'api', 'faq', 'openapi'].includes(input.type)) ||
    (input.product !== undefined && !identifier.test(input.product)) ||
    (input.tab !== undefined && !identifier.test(input.tab)) ||
    (input.platform !== undefined && !isCnSearchPlatform(input.platform)) ||
    (input.version !== undefined && !/^[\w.-]{1,80}$/.test(input.version))
  )
    throw new Error('Invalid search parameters');
  return { ...parseSearchPageState(input), tab: input.tab };
}

export function readSearchServiceConfig(
  env: Record<string, string | undefined> = process.env,
): MeilisearchClientConfig | null {
  const host = env.MEILI_HOST;
  const indexUid = env.MEILI_INDEX_UID;
  const searchOnlyKey = env.MEILI_SEARCH_API_KEY;
  if (!host || !indexUid || !searchOnlyKey || !/^[\w-]+$/.test(indexUid))
    return null;
  try {
    const url = new URL(host);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
  } catch {
    return null;
  }
  return { host, indexUid, searchOnlyKey };
}

// Optional tracing headers are untrusted and must never affect search behavior.
export function searchMeasurementHeaders(input: Headers) {
  const output: Record<string, string> = {};
  const uuid =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  for (const name of ['X-Docs-Search-Id', 'X-Docs-Request-Id']) {
    const value = input.get(name);
    if (value && uuid.test(value)) output[name] = value;
  }
  const purpose = input.get('X-Docs-Request-Purpose');
  if (purpose && ['results', 'facets', 'prefetch'].includes(purpose))
    output['X-Docs-Request-Purpose'] = purpose;
  return output;
}

export async function handleSearchRequest(request: Request): Promise<Response> {
  const started = Date.now();
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    ...searchMeasurementHeaders(request.headers),
  };
  headers['X-Docs-Request-Id'] ??= crypto.randomUUID();
  const configuredRevision = process.env.DOCS_SEARCH_INDEX_REVISION;
  // Deployment supplies the active index revision; the app SHA is not a substitute.
  const indexRevision =
    configuredRevision && /^[a-f0-9]{40}$/i.test(configuredRevision)
      ? configuredRevision
      : null;
  let query: CnSearchQuery | undefined;
  const complete = (status: number, result?: CnSearchPageResponse) => {
    if (query?.q) {
      try {
        console.info(
          JSON.stringify({
            event: 'docs_search_request_completed',
            event_id: crypto.randomUUID(),
            event_source: 'server',
            site_id: 'docs_portal',
            occurred_at: new Date().toISOString(),
            request_id: headers['X-Docs-Request-Id'],
            search_id: headers['X-Docs-Search-Id'] ?? null,
            request_purpose: headers['X-Docs-Request-Purpose'] ?? 'results',
            query_redacted: redactSearchQuery(query.q),
            filter_product: query.product ?? null,
            filter_platform: query.platform ?? null,
            filter_tab: query.tab ?? null,
            search_type: query.type,
            page: query.page,
            http_status: status,
            duration_ms: Date.now() - started,
            total_hits: result?.totalHits ?? null,
            server_group_count: result?.groups.length ?? null,
            index_revision: indexRevision,
            error_code: status === 200 ? null : 'search_unavailable',
          }),
        );
      } catch {
        // Diagnostic collection must not change the search response.
      }
    }
    return Response.json(
      result
        ? { ...result, indexRevision }
        : {
            error:
              status === 400
                ? 'Invalid search parameters'
                : 'Search service unavailable',
          },
      { status, headers },
    );
  };
  try {
    query = parseSearchApiQuery(new URL(request.url).searchParams);
  } catch {
    return complete(400);
  }
  const config = readSearchServiceConfig();
  if (!config) return complete(503);
  try {
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(10_000),
    ]);
    return complete(200, await queryCnSearch(config, query, signal));
  } catch {
    return complete(502);
  }
}
