import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * @typedef {{
 *   metaPath: string;
 *   expectedPages: string[];
 *   targetPages: string[];
 * }} PageMismatch
 */

/**
 * @typedef {{
 *   expectedConfig: Record<string, unknown>;
 *   metaPath: string;
 *   targetConfig: Record<string, unknown>;
 * }} StructuralMismatch
 */

/**
 * @typedef {{
 *   missingInTarget: string[];
 *   extraInTarget: string[];
 *   pageMismatches: PageMismatch[];
 *   structuralMismatches: StructuralMismatch[];
 * }} DocsMetaParityResult
 */

/**
 * @param {string} localeRoot
 * @returns {Promise<Map<string, { pages: string[]; structuralConfig: Record<string, unknown> }>>}
 */
async function collectMetaPages(localeRoot) {
  const metaMap = new Map();

  /**
   * @param {string} currentDir
   * @returns {Promise<void>}
   */
  async function visit(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await visit(entryPath);
        continue;
      }

      if (!entry.isFile() || entry.name !== 'meta.json') {
        continue;
      }

      const relativePath = path.relative(localeRoot, entryPath).split(path.sep).join('/');
      const raw = await readFile(entryPath, 'utf8');
      const parsed = JSON.parse(raw);
      const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
      metaMap.set(relativePath, {
        pages,
        structuralConfig: getStructuralConfig(parsed),
      });
    }
  }

  await visit(localeRoot);

  return metaMap;
}

/**
 * @param {Record<string, unknown>} parsed
 * @returns {Record<string, unknown>}
 */
function getStructuralConfig(parsed) {
  return {
    icon: parsed.icon,
    navScope: parsed.navScope,
    root: parsed.root,
  };
}

/**
 * @param {{
 *   baselineRoot: string;
 *   targetRoot: string;
 * }} options
 * @returns {Promise<DocsMetaParityResult>}
 */
export async function compareDocsMetaParity({ baselineRoot, targetRoot }) {
  const [baselineMetaMap, targetMetaMap] = await Promise.all([
    collectMetaPages(baselineRoot),
    collectMetaPages(targetRoot),
  ]);

  const baselinePaths = [...baselineMetaMap.keys()].sort();
  const targetPaths = [...targetMetaMap.keys()].sort();

  const baselinePathSet = new Set(baselinePaths);
  const targetPathSet = new Set(targetPaths);

  /** @type {DocsMetaParityResult} */
  const result = {
    extraInTarget: targetPaths.filter((metaPath) => !baselinePathSet.has(metaPath)),
    missingInTarget: baselinePaths.filter((metaPath) => !targetPathSet.has(metaPath)),
    pageMismatches: [],
    structuralMismatches: [],
  };

  for (const metaPath of baselinePaths) {
    if (!targetPathSet.has(metaPath)) {
      continue;
    }

    const expectedMeta = baselineMetaMap.get(metaPath) ?? {
      pages: [],
      structuralConfig: {},
    };
    const targetMeta = targetMetaMap.get(metaPath) ?? {
      pages: [],
      structuralConfig: {},
    };
    const expectedPages = expectedMeta.pages;
    const targetPages = targetMeta.pages;

    if (JSON.stringify(expectedPages) !== JSON.stringify(targetPages)) {
      result.pageMismatches.push({
        expectedPages,
        metaPath,
        targetPages,
      });
    }

    if (
      JSON.stringify(expectedMeta.structuralConfig) !==
      JSON.stringify(targetMeta.structuralConfig)
    ) {
      result.structuralMismatches.push({
        expectedConfig: expectedMeta.structuralConfig,
        metaPath,
        targetConfig: targetMeta.structuralConfig,
      });
    }
  }

  return result;
}

function formatList(items) {
  return items.map((item) => `  - ${item}`).join('\n');
}

/**
 * @param {DocsMetaParityResult} result
 * @returns {string}
 */
function formatParityReport(result) {
  const sections = [];

  if (result.missingInTarget.length > 0) {
    sections.push(`Missing in target (${result.missingInTarget.length}):\n${formatList(result.missingInTarget)}`);
  }

  if (result.extraInTarget.length > 0) {
    sections.push(`Extra in target (${result.extraInTarget.length}):\n${formatList(result.extraInTarget)}`);
  }

  if (result.pageMismatches.length > 0) {
    sections.push(
      [
        `Page mismatches (${result.pageMismatches.length}):`,
        ...result.pageMismatches.map(
          ({ expectedPages, metaPath, targetPages }) =>
            `  - ${metaPath}\n    expected: ${JSON.stringify(expectedPages)}\n    target:   ${JSON.stringify(targetPages)}`,
        ),
      ].join('\n'),
    );
  }

  if (result.structuralMismatches.length > 0) {
    sections.push(
      [
        `Structural mismatches (${result.structuralMismatches.length}):`,
        ...result.structuralMismatches.map(
          ({ expectedConfig, metaPath, targetConfig }) =>
            `  - ${metaPath}\n    expected: ${JSON.stringify(expectedConfig)}\n    target:   ${JSON.stringify(targetConfig)}`,
        ),
      ].join('\n'),
    );
  }

  return sections.join('\n\n');
}

async function main() {
  const repoRoot = process.cwd();
  const result = await compareDocsMetaParity({
    baselineRoot: path.join(repoRoot, 'content/docs/en'),
    targetRoot: path.join(repoRoot, 'content/docs/zh-CN'),
  });

  const hasDifferences =
    result.missingInTarget.length > 0 ||
    result.extraInTarget.length > 0 ||
    result.pageMismatches.length > 0 ||
    result.structuralMismatches.length > 0;

  if (!hasDifferences) {
    console.log('Docs meta parity check passed.');
    return;
  }

  console.error(formatParityReport(result));
  process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  await main();
}
