import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  readControlTable,
  writeControlTable,
} from './migration-control-table.mjs';

const DOC_FILE_PATTERN = /\.(md|mdx)$/i;
const DEFAULT_ROOT = 'content/docs/zh-CN';
const DEFAULT_PATH_MAP = 'docs/migration/path-map.csv';
const DEFAULT_REPORT = 'docs/migration/generated/platform-variant-merge-report';

const PLATFORM_ORDER = [
  { platform: 'android', suffixes: ['android'] },
  { platform: 'ios', suffixes: ['ios'] },
  { platform: 'device-c', suffixes: ['device-c'] },
  { platform: 'macos', suffixes: ['macos'] },
  { platform: 'web', suffixes: ['javascript', 'web'] },
  { platform: 'windows', suffixes: ['windows'] },
  { platform: 'harmonyos', suffixes: ['harmonyos'] },
  { platform: 'mini-program', suffixes: ['mini-program', 'wechat'] },
  { platform: 'cpp', suffixes: ['cpp'] },
  { platform: 'swift', suffixes: ['swift'] },
  { platform: 'c', suffixes: ['c'] },
  { platform: 'java', suffixes: ['java'] },
  { platform: 'python', suffixes: ['python'] },
  { platform: 'electron', suffixes: ['electron'] },
  { platform: 'unity', suffixes: ['unity'] },
  { platform: 'flutter', suffixes: ['flutter'] },
  { platform: 'react-native', suffixes: ['rn', 'react-native'] },
  { platform: 'unreal', suffixes: ['unreal-cpp'] },
  { platform: 'blueprint', suffixes: ['unreal-blueprint'] },
  { platform: 'react', suffixes: ['react'] },
  { platform: 'restful', suffixes: ['restful'] },
  { platform: 'electron-uos', suffixes: ['electron-uos'] },
];

const SUFFIX_TO_PLATFORM = new Map();
const PLATFORM_RANK = new Map();

for (const [rank, item] of PLATFORM_ORDER.entries()) {
  PLATFORM_RANK.set(item.platform, rank);
  for (const suffix of item.suffixes) {
    SUFFIX_TO_PLATFORM.set(suffix, item.platform);
  }
}

