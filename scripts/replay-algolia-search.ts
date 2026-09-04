import { createAlgoliaDocsClient } from '../src/lib/search/algolia-client';
import { GLOBAL_GOLDEN_SEARCH_CASES } from '../src/lib/search/golden-search-queries';
import {
  type GoldenReplayResult,
  replayGoldenSearchCases,
} from '../src/lib/search/golden-search-replay';
import { parseReplayArguments } from './replay-algolia-search-arguments';
import { writeReplayReport } from './replay-algolia-search-report';

const appId = process.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = process.env.VITE_ALGOLIA_SEARCH_API_KEY;
const indexName =
  process.env.VITE_ALGOLIA_INDEX_NAME ??
  process.env.ALGOLIA_INDEX_NAME ??
  'docs_portal_en';
const apiReferenceIndexName =
  process.env.VITE_ALGOLIA_API_REFERENCE_INDEX_NAME ?? 'agora_APIRefSearch';
const { gateMode, outputPath } = parseReplayArguments(process.argv.slice(2));

if (!appId || !searchApiKey) {
  throw new Error(
    'VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_API_KEY are required for live search replay.',
  );
}

const client = createAlgoliaDocsClient({
  apiReferenceIndexName,
  appId,
  indexName,
  locale: 'en',
  rankingV2: true,
  searchApiKey,
});
const report = await replayGoldenSearchCases(
  GLOBAL_GOLDEN_SEARCH_CASES,
  async (query) =>
    (await client.search(query)) as unknown as GoldenReplayResult[],
  { gateMode },
);
process.exitCode = await writeReplayReport(report, outputPath);
