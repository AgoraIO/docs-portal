/**
 * PROTOTYPE: compare current page-level CN search with section-level records.
 * Delete the terminal shell after the experiment; keep only the learned data
 * contract and evaluation cases if the result is adopted.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { gzipSync } from 'node:zlib';
import { create, insertMultiple, search } from '@orama/orama';
import yaml from 'js-yaml';
// @ts-expect-error This throwaway entrypoint is executed by Node's strip-types loader.
import { addChineseApiAliases } from './aliases.ts';
// @ts-expect-error This throwaway entrypoint is executed by Node's strip-types loader.
import { GOLDEN_QUERIES, type GoldenQuery } from './golden-queries.ts';
// @ts-expect-error This throwaway entrypoint is executed by Node's strip-types loader.
import { compareMeili, createMeiliClient } from './meilisearch.ts';
import {
  buildCompactedSectionDocuments,
  buildPageDocuments,
  buildSectionDocuments,
  GENERIC_SECTION_TITLES,
  type SearchDocument,
  type SourcePage,
  // @ts-expect-error This throwaway entrypoint is executed by Node's strip-types loader.
} from './model.ts';

const ROOT = path.join(process.cwd(), 'content/docs/zh-CN');
const FULL_CORPUS = process.argv.includes('--full');
const BENCHMARK_MODE = process.argv.includes('--benchmark');
const MEILI_MODE = process.argv.includes('--meili');
const MEILI_SHAPE = process.env.CN_MEILI_SHAPE;
const RESULT_LIMIT = 5;
const startedAt = nowMs();

type SearchHit = {
  document: SearchDocument;
  score: number;
};

type SearchState = {
  compactHits: SearchHit[];
  aliasHits: SearchHit[];
  fuzzyHits: SearchHit[];
  goldenIndex: number;
  pageHits: SearchHit[];
  query: string;
  sectionHits: SearchHit[];
};

console.log('Loading real CN documents and building two in-memory indexes…');
const loadStartedAt = nowMs();
const pages = await loadCorpus();
const loadDurationMs = nowMs() - loadStartedAt;
const pageDocumentsStartedAt = nowMs();
const pageDocuments = buildPageDocuments(pages);
const pageDocumentsDurationMs = nowMs() - pageDocumentsStartedAt;
const sectionDocumentsStartedAt = nowMs();
const sectionDocuments = buildSectionDocuments(pages);
const sectionDocumentsDurationMs = nowMs() - sectionDocumentsStartedAt;
const compactDocumentsStartedAt = nowMs();
const compactDocuments = buildCompactedSectionDocuments(pages);
const compactDocumentsDurationMs = nowMs() - compactDocumentsStartedAt;
const memoryAfterDocuments = process.memoryUsage().heapUsed;
const pageIndexStartedAt = nowMs();
const pageIndex = await createIndex(pageDocuments);
const pageIndexDurationMs = nowMs() - pageIndexStartedAt;
const memoryAfterPageIndex = process.memoryUsage().heapUsed;
const sectionIndexStartedAt = nowMs();
const sectionIndex = await createIndex(sectionDocuments);
const sectionIndexDurationMs = nowMs() - sectionIndexStartedAt;
const memoryAfterSectionIndex = process.memoryUsage().heapUsed;
const compactIndexStartedAt = nowMs();
const compactIndex = await createIndex(compactDocuments);
const compactIndexDurationMs = nowMs() - compactIndexStartedAt;
const aliasDocuments = addChineseApiAliases(compactDocuments);
const aliasRecordCount = aliasDocuments.filter(
  (document) => document.aliases,
).length;
const aliasIndexStartedAt = nowMs();
const aliasIndex = await createIndex(aliasDocuments);
const aliasIndexDurationMs = nowMs() - aliasIndexStartedAt;
const memoryAfterCompactIndex = process.memoryUsage().heapUsed;
const setupDurationMs = nowMs() - startedAt;

if (BENCHMARK_MODE) {
  await printBenchmarkReport();
  process.exit(0);
}

if (MEILI_MODE) {
  await printMeiliReport();
  process.exit(0);
}

if (process.argv.includes('--golden')) {
  await printGoldenReport();
  process.exit(0);
}

const state: SearchState = {
  compactHits: [],
  aliasHits: [],
  fuzzyHits: [],
  goldenIndex: 0,
  pageHits: [],
  query: '',
  sectionHits: [],
};
const terminal = createInterface({
  input: process.stdin,
  output: process.stdout,
});

render();
prompt();

function prompt() {
  terminal.question('search> ', async (input) => {
    const command = input.trim();

    if (command === '/q') {
      terminal.close();
      return;
    }
    if (command === '/next') {
      state.goldenIndex = (state.goldenIndex + 1) % GOLDEN_QUERIES.length;
      await runQuery(GOLDEN_QUERIES[state.goldenIndex].query);
    } else if (command === '/golden') {
      console.clear();
      await printGoldenReport();
      console.log('\nPress Enter to return.');
      await onceLine();
      render();
    } else if (command) {
      await runQuery(command);
    } else {
      render();
    }

    prompt();
  });
}

async function runQuery(query: string) {
  state.query = query;
  [
    state.pageHits,
    state.sectionHits,
    state.compactHits,
    state.fuzzyHits,
    state.aliasHits,
  ] = await Promise.all([
    searchIndex(pageIndex, query),
    searchIndex(sectionIndex, query),
    searchIndex(compactIndex, query),
    searchIndex(compactIndex, query, 1),
    searchIndex(aliasIndex, query, undefined, ['aliases']),
  ]);
  render();
}

function render() {
  console.clear();
  console.log('\x1b[1mCN search granularity prototype\x1b[0m');
  console.log(
    `\x1b[2mCorpus: ${pages.length} pages (${FULL_CORPUS ? 'full' : 'focused sample'}) · ` +
      `${pageDocuments.length} page records · ${sectionDocuments.length} section records · ` +
      `${compactDocuments.length} compact records · ` +
      `built in ${(setupDurationMs / 1000).toFixed(1)}s\x1b[0m`,
  );
  console.log(`\n\x1b[1mQuery\x1b[0m ${state.query || '(none yet)'}`);
  printHits('A · Current shape: one record per page', state.pageHits);
  printHits('B · Every heading becomes a section', state.sectionHits);
  printHits(
    'C · Generic/short subsections merged into parents',
    state.compactHits,
  );
  printHits('D · Compact sections with typo tolerance = 1', state.fuzzyHits);
  printHits(
    'E · Compact sections with curated Chinese API aliases',
    state.aliasHits,
  );
  console.log('\n\x1b[1mCommands\x1b[0m  type a query  /next  /golden  /q');
}

function printHits(title: string, hits: SearchHit[]) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
  if (hits.length === 0) {
    console.log('  —');
    return;
  }

  for (const [index, hit] of hits.entries()) {
    console.log(
      `  ${index + 1}. ${hit.document.title} \x1b[2m(${hit.score.toFixed(2)})\x1b[0m`,
    );
    console.log(`     \x1b[2m${hit.document.url}\x1b[0m`);
  }
}

async function printGoldenReport() {
  let pageTop3 = 0;
  let candidateTop1 = 0;
  let candidateTop3 = 0;
  let compactTop1 = 0;
  let compactTop3 = 0;
  let fuzzyCount = 0;
  let fuzzyTop1 = 0;
  let aliasTop1 = 0;
  const groups = new Map<
    GoldenQuery['type'],
    {
      candidateTop1: number;
      compactTop1: number;
      count: number;
      fuzzyTop1: number;
      pageTop3: number;
    }
  >();

  console.log('\x1b[1mGolden query comparison\x1b[0m');
  console.log(
    `Corpus: ${pages.length} pages · ${pageDocuments.length} page records · ` +
      `${sectionDocuments.length} section records · ` +
      `${compactDocuments.length} compact records · ${aliasRecordCount} alias records · built in ` +
      `${(setupDurationMs / 1000).toFixed(1)}s\n`,
  );
  console.log(
    'query\ttype\tpage@3\tall-sections@1\tcompact@1\tcompact@3\tfuzzy@1',
  );

  for (const golden of GOLDEN_QUERIES) {
    const [pageHits, sectionHits, compactHits, fuzzyHits, aliasHits] =
      await Promise.all([
        searchIndex(pageIndex, golden.query),
        searchIndex(sectionIndex, golden.query),
        searchIndex(compactIndex, golden.query),
        golden.type === 'typo'
          ? searchIndex(compactIndex, golden.query, 1)
          : Promise.resolve([]),
        searchIndex(aliasIndex, golden.query, undefined, ['aliases']),
      ]);
    const pageMatched = pageHits
      .slice(0, 3)
      .some((hit) => matchesBaseUrl(hit.document.url, golden));
    const candidateMatchedTop1 = sectionHits
      .slice(0, 1)
      .some((hit) => matchesCandidate(hit.document.url, golden));
    const candidateMatchedTop3 = sectionHits
      .slice(0, 3)
      .some((hit) => matchesCandidate(hit.document.url, golden));
    const compactMatchedTop1 = compactHits
      .slice(0, 1)
      .some((hit) => matchesCandidate(hit.document.url, golden));
    const compactMatchedTop3 = compactHits
      .slice(0, 3)
      .some((hit) => matchesCandidate(hit.document.url, golden));
    const fuzzyMatchedTop1 =
      golden.type === 'typo' &&
      fuzzyHits
        .slice(0, 1)
        .some((hit) => matchesCandidate(hit.document.url, golden));
    const aliasMatchedTop1 = aliasHits
      .slice(0, 1)
      .some((hit) => matchesCandidate(hit.document.url, golden));

    pageTop3 += Number(pageMatched);
    candidateTop1 += Number(candidateMatchedTop1);
    candidateTop3 += Number(candidateMatchedTop3);
    compactTop1 += Number(compactMatchedTop1);
    compactTop3 += Number(compactMatchedTop3);
    fuzzyCount += Number(golden.type === 'typo');
    fuzzyTop1 += Number(fuzzyMatchedTop1);
    aliasTop1 += Number(
      golden.type === 'chinese-api-intent' && aliasMatchedTop1,
    );
    const group = groups.get(golden.type) ?? {
      candidateTop1: 0,
      compactTop1: 0,
      count: 0,
      fuzzyTop1: 0,
      pageTop3: 0,
    };
    group.count += 1;
    group.pageTop3 += Number(pageMatched);
    group.candidateTop1 += Number(candidateMatchedTop1);
    group.compactTop1 += Number(compactMatchedTop1);
    group.fuzzyTop1 += Number(fuzzyMatchedTop1);
    groups.set(golden.type, group);
    console.log(
      [
        golden.query,
        golden.type,
        mark(pageMatched),
        mark(candidateMatchedTop1),
        mark(compactMatchedTop1),
        mark(compactMatchedTop3),
        golden.type === 'typo' ? mark(fuzzyMatchedTop1) : 'n/a',
        golden.type === 'chinese-api-intent' ? mark(aliasMatchedTop1) : 'n/a',
      ].join('\t'),
    );
  }

  console.log(
    `\nPage target@3: ${pageTop3}/${GOLDEN_QUERIES.length}` +
      ` · Candidate target@1: ${candidateTop1}/${GOLDEN_QUERIES.length}` +
      ` · Candidate target@3: ${candidateTop3}/${GOLDEN_QUERIES.length}` +
      ` · Compact target@1: ${compactTop1}/${GOLDEN_QUERIES.length}` +
      ` · Compact target@3: ${compactTop3}/${GOLDEN_QUERIES.length}` +
      ` · Fuzzy typo target@1: ${fuzzyTop1}/${fuzzyCount}` +
      ` · Alias target@1 (Chinese intent): ${aliasTop1}/` +
      `${GOLDEN_QUERIES.filter((item) => item.type === 'chinese-api-intent').length}`,
  );
  console.log('\nBy query group:');
  for (const [type, group] of groups) {
    const fuzzySummary =
      type === 'typo' ? ` · fuzzy@1 ${group.fuzzyTop1}/${group.count}` : '';
    console.log(
      `  ${type}: page@3 ${group.pageTop3}/${group.count}` +
        ` · all-sections@1 ${group.candidateTop1}/${group.count}` +
        ` · compact@1 ${group.compactTop1}/${group.count}${fuzzySummary}`,
    );
  }
}

async function printBenchmarkReport() {
  console.log('\n\x1b[1mCN section-index benchmark\x1b[0m');
  console.log(
    'This is a Node prototype measurement, not a browser production benchmark.\n',
  );

  const pagePayload = measurePayload(pageDocuments);
  const sectionPayload = measurePayload(sectionDocuments);
  const compactPayload = measurePayload(compactDocuments);
  const quality = analyzeSectionQuality(sectionDocuments);
  const compactQuality = analyzeSectionQuality(compactDocuments);
  const pageLatency = await measureSearchLatency(
    pageIndex,
    GOLDEN_QUERIES.map((item) => item.query),
  );
  const sectionLatency = await measureSearchLatency(
    sectionIndex,
    GOLDEN_QUERIES.map((item) => item.query),
  );
  const compactLatency = await measureSearchLatency(
    compactIndex,
    GOLDEN_QUERIES.map((item) => item.query),
  );
  const fuzzyLatency = await measureSearchLatency(
    compactIndex,
    GOLDEN_QUERIES.filter((item) => item.type === 'typo').map(
      (item) => item.query,
    ),
    1,
  );
  const aliasLatency = await measureSearchLatency(
    aliasIndex,
    GOLDEN_QUERIES.filter((item) => item.type === 'chinese-api-intent').map(
      (item) => item.query,
    ),
  );

  console.log('\x1b[1mPipeline time\x1b[0m');
  printMetric('Read and canonicalize pages', loadDurationMs, 'ms');
  printMetric('Build page records', pageDocumentsDurationMs, 'ms');
  printMetric('Build section records', sectionDocumentsDurationMs, 'ms');
  printMetric('Build compact records', compactDocumentsDurationMs, 'ms');
  printMetric('Build page Orama index', pageIndexDurationMs, 'ms');
  printMetric('Build section Orama index', sectionIndexDurationMs, 'ms');
  printMetric('Build compact Orama index', compactIndexDurationMs, 'ms');
  printMetric('Build alias Orama index', aliasIndexDurationMs, 'ms');
  printMetric('Total setup', setupDurationMs, 'ms');

  console.log('\n\x1b[1mCorpus and payload\x1b[0m');
  printMetric('Canonical pages', pages.length);
  printMetric('Page records', pageDocuments.length);
  printMetric('Section records', sectionDocuments.length);
  printMetric('Compact records', compactDocuments.length);
  printMetric('Page JSON', pagePayload.rawBytes, 'bytes');
  printMetric('Page JSON gzip', pagePayload.gzipBytes, 'bytes');
  printMetric('Section JSON', sectionPayload.rawBytes, 'bytes');
  printMetric('Section JSON gzip', sectionPayload.gzipBytes, 'bytes');
  printMetric('Compact JSON', compactPayload.rawBytes, 'bytes');
  printMetric('Compact JSON gzip', compactPayload.gzipBytes, 'bytes');

  console.log('\n\x1b[1mObserved Node heap\x1b[0m');
  printMetric('After document extraction', memoryAfterDocuments, 'bytes');
  printMetric('After page index', memoryAfterPageIndex, 'bytes');
  printMetric('After section index', memoryAfterSectionIndex, 'bytes');
  printMetric('After compact index', memoryAfterCompactIndex, 'bytes');

  printSectionQuality('All-heading section quality', quality);
  printSectionQuality('Compacted section quality', compactQuality);

  console.log('\n\x1b[1mSearch latency over Golden Queries\x1b[0m');
  printLatency('Page index', pageLatency);
  printLatency('Section index', sectionLatency);
  printLatency('Compact section index', compactLatency);
  printLatency('Compact typo fallback', fuzzyLatency);
  printLatency('Alias query search', aliasLatency);

  console.log('\n');
  await printGoldenReport();
}

async function printMeiliReport() {
  console.log('\n\x1b[1mMeilisearch comparison\x1b[0m');
  if (MEILI_SHAPE === 'page') {
    await printSingleMeiliReport('Page', pageDocuments);
    return;
  }
  if (MEILI_SHAPE === 'compact') {
    await printSingleMeiliReport('Compact section', compactDocuments);
    return;
  }
  console.log('Page and compact section indexes use the same settings.\n');
  const pageClient = await createMeiliClient(pageDocuments);
  const client = await createMeiliClient(compactDocuments);
  const aliasClient = await createMeiliClient(aliasDocuments);
  const pageResult = await compareMeili(
    pageClient,
    pageDocuments,
    GOLDEN_QUERIES,
  );
  const result = await compareMeili(client, compactDocuments, GOLDEN_QUERIES);
  const pageWarmLatency = await measureMeiliLatency(
    pageClient,
    pageDocuments,
    GOLDEN_QUERIES.map((item) => item.query),
  );
  const compactWarmLatency = await measureMeiliLatency(
    client,
    compactDocuments,
    GOLDEN_QUERIES.map((item) => item.query),
  );
  const [pageStats, compactStats] = await Promise.all([
    pageClient.stats(),
    client.stats(),
  ]);
  const byType = new Map<string, { count: number; hits: number }>();

  for (const row of result.rows) {
    const group = byType.get(row.type) ?? { count: 0, hits: 0 };
    group.count += 1;
    group.hits += Number(row.target);
    byType.set(row.type, group);
  }

  console.log('\x1b[1mIndex build comparison\x1b[0m');
  printMetric('Page documents uploaded', pageDocuments.length);
  printMetric('Page build total', pageClient.metrics.totalMs, 'ms');
  printMetric(
    'Page document upload',
    pageClient.metrics.documentUploadMs,
    'ms',
  );
  printMetric('Compact documents uploaded', compactDocuments.length);
  printMetric('Compact build total', client.metrics.totalMs, 'ms');
  printMetric('Compact document upload', client.metrics.documentUploadMs, 'ms');
  printMetric('Alias documents uploaded', aliasDocuments.length);
  printMetric(
    'Meilisearch alias build total',
    aliasClient.metrics.totalMs,
    'ms',
  );
  console.log(`  Index UID                     ${client.indexUid}`);
  printMetric(
    'Golden Query target Top 1',
    result.rows.filter((row) => row.target).length,
  );
  printMetric('Golden Query count', result.rows.length);
  printLatency('Page HTTP search', summarizeNumbers(pageResult.latency));
  printLatency('Compact HTTP search', summarizeNumbers(result.latency));
  printLatency('Page warm search (5x)', pageWarmLatency);
  printLatency('Compact warm search (5x)', compactWarmLatency);
  printMetric(
    'Page indexed documents',
    Number(pageStats.numberOfDocuments ?? pageDocuments.length),
  );
  printMetric(
    'Compact indexed documents',
    Number(compactStats.numberOfDocuments ?? compactDocuments.length),
  );
  console.log('\nBy query group:');
  for (const [type, group] of byType) {
    console.log(`  ${type}: ${group.hits}/${group.count}`);
  }
  const latency = summarizeNumbers(result.latency);
  printLatency('Meilisearch HTTP search', latency);
  console.log('\nResults:');
  for (const row of result.rows) {
    console.log(`  ${row.target ? 'yes' : 'no'}\t${row.type}\t${row.query}`);
  }
  const aliasResult = await compareMeili(
    aliasClient,
    aliasDocuments,
    GOLDEN_QUERIES.filter((item) => item.type === 'chinese-api-intent'),
  );
  printMetric(
    'Meilisearch alias target Top 1',
    aliasResult.rows.filter((row) => row.target).length,
  );
  printMetric('Meilisearch alias query count', aliasResult.rows.length);
}

async function printSingleMeiliReport(
  label: string,
  documents: SearchDocument[],
) {
  console.log(`${label} index only; use a fresh Meilisearch data directory.\n`);
  const client = await createMeiliClient(documents);
  const result = await compareMeili(client, documents, GOLDEN_QUERIES);
  const stats = await client.stats();
  const updateDocuments = buildIncrementalUpdate(documents);
  const updateStartedAt = nowMs();
  await client.update(updateDocuments);
  const updateMs = nowMs() - updateStartedAt;
  printMetric('Documents uploaded', documents.length);
  printMetric('Index setup total', client.metrics.totalMs, 'ms');
  printMetric('Document upload', client.metrics.documentUploadMs, 'ms');
  printMetric(
    'Indexed documents',
    Number(stats.numberOfDocuments ?? documents.length),
  );
  printMetric('Documents in one page update', updateDocuments.length);
  printMetric('One-page update', updateMs, 'ms');
  printLatency('HTTP search', summarizeNumbers(result.latency));
}

function buildIncrementalUpdate(documents: SearchDocument[]) {
  const pageUrl = documents[0]?.url.split('#')[0];
  return documents
    .filter((document) => document.url.split('#')[0] === pageUrl)
    .map((document) => ({
      ...document,
      content: `${document.content}\n[prototype incremental update]`,
    }));
}

async function measureMeiliLatency(
  client: Awaited<ReturnType<typeof createMeiliClient>>,
  documents: SearchDocument[],
  queries: string[],
) {
  for (const query of queries) {
    await client.search(documents, query);
  }

  const durations: number[] = [];
  for (let repeat = 0; repeat < 5; repeat += 1) {
    for (const query of queries) {
      const startedAt = nowMs();
      await client.search(documents, query);
      durations.push(nowMs() - startedAt);
    }
  }
  return summarizeNumbers(durations);
}

function measurePayload(documents: SearchDocument[]) {
  const json = JSON.stringify(documents);
  return {
    gzipBytes: gzipSync(json).byteLength,
    rawBytes: Buffer.byteLength(json),
  };
}

function analyzeSectionQuality(documents: SearchDocument[]) {
  const titleCounts = new Map<string, number>();
  const sectionsByPage = new Map<string, number>();

  for (const document of documents) {
    titleCounts.set(
      document.sectionTitle,
      (titleCounts.get(document.sectionTitle) ?? 0) + 1,
    );
    const pageUrl = document.url.split('#')[0];
    sectionsByPage.set(pageUrl, (sectionsByPage.get(pageUrl) ?? 0) + 1);
  }

  const contentLengths = documents.map((document) => document.content.length);
  return {
    contentLength: summarizeNumbers(contentLengths),
    emptyContent: contentLengths.filter((length) => length === 0).length,
    genericTitles: documents.filter((document) =>
      GENERIC_SECTION_TITLES.has(document.sectionTitle.trim()),
    ).length,
    repeatedTitles: [...titleCounts]
      .map(([title, count]) => ({ count, title }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
    sectionsPerPage: summarizeNumbers([...sectionsByPage.values()]),
    short40: contentLengths.filter((length) => length <= 40).length,
    short120: contentLengths.filter((length) => length <= 120).length,
    withoutAnchor: documents.filter((document) => !document.url.includes('#'))
      .length,
  };
}

function printSectionQuality(
  label: string,
  quality: ReturnType<typeof analyzeSectionQuality>,
) {
  console.log(`\n\x1b[1m${label}\x1b[0m`);
  printMetric('No #anchor', quality.withoutAnchor);
  printMetric('Empty content', quality.emptyContent);
  printMetric('Content <= 40 chars', quality.short40);
  printMetric('Content <= 120 chars', quality.short120);
  printMetric('Generic titles', quality.genericTitles);
  printMetric('Median content chars', quality.contentLength.p50);
  printMetric('P95 content chars', quality.contentLength.p95);
  printMetric('Median sections/page', quality.sectionsPerPage.p50);
  printMetric('P95 sections/page', quality.sectionsPerPage.p95);
  console.log('  Most repeated section titles:');
  for (const item of quality.repeatedTitles) {
    console.log(`    ${item.title || '(page root)'}: ${item.count}`);
  }
}

async function measureSearchLatency(
  database: Awaited<ReturnType<typeof createIndex>>,
  queries: string[],
  tolerance?: number,
) {
  const durations: number[] = [];
  for (const query of queries) {
    const start = nowMs();
    await searchIndex(database, query, tolerance);
    durations.push(nowMs() - start);
  }
  return summarizeNumbers(durations);
}

function summarizeNumbers(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    max: sorted.at(-1) ?? 0,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
  };
}

function percentile(sorted: number[], percentileValue: number) {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * percentileValue),
  );
  return sorted[index];
}

function printMetric(label: string, value: number, unit?: 'bytes' | 'ms') {
  const formatted =
    unit === 'bytes'
      ? formatBytes(value)
      : unit === 'ms'
        ? `${value.toFixed(1)} ms`
        : new Intl.NumberFormat('en-US').format(Math.round(value));
  console.log(`  ${label.padEnd(30)} ${formatted}`);
}

function printLatency(
  label: string,
  latency: { max: number; p50: number; p95: number },
) {
  console.log(
    `  ${label.padEnd(30)} p50 ${latency.p50.toFixed(2)} ms · ` +
      `p95 ${latency.p95.toFixed(2)} ms · max ${latency.max.toFixed(2)} ms`,
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

function nowMs() {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function matchesBaseUrl(url: string, golden: GoldenQuery) {
  const baseUrl = url.split('#')[0];
  return golden.expectedBaseUrls.includes(baseUrl);
}

function matchesCandidate(url: string, golden: GoldenQuery) {
  const [baseUrl, anchor = ''] = url.split('#');
  if (!golden.expectedBaseUrls.includes(baseUrl)) {
    return false;
  }
  return (
    golden.target === 'page' ||
    golden.expectedAnchors.includes(anchor.toLowerCase())
  );
}

function mark(value: boolean) {
  return value ? 'yes' : 'no';
}

async function createIndex(documents: SearchDocument[]) {
  const database = create({
    components: { tokenizer: createDocsTokenizer() },
    schema: {
      content: 'string',
      aliases: 'string',
      docType: 'enum',
      headingLevel: 'number',
      hidden: 'boolean',
      id: 'string',
      kind: 'enum',
      locale: 'enum',
      pageTitle: 'string',
      platform: 'enum[]',
      product: 'enum',
      sectionTitle: 'string',
      title: 'string',
      url: 'string',
      version: 'enum',
    },
  });
  await insertMultiple(database, documents);
  return database;
}

async function searchIndex(
  database: Awaited<ReturnType<typeof createIndex>>,
  query: string,
  tolerance?: number,
  properties: SearchProperty[] = [
    'aliases',
    'title',
    'pageTitle',
    'content',
    'url',
  ],
): Promise<SearchHit[]> {
  const result = await search(database, {
    boost: { aliases: 20, content: 1, pageTitle: 2, title: 6 },
    limit: RESULT_LIMIT,
    properties,
    term: query,
    tolerance,
    where: { hidden: false },
  });

  return result.hits.map((hit) => ({
    document: hit.document as SearchDocument,
    score: hit.score,
  }));
}

type SearchProperty = 'aliases' | 'content' | 'pageTitle' | 'title' | 'url';

async function loadCorpus(): Promise<SourcePage[]> {
  const files = (await scanDocsFiles(ROOT)).sort();
  const selected = FULL_CORPUS ? files : selectFocusedSample(files);
  const loaded = await Promise.all(selected.map(loadPage));

  // The source tree contains a small number of .md/.mdx pairs that resolve to
  // the same public route. Production search canonicalizes them before
  // indexing; keep the same uniqueness boundary here.
  return [...new Map(loaded.map((page) => [page.url, page])).values()];
}

function selectFocusedSample(files: string[]) {
  const focused = files.filter(
    (file) =>
      file.includes('/api-reference/conversational-ai/') ||
      file.includes('/ai/') ||
      file.includes('/realtime-media/cloud-recording/') ||
      file.endsWith(
        '/realtime-media/rtc/build/initialize-and-channel/join-leave-channel.mdx',
      ) ||
      (/\/api-reference\/rtc\/.+\/channel\.mdx$/.test(file) &&
        !file.includes('/legacy/')),
  );
  const focusedSet = new Set(focused);
  const noise = files.filter((file) => !focusedSet.has(file));
  const stride = Math.max(1, Math.floor(noise.length / 200));
  const sampledNoise = noise
    .filter((_, index) => index % stride === 0)
    .slice(0, 200);

  return [...new Set([...focused, ...sampledNoise])].sort();
}

async function loadPage(file: string): Promise<SourcePage> {
  const raw = await readFile(file, 'utf8');
  const { content, data } = parseFrontmatter(raw);
  const relative = path.relative(ROOT, file);
  const routeParts = relative
    .replace(/\.(md|mdx)$/, '')
    .split(path.sep)
    .filter(Boolean);
  if (routeParts.at(-1) === 'index') {
    routeParts.pop();
  }
  const url = `/zh-CN/${routeParts.join('/')}`;

  return {
    content,
    description:
      typeof data.description === 'string' ? data.description : undefined,
    hidden: data.hidden === true || data.draft === true,
    locale: 'zh-CN',
    title:
      typeof data.title === 'string'
        ? data.title
        : routeParts.at(-1) || 'Untitled',
    url,
  };
}

async function scanDocsFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return scanDocsFiles(entryPath);
      }
      return entry.isFile() && /\.(md|mdx)$/.test(entry.name)
        ? [entryPath]
        : [];
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

function createDocsTokenizer() {
  return {
    language: 'docs',
    normalizationCache: new Map<string, string>(),
    tokenize(raw: string) {
      const normalized = raw.normalize('NFKC').toLowerCase();
      const sourceTokens =
        normalized.match(/[\p{Script=Han}]+|[\p{Letter}\p{Number}_-]+/gu) ?? [];
      const tokens = new Set<string>();

      for (const sourceToken of sourceTokens) {
        tokens.add(sourceToken);
        if (!/\p{Script=Han}/u.test(sourceToken)) {
          continue;
        }
        const characters = Array.from(sourceToken);
        for (const character of characters) {
          tokens.add(character);
        }
        for (let index = 0; index < characters.length - 1; index += 1) {
          tokens.add(`${characters[index]}${characters[index + 1]}`);
        }
      }

      return [...tokens];
    },
  };
}

function onceLine() {
  return new Promise<void>((resolve) => terminal.once('line', () => resolve()));
}
