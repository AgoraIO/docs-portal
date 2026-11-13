#!/usr/bin/env node
// Blocks search engine indexing on preview deployments.
// Run in CI before `vercel build` for preview builds only. Never run it for
// production: it rewrites vercel.base.json, vercel.json, and
// public/robots.txt in place.
import { execFileSync } from 'node:child_process';
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
// every response it matches without changing routing.
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

// The build checks that vercel.json matches what
// generate-legacy-redirect-artifacts.mjs produces from vercel.base.json, so
// the route goes into vercel.base.json and vercel.json is regenerated.
export function applyPreviewNoindex(
  repoRoot,
  { regenerate = defaultRegenerate } = {},
) {
  const basePath = path.join(repoRoot, 'vercel.base.json');
  const robotsPath = path.join(repoRoot, 'public', 'robots.txt');

  const baseConfig = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  fs.writeFileSync(
    basePath,
    `${JSON.stringify(addNoindexRoute(baseConfig), null, 2)}\n`,
  );
  regenerate(repoRoot);
  fs.writeFileSync(robotsPath, PREVIEW_ROBOTS_TXT);

  return { basePath, robotsPath };
}

function defaultRegenerate(repoRoot) {
  execFileSync(
    process.execPath,
    [path.join(repoRoot, 'scripts', 'generate-legacy-redirect-artifacts.mjs')],
    { cwd: repoRoot, stdio: 'inherit' },
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const { basePath, robotsPath } = applyPreviewNoindex(repoRoot);
  console.log(`added X-Robots-Tag noindex route to ${basePath}`);
  console.log('regenerated vercel.json');
  console.log(`wrote disallow-all ${robotsPath}`);
}
