import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { zhCnFaqItems } from '../../src/components/faq/faq-data.zh-cn.ts';

// 只读验收：通过当前页面使用的 API 检查筛选和排序，不改索引设置。
const base = process.env.CN_SEARCH_VERIFY_URL ?? 'http://127.0.0.1:3004';
const recordsPath = process.env.CN_SEARCH_RECORDS ?? 'dist/search/cn-records-version-verified.json';
const records = JSON.parse(await readFile(recordsPath, 'utf8'));
const indexedPages = new Set(records.map(record => record.url.split('#')[0]));
const faqMissing = zhCnFaqItems.filter(item => !indexedPages.has(item.href));
const queries = [
  { q: 'manualSOS', target: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos' },
  { q: 'manualSOS', platform: 'ios', target: '/zh-CN/api-reference/conversational-ai/ios/conversationalaiapi#manualsos' },
  { q: 'removeHandler', platform: 'android', target: '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler' },
  { q: 'remove Handler', platform: 'android', target: '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler' },
  { q: '秀场', product: 'showroom', prefix: '/zh-CN/solutions/showroom' },
  { q: '屏幕共享', platform: 'csharp', prefix: '/zh-CN/api-reference/rtc/csharp-windows/' },
  { q: 'React', platform: 'web', prefix: '/zh-CN/api-reference/rtc/react-sdk/' },
  { q: '', platform: 'android', product: 'rtc', version: '4.6.2' },
  { q: '', platform: 'android', product: 'rtc', version: '4.6.0' },
  { q: '云端录制', type: 'openapi', prefix: '/zh-CN/api-reference/api-ref/cloud-recording/' },
  { q: 'query 方法返回 404', product: 'cloud-recording', platform: 'restful', prefix: '/zh-CN/reference/faq/integration/return_404', maxRank: 1 },
  { q: '计时', product: 'rtc', prefix: '/zh-CN/reference/faq/account/billing_basis' },
  { q: '死锁问题', product: 'rtm', platform: 'android', target: '/zh-CN/realtime-media/rtm/reference/release-notes/android#改进-1', maxRank: 1 },
  { q: '如何开启云端录制', prefix: '/zh-CN/realtime-media/cloud-recording/' },
  { q: '发送消息', target: '/zh-CN/realtime-media/rtm/build/manage-messages/send-message', maxRank: 1 },
  { q: '发布消息', target: '/zh-CN/realtime-media/rtm/build/manage-messages/send-message', maxRank: 1 },
  { q: '云录制', target: '/zh-CN/realtime-media/cloud-recording', maxRank: 1 },
  { q: '云端录制', target: '/zh-CN/realtime-media/cloud-recording', maxRank: 1 },
  { q: 'removeHander', observe: true },
  { q: 'manualSO', observe: true },
  { q: '屏幕共亨', observe: true },
  { q: 'API', observe: true },
  { q: 'SDK', observe: true },
  { q: 'RTC', observe: true },
];
const results = [];
for (const query of queries) {
  const params = new URLSearchParams({ q: query.q, type: query.type ?? 'all', page: '1' });
  for (const field of ['platform', 'product', 'version']) if (query[field]) params.set(field, query[field]);
  const response = await fetch(`${base}/api/search?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Search API HTTP ${response.status}`);
  const data = await response.json();
  const hits = data.groups.flatMap(group => group.sections);
  const matches = hit => query.target ? hit.url === query.target : query.prefix ? hit.url.startsWith(query.prefix) : true;
  const rank = hits.findIndex(matches) + 1 || null;
  const violations = hits.filter(hit =>
    hit.locale !== 'zh-CN' || hit.hidden !== false || hit.status !== 'published' ||
    (query.platform && !hit.platform?.includes(query.platform)) ||
    (query.product && hit.product !== query.product && !hit.products?.includes(query.product)) ||
    (query.version && hit.version !== query.version) ||
    (query.type && hit.docType !== query.type));
  const result = {
    query, totalHits: data.totalHits, firstPageSectionCount: hits.length, rank,
    passed: query.observe ? null : hits.length > 0 && violations.length === 0 && rank !== null && rank <= (query.maxRank ?? 10),
    filterViolations: violations.length,
    top: hits.slice(0, 5).map(hit => ({ title: hit.sectionTitle, url: hit.url, product: hit.product, platform: hit.platform, version: hit.version })),
  };
  results.push(result);
  console.log(JSON.stringify({ q: query.q, platform: query.platform, version: query.version, totalHits: result.totalHits, rank, passed: result.passed, top: result.top[0] }));
}
const allFaq = new Set(zhCnFaqItems.map(item => item.href));
const linkChecks = [];
const publishedRoutes = JSON.parse(await readFile('dist/client/__static/docs-routes.json', 'utf8'));
const canonicalPaths = new Map(publishedRoutes.map(route => [route.url, route.canonicalPath]));
const urls = new Set(results.flatMap(result => [result.query.target, ...result.top.map(hit => hit.url)]).filter(Boolean));
for (const url of urls) {
  const [pageUrl, anchor] = url.split('#');
  let payload;
  try {
    const canonicalPath = canonicalPaths.get(pageUrl) ?? pageUrl;
    payload = JSON.parse(await readFile(`dist/client/__static/docs${canonicalPath}.json`, 'utf8'));
  } catch {
    linkChecks.push({ url, status: 'missing-static-payload' });
    continue;
  }
  const response = await fetch(`${base}${pageUrl}`, { signal: AbortSignal.timeout(15000) });
  await response.arrayBuffer();
  const html = await readFile(`dist/client${pageUrl}/index.html`, 'utf8');
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
  const validAnchor = !anchor || ids.has(anchor);
  linkChecks.push({ url, httpStatus: response.status, status: response.ok && validAnchor ? 'verified' : response.ok ? 'anchor-needs-review' : 'page-request-failed' });
}
const report = {
  generatedAt: new Date().toISOString(), base, recordsPath,
  coverage: { records: records.length, pages: indexedPages.size, faqDatasetPages: allFaq.size, faqMissing: faqMissing.map(item => ({ href: item.href, title: item.title })) },
  passed: results.filter(result => result.passed === true).length,
  failed: results.filter(result => result.passed === false).length,
  observations: results.filter(result => result.passed === null).length,
  results,
  linkChecks,
  limitations: ['排名以页面 API 返回的分组后章节顺序衡量，不能等同于原始 Meilisearch 排名。', '非空结果不等于相关性正确；同义词、容错和短技术缩写需要人工审查前五条。', '未修改设置、未证明相对于旧设置的因果收益。'],
};
await mkdir('dist/search', { recursive: true });
await writeFile('dist/search/cn-query-acceptance.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, observations: report.observations, faqMissing: report.coverage.faqMissing.length }));
if (report.failed || faqMissing.length || linkChecks.some(check => check.status !== 'verified')) process.exitCode = 1;