function parseArgs(argv) {
  const options = {
    pathMap: DEFAULT_PATH_MAP,
    report: DEFAULT_REPORT,
    root: DEFAULT_ROOT,
    write: false,
    rewriteLinksOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--write') {
      options.write = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.write = false;
      continue;
    }

    if (arg === '--rewrite-links-only') {
      options.rewriteLinksOnly = true;
      continue;
    }

    if (arg === '--root') {
      options.root = argv[index + 1] ?? options.root;
      index += 1;
      continue;
    }

    if (arg.startsWith('--root=')) {
      options.root = arg.slice('--root='.length);
      continue;
    }

    if (arg === '--path-map') {
      options.pathMap = argv[index + 1] ?? options.pathMap;
      index += 1;
      continue;
    }

    if (arg.startsWith('--path-map=')) {
      options.pathMap = arg.slice('--path-map='.length);
      continue;
    }

    if (arg === '--report') {
      options.report = argv[index + 1] ?? options.report;
      index += 1;
      continue;
    }

    if (arg.startsWith('--report=')) {
      options.report = arg.slice('--report='.length);
      continue;
    }

    if (!arg.startsWith('-')) {
      options.root = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function collectDocFiles(root) {
  const files = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === '.source' || entry.name === 'node_modules') {
      continue;
    }

    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectDocFiles(entryPath));
      continue;
    }

    if (entry.isFile() && DOC_FILE_PATTERN.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function parseVariantFile(filePath) {
  const extension = path.extname(filePath);
  if (!DOC_FILE_PATTERN.test(extension)) {
    return null;
  }

  const stem = path.basename(filePath, extension);
  let baseSlug = stem;
  const platforms = [];
  const suffixes = [];

  while (true) {
    const dotIndex = baseSlug.lastIndexOf('.');

    if (dotIndex === -1) {
      break;
    }

    const suffix = baseSlug.slice(dotIndex + 1);
    const platform = SUFFIX_TO_PLATFORM.get(suffix);

    if (!platform) {
      break;
    }

    platforms.unshift(platform);
    suffixes.unshift(suffix);
    baseSlug = baseSlug.slice(0, dotIndex);
  }

  if (platforms.length === 0) {
    return null;
  }

  const platform =
    platforms.length === 1 ? platforms[0] : platforms.join('+');

  return {
    baseSlug,
    extension,
    platform,
    platforms,
    rank: Math.min(
      ...platforms.map(
        (item) => PLATFORM_RANK.get(item) ?? Number.MAX_SAFE_INTEGER,
      ),
    ),
    slug: stem,
    suffix: suffixes.join('.'),
    suffixes,
  };
}

function collectMergeGroups(root) {
  const files = collectDocFiles(root);
  const fileSet = new Set(files.map(normalizePath));
  const groups = new Map();

  for (const filePath of files) {
    const variant = parseVariantFile(filePath);
    if (!variant) {
      continue;
    }

    const dir = path.dirname(filePath);
    const key = `${normalizePath(dir)}\u0000${variant.baseSlug}`;
    const group =
      groups.get(key) ??
      {
        baseFile: null,
        baseSlug: variant.baseSlug,
        dir,
        duplicatePlatforms: new Map(),
        targetFile: path.join(dir, `${variant.baseSlug}.mdx`),
        variants: [],
      };

    group.variants.push({
      ...variant,
      filePath,
    });
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    const baseMdx = path.join(group.dir, `${group.baseSlug}.mdx`);
    const baseMd = path.join(group.dir, `${group.baseSlug}.md`);
    if (fileSet.has(normalizePath(baseMdx))) {
      group.baseFile = baseMdx;
    } else if (fileSet.has(normalizePath(baseMd))) {
      group.baseFile = baseMd;
    }

    group.variants.sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return left.suffix.localeCompare(right.suffix);
    });

    const byPlatform = new Map();
    for (const variant of group.variants) {
      const bucket = byPlatform.get(variant.platform) ?? [];
      bucket.push(variant);
      byPlatform.set(variant.platform, bucket);
    }

    for (const [platform, variants] of byPlatform.entries()) {
      if (variants.length > 1) {
        group.duplicatePlatforms.set(platform, variants);
      }
    }
  }

  return [...groups.values()];
}

function planMerge(group, repoRoot) {
  if (group.duplicatePlatforms.size > 0) {
    return {
      group,
      reason: `duplicate normalized platform: ${[
        ...group.duplicatePlatforms.keys(),
      ].join(', ')}`,
      status: 'skipped',
    };
  }

  const targetFile = group.targetFile;
  const baseDoc = group.baseFile ? readDoc(group.baseFile) : null;
  const variantDocs = group.variants.map((variant) => ({
    ...variant,
    doc: readDoc(variant.filePath),
  }));
  const firstVariantDoc = variantDocs[0]?.doc;
  const frontmatter = chooseFrontmatter(baseDoc, firstVariantDoc);
  const body = buildMergedBody({ baseDoc, variantDocs });
  const content = joinFrontmatterAndBody(frontmatter, body);
  const deletions = [
    ...group.variants.map((variant) => variant.filePath),
    ...(group.baseFile && normalizePath(group.baseFile) !== normalizePath(targetFile)
      ? [group.baseFile]
      : []),
  ];
  const oldTargets = new Set([
    ...group.variants.map((variant) => toRepoPath(variant.filePath, repoRoot)),
    ...(group.baseFile ? [toRepoPath(group.baseFile, repoRoot)] : []),
    toRepoPath(targetFile, repoRoot),
  ]);

  return {
    content,
    deletions: [...new Set(deletions.map(normalizePath))],
    group,
    oldTargets,
    status: 'ready',
    targetFile,
    targetPath: toRepoPath(targetFile, repoRoot),
    variantSlugMap: new Map(
      group.variants.map((variant) => [variant.slug, group.baseSlug]),
    ),
  };
}

function readDoc(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);

  if (!match) {
    return {
      body: raw.trim(),
      frontmatter: '',
      raw,
    };
  }

  return {
    body: raw.slice(match[0].length).trim(),
    frontmatter: (match[1] ?? '').trim(),
    raw,
  };
}

