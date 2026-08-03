import fs from 'node:fs/promises';

const DEFAULT_TRIAGE_REPORT =
  'docs/agents/reports/2026-08-03-api-ref-docs-redirect-triage.md';
const UNRESOLVED_DECISIONS = new Set([
  'needs-target-from-owner',
  'update-api-ref-source',
  'no-equivalent',
]);

export function parseTriageRows(markdown) {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('| https://'))
    .map((line) => {
      const cells = splitTableRow(line);
      const legacyUrl = cells[0] ?? '';
      const url = new URL(legacyUrl);

      return {
        confidence: cells[8] ?? '',
        decision: cells[7] ?? '',
        legacyPath: decodeURI(url.pathname),
        legacySearch: url.search,
        legacyUrl,
        proposedTarget: cells[6] ?? '',
      };
    });
}

function splitTableRow(line) {
  const cells = [];
  let current = '';
  const row = line.slice(1, -1);

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];

    if (char === '|' && row[index - 1] !== '\\') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/\\\|/g, '|'));
}

export function verifyApiRefRedirectTriage({
  bulkRedirects,
  redirectsConfig,
  staticRedirects,
  triageMarkdown,
  vercelConfig,
}) {
  const errors = [];
  const triageRows = parseTriageRows(triageMarkdown);
  const sourceRulesByPathSearch = new Map(
    redirectsConfig.rules.map((rule) => [pathSearchKey(rule), rule]),
  );

  for (const row of triageRows) {
    const sourceRule = sourceRulesByPathSearch.get(pathSearchKey(row));

    if (UNRESOLVED_DECISIONS.has(row.decision) && sourceRule) {
      errors.push(
        `Unresolved triage row must not be in redirects.json: ${row.legacyUrl}`,
      );
    }

    if (row.decision !== 'add-301') {
      continue;
    }

    if (row.confidence !== 'high') {
      errors.push(`add-301 row must be high confidence: ${row.legacyUrl}`);
    }

    if (!row.proposedTarget.startsWith('/')) {
      errors.push(`add-301 row must have a docs target: ${row.legacyUrl}`);
    }

    if (!sourceRule) {
      errors.push(`add-301 row missing from redirects.json: ${row.legacyUrl}`);
      continue;
    }

    if (sourceRule.target !== row.proposedTarget) {
      errors.push(
        `redirects.json target mismatch for ${row.legacyUrl}: expected ${row.proposedTarget}, got ${sourceRule.target}`,
      );
    }

    verifyStaticRedirect({ errors, row, sourceRule, staticRedirects });
    verifyVercelRedirect({
      bulkRedirects,
      errors,
      row,
      sourceRule,
      vercelConfig,
    });
  }

  return errors;
}

function verifyStaticRedirect({ errors, row, sourceRule, staticRedirects }) {
  const staticRule = staticRedirects.find(
    (rule) =>
      normalizePath(rule.p) === normalizePath(sourceRule.legacyPath) &&
      (rule.q ?? '') === (sourceRule.legacySearch ?? '') &&
      rule.t === sourceRule.target,
  );

  if (!staticRule) {
    errors.push(`static redirect artifact missing: ${row.legacyUrl}`);
    return;
  }

  const expectedPreserveSearch = sourceRule.preserveSearch;
  const actualPreserveSearch = staticRule.s !== 0;

  if (actualPreserveSearch !== expectedPreserveSearch) {
    errors.push(
      `static redirect preserveSearch mismatch for ${row.legacyUrl}: expected ${expectedPreserveSearch}, got ${actualPreserveSearch}`,
    );
  }
}

function verifyVercelRedirect({
  bulkRedirects,
  errors,
  row,
  sourceRule,
  vercelConfig,
}) {
  const bulkRule = bulkRedirects.find(
    (rule) =>
      normalizePath(rule.source) === normalizePath(sourceRule.legacyPath) &&
      rule.destination === sourceRule.target &&
      rule.statusCode === 301,
  );

  if (bulkRule) {
    if (Boolean(bulkRule.preserveQueryParams) !== sourceRule.preserveSearch) {
      errors.push(
        `Vercel redirect preserveQueryParams mismatch for ${row.legacyUrl}: expected ${sourceRule.preserveSearch}, got ${Boolean(bulkRule.preserveQueryParams)}`,
      );
    }
    return;
  }

  const queryRule = (vercelConfig.redirects ?? []).find(
    (rule) =>
      normalizePath(rule.source) === normalizePath(sourceRule.legacyPath) &&
      rule.destination === sourceRule.target &&
      rule.statusCode === 301 &&
      queryConditionsMatch(rule.has, sourceRule.legacySearch),
  );

  if (!queryRule) {
    errors.push(`Vercel redirect artifact missing: ${row.legacyUrl}`);
  }
}

function queryConditionsMatch(has = [], legacySearch = '') {
  const query = parseLegacySearch(legacySearch);
  const queryConditions = has.filter((condition) => condition.type === 'query');

  return (
    queryConditions.length === Object.keys(query).length &&
    Object.entries(query).every(([key, value]) =>
      queryConditions.some(
        (condition) => condition.key === key && condition.value === value,
      ),
    )
  );
}

function parseLegacySearch(search) {
  if (!search) {
    return {};
  }

  return Object.fromEntries(
    new URLSearchParams(search.startsWith('?') ? search : `?${search}`),
  );
}

function pathSearchKey(item) {
  return `${normalizePath(item.legacyPath)}\0${item.legacySearch ?? ''}`;
}

function normalizePath(path) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

async function main() {
  const [
    triageMarkdown,
    redirectsConfig,
    staticRedirects,
    bulkRedirects,
    vercelConfig,
  ] = await Promise.all([
    fs.readFile(DEFAULT_TRIAGE_REPORT, 'utf8'),
    fs
      .readFile('src/lib/legacy-sitemap/redirects.json', 'utf8')
      .then(JSON.parse),
    fs
      .readFile('src/lib/legacy-sitemap/static-redirects.json', 'utf8')
      .then(JSON.parse),
    fs.readFile('vercel-legacy-redirects.json', 'utf8').then(JSON.parse),
    fs.readFile('vercel.json', 'utf8').then(JSON.parse),
  ]);
  const errors = verifyApiRefRedirectTriage({
    bulkRedirects,
    redirectsConfig,
    staticRedirects,
    triageMarkdown,
    vercelConfig,
  });

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log('[api-ref-docs-redirects] triage redirects verified');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
