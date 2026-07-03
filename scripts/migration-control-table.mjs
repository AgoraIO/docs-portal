import { promises as fs } from 'node:fs';
import path from 'node:path';

export const CONTROL_PROGRESS_COLUMNS = [
  'migration_progress',
  'audit_progress',
  'audit_result',
  'last_migration_report',
  'last_audit_report',
  'updated_at',
];

export function parseCsv(raw) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function stringifyCsv(rows) {
  return `${rows.map((row) => row.map(escapeCsvField).join(',')).join('\n')}\n`;
}

export async function readControlTable(tablePath) {
  const raw = await fs.readFile(tablePath, 'utf8');
  return controlTableFromRows(parseCsv(raw));
}

export function controlTableFromRows(csvRows) {
  const [headers = [], ...bodyRows] = csvRows;
  const rows = bodyRows
    .filter((row) => row.some((field) => field !== ''))
    .map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] ?? '';
      });
      return entry;
    });

  return { headers: [...headers], rows };
}

export async function writeControlTable(tablePath, table) {
  const csvRows = [
    table.headers,
    ...table.rows.map((row) =>
      table.headers.map((header) => row[header] ?? ''),
    ),
  ];
  await fs.writeFile(tablePath, stringifyCsv(csvRows), 'utf8');
}

export function ensureControlProgressColumns(table) {
  for (const column of CONTROL_PROGRESS_COLUMNS) {
    if (!table.headers.includes(column)) {
      table.headers.push(column);
    }
  }

  for (const row of table.rows) {
    for (const column of CONTROL_PROGRESS_COLUMNS) {
      row[column] ??= '';
    }
  }

  return table;
}

export async function updateMigrationProgressInPathMap({
  pathMapPath,
  reportPath,
  repoRoot = process.cwd(),
  results,
  updatedAt = new Date().toISOString(),
}) {
  const table = ensureControlProgressColumns(
    await readControlTable(pathMapPath),
  );
  const bySourcePath = groupBy(results, (result) => result.sourcePath);
  const relativeReportPath = toRepoRelativePath({
    filePath: reportPath,
    repoRoot,
  });
  let updatedRows = 0;

  for (const row of table.rows) {
    const rowResults = bySourcePath.get(row.source_path);
    if (!rowResults?.length) {
      row.migration_progress ||= 'not_started';
      row.audit_progress ||= 'not_started';
      continue;
    }

    const hasTarget = rowResults.some((result) => result.targetPath);
    row.migration_progress = hasTarget ? 'completed' : 'blocked';
    row.audit_progress =
      row.migration_progress === 'completed'
        ? normalizePendingAuditProgress(row.audit_progress)
        : row.audit_progress || 'not_started';
    row.last_migration_report = relativeReportPath;
    row.updated_at = updatedAt;

    if (row.migration_progress === 'completed') {
      row.next_step = 'Run the audit script for this completed migration row.';
    } else {
      row.next_step ||= 'Resolve target path before rerunning migration.';
    }

    updatedRows += 1;
  }

  await writeControlTable(pathMapPath, table);
  return { pathMapPath, updatedRows };
}

export async function updateAuditProgressInPathMap({
  pathMapPath,
  repoRoot = process.cwd(),
  results,
  updatedAt = new Date().toISOString(),
}) {
  const table = ensureControlProgressColumns(
    await readControlTable(pathMapPath),
  );
  const bySourcePath = new Map(
    results.map((result) => [result.sourcePath, result]),
  );
  let updatedRows = 0;

  for (const row of table.rows) {
    const result = bySourcePath.get(row.source_path);
    if (!result) {
      row.migration_progress ||= 'not_started';
      row.audit_progress ||= 'not_started';
      continue;
    }

    row.audit_progress = result.auditProgress;
    row.audit_result = result.auditResult;
    row.last_audit_report = toRepoRelativePath({
      filePath: result.markdownPath,
      repoRoot,
    });
    row.updated_at = updatedAt;

    if (result.auditResult === 'pass') {
      row.next_step = 'Ready for reviewer spot check or batch promotion.';
    } else if (result.auditProgress === 'failed') {
      row.next_step = 'Fix audit input paths and rerun the audit script.';
    } else if (result.auditResult?.startsWith('legacy-residue:')) {
      row.next_step =
        'Remove legacy component residue and rerun the audit script.';
    } else {
      row.next_step = 'Review the audit report and fix content drift.';
    }

    updatedRows += 1;
  }

  await writeControlTable(pathMapPath, table);
  return { pathMapPath, updatedRows };
}

export function selectRowsReadyForAudit(
  table,
  { includeAudited = false } = {},
) {
  return table.rows.filter((row) => {
    if (row.migration_progress !== 'completed') {
      return false;
    }

    if (includeAudited) {
      return true;
    }

    return row.audit_progress !== 'completed';
  });
}

function normalizePendingAuditProgress(currentValue) {
  if (!currentValue || currentValue === 'not_started') {
    return 'pending';
  }

  return currentValue;
}

function groupBy(values, keyFn) {
  const map = new Map();
  for (const value of values) {
    const key = keyFn(value);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(value);
    } else {
      map.set(key, [value]);
    }
  }
  return map;
}

function toRepoRelativePath({ filePath, repoRoot }) {
  if (!filePath) {
    return '';
  }

  const relativePath = path.relative(repoRoot, path.resolve(filePath));
  if (relativePath.startsWith('..')) {
    return toPosix(filePath);
  }

  return toPosix(relativePath);
}

function escapeCsvField(value) {
  const stringValue = String(value ?? '');
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function toPosix(value) {
  return String(value).split(path.sep).join('/');
}
