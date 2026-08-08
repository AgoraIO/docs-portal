import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const DEFAULT_SOURCE_REPORT = path.join(
  rootDir,
  'docs/agents/reports/2026-08-03-api-ref-docs-links.md',
);
const DEFAULT_OUT_REPORT = path.join(
  rootDir,
  'docs/agents/reports/2026-08-03-api-ref-docs-redirect-triage.md',
);

/**
 * @typedef {object} ApiRefDocsLinkOccurrence
 * @property {string} anchorText
 * @property {string} entry
 * @property {string} group
 * @property {string} rawHref
 * @property {string} sourceApiReferencePage
 */

/**
 * @typedef {object} ApiRefDocsUniqueUrl
 * @property {string} finalUrl
 * @property {string} httpStatus
 * @property {string} legacyRedirect
 * @property {string} error
 * @property {number} number
 * @property {ApiRefDocsLinkOccurrence[]} occurrences
 * @property {string} path
 * @property {string} query
 * @property {string} url
 */

/**
 * @typedef {object} ApiRefDocsPageError
 * @property {string} entry
 * @property {string} group
 * @property {string} message
 * @property {string} sourceApiReferencePage
 * @property {string} status
 */

/**
 * @typedef {object} ApiRefDocsLinksReport
 * @property {ApiRefDocsPageError[]} pageErrors
 * @property {ApiRefDocsUniqueUrl[]} uniqueUrls
 */

/**
 * @typedef {object} ApiRefDocsTriageClassification
 * @property {string} confidence
 * @property {string} decision
 * @property {string} proposedTarget
 */

/**
 * @typedef {object} RenderTriageMarkdownOptions
 * @property {string} [generatedAt]
 * @property {string} [sourceReportPath]
 */

/**
 * @param {string} _markdown
 * @returns {ApiRefDocsLinksReport}
 */
