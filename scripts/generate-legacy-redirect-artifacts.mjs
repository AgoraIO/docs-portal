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
const checkOnly = process.argv.includes('--check');

const redirectsConfig = JSON.parse(await readFile(redirectsPath, 'utf8'));
const baseConfig = JSON.parse(await readFile(vercelBasePath, 'utf8'));

const staticRedirects = createStaticRedirects(redirectsConfig.rules);
const { bulkRedirects, queryRedirects, querySplitPaths } =
  createVercelRedirects(redirectsConfig.rules);
const vercelConfig = {
  buildCommand: baseConfig.buildCommand,
  outputDirectory: baseConfig.outputDirectory,
  framework: baseConfig.framework,
  bulkRedirectsPath: 'vercel-legacy-redirects.json',
  ...createRedirectsConfig(baseConfig.redirects, queryRedirects),
  ...(baseConfig.headers ? { headers: baseConfig.headers } : {}),
  ...(baseConfig.routes ? { routes: baseConfig.routes } : {}),
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
    `[legacy-redirects] Vercel query redirects: ${queryRedirects.length}`,
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
  const queryRedirects = [];
  const querySplitPaths = [];

  for (const [legacyPath, pathRules] of rulesByPath) {
    const targets = new Set(pathRules.map((rule) => rule.target));

    if (targets.size === 1) {
      const [firstRule] = pathRules;
      bulkRedirects.push({
        source: legacyPath,
        destination: firstRule.target,
        statusCode: 301,
        preserveQueryParams: true,
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

      queryRedirects.push({
        source: legacyPath,
        destination: rule.target,
        has: Object.entries(query).map(([key, value]) => ({
          type: 'query',
          key,
          value,
        })),
        statusCode: 301,
      });
    }
  }

  return {
    bulkRedirects: bulkRedirects.sort(compareVercelRedirects),
    queryRedirects: queryRedirects.sort(compareVercelRedirects),
    querySplitPaths: querySplitPaths.sort(),
  };
}

function createRedirectsConfig(baseRedirects = [], queryRedirects) {
  const redirects = [...baseRedirects, ...queryRedirects];
  return redirects.length > 0 ? { redirects } : {};
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
