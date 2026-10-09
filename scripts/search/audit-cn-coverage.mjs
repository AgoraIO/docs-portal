import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { load } from 'cheerio';

// 仅审计已构建的文件；不会构建、查询或写入 Meilisearch。
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    records: { type: 'string' },
    html: { type: 'string', default: 'dist/client' },
    out: { type: 'string', default: 'dist/search/cn-coverage-audit.json' },
  },
});
if (positionals.length > 1 || (values.records && positionals.length)) {
  throw new Error('Use one positional records path or --records=path');
}
const recordsPath = path.resolve(values.records ?? positionals[0] ?? 'dist/search/cn-records-version-verified.json');
const htmlRoot = path.resolve(values.html);
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const before = await stat(recordsPath);
const bytes = await readFile(recordsPath);
const records = JSON.parse(bytes.toString('utf8'));
if (!Array.isArray(records) || records.some(r => !r.url?.startsWith('/zh-CN/'))) {
  throw new Error('Expected an array of CN records');
}
const routes = (await json(path.join(htmlRoot, '__static/docs-routes.json'))).filter(r => r.url.startsWith('/zh-CN/'));
const routesByUrl = new Map(routes.map(r => [r.url, r]));
const navigation = await json(path.join(htmlRoot, '__static/docs-search/zh-CN.json'));
const navigationUrls = new Set(navigation.map(p => p.url));
const canonicalUrls = new Set(routes.map(route => route.canonicalPath));
const navigationWithoutRoutes = [...navigationUrls].filter(url => !canonicalUrls.has(url));
// 已审查的无正文入口：目录由组件渲染，三个 C# 页面只有空锚点。
// 新增无记录页面必须单独审查，不能自动当作同类豁免。
const nonTextPages = new Set([
  '/zh-CN/api-reference/api',
  '/zh-CN/api-reference/rtc/csharp-windows/device-management/mobile-camera',
  '/zh-CN/api-reference/rtc/csharp-windows/play/rhythmplayer',
  '/zh-CN/api-reference/rtc/csharp-windows/video/video-prenpro/face-detection',
  '/zh-CN/reference/faq', '/zh-CN/reference/faq/account',
  '/zh-CN/reference/faq/integration', '/zh-CN/reference/faq/other',
  '/zh-CN/reference/faq/product', '/zh-CN/reference/faq/quality',
  '/zh-CN/reference/sdks',
]);
const sitemap = load(await readFile(path.join(htmlRoot, 'sitemap.xml'), 'utf8'), { xmlMode: true });
const published = new Set(sitemap('loc').map((_, e) => new URL(sitemap(e).text()).pathname).get());
const variantCanonical = new Set(routes.filter(r => r.platform).map(r => r.canonicalPath));
const pages = new Map();
for (const record of records) {
  const url = record.url.split('#')[0];
  if (!pages.has(url)) pages.set(url, []);
  pages.get(url).push(record);
}
const exclusions = { notPublished: [], notNavigation: [], canonicalReplacedByVariants: [], eligibleWithoutRecords: [] };
for (const route of routes) {
  if (pages.has(route.url)) continue;
  const category = !published.has(route.url) ? 'notPublished'
    : !navigationUrls.has(route.canonicalPath) ? 'notNavigation'
    : !route.platform && variantCanonical.has(route.canonicalPath) ? 'canonicalReplacedByVariants'
    : 'eligibleWithoutRecords';
  exclusions[category].push(route.url);
}
const findings = {
  missingHtml: [], unknownRoutes: [], invalidIndexedAnchors: [], brokenTocTargets: [],
  genuineMissingToc: [], otherPlatformToc: [], platformMetadataMismatch: [],
  wrongPanelAnchors: [], duplicateIdsAcrossPanels: [], routeVersionMismatch: [],
};
let fragments = 0;
let tocAnchors = 0;
let checkedPages = 0;
for (const [url, rows] of pages) {
  const route = routesByUrl.get(url);
  if (!route) { findings.unknownRoutes.push(url); continue; }
  const pathname = path.resolve(htmlRoot, `.${url}`, 'index.html');
  if (!pathname.startsWith(`${htmlRoot}${path.sep}`)) throw new Error('Unsafe HTML path');
  let html;
  try { html = await readFile(pathname, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; findings.missingHtml.push(url); continue; }
  checkedPages++;
  const $ = load(html);
  const ids = new Map();
  $('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (!ids.has(id)) ids.set(id, []);
    ids.get(id).push(element);
  });
  const scopesFor = id => [...new Set(ids.get(id).map(e => $(e).closest('[data-platform-panel]').attr('data-platform-panel') ?? 'outside-panel'))];
  const indexed = new Set();
  for (const record of rows) {
    if (route.platform && (record.platform?.length !== 1 || record.platform[0] !== route.platform)) {
      findings.platformMetadataMismatch.push({ url: record.url, expected: route.platform, actual: record.platform });
    }
    if (route.version && record.version !== route.version) findings.routeVersionMismatch.push(record.url);
    const fragment = record.url.includes('#') ? decodeURIComponent(record.url.split('#')[1]) : undefined;
    if (!fragment) continue;
    fragments++;
    indexed.add(fragment);
    if (!ids.has(fragment)) { findings.invalidIndexedAnchors.push(record.url); continue; }
    if (route.platform) {
      const scopes = scopesFor(fragment);
      if (scopes.every(p => p !== 'outside-panel' && p !== route.platform)) {
        findings.wrongPanelAnchors.push({ url: record.url, selected: route.platform, scopes });
      }
      if (scopes.includes(route.platform) && scopes.some(p => p !== 'outside-panel' && p !== route.platform)) {
        findings.duplicateIdsAcrossPanels.push(record.url);
      }
    }
  }
  // 与当前独立 TOC 渲染器一致；不把正文中的普通 fragment 链接当作 TOC。
  const toc = new Set();
  $('nav.flex.flex-col.border-l.border-border a[href^="#"]').each((_, e) => toc.add(decodeURIComponent($(e).attr('href').slice(1))));
  tocAnchors += toc.size;
  for (const fragment of toc) {
    const target = `${url}#${fragment}`;
    if (!ids.has(fragment)) { findings.brokenTocTargets.push(target); continue; }
    if (indexed.has(fragment)) continue;
    const scopes = scopesFor(fragment);
    const item = { url: target, selected: route.platform, scopes };
    // 未指定单平台时不将其他 panel 的标题认定为合理排除。
    const otherOnly = route.platform && scopes.every(p => p !== 'outside-panel' && p !== route.platform);
    findings[otherOnly ? 'otherPlatformToc' : 'genuineMissingToc'].push(item);
  }
}
const after = await stat(recordsPath);
if (before.mtimeMs !== after.mtimeMs || before.size !== after.size) throw new Error('Records changed during audit; rerun');
const report = {
  coverageExceptions: { knownNonTextPages: [...nonTextPages], navigationWithoutRoutes,
    unexpectedEligibleWithoutRecords: exclusions.eligibleWithoutRecords.filter(url => !nonTextPages.has(url)) },
  snapshot: { recordsPath, htmlRoot, bytes: before.size, mtime: before.mtime.toISOString(), sha256: createHash('sha256').update(bytes).digest('hex') },
  counts: {
    records: records.length, uniqueIds: new Set(records.map(r => r.id)).size, indexedPages: pages.size,
    docs: records.filter(r => r.docType === 'docs').length, openapi: records.filter(r => r.docType === 'openapi').length,
    cnRoutes: routes.length, publishedCnRoutes: routes.filter(r => published.has(r.url)).length,
    canonicalScopes: new Set([...pages.keys()].map(u => routesByUrl.get(u)?.canonicalPath).filter(Boolean)).size,
    platformVariantPages: routes.filter(r => r.platform && pages.has(r.url)).length,
    checkedPages, fragments, tocAnchors,
    missingPlatformRecords: records.filter(r => !r.platform?.length).length,
    missingVersionRecords: records.filter(r => !r.version).length,
    exclusions: Object.fromEntries(Object.entries(exclusions).map(([k, v]) => [k, v.length])),
    findings: Object.fromEntries(Object.entries(findings).map(([k, v]) => [k, v.length])),
  },
  exclusions, findings,
  limitations: [
    'Navigation exclusions are contractual; reasons require content/meta review, not automatic defect classification.',
    'Missing metadata is not automatically an error. Version check uses published route.version, not source meta.json.',
    'Panel checks validate anchor ownership, not arbitrary prose leakage; duplicated IDs can still affect browser navigation.',
    'TOC selector is renderer-specific; revalidate it if TOC markup changes. No browser interaction or Meili audit.',
    'HTML/routes/navigation/sitemap must come from the same completed build. Record stability alone cannot establish their provenance.',
  ],
};
await mkdir(path.dirname(path.resolve(values.out)), { recursive: true });
await writeFile(values.out, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts, null, 2));
console.log(`Coverage report: ${values.out}`);
// 搜索收录/锚点缺陷阻止验收；源页面 TOC 和跨 panel 重复 ID 另列待修。
if (report.counts.uniqueIds !== records.length || [
  'missingHtml', 'unknownRoutes', 'invalidIndexedAnchors', 'genuineMissingToc',
  'platformMetadataMismatch', 'wrongPanelAnchors', 'routeVersionMismatch',
].some(key => findings[key].length) || navigationWithoutRoutes.length || report.coverageExceptions.unexpectedEligibleWithoutRecords.length) process.exitCode = 1;
