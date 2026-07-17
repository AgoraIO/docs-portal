import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const HTTP_METHODS = new Set([
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableJson(value[key])]),
    );
  }
  return value;
}

function json(value) {
  return `${JSON.stringify(stableJson(value), null, 2)}\n`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function needsNormalization(value) {
  return (
    String(value ?? '').includes('\n') || /[`>[]/.test(String(value ?? ''))
  );
}

export function normalizeOpenApiShortDescription(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^>\s*/, '')
        .replace(/^[-*]\s+/, ''),
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/>/g, '&gt;')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimBlankLines(lines) {
  const result = [...lines];
  while (result[0]?.trim() === '') result.shift();
  while (result.at(-1)?.trim() === '') result.pop();
  return result;
}

function firstSentence(value) {
  const match = String(value).match(/^([\s\S]*?[。！？.!?])(?:\s|$)/);
  return match?.[1] ?? String(value);
}

export function splitOpenApiDescription(value) {
  const source = String(value ?? '').replace(/\r\n?/g, '\n');
  const contentLines = [];
  const calloutLines = [];
  for (const line of source.split('\n')) {
    const callout = line.match(/^\s*>\s?(.*)$/);
    if (callout) calloutLines.push(callout[1]);
    else contentLines.push(line);
  }
  const content = trimBlankLines(contentLines);
  const firstContentIndex = content.findIndex((line) => line.trim());
  if (firstContentIndex < 0) {
    const callout = trimBlankLines(calloutLines).join('\n');
    return {
      description: normalizeOpenApiShortDescription(callout),
      sections: [],
      callouts: [],
    };
  }
  const line = content[firstContentIndex].trim();
  const summary = firstSentence(line);
  const remainder = trimBlankLines([
    line.slice(summary.length).trim(),
    ...content.slice(firstContentIndex + 1),
  ]).join('\n');
  const callout = trimBlankLines(calloutLines).join('\n');
  return {
    description: normalizeOpenApiShortDescription(summary),
    sections: remainder
      ? [{ position: 'after-description', markdown: remainder }]
      : [],
    callouts: callout
      ? [{ position: 'after-description', markdown: callout }]
      : [],
  };
}

function operations(document) {
  const result = [];
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase()) || !operation?.operationId)
        continue;
      result.push(operation);
    }
  }
  return result;
}

function documentationBlocks(blocks) {
  return (blocks ?? []).map((block) => ({
    position: block.position,
    markdown: block.markdown,
  }));
}

function operationHasStructuredDocumentation(operation) {
  return (
    (operation?.['x-docs-sections']?.length ?? 0) > 0 ||
    (operation?.['x-docs-callouts']?.length ?? 0) > 0
  );
}

function operationMatchesDocumentation(operation, documentation) {
  return (
    operation?.description === documentation.description &&
    JSON.stringify(documentationBlocks(operation?.['x-docs-sections'])) ===
      JSON.stringify(documentationBlocks(documentation.sections)) &&
    JSON.stringify(documentationBlocks(operation?.['x-docs-callouts'])) ===
      JSON.stringify(documentationBlocks(documentation.callouts))
  );
}

function indentOf(line) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function operationFieldRange(lines, blockStart, blockEnd, indent, key) {
  const start = lines.findIndex(
    (line, index) =>
      index >= blockStart &&
      index < blockEnd &&
      indentOf(line) === indent &&
      new RegExp(`^\\s*${key}\\s*:`).test(line),
  );
  if (start < 0) return null;
  let end = start + 1;
  while (end < blockEnd) {
    if (lines[end].trim() && indentOf(lines[end]) <= indent) break;
    end += 1;
  }
  return { start, end };
}

function renderOperationDocumentation(indent, documentation) {
  const normalizeBlocks = (blocks) =>
    blocks.map((block) => ({
      position: block.position,
      markdown: block.markdown,
    }));
  const fields = {
    description: documentation.description,
    ...(documentation.sections.length > 0
      ? { 'x-docs-sections': normalizeBlocks(documentation.sections) }
      : {}),
    ...(documentation.callouts.length > 0
      ? { 'x-docs-callouts': normalizeBlocks(documentation.callouts) }
      : {}),
  };
  return yaml
    .dump(fields, { lineWidth: -1, noRefs: true })
    .trimEnd()
    .split('\n')
    .map((line) => `${' '.repeat(indent)}${line}`);
}

function replaceOperationDocumentation(raw, operationId, documentation) {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const operationPattern = new RegExp(
    `^(\\s*)operationId:\\s*["']?${operationId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?\\s*$`,
  );
  const operationIndex = lines.findIndex((line) => operationPattern.test(line));
  if (operationIndex < 0) {
    throw new Error(`Cannot find operationId ${operationId} in YAML source.`);
  }
  const operationIndent = indentOf(lines[operationIndex]);
  const methodIndent = Math.max(0, operationIndent - 2);
  let blockStart = operationIndex;
  while (blockStart >= 0) {
    const trimmed = lines[blockStart].trim();
    if (
      indentOf(lines[blockStart]) === methodIndent &&
      HTTP_METHODS.has(trimmed.replace(/:$/, '').toLowerCase())
    ) {
      break;
    }
    blockStart -= 1;
  }
  if (blockStart < 0)
    throw new Error(`Cannot find method block for ${operationId}.`);
  let blockEnd = operationIndex + 1;
  while (blockEnd < lines.length) {
    if (lines[blockEnd].trim() && indentOf(lines[blockEnd]) <= methodIndent)
      break;
    blockEnd += 1;
  }
  const ranges = [
    operationFieldRange(
      lines,
      blockStart,
      blockEnd,
      operationIndent,
      'description',
    ),
    operationFieldRange(
      lines,
      blockStart,
      blockEnd,
      operationIndent,
      'x-docs-sections',
    ),
    operationFieldRange(
      lines,
      blockStart,
      blockEnd,
      operationIndent,
      'x-docs-callouts',
    ),
  ].filter(Boolean);
  if (!ranges.some((range) => /^\s*description\s*:/.test(lines[range.start]))) {
    throw new Error(`Cannot find operation description for ${operationId}.`);
  }
  const insertionIndex = Math.min(...ranges.map((range) => range.start));
  const replacement = renderOperationDocumentation(
    operationIndent,
    documentation,
  );
  return [
    ...lines.slice(0, insertionIndex),
    ...replacement,
    ...lines
      .slice(insertionIndex, blockEnd)
      .filter(
        (_line, relativeIndex) =>
          !ranges.some(
            (range) =>
              insertionIndex + relativeIndex >= range.start &&
              insertionIndex + relativeIndex < range.end,
          ),
      ),
    ...lines.slice(blockEnd),
  ].join('\n');
}

async function authoritativeDescriptionMap(manifest, oldRoot) {
  const result = new Map();
  if (!oldRoot) return result;
  const documents = new Map();
  for (const page of manifest.pageEvidence ?? []) {
    const resolution = page.sourceResolution;
    if (
      page.aliasOf ||
      resolution?.type !== 'openapi' ||
      !resolution.sourcePath ||
      !resolution.legacyOperationId ||
      !resolution.targetOperationId
    ) {
      continue;
    }
    let document = documents.get(resolution.sourcePath);
    if (!document) {
      document = yaml.load(
        await fs.readFile(path.resolve(oldRoot, resolution.sourcePath), 'utf8'),
      );
      documents.set(resolution.sourcePath, document);
    }
    const sourceOperation = operations(document).find(
      (operation) => operation.operationId === resolution.legacyOperationId,
    );
    if (sourceOperation?.description) {
      result.set(
        `${resolution.targetPath}:${resolution.targetOperationId}`,
        String(sourceOperation.description),
      );
    }
  }
  return result;
}

function reportMarkdown(report) {
  const lines = [
    '# API Center OpenAPI Description Normalization',
    '',
    '> Generated by `scripts/normalize-api-center-openapi.mjs`. Do not edit by hand.',
    '',
    `- Normalized files: ${report.counts.normalizedFiles}`,
    `- Normalized operations: ${report.counts.normalizedOperations}`,
    `- Warnings: ${report.counts.warnings}`,
    `- Errors: ${report.counts.errors}`,
    '',
    '## Migration types',
    '',
    `- \`openapi-description-normalization\`: ${report.counts.normalizedOperations}`,
    '',
    '## Warning explanations',
    '',
    '- None.',
    '',
    '## Operations',
    '',
    '| Target | Operation ID | Normalized description |',
    '| --- | --- | --- |',
  ];
  for (const record of report.operations) {
    lines.push(
      `| \`${record.targetPath}\` | \`${record.operationId}\` | ${record.normalizedDescription.replace(/\|/g, '\\|')} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export async function runOpenApiNormalizer({
  repoRoot = process.cwd(),
  manifestPath = 'docs/migration/api-center-html-manifest.json',
  ownershipPath = 'docs/migration/api-center-openapi-normalized-descriptions.json',
  reportJsonPath = 'docs/migration/api-center-openapi-normalization-report.json',
  reportMarkdownPath = 'docs/migration/api-center-openapi-normalization-report.md',
  oldRoot = process.env.API_CENTER_OLD_ROOT,
  mode = 'write',
} = {}) {
  const root = path.resolve(repoRoot);
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(root, manifestPath), 'utf8'),
  );
  const previous = await readJson(path.resolve(root, ownershipPath), {
    schemaVersion: 1,
    operations: [],
  });
  const previousByKey = new Map(
    (previous.operations ?? []).map((record) => [
      `${record.targetPath}:${record.operationId}`,
      record,
    ]),
  );
  const targetPaths = uniqueTargetPaths(manifest);
  const authoritativeDescriptions = await authoritativeDescriptionMap(
    manifest,
    oldRoot,
  );
  const nextRecords = [];
  const outputs = [];

  for (const targetPath of targetPaths) {
    const absolute = path.resolve(root, targetPath);
    const originalRaw = await fs.readFile(absolute, 'utf8');
    const document = yaml.load(originalRaw);
    let nextRaw = originalRaw;
    for (const operation of operations(document)) {
      const key = `${targetPath}:${operation.operationId}`;
      const prior = previousByKey.get(key);
      if (
        prior &&
        operationHasStructuredDocumentation(operation) &&
        !operationMatchesDocumentation(
          operation,
          splitOpenApiDescription(prior.originalDescription),
        )
      ) {
        continue;
      }
      if (!prior && !needsNormalization(operation.description)) continue;
      const originalDescription =
        prior?.originalDescription ??
        authoritativeDescriptions.get(key) ??
        String(operation.description);
      const split = splitOpenApiDescription(originalDescription);
      const documentation = {
        description: split.description,
        sections: prior?.docsSections ?? split.sections,
        callouts: prior?.docsCallouts ?? split.callouts,
      };
      nextRaw = replaceOperationDocumentation(
        nextRaw,
        operation.operationId,
        documentation,
      );
      nextRecords.push({
        targetPath,
        operationId: operation.operationId,
        normalizedDescription: documentation.description,
        originalDescription,
        docsSections: documentation.sections,
        docsCallouts: documentation.callouts,
        originalDescriptionHash:
          prior?.originalDescriptionHash ?? sha256(originalDescription),
      });
    }
    outputs.push({ absolute, targetPath, contents: nextRaw });
  }

  nextRecords.sort(
    (left, right) =>
      left.targetPath.localeCompare(right.targetPath) ||
      left.operationId.localeCompare(right.operationId),
  );
  const ownership = {
    schemaVersion: 1,
    sourceCommit: manifest.source?.commit ?? null,
    operations: nextRecords,
  };
  const report = stableJson({
    schemaVersion: 1,
    sourceCommit: manifest.source?.commit ?? null,
    counts: {
      normalizedFiles: uniqueTargetCount(nextRecords),
      normalizedOperations: nextRecords.length,
      warnings: 0,
      errors: 0,
    },
    operations: nextRecords,
  });
  const generated = [
    [ownershipPath, json(ownership)],
    [reportJsonPath, json(report)],
    [reportMarkdownPath, reportMarkdown(report)],
  ];

  if (mode === 'check') {
    for (const output of outputs) {
      const actual = await fs.readFile(output.absolute, 'utf8');
      if (actual !== output.contents) {
        throw new Error(
          `OpenAPI description normalization is stale: ${output.targetPath}`,
        );
      }
    }
    for (const [targetPath, contents] of generated) {
      const actual = await fs.readFile(path.resolve(root, targetPath), 'utf8');
      if (actual !== contents)
        throw new Error(`Generated file is stale: ${targetPath}`);
    }
  } else if (mode === 'write') {
    for (const output of outputs) {
      await fs.writeFile(output.absolute, output.contents, 'utf8');
    }
    for (const [targetPath, contents] of generated) {
      const absolute = path.resolve(root, targetPath);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, contents, 'utf8');
    }
  } else if (mode !== 'dry-run') {
    throw new Error(`Unsupported OpenAPI normalizer mode: ${mode}`);
  }
  return report;
}

function uniqueTargetPaths(manifest) {
  return [
    ...new Set(
      (manifest.pageEvidence ?? [])
        .filter(
          (page) => !page.aliasOf && page.sourceResolution?.type === 'openapi',
        )
        .map((page) => page.sourceResolution.targetPath)
        .filter(Boolean),
    ),
  ].sort();
}

function uniqueTargetCount(records) {
  return new Set(records.map((record) => record.targetPath)).size;
}