export function parseApiRefDocsLinksReport(markdown = '') {
  const pageErrorsHeading = markdown.search(/^## Page Errors\s*$/m);
  const uniqueSection =
    pageErrorsHeading === -1 ? markdown : markdown.slice(0, pageErrorsHeading);
  const pageErrors =
    pageErrorsHeading === -1
      ? []
      : parsePageErrors(markdown.slice(pageErrorsHeading));

  return {
    pageErrors,
    uniqueUrls: parseUniqueUrlEntries(uniqueSection),
  };
}

function parseUniqueUrlEntries(markdown) {
  const headingMatches = [...markdown.matchAll(/^### (\d+)\. (.+)$/gm)];

  return headingMatches.map((match, index) => {
    const nextMatch = headingMatches[index + 1];
    const block = markdown.slice(
      match.index,
      nextMatch?.index ?? markdown.length,
    );
    const occurrences = parsePipeTable(block).map((row) => ({
      anchorText: row['Anchor text'] ?? '',
      entry: row.Entry ?? '',
      group: row.Group ?? '',
      rawHref: row['Raw href'] ?? '',
      sourceApiReferencePage: row['Source API Reference page'] ?? '',
    }));

    return {
      error: readBulletValue(block, 'Error'),
      finalUrl: readBulletValue(block, 'Final URL'),
      httpStatus: readBulletValue(block, 'HTTP status'),
      legacyRedirect: readBulletValue(block, 'Legacy redirect'),
      number: Number(match[1]),
      occurrences,
      path: readBulletValue(block, 'Path'),
      query: readBulletValue(block, 'Query'),
      url: match[2].trim(),
    };
  });
}

function parsePageErrors(markdown) {
  return parsePipeTable(markdown).map((row) => ({
    entry: row.Entry ?? '',
    group: row.Group ?? '',
    message: row.Message ?? '',
    sourceApiReferencePage: row['Source API Reference page'] ?? '',
    status: row.Status ?? '',
  }));
}

function readBulletValue(block, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(
    new RegExp(`^- ${escapedLabel}:[^\\S\\r\\n]*(.*)$`, 'm'),
  );

  return match ? match[1].trim() : '';
}

function parsePipeTable(markdown) {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'));

  if (lines.length < 2) {
    return [];
  }

  const header = splitTableRow(lines[0]);

  return lines.slice(2).map((line) => {
    const cells = splitTableRow(line);

    return Object.fromEntries(
      header.map((column, index) => [column, cells[index] ?? '']),
    );
  });
}

function splitTableRow(line) {
  const row = line.slice(1, -1);
  const cells = [];
  let current = '';

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const previousChar = row[index - 1];

    if (char === '|' && previousChar !== '\\') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells.map((cell) => cell.replace(/\\\|/g, '|'));
}

/**
 * @param {{ httpStatus?: string, legacyRedirect?: string }} _entry
 * @returns {ApiRefDocsTriageClassification}
 */
export function classifyAuditEntry(entry = {}) {
  if (
    entry.httpStatus === '404' &&
    entry.legacyRedirect === 'legacy redirect missing'
  ) {
    return {
      confidence: 'needs-review',
      decision: 'needs-target-from-owner',
      proposedTarget: '',
    };
  }

  if (
    entry.httpStatus === '404' &&
    entry.legacyRedirect === 'legacy redirect covered'
  ) {
    return {
      confidence: 'needs-review',
      decision: 'fix-existing-redirect',
      proposedTarget: '',
    };
  }

  return { confidence: 'n/a', decision: 'ignore-valid', proposedTarget: '' };
}

/**
 * @param {ApiRefDocsLinksReport} _parsed
 * @param {RenderTriageMarkdownOptions} [_options]
 * @returns {string}
 */
export function renderTriageMarkdown(parsed, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const sourceReportPath =
    options.sourceReportPath ??
    'docs/agents/reports/2026-08-03-api-ref-docs-links.md';
  const rows = [
    ...parsed.uniqueUrls.map((entry) => {
      const classification = classifyAuditEntry(entry);

      return [
        entry.url,
        String(entry.occurrences.length),
        entry.httpStatus,
        entry.legacyRedirect,
        joinCellValues(
          unique(entry.occurrences.map((item) => item.sourceApiReferencePage)),
        ),
        joinCellValues(
          unique(entry.occurrences.map((item) => item.anchorText)),
        ),
        classification.proposedTarget,
        classification.decision,
        classification.confidence,
        evidenceForEntry(entry, classification),
        notesForEntry(classification),
      ];
    }),
    ...parsed.pageErrors.map((error) => [
      error.sourceApiReferencePage,
      '1',
      error.status,
      'n/a',
      error.sourceApiReferencePage,
      'n/a',
      '',
      'source-page-error',
      'n/a',
      `Source API Reference page returned ${error.status}: ${error.message}.`,
      'Not a docs redirect candidate.',
    ]),
  ];

  return [
    '# API Reference docs.agora.io Redirect Triage',
    '',
    `Generated at: ${generatedAt}`,
    '',
    `Source report: \`${sourceReportPath}\``,
    '',
    '## Decision States',
    '',
    '- `add-301`: High-confidence equivalent target exists and has been verified.',
    '- `fix-existing-redirect`: Existing redirect coverage still returns 404 and needs correction.',
    '- `update-api-ref-source`: No equivalent docs page exists; update or remove the API Reference source link.',
    '- `no-equivalent`: The old content has no migrated equivalent and should not redirect.',
    '- `needs-target-from-owner`: Target cannot be found confidently; owner must provide the target URL.',
    '- `ignore-valid`: URL already returns 200 or does not need legacy redirect work.',
    '- `source-page-error`: Source API Reference page itself failed.',
    '',
    '## Triage',
    '',
    '| Legacy URL | Occurrences | Status | Legacy redirect | Source API refs | Anchor texts | Proposed target | Decision | Confidence | Evidence | Notes |',
    '| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.map(escapeMarkdownCell).join(' | ')} |`),
    '',
  ].join('\n');
}

function evidenceForEntry(entry, classification) {
  if (classification.decision === 'needs-target-from-owner') {
    return 'Current URL returns 404 and no high-confidence target has been assigned yet.';
  }

  if (classification.decision === 'fix-existing-redirect') {
    return 'Audit reports existing legacy redirect coverage, but the checked URL still returns 404.';
  }

  return `Current URL status is ${entry.httpStatus}.`;
}

function notesForEntry(classification) {
  if (classification.decision === 'needs-target-from-owner') {
    return 'Owner target required before adding a 301.';
  }

  if (classification.decision === 'fix-existing-redirect') {
    return 'Inspect existing redirect rule and generated Vercel artifact.';
  }

  return 'No redirect change required by default.';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function joinCellValues(values) {
  return values.join('<br>');
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

async function main() {
  const sourceReportPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : DEFAULT_SOURCE_REPORT;
  const outReportPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : DEFAULT_OUT_REPORT;
  const markdown = await fs.readFile(sourceReportPath, 'utf8');
  const parsed = parseApiRefDocsLinksReport(markdown);
  const rendered = renderTriageMarkdown(parsed, {
    sourceReportPath: path.relative(rootDir, sourceReportPath),
  });

  await fs.mkdir(path.dirname(outReportPath), { recursive: true });
  await fs.writeFile(outReportPath, rendered, 'utf8');

  console.log(
    `[api-ref-docs-redirects] unique urls: ${parsed.uniqueUrls.length}`,
  );
  console.log(
    `[api-ref-docs-redirects] page errors: ${parsed.pageErrors.length}`,
  );
  console.log(
    `[api-ref-docs-redirects] wrote: ${path.relative(rootDir, outReportPath)}`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
