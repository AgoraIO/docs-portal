import fs from 'node:fs/promises';
import path from 'node:path';
import { convertHtmlToMdx } from './html-to-mdx.mjs';
import {
  ApiCenterMigrationRun,
  assetTargetPath,
  buildLegacyRouteMap,
  createWarning,
  loadFaqMappingRows,
} from './migration-framework.mjs';
import { parseCsv } from './source-resolver.mjs';

const SUPPORTED_GENERATORS = new Set([
  'appledoc',
  'doxygen',
  'oxygen',
  'typedoc',
]);

const GENERATOR_CONVERSION_OPTIONS = {
  appledoc: {
    rootSelector: 'main[role="main"]',
    titleSelector: 'main[role="main"] > h1.title, main[role="main"] h1',
  },
  doxygen: {
    rootSelector: '.contents',
    titleSelector: '.headertitle .title',
  },
  oxygen: {
    rootSelector: 'main > article',
    titleSelector: 'main > article > h1.title, main > article > h1',
  },
  typedoc: {
    rootSelector: '.col-content',
    titleSelector: '.tsd-page-title h1',
  },
};

function pageMatches(page, { generators, scope, urls }) {
  const resolution = page.sourceResolution;
  return (
    resolution.type === 'generated-html' &&
    generators.has(resolution.generator) &&
    (!scope || resolution.route.scopeKey === scope) &&
    (urls.size === 0 || urls.has(page.requestedUrl))
  );
}

function canonicalPageScore(page) {
  const url = new URL(page.requestedUrl);
  return [
    url.search ? 1 : 0,
    url.pathname.endsWith('.html') ? 1 : 0,
    url.href.length,
  ];
}

function compareCanonicalPages(left, right) {
  const leftScore = canonicalPageScore(left);
  const rightScore = canonicalPageScore(right);
  for (let index = 0; index < leftScore.length; index++) {
    if (leftScore[index] !== rightScore[index]) {
      return leftScore[index] - rightScore[index];
    }
  }
  return left.requestedUrl.localeCompare(right.requestedUrl);
}