function chooseFrontmatter(baseDoc, firstVariantDoc) {
  if (baseDoc?.frontmatter.trim()) {
    return cleanFrontmatter(baseDoc.frontmatter);
  }

  if (firstVariantDoc?.frontmatter.trim()) {
    return cleanFrontmatter(firstVariantDoc.frontmatter);
  }

  return '';
}

function cleanFrontmatter(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const output = [];
  const dropScalar = /^(?:displayed_sidebar|ag_product|ag_platform|ag_product_label|ag_usecase|ag_file_path|layout|defaultPlatform):/;
  const dropBlock = /^(?:platforms):\s*$/;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (dropScalar.test(line.trim())) {
      continue;
    }

    if (dropBlock.test(line.trim())) {
      while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
        index += 1;
      }
      continue;
    }

    output.push(line);
  }

  return output.join('\n').trim();
}

function buildMergedBody({ baseDoc, variantDocs }) {
  const parts = [];

  if (baseDoc?.body) {
    parts.push(baseDoc.body);
  }

  if (variantDocs.length === 1 && !baseDoc?.body) {
    parts.push(variantDocs[0].doc.body);
  } else {
    for (const variant of variantDocs) {
      if (!variant.doc.body) {
        continue;
      }

      parts.push(
        [
          `<PlatformStructured platform="${variant.platform}">`,
          '',
          variant.doc.body,
          '',
          '</PlatformStructured>',
        ].join('\n'),
      );
    }
  }

  return parts.filter(Boolean).join('\n\n').trim();
}

function joinFrontmatterAndBody(frontmatter, body) {
  const frontmatterBlock = frontmatter ? `---\n${frontmatter}\n---\n\n` : '';
  return `${frontmatterBlock}${body.trim()}\n`;
}

function applyPlans(plans) {
  for (const plan of plans) {
    fs.mkdirSync(path.dirname(plan.targetFile), { recursive: true });
    fs.writeFileSync(plan.targetFile, plan.content, 'utf8');

    for (const deletion of plan.deletions) {
      if (normalizePath(deletion) === normalizePath(plan.targetFile)) {
        continue;
      }

      if (fs.existsSync(deletion)) {
        fs.unlinkSync(deletion);
      }
    }
  }
}

async function updatePathMap({ pathMapPath, plans, repoRoot }) {
  if (!pathMapPath || !fs.existsSync(pathMapPath)) {
    return { pathMapPath, updatedRows: 0 };
  }

  const table = await readControlTable(pathMapPath);
  const now = new Date().toISOString();
  const targetByOldTarget = new Map();
  const changedTargets = new Set();

  for (const plan of plans) {
    changedTargets.add(plan.targetPath);
    for (const oldTarget of plan.oldTargets) {
      targetByOldTarget.set(oldTarget, plan.targetPath);
    }
  }

  let updatedRows = 0;

  for (const row of table.rows) {
    const replacement = targetByOldTarget.get(row.target_path);
    const rowChanged = replacement || changedTargets.has(row.target_path);

    if (!rowChanged) {
      continue;
    }

    if (replacement) {
      row.target_path = replacement;
      row.new_url = targetPathToUrl(replacement);
    }

    if (!row.redirect_status || row.redirect_status === 'redirect') {
      row.migration_progress = 'completed';
      row.audit_progress = 'pending';
      row.audit_result = '';
      row.next_step = 'Run the audit script for this completed migration row.';
      row.updated_at = now;
    }

    updatedRows += 1;
  }

  await writeControlTable(pathMapPath, table);
  return { pathMapPath: toRepoPath(pathMapPath, repoRoot), updatedRows };
}

