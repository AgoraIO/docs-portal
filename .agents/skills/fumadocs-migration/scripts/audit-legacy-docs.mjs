#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_SOURCE =
  '/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source';
const DEFAULT_PROFILE = 'shengwang-doc-source';
const DOC_SOURCE_PRIVATE_PROFILE = 'doc-source-private';
const DOC_SOURCE_PRIVATE_LANES = new Set([
  'conversational-ai',
  'open-ai-integration',
  'real-time-stt',
]);

const COMPONENT_STATUS = new Map([
  ['Admonition', 'needs-directive-rewrite'],
  ['Tabs', 'needs-directive-rewrite'],
  ['TabItem', 'needs-directive-rewrite'],
  ['PlatformFilter', 'needs-platform-expansion'],
  ['Table', 'needs-table-normalization'],
  ['Tr', 'needs-table-normalization'],
  ['Td', 'needs-table-normalization'],
  ['Image', 'needs-image-standard'],
  ['H2', 'needs-anchor-normalization'],
  ['H3', 'needs-anchor-normalization'],
  ['H4', 'needs-anchor-normalization'],
  ['ApiSectionCard', 'needs-api-reference-source'],
  ['OverloadMethodCollapse', 'needs-api-reference-source'],
  ['OverloadMethodCollapsePanel', 'needs-api-reference-source'],
  ['ProductOverview', 'needs-landing-page-normalization'],
  ['QuickStartCard', 'needs-landing-page-normalization'],
  ['RecommendCard', 'needs-landing-page-normalization'],
  ['HotArticleCard', 'needs-landing-page-normalization'],
  ['InstantExperienceCard', 'needs-landing-page-normalization'],
  ['LinkCardV2', 'needs-landing-page-normalization'],
  ['LinkCard', 'needs-landing-page-normalization'],
  ['DocLinkCard', 'needs-landing-page-normalization'],
  ['DownloadCard', 'needs-landing-page-normalization'],
  ['SDKDownloadCard', 'needs-landing-page-normalization'],
  ['Row', 'needs-landing-page-normalization'],
  ['Col', 'needs-landing-page-normalization'],
]);

