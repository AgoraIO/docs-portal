import assert from 'node:assert/strict';
import {
  isRetiredCnDocsPath,
  retiredCnDocDirectories,
  retiredCnDocPages,
} from '../src/lib/retired-cn-docs.mjs';

const base = new URL(process.env.DEPLOY_URL);
assert.equal(base.protocol, 'https:');

async function request(path, status = 200) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(
    response.status,
    status,
    `${path}: expected HTTP ${status}, received ${response.status}`,
  );
  return response;
}

const retiredPaths = [
  ...new Set([...retiredCnDocDirectories, ...retiredCnDocPages]),
];
const checks = retiredPaths.flatMap((path) => [`/${path}`, `/${path}.md`]);
checks.push(
  '/realtime-media/fusion-cdn',
  '/solutions/flexible-classroom',
  '/openapi/fusion-cdn/streaming.zh-CN.yaml',
);
for (let offset = 0; offset < checks.length; offset += 8) {
  await Promise.all(
    checks.slice(offset, offset + 8).map((path) => request(path, 404)),
  );
}
console.log(
  `[retired-docs] verified ${checks.length} old HTML/Markdown/YAML addresses return HTTP 404`,
);

for (const path of [
  '/zh-CN/realtime-media/overview',
  '/zh-CN/solutions/overview',
  '/zh-CN/api-reference/api',
  '/zh-CN/realtime-media/rtc',
  '/zh-CN/reference/sdks',
]) {
  await request(path);
}

function isRetiredPublishedUrl(value) {
  const path = new URL(value, base).pathname;
  return isRetiredCnDocsPath(
    path.startsWith('/zh-CN/') ? path : `/zh-CN${path}`,
  );
}

const routes = await (await request('/__static/docs-routes.json')).json();
assert.ok(Array.isArray(routes));
assert.ok(routes.length > 0);
assert.equal(
  routes.filter((route) => isRetiredPublishedUrl(route.url)).length,
  0,
);

const searchData = await (
  await request('/__static/docs-search/zh-CN.json')
).json();
const searchPages = Array.isArray(searchData) ? searchData : searchData.pages;
assert.ok(Array.isArray(searchPages));
assert.ok(searchPages.length > 0);
assert.equal(
  searchPages.filter((page) => isRetiredPublishedUrl(page.url)).length,
  0,
);

for (const path of [
  '/zh-CN/realtime-media/overview.md',
  '/zh-CN/solutions/overview.md',
  '/zh-CN/api-reference/api.md',
]) {
  const markdown = await (await request(path)).text();
  assert.doesNotMatch(
    markdown,
    /fusion-cdn|flexible-classroom|融合 CDN|灵动课堂/,
  );
}

const sitemap = await (await request('/sitemap.xml')).text();
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
assert.ok(sitemapUrls.length > 0);
assert.equal(sitemapUrls.filter(isRetiredPublishedUrl).length, 0);
console.log(
  `[retired-docs] verified active pages, ${routes.length} routes, ${searchPages.length} search entries, public Markdown and sitemap`,
);