function selectCanonicalPages(pages) {
  const byTarget = new Map();
  for (const page of pages) {
    const targetPath = page.sourceResolution.targetPath;
    const candidates = byTarget.get(targetPath) ?? [];
    candidates.push(page);
    byTarget.set(targetPath, candidates);
  }
  const selected = new Set();
  const aliases = new Map();
  for (const [targetPath, candidates] of byTarget) {
    const sourceKeys = new Set(
      candidates.map(
        (page) =>
          `${page.sourceResolution.generator}\u001f${page.sourceResolution.sourcePath}`,
      ),
    );
    if (sourceKeys.size > 1) {
      throw new Error(
        `generated-target-collision: ${targetPath} has multiple distinct legacy sources.`,
      );
    }
    const [canonical, ...duplicates] = [...candidates].sort(
      compareCanonicalPages,
    );
    selected.add(canonical.requestedUrl);
    for (const duplicate of duplicates) {
      aliases.set(duplicate.requestedUrl, canonical.requestedUrl);
    }
  }
  return { selected, aliases };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function usablePathMapRows(repoRoot, pathMapPath) {
  try {
    const rows = parseCsv(
      await fs.readFile(path.resolve(repoRoot, pathMapPath), 'utf8'),
    );
    const usable = [];
    for (const row of rows) {
      if (!row.old_url || !row.new_url) continue;
      if (
        row.target_path &&
        !(await exists(path.resolve(repoRoot, row.target_path)))
      ) {
        continue;
      }
      usable.push(row);
    }
    return usable;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function stripUrlSuffix(value) {
  return decodeURIComponent(String(value).split(/[?#]/, 1)[0]);
}

function assetHandler({ run, sourceAbsolutePath, oldRoot }) {
  return async ({ source, sourceUrl }) => {
    if (/^data:/i.test(source)) return source;
    if (/^https?:\/\//i.test(source)) {
      const url = new URL(source, sourceUrl);
      if (url.origin !== 'https://doc.shengwang.cn') return url.href;
    }
    const cleanSource = stripUrlSuffix(source);
    const local = cleanSource.startsWith('/img/')
      ? path.resolve(oldRoot, 'static', cleanSource.slice(1))
      : path.resolve(path.dirname(sourceAbsolutePath), cleanSource);
    if (!(await exists(local)))
      throw new Error(`Local asset not found: ${local}`);
    const contents = await fs.readFile(local);
    const targetPath = assetTargetPath(local, contents);
    run.planFile({
      targetPath,
      contents,
      sourcePath: local,
      sourceUrl,
      type: 'asset',
    });
    return `/${targetPath.replace(/^public\//, '')}`;
  };
}

export async function runHtmlGenerators({
  repoRoot = process.cwd(),
  manifestPath = 'docs/migration/api-center-html-manifest.json',
  pathMapPath = 'docs/migration/path-map.csv',
  oldRoot = process.env.API_CENTER_OLD_ROOT,
  generators,
  scope = null,
  urls = [],
  limit = 0,
  mode = 'write',
  reconcile = false,
}) {
  if (!oldRoot) {
    throw new Error(
      'Pass --old-root or set API_CENTER_OLD_ROOT to the durable shengwang-doc-source checkout.',
    );
  }
  const requestedGenerators = new Set(generators);
  for (const generator of requestedGenerators) {
    if (!SUPPORTED_GENERATORS.has(generator)) {
      throw new Error(`Unsupported HTML generator: ${generator}`);
    }
  }
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(repoRoot, manifestPath), 'utf8'),
  );
  const routeMap = buildLegacyRouteMap(
    manifest,
    await usablePathMapRows(repoRoot, pathMapPath),
    await loadFaqMappingRows(repoRoot),
  );
  const run = await ApiCenterMigrationRun.create({
    repoRoot,
    manifest,
    mode,
    reconcile,
  });
  const urlSet = new Set(urls);
  const matched = manifest.pageEvidence.filter(
    (page) =>
      !page.aliasOf &&
      pageMatches(page, {
        generators: requestedGenerators,
        scope,
        urls: urlSet,
      }),
  );
  const canonicalSelection = selectCanonicalPages(
    limit > 0 ? matched.slice(0, limit) : matched,
  );
  const selected = canonicalSelection.selected;

  for (const page of manifest.pageEvidence.filter((page) => !page.aliasOf)) {
    const resolution = page.sourceResolution;
    if (resolution.status === 'excluded') {
      run.recordPageResult({
        page,
        status: 'excluded',
        warnings: [
          createWarning(
            'broken-live-body-link',
            page.warnings?.[0]?.message ?? resolution.reason,
          ),
        ],
      });
      continue;
    }
    if (canonicalSelection.aliases.has(page.requestedUrl)) {
      run.recordPageResult({ page, status: 'alias' });
      continue;
    }
    if (!selected.has(page.requestedUrl)) {
      if (resolution.targetExists) run.preserveExisting({ page });
      else run.recordPageResult({ page, status: 'pending' });
      continue;
    }
    if (resolution.targetExists && !run.ownsTarget(resolution.targetPath)) {
      run.preserveExisting({ page });
      continue;
    }
    const sourceAbsolutePath = path.resolve(oldRoot, resolution.sourcePath);
    const html = await fs.readFile(sourceAbsolutePath, 'utf8');
    const converted = await convertHtmlToMdx({
      html,
      sourceUrl: page.requestedUrl,
      sourcePath: resolution.sourcePath,
      routeMap,
      onAsset: assetHandler({ run, sourceAbsolutePath, oldRoot }),
      ...GENERATOR_CONVERSION_OPTIONS[resolution.generator],
    });
    const warnings = converted.warnings.map((warning) =>
      warning.code === 'unresolved-link'
        ? createWarning(
            'source-only-link-removed',
            `Rendered unresolved generated-source link ${warning.href ?? ''} as local text.`,
            { href: warning.href },
          )
        : warning,
    );
    if (!converted.body && converted.sourceTextLength < 20) {
      warnings.push(
        createWarning(
          'empty-source-body',
          `The legacy source ${resolution.sourcePath} exposes an intentionally empty named page.`,
        ),
      );
    }
    if (
      !converted.title ||
      (converted.sourceTextLength >= 20 && converted.body.length < 20)
    ) {
      warnings.push(
        createWarning(
          'unsupported-html-structure',
          `No substantive converted body was produced from ${resolution.sourcePath}.`,
        ),
      );
    }
    const title = converted.title || page.title;
    if (!title) {
      throw new Error(
        `Missing source-derived title for ${page.requestedUrl}; request source copy instead of synthesizing a filename title.`,
      );
    }
    run.planMdx({
      page,
      title,
      description: converted.description || undefined,
      body: converted.body,
      warnings,
    });
  }
  const report = await run.finish();
  return {
    report,
    selectedCount: selected.size,
    matchedCount: matched.length,
  };
}

export async function runGeneratorCli(generator, argv = process.argv.slice(2)) {
  const options = {
    manifestPath: 'docs/migration/api-center-html-manifest.json',
    oldRoot: process.env.API_CENTER_OLD_ROOT ?? null,
    mode: 'write',
    scope: null,
    urls: [],
    limit: 0,
  };
  for (let index = 0; index < argv.length; index++) {
    switch (argv[index]) {
      case '--manifest':
        options.manifestPath = argv[++index];
        break;
      case '--old-root':
        options.oldRoot = argv[++index];
        break;
      case '--scope':
        options.scope = argv[++index];
        break;
      case '--url':
        options.urls.push(argv[++index]);
        break;
      case '--limit':
        options.limit = Number(argv[++index]);
        break;
      case '--dry-run':
        options.mode = 'dry-run';
        break;
      case '--check':
        options.mode = 'check';
        break;
      case '--reconcile':
        options.reconcile = true;
        break;
      case '--help':
      case '-h':
        console.log(`
API Center ${generator} HTML migration

Usage:
  bun scripts/migrate-api-html-${generator}.mjs [options]

Options:
  --manifest <file>  API Center manifest
  --old-root <dir>   Durable legacy checkout (or API_CENTER_OLD_ROOT)
  --scope <key>      Limit to family/product/platform, for example api-ref/rtc/android
  --url <url>        Limit to one legacy page; repeatable
  --limit <count>    Limit matched pages for a pilot
  --dry-run          Convert and report without writing
  --check            Verify owned outputs and reports are current
  --reconcile        Remove unchanged stale files owned by this generator run
`);
        return null;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!Number.isInteger(options.limit) || options.limit < 0) {
    throw new Error('--limit must be a non-negative integer.');
  }
  const result = await runHtmlGenerators({
    ...options,
    generators: [generator],
  });
  console.log(
    `${generator}: selected ${result.selectedCount}/${result.matchedCount}; generated ${result.report.counts.generatedFiles}, pending ${result.report.counts.pendingPages}, warnings ${result.report.counts.warnings}, errors ${result.report.counts.errors}.`,
  );
  return result;
}
