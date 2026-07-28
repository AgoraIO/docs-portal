import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import yaml from 'js-yaml';
import { resolveExistingApiCenterTarget } from './existing-targets.mjs';
import {
  API_CENTER_GENERATOR_CONVERSION_OPTIONS,
  apiCenterHtmlConversionProfile,
  extractHtmlPageMetadata,
} from './html-to-mdx.mjs';
import { splitOpenApiDescription } from './openapi-normalizer.mjs';

const API_REFERENCE_ROOT = 'content/docs/zh-CN/api-reference/';
const OWNERSHIP_PATHS = [
  'docs/migration/api-center-generated-files.json',
  'docs/migration/api-center-manual-generated-files.json',
  'docs/migration/api-center-navigation-generated-files.json',
];
const GENERATOR_SOURCE_PATHS = [
  'scripts/lib/api-center/generator-runner.mjs',
  'scripts/lib/api-center/html-to-mdx.mjs',
  'scripts/lib/api-center/manual-mdx-runner.mjs',
  'scripts/lib/api-center/navigation-runner.mjs',
  'scripts/migrate-legacy-docs.mjs',
];
const FORBIDDEN_GENERATED_TEXT = [
  ['authored-overview-title', /API 参考概览/],
  [
    'authored-overview-description',
    /按旧站 API Center 的产品、平台和语言顺序浏览完整 API 参考/,
  ],
  ['authored-overview-body', /旧站 API Center 中可见的产品、平台和语言入口/],
  ['authored-image-alt', /API 文档图片/],
  ['authored-generic-image-alt', /!\[guide\]/],
  ['authored-table-column', /\bColumn \d+\b/],
];
const FORBIDDEN_NAVIGATION_TEXT = [
  ['authored-navigation-heading', /^## 接口目录\s*$/m],
  ['authored-openapi-description', /的服务端接口参考。/],
];
const FORBIDDEN_GENERATOR_FALLBACKS = [
  ['image-alt-fallback', /['"`]API 文档图片['"`]/],
  ['guide-alt-fallback', /['"`]guide['"`]/],
  ['table-column-fallback', /`Column \$\{/],
  ['tab-title-fallback', /\?\? ['"`]Tab['"`]/],
  ['details-title-fallback', /\?\? ['"`]Details['"`]/],
];
const ALLOWED_RESOLUTION_TYPES = new Set([
  'alias',
  'broken-live-link',
  'generated-html',
  'manual-mdx',
  'openapi',
]);
const ALLOWED_TARGET_DECISIONS = new Set([
  'path-map',
  'path-map-alternate-extension',
  'existing-target-layout-over-stale-path-map',
  'api-reference-over-section-path-map',
  'api-reference-supplement',
  'inferred-from-docs-api-reference/rtm2/enumv.android.ios.cpp.flutter.swift.harmonyos.mdx',
]);
const execFileAsync = promisify(execFile);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function splitFrontmatter(source) {
  const match = String(source).match(
    /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/,
  );
  if (!match) return { data: {}, body: String(source) };
  return {
    data: yaml.load(match[1]) ?? {},
    body: String(source).slice(match[0].length),
  };
}

function normalizeDescription(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function docsPathToRoute(targetPath) {
  if (!targetPath?.startsWith('content/docs/') || !/\.mdx?$/.test(targetPath)) {
    return null;
  }
  const route = `/${targetPath
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx?$/, '')
    .split('/')
    .filter((segment) => segment !== '(current)')
    .join('/')}`;
  return route.replace(/\/index$/, '');
}

function issue(code, message, details = {}) {
  return { severity: 'error', code, message, ...details };
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function localSourcePath({ repoRoot, oldRoot, sourcePath }) {
  if (!sourcePath) return null;
  if (path.isAbsolute(sourcePath)) return sourcePath;
  if (
    sourcePath.startsWith('content/') ||
    sourcePath.startsWith('docs/migration/')
  ) {
    return path.resolve(repoRoot, sourcePath);
  }
  return path.resolve(oldRoot, sourcePath);
}

async function fetchLiveBundle(apiCenterUrl) {
  const response = await fetch(apiCenterUrl);
  if (!response.ok) {
    throw new Error(`Live API Center returned HTTP ${response.status}.`);
  }
  const html = await response.text();
  const match = html.match(
    /<script[^>]+src=["']([^"']*\/assets\/js\/main\.[^"']+\.js)["']/i,
  );
  if (!match)
    throw new Error('Could not locate the deployed API Center main bundle.');
  const bundleUrl = new URL(match[1], response.url).href;
  const bundleResponse = await fetch(bundleUrl);
  if (!bundleResponse.ok) {
    throw new Error(
      `Live API Center bundle returned HTTP ${bundleResponse.status}.`,
    );
  }
  return { bundleUrl, text: await bundleResponse.text() };
}

async function listBaseFiles(repoRoot, baseRef) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['ls-tree', '-r', '--name-only', baseRef, '--', 'content/docs/zh-CN'],
      { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 },
    );
    return new Set(stdout.split(/\r?\n/).filter(Boolean));
  } catch {
    return null;
  }
}

async function readGitHead(repoRoot) {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

async function readBaseFile(repoRoot, baseRef, targetPath) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['show', `${baseRef}:${targetPath}`],
      { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 },
    );
    return stdout;
  } catch {
    return null;
  }
}

function normalizeLegacyUrl(value) {
  if (!value) return null;
  const url = new URL(value, 'https://doc.shengwang.cn');
  url.hash = '';
  url.pathname = url.pathname.replace(/\.html$/i, '');
  return url.href;
}

function sourceLabelsByUrl(manifest) {
  const labels = new Map();
  for (const entry of manifest.entries ?? []) {
    for (const sourceUrl of [
      entry.legacyUrl,
      ...(entry.pageGraph?.pages ?? []).map((page) => page.url),
    ]) {
      const key = normalizeLegacyUrl(sourceUrl);
      if (!key) continue;
      labels.set(key, {
        platformLabel: entry.label,
        productLabel: entry.product,
      });
    }
  }
  return labels;
}

function sourceLabelsByScope(manifest) {
  const labels = new Map();
  for (const entry of manifest.entries ?? []) {
    const segments = new URL(entry.legacyUrl).pathname
      .split('/')
      .filter(Boolean);
    const scopeKey = segments.slice(0, 3).join('/');
    const current = labels.get(scopeKey);
    if (!current) {
      labels.set(scopeKey, {
        platformLabel: entry.label,
        productLabel: entry.product,
      });
    } else if (current.productLabel !== entry.product) {
      labels.set(scopeKey, {
        platformLabel:
          current.platformLabel === entry.label ? entry.label : null,
        productLabel: null,
      });
    }
  }
  return labels;
}

function openApiOperations(document) {
  const result = new Map();
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {})) {
      if (operation?.operationId) result.set(operation.operationId, operation);
    }
  }
  return result;
}

function reportMarkdown(report) {
  const lines = [
    '# API Center Provenance, Placement, and Assumption Audit',
    '',
    '> Generated by `scripts/audit-api-center-provenance.mjs`. Do not edit by hand.',
    '',
    `- Result: ${report.status}`,
    `- Source-provenance errors: ${report.counts.sourceProvenanceErrors}`,
    `- Placement errors: ${report.counts.placementErrors}`,
    `- Unapproved requirement assumptions: ${report.counts.unapprovedRequirementAssumptions}`,
    `- Source-text requests: ${report.counts.sourceTextRequests}`,
    `- Live entries verified: ${report.liveEvidence.matchedEntries}/${report.liveEvidence.entries}`,
    `- Internal entries found in deployed bundle: ${report.liveEvidence.bundleMatchedEntries}/${report.liveEvidence.bundleEntries}`,
    `- External entries verified by rendered snapshot plus source data: ${report.liveEvidence.externalSnapshotEntries}`,
    '',
    '## Source provenance',
    '',
    `- Owned MDX pages checked: ${report.counts.ownedMdxFiles}`,
    `- Ownership source paths checked: ${report.counts.ownershipSourcePaths}`,
    `- Generator fallback violations: ${report.counts.generatorFallbackViolations}`,
    `- Generated-text violations: ${report.counts.generatedTextViolations}`,
    `- Generated HTML descriptions checked: ${report.counts.generatedHtmlDescriptionsChecked}`,
    `- Generated HTML descriptions present: ${report.counts.generatedHtmlDescriptionsPresent}`,
    `- Generated HTML description provenance violations: ${report.counts.generatedHtmlDescriptionViolations}`,
    `- Runtime label substitutions checked: ${report.counts.runtimeLabelSubstitutions}`,
    `- Provenance-matched OpenAPI normalizations: ${report.counts.openapiNormalizedProvenanceMatches}`,
    `  - Legacy-source descriptions: ${report.counts.openapiNormalizedLegacyMatches}`,
    `  - Preserved base descriptions: ${report.counts.openapiNormalizedBaseMatches}`,
    '',
    '## Placement',
    '',
    `- Logical legacy pages: ${report.counts.logicalPages}`,
    `- Classified legacy pages: ${report.counts.classifiedPages}`,
    `- Existing local targets: ${report.counts.existingTargets}`,
    `- Direct target routes: ${report.counts.directTargetRoutes}`,
    `- Explicit existing-route projections: ${report.counts.existingRouteProjections}`,
    `- OpenAPI-routed targets: ${report.counts.openapiTargets}`,
    `- Preserved pre-existing targets outside API Reference: ${report.counts.preservedExistingOutsideScope}`,
    `- Local links checked: ${report.counts.localLinksChecked}`,
    `- Reachable OpenAPI operations checked: ${report.counts.openapiReachableOperations}`,
    '',
    '### Target decisions',
    '',
    ...Object.entries(report.targetDecisions).map(
      ([name, count]) => `- \`${name}\`: ${count}`,
    ),
    '',
    '## Requirement boundary',
    '',
    ...report.explicitRequirements.map(
      (item) => `- \`${item.id}\`: ${item.evidence}`,
    ),
    '',
    '### Technical decisions (not recorded as user requirements)',
    '',
    ...report.technicalDecisions.map(
      (item) => `- \`${item.id}\`: ${item.evidence}`,
    ),
    '',
    '## Source-text requests',
    '',
  ];
  if (report.sourceTextRequests.length === 0) {
    lines.push('- None.', '');
  } else {
    lines.push('| Target | Source URL | Missing text |', '| --- | --- | --- |');
    for (const request of report.sourceTextRequests) {
      lines.push(
        `| \`${request.targetPath}\` | ${request.sourceUrl ?? ''} | ${request.message.replace(/\|/g, '\\|')} |`,
      );
    }
    lines.push('');
  }
  lines.push('## Errors', '');
  if (report.errors.length === 0) {
    lines.push('- None.', '');
  } else {
    lines.push(
      '| Axis | Code | Target/source | Message |',
      '| --- | --- | --- | --- |',
    );
    for (const item of report.errors) {
      lines.push(
        `| ${item.axis} | ${item.code} | \`${item.targetPath ?? item.sourcePath ?? ''}\` | ${item.message.replace(/\|/g, '\\|')} |`,
      );
    }
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * @param {{
 *   repoRoot?: string;
 *   oldRoot?: string;
 *   manifestPath?: string;
 *   ownershipPaths?: string[];
 *   liveBundleUrl?: string | null;
 *   liveBundleText?: string | null;
 *   baseRef?: string;
 * }} options
 */
export async function auditApiCenterProvenance({
  repoRoot = process.cwd(),
  oldRoot,
  manifestPath = 'docs/migration/api-center-html-manifest.json',
  ownershipPaths = OWNERSHIP_PATHS,
  liveBundleUrl = /** @type {string | null} */ (null),
  liveBundleText = /** @type {string | null} */ (null),
  baseRef = 'origin/CN-NEWDOC',
} = {}) {
  if (!oldRoot) throw new Error('oldRoot is required.');
  const root = path.resolve(repoRoot);
  const legacyRoot = path.resolve(oldRoot);
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(root, manifestPath), 'utf8'),
  );
  const legacyHead = await readGitHead(legacyRoot);
  const labelsByUrl = sourceLabelsByUrl(manifest);
  const labelsByScope = sourceLabelsByScope(manifest);
  const resolutionBySourceUrl = new Map(
    (manifest.pageEvidence ?? []).map((page) => [
      normalizeLegacyUrl(page.requestedUrl),
      page.sourceResolution,
    ]),
  );
  const ledgers = await Promise.all(
    ownershipPaths.map(async (ownershipPath) => ({
      ownershipPath,
      ledger: JSON.parse(
        await fs.readFile(path.resolve(root, ownershipPath), 'utf8'),
      ),
    })),
  );
  const ownedTargetPaths = new Set(
    ledgers.flatMap(({ ledger }) =>
      (ledger.files ?? []).map((record) => record.targetPath),
    ),
  );
  const baseFiles = await listBaseFiles(root, baseRef);
  const errors = [];
  const sourceTextRequests = [];
  let ownedMdxFiles = 0;
  let ownershipSourcePaths = 0;
  let generatedTextViolations = 0;
  let generatedHtmlDescriptionsChecked = 0;
  let generatedHtmlDescriptionsPresent = 0;
  let generatedHtmlDescriptionViolations = 0;
  let runtimeLabelSubstitutions = 0;

  for (const { ownershipPath, ledger } of ledgers) {
    for (const record of ledger.files ?? []) {
      const sourceAbsolute = localSourcePath({
        repoRoot: root,
        oldRoot: legacyRoot,
        sourcePath: record.sourcePath,
      });
      if (sourceAbsolute) {
        ownershipSourcePaths += 1;
        if (!(await exists(sourceAbsolute))) {
          errors.push({
            ...issue(
              'missing-authoritative-source',
              'The ownership ledger source path does not exist.',
              { sourcePath: record.sourcePath, targetPath: record.targetPath },
            ),
            axis: 'source-provenance',
          });
        }
      }
      if (!record.targetPath.endsWith('.mdx')) continue;
      ownedMdxFiles += 1;
      if (!record.targetPath.startsWith(API_REFERENCE_ROOT)) {
        errors.push({
          ...issue(
            'owned-mdx-outside-api-reference',
            'Generated MDX is outside content/docs/zh-CN/api-reference.',
            { targetPath: record.targetPath },
          ),
          axis: 'placement',
        });
      }
      const targetAbsolute = path.resolve(root, record.targetPath);
      if (!(await exists(targetAbsolute))) continue;
      const source = await fs.readFile(targetAbsolute, 'utf8');
      const parsed = splitFrontmatter(source);
      if (
        record.type === 'generated-html' &&
        sourceAbsolute &&
        (await exists(sourceAbsolute))
      ) {
        generatedHtmlDescriptionsChecked += 1;
        const generator = parsed.data?._migration?.generator;
        const conversionOptions =
          API_CENTER_GENERATOR_CONVERSION_OPTIONS[generator];
        const legacyHtml = await fs.readFile(sourceAbsolute, 'utf8');
        const expectedDescription = conversionOptions
          ? extractHtmlPageMetadata({
              html: legacyHtml,
              conversionProfile: apiCenterHtmlConversionProfile({
                sourcePath: record.sourcePath,
              }),
              ...conversionOptions,
            }).description
          : '';
        const actualDescription = normalizeDescription(parsed.data.description);
        if (actualDescription) generatedHtmlDescriptionsPresent += 1;
        if (!conversionOptions || actualDescription !== expectedDescription) {
          generatedHtmlDescriptionViolations += 1;
          errors.push({
            ...issue(
              'generated-html-description-source-drift',
              'Generated HTML frontmatter description must exactly derive from the authoritative page-level source summary.',
              {
                sourcePath: record.sourcePath,
                targetPath: record.targetPath,
                generator: generator ?? null,
                expectedDescription,
                actualDescription,
              },
            ),
            axis: 'source-provenance',
          });
        }
      }
      const checks = [
        ...FORBIDDEN_GENERATED_TEXT,
        ...(ownershipPath.includes('navigation')
          ? FORBIDDEN_NAVIGATION_TEXT
          : []),
      ];
      for (const [code, pattern] of checks) {
        if (!pattern.test(source)) continue;
        generatedTextViolations += 1;
        errors.push({
          ...issue(
            code,
            'Generated MDX contains text introduced by a migration fallback.',
            {
              targetPath: record.targetPath,
            },
          ),
          axis: 'source-provenance',
        });
      }
      const migration = parsed.data?._migration ?? {};
      const sourcePaths = [
        migration.sourcePath,
        ...(migration.sourcePaths ?? []),
      ].filter(Boolean);
      for (const sourcePath of new Set(sourcePaths)) {
        const absolute = localSourcePath({
          repoRoot: root,
          oldRoot: legacyRoot,
          sourcePath,
        });
        if (!(await exists(absolute))) {
          errors.push({
            ...issue(
              'missing-frontmatter-source',
              'A frontmatter provenance source path does not exist.',
              { sourcePath, targetPath: record.targetPath },
            ),
            axis: 'source-provenance',
          });
          continue;
        }
        if (record.type !== 'manual-mdx') continue;
        const legacySource = await fs.readFile(absolute, 'utf8');
        const recordSourceUrl = normalizeLegacyUrl(
          migration.sourceUrl ?? record.sourceUrl,
        );
        const sourceLabels =
          labelsByUrl.get(recordSourceUrl) ??
          labelsByScope.get(
            resolutionBySourceUrl.get(recordSourceUrl)?.route?.scopeKey,
          );
        for (const [variable, label] of [
          ['ag_product_label', sourceLabels?.productLabel],
          ['ag_platform_label', sourceLabels?.platformLabel],
        ]) {
          if (!legacySource.includes(variable)) continue;
          runtimeLabelSubstitutions += 1;
          if (label && source.includes(label)) continue;
          errors.push({
            ...issue(
              'runtime-label-not-source-derived',
              `${variable} was not substituted with the API Center source label.`,
              { sourcePath, targetPath: record.targetPath },
            ),
            axis: 'source-provenance',
          });
        }
      }
      for (const warning of migration.warnings ?? []) {
        if (warning.code !== 'missing-source-text') continue;
        sourceTextRequests.push({
          targetPath: record.targetPath,
          sourceUrl: migration.sourceUrl ?? record.sourceUrl,
          message: warning.message,
          signal: warning.signal ?? null,
        });
      }
    }
  }

  if (legacyHead && legacyHead !== manifest.source.commit) {
    errors.push({
      ...issue(
        'legacy-source-commit-drift',
        'The legacy checkout HEAD does not match the commit recorded by the manifest.',
        { sourcePath: legacyRoot },
      ),
      axis: 'source-provenance',
    });
  }

  const openApiNormalization = JSON.parse(
    await fs.readFile(
      path.resolve(
        root,
        'docs/migration/api-center-openapi-normalized-descriptions.json',
      ),
      'utf8',
    ),
  );
  const openApiEvidence = new Map(
    (manifest.pageEvidence ?? [])
      .filter(
        (page) => !page.aliasOf && page.sourceResolution?.type === 'openapi',
      )
      .map((page) => [
        `${page.sourceResolution.targetPath}:${page.sourceResolution.targetOperationId}`,
        page.sourceResolution,
      ]),
  );
  const openApiDocuments = new Map();
  const readOpenApiOperations = async (absolute) => {
    if (!openApiDocuments.has(absolute)) {
      openApiDocuments.set(
        absolute,
        openApiOperations(yaml.load(await fs.readFile(absolute, 'utf8'))),
      );
    }
    return openApiDocuments.get(absolute);
  };
  let openapiNormalizedLegacyMatches = 0;
  let openapiNormalizedBaseMatches = 0;
  const baseOpenApiDocuments = new Map();
  const documentationBlocks = (blocks) =>
    (blocks ?? []).map((block) => ({
      markdown: block.markdown,
      position: block.position,
    }));
  const blocksMatch = (left, right) =>
    JSON.stringify(documentationBlocks(left)) ===
    JSON.stringify(documentationBlocks(right));
  const documentationMatches = (record, documentation) =>
    record.normalizedDescription === documentation.description &&
    blocksMatch(record.docsSections, documentation.sections) &&
    blocksMatch(record.docsCallouts, documentation.callouts);
  for (const record of openApiNormalization.operations ?? []) {
    const resolution = openApiEvidence.get(
      `${record.targetPath}:${record.operationId}`,
    );
    if (!resolution) {
      errors.push({
        ...issue(
          'normalized-openapi-without-source',
          'Normalized OpenAPI operation has no legacy source resolution.',
          { targetPath: record.targetPath },
        ),
        axis: 'source-provenance',
      });
      continue;
    }
    const legacyOperation = (
      await readOpenApiOperations(
        path.resolve(legacyRoot, resolution.sourcePath),
      )
    ).get(resolution.legacyOperationId);
    const targetOperation = (
      await readOpenApiOperations(path.resolve(root, record.targetPath))
    ).get(record.operationId);
    const expected = splitOpenApiDescription(legacyOperation?.description);
    if (
      record.normalizedDescription !== targetOperation?.description ||
      !blocksMatch(record.docsSections, targetOperation?.['x-docs-sections']) ||
      !blocksMatch(record.docsCallouts, targetOperation?.['x-docs-callouts'])
    ) {
      errors.push({
        ...issue(
          'normalized-openapi-target-drift',
          'Current OpenAPI description does not match its generated normalization record.',
          { targetPath: record.targetPath },
        ),
        axis: 'source-provenance',
      });
      continue;
    }
    if (expected.description && documentationMatches(record, expected)) {
      openapiNormalizedLegacyMatches += 1;
      continue;
    }
    if (!baseOpenApiDocuments.has(record.targetPath)) {
      const baseRaw = await readBaseFile(root, baseRef, record.targetPath);
      baseOpenApiDocuments.set(
        record.targetPath,
        baseRaw ? openApiOperations(yaml.load(baseRaw)) : null,
      );
    }
    const baseOperation = baseOpenApiDocuments
      .get(record.targetPath)
      ?.get(record.operationId);
    if (
      baseOperation &&
      sha256(String(baseOperation.description)) ===
        record.originalDescriptionHash &&
      documentationMatches(
        record,
        splitOpenApiDescription(baseOperation.description),
      )
    ) {
      openapiNormalizedBaseMatches += 1;
      continue;
    }
    errors.push({
      ...issue(
        'normalized-openapi-text-drift',
        'Normalized OpenAPI description is neither a legacy-source derivation nor a formatting-only change to the preserved base description.',
        { sourcePath: resolution.sourcePath, targetPath: record.targetPath },
      ),
      axis: 'source-provenance',
    });
  }
  const openapiNormalizedProvenanceMatches =
    openapiNormalizedLegacyMatches + openapiNormalizedBaseMatches;

  const overviewPath = path.resolve(root, `${API_REFERENCE_ROOT}overview.mdx`);
  const overview = splitFrontmatter(await fs.readFile(overviewPath, 'utf8'));
  const overviewFirstLine = overview.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  for (const [field, actual, expected] of [
    ['title', overview.data.title, manifest.live.heroTitle],
    ['description', overview.data.description, manifest.live.heroDescription],
    ['body', overviewFirstLine, manifest.live.heroDescription],
  ]) {
    if (expected && actual === expected) continue;
    errors.push({
      ...issue(
        'overview-source-copy',
        `Overview ${field} must exactly match the captured live API Center source text.`,
        { targetPath: `${API_REFERENCE_ROOT}overview.mdx` },
      ),
      axis: 'source-provenance',
    });
  }

  const expectedRootItems = [
    'api',
    '[SDK 下载](/zh-CN/reference/sdks)',
    '[Recipe](/zh-CN/reference/recipes)',
    '[常见问题](/zh-CN/reference/faq)',
  ];
  const currentRoot = JSON.parse(
    await fs.readFile(
      path.resolve(root, 'content/docs/zh-CN/api-reference/meta.json'),
      'utf8',
    ),
  );
  const visibleRootItems = currentRoot.pages.filter(
    (item) => typeof item === 'string',
  );
  if (
    currentRoot.pages.includes('overview') ||
    JSON.stringify(visibleRootItems) !== JSON.stringify(expectedRootItems)
  ) {
    errors.push({
      ...issue(
        'root-navigation-order-drift',
        'The API Reference root must keep the API entry followed by links to the Reference resources.',
        { targetPath: 'content/docs/zh-CN/api-reference/meta.json' },
      ),
      axis: 'source-provenance',
    });
  }

  let generatorFallbackViolations = 0;
  for (const sourcePath of GENERATOR_SOURCE_PATHS) {
    const source = await fs.readFile(path.resolve(root, sourcePath), 'utf8');
    for (const [code, pattern] of FORBIDDEN_GENERATOR_FALLBACKS) {
      if (!pattern.test(source)) continue;
      generatorFallbackViolations += 1;
      errors.push({
        ...issue(
          code,
          'A migration generator still contains a user-visible fallback.',
          {
            sourcePath,
          },
        ),
        axis: 'assumption-boundary',
      });
    }
  }

  const logicalPages = (manifest.pageEvidence ?? []).filter(
    (page) => !page.aliasOf,
  );
  let classifiedPages = 0;
  let existingTargets = 0;
  let directTargetRoutes = 0;
  let existingRouteProjections = 0;
  let openapiTargets = 0;
  let preservedExistingOutsideScope = 0;
  const decisions = [];
  for (const page of logicalPages) {
    const resolution = page.sourceResolution ?? {};
    if (!ALLOWED_RESOLUTION_TYPES.has(resolution.type)) {
      errors.push({
        ...issue(
          'unknown-resolution-type',
          'Page resolution type is not audited.',
          {
            sourcePath: page.requestedUrl,
          },
        ),
        axis: 'assumption-boundary',
      });
      continue;
    }
    if (resolution.type === 'broken-live-link') continue;
    classifiedPages += 1;
    if (resolution.targetDecision) {
      decisions.push(resolution.targetDecision);
      if (!ALLOWED_TARGET_DECISIONS.has(resolution.targetDecision)) {
        errors.push({
          ...issue(
            'unaudited-target-decision',
            'Target mapping decision is not audited.',
            {
              sourcePath: page.requestedUrl,
            },
          ),
          axis: 'assumption-boundary',
        });
      }
      if (resolution.targetDecision === 'api-reference-supplement') {
        const supplement = resolution.apiReferenceSupplement;
        const hasValidPlacement =
          supplement?.parentRoute?.startsWith('/zh-CN/api-reference/') &&
          resolution.targetRoute?.startsWith(`${supplement.parentRoute}/`) &&
          resolution.targetPath?.startsWith(
            `content/docs${supplement.parentRoute}/`,
          ) &&
          resolution.supersededTargetPath?.startsWith('content/docs/zh-CN/') &&
          !resolution.supersededTargetPath.startsWith(API_REFERENCE_ROOT) &&
          resolution.supersededTargetRoute?.startsWith('/zh-CN/') &&
          !resolution.supersededTargetRoute.startsWith('/zh-CN/api-reference/');
        const hasValidNavigation =
          typeof supplement?.groupTitle === 'string' &&
          supplement.groupTitle.length > 0 &&
          typeof supplement?.label === 'string' &&
          supplement.label.length > 0 &&
          Array.isArray(supplement.relatedPages) &&
          supplement.relatedPages.every(
            (related) =>
              typeof related.label === 'string' &&
              related.label.length > 0 &&
              related.route?.startsWith('/zh-CN/'),
          );
        if (!hasValidPlacement || !hasValidNavigation) {
          errors.push({
            ...issue(
              'invalid-api-reference-supplement',
              'An API reference supplement does not prove its target, superseded section page, and parent navigation.',
              { sourcePath: page.requestedUrl },
            ),
            axis: 'assumption-boundary',
          });
        }
      }
    } else {
      decisions.push(
        resolution.type === 'openapi'
          ? 'openapi-lane'
          : (resolution.generator ?? resolution.type),
      );
    }
    const sourceAbsolute = localSourcePath({
      repoRoot: root,
      oldRoot: legacyRoot,
      sourcePath: resolution.sourcePath,
    });
    if (!sourceAbsolute || !(await exists(sourceAbsolute))) {
      errors.push({
        ...issue(
          'missing-page-source',
          'Resolved legacy page source does not exist.',
          {
            sourcePath: resolution.sourcePath ?? page.requestedUrl,
          },
        ),
        axis: 'source-provenance',
      });
    }
    if (
      !resolution.targetPath ||
      !(await exists(path.resolve(root, resolution.targetPath)))
    ) {
      errors.push({
        ...issue(
          'missing-page-target',
          'Resolved legacy page target does not exist.',
          {
            sourcePath: page.requestedUrl,
            targetPath: resolution.targetPath,
          },
        ),
        axis: 'placement',
      });
      continue;
    }
    existingTargets += 1;
    if (resolution.type === 'openapi') {
      openapiTargets += 1;
      continue;
    }
    if (!resolution.targetPath.startsWith(API_REFERENCE_ROOT)) {
      const directRoute = docsPathToRoute(resolution.targetPath);
      const isPreservedBaseTarget =
        resolution.migrationAction === 'audit-existing-target' &&
        !ownedTargetPaths.has(resolution.targetPath) &&
        directRoute === resolution.targetRoute &&
        (baseFiles == null || baseFiles.has(resolution.targetPath));
      if (isPreservedBaseTarget) {
        preservedExistingOutsideScope += 1;
      } else {
        errors.push({
          ...issue(
            'page-target-outside-api-reference',
            'A target outside API Reference is not proven to be a preserved pre-existing MDX page.',
            {
              sourcePath: page.requestedUrl,
              targetPath: resolution.targetPath,
            },
          ),
          axis: 'placement',
        });
      }
      continue;
    }
    const directRoute = docsPathToRoute(resolution.targetPath);
    if (directRoute === resolution.targetRoute) {
      directTargetRoutes += 1;
      continue;
    }
    const existing = resolveExistingApiCenterTarget(page.requestedUrl);
    if (
      existing?.targetPath === resolution.targetPath &&
      existing?.targetRoute === resolution.targetRoute
    ) {
      existingRouteProjections += 1;
      continue;
    }
    errors.push({
      ...issue(
        'target-route-path-mismatch',
        'Target route is neither the file route nor an explicit existing-route projection.',
        { sourcePath: page.requestedUrl, targetPath: resolution.targetPath },
      ),
      axis: 'placement',
    });
  }

  let bundleUrl = liveBundleUrl;
  let bundleText = liveBundleText;
  if (bundleText == null) {
    const live = await fetchLiveBundle(
      manifest.live.finalUrl ?? 'https://doc.shengwang.cn/api-center',
    );
    bundleUrl = live.bundleUrl;
    bundleText = live.text;
  }
  const internalEntries = (manifest.entries ?? []).filter(
    (entry) => entry.urlFamily !== 'external',
  );
  const externalEntries = (manifest.entries ?? []).filter(
    (entry) => entry.urlFamily === 'external',
  );
  const missingLiveEntries = internalEntries
    .filter(
      (entry) =>
        !bundleText.includes(entry.legacyPath) &&
        !bundleText.includes(entry.legacyUrl),
    )
    .map((entry) => ({
      product: entry.product,
      label: entry.label,
      legacyPath: entry.legacyPath,
    }));
  for (const entry of missingLiveEntries) {
    errors.push({
      ...issue(
        'live-entry-not-deployed',
        'Manifest entry was not found in the live API Center bundle.',
        {
          sourcePath: entry.legacyPath,
        },
      ),
      axis: 'placement',
    });
  }

  const navigationParity = JSON.parse(
    await fs.readFile(
      path.resolve(root, 'docs/migration/api-center-navigation-parity.json'),
      'utf8',
    ),
  );
  if (navigationParity.counts.errors > 0) {
    errors.push({
      ...issue(
        'navigation-parity-errors',
        'Generated navigation parity report has errors.',
      ),
      axis: 'placement',
    });
  }
  const linkAudit = JSON.parse(
    await fs.readFile(
      path.resolve(root, 'docs/migration/api-center-link-audit.json'),
      'utf8',
    ),
  );
  if (linkAudit.counts.errors > 0 || linkAudit.counts.invalidLinks > 0) {
    errors.push({
      ...issue('link-audit-errors', 'Generated local link audit has errors.'),
      axis: 'placement',
    });
  }
  const openApiAudit = JSON.parse(
    await fs.readFile(
      path.resolve(root, 'docs/migration/api-center-openapi-audit.json'),
      'utf8',
    ),
  );
  if (openApiAudit.counts.errors > 0) {
    errors.push({
      ...issue('openapi-audit-errors', 'Generated OpenAPI audit has errors.'),
      axis: 'source-provenance',
    });
  }

  const sourceProvenanceErrors = errors.filter(
    (item) => item.axis === 'source-provenance',
  ).length;
  const placementErrors = errors.filter(
    (item) => item.axis === 'placement',
  ).length;
  const unapprovedRequirementAssumptions = errors.filter(
    (item) => item.axis === 'assumption-boundary',
  ).length;
  const report = {
    schemaVersion: 1,
    status: errors.length === 0 ? 'passed' : 'failed',
    source: {
      repository: manifest.source.repository,
      commit: manifest.source.commit,
      checkoutHead: legacyHead,
      commitMatched:
        legacyHead == null || legacyHead === manifest.source.commit,
      root: '.',
    },
    liveEvidence: {
      apiCenterUrl: manifest.live.finalUrl,
      capturedAt: manifest.live.capturedAt,
      bundleUrl,
      bundleHash: sha256(bundleText),
      entries: manifest.entries.length,
      matchedEntries:
        internalEntries.length -
        missingLiveEntries.length +
        externalEntries.length,
      bundleEntries: internalEntries.length,
      bundleMatchedEntries: internalEntries.length - missingLiveEntries.length,
      externalSnapshotEntries: externalEntries.length,
      missingEntries: missingLiveEntries,
    },
    counts: {
      ownedMdxFiles,
      ownershipSourcePaths,
      logicalPages: logicalPages.length,
      classifiedPages,
      existingTargets,
      directTargetRoutes,
      existingRouteProjections,
      openapiTargets,
      preservedExistingOutsideScope,
      localLinksChecked: linkAudit.counts.links,
      openapiReachableOperations: openApiAudit.counts.reachableOperations,
      preservedRootNavigationItems: expectedRootItems.length,
      generatorFallbackViolations,
      generatedTextViolations,
      generatedHtmlDescriptionsChecked,
      generatedHtmlDescriptionsPresent,
      generatedHtmlDescriptionViolations,
      runtimeLabelSubstitutions,
      openapiNormalizedProvenanceMatches,
      openapiNormalizedLegacyMatches,
      openapiNormalizedBaseMatches,
      sourceTextRequests: sourceTextRequests.length,
      sourceProvenanceErrors,
      placementErrors,
      unapprovedRequirementAssumptions,
      errors: errors.length,
    },
    targetDecisions: countBy(decisions),
    explicitRequirements: [
      {
        id: 'live-api-center-authority',
        evidence:
          'The deployed API Center product/platform/language entry set is authoritative.',
      },
      {
        id: 'local-mdx-output',
        evidence:
          'Migrated HTML documentation must be substantive local MDX under zh-CN/api-reference.',
      },
      {
        id: 'api-reference-canonical-ownership',
        evidence: `${decisions.filter((value) => value === 'api-reference-over-section-path-map').length} legacy API source pages override stale section path-map targets so API documentation remains canonical under zh-CN/api-reference; superseded section routes are retained only as navigation and link-rewrite evidence.`,
      },
      {
        id: 'api-reference-supplement-ownership',
        evidence: `${decisions.filter((value) => value === 'api-reference-supplement').length} supplemental API contract pages prove their Reference Center parent, superseded section target, and navigation label metadata.`,
      },
      {
        id: 'legacy-information-architecture',
        evidence:
          'Product order, platform order, page structure, and sidebar structure must match the legacy site.',
      },
      {
        id: 'no-placeholder-or-old-site-redirect',
        evidence:
          'Placeholders, redirects, and old-site body-link substitutes are not accepted.',
      },
      {
        id: 'script-owned-generation',
        evidence:
          'Migration output and audit reports must be generated and maintained by scripts.',
      },
      {
        id: 'frontmatter-warning-reporting',
        evidence:
          'Inconsistencies must be recorded in frontmatter and summarized in generated reports.',
      },
    ],
    technicalDecisions: [
      {
        id: 'target-path-map',
        evidence: `${decisions.filter((value) => value.startsWith('path-map')).length} pages use repository path-map decisions.`,
      },
      {
        id: 'preserve-existing-layout',
        evidence: `${decisions.filter((value) => value === 'existing-target-layout-over-stale-path-map').length} pages preserve an existing API Reference layout over a stale mapped path; ${preservedExistingOutsideScope} already-migrated pages outside API Reference remain unowned and unchanged.`,
      },
      {
        id: 'explicit-route-projection',
        evidence: `${existingRouteProjections} platform routes project to shared local MDX through explicit existing-target mappings.`,
      },
      {
        id: 'openapi-lanes',
        evidence: `${openapiTargets} pages remain generated from maintained local OpenAPI sources; ${openapiNormalizedLegacyMatches} changed short descriptions derive from legacy text and ${openapiNormalizedBaseMatches} preserve pre-existing target copy with formatting-only changes.`,
      },
      {
        id: 'runtime-source-labels',
        evidence: `${runtimeLabelSubstitutions} runtime product/platform labels are injected from the API Center source inventory instead of inferred from directory slugs.`,
      },
      {
        id: 'preserved-root-navigation',
        evidence: `${expectedRootItems.length} root navigation items keep the API entry followed by the Reference resource links.`,
      },
      {
        id: 'api-group-action-labels',
        evidence:
          '客户端 and 服务端 action qualifiers are shortened from the live source group headings 客户端 API and 服务端 API.',
      },
      {
        id: 'current-directory-elision',
        evidence:
          '(current) remains a filesystem grouping and is omitted from public routes.',
      },
      {
        id: 'root-shared-target-collapse',
        evidence: `${navigationParity.counts.collapsedRootDuplicates} root actions share targets; the overview retains all ${navigationParity.counts.overviewActions} live actions.`,
      },
    ],
    sourceTextRequests,
    errors,
  };
  return { report, markdown: reportMarkdown(report) };
}
