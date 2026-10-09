import { isKnownPlatform } from '../platforms/registry';
import { type CnSearchQuery, queryCnSearch } from './cn-search.server';
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
      !['all', 'docs', 'openapi'].includes(input.type)) ||
    (input.product !== undefined && !identifier.test(input.product)) ||
    (input.tab !== undefined && !identifier.test(input.tab)) ||
    (input.platform !== undefined && !isKnownPlatform(input.platform)) ||
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

export async function handleSearchRequest(request: Request): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  let query: CnSearchQuery;
  try {
    query = parseSearchApiQuery(new URL(request.url).searchParams);
  } catch {
    return Response.json(
      { error: 'Invalid search parameters' },
      { status: 400, headers },
    );
  }
  const config = readSearchServiceConfig();
  if (!config)
    return Response.json(
      { error: 'Search service unavailable' },
      { status: 503, headers },
    );
  try {
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(10_000),
    ]);
    return Response.json(await queryCnSearch(config, query, signal), {
      headers,
    });
  } catch {
    // Keep upstream URLs, credentials, and engine errors out of public responses.
    return Response.json(
      { error: 'Search service unavailable' },
      { status: 502, headers },
    );
  }
}
