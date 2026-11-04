import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { compareQuality, pageRank } from './top-query-quality.mjs';

const { values } = parseArgs({ options: {
  cases: { type: 'string', default: 'scripts/search/fixtures/cn-top-queries-20261029.json' },
  candidate: { type: 'string', default: 'https://docs-portal-staging.sh3.agoralab.co' },
  legacy: { type: 'string', default: 'https://docportal.shengwang.cn' },
  baseline: { type: 'string' },
  out: { type: 'string', default: '.agent/artifacts/cn-search-top-20261029' },
} });
const fixtureText = await readFile(values.cases, 'utf8');
const fixture = JSON.parse(fixtureText);
const datasetDigest = createHash('sha256').update(fixtureText).digest('hex');
if (!fixture.cases.length || new Set(fixture.cases.map(item => item.id)).size !== fixture.cases.length)
  throw new Error('Cases must be nonempty and have unique IDs');
const saved = values.baseline ? JSON.parse(await readFile(values.baseline, 'utf8')) : null;
if (saved && saved.datasetDigest !== datasetDigest) throw new Error('Baseline dataset changed; review cases before replacing the baseline');
if (saved && (!Array.isArray(saved.candidate) || saved.candidate.length !== fixture.cases.length ||
  new Set(saved.candidate.map(item => item.id)).size !== fixture.cases.length ||
  fixture.cases.some(item => !saved.candidate.some(row => row.id === item.id))))
  throw new Error('Baseline must contain every fixture case exactly once');
const origin = value => {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('Search origin must be an HTTP(S) origin without credentials');
  return url.origin;
};
const candidateOrigin = origin(values.candidate);
const legacyOrigin = origin(values.legacy);
await mkdir(values.out, { recursive: true });

async function jsonRequest(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function family(url) {
  if (url.startsWith('/reference/faq/')) return 'faq';
  return url.startsWith('/api-reference/') ? 'api' : 'docs';
}

function legacyUrl(hit, kind) {
  // REST endpoint hits have a leading slash and link under /doc, even though
  // they are in api_docs. SDK API hits are relative and link under /api-ref.
  if (/^\/(doc|api-ref|faq)\//.test(hit.path)) return hit.path.split('#')[0];
  const root = kind === 'api_docs' && !hit.path.startsWith('/') ? '/api-ref/' : kind === 'faq' ? '/faq/' : '/doc/';
  return root + hit.path.replace(/^\//, '').split('#')[0];
}

async function runLegacy(item) {
  const filters = [
    (item.legacyProduct ? [item.legacyProduct] : fixture.legacyUi.products).map(value => `product = ${value}`),
    (item.legacyPlatform ? [item.legacyPlatform] : fixture.legacyUi.platforms).map(value => `platform = ${value}`),
  ];
  const data = await jsonRequest(`${legacyOrigin}/api/open-api/muti-search`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ types: ['docs', 'api_docs', 'faq'], q: item.q, page: 1, hitsPerPage: 20, filter: filters, sort: fixture.legacyUi.sort }),
  });
  const hits = {};
  for (const [kind, key] of [['docs', 'docs'], ['api_docs', 'api'], ['faq', 'faq']]) {
    if (!Array.isArray(data[kind]?.hits) || !Number.isSafeInteger(data[kind]?.totalHits)) throw new Error('Invalid legacy response');
    hits[key] = data[kind].hits.map(hit => ({
      url: legacyUrl(hit, kind),
      title: [hit.groupName, hit.name, hit.lvl0_sidebar, hit.lvl1_sidebar, hit.lvl2_sidebar, hit.lvl0_heading, hit.lvl1_heading, hit.title].filter(Boolean).join(' > '),
      platform: hit.platform,
    }));
  }
  return {
    status: 'ok',
    totalHits: Object.values(data).reduce((sum, part) => sum + part.totalHits, 0),
    hits,
    // The production overview displays five section results per family.
    rank: item.legacyTargets.length ? pageRank(hits[item.legacyFamily].slice(0, 5), item.legacyTargets) : null,
    diagnosticRank: item.legacyTargets.length ? pageRank(hits[item.legacyFamily], item.legacyTargets) : null,
    familyCounts: Object.fromEntries(Object.entries(hits).map(([key, list]) => [key, list.length])),
    raw: data,
  };
}

