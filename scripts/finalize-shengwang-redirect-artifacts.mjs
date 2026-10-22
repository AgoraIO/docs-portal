import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRetiredCnDocsPath } from '../src/lib/retired-cn-docs.mjs';
import { toPublicRedirectTarget } from './shengwang-redirect-targets.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const inputRoot = path.join(repoRoot, 'docs/migration/redirect-inputs');
const retirementPolicyPath = path.join(repoRoot, 'src/lib/retired-cn-docs.mjs');
const candidatePath = path.join(
  inputRoot,
  'legacy-url-map-candidate-32883e92e9-2026-10-15.json',
);
const legacyInventoryPath = path.join(
  inputRoot,
  'legacy-url-inventory-2026-10-14.json',
);
const targetRoutesPath = path.join(inputRoot, 'target-routes-32883e92e9.json');
const targetMetaPath = path.join(
  inputRoot,
  'target-build-meta-32883e92e9.json',
);
const finalMapPath = path.join(inputRoot, 'legacy-url-map.csv');
const finalJsonPath = path.join(inputRoot, 'legacy-url-map.json');
const vercelPath = path.join(inputRoot, 'legacy-url-redirects.vercel.json');
const nginxPath = path.join(inputRoot, 'legacy-url-redirects.nginx.conf');

