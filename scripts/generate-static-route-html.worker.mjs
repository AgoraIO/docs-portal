import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PUBLISHED_DOCS_LOCALES } from '../src/lib/site-region.ts';
import { injectStaticSeoHead } from '../src/lib/static-seo.ts';

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'dist', 'client');
const spaIndexPath = path.join(distRoot, 'index.html');
const manifestPath = path.join(repoRoot, 'public', '__static', 'docs-seo.json');

export async function generateStaticRouteHtml() {
  const [spaHtml, manifestText] = await Promise.all([
    fs.readFile(spaIndexPath, 'utf8'),
    fs.readFile(manifestPath, 'utf8'),
  ]);
  const pages = JSON.parse(manifestText);
  let generated = 0;

  for (const page of pages) {
    const routeIndexPath = path.join(
      distRoot,
      ...page.url.split('/').filter(Boolean),
      'index.html',
    );

    await fs.mkdir(path.dirname(routeIndexPath), { recursive: true });
    await fs.writeFile(routeIndexPath, injectStaticSeoHead(spaHtml, page));
    generated += 1;
  }

  for (const locale of PUBLISHED_DOCS_LOCALES) {
    const localeIndexPath = path.join(distRoot, locale, 'index.html');

    await fs.mkdir(path.dirname(localeIndexPath), { recursive: true });
    await fs.writeFile(localeIndexPath, spaHtml);
    generated += 1;
  }

  console.log(`[static-seo] generated ${generated} route HTML files`);
}
