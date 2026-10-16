import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputRoot = path.join(repoRoot, 'docs/migration/redirect-inputs');
const candidatePath = path.join(
  inputRoot,
  'legacy-url-map-candidate-32883e92e9-2026-10-15.json',
);
const finalMapPath = path.join(inputRoot, 'legacy-url-map.csv');
const finalJsonPath = path.join(inputRoot, 'legacy-url-map.json');
const vercelPath = path.join(
  inputRoot,
  'legacy-url-redirects.vercel.json',
);
const nginxPath = path.join(inputRoot, 'legacy-url-redirects.nginx.conf');

const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));
const records = candidate.records;
const manualReview = records.filter((record) => record.status === 'manual-review');
if (manualReview.length > 0) {
  throw new Error(
    `Cannot finalize Shengwang redirects: ${manualReview.length} manual-review records remain`,
  );
}

const duplicatePaths = findDuplicates(records.map((record) => record.legacyPath));
if (duplicatePaths.length > 0) {
  throw new Error(`Cannot finalize Shengwang redirects: duplicate source paths: ${duplicatePaths.join(', ')}`);
}

const redirects = records.filter((record) => record.status === 'candidate');
const missingTargets = redirects.filter((record) => !record.target || !record.targetExists);
if (missingTargets.length > 0) {
  throw new Error(
    `Cannot finalize Shengwang redirects: ${missingTargets.length} candidate targets are missing`,
  );
}

const finalSummary = {
  total: records.length,
  redirect: redirects.length,
  noRedirect: records.filter((record) => record.status === 'no-redirect').length,
  manualReview: manualReview.length,
  uniqueSourcePaths: new Set(records.map((record) => record.legacyPath)).size,
};

await writeFile(finalMapPath, toCsv(records));
await writeFile(
  finalJsonPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      targetCommit: candidate.targetCommit,
      sourceCandidate: path.relative(repoRoot, candidatePath),
      summary: finalSummary,
      records,
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  vercelPath,
  `${JSON.stringify(
    redirects.map((record) => ({
      source: record.legacyPath,
      destination: record.target,
      statusCode: 301,
      preserveQueryParams: record.preserveQuery,
    })),
    null,
    2,
  )}\n`,
);
await writeFile(nginxPath, toNginx(redirects, candidate.targetCommit));

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

function toNginx(items, targetCommit) {
  const lines = [
    `# Generated from target commit ${targetCommit}.`,
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
