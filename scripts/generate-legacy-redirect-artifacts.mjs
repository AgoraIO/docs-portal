import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const redirectsPath = path.join(
  repoRoot,
  'src/lib/legacy-sitemap/redirects.json',
);
const staticRedirectsPath = path.join(
  repoRoot,
  'src/lib/legacy-sitemap/static-redirects.json',
);
const bulkRedirectsPath = path.join(repoRoot, 'vercel-legacy-redirects.json');
const vercelBasePath = path.join(repoRoot, 'vercel.base.json');
const vercelPath = path.join(repoRoot, 'vercel.json');
const VERCEL_BULK_REDIRECT_LIMIT = 1_000;
const VERCEL_CONFIG_REDIRECT_LIMIT = 2_048;
const checkOnly = process.argv.includes('--check');

const redirectsConfig = JSON.parse(await readFile(redirectsPath, 'utf8'));
const baseConfig = JSON.parse(await readFile(vercelBasePath, 'utf8'));

const staticRedirects = createStaticRedirects(redirectsConfig.rules);
const {
  bulkRedirects,
  configRedirects,
  overflowRedirects,
  queryRedirectRoutes,
  querySplitPaths,
} = createVercelRedirects(redirectsConfig.rules);
const vercelConfig = {
  buildCommand: baseConfig.buildCommand,
  outputDirectory: baseConfig.outputDirectory,
  framework: baseConfig.framework,
  bulkRedirectsPath: 'vercel-legacy-redirects.json',
  ...createRedirectsConfig(baseConfig.redirects, configRedirects),
  ...createRoutesConfig(queryRedirectRoutes, baseConfig.routes),
  ...(baseConfig.rewrites ? { rewrites: baseConfig.rewrites } : {}),
};

await writeOrCheck(staticRedirectsPath, `${JSON.stringify(staticRedirects)}\n`);
await writeOrCheck(bulkRedirectsPath, `${JSON.stringify(bulkRedirects)}\n`);
await writeOrCheck(vercelPath, `${JSON.stringify(vercelConfig, null, 2)}\n`, {
  compareJson: true,
});

console.log(
  [
    `[legacy-redirects] static fallback rules: ${staticRedirects.length}`,
    `[legacy-redirects] Vercel bulk redirects: ${bulkRedirects.length}`,
    `[legacy-redirects] Vercel config overflow redirects: ${overflowRedirects.length}`,
    `[legacy-redirects] Vercel query redirect routes: ${queryRedirectRoutes.length}`,
    `[legacy-redirects] query-split paths: ${querySplitPaths.length}`,
  ].join('\n'),
);

function createStaticRedirects(rules) {
  return rules
    .map((rule) => ({
      p: rule.legacyPath,
      ...(rule.legacySearch ? { q: rule.legacySearch } : {}),
      ...(rule.preserveSearch ? {} : { s: 0 }),
      t: rule.target,
    }))
    .sort(compareStaticRedirects);
}