async function runCandidate(item, unscoped = false) {
  const params = new URLSearchParams({ q: item.q, type: 'all', page: '1' });
  if (!unscoped && item.product) params.set('product', item.product);
  if (!unscoped && item.platform) params.set('platform', item.platform);
  const data = await jsonRequest(`${candidateOrigin}/api/search?${params}`);
  if (!Array.isArray(data.groups) || !Number.isSafeInteger(data.totalHits) || data.groups.some(group => !Array.isArray(group.sections)))
    throw new Error('Invalid candidate response');
  const hits = { docs: [], api: [], faq: [] };
  for (const group of data.groups) {
    const kind = group.docType === 'openapi' ? 'api' : family(group.pageUrl);
    // Card order is the API group order, exactly as rendered in the overview.
    hits[kind].push({ url: group.pageUrl, title: group.title,
      platform: group.platform,
      sections: group.sections.map(hit => ({ title: hit.sectionTitle, url: hit.url })),
    });
  }
  return {
    status: 'ok', totalHits: data.totalHits, hits,
    rank: item.targets.length ? pageRank(hits[item.family], item.targets) : null,
    diagnosticRank: null,
    familyCounts: Object.fromEntries(Object.entries(hits).map(([key, list]) => [key, list.length])),
    raw: data,
  };
}

const results = [];
// Two requests at a time; avoid flooding either live search service.
for (const item of fixture.cases) {
  const runs = await Promise.allSettled([runLegacy(item), runCandidate(item)]);
  const [legacy, candidate] = runs.map(run => run.status === 'fulfilled' ? run.value : { status: 'error', error: String(run.reason), rank: null, totalHits: 0, hits: {} });
  let unscoped;
  if (item.product || item.platform) {
    try { unscoped = await runCandidate(item, true); }
    catch (error) { unscoped = { status: 'error', error: String(error), rank: null, totalHits: 0 }; }
  }
  await writeFile(`${values.out}/${item.id}.json`, JSON.stringify({ legacy: legacy.raw, candidate: candidate.raw, unscoped: unscoped?.raw }, null, 2));
  delete legacy.raw;
  delete candidate.raw;
  if (unscoped) delete unscoped.raw;
  results.push({ ...item, legacy, candidate, ...(unscoped ? { unscoped } : {}) });
  console.log(JSON.stringify({ id: item.id, q: item.q, legacy: legacy.rank, candidate: candidate.rank, status: [legacy.status, candidate.status] }));
}
const summaries = side => results.map(item => ({ id: item.id, status: item[side].status, rank: item[side].rank, totalHits: item[side].totalHits, familyCounts: item[side].familyCounts }));
const productionRegressions = compareQuality(summaries('legacy'), summaries('candidate'));
const snapshotRegressions = saved ? compareQuality(saved.candidate, summaries('candidate')) : [];
const errors = results.filter(item => item.legacy.status !== 'ok' || item.candidate.status !== 'ok').map(item => item.id);
const report = {
  generatedAt: new Date().toISOString(), datasetDigest,
  legacyOrigin, candidateOrigin, fixture: values.cases,
  productionRegressions, snapshotRegressions, errors,
  passed: !productionRegressions.length && !snapshotRegressions.length && !errors.length,
  results,
};
await writeFile(`${values.out}/comparison.json`, `${JSON.stringify(report, null, 2)}\n`);
// An observation snapshot is deliberately separate from an acceptance approval.
await writeFile(`${values.out}/snapshot.json`, `${JSON.stringify({ generatedAt: report.generatedAt, datasetDigest, candidateOrigin, accepted: report.passed, candidate: summaries('candidate') }, null, 2)}\n`);
console.log(JSON.stringify({ cases: results.length, productionRegressions: productionRegressions.length, snapshotRegressions: snapshotRegressions.length, errors: errors.length, passed: report.passed }));
if (!report.passed) process.exitCode = 1;
