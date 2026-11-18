import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

// Capture observations, not relevance approval. Review visible primary cards
// separately from collapsed sections and historical landing-page targets.
const { values } = parseArgs({ options: {
  keywords: { type: 'string' },
  candidate: { type: 'string', default: 'http://127.0.0.1:3149' },
  legacy: { type: 'string', default: 'https://docportal.shengwang.cn' },
  out: { type: 'string', default: '.agent/artifacts/cn-top30-views' },
} });
const fixture = JSON.parse(await readFile('scripts/search/fixtures/cn-top-queries-20261029.json', 'utf8'));
const keywordsText = values.keywords ? await readFile(values.keywords, 'utf8') : JSON.stringify(fixture.cases.filter(item => item.id.startsWith('keyword-')).map(item => item.q));
const keywords = values.keywords ? JSON.parse(keywordsText).results.map(item => item.keyword) : JSON.parse(keywordsText);
if (keywords.length !== 30 || new Set(keywords).size !== 30 || keywords.some(q => typeof q !== 'string' || !q.trim())) throw new Error('Expected exactly 30 distinct original keywords');
for (const origin of [values.candidate, values.legacy]) {
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Expected a public HTTP(S) origin without credentials');
}
const json = async (url, init = {}) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) { if (attempt) throw error; }
  }
};
function oldCard(hit, family) {
  const root = family === 'api' && !hit.path.startsWith('/') ? '/api-ref/' : family === 'faq' ? '/faq/' : '/doc/';
  const path = /^\/(doc|api-ref|faq)\//.test(hit.path) ? hit.path : root + hit.path.replace(/^\//, '');
  return { title: ['lvl0_sidebar', 'lvl1_sidebar', 'lvl2_sidebar', 'lvl0_heading', 'lvl1_heading', 'groupName', 'name', 'title'].map(key => hit[key]).filter(Boolean).join(' > '),
    url: path + (hit.hash ? `#${hit.hash}` : ''), platform: hit.platform,
    excerpt: hit._formatted?.text ?? hit.text ?? '',
  };
}
async function legacy(q) {
  const raw = await json(`${values.legacy}/api/open-api/muti-search`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ types: ['docs', 'api_docs', 'faq'], q, page: 1, hitsPerPage: 20,
      filter: [fixture.legacyUi.products.map(value => `product = ${value}`), fixture.legacyUi.platforms.map(value => `platform = ${value}`)], sort: fixture.legacyUi.sort }),
  });
  const views = {};
  for (const [family, key] of [['docs', 'docs'], ['api', 'api_docs'], ['faq', 'faq']]) {
    if (!Array.isArray(raw[key]?.hits) || !Number.isSafeInteger(raw[key]?.totalHits)) throw new Error('Invalid legacy response');
    views[family] = { totalHits: raw[key].totalHits, cards: raw[key].hits.map(hit => oldCard(hit, family)) };
  }
  views.all = { totalHits: Object.values(views).reduce((sum, view) => sum + view.totalHits, 0), cards: Object.values(views).flatMap(view => view.cards.slice(0, 5)) };
  return { views, raw };
}
async function candidate(q, rank) {
  const views = {};
  for (const type of ['all', 'docs', 'api', 'faq']) {
    try {
      const raw = await json(`${values.candidate}/api/search?${new URLSearchParams({ q, type, page: '1' })}`);
      if (!Array.isArray(raw.groups) || !Number.isSafeInteger(raw.totalHits)) throw new Error('Invalid candidate response');
      await writeFile(`${values.out}/${rank}-${type}-candidate.json`, JSON.stringify(raw));
      views[type] = { totalHits: raw.totalHits, totalPages: raw.totalPages,
        cards: raw.groups.map(group => ({ title: group.title, url: group.pageUrl, platform: group.platform,
          sections: group.sections.map(hit => ({ title: hit.sectionTitle, url: hit.url, excerpt: hit.highlights.content.map(segment => segment.text).join('') })),
        })),
      };
    } catch (error) { views[type] = { error: String(error), cards: [] }; }
  }
  return views;
}
await mkdir(values.out, { recursive: true });
const rows = [];
for (const [index, q] of keywords.entries()) {
  const rank = index + 1;
  const [old, current] = await Promise.allSettled([legacy(q), candidate(q, rank)]);
  if (old.status === 'fulfilled') await writeFile(`${values.out}/${rank}-legacy.json`, JSON.stringify(old.value.raw));
  rows.push({ rank, q, legacy: old.status === 'fulfilled' ? old.value.views : { error: String(old.reason) }, candidate: current.status === 'fulfilled' ? current.value : { error: String(current.reason) } });
  console.log(`${rank}/30 ${q}`);
}
const errors = rows.flatMap(row => [row.legacy.error, row.candidate.error, ...Object.values(row.candidate).map(view => view?.error)].filter(Boolean));
const report = { generatedAt: new Date().toISOString(), keywordDigest: createHash('sha256').update(keywordsText).digest('hex'), legacyOrigin: values.legacy, candidateOrigin: values.candidate,
  notes: ['Old overview: first five hits per family; category: first twenty. New overview uses actual grouped API output.', 'HTTP success and result counts are availability evidence, not semantic relevance or no-regression approval.'], errors, rows };
await writeFile(`${values.out}/top30-views.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ keywords: rows.length, candidateViews: rows.length * 4, errors: errors.length }));
if (errors.length) process.exitCode = 1;