const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));
const legacyInventory = JSON.parse(await readFile(legacyInventoryPath, 'utf8'));
const targetRoutes = JSON.parse(await readFile(targetRoutesPath, 'utf8'));
const targetMeta = JSON.parse(await readFile(targetMetaPath, 'utf8'));
const targetRouteSet = new Set(targetRoutes.map((route) => route.url));
const applicationRoutes = new Set(['/zh-CN/search']);
validateSnapshots(candidate, legacyInventory, targetRoutes, targetMeta);
// Validate the original targets against the immutable, locale-prefixed snapshot.
// This does not prove that the public, unprefixed routes have been deployed.
validateRecords(
  candidate.records,
  legacyInventory,
  targetRouteSet,
  applicationRoutes,
);
const records = candidate.records.map((record) => {
  // The historical route snapshot includes products retired since collection.
  // Keep that evidence immutable; apply the current publication policy explicitly.
  if (record.status === 'candidate' && isRetiredCnDocsPath(record.target)) {
    return {
      ...record,
      target: '',
      status: 'no-redirect',
      targetExists: false,
      mappingType: 'retired-content-no-redirect',
      retiredTarget: record.target,
      notes: `${record.notes}；目标 ${record.target} 已由 src/lib/retired-cn-docs.mjs 下线，不发布此内容，保留旧路径 404。`,
    };
  }
  const target = toPublicRedirectTarget(record.target);
  if (
    record.status === 'candidate' &&
    record.legacyPath === target.split(/[?#]/, 1)[0]
  ) {
    return {
      ...record,
      target: '',
      status: 'no-redirect',
      targetExists: false,
      mappingType: 'same-path-no-redirect',
      notes: `${record.notes}；公开路径未变化，由新站直接服务，无需重定向，查询参数交由应用处理。`,
    };
  }

  return { ...record, target };
});
const manualReview = records.filter(
  (record) => record.status === 'manual-review',
);
if (manualReview.length > 0) {
  throw new Error(
    `Cannot finalize Shengwang redirects: ${manualReview.length} manual-review records remain`,
  );
}

const duplicatePaths = findDuplicates(
  records.map((record) => record.legacyPath),
);
if (duplicatePaths.length > 0) {
  throw new Error(
    `Cannot finalize Shengwang redirects: duplicate source paths: ${duplicatePaths.join(', ')}`,
  );
}

const redirects = records.filter((record) => record.status === 'candidate');
const missingTargets = redirects.filter(
  (record) => !record.target || !record.targetExists,
);
if (missingTargets.length > 0) {
  throw new Error(
    `Cannot finalize Shengwang redirects: ${missingTargets.length} candidate targets are missing`,
  );
}

const finalSummary = {
  total: records.length,
  redirect: redirects.length,
  noRedirect: records.filter((record) => record.status === 'no-redirect')
    .length,
  manualReview: manualReview.length,
  uniqueSourcePaths: new Set(records.map((record) => record.legacyPath)).size,
};

const finalMap = toCsv(records);
const finalJson = `${JSON.stringify(
  {
    generatedAt: candidate.generatedAt,
    targetCommit: candidate.targetCommit,
    sourceCandidate: path.relative(repoRoot, candidatePath),
    snapshot: candidate.snapshot,
    targetUrlTransform: 'remove-zh-CN-prefix',
    retirementPolicy: {
      path: path.relative(repoRoot, retirementPolicyPath),
      sha256: await sha256File(retirementPolicyPath),
    },
    summary: finalSummary,
    records,
  },
  null,
  2,
)}\n`;
const vercelJson = `${JSON.stringify(
  redirects.map((record) => ({
    source: record.legacyPath,
    destination: record.target,
    statusCode: 301,
    preserveQueryParams: record.preserveQuery,
  })),
  null,
  2,
)}\n`;
const nginxConfig = toNginx(redirects, candidate.targetCommit);

if (process.argv.includes('--check')) {
  await assertFileMatches(finalMapPath, finalMap);
  await assertFileMatches(finalJsonPath, finalJson);
  await assertFileMatches(vercelPath, vercelJson);
  await assertFileMatches(nginxPath, nginxConfig);
} else {
  await writeFile(finalMapPath, finalMap);
  await writeFile(finalJsonPath, finalJson);
  await writeFile(vercelPath, vercelJson);
  await writeFile(nginxPath, nginxConfig);
}

console.log(
  JSON.stringify(
    {
      finalMapPath,
      finalJsonPath,
      vercelPath,
      nginxPath,
      summary: finalSummary,
    },
    null,
    2,
  ),
);

function toCsv(items) {
  const columns = [
    'legacyUrl',
    'legacyPath',
    'legacyFamily',
    'target',
    'status',
    'confidence',
    'mappingType',
    'source',
    'targetExists',
    'preserveQuery',
    'notes',
  ];
  return `${columns.join(',')}\n${items
    .map((item) => columns.map((column) => csvEscape(item[column])).join(','))
    .join('\n')}\n`;
}

async function assertFileMatches(filePath, expected) {
  const actual = await readFile(filePath, 'utf8');
  if (actual !== expected) {
    throw new Error(
      `Checked-in Shengwang redirect artifact is stale or modified: ${path.relative(repoRoot, filePath)}`,
    );
  }
}

async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function validateSnapshots(
  candidate,
  legacyInventory,
  targetRoutes,
  targetMeta,
) {
  if (!candidate || !Array.isArray(candidate.records)) {
    throw new Error(
      'Cannot finalize Shengwang redirects: invalid candidate schema',
    );
  }
  if (
    !candidate.targetCommit ||
    !targetMeta.commit?.startsWith(candidate.targetCommit)
  ) {
    throw new Error(
      `Cannot finalize Shengwang redirects: candidate target commit ${candidate.targetCommit} does not match ${targetMeta.commit}`,
    );
  }
  if (targetMeta.routeCount !== targetRoutes.length) {
    throw new Error(
      `Cannot finalize Shengwang redirects: target route count ${targetRoutes.length} does not match metadata ${targetMeta.routeCount}`,
    );
  }
  const expectedSnapshots = {
    legacyInventory: legacyInventoryPath,
    legacySitemap: path.join(inputRoot, 'legacy-sitemap-2026-10-14.xml'),
    targetRoutes: targetRoutesPath,
  };
  for (const [key, filePath] of Object.entries(expectedSnapshots)) {
    const snapshot = candidate.snapshot?.[key];
    const expectedPath = path.relative(repoRoot, filePath);
    if (!snapshot || snapshot.path !== expectedPath) {
      throw new Error(
        `Cannot finalize Shengwang redirects: candidate ${key} snapshot path is not ${expectedPath}`,
      );
    }
    const actualHash = await sha256File(filePath);
    if (snapshot.sha256 !== actualHash) {
      throw new Error(
        `Cannot finalize Shengwang redirects: candidate ${key} snapshot hash does not match ${actualHash}`,
      );
    }
  }
  if (
    targetMeta.snapshot?.path !== path.relative(repoRoot, targetRoutesPath) ||
    targetMeta.snapshot?.sha256 !== candidate.snapshot.targetRoutes.sha256
  ) {
    throw new Error(
      'Cannot finalize Shengwang redirects: target route snapshot provenance does not match metadata',
    );
  }
  if (candidate.targetRouteSnapshot !== candidate.snapshot.targetRoutes.path) {
    throw new Error(
      'Cannot finalize Shengwang redirects: candidate targetRouteSnapshot is inconsistent with snapshot metadata',
    );
  }
  if (candidate.legacyCollectedAt !== legacyInventory.collectedAt) {
    throw new Error(
      'Cannot finalize Shengwang redirects: candidate legacy collection date is inconsistent with inventory',
    );
  }
}

function validateRecords(
  records,
  legacyInventory,
  targetRouteSet,
  applicationRoutes,
) {
  const expectedPaths = legacyInventory.urls.map(normalizePath);
  const actualPaths = records.map((record) => record.legacyPath);
  const expectedSet = new Set(expectedPaths);
  const actualSet = new Set(actualPaths);
  if (
    expectedPaths.length !== records.length ||
    expectedSet.size !== records.length
  ) {
    throw new Error(
      `Cannot finalize Shengwang redirects: candidate record count ${records.length} does not match unique inventory count ${expectedSet.size}`,
    );
  }
  if (
    expectedSet.size !== actualSet.size ||
    [...expectedSet].some((value) => !actualSet.has(value))
  ) {
    throw new Error(
      'Cannot finalize Shengwang redirects: candidate sources do not match the legacy inventory',
    );
  }

  const allowedStatuses = new Set(['candidate', 'no-redirect']);
  for (const record of records) {
    if (!record || !allowedStatuses.has(record.status) || !record.legacyPath) {
      throw new Error(
        'Cannot finalize Shengwang redirects: candidate contains an invalid record',
      );
    }
    const targetPath = record.target?.split('#', 1)[0];
    const targetExists = targetPath
      ? targetRouteSet.has(targetPath) || applicationRoutes.has(targetPath)
      : false;
    if (record.targetExists !== targetExists) {
      throw new Error(
        `Cannot finalize Shengwang redirects: targetExists mismatch for ${record.legacyPath}`,
      );
    }
    if (record.status === 'candidate' && (!targetPath || !targetExists)) {
      throw new Error(
        `Cannot finalize Shengwang redirects: candidate target is missing for ${record.legacyPath}`,
      );
    }
    if (
      record.status === 'no-redirect' &&
      (record.target || record.targetExists)
    ) {
      throw new Error(
        `Cannot finalize Shengwang redirects: no-redirect record has a target for ${record.legacyPath}`,
      );
    }
  }
}

function normalizePath(value) {
  const parsed = new URL(value, 'https://legacy.invalid');
  let pathname = decodeURIComponent(parsed.pathname).replace(/\/+/g, '/');
  pathname = pathname.replace(/\.html$/, '');
  return pathname.replace(/\/$/, '') || '/';
}

function toNginx(items, targetCommit) {
  const lines = [
    `# Generated from target commit ${targetCommit}.`,
    '# Target URL transform: remove-zh-CN-prefix.',
    '# Deploy only after the target site serves unprefixed routes.',
    '# Same-path requests such as /search are no-redirect; serve them directly.',
    '# Retired content follows src/lib/retired-cn-docs.mjs; its legacy sources remain 404.',
    '# Review before loading into the Shengwang legacy host.',
    '',
  ];
  for (const item of items) {
    lines.push(`location = ${item.legacyPath} {`);
    lines.push(`  return 301 ${item.target};`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
