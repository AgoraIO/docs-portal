import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { load } from 'cheerio';
import { exportPublishedCnRecords } from '../../src/lib/search/cn-records.server';

const { values } = parseArgs({
  options: {
    public: { type: 'string', default: 'public' },
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
    .map((_, element) => new URL(sitemap(element).text()).pathname)
    .get(),
);
const records = await exportPublishedCnRecords({
  routes: (await readJson('docs-routes.json')).filter(
    (route: { url: string }) => publishedUrls.has(route.url),
  ),
  pages: await readJson('docs-search/zh-CN.json'),
  readMarkdown: (markdownPath) => {
    const file = path.resolve(publicRoot, `.${markdownPath}`);
    if (!file.startsWith(`${publicRoot}${path.sep}`))
      throw new Error('Invalid published Markdown path');
    return readFile(file, 'utf8');
  },
});
await mkdir(path.dirname(values.out), { recursive: true });
await writeFile(values.out, `${JSON.stringify(records)}\n`);
console.log(
  `Exported ${records.length} sections from ${new Set(records.map((record) => record.url.split('#')[0])).size} CN pages to ${values.out}`,
);