function createVercelRedirects(rules) {
  const rulesByPath = new Map();

  for (const rule of rules) {
    const pathRules = rulesByPath.get(rule.legacyPath) ?? [];
    pathRules.push(rule);
    rulesByPath.set(rule.legacyPath, pathRules);
  }

  const bulkRedirects = [];
  const queryRedirectRoutes = [];
  const querySplitPaths = [];

  for (const [legacyPath, pathRules] of rulesByPath) {
    const targets = new Set(pathRules.map((rule) => rule.target));

    const bulkRedirectPreserveQueryParams =
      getBulkRedirectPreserveQueryParams(pathRules);

    if (targets.size === 1 && bulkRedirectPreserveQueryParams !== null) {
      const [firstRule] = pathRules;
      bulkRedirects.push({
        source: encodeVercelPath(legacyPath),
        destination: firstRule.target,
        statusCode: 301,
        preserveQueryParams: bulkRedirectPreserveQueryParams,
      });
      continue;
    }

    querySplitPaths.push(legacyPath);

    for (const rule of pathRules) {
      const query = parseLegacySearch(rule.legacySearch);
      if (!query) {
        throw new Error(
          `Cannot create query-specific redirect for ${rule.legacyUrl}: missing legacySearch`,
        );
      }

      queryRedirectRoutes.push({
        src: createRouteSource(legacyPath),
        headers: {
          Location: rule.target,
        },
        has: Object.entries(query).map(([key, value]) => ({
          type: 'query',
          key,
          value,
        })),
        status: 301,
      });
    }
  }

  const sortedBulkRedirects = bulkRedirects.sort(compareVercelRedirects);
  const overflowCount = Math.max(
    0,
    sortedBulkRedirects.length - VERCEL_BULK_REDIRECT_LIMIT,
  );
  const overflowRedirects = sortedBulkRedirects
    .filter((redirect) => redirect.preserveQueryParams)
    .slice(0, overflowCount);

  if (overflowRedirects.length < overflowCount) {
    throw new Error(
      `Vercel bulk redirects exceed the ${VERCEL_BULK_REDIRECT_LIMIT} rule limit and ${overflowCount - overflowRedirects.length} rules cannot move to vercel.json without changing query behavior`,
    );
  }

  const overflowSet = new Set(overflowRedirects);
  const configOverflowRedirects = overflowRedirects.map(
    ({ preserveQueryParams: _preserveQueryParams, ...redirect }) => redirect,
  );
  const configRedirects = configOverflowRedirects.sort(compareVercelRedirects);

  return {
    bulkRedirects: sortedBulkRedirects.filter(
      (redirect) => !overflowSet.has(redirect),
    ),
    configRedirects,
    overflowRedirects: configOverflowRedirects,
    queryRedirectRoutes: queryRedirectRoutes.sort(compareVercelRoutes),
    querySplitPaths: querySplitPaths.sort(),
  };
}

function getBulkRedirectPreserveQueryParams(pathRules) {
  if (pathRules.every((rule) => rule.preserveSearch)) {
    return true;
  }

  if (pathRules.every((rule) => rule.legacySearch)) {
    return null;
  }

  return false;
}

function createRedirectsConfig(baseRedirects = [], configRedirects) {
  const redirects = [...baseRedirects, ...configRedirects];

  if (redirects.length > VERCEL_CONFIG_REDIRECT_LIMIT) {
    throw new Error(
      `Vercel config redirects exceed the ${VERCEL_CONFIG_REDIRECT_LIMIT} rule limit`,
    );
  }

  return redirects.length > 0 ? { redirects } : {};
}

function createRoutesConfig(queryRedirectRoutes, baseRoutes = []) {
  const routes = [...queryRedirectRoutes, ...baseRoutes];
  return routes.length > 0 ? { routes } : {};
}

function createRouteSource(source) {
  const escapedSource = encodeVercelPath(source).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  return `^${escapedSource}/?$`;
}

function encodeVercelPath(source) {
  return encodeURI(source);
}

function parseLegacySearch(search) {
  if (!search) {
    return null;
  }

  const params = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  );
  const query = {};

  for (const [key, value] of params) {
    query[key] = value;
  }

  return Object.keys(query).length > 0 ? query : null;
}

function compareStaticRedirects(a, b) {
  return (
    a.p.localeCompare(b.p) ||
    (a.q ?? '').localeCompare(b.q ?? '') ||
    a.t.localeCompare(b.t)
  );
}

function compareVercelRedirects(a, b) {
  return (
    a.source.localeCompare(b.source) ||
    a.destination.localeCompare(b.destination)
  );
}

function compareVercelRoutes(a, b) {
  return (
    a.src.localeCompare(b.src) ||
    a.headers.Location.localeCompare(b.headers.Location)
  );
}

function isEquivalentJson(current, expected) {
  try {
    return isDeepStrictEqual(JSON.parse(current), JSON.parse(expected));
  } catch {
    return false;
  }
}

async function writeOrCheck(filePath, content, { compareJson = false } = {}) {
  if (!checkOnly) {
    await writeFile(filePath, content);
    return;
  }

  let current = '';
  try {
    current = await readFile(filePath, 'utf8');
  } catch {
    throw new Error(`${path.relative(repoRoot, filePath)} is missing`);
  }

  const matches = compareJson
    ? isEquivalentJson(current, content)
    : current === content;

  if (!matches) {
    throw new Error(
      `${path.relative(
        repoRoot,
        filePath,
      )} is out of date; run node scripts/generate-legacy-redirect-artifacts.mjs`,
    );
  }
}
