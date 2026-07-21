import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PUBLISHED_DOCS_LOCALES } from '../src/lib/site-region';
import { createStaticRouteHtml } from '../src/lib/static-route-html';
import type { StaticSeoManifestPage } from '../src/lib/static-seo';

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'dist', 'client');
const spaIndexPath = path.join(distRoot, 'index.html');
const manifestPath = path.join(repoRoot, 'public', '__static', 'docs-seo.json');
const allowSpaFallback = Boolean(process.env.TSS_PRERENDER_PATHS);

export async function generateStaticRouteHtml() {
  const [spaHtml, manifestText] = await Promise.all([
    fs.readFile(spaIndexPath, 'utf8'),
    fs.readFile(manifestPath, 'utf8'),
  ]);
  const pages = JSON.parse(manifestText) as StaticSeoManifestPage[];
  let generated = 0;

  for (const page of pages) {
    const routeIndexPath = path.join(
      distRoot,
      ...page.url.split('/').filter(Boolean),
      'index.html',
    );

    await fs.mkdir(path.dirname(routeIndexPath), { recursive: true });
    const routeHtml = await readOptionalTextFile(routeIndexPath);
    await fs.writeFile(
      routeIndexPath,
      createStaticRouteHtml({
        allowSpaFallback,
        page,
        routeHtml,
        spaHtml,
      }),
    );
    generated += 1;
  }

  for (const locale of PUBLISHED_DOCS_LOCALES) {
    const localeIndexPath = path.join(distRoot, locale, 'index.html');

    await fs.mkdir(path.dirname(localeIndexPath), { recursive: true });
    await fs.writeFile(localeIndexPath, spaHtml);
    generated += 1;
  }

  await fs.writeFile(path.join(distRoot, '404.html'), spaHtml);

  console.log(`[static-seo] generated ${generated} route HTML files`);
}

async function readOptionalTextFile(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return undefined;
    }

    throw error;
  }
}
