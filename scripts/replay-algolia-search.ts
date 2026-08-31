import { writeFile } from 'node:fs/promises';
import { createAlgoliaDocsClient } from '../src/lib/search/algolia-client';
import { GLOBAL_GOLDEN_SEARCH_CASES } from '../src/lib/search/golden-search-queries';
import {
  type GoldenReplayResult,
  replayGoldenSearchCases,
} from '../src/lib/search/golden-search-replay';

const appId = process.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = process.env.VITE_ALGOLIA_SEARCH_API_KEY;
const indexName =
  process.env.VITE_ALGOLIA_INDEX_NAME ??
  process.env.ALGOLIA_INDEX_NAME ??
  'docs_portal_en';
const apiReferenceIndexName =
  process.env.VITE_ALGOLIA_API_REFERENCE_INDEX_NAME ?? 'agora_APIRefSearch';
const outputPath = process.argv
  .slice(2)
  .find((argument) => argument.startsWith('--out='))
  ?.slice('--out='.length);

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
);
const serializedReport = `${JSON.stringify(report, null, 2)}\n`;

if (outputPath) {
  await writeFile(outputPath, serializedReport, 'utf8');
}

console.log(
  `Global Algolia replay: ${report.passed}/${report.total} passed, ${report.failed} failed.`,
);
for (const result of report.cases.filter(({ passed }) => !passed)) {
  console.error(
    JSON.stringify({
      actualUrls: result.actualUrls,
      error: result.error,
      expectedUrl: result.expectedUrl,
      query: result.query,
    }),
  );
}

if (report.failed > 0) {
  process.exitCode = 1;
}