function targetPathToUrl(targetPath) {
  const withoutPrefix = targetPath.replace(/^content\/docs\//, '');
  const withoutExtension = withoutPrefix.replace(DOC_FILE_PATTERN, '');
  const withoutIndex = withoutExtension.replace(/\/index$/, '');
  return `/${withoutIndex}`;
}

function regenerateMeta({ root, plans }) {
  const replacementByDir = new Map();

  for (const plan of plans) {
    const dirKey = normalizePath(path.dirname(plan.targetFile));
    const replacements = replacementByDir.get(dirKey) ?? new Map();
    for (const [variantSlug, baseSlug] of plan.variantSlugMap.entries()) {
      replacements.set(variantSlug, baseSlug);
    }
    replacementByDir.set(dirKey, replacements);
  }

  const dirs = collectDirs(root).sort((left, right) => {
    const depthDiff = pathDepth(right) - pathDepth(left);
    return depthDiff || left.localeCompare(right);
  });
  let written = 0;

  for (const dir of dirs) {
    const entries = collectMetaEntries(dir);
    const metaPath = path.join(dir, 'meta.json');
    const existing = readJsonIfExists(metaPath) ?? {
      title: titleFromDir(dir, root),
    };
    const replacements = replacementByDir.get(normalizePath(dir)) ?? new Map();
    const nextPages = buildPages({
      dir,
      entries,
      existingPages: Array.isArray(existing.pages) ? existing.pages : [],
      replacements,
    });
    const nextMeta = {
      ...existing,
      pages: nextPages,
    };

    if (
      nextMeta.navScope?.platformTabs &&
      !nextPages.some((page) => typeof page === 'string' && hasPlatformSuffix(page))
    ) {
      nextMeta.navScope = {};
    }

    const serialized = `${JSON.stringify(nextMeta, null, 2)}\n`;
    const previous = fs.existsSync(metaPath)
      ? fs.readFileSync(metaPath, 'utf8')
      : '';

    if (serialized !== previous) {
      fs.writeFileSync(metaPath, serialized, 'utf8');
      written += 1;
    }
  }

  return { metaFilesWritten: written };
}

function rewriteInternalLinks({ root }) {
  const files = collectDocFiles(root);
  const urlPattern = /\/zh-CN\/[^\s)"'<>]+/g;
  let filesChanged = 0;
  let linksRewritten = 0;

  for (const filePath of files) {
    const previous = fs.readFileSync(filePath, 'utf8');
    let changedInFile = 0;
    const next = previous.replace(urlPattern, (url) => {
      const rewritten = rewriteDocsUrl({ root, url });
      if (rewritten !== url) {
        changedInFile += 1;
      }
      return rewritten;
    });

    if (changedInFile > 0) {
      fs.writeFileSync(filePath, next, 'utf8');
      filesChanged += 1;
      linksRewritten += changedInFile;
    }
  }

  return { linkFilesChanged: filesChanged, linksRewritten };
}

function rewriteDocsUrl({ root, url }) {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  const withoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex === -1 ? '' : withoutHash.slice(queryIndex);
  const pathname =
    queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const candidates = [];
  let current = pathname;

  while (true) {
    const slashIndex = current.lastIndexOf('/');
    const dir = current.slice(0, slashIndex + 1);
    const leaf = current.slice(slashIndex + 1);
    const dotIndex = leaf.lastIndexOf('.');

    if (dotIndex === -1) {
      break;
    }

    const suffix = leaf.slice(dotIndex + 1);

    if (!SUFFIX_TO_PLATFORM.has(suffix)) {
      break;
    }

    current = `${dir}${leaf.slice(0, dotIndex)}`;
    candidates.push(current);
  }

  const target = candidates.reverse().find((candidate) =>
    docsRouteExists({ root, routePath: candidate }),
  );

  return target ? `${target}${query}${hash}` : url;
}

function docsRouteExists({ root, routePath }) {
  if (!routePath.startsWith('/zh-CN/')) {
    return false;
  }

  const relative = routePath.slice('/zh-CN/'.length);
  const fileBase = path.join(root, relative);

  return (
    fs.existsSync(`${fileBase}.mdx`) ||
    fs.existsSync(`${fileBase}.md`) ||
    fs.existsSync(path.join(fileBase, 'index.mdx')) ||
    fs.existsSync(path.join(fileBase, 'index.md'))
  );
}

function collectDirs(root) {
  const dirs = [];

  function visit(dir) {
    if (!hasDocsContent(dir)) {
      return;
    }

    dirs.push(dir);

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        visit(path.join(dir, entry.name));
      }
    }
  }

  visit(root);
  return dirs;
}

