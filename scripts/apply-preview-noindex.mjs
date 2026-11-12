#!/usr/bin/env node
// Blocks search engine indexing on preview deployments.
// Run in CI before `vercel build` for preview builds only. Never run it for
// production: it rewrites vercel.json and public/robots.txt in place.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const NOINDEX_HEADER_VALUE = 'noindex, nofollow';

export const PREVIEW_ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';

export const NOINDEX_ROUTE = {
  src: '^/.*$',
  headers: { 'X-Robots-Tag': NOINDEX_HEADER_VALUE },
  continue: true,
};

// vercel.json uses `routes`, which Vercel does not allow alongside a
// top-level `headers` key. A leading `continue` route adds the header to
// every response, including redirects, without changing routing.
export function addNoindexRoute(config) {
  const routes = Array.isArray(config.routes) ? config.routes : [];
  const alreadyApplied = routes.some(
    (route) => route?.headers?.['X-Robots-Tag'] === NOINDEX_HEADER_VALUE,
  );

  if (alreadyApplied) {
    return config;
  }

  return { ...config, routes: [NOINDEX_ROUTE, ...routes] };
}

export function applyPreviewNoindex(repoRoot) {
  const vercelPath = path.join(repoRoot, 'vercel.json');
  const robotsPath = path.join(repoRoot, 'public', 'robots.txt');

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  fs.writeFileSync(
    vercelPath,
    `${JSON.stringify(addNoindexRoute(config), null, 2)}\n`,
  );
  fs.writeFileSync(robotsPath, PREVIEW_ROBOTS_TXT);

  return { vercelPath, robotsPath };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const { vercelPath, robotsPath } = applyPreviewNoindex(repoRoot);
  console.log(`added X-Robots-Tag noindex route to ${vercelPath}`);
  console.log(`wrote disallow-all ${robotsPath}`);
}