const GENERATED_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
]);

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    out: 'docs/superpowers/reports/fumadocs-migration-audit',
    profile: DEFAULT_PROFILE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') {
      args.source = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--out') {
      args.out = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--profile') {
      args.profile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function usage() {
  return `Usage:
node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \\
  --source /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source \\
  --profile shengwang-doc-source \\
  --out docs/superpowers/reports/YYYY-MM-DD-fumadocs-migration-audit`;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(root) {
  if (!(await exists(root))) {
    return [];
  }

  const entries = await fs.readdir(root, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.docusaurus' ||
      entry.name === '.docusaurus-ag'
    ) {
      continue;
    }

    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

async function privateSourceScanRoots(sourceRoot) {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(
      (name) =>
        !name.startsWith('.') &&
        name !== 'scripts' &&
        name !== 'data',
    );
}

function relative(sourceRoot, filePath) {
  return path.relative(sourceRoot, filePath).split(path.sep).join('/');
}

function increment(record, key, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function unique(values) {
  return [...new Set(values)].sort();
}

function detectGeneratorHint(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes('/typedoc/') || lower.includes('/classes/')) return 'typedoc';
  if (lower.includes('/doxygen') || lower.includes('/api/')) return 'doxygen-or-dita';
  if (lower.includes('/ios/') || lower.includes('/apple')) return 'appledoc-or-docc';
  if (lower.includes('/search/')) return 'generated-search-index';
  if (lower.includes('/restful') || lower.includes('/rest/')) return 'openapi-rendered';
  return 'unknown';
}

function productAndPlatformFromHtmlPath(relativePath) {
  const parts = relativePath.split('/');
  return {
    product: parts[1] ?? null,
    platform: parts[2] ?? null,
  };
}

function topLevelLane(relativePath) {
  return relativePath.split('/')[0] ?? null;
}

function analyzeMarkdownFile(relativePath, content, profile) {
  const components = {};
  const statuses = [];
  const componentMatches = content.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g);

  for (const match of componentMatches) {
    const component = match[1];
    increment(components, component);
    const status = COMPONENT_STATUS.get(component);
    if (status) statuses.push(status);
  }

  const sharedImports =
    (content.match(/from\s+['"]@shared\//g) ?? []).length +
    (content.match(/import\s+.*['"]@shared\//g) ?? []).length;
  const sharedDocsImports = (
    content.match(/from\s+['"]@docs\/shared\//g) ?? []
  ).length;
  const siteRestImports = (
    content.match(/from\s+['"]@site\/src\/components\/rest-api\//g) ?? []
  ).length;
  const privateVariables = (content.match(/<(?:Vpd|Vg)\b/g) ?? []).length;
  const legacyAnchors = (content.match(/<a\s+(?:name|id)=/g) ?? []).length;
  const platformFilters = (content.match(/<PlatformFilter\b/g) ?? []).length;
  const imageSizing =
    (content.match(/<Image\b[^>]*(?:width=|inline\b)/g) ?? []).length;
  const frontmatterArtifacts = (
    content.match(
      /\b(displayed_sidebar|ag_product|ag_platform|ag_product_label|ag_usecase|ag_file_path|frontMatter\.ag_|props\.)\b/g,
    ) ?? []
  ).length;
  const apiReferenceHints = (
    content.match(
      /<(?:ApiSectionCard|OverloadMethodCollapse|OverloadMethodCollapsePanel|H[2-4])\b/g,
    ) ?? []
  ).length;
  const landingPageHints = (
    content.match(
      /<(?:ProductOverview|QuickStartCard|RecommendCard|HotArticleCard|InstantExperienceCard|LinkCardV2|Row|Col)\b/g,
    ) ?? []
  ).length;

  if (sharedImports > 0) statuses.push('needs-include-standardization');
  if (sharedDocsImports > 0) {
    statuses.push('needs-private-include-standardization');
  }
  if (siteRestImports > 0) statuses.push('needs-openapi-decision');
  if (legacyAnchors > 0) statuses.push('needs-anchor-normalization');
  if (platformFilters > 0) statuses.push('needs-platform-expansion');
  if (imageSizing > 0) statuses.push('needs-image-standard');
  if (frontmatterArtifacts > 0) statuses.push('needs-frontmatter-cleanup');
  if (apiReferenceHints > 0 || relativePath.startsWith('docs-api-reference/')) {
    statuses.push('needs-api-reference-source');
  }
  if (landingPageHints > 0 || relativePath.endsWith('/landing-page.mdx')) {
    statuses.push('needs-landing-page-normalization');
  }
  if (privateVariables > 0) statuses.push('needs-product-specific-rules');

  if (profile === DOC_SOURCE_PRIVATE_PROFILE) {
    const lane = topLevelLane(relativePath);
    if (lane === 'ten-agent' || lane === 'ten-framework') {
      statuses.push('needs-product-specific-rules');
    } else if (
      lane &&
      !DOC_SOURCE_PRIVATE_LANES.has(lane) &&
      lane !== 'shared' &&
      lane !== 'assets'
    ) {
      statuses.push('needs-lane-mapping');
    }
  }

  return {
    path: relativePath,
    kind: relativePath.endsWith('.md') ? 'md' : 'mdx',
    statuses: unique(statuses.length > 0 ? statuses : ['ready-native']),
    matches: {
      components,
      sharedImports,
      sharedDocsImports,
      siteRestImports,
      privateVariables,
      legacyAnchors,
      platformFilters,
      imageSizing,
      frontmatterArtifacts,
      apiReferenceHints,
      landingPageHints,
    },
  };
}

function analyzeMetadataFile(relativePath) {
  return {
    path: relativePath,
    kind: 'metadata-js',
    statuses: ['needs-metadata-migration'],
    matches: {},
  };
}

function analyzePrivateCategoryFile(relativePath) {
  return {
    path: relativePath,
    kind: 'category-json',
    statuses: ['needs-category-migration'],
    matches: {},
  };
}

function analyzeOpenApiSource(relativePath) {
  const { product, platform } = productAndPlatformFromHtmlPath(relativePath);
  return {
    path: relativePath,
    kind: 'openapi-source',
    statuses: ['has-openapi-source'],
    product,
    platform,
    matches: {},
  };
}

function analyzeGeneratedHtml(relativePath) {
  const { product, platform } = productAndPlatformFromHtmlPath(relativePath);
  return {
    path: relativePath,
    kind: 'generated-api',
    product,
    platform,
    status: 'deferred-generated-api',
    generatorHint: detectGeneratorHint(relativePath),
  };
}

function isMetadataFile(relativePath) {
  const basename = path.basename(relativePath);
  return (
    basename === '_platforms_.meta.js' ||
    basename === '_products_.meta.js' ||
    basename === '_usecase_.meta.js' ||
    basename.startsWith('_sidebar_.meta') ||
    basename.includes('._sidebar_.meta')
  );
}

function isOpenApiSource(relativePath) {
  return (
    relativePath.startsWith('html-docs/') &&
    /\.ya?ml$/i.test(relativePath) &&
    !relativePath.includes('/assets/') &&
    !relativePath.includes('/search/')
  );
}

function isGeneratedHtmlDoc(relativePath) {
  if (!relativePath.startsWith('html-docs/')) return false;
  if (isOpenApiSource(relativePath)) return false;
  return GENERATED_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

function isPrivateCategoryFile(relativePath, profile) {
  return (
    profile === DOC_SOURCE_PRIVATE_PROFILE &&
    relativePath.endsWith('/_category_.json')
  );
}

function summarize(report) {
  const summary = {
    markdownFiles: 0,
    metadataFiles: 0,
    htmlDocFiles: 0,
    openapiSources: 0,
    filesWithLegacyJsx: 0,
    filesWithSharedImports: 0,
    filesWithLegacyAnchors: 0,
    filesWithPlatformFilters: 0,
    filesWithFrontmatterArtifacts: 0,
    filesWithApiReferenceHints: 0,
    filesWithLandingPageHints: 0,
    deferredItems: report.deferred.length,
    statuses: {},
    topComponents: {},
  };

  for (const file of report.files) {
    if (file.kind === 'md' || file.kind === 'mdx') {
      summary.markdownFiles += 1;
    }
    if (file.kind === 'metadata-js') summary.metadataFiles += 1;
    if (file.kind === 'category-json') summary.metadataFiles += 1;
    if (file.kind === 'openapi-source') summary.openapiSources += 1;

    for (const status of file.statuses ?? []) {
      increment(summary.statuses, status);
    }

    const matches = file.matches ?? {};
    const componentNames = Object.keys(matches.components ?? {});
    if (componentNames.length > 0) summary.filesWithLegacyJsx += 1;
    if ((matches.sharedImports ?? 0) > 0) summary.filesWithSharedImports += 1;
    if ((matches.sharedDocsImports ?? 0) > 0) summary.filesWithSharedImports += 1;
    if ((matches.legacyAnchors ?? 0) > 0) summary.filesWithLegacyAnchors += 1;
    if ((matches.platformFilters ?? 0) > 0) summary.filesWithPlatformFilters += 1;
    if ((matches.frontmatterArtifacts ?? 0) > 0) {
      summary.filesWithFrontmatterArtifacts += 1;
    }
    if ((matches.apiReferenceHints ?? 0) > 0) {
      summary.filesWithApiReferenceHints += 1;
    }
    if ((matches.landingPageHints ?? 0) > 0) {
      summary.filesWithLandingPageHints += 1;
    }

    for (const [component, count] of Object.entries(matches.components ?? {})) {
      increment(summary.topComponents, component, count);
    }
  }

  summary.htmlDocFiles = report.deferred.length;
  summary.statuses = Object.fromEntries(
    Object.entries(summary.statuses).sort((a, b) => b[1] - a[1]),
  );
  summary.topComponents = Object.fromEntries(
    Object.entries(summary.topComponents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50),
  );

  report.summary = summary;
}

function markdownTable(rows) {
  return rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
}

function renderMarkdown(report) {
  const statusRows = [
    ['Status', 'Files'],
    ['---', '---:'],
    ...Object.entries(report.summary.statuses).map(([status, count]) => [
      `\`${status}\``,
      String(count),
    ]),
  ];

  const componentRows = [
    ['Component', 'Matches'],
    ['---', '---:'],
    ...Object.entries(report.summary.topComponents)
      .slice(0, 25)
      .map(([component, count]) => [`\`${component}\``, String(count)]),
  ];

  const openapi = report.files
    .filter((file) => file.kind === 'openapi-source')
    .slice(0, 50);
  const deferred = report.deferred.slice(0, 80);

  return [
    '# Fumadocs Migration Audit',
    '',
    `Source: \`${report.sourceRoot}\``,
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Summary',
    '',
    `- Markdown/MDX files: ${report.summary.markdownFiles}`,
    `- Legacy metadata JS files: ${report.summary.metadataFiles}`,
    `- OpenAPI sources: ${report.summary.openapiSources}`,
    `- Generated API deferred files: ${report.summary.deferredItems}`,
    `- Files with legacy JSX: ${report.summary.filesWithLegacyJsx}`,
    `- Files with shared imports: ${report.summary.filesWithSharedImports}`,
    `- Files with legacy anchors: ${report.summary.filesWithLegacyAnchors}`,
    `- Files with platform filters: ${report.summary.filesWithPlatformFilters}`,
    `- Files with frontmatter/runtime artifacts: ${report.summary.filesWithFrontmatterArtifacts}`,
    '',
    '## Status Counts',
    '',
    markdownTable(statusRows),
    '',
    '## Top Legacy JSX Components',
    '',
    markdownTable(componentRows),
    '',
    '## OpenAPI Sources',
    '',
    openapi.length > 0
      ? openapi.map((file) => `- \`${file.path}\``).join('\n')
      : '- None found.',
    '',
    '## Deferred Generated API Samples',
    '',
    deferred.length > 0
      ? deferred
          .map(
            (item) =>
              `- \`${item.path}\` (${item.product ?? 'unknown'} / ${
                item.platform ?? 'unknown'
              }, ${item.generatorHint})`,
          )
          .join('\n')
      : '- None found.',
    '',
    '## Review Rule',
    '',
    'A migration batch is not complete until every deferred or unresolved item is accepted, assigned to an API reference lane, or tracked as follow-up work.',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const sourceRoot = path.resolve(args.source);
  if (!(await exists(sourceRoot))) {
    throw new Error(`Source path does not exist: ${sourceRoot}`);
  }

  const scanRoots =
    args.profile === DOC_SOURCE_PRIVATE_PROFILE
      ? await privateSourceScanRoots(sourceRoot)
      : ['docs', 'docs-api-reference', 'shared', 'html-docs'];
  const files = (
    await Promise.all(scanRoots.map((root) => walk(path.join(sourceRoot, root))))
  ).flat();

  const report = {
    sourceRoot,
    generatedAt: new Date().toISOString(),
    summary: {},
    files: [],
    deferred: [],
  };

  for (const filePath of files.sort()) {
    const rel = relative(sourceRoot, filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.md' || ext === '.mdx') {
      const content = await fs.readFile(filePath, 'utf8');
      report.files.push(analyzeMarkdownFile(rel, content, args.profile));
      continue;
    }

    if (isPrivateCategoryFile(rel, args.profile)) {
      report.files.push(analyzePrivateCategoryFile(rel));
      continue;
    }

    if (isMetadataFile(rel)) {
      report.files.push(analyzeMetadataFile(rel));
      continue;
    }

    if (isOpenApiSource(rel)) {
      report.files.push(analyzeOpenApiSource(rel));
      continue;
    }

    if (isGeneratedHtmlDoc(rel)) {
      report.deferred.push(analyzeGeneratedHtml(rel));
    }
  }

  summarize(report);

  const outBase = path.resolve(args.out);
  await fs.mkdir(path.dirname(outBase), { recursive: true });
  await fs.writeFile(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(`${outBase}.md`, renderMarkdown(report));

  console.log(`Wrote ${outBase}.json`);
  console.log(`Wrote ${outBase}.md`);
  console.log(
    `Scanned ${report.summary.markdownFiles} Markdown files; deferred ${report.summary.deferredItems} generated API files.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