function hasDocsContent(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && DOC_FILE_PATTERN.test(entry.name)) {
      return true;
    }

    if (entry.isDirectory() && hasDocsContent(path.join(dir, entry.name))) {
      return true;
    }
  }

  return false;
}

function collectMetaEntries(dir) {
  const pages = new Set();

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && hasDocsContent(path.join(dir, entry.name))) {
      pages.add(entry.name);
      continue;
    }

    if (entry.isFile() && DOC_FILE_PATTERN.test(entry.name)) {
      pages.add(entry.name.replace(DOC_FILE_PATTERN, ''));
    }
  }

  return pages;
}

function buildPages({ dir, entries, existingPages, replacements }) {
  const pages = [];
  const seen = new Set();

  function pushPage(page) {
    if (typeof page !== 'string') {
      const key = JSON.stringify(page);
      if (!seen.has(key)) {
        pages.push(page);
        seen.add(key);
      }
      return;
    }

    const mapped = replacements.get(page) ?? page;
    const key = `string:${mapped}`;

    if (seen.has(key)) {
      return;
    }

    if (isSpecialMetaPage(mapped) || entries.has(mapped) || pageExists(dir, mapped)) {
      pages.push(mapped);
      seen.add(key);
    }
  }

  for (const page of existingPages) {
    pushPage(rewriteMetaPageEntry(page, replacements));
  }

  for (const page of [...entries].sort(compareMetaEntries)) {
    pushPage(page);
  }

  return pages;
}

function rewriteMetaPageEntry(page, replacements) {
  if (!page || typeof page !== 'object' || Array.isArray(page)) {
    return page;
  }

  if (!Array.isArray(page.pages)) {
    return page;
  }

  return {
    ...page,
    pages: page.pages.map((entry) => rewriteMetaPageEntry(entry, replacements)),
  };
}

function pageExists(dir, page) {
  return (
    fs.existsSync(path.join(dir, page)) ||
    fs.existsSync(path.join(dir, `${page}.mdx`)) ||
    fs.existsSync(path.join(dir, `${page}.md`))
  );
}

function isSpecialMetaPage(page) {
  return (
    page.startsWith('external:') ||
    (page.startsWith('---') && page.endsWith('---'))
  );
}

function compareMetaEntries(left, right) {
  if (left === 'index') {
    return -1;
  }

  if (right === 'index') {
    return 1;
  }

  return left.localeCompare(right);
}

function hasPlatformSuffix(page) {
  const dotIndex = page.lastIndexOf('.');
  return dotIndex !== -1 && SUFFIX_TO_PLATFORM.has(page.slice(dotIndex + 1));
}

function titleFromDir(dir, root) {
  if (normalizePath(dir) === normalizePath(root)) {
    return '中文文档';
  }

  return path.basename(dir);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pathDepth(filePath) {
  return normalizePath(filePath).split('/').length;
}

function summarizePlans(plans, skipped, repoRoot) {
  const mergedVariantFiles = plans.reduce(
    (sum, plan) => sum + plan.group.variants.length,
    0,
  );
  const singlePlatformRenames = plans.filter(
    (plan) => plan.group.variants.length === 1 && !plan.group.baseFile,
  ).length;

  return {
    mergedGroups: plans.length,
    mergedVariantFiles,
    skippedGroups: skipped.length,
    singlePlatformRenames,
    samples: plans.slice(0, 30).map((plan) => ({
      platforms: plan.group.variants.map((variant) => ({
        platform: variant.platform,
        source: toRepoPath(variant.filePath, repoRoot),
        suffix: variant.suffix,
      })),
      target: plan.targetPath,
    })),
    skipped: skipped.slice(0, 30).map((plan) => ({
      reason: plan.reason,
      target: toRepoPath(plan.group.targetFile, repoRoot),
    })),
  };
}

function writeReport({ mode, pathMapResult, plans, reportBase, repoRoot, skipped }) {
  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    pathMap: pathMapResult,
    ...summarizePlans(plans, skipped, repoRoot),
  };
  const jsonPath = `${reportBase}.json`;
  const mdPath = `${reportBase}.md`;

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, renderMarkdownReport(report), 'utf8');

  return { jsonPath, mdPath, report };
}

