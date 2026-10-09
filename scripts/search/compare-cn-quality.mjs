import { readFile, writeFile } from 'node:fs/promises';

// 只读比较两个 prepare 回执指向的快照；使用能查询临时索引的本地验收密钥。
const host = process.env.MEILI_HOST ?? 'http://127.0.0.1:7700';
const key = process.env.MEILI_VERIFY_API_KEY;
if (!key) throw new Error('Set MEILI_VERIFY_API_KEY for read-only acceptance');
const receipts = await Promise.all(process.argv.slice(2).map(async file => JSON.parse(await readFile(file, 'utf8'))));
if (receipts.length !== 2) throw new Error('Provide baseline and candidate receipt paths');
// 老快照只有 product，新快照增加 products；比较时不能假定两侧 schema 相同。
const schemas = await Promise.all(receipts.map(async receipt => {
  const response = await fetch(`${host.replace(/\/$/, '')}/indexes/${receipt.stagedUid}/settings/filterable-attributes`, {
    headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Engine settings HTTP ${response.status}`);
  const fields = await response.json();
  if (!Array.isArray(fields) || !fields.every(field => typeof field === 'string')) throw new Error('Unsupported filterable attribute schema');
  return new Set(fields);
}));
const queries = [
  { q: '云端录制', target: '/zh-CN/realtime-media/cloud-recording', maxRank: 1 },
  { q: '云录制', target: '/zh-CN/realtime-media/cloud-recording', maxRank: 1 },
  { q: '发布消息', target: '/zh-CN/realtime-media/rtm/build/manage-messages/send-message', maxRank: 1 },
  { q: '发送消息', target: '/zh-CN/realtime-media/rtm/build/manage-messages/send-message', maxRank: 1 },
  { q: 'manualSOS', target: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos', maxRank: 10 },
  { q: 'remove Handler', target: '/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi#removehandler', maxRank: 10 },
  { q: 'query 方法返回 404', product: 'cloud-recording', platform: 'restful', target: '/zh-CN/reference/faq/integration/return_404', maxRank: 1 },
  { q: '计时', product: 'rtc', target: '/zh-CN/reference/faq/account/billing_basis', maxRank: 10 },
];
const comparisons = [];
for (const query of queries) {
  const runs = [];
  for (const [index, receipt] of receipts.entries()) {
    const filter = ['locale = "zh-CN"', 'hidden = false', 'status = "published"'];
    if (query.product) {
      const value = JSON.stringify(query.product);
      filter.push(schemas[index].has('products') ? `(product = ${value} OR products = ${value})` : `product = ${value}`);
    }
    if (query.platform) filter.push(`platform = ${JSON.stringify(query.platform)}`);
    const response = await fetch(`${host.replace(/\/$/, '')}/indexes/${receipt.stagedUid}/search`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query.q, limit: 20, filter: filter.join(' AND ') }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Engine HTTP ${response.status}`);
    const data = await response.json();
    const rank = data.hits.findIndex(hit => hit.url === query.target) + 1 || null;
    runs.push({ index: receipt.stagedUid, rank, passed: rank !== null && rank <= query.maxRank, top: data.hits.slice(0, 3).map(hit => ({ title: hit.sectionTitle, url: hit.url })) });
  }
  comparisons.push({ query, baseline: runs[0], candidate: runs[1] });
  console.log(JSON.stringify({ q: query.q, product: query.product, baselineRank: runs[0].rank, candidateRank: runs[1].rank, passed: runs[1].passed, top: runs[1].top[0] }));
}
await writeFile('dist/search/cn-policy-comparison.json', JSON.stringify({ generatedAt: new Date().toISOString(), comparisons }, null, 2));
if (comparisons.some(result => !result.candidate.passed)) process.exitCode = 1;
