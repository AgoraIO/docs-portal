import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { load } from 'cheerio';
import type { SearchEntry } from '../../src/lib/docs-search';
import { getStaticDocsPayloadPath } from '../../src/lib/docs-static-manifest';
import { exportPublishedCnRecords } from '../../src/lib/search/cn-records.server';
import {
  toCnContentSearchUrl,
  toCnPublicSearchUrl,
} from '../../src/lib/search/cn-search-urls.mjs';

const { values } = parseArgs({
  options: {
    public: { type: 'string', default: 'dist/client' },
    out: { type: 'string', default: 'dist/search/cn-records.json' },
  },
  strict: true,
});
const publicRoot = path.resolve(values.public);
const readJson = async (name: string) =>
  JSON.parse(await readFile(path.join(publicRoot, '__static', name), 'utf8'));
// The sitemap is built from pages with real payloads, excluding redirect aliases.
const sitemap = load(
  await readFile(path.join(publicRoot, 'sitemap.xml'), 'utf8'),
  { xmlMode: true },
);
const publishedUrls = new Set(
  sitemap('loc')
    .map((_, element) =>
      toCnPublicSearchUrl(new URL(sitemap(element).text()).pathname),
    )
    .get(),
);
const records = await exportPublishedCnRecords({
  routes: (await readJson('docs-routes.json')).filter(
    (route: { url: string }) =>
      publishedUrls.has(toCnPublicSearchUrl(route.url)),
  ),
  pages: await Promise.all(
    (await readJson('docs-search/zh-CN.json'))
      .filter((page: SearchEntry) =>
        publishedUrls.has(toCnPublicSearchUrl(page.url)),
      )
      .map(async (page: SearchEntry) => {
        const [locale, tab, ...slugSegments] = toCnContentSearchUrl(page.url)
          .split('/')
          .filter(Boolean);
        const payloadPath = getStaticDocsPayloadPath({
          locale,
          tab,
          slugSegments,
        });
        const payload = await readJson(
          payloadPath.replace(/^\/__static\//, ''),
        );
        return { ...page, titlePlatforms: payload.titlePlatforms };
      }),
  ),
  readMarkdown: (markdownPath) => {
    const file = path.resolve(publicRoot, `.${markdownPath}`);
    if (!file.startsWith(`${publicRoot}${path.sep}`))
      throw new Error('Invalid published Markdown path');
    return readFile(file, 'utf8');
  },
  // 验收同一次构建的真实 HTML 锚点，不能只相信 Markdown/TOC 的标记。
  readRenderedHtml: (url) => {
    const file = path.resolve(publicRoot, `.${url}/index.html`);
    if (!file.startsWith(`${publicRoot}${path.sep}`))
      throw new Error('Invalid published HTML path');
    return readFile(file, 'utf8');
  },
});
await mkdir(path.dirname(values.out), { recursive: true });
await writeFile(values.out, `${JSON.stringify(records)}\n`);
console.log(
  `Exported ${records.length} sections from ${new Set(records.map((record) => record.url.split('#')[0])).size} CN pages to ${values.out}`,
);