function renderMarkdownReport(report) {
  const lines = [
    '# Platform Variant Merge Report',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Mode: \`${report.mode}\``,
    '',
    '## Summary',
    '',
    `- Merged groups: ${report.mergedGroups}`,
    `- Platform variant files merged: ${report.mergedVariantFiles}`,
    `- Single-platform renames: ${report.singlePlatformRenames}`,
    `- Skipped groups: ${report.skippedGroups}`,
    `- Path-map rows updated: ${report.pathMap?.updatedRows ?? 0}`,
    `- Links rewritten: ${report.pathMap?.linksRewritten ?? 0}`,
    `- Link files changed: ${report.pathMap?.linkFilesChanged ?? 0}`,
    '',
    '## Samples',
    '',
  ];

  for (const sample of report.samples) {
    lines.push(`- \`${sample.target}\`: ${sample.platforms
      .map((item) => `${item.suffix}->${item.platform}`)
      .join(', ')}`);
  }

  if (report.skipped.length > 0) {
    lines.push('', '## Skipped', '');
    for (const skipped of report.skipped) {
      lines.push(`- \`${skipped.target}\`: ${skipped.reason}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function toRepoPath(filePath, repoRoot) {
  return normalizePath(path.relative(repoRoot, path.resolve(filePath)));
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

async function runCli() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const root = path.resolve(repoRoot, options.root);

  if (!fs.existsSync(root)) {
    throw new Error(`Docs root does not exist: ${options.root}`);
  }

  const groups = collectMergeGroups(root);
  const planned = groups.map((group) => planMerge(group, repoRoot));
  const ready = planned.filter((plan) => plan.status === 'ready');
  const skipped = planned.filter((plan) => plan.status === 'skipped');
  let pathMapResult = { pathMapPath: options.pathMap, updatedRows: 0 };
  let metaResult = { metaFilesWritten: 0 };
  let linkResult = { linkFilesChanged: 0, linksRewritten: 0 };

  if (options.rewriteLinksOnly) {
    linkResult = rewriteInternalLinks({ root });
    const report = writeReport({
      mode: 'rewrite-links-only',
      pathMapResult: {
        ...pathMapResult,
        ...linkResult,
        ...metaResult,
      },
      plans: [],
      reportBase: path.resolve(repoRoot, options.report),
      repoRoot,
      skipped: [],
    });

    console.log(
      [
        '[platform-merge] mode=rewrite-links-only',
        `links=${linkResult.linksRewritten}`,
        `files=${linkResult.linkFilesChanged}`,
        `report=${toRepoPath(report.mdPath, repoRoot)}`,
      ].join(' '),
    );
    return;
  }

  if (options.write) {
    applyPlans(ready);
    pathMapResult = await updatePathMap({
      pathMapPath: path.resolve(repoRoot, options.pathMap),
      plans: ready,
      repoRoot,
    });
    metaResult = regenerateMeta({ plans: ready, root });
    linkResult = rewriteInternalLinks({ root });
  }

  const report = writeReport({
    mode: options.write ? 'write' : 'dry-run',
    pathMapResult: {
      ...pathMapResult,
      ...metaResult,
      ...linkResult,
    },
    plans: ready,
    reportBase: path.resolve(repoRoot, options.report),
    repoRoot,
    skipped,
  });

  console.log(
    [
      `[platform-merge] mode=${options.write ? 'write' : 'dry-run'}`,
      `groups=${ready.length}`,
      `variantFiles=${report.report.mergedVariantFiles}`,
      `singlePlatformRenames=${report.report.singlePlatformRenames}`,
      `skipped=${skipped.length}`,
      `pathMapRows=${pathMapResult.updatedRows}`,
      `metaFiles=${metaResult.metaFilesWritten}`,
      `report=${toRepoPath(report.mdPath, repoRoot)}`,
    ].join(' '),
  );
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
