#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  isRedirectContentRow,
  readControlTable,
  updateMigrationProgressInPathMap,
} from './migration-control-table.mjs';

const DEFAULT_SOURCE_ROOTS = [
  process.env.LEGACY_DOC_SOURCE_ROOT,
  '/Users/yangyixuan/Documents/GitHub/shengwang-doc-source',
  '/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source',
].filter(Boolean);
const DEFAULT_OUT_DIR = 'docs/migration/generated/legacy-docs-sample';
const DEFAULT_PATH_MAP = 'docs/migration/path-map.csv';
const DEFAULT_COMPONENT_MAP = 'docs/migration/component-map.yaml';
const DEFAULT_SAMPLE_PAGES = [
  'docs/rtc/overview/migration-guide.electron.mdx',
  'docs/rtc/basic-features/audio-quick-start.macos.mdx',
];
const ALLOWED_FRONTMATTER_KEYS = new Set([
  '_openapi',
  'description',
  'full',
  'hidePlatformTabs',
  'hideToc',
  'icon',
  'title',
]);
const CODE_LANG_ALIASES = new Map([
  ['http', 'text'],
  ['js', 'javascript'],
  ['md', 'markdown'],
  ['objectivec', 'objc'],
  ['txt', 'text'],
]);
const PRODUCT_LABELS = new Map([
  ['aigc', 'AIGC'],
  ['art-class', '灵动课堂'],
  ['marketplace', '云市场'],
  ['online-music-class', '在线音乐课堂'],
  ['recording', '本地服务端录制'],
]);
const PLATFORM_LABELS = new Map([
  ['android', 'Android'],
  ['electron', 'Electron'],
  ['flutter', 'Flutter'],
  ['harmonyos', 'HarmonyOS'],
  ['ios', 'iOS'],
  ['javascript', 'Web'],
  ['macos', 'macOS'],
  ['react-native', 'React Native'],
  ['rn', 'React Native'],
  ['unity', 'Unity'],
  ['unreal', 'Unreal'],
  ['wechat', '微信小程序'],
  ['windows', 'Windows'],
]);
const PLATFORM_HEADING_TAB_VALUES = new Map([
  ['all', 'all'],
  ['android', 'android'],
  ['c', 'c'],
  ['c#', 'csharp'],
  ['c++', 'cpp'],
  ['electron', 'electron'],
  ['flutter', 'flutter'],
  ['go', 'go'],
  ['golang', 'go'],
  ['harmonyos', 'harmonyos'],
  ['ios', 'ios'],
  ['java', 'java'],
  ['javascript', 'javascript'],
  ['kotlin', 'kotlin'],
  ['macos', 'macos'],
  ['node.js', 'nodejs'],
  ['objective-c', 'objc'],
  ['php', 'php'],
  ['python', 'python'],
  ['react native', 'react-native'],
  ['rest api', 'rest-api'],
  ['restful', 'restful'],
  ['restful api', 'restful-api'],
  ['swift', 'swift'],
  ['typescript', 'typescript'],
  ['unity', 'unity'],
  ['unreal', 'unreal'],
  ['web', 'web'],
  ['windows', 'windows'],
  ['所有平台', 'all'],
  ['微信小程序', 'wechat'],
]);
const LANGUAGE_GROUP_TAB_VALUES = new Set([
  'android',
  'c',
  'cpp',
  'csharp',
  'go',
  'ios',
  'java',
  'javascript',
  'kotlin',
  'nodejs',
  'objc',
  'php',
  'python',
  'rest-api',
  'restful',
  'restful-api',
  'swift',
  'typescript',
  'web',
]);
const ALLOWED_MDX_TAGS = new Set([
  'Accordion',
  'Accordions',
  'Card',
  'Cards',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'PlatformInline',
  'PlatformStructured',
  'Slot',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
]);
/**
 * @typedef {{
 *   angleBracketLiterals: string[];
 *   components: Map<string, Record<string, unknown>>;
 *   falsePositivePatterns: Map<string, Record<string, unknown>>;
 *   path: string;
 *   syntaxPatterns: Map<string, Record<string, unknown>>;
 * }} ComponentMap
 */
/** @type {ComponentMap} */
const EMPTY_COMPONENT_MAP = {
  angleBracketLiterals: [],
  components: new Map(),
  falsePositivePatterns: new Map(),
  path: '',
  syntaxPatterns: new Map(),
};

export async function migrateLegacyBatch(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const sourceRoot = await resolveSourceRoot(options.sourceRoot);
  const outDir = path.resolve(repoRoot, options.outDir ?? DEFAULT_OUT_DIR);
  const pathMapPath = path.resolve(
    repoRoot,
    options.pathMap ?? DEFAULT_PATH_MAP,
  );
  const componentMapPath = path.resolve(
    repoRoot,
    options.componentMap ?? DEFAULT_COMPONENT_MAP,
  );
  const pathMap = await loadPathMap(pathMapPath);
  const componentMap = await loadComponentMap(componentMapPath);
  const includePages = options.pagesFile
    ? unique([
        ...(options.pages ?? []),
        ...(await loadPagesFile(path.resolve(repoRoot, options.pagesFile))),
      ])
    : (options.pages ?? DEFAULT_SAMPLE_PAGES);
  const samplePages = await selectPages({
    includePages,
    pathMap,
    sampleCount: options.sampleCount ?? 0,
    sampleSeed: options.sampleSeed ?? 'rtc-migration-sample',
    sourceRoot,
  });
  const results = [];

  await fs.rm(outDir, { force: true, recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  for (const sourcePath of samplePages) {
    const pageResults = await migrateLegacyPages({
      componentMap,
      pathMap,
      sourcePath,
      sourceRoot,
    });

    for (const result of pageResults) {
      results.push(result);

      const targetPath = result.targetPath
        ? path.join(outDir, result.targetPath)
        : path.join(
            outDir,
            'unmapped',
            normalizeUnmappedTargetPath(result.sourcePath),
          );
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, result.content, 'utf8');
    }
  }

  const report = createReport({
    componentMap,
    componentMapPath,
    outDir,
    pathMapPath,
    results,
    sourceRoot,
  });
  await fs.writeFile(
    path.join(outDir, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(outDir, 'report.md'),
    reportToMarkdown(report),
    'utf8',
  );

  if (options.updatePathMap !== false) {
    await updateMigrationProgressInPathMap({
      pathMapPath,
      reportPath: path.join(outDir, 'report.md'),
      repoRoot,
      results,
    });
  }

  return report;
}

export async function migrateLegacyPages({
  componentMap = EMPTY_COMPONENT_MAP,
  pathMap,
  sourcePath,
  sourceRoot,
}) {
  const outputs = getOutputTargetsForSourcePath({ pathMap, sourcePath });
  const results = [];

  for (const output of outputs) {
    results.push(
      await migrateLegacyPage({
        componentMap,
        pathMap,
        platform: output.platform,
        sourcePath,
        sourceRoot,
        targetPath: output.targetPath,
      }),
    );
  }

  return results;
}

/**
 * @param {object} options
 * @param {ComponentMap} [options.componentMap]
 * @param {Map<string, any>} options.pathMap
 * @param {string} [options.platform]
 * @param {string} options.sourcePath
 * @param {string} options.sourceRoot
 * @param {string} [options.targetPath]
 */
export async function migrateLegacyPage({
  componentMap = EMPTY_COMPONENT_MAP,
  pathMap,
  platform,
  sourcePath,
  sourceRoot,
  targetPath,
}) {
  const absoluteSourcePath = path.join(sourceRoot, sourcePath);
  const raw = await fs.readFile(absoluteSourcePath, 'utf8');
  const inferredContext = inferContextFromSourcePath(sourcePath);
  const context = platform
    ? {
        ...inferredContext,
        platform,
        platforms: [platform],
      }
    : inferredContext;
  const state = createMigrationState({
    context,
    pathMap,
    sourcePath,
    sourceRoot,
    componentMap,
  });
  const expanded = await expandLegacyFile({
    absolutePath: absoluteSourcePath,
    raw,
    state,
  });
  const frontmatter = serializeFrontmatter(expanded.frontmatter);
  const content = `${frontmatter}${expanded.body.trim()}\n`;
  const residue = findLegacyResidue(content, componentMap);
  const referenceReview = findReferenceReview(content);
  const issues = unique([
    ...state.issues,
    ...residue.map((item) => `legacy-residue:${item}`),
    ...referenceReviewIssues(referenceReview),
  ]);
  const outputTargetPath =
    targetPath ??
    getOutputTargetPath({
      pathMap,
      platform,
      sourcePath,
    });

  return {
    content,
    componentUsage: summarizeSignalMap(state.componentUsage),
    issues,
    platform: platform ?? context.platform,
    sourcePath,
    falsePositiveUsage: summarizeSignalMap(state.falsePositiveUsage),
    referenceReview,
    sharedDependencies: [...state.sharedDependencies],
    status: issues.length > 0 ? 'needs_review' : 'converted',
    syntaxPatternUsage: summarizeSignalMap(state.syntaxPatternUsage),
    targetPath: outputTargetPath,
  };
}

export function inferContextFromSourcePath(sourcePath) {
  const parts = toPosix(sourcePath).split('/');
  const docsIndex = parts.indexOf('docs');
  const product = docsIndex >= 0 ? parts[docsIndex + 1] : parts[0];
  const fileName = parts.at(-1) ?? '';
  const stem = fileName.replace(/\.(md|mdx)$/i, '');
  const suffixes = stem.split('.').slice(1);
  const platforms = suffixes.filter((suffix) => !/^\d/.test(suffix));

  return {
    locale: 'zh-CN',
    platform: platforms[0] ?? '',
    platforms,
    product,
  };
}

export function getOutputPlatformsForSourcePath({ pathMap, sourcePath }) {
  const context = inferContextFromSourcePath(sourcePath);
  const entry = pathMap.get(sourcePath);

  if (entry?.isRedirectContent === false) {
    return [];
  }

  if (entry?.decisionRefs?.includes('redirect-exact-target')) {
    return [undefined];
  }

  if (
    context.platforms.length > 1 &&
    (entry?.decisionRefs?.includes('needs-platform-expansion') ?? true)
  ) {
    return context.platforms;
  }

  return [undefined];
}

export function getOutputTargetsForSourcePath({ pathMap, sourcePath }) {
  const entry = pathMap.get(sourcePath);
  if (entry?.isRedirectContent === false) {
    return [];
  }

  const targetPaths = unique(
    (entry?.targetPaths?.length
      ? entry.targetPaths
      : [entry?.targetPath ?? '']
    ).map(normalizeMdxTargetPath),
  );

  if (targetPaths.length > 1) {
    return targetPaths.map((targetPath) => ({
      platform: inferPlatformFromTargetPath({ sourcePath, targetPath }),
      targetPath,
    }));
  }

  return getOutputPlatformsForSourcePath({ pathMap, sourcePath }).map(
    (platform) => ({
      platform,
      targetPath: getOutputTargetPath({ pathMap, platform, sourcePath }),
    }),
  );
}

function getOutputTargetPath({ pathMap, platform, sourcePath }) {
  const targetPath = pathMap.get(sourcePath)?.targetPath ?? '';
  const expandedTargetPath = expandPlatformTargetPath({
    platform,
    sourcePath,
    targetPath,
  });
  return normalizeMdxTargetPath(expandedTargetPath);
}

function inferPlatformFromTargetPath({ sourcePath, targetPath }) {
  const sourcePlatforms = inferContextFromSourcePath(sourcePath).platforms;
  if (sourcePlatforms.length === 0 || !targetPath) {
    return undefined;
  }

  const targetStem = path.posix
    .basename(targetPath)
    .replace(/\.(md|mdx)$/i, '');
  const targetSuffixes = targetStem
    .split('.')
    .slice(1)
    .filter((suffix) => !/^\d/.test(suffix));

  return (
    targetSuffixes.find((suffix) => sourcePlatforms.includes(suffix)) ??
    (sourcePlatforms.length === 1 ? sourcePlatforms[0] : undefined)
  );
}

export function expandPlatformTargetPath({ platform, sourcePath, targetPath }) {
  if (!platform || !targetPath) {
    return normalizeMdxTargetPath(targetPath ?? '');
  }

  const context = inferContextFromSourcePath(sourcePath);
  if (context.platforms.length <= 1 || !context.platforms.includes(platform)) {
    return normalizeMdxTargetPath(targetPath);
  }

  const normalizedTargetPath = normalizeMdxTargetPath(targetPath);
  const extension = path.posix.extname(normalizedTargetPath);
  const withoutExtension = normalizedTargetPath.slice(0, -extension.length);
  const platformSuffix = `.${context.platforms.join('.')}`;

  if (withoutExtension.endsWith(platformSuffix)) {
    return `${withoutExtension.slice(0, -platformSuffix.length)}.${platform}${extension}`;
  }

  return `${withoutExtension}.${platform}${extension}`;
}

function normalizeMdxTargetPath(targetPath) {
  if (!targetPath) {
    return '';
  }

  const extension = path.posix.extname(targetPath);
  if (!extension) {
    return `${targetPath}.mdx`;
  }

  if (extension.toLowerCase() === '.mdx' || extension.toLowerCase() === '.md') {
    return targetPath;
  }

  return `${targetPath.slice(0, -extension.length)}.mdx`;
}

function normalizeUnmappedTargetPath(sourcePath) {
  const extension = path.posix.extname(sourcePath);
  if (!extension) {
    return `${sourcePath}.mdx`;
  }

  return `${sourcePath.slice(0, -extension.length)}.mdx`;
}

export function transformLegacyMdx(body, state) {
  let value = body;
  let previous = null;

  while (previous !== value) {
    previous = value;
    value = stripMdxComments(value);
    value = transformProductWrapper(value, state);
    value = transformPlatformFilter(value, state);
    value = transformHtmlComponent(value, state);
    value = transformRuntimeVariables(value, state);
    value = transformLegacyLinks(value, state);
    value = transformAnchors(value);
    value = transformHeadingComponents(value);
    value = transformReleaseNoteComponents(value, state);
    value = transformLegacyInlineComponents(value, state);
    value = normalizeMalformedLegacyTags(value);
    value = transformCodeFenceMetadata(value, state);
    value = transformCodeBlockComponent(value);
    value = transformLinkTooltips(value, state);
    value = transformLinkCards(value, state);
    value = transformLegacyLandingComponents(value, state);
    value = transformTabs(value);
    value = transformRemainingTabItems(value, state);
    value = transformPlatformHeadingTabs(value, state);
    value = transformAdjacentCodeFenceTabs(value, state);
    value = transformHtmlTables(value, state);
    value = transformMarkdownTableSlots(value, state);
    value = transformImages(value, state);
    value = transformRawHtmlImages(value, state);
    value = transformAdmonitions(value);
    value = transformDetails(value);
    value = transformHtmlLists(value);
    value = transformInlineHtml(value);
    value = normalizeInlineHtmlAttributes(value, state);
    value = transformHiddenIndexSpans(value, state);
    value = transformAngleBracketLiterals(value, state);
    value = transformGenericTypeLiterals(value, state);
    value = escapeMdxQuotedTextLiterals(value, state);
    value = escapeMdxTextOperators(value, state);
    value = escapeMdxTextBraces(value, state);
    value = rewriteMarkdownLinks(value, state);
    value = normalizeWhitespace(value);
  }

  return value.trim();
}

export function transformAdmonitions(value) {
  const blockConverted = value.replace(
    /^([ \t]*)<Admonition(?=[^>]*>)([^>]*)>\s*\n?([\s\S]*?)\n?[ \t]*<\/Admonition>/gm,
    (_, indent, attrs = '', body) => {
      const type = mapAdmonitionType(readAttribute(attrs, 'type') ?? 'info');
      const title = readAttribute(attrs, 'title');
      const label = title ? `[${title}]` : '';
      const normalizedBody = trimCommonIndent(transformHtmlLists(body)).trim();
      return indentBlock(
        `:::${type}${label}\n${normalizedBody}\n:::`,
        indent.length,
      );
    },
  );

  return blockConverted.replace(
    /<Admonition(?=[^>]*>)([^>]*)>\s*([\s\S]*?)\s*<\/Admonition>/g,
    (_match, attrs = '', body) => {
      const type = mapAdmonitionType(readAttribute(attrs, 'type') ?? 'info');
      const title = readAttribute(attrs, 'title');
      const label = title ? `[${title}]` : '';
      const normalizedBody = trimCommonIndent(transformHtmlLists(body)).trim();
      return `\n\n:::${type}${label}\n${normalizedBody}\n:::\n\n`;
    },
  );
}

export function findLegacyResidue(content, componentMap = EMPTY_COMPONENT_MAP) {
  const scanValue = stripMarkdownCode(content);
  const residue = [];
  const checks = [
    ['legacy-import', /^import\s/m],
    ['legacy-export', /^export\s/m],
    ['legacy-frontmatter-var', /\bfrontMatter\./],
    ['legacy-props-var', /\bprops\./],
    ['legacy-shared-alias', /@(?:doc-shared|docs\/shared|shared)\//],
    ['legacy-admonition', /<Admonition\b/],
    ['legacy-tabitem', /<TabItem\b/],
    ['legacy-image', /<Image\b/],
    ['legacy-platform-filter', /<PlatformFilter\b/],
    ['legacy-product-wrapper', /<ProductWrapper\b/],
    ['legacy-row-col', /<\/?(?:Row|Col)\b/],
    ['legacy-link-card', /<LinkCardV2\b/],
    ['legacy-table-component', /<\/?(?:Table|Tr|Td)\b/],
    ['raw-html-list', /<\/?(?:ul|ol|li)\b/i],
    ['raw-img', /<img\b/i],
  ];

  for (const [name, pattern] of checks) {
    if (pattern.test(scanValue)) {
      residue.push(name);
    }
  }

  for (const tag of scanValue.matchAll(/<\/?([A-Z][A-Za-z0-9_]*)\b/g)) {
    const tagName = tag[1];
    if (ALLOWED_MDX_TAGS.has(tagName)) {
      continue;
    }

    const mapped = componentMap.components.get(tagName);
    if (mapped) {
      residue.push(`component-map:${tagName}->${mapped.target}`);
    } else {
      residue.push(`unknown-legacy-component:${tagName}`);
    }
  }

  return unique(residue).sort();
}

function findReferenceReview(content) {
  const scanValue = stripMarkdownCode(content);
  const brokenLinks = new Set();
  const images = new Set();

  for (const match of scanValue.matchAll(
    /!\[[^\]\n]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
  )) {
    const href = match[1];
    if (isLegacyImageReference(href)) {
      images.add(href);
    }
  }

  for (const match of scanValue.matchAll(
    /(^|[^!])\[([^\]\n]+)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
  )) {
    const href = match[3];
    if (isLegacyInternalLinkReference(href)) {
      brokenLinks.add(href);
    }
  }

  for (const match of scanValue.matchAll(/\bhref=(?:"([^"]*)"|'([^']*)')/g)) {
    const href = match[1] ?? match[2] ?? '';
    if (isLegacyInternalLinkReference(href)) {
      brokenLinks.add(href);
    }
  }

  return {
    brokenLinks: [...brokenLinks].sort(),
    images: [...images].sort(),
  };
}

function referenceReviewIssues(referenceReview) {
  const issues = [];

  if (referenceReview.brokenLinks.length > 0) {
    issues.push(`断链:${referenceReview.brokenLinks.length}`);
  }

  if (referenceReview.images.length > 0) {
    issues.push(`图片:${referenceReview.images.length}`);
  }

  return issues;
}

function hasReferenceReview(referenceReview) {
  return (
    (referenceReview?.brokenLinks?.length ?? 0) > 0 ||
    (referenceReview?.images?.length ?? 0) > 0
  );
}

function isLegacyInternalLinkReference(href) {
  const path = splitHref(href).path;
  return (
    path.startsWith('/doc/') ||
    path.startsWith('/api-ref/') ||
    /^https?:\/\/doc\.shengwang\.cn\/(?:doc|api-ref)\//.test(path)
  );
}

function isLegacyImageReference(href) {
  const path = splitHref(href).path;
  return (
    path.startsWith('/img/') ||
    /^https?:\/\/doc\.shengwang\.cn\/img\//.test(path)
  );
}

function createMigrationState({
  componentMap = EMPTY_COMPONENT_MAP,
  context,
  pathMap,
  sourcePath,
  sourceRoot,
}) {
  return {
    componentMap,
    componentUsage: new Map(),
    context,
    currentSourcePath: sourcePath,
    falsePositiveUsage: new Map(),
    issues: [],
    linkLists: new Map(),
    pathMap,
    sharedDependencies: new Set(),
    sourceRoot,
    syntaxPatternUsage: new Map(),
    tableHeaders: new Map(),
  };
}

async function expandLegacyFile({
  absolutePath,
  raw,
  state,
  visited = new Set(),
}) {
  const realPath = path.resolve(absolutePath);
  if (visited.has(realPath)) {
    state.issues.push(`circular-shared-import:${toPosix(realPath)}`);
    return {
      body: '',
      frontmatter: {},
    };
  }

  visited.add(realPath);
  const parsed = parseFrontmatter(raw);
  const activeBody = stripMdxComments(parsed.body);
  recordMigrationSignals({
    body: activeBody,
    frontmatter: parsed.frontmatter,
    sourcePath: toPosix(path.relative(state.sourceRoot, realPath)),
    state,
  });
  const imports = parseImports(activeBody);
  for (const [name, links] of parseExportedLinkLists(activeBody)) {
    state.linkLists.set(name, links);
  }
  for (const [name, header] of parseExportedTableHeaders(activeBody)) {
    state.tableHeaders.set(name, header);
  }
  let body = stripImportExport(activeBody);

  for (const imported of imports) {
    if (isRuntimeOnlyImport(imported.specifier)) {
      continue;
    }

    const resolved = await resolveImportPath({
      currentFile: realPath,
      sourceRoot: state.sourceRoot,
      specifier: imported.specifier,
    });

    if (!resolved) {
      state.issues.push(`unresolved-import:${imported.specifier}`);
      continue;
    }

    state.sharedDependencies.add(
      toPosix(path.relative(state.sourceRoot, resolved)),
    );
    const replacementRaw = await fs.readFile(resolved, 'utf8');
    if (imported.namespace) {
      body = replaceNamespaceLookups(
        body,
        imported.alias,
        parseExportedObjectMaps(replacementRaw),
        state,
      );
      continue;
    }

    const replacement = await expandLegacyFile({
      absolutePath: resolved,
      raw: replacementRaw,
      state,
      visited,
    });
    body = replaceComponentUsage(body, imported.alias, replacement.body.trim(), state);
  }

  return {
    body: transformLegacyMdx(body, state),
    frontmatter: parsed.frontmatter,
  };
}

function parseFrontmatter(content) {
  content = content.replace(/\r\n?/g, '\n');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\s*/);
  if (!match) {
    return {
      body: content,
      frontmatter: {},
    };
  }

  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const parsed = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (parsed) {
      frontmatter[parsed[1]] = parsed[2].trim();
    }
  }

  return {
    body: content.slice(match[0].length),
    frontmatter,
  };
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];
  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_FRONTMATTER_KEYS.has(key)) {
      continue;
    }
    const raw = stripWrappingQuotes(frontmatter[key]);
    lines.push(`${key}: ${JSON.stringify(raw)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function parseImports(content) {
  const scanValue = stripCodeFences(stripMdxComments(content));
  const imports = [];
  const importPattern =
    /^import\s+(.+?)\s+from\s+['"](.+?)['"];?\s*$/gm;
  let match = importPattern.exec(scanValue);

  while (match) {
    const importClause = match[1].trim();
    const namespaceMatch = importClause.match(/^\*\s+as\s+([A-Za-z0-9_]+)$/);
    const defaultMatch = importClause.match(/^([A-Za-z0-9_]+)/);
    const alias = namespaceMatch?.[1] ?? defaultMatch?.[1] ?? null;

    if (!alias) {
      match = importPattern.exec(scanValue);
      continue;
    }

    imports.push({
      alias,
      namespace: Boolean(namespaceMatch),
      specifier: match[2],
    });
    match = importPattern.exec(scanValue);
  }

  return imports;
}

function parseExportedObjectMaps(content) {
  const maps = new Map();
  const exportPattern =
    /^export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\{([\s\S]*?)^\s*}\s*;?\s*$/gm;
  let exportMatch = exportPattern.exec(content);

  while (exportMatch) {
    const values = new Map();
    const propertyPattern =
      /\b([A-Za-z0-9_]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^,\n]+))/g;
    let propertyMatch = propertyPattern.exec(exportMatch[2]);

    while (propertyMatch) {
      values.set(
        propertyMatch[1],
        (
          propertyMatch[2] ??
          propertyMatch[3] ??
          propertyMatch[4] ??
          propertyMatch[5] ??
          ''
        ).trim(),
      );
      propertyMatch = propertyPattern.exec(exportMatch[2]);
    }

    maps.set(exportMatch[1], values);
    exportMatch = exportPattern.exec(content);
  }

  return maps;
}

function replaceNamespaceLookups(content, namespaceName, maps, state) {
  if (maps.size === 0) {
    return content;
  }

  const escaped = escapeRegExp(namespaceName);
  const platform = state.context.platform ?? '';
  return content.replace(
    new RegExp(
      String.raw`\{${escaped}\.([A-Za-z0-9_]+)\s*\[\s*frontMatter\.ag_platform\s*]\s*}`,
      'g',
    ),
    (match, exportName) => {
      const exportMap = maps.get(exportName);
      if (!exportMap) {
        return match;
      }

      if (!platform) {
        return `${namespaceName}.${exportName}`;
      }

      const platformValue = exportMap.get(platform);
      if (platformValue === undefined) {
        state.issues.push(
          `unresolved-namespace-lookup:${namespaceName}.${exportName}.${platform}`,
        );
        return '';
      }

      return platformValue;
    },
  );
}

function parseExportedLinkLists(content) {
  const linkLists = new Map();
  const exportPattern =
    /^export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)^\s*]\s*;?\s*$/gm;
  let exportMatch = exportPattern.exec(content);

  while (exportMatch) {
    const links = [];
    const itemPattern =
      /\{[\s\S]*?\btitle\s*:\s*['"]([^'"]+)['"][\s\S]*?\bhref\s*:\s*['"]([^'"]+)['"][\s\S]*?}/g;
    let itemMatch = itemPattern.exec(exportMatch[2]);

    while (itemMatch) {
      links.push({
        href: itemMatch[2],
        title: itemMatch[1],
      });
      itemMatch = itemPattern.exec(exportMatch[2]);
    }

    if (links.length > 0) {
      linkLists.set(exportMatch[1], links);
    }

    exportMatch = exportPattern.exec(content);
  }

  return linkLists;
}

function parseExportedTableHeaders(content) {
  const tableHeaders = new Map();
  const exportPattern =
    /^export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)^\s*]\s*;?\s*$/gm;
  let exportMatch = exportPattern.exec(content);

  while (exportMatch) {
    const labels = [];
    const labelPattern = /\blabel\s*:\s*['"]([^'"]+)['"]/g;
    let labelMatch = labelPattern.exec(exportMatch[2]);

    while (labelMatch) {
      labels.push(labelMatch[1]);
      labelMatch = labelPattern.exec(exportMatch[2]);
    }

    if (labels.length > 0) {
      tableHeaders.set(exportMatch[1], labels);
    }

    exportMatch = exportPattern.exec(content);
  }

  return tableHeaders;
}

export function stripImportExport(content) {
  const lines = stripMdxComments(content).replace(/\r\n?/g, '\n').split('\n');
  let inCodeFence = false;
  let skippingExportBlock = false;
  let exportBlockDepth = 0;
  let countExportBlockDepth = countSquareBrackets;

  return lines
    .filter((line) => {
      if (/^\s*```/.test(line)) {
        inCodeFence = !inCodeFence;
        return true;
      }

      if (inCodeFence) {
        return true;
      }

      if (skippingExportBlock) {
        exportBlockDepth += countExportBlockDepth(line);
        if (exportBlockDepth <= 0) {
          skippingExportBlock = false;
          exportBlockDepth = 0;
          countExportBlockDepth = countSquareBrackets;
        }
        return false;
      }

      if (/^export\s+const\s+[A-Za-z0-9_]+\s*=\s*\[/.test(line)) {
        countExportBlockDepth = countSquareBrackets;
        exportBlockDepth = countSquareBrackets(line);
        if (exportBlockDepth > 0) {
          skippingExportBlock = true;
        }
        return false;
      }

      if (/^export\s+const\s+[A-Za-z0-9_]+\s*=\s*\{/.test(line)) {
        countExportBlockDepth = countCurlyBraces;
        exportBlockDepth = countCurlyBraces(line);
        if (exportBlockDepth > 0) {
          skippingExportBlock = true;
        }
        return false;
      }

      return (
        !/^import\s+.*$/.test(line) &&
        !/^export\s+const\s+toc\s+=\s+.*$/.test(line) &&
        !/^export\s+/.test(line)
      );
    })
    .join('\n');
}

function isRuntimeOnlyImport(specifier) {
  return (
    specifier.startsWith('@theme/') || specifier.startsWith('@docusaurus/')
  );
}

async function resolveImportPath({ currentFile, sourceRoot, specifier }) {
  let candidate;

  if (specifier.startsWith('@doc-shared/')) {
    candidate = path.join(
      sourceRoot,
      'docs/shared',
      specifier.slice('@doc-shared/'.length),
    );
  } else if (specifier.startsWith('@docs/shared/')) {
    candidate = path.join(
      sourceRoot,
      'docs/shared',
      specifier.slice('@docs/shared/'.length),
    );
  } else if (specifier.startsWith('@shared/')) {
    candidate = path.join(
      sourceRoot,
      'shared',
      specifier.slice('@shared/'.length),
    );
  } else if (specifier.startsWith('@api-shared/')) {
    candidate = path.join(
      sourceRoot,
      'docs-api-reference/shared',
      specifier.slice('@api-shared/'.length),
    );
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    candidate = path.resolve(path.dirname(currentFile), specifier);
  } else {
    return null;
  }

  return findExistingFile(candidate);
}

async function findExistingFile(candidate) {
  const candidates = [candidate, `${candidate}.mdx`, `${candidate}.md`];
  for (const item of candidates) {
    try {
      const stats = await fs.stat(item);
      if (stats.isFile()) {
        return item;
      }
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

const JSX_ATTRS_PATTERN = String.raw`(?:[^"'>{}]|"[^"]*"|'[^']*'|\{[^}]*\})*`;

function replaceComponentUsage(content, componentName, replacement, state) {
  const escaped = escapeRegExp(componentName);
  const nameBoundary = String.raw`(?=[\s>/])`;
  const pairedBlock = new RegExp(
    `^[ \\t]*<${escaped}${nameBoundary}(${JSX_ATTRS_PATTERN})>[\\s\\S]*?<\\/${escaped}\\s*>[ \\t]*$`,
    'gm',
  );
  const selfClosingBlock = new RegExp(
    `^[ \\t]*<${escaped}${nameBoundary}(${JSX_ATTRS_PATTERN})\\s*\\/>[ \\t]*$`,
    'gm',
  );
  const paired = new RegExp(
    `<${escaped}${nameBoundary}(${JSX_ATTRS_PATTERN})>[\\s\\S]*?<\\/${escaped}\\s*>`,
    'g',
  );
  const selfClosing = new RegExp(
    `<${escaped}${nameBoundary}(${JSX_ATTRS_PATTERN})\\s*\\/>`,
    'g',
  );
  const renderReplacement = (_, attrs = '') =>
    applyComponentProps(replacement, parseStaticProps(attrs, state));

  return content
    .replace(pairedBlock, renderReplacement)
    .replace(selfClosingBlock, renderReplacement)
    .replace(paired, renderReplacement)
    .replace(selfClosing, renderReplacement);
}

function parseStaticProps(attrs, state) {
  const props = new Map();
  const pattern =
    /\b([A-Za-z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([^`]*)`\s*\})/g;
  let match = pattern.exec(attrs);

  while (match) {
    props.set(
      match[1],
      match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6] ?? '',
    );
    match = pattern.exec(attrs);
  }

  const expressionPattern =
    /\b([A-Za-z0-9_]+)\s*=\s*\{\s*(?:frontMatter|props)\.([A-Za-z0-9_]+)\s*\}/g;
  let expressionMatch = expressionPattern.exec(attrs);

  while (expressionMatch) {
    props.set(expressionMatch[1], getRuntimePropValue(expressionMatch[2], state) ?? '');
    expressionMatch = expressionPattern.exec(attrs);
  }

  return props;
}

function applyComponentProps(replacement, props) {
  return evaluateStaticPropConditionals(
    transformHtmlComponent(replacement, { props }),
    props,
  ).replace(
    /\{?props\.([A-Za-z0-9_]+)\}?/g,
    (_, name) => props.get(name) ?? '',
  );
}

function evaluateStaticPropConditionals(value, props) {
  return value.replace(
    /\{\s*props\.([A-Za-z0-9_]+)\s*={2,3}\s*(['"])(.*?)\2\s*&&\s*([\s\S]*?)\s*}\s*(?=\n\s*(?:\{props\.|#{1,6}\s)|\s*$)/g,
    (match, propName, _quote, expectedValue, body) => {
      const actualValue = props.get(propName);
      if (actualValue == null) {
        return match;
      }

      return actualValue === expectedValue ? `\n${body.trim()}\n` : '';
    },
  );
}

function stripMdxComments(value) {
  return value.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function transformProductWrapper(value, state) {
  return value.replace(
    /<ProductWrapper([^>]*)>([\s\S]*?)<\/ProductWrapper\s*>/g,
    (_, attrs, body) => {
      const product = state.context.product;
      const allowed = readListLikeAttribute(attrs, 'product');
      const notAllowed = readListLikeAttribute(attrs, 'notAllowed');

      if (allowed.length > 0) {
        return allowed.includes(product) ? body : '';
      }

      if (notAllowed.length > 0) {
        return notAllowed.includes(product) ? '' : body;
      }

      return body;
    },
  );
}

function transformPlatformFilter(value, state) {
  return value.replace(
    /<PlatformFilter([^>]*)>([\s\S]*?)<\/PlatformFilter\s*>/g,
    (match, attrs, body, offset, source) => {
      const platforms = readListLikeAttribute(attrs, 'platformList');
      const contextPlatforms = state.context.platforms.length
        ? state.context.platforms
        : [state.context.platform].filter(Boolean);

      if (platforms.length === 0 || contextPlatforms.length === 0) {
        state.issues.push('needs-platform-filter-review');
        return body;
      }

      const selectedPlatforms = platforms.filter((platform) =>
        contextPlatforms.includes(platform),
      );

      if (selectedPlatforms.length === 0) {
        return '';
      }

      if (contextPlatforms.length <= 1) {
        return body;
      }

      const wrapper = isWholeLineMatch({ match, offset, source })
        ? 'PlatformStructured'
        : 'PlatformInline';
      return selectedPlatforms
        .map(
          (platform) =>
            `<${wrapper} platform="${platform}">\n${body.trim()}\n</${wrapper}>`,
        )
        .join('\n\n');
    },
  );
}

function isWholeLineMatch({ match, offset, source }) {
  const lineStart = source.lastIndexOf('\n', offset) + 1;
  const nextLineStart = source.indexOf('\n', offset + match.length);
  const lineEnd = nextLineStart === -1 ? source.length : nextLineStart;
  const before = source.slice(lineStart, offset).trim();
  const after = source.slice(offset + match.length, lineEnd).trim();
  return !before && !after;
}

function transformRuntimeVariables(value, state) {
  const { platform, product } = state.context;
  const productLabel = getProductLabel(product);
  const platformLabel = getPlatformLabel(platform);
  return value
    .replace(/\$\{props\.ag_platform\}/g, platform)
    .replace(/\$\{props\.ag_product\}/g, product)
    .replace(/\$\{frontMatter\.ag_platform\}/g, platform)
    .replace(/\$\{frontMatter\.ag_platform_label\}/g, platformLabel)
    .replace(/\$\{frontMatter\.ag_product_label\}/g, productLabel)
    .replace(/\$\{frontMatter\.ag_product\}/g, product)
    .replace(/\{frontMatter\.ag_platform\}/g, platform)
    .replace(/\{frontMatter\.ag_platform_label\}/g, platformLabel)
    .replace(/\{frontMatter\.ag_product_label\}/g, productLabel)
    .replace(/\{frontMatter\.ag_product\}/g, product)
    .replace(/\bfrontMatter\.ag_platform\b/g, JSON.stringify(platform))
    .replace(/\bfrontMatter\.ag_platform_label\b/g, JSON.stringify(platformLabel))
    .replace(/\bfrontMatter\.ag_product_label\b/g, JSON.stringify(productLabel))
    .replace(/\bfrontMatter\.ag_product\b/g, JSON.stringify(product))
    .replace(
      /\{props\.([A-Za-z0-9_]+)\}/g,
      (match, name) => getRuntimePropValue(name, state) ?? match,
    )
    .replace(
      /\bprops\.([A-Za-z0-9_]+)\b/g,
      (match, name) => getRuntimePropValue(name, state) ?? match,
    );
}

function getProductLabel(product) {
  return PRODUCT_LABELS.get(product) ?? product;
}

function getPlatformLabel(platform) {
  if (!platform) {
    return '';
  }

  return PLATFORM_LABELS.get(platform) ?? platform;
}

function getRuntimePropValue(name, state) {
  if (name === 'ag_platform') {
    return state.context.platform;
  }

  if (name === 'ag_platform_label') {
    return getPlatformLabel(state.context.platform);
  }

  if (name === 'ag_product') {
    return state.context.product;
  }

  if (name === 'ag_product_label') {
    return getProductLabel(state.context.product);
  }

  if (!state.props) {
    return null;
  }

  return state.props.get(name) ?? '';
}

function transformLegacyLinks(value, state) {
  let output = value.replace(
    /<Link\b([^>]*)>([\s\S]*?)<\/Link>/g,
    (match, attrs, label) => {
      const href = readAttribute(attrs, 'to');

      return href
        ? `[${collapseInline(label)}](${normalizeHref(href, state)})`
        : match;
    },
  );

  output = output.replace(
    /<a\b(?![^>]*\/\s*>)([^>]*)>([\s\S]*?)<\/a\s*>/g,
    (match, attrs, label) => {
      const href = readLegacyHrefAttribute(attrs, 'href');

      return href
        ? `[${collapseInline(label)}](${normalizeHref(href, state)})`
        : match;
    },
  );

  return output;
}

function readLegacyHrefAttribute(attrs, name) {
  const quoted = readAttribute(attrs, name);
  if (quoted) return quoted;
  const expression = readExpressionAttribute(attrs, name)?.trim();
  const template = expression?.match(/^`([^`]*)`$/);
  if (template) return template[1];
  const stringLiteral = expression?.match(/^(['"])([\s\S]*)\1$/);
  return stringLiteral?.[2] ?? null;
}

function normalizeHref(href, state) {
  const next = href
    .replace(/\$\{props\.ag_platform\}/g, state.context.platform)
    .replace(/\$\{props\.ag_product\}/g, state.context.product)
    .replace(/\$\{(['"])(.*?)\1\}/g, '$2')
    .replace(/\{`([^`]+)`\}/g, '$1');

  if (next.startsWith('/doc/')) {
    const mapped = mapLegacyDocHref(next, state);
    if (mapped) {
      return mapped;
    }
  }

  return next;
}

function mapLegacyDocHref(href, state) {
  const parsed = splitHref(href);
  const segments = parsed.path.split('/').filter(Boolean);
  const [, product, maybePlatform, ...rest] = segments;

  if (!product || rest.length === 0) {
    return null;
  }

  const platform =
    maybePlatform && maybePlatform !== product ? maybePlatform : '';
  const sourceStem = `docs/${product}/${rest.join('/')}`;
  const mapped = findMappedRoute({
    pathMap: state.pathMap,
    platform: platform || state.context.platform,
    sourceStem,
  });

  return mapped ? `${mapped}${parsed.search}${parsed.hash}` : null;
}

function transformAnchors(value) {
  let output = value.replace(
    /<a\s+(?:name|id)=['"]([^'"]+)['"]\s*\/?>\s*(?!<\/a>)/g,
    (_, id) => `<a id="${id}"></a>\n`,
  );
  output = output.replace(
    /^(#{1,6})\s*<a\s+(?:name|id)=['"]([^'"]+)['"]\s*\/?><\/a>?\s*(.+)$/gm,
    (_, hashes, id, title) => renderAnchoredHeading(hashes, title, id),
  );
  output = output.replace(
    /<a\s+(?:name|id)=['"]([^'"]+)['"]\s*\/?><\/a>?\s*\n(#{1,6})\s+(.+)/g,
    (_, id, hashes, title) => renderAnchoredHeading(hashes, title, id),
  );
  output = output.replace(
    /^(#{1,6})\s+(.+?)\s*<a\s+(?:name|id)=['"]([^'"]+)['"]\s*\/?><\/a>?[ \t]*$/gm,
    (_, hashes, title, id) => renderAnchoredHeading(hashes, title, id),
  );
  output = output.replace(
    /<a\s+(?:name|id)=['"]([^'"]+)['"]\s*\/?><\/a>?\s*/g,
    (_, id) => `<a id="${id}"></a>\n`,
  );
  return output;
}

function renderAnchoredHeading(hashes, title, id) {
  return `<a id="${id}"></a>\n${hashes} ${title.trim()}`;
}

function transformHeadingComponents(value) {
  return value
    .replace(
    /^([ \t]*)<H([1-6])\b([^>]*)>([^\n]*?)<\/H\2>([^\n]*)$/gm,
    (_, indent, level, attrs, body, suffix) => {
      const id = readAttribute(attrs, 'id');
      const title = collapseInline(`${body}${suffix ?? ''}`);
      const heading = `${'#'.repeat(Number(level))} ${title}`;
      return id
        ? `${indent}<a id="${id}"></a>\n${indent}${heading}`
        : `${indent}${heading}`;
    },
    )
    .replace(
      /^([ \t]*)<h([1-6])\b([^>]*)>([^\n]*?)<\/h\2>([^\n]*)$/gm,
      (_, indent, level, attrs, body, suffix) => {
        const id = readAttribute(attrs, 'id');
        const title = collapseInline(`${body}${suffix ?? ''}`);
        const heading = `${'#'.repeat(Number(level))} ${title}`;
        return id
          ? `${indent}<a id="${id}"></a>\n${indent}${heading}`
          : `${indent}${heading}`;
      },
    );
}

function transformReleaseNoteComponents(value, state) {
  let output = value.replace(
    /<VersionSection\b([^>]*)>([\s\S]*?)<\/VersionSection>/g,
    (_, attrs, body) => {
      const version = readAttribute(attrs, 'version') ?? collapseInline(body);
      state.issues.push('normalized-release-note-components');
      return `\n## ${version}\n\n${body.trim()}\n`;
    },
  );

  output = output.replace(
    /<VersionTitle\b[^>]*>([\s\S]*?)<\/VersionTitle>/g,
    (_, body) => {
      state.issues.push('normalized-release-note-components');
      return `\n### ${collapseInline(body)}\n`;
    },
  );

  output = output.replace(
    /<ListTitle\b[^>]*>([\s\S]*?)<\/ListTitle>/g,
    (_, body) => {
      state.issues.push('normalized-release-note-components');
      return `\n#### ${collapseInline(body)}\n`;
    },
  );

  return output;
}

function transformLegacyInlineComponents(value, state) {
  let output = value.replace(
    /<Text\b[^>]*>([\s\S]*?)<\/Text>/g,
    (_match, body) => {
      state.issues.push('normalized-text-component');
      return collapseInline(body);
    },
  );

  output = output.replace(
    /<String\b[^>]*>([\s\S]*?)<\/String>/g,
    (_match, body) => collapseInline(body),
  );
  output = output.replace(
    /<Object\b[^>]*>([\s\S]*?)<\/Object>/g,
    (_match, body) => collapseInline(body),
  );

  return output;
}

function normalizeMalformedLegacyTags(value) {
  return replaceOutsideCode(value, (text) =>
    text
      .replace(/<\s+(\/?)\s*(Table|Tr|Td|Th)\b/gi, '<$1$2')
      .replace(/<\/\s+(Table|Tr|Td|Th)\s*>/gi, '</$1>')
      .replace(/<\s*(\/?)\s*(Table|Tr|Td|Th)\s+>/gi, '<$1$2>'),
  );
}

function transformCodeFenceMetadata(value, state) {
  return value.replace(
    /^([ \t]*)```([A-Za-z0-9_+#.-]+)([^\n`]*)$/gm,
    (_, indent, lang, meta) => {
      const normalizedLang = CODE_LANG_ALIASES.get(lang) ?? lang;
      const normalizedMeta = meta
        .split(/\s+/)
        .filter((item) => item && item !== 'expandByDefault')
        .join(' ');

      if (normalizedLang !== lang) {
        state.issues.push(
          `normalized-code-language:${lang}->${normalizedLang}`,
        );
      }

      return `${indent}\`\`\`${normalizedLang}${normalizedMeta ? ` ${normalizedMeta}` : ''}`;
    },
  );
}

function transformCodeBlockComponent(value) {
  return value.replace(
    /<CodeBlock\s+language=['"]([^'"]+)['"][^>]*>\s*\{`([\s\S]*?)`\}\s*<\/CodeBlock>/g,
    (_, language, body) => `\n\`\`\`${language}\n${body.trim()}\n\`\`\`\n`,
  );
}

function transformLinkTooltips(value, state) {
  return value.replace(
    /<LinkTooltip\s+links=\{([A-Za-z0-9_]+)\}[^>]*>([\s\S]*?)<\/LinkTooltip>/g,
    (_match, listName, label) => {
      const links = state.linkLists?.get(listName);

      if (!links?.length) {
        state.issues.push(`needs-link-tooltip-review:${listName}`);
        return collapseInline(label);
      }

      state.issues.push(`normalized-link-tooltip:${listName}`);
      if (links.length === 1) {
        return `[${collapseInline(label)}](${links[0].href})`;
      }

      const renderedLinks = links
        .map((link) => `[${link.title}](${link.href})`)
        .join(', ');
      return `${collapseInline(label)} (${renderedLinks})`;
    },
  );
}

function transformLinkCards(value, state) {
  let output = value.replace(
    /<Row\b[^>]*>([\s\S]*?)<\/Row>/g,
    (match, body) => {
      const cards = parseLegacyLinkCards(body, state);

      if (cards.length === 0) {
        return match;
      }

      state.issues.push('normalized-link-cards');
      return renderCardsBlock(cards);
    },
  );

  output = output.replace(/<LinkCardV2\b([^>]*)\/>/g, (_, attrs) => {
    state.issues.push('normalized-link-cards');
    return renderCardsBlock([legacyLinkCardFromAttrs(attrs, state)]);
  });

  output = output.replace(/<LinkBlock\b([^>]*)\/>/g, (_, attrs) => {
    state.issues.push('normalized-link-cards');
    return renderCardsBlock([legacyLinkCardFromAttrs(attrs, state)]);
  });

  output = output.replace(
    /<(?<name>LinkCard|DocLinkCard|HotArticleCard|RecommendCard|QuickStartCard|InstantExperienceCard|SDKDownloadCard|PlatformGuideCard|LinkCardA|LinkCardB|LinkCardC|DownloadCard)\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/\k<name>>/g,
    (match, _name, _attrs, _body, _offset, _source, groups) => {
      const card = legacyLinkCardFromAttrs(groups.attrs, state);
      const bodyTitle = collapseInline(groups.body);
      state.issues.push('normalized-link-cards');
      return renderMarkdownLinkCard({
        ...card,
        title: card.title === card.href && bodyTitle ? bodyTitle : card.title,
      });
    },
  );

  output = output.replace(
    /<(?<name>LinkCard|DocLinkCard|HotArticleCard|RecommendCard|QuickStartCard|InstantExperienceCard|SDKDownloadCard|PlatformGuideCard|LinkCardA|LinkCardB|LinkCardC|DownloadCard)\b(?<attrs>[^>]*)\/>/g,
    (match, _name, _attrs, _offset, _source, groups) => {
      state.issues.push('normalized-link-cards');
      return renderMarkdownLinkCard(legacyLinkCardFromAttrs(groups.attrs, state));
    },
  );

  return output
    .replace(/<ProductOverview\b[^>]*>/g, '')
    .replace(/<\/ProductOverview>/g, '')
    .replace(/<\/?(?:Row|Col)\b[^>]*>/g, '')
    .replace(/<\/Cards>\s*\n\s*<Cards>/g, '');
}

function transformLegacyLandingComponents(value, state) {
  let output = value;

  output = output.replace(
    /<(?<name>ListPanelAV2|ListPanel)\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/\k<name>>/g,
    (_match, _name, _attrs, _body, _offset, _source, groups) => {
      state.issues.push('normalized-landing-list-panel');
      return renderLegacyPanel(groups.attrs, groups.body, state);
    },
  );

  output = output.replace(
    /<LinkList\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/LinkList>/g,
    (_match, _attrs, _body, _offset, _source, groups) => {
      state.issues.push('normalized-link-list');
      return renderLegacyLinkList(groups.attrs, groups.body, state);
    },
  );

  output = output.replace(
    /<QuickGuide\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/QuickGuide>/g,
    (_match, _attrs, _body, _offset, _source, groups) => {
      state.issues.push('normalized-quick-guide');
      return renderLegacyQuickGuide(groups.attrs, groups.body, state);
    },
  );

  output = output.replace(
    /<QuickGuide\b(?<attrs>[^>]*)\/>/g,
    (_match, _attrs, _offset, _source, groups) => {
      state.issues.push('normalized-quick-guide');
      return renderLegacyQuickGuide(groups.attrs, '', state);
    },
  );

  output = output.replace(
    /<ImageGallery\b(?<attrs>[\s\S]*?)\/>/g,
    (_match, _attrs, _offset, _source, groups) => {
      const items = readObjectArrayAttribute(groups.attrs, 'list', state);
      if (items.length === 0) {
        return '';
      }

      state.issues.push('normalized-image-gallery');
      return renderImageGalleryItems(items);
    },
  );

  output = transformListItems(output, state);

  return output;
}

function renderLegacyPanel(attrs, body, state) {
  const title = readAttribute(attrs, 'title') ?? '';
  const description =
    readAttribute(attrs, 'desc') ?? readAttribute(attrs, 'description');
  const image = readAttribute(attrs, 'img') ?? readAttribute(attrs, 'image');
  const linkAttr = readObjectArrayAttribute(attrs, 'links', state);
  const links = linkAttr.length
    ? linkAttr
    : readObjectArrayAttribute(attrs, 'href', state);
  const items = extractListItemTexts(body);
  const fallbackBody = transformListItems(trimCommonIndent(body), state).trim();
  const lines = [];

  if (image) {
    lines.push(`![${title || 'image'}](${image})`, '');
  }

  if (title || description) {
    lines.push(renderStrongListItem(title, description));
  }

  if (items.length > 0) {
    lines.push(...items.map((item) => `  - ${item}`));
  } else if (fallbackBody) {
    lines.push(...fallbackBody.split('\n').map((line) => `  ${line}`));
  }

  for (const link of links) {
    lines.push(`  - ${renderMarkdownLinkCard(link).replace(/^- /, '')}`);
  }

  return `\n${lines.filter((line, index) => line || lines[index - 1]).join('\n')}\n`;
}

function renderLegacyLinkList(attrs, body, state) {
  const title = readAttribute(attrs, 'title') ?? '';
  const hrefAttr = readObjectArrayAttribute(attrs, 'href', state);
  const links = hrefAttr.length
    ? hrefAttr
    : readObjectArrayAttribute(attrs, 'links', state);
  const content = trimCommonIndent(body).trim();
  const lines = [];

  if (title) {
    lines.push(`### ${title}`);
  }

  if (content) {
    lines.push('', content);
  }

  if (links.length) {
    lines.push('', ...links.map((link) => renderMarkdownLinkCard(link)));
  }

  return `\n${lines.join('\n')}\n`;
}

function renderLegacyQuickGuide(attrs, body, state) {
  const image = readAttribute(attrs, 'img') ?? readAttribute(attrs, 'image');
  const title = readAttribute(attrs, 'title') ?? '';
  const hrefAttr = readObjectArrayAttribute(attrs, 'href', state);
  const links = hrefAttr.length
    ? hrefAttr
    : readObjectArrayAttribute(attrs, 'links', state);
  const content = trimCommonIndent(body).trim();
  const lines = [];

  if (image) {
    lines.push(`![${title || 'guide'}](${image})`);
  }

  if (content) {
    lines.push('', content);
  }

  if (links.length) {
    lines.push('', ...links.map((link) => renderMarkdownLinkCard(link)));
  }

  return `\n${lines.join('\n')}\n`;
}

function renderImageGalleryItems(items) {
  return items
    .map((item) => {
      const title = item.text ?? item.title ?? item.alt ?? 'image';
      const image = item.img ?? item.src ?? item.image;
      return image ? `![${title}](${image})\n\n- ${title}` : `- ${title}`;
    })
    .join('\n\n');
}

function transformListItems(value, state) {
  return value.replace(
    /^[ \t]*<ListItem\b[^>]*>([\s\S]*?)<\/ListItem>[ \t]*$/gm,
    (_match, body) => {
      state.issues.push('normalized-list-item');
      return `- ${collapseInline(body)}`;
    },
  );
}

function extractListItemTexts(body) {
  return [...body.matchAll(/<ListItem\b[^>]*>([\s\S]*?)<\/ListItem>/g)]
    .map((match) => collapseInline(match[1]))
    .filter(Boolean);
}

function renderStrongListItem(title, description) {
  if (title && description) {
    return `- **${title}**：${description}`;
  }

  if (title) {
    return `- **${title}**`;
  }

  return `- ${description}`;
}

function parseLegacyLinkCards(value, state) {
  return [...value.matchAll(/<LinkCardV2\b([^>]*)\/>/g)].map((match) =>
    legacyLinkCardFromAttrs(match[1], state),
  );
}

function legacyLinkCardFromAttrs(attrs, state) {
  const rawHref = readAttribute(attrs, 'href') ?? '#';
  const href = normalizeHref(rawHref, state);
  return {
    description:
      readAttribute(attrs, 'description') ?? readAttribute(attrs, 'desc'),
    href,
    title: readAttribute(attrs, 'title') ?? href,
  };
}

function renderCardsBlock(cards) {
  return ['<Cards>', ...cards.map((card) => renderCard(card)), '</Cards>'].join(
    '\n',
  );
}

function renderMarkdownLinkCard(card) {
  const title = card.title || card.href;
  return card.href && card.href !== '#'
    ? `- [${title}](${card.href})`
    : `- ${title}`;
}

function renderCard(card) {
  const attrs = [
    ['title', card.title],
    ['href', card.href],
    ['description', card.description],
  ].filter(([, value]) => value);

  if (attrs.length <= 2) {
    return `  <Card ${attrs
      .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
      .join(' ')} />`;
  }

  return [
    '  <Card',
    ...attrs.map(([name, value]) => `    ${name}=${JSON.stringify(value)}`),
    '  />',
  ].join('\n');
}

function transformImages(value, state) {
  return value.replace(/<Image\b([^>]*?)(?:\/>|>\s*<\/Image>)/g, (_, attrs) => {
    const src = readAttribute(attrs, 'src') ?? '';
    const alt = readAttribute(attrs, 'alt') ?? '';
    const width = readAttribute(attrs, 'width');
    const inline = hasBooleanAttribute(attrs, 'inline');

    if (width) {
      state.issues.push(`needs-image-width-review:${src}:${width}`);
    }

    if (inline) {
      return `![${alt}](${src})`;
    }

    return `\n![${alt}](${src})\n`;
  });
}

function transformRawHtmlImages(value, state) {
  return value.replace(/<img\b([^>]*)\/?>/gi, (match, attrs) => {
    const src = readAttribute(attrs, 'src');
    const alt = readAttribute(attrs, 'alt') ?? '';

    if (!src) {
      state.issues.push('needs-raw-img-review');
      return match;
    }

    state.issues.push('normalized-raw-img');
    if (hasBooleanAttribute(attrs, 'inline')) {
      return `![${alt}](${src})`;
    }

    return `\n![${alt}](${src})\n`;
  });
}

function hasBooleanAttribute(attrs, name) {
  return new RegExp(`(?:^|\\s)${escapeRegExp(name)}(?:\\s|=|$)`).test(attrs);
}

function transformTabs(value) {
  let output = value;
  const restoredTags = [];

  while (true) {
    const pair = findInnermostLegacyTabs(output);
    if (!pair) break;
    const converted = convertLegacyTabsBlock({
      attrs: pair.attrs,
      body: output.slice(pair.openEnd, pair.closeStart),
      restoredTags,
    });
    if (!converted) break;
    output = `${output.slice(0, pair.openStart)}${converted}${output.slice(pair.closeEnd)}`;
  }

  for (const [token, tag] of restoredTags) {
    output = output.replace(token, tag);
  }
  return output;
}

function findInnermostLegacyTabs(value) {
  const pattern = /<\/?Tabs\b[^>]*>/g;
  const stack = [];
  const pairs = [];
  let match = pattern.exec(value);

  while (match) {
    if (match[0].startsWith('</')) {
      const open = stack.pop();
      if (open) {
        pairs.push({
          ...open,
          closeStart: match.index,
          closeEnd: pattern.lastIndex,
        });
      }
    } else {
      const lineStart = value.lastIndexOf('\n', match.index - 1) + 1;
      const openStart = value.slice(lineStart, match.index).trim()
        ? match.index
        : lineStart;
      stack.push({
        attrs: match[0].slice('<Tabs'.length, -1),
        openStart,
        openEnd: pattern.lastIndex,
      });
    }
    match = pattern.exec(value);
  }

  return pairs.find((pair) => {
    const body = value.slice(pair.openEnd, pair.closeStart);
    return !/<Tabs\b/.test(body) && /<TabItem\b/.test(body);
  });
}

function convertLegacyTabsBlock({ attrs, body, restoredTags }) {
  const items = [
    ...body.matchAll(
      /<TabItem\s+value=['"]([^'"]+)['"]\s+label=['"]([^'"]+)['"]([^>]*)>([\s\S]*?)<\/TabItem>/g,
    ),
  ];
  if (items.length === 0) return null;

  const groupId = readAttribute(attrs, 'groupId');
  const codeTabs = renderCodeFenceTabs(items, groupId);
  if (codeTabs) return codeTabs;
  const defaultValue =
    readAttribute(attrs, 'defaultValue') ??
    items.find((item) => item[3].includes('default'))?.[1] ??
    items[0][1];
  const rootAttrs = [
    `defaultValue="${defaultValue}"`,
    groupId ? `groupId="${groupId}"` : '',
    groupId ? 'persist' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const openToken = `API_CENTER_MIGRATED_TABS_OPEN_${restoredTags.length}`;
  restoredTags.push([openToken, `<Tabs ${rootAttrs}>`]);
  const closeToken = `API_CENTER_MIGRATED_TABS_CLOSE_${restoredTags.length}`;
  restoredTags.push([closeToken, '</Tabs>']);
  const triggers = items
    .map(
      (item) => `  <TabsTrigger value="${item[1]}">${item[2]}</TabsTrigger>`,
    )
    .join('\n');
  const contents = items
    .map((item) => {
      const content = trimCommonIndent(item[4]).trim();
      return `<TabsContent value="${item[1]}">\n\n${content}\n\n</TabsContent>`;
    })
    .join('\n\n');

  return [
    openToken,
    '<TabsList>',
    triggers,
    '</TabsList>',
    '',
    contents,
    closeToken,
  ].join('\n');
}

function transformRemainingTabItems(value, state) {
  return value.replace(
    /<TabItem\b([^>]*)>([\s\S]*?)<\/TabItem>/g,
    (_match, attrs, body) => {
      const title =
        readAttribute(attrs, 'label') ?? readAttribute(attrs, 'value') ?? 'Tab';
      state.issues.push('normalized-tab-item-fallback');
      return `\n#### ${title}\n\n${trimCommonIndent(body).trim()}\n`;
    },
  );
}

export function transformPlatformHeadingTabs(value, state = { issues: [] }) {
  const lines = value.split('\n');
  const inCodeFence = markCodeFenceLines(lines);
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const run = collectPlatformHeadingRun(lines, inCodeFence, index);
    if (!run) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    output.push(renderPlatformHeadingTabs(run.items));
    state.issues.push('normalized-platform-heading-tabs');
    index = run.endIndex;
  }

  return output.join('\n');
}

function markCodeFenceLines(lines) {
  const inCodeFence = [];
  let fenced = false;

  for (let index = 0; index < lines.length; index += 1) {
    inCodeFence[index] = fenced;

    if (/^[ \t]*```/.test(lines[index])) {
      fenced = !fenced;
    }
  }

  return inCodeFence;
}

function collectPlatformHeadingRun(lines, inCodeFence, startIndex) {
  const first = parsePlatformHeadingLine(lines[startIndex], inCodeFence[startIndex]);
  if (!first) {
    return null;
  }

  const items = [];
  const values = new Set();
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const heading = parsePlatformHeadingLine(
      lines[currentIndex],
      inCodeFence[currentIndex],
    );
    if (!heading || heading.depth !== first.depth || values.has(heading.value)) {
      break;
    }

    const nextHeadingIndex = findNextMarkdownHeading({
      inCodeFence,
      lines,
      startIndex: currentIndex + 1,
    });
    items.push({
      ...heading,
      content: lines.slice(currentIndex + 1, nextHeadingIndex).join('\n'),
    });
    values.add(heading.value);

    const nextHeading = parsePlatformHeadingLine(
      lines[nextHeadingIndex],
      inCodeFence[nextHeadingIndex],
    );
    if (!nextHeading || nextHeading.depth !== first.depth) {
      return items.length >= 2
        ? {
            endIndex: nextHeadingIndex,
            items,
          }
        : null;
    }

    currentIndex = nextHeadingIndex;
  }

  return items.length >= 2
    ? {
        endIndex: currentIndex,
        items,
      }
    : null;
}

function parsePlatformHeadingLine(line, inCodeFence) {
  if (inCodeFence || typeof line !== 'string') {
    return null;
  }

  const match = line.match(/^(#{4,6})\s+(.+?)\s*$/);
  if (!match) {
    return null;
  }

  const label = collapseInline(match[2]);
  const value = PLATFORM_HEADING_TAB_VALUES.get(label.toLowerCase());
  if (!value) {
    return null;
  }

  return {
    depth: match[1].length,
    label,
    value,
  };
}

function findNextMarkdownHeading({ inCodeFence, lines, startIndex }) {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (inCodeFence[index]) {
      continue;
    }

    if (/^#{1,6}\s+\S/.test(lines[index])) {
      return index;
    }
  }

  return lines.length;
}

function renderPlatformHeadingTabs(items) {
  const groupId = items.every((item) =>
    LANGUAGE_GROUP_TAB_VALUES.has(item.value),
  )
    ? 'language'
    : 'platform';
  const triggers = items
    .map(
      (item) =>
        `  <TabsTrigger value="${item.value}">${item.label}</TabsTrigger>`,
    )
    .join('\n');
  const contents = items
    .map((item) => {
      const content = normalizePlatformHeadingTabContent(item.content);
      return `<TabsContent value="${item.value}">\n\n${content}\n\n</TabsContent>`;
    })
    .join('\n\n');

  return [
    `<Tabs defaultValue="${items[0].value}" groupId="${groupId}" persist>`,
    '<TabsList>',
    triggers,
    '</TabsList>',
    '',
    contents,
    '</Tabs>',
  ].join('\n') + '\n';
}

function normalizePlatformHeadingTabContent(value) {
  const content = trimCommonIndent(value).trim();
  if (!hasLegacyTabItemIndent(content)) {
    return content;
  }

  return outdentLegacyTabItemContent(content);
}

function hasLegacyTabItemIndent(content) {
  const lines = content.split('\n');
  const firstNonBlank = lines.find((line) => line.trim());
  if (!firstNonBlank || /^[ \t]/.test(firstNonBlank)) {
    return false;
  }

  return lines.some((line) => /^ {4}\S/.test(line));
}

function outdentLegacyTabItemContent(content) {
  const output = [];
  let fenced = false;
  let outdentFence = false;

  for (const line of content.split('\n')) {
    const fence = line.match(/^([ \t]*)```/);

    if (!fenced) {
      if (fence) {
        outdentFence = fence[1].length >= 4;
        fenced = true;
      }

      output.push(line.startsWith('    ') ? line.slice(4) : line);
      continue;
    }

    output.push(outdentFence && line.startsWith('    ') ? line.slice(4) : line);

    if (fence) {
      fenced = false;
      outdentFence = false;
    }
  }

  return output.join('\n').trim();
}

function renderCodeFenceTabs(items, groupId) {
  const tabs = [];

  for (const item of items) {
    const parsed = parseSingleCodeTabContent(item[4]);
    if (!parsed) {
      return null;
    }

    if (parsed.intro) {
      return null;
    }

    const metadata = [
      `tab=${JSON.stringify(item[2])}`,
      groupId ? `tabGroup=${JSON.stringify(groupId)}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    tabs.push(
      [
        `\`\`\`${parsed.language}${metadata ? ` ${metadata}` : ''}`,
        parsed.code,
        '```',
      ].join('\n'),
    );
  }

  return tabs.join('\n\n');
}

function transformAdjacentCodeFenceTabs(value, state) {
  const segments = splitCodeFenceSegments(value);
  if (!segments.some((segment) => segment.type === 'code')) {
    return value;
  }

  const output = [];
  let index = 0;

  while (index < segments.length) {
    const segment = segments[index];
    if (segment.type !== 'code') {
      output.push(segment.value);
      index += 1;
      continue;
    }

    const run = [segment];
    let nextIndex = index + 1;
    while (
      nextIndex + 1 < segments.length &&
      segments[nextIndex].type === 'text' &&
      /^\s*$/.test(segments[nextIndex].value) &&
      segments[nextIndex + 1].type === 'code'
    ) {
      run.push(segments[nextIndex + 1]);
      nextIndex += 2;
    }

    const rendered = renderAdjacentCodeFenceTabs(run);
    if (rendered) {
      state.issues.push('normalized-adjacent-code-fence-tabs');
      output.push(rendered);
      index = nextIndex;
      continue;
    }

    output.push(segment.value);
    index += 1;
  }

  return output.join('');
}

function splitCodeFenceSegments(value) {
  const pattern =
    /^([ \t]*)```([A-Za-z0-9_+#.-]+)([^\n`]*)\n([\s\S]*?)\n\1```[ \t]*$/gm;
  const segments = [];
  let cursor = 0;
  let match = pattern.exec(value);

  while (match) {
    if (match.index > cursor) {
      segments.push({
        type: 'text',
        value: value.slice(cursor, match.index),
      });
    }

    segments.push({
      code: match[4],
      indent: match[1],
      language: match[2],
      metadata: match[3].trim(),
      type: 'code',
      value: match[0],
    });
    cursor = pattern.lastIndex;
    match = pattern.exec(value);
  }

  if (cursor < value.length) {
    segments.push({
      type: 'text',
      value: value.slice(cursor),
    });
  }

  return segments;
}

function renderAdjacentCodeFenceTabs(blocks) {
  if (blocks.length < 2) {
    return null;
  }

  const language = blocks[0].language;
  const tabs = [];
  const labels = new Set();

  for (const block of blocks) {
    const label = readCodeFenceCommentLabel(block.code, block.language);
    if (
      block.indent ||
      block.metadata ||
      block.language !== language ||
      !label ||
      labels.has(label)
    ) {
      return null;
    }

    labels.add(label);
    tabs.push(
      [
        `\`\`\`${block.language} tab=${JSON.stringify(label)}`,
        block.code.trim(),
        '```',
      ].join('\n'),
    );
  }

  return tabs.join('\n\n');
}

function readCodeFenceCommentLabel(code, language) {
  const lines = code
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  for (const line of lines) {
    const slashComment =
      /^(?:javascript|typescript|ts|tsx|jsx|java|kotlin|swift|cpp|c|csharp|objc)$/.test(
        language,
      )
        ? line.match(/^\/\/\s*(.+)$/)
        : null;
    const hashComment = /^(?:bash|shell|sh|python|ruby|yaml|toml)$/.test(
      language,
    )
      ? line.match(/^#\s*(.+)$/)
      : null;
    const htmlComment = /^(?:html|xml)$/.test(language)
      ? line.match(/^<!--\s*(.+?)\s*-->$/)
      : null;
    const label = slashComment?.[1] ?? hashComment?.[1] ?? htmlComment?.[1];

    if (!label) {
      continue;
    }

    const normalized = label
      .trim()
      .replace(/^使用(?=\S)/, '')
      .trim();
    const candidate = normalized || label.trim();
    return isCodeFenceTabLabel(candidate) ? candidate : null;
  }

  return null;
}

function isCodeFenceTabLabel(value) {
  return value.length <= 24 && !/[，。；：,.;:!?！？]/.test(value);
}

function parseSingleCodeTabContent(value) {
  const content = trimCommonIndent(value).trim();
  const match = content.match(
    /^([\s\S]*?)\n*```([A-Za-z0-9_+#.-]+)([^\n`]*)\n([\s\S]*?)\n```[ \t]*$/,
  );

  if (!match) {
    return null;
  }

  const intro = match[1].trim();
  if (intro && !/如下[：:]\s*$/.test(intro)) {
    return null;
  }

  return {
    code: match[4].trim(),
    intro,
    language: match[2],
  };
}

function transformDetails(value) {
  return value
    .replace(/^[ \t]*<Detail\b([^>]*)>([\s\S]*?)<\/Detail>/gm, (_, attrs, body) => {
      const title = readAttribute(attrs, 'title') ?? 'Details';
      const content = trimCommonIndent(body).trim();
      return [
        '<Accordions>',
        `<Accordion title=${JSON.stringify(title)}>`,
        '',
        content,
        '',
        '</Accordion>',
        '</Accordions>',
      ].join('\n');
    })
    .replace(/<\/Accordions>\s*\n\s*<Accordions>/g, '');
}

function transformHtmlTables(value, state) {
  let tableIndex = 0;

  return value.replace(
    /<(?:Table|table)\b([^>]*)>([\s\S]*?)<\/(?:Table|table)>/g,
    (match, attrs, body) => {
      const rawRows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
        (rowMatch) => {
          const cells = [
            ...rowMatch[1].matchAll(/<t([hd])\b([^>]*)>([\s\S]*?)<\/t\1>/gi),
          ];

          return cells.map((cellMatch) => ({
            colspan: readNumericAttribute(cellMatch[2], 'colspan'),
            kind: cellMatch[1].toLowerCase(),
            raw: cellMatch[3],
            rowspan: readNumericAttribute(cellMatch[2], 'rowspan'),
          }));
        },
      );
      const hasSpans = rawRows.some((row) =>
        row.some((cell) => cell.colspan > 1 || cell.rowspan > 1),
      );
      const rows = expandHtmlTableSpans(rawRows);
      const nonEmptyRows = rows.filter((row) => row.length > 0);

      if (nonEmptyRows.length === 0) {
        return match;
      }

      state.issues.push('normalized-html-table');
      if (hasSpans) {
        state.issues.push('normalized-table-span');
      }
      const headerName = readExpressionAttribute(attrs, 'header');
      const configuredHeader = headerName
        ? state.tableHeaders.get(headerName)
        : null;
      const headerIndex = nonEmptyRows.findIndex((row) =>
        row.some((cell) => cell.kind === 'h'),
      );
      const header = configuredHeader
        ? configuredHeader.map((label) => ({
            kind: 'h',
            raw: label,
          }))
        : headerIndex >= 0
          ? nonEmptyRows[headerIndex]
          : nonEmptyRows[0];
      const bodyRows = configuredHeader
        ? nonEmptyRows
        : nonEmptyRows.filter((_, index) =>
            headerIndex >= 0 ? index !== headerIndex : index !== 0,
          );

      if (configuredHeader) {
        state.issues.push(`normalized-table-header:${headerName}`);
      }

      const rendered = renderTableWithSlots({
        bodyRows,
        header,
        state,
        tableIndex,
        tableKind: 'html',
      });
      tableIndex += 1;
      return rendered;
    },
  );
}

function expandHtmlTableSpans(rows) {
  const pendingRowspans = new Map();
  const expandedRows = [];

  for (const row of rows) {
    const expanded = [];
    let columnIndex = 0;

    const fillPending = () => {
      while (pendingRowspans.has(columnIndex)) {
        const pending = pendingRowspans.get(columnIndex);
        expanded[columnIndex] = {
          kind: pending.kind,
          raw: '',
        };
        pending.remaining -= 1;
        if (pending.remaining <= 0) {
          pendingRowspans.delete(columnIndex);
        }
        columnIndex += 1;
      }
    };

    for (const cell of row) {
      fillPending();

      for (let offset = 0; offset < cell.colspan; offset += 1) {
        const targetColumn = columnIndex + offset;
        expanded[targetColumn] = {
          kind: cell.kind,
          raw: offset === 0 || cell.kind === 'h' ? cell.raw : '',
        };

        if (cell.rowspan > 1) {
          pendingRowspans.set(targetColumn, {
            kind: cell.kind,
            remaining: cell.rowspan - 1,
          });
        }
      }

      columnIndex += cell.colspan;
    }

    const maxPendingColumn = Math.max(-1, ...pendingRowspans.keys());
    while (columnIndex <= maxPendingColumn) {
      if (pendingRowspans.has(columnIndex)) {
        fillPending();
      } else {
        expanded[columnIndex] = {
          kind: 'd',
          raw: '',
        };
        columnIndex += 1;
      }
    }

    expandedRows.push(expanded);
  }

  return expandedRows;
}

function transformMarkdownTableSlots(value, state) {
  const lines = value.split('\n');
  const output = [];
  let index = 0;
  let tableIndex = 0;
  let inCodeFence = false;

  while (index < lines.length) {
    const line = lines[index];

    if (/^[ \t]*```/.test(line)) {
      inCodeFence = !inCodeFence;
      output.push(line);
      index += 1;
      continue;
    }

    if (
      !inCodeFence &&
      isMarkdownTableRow(line) &&
      isMarkdownTableSeparator(lines[index + 1])
    ) {
      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        const collected = collectMarkdownTableRow(lines, index);
        tableLines.push(collected.row);
        index = collected.nextIndex;
      }

      const rendered = renderMarkdownTableWithSlots({
        lines: tableLines,
        state,
        tableIndex,
      });
      tableIndex += 1;
      output.push(rendered);
      continue;
    }

    output.push(line);
    index += 1;
  }

  return output.join('\n');
}

function renderMarkdownTableWithSlots({ lines, state, tableIndex }) {
  const indent = lines[0].match(/^[ \t]*/)?.[0] ?? '';
  const header = splitMarkdownTableRow(lines[0]).map((raw) => ({ raw }));
  const bodyRows = lines.slice(2).map((line) =>
    splitMarkdownTableRow(line).map((raw) => ({
      raw,
    })),
  );

  if (
    !bodyRows.some((row) => row.some((cell) => isComplexTableCell(cell.raw)))
  ) {
    return lines.join('\n');
  }

  const categorizedList = renderCategorizedApiListTable({
    bodyRows,
    header,
    indent,
    state,
  });

  if (categorizedList) {
    return categorizedList;
  }

  state.issues.push('normalized-table-slot');
  return renderTableWithSlots({
    bodyRows,
    header,
    indent,
    state,
    tableIndex,
    tableKind: 'markdown',
  });
}

function renderCategorizedApiListTable({ bodyRows, header, indent, state }) {
  if (
    header.length !== 2 ||
    bodyRows.some((row) => row.length > 2) ||
    !isApiListHeader(header[0]?.raw) ||
    !isCategoryHeader(header[1]?.raw)
  ) {
    return null;
  }

  if (
    !bodyRows.some((row) => isComplexTableCell(row[0]?.raw ?? '')) ||
    bodyRows.some((row) => isComplexTableCell(row[1]?.raw ?? ''))
  ) {
    return null;
  }

  const items = [];

  for (const row of bodyRows) {
    const apiCell = row[0]?.raw ?? '';
    const categoryCell = row[1]?.raw ?? '';
    const category = normalizeInlineTableCell(categoryCell);

    if (!apiCell.trim() || !category) {
      return null;
    }

    if (isComplexTableCell(apiCell)) {
      const content = normalizeSlotDefinitionContent(apiCell);

      if (!content) {
        return null;
      }

      items.push(
        `${indent}- ${category}：\n${indentBlock(content, indent.length + 2)}`,
      );
      continue;
    }

    const api = normalizeInlineTableCell(apiCell);

    if (!api) {
      return null;
    }

    items.push(`${indent}- ${category}：${api}`);
  }

  state.issues.push('normalized-api-category-table-list');
  return items.join('\n');
}

function isApiListHeader(value = '') {
  const header = normalizeTableHeaderLabel(value);
  return /^(?:api|apis|接口|方法|函数)$/.test(header);
}

function isCategoryHeader(value = '') {
  const header = normalizeTableHeaderLabel(value);
  return /(?:类型|分类|类别|type|category|kind)$/.test(header);
}

function normalizeTableHeaderLabel(value = '') {
  return stripMarkdownCode(collapseInline(value)).toLowerCase();
}

function renderTableWithSlots({
  bodyRows,
  header,
  indent = '',
  state,
  tableIndex,
  tableKind,
}) {
  const slotDefinitions = [];
  const columnCount = Math.max(
    header.length,
    ...bodyRows.map((row) => row.length),
  );
  const normalizedHeader = padTableRow(header, columnCount).map(
    (cell, index) => ({
      value:
        normalizeInlineTableCell(cell.raw) ||
        (tableKind === 'html' ? `Column ${index + 1}` : ''),
    }),
  );
  const normalizedRows = bodyRows.map((row, rowIndex) =>
    padTableRow(row, columnCount).map((cell, cellIndex) => {
      if (isComplexTableCell(cell.raw)) {
        const name = createTableSlotName({
          cellIndex,
          rowIndex: rowIndex + 1,
          state,
          tableIndex,
          tableKind,
        });
        slotDefinitions.push({
          content: normalizeSlotDefinitionContent(cell.raw),
          name,
        });
        return {
          value: `<Slot name="${name}" />`,
        };
      }

      return {
        value: normalizeInlineTableCell(cell.raw),
      };
    }),
  );
  const table = [
    renderMarkdownTableRow(normalizedHeader, indent),
    renderMarkdownTableRow(
      Array.from({ length: columnCount }, () => ({ value: '---' })),
      indent,
    ),
    ...normalizedRows.map((row) => renderMarkdownTableRow(row, indent)),
  ].join('\n');

  if (slotDefinitions.length === 0) {
    return table;
  }

  const slots = slotDefinitions
    .map((slot) =>
      [
        `${indent}<Slot for="${slot.name}">`,
        '',
        indentBlock(slot.content, indent.length),
        '',
        `${indent}</Slot>`,
      ].join('\n'),
    )
    .join('\n\n');

  if (!state.issues.includes('normalized-table-slot')) {
    state.issues.push('normalized-table-slot');
  }

  return `${table}\n\n${slots}`;
}

function isMarkdownTableRow(line = '') {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('|', 1);
}

function collectMarkdownTableRow(lines, startIndex) {
  const rowParts = [lines[startIndex]];
  let index = startIndex + 1;

  if (isCompleteMarkdownTableRow(lines[startIndex])) {
    return {
      nextIndex: index,
      row: rowParts.join('\n'),
    };
  }

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1] ?? '';

    if (isMarkdownTableRow(line)) {
      break;
    }

    if (!isMarkdownTableContinuationLine(line, nextLine)) {
      break;
    }

    rowParts.push(line);
    index += 1;

    if (isCompleteMarkdownTableRow(line)) {
      break;
    }
  }

  return {
    nextIndex: index,
    row: rowParts.join('\n'),
  };
}

function isCompleteMarkdownTableRow(line = '') {
  return line.trim().endsWith('|');
}

function isMarkdownTableContinuationLine(line = '', nextLine = '') {
  const trimmed = line.trim();
  const nextTrimmed = nextLine.trim();

  if (!trimmed) {
    return isListItemLine(nextLine);
  }

  return (
    isListItemLine(line) ||
    /^<\/?(?:ul|ol|li|p|Admonition|Detail|Tabs|TabItem|Table|table|Slot)\b/i.test(
      trimmed,
    ) ||
    /^:::+/.test(trimmed) ||
    /^ {2,}\S/.test(line) ||
    (trimmed.endsWith('|') && !isMarkdownTableRow(line)) ||
    (!nextTrimmed && trimmed.endsWith('|'))
  );
}

function isMarkdownTableSeparator(line = '') {
  if (!isMarkdownTableRow(line)) {
    return false;
  }

  return splitMarkdownTableRow(line).every((cell) =>
    /^:?-{2,}:?$/.test(cell.trim()),
  );
}

function splitMarkdownTableRow(line) {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cell = '';
  let escaping = false;
  let codeSpanTicks = 0;

  for (const char of inner) {
    if (escaping) {
      cell += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      cell += char;
      escaping = true;
      continue;
    }

    if (char === '`') {
      codeSpanTicks = codeSpanTicks ? 0 : 1;
      cell += char;
      continue;
    }

    if (char === '|') {
      if (codeSpanTicks) {
        cell += char;
        continue;
      }

      cells.push(cell.trim());
      cell = '';
      continue;
    }

    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function isComplexTableCell(value = '') {
  return (
    /<\s*(?:ul|ol|li|p|pre|img|Image|Admonition|Detail|Tabs|Table|table)\b/i.test(value) ||
    /<br\s*\/?>/i.test(value) ||
    /(^|\n)\s*:::+/.test(value) ||
    /```/.test(value) ||
    /(^|\n)\s*(?:[-*]|\d+\.)\s+/.test(value.trim())
  );
}

function normalizeInlineTableCell(value) {
  return collapseInline(transformInlineHtml(value)).replace(/\|/g, '\\|');
}

function normalizeSlotDefinitionContent(value) {
  return ensureBlankLineBeforeList(transformInlineHtml(transformHtmlLists(value)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function ensureBlankLineBeforeList(value) {
  const lines = value.split('\n');
  const output = [];

  for (const line of lines) {
    const previous = output.at(-1) ?? '';
    if (isListItemLine(line) && previous.trim() && !isListItemLine(previous)) {
      output.push('');
    }
    output.push(line);
  }

  return output.join('\n');
}

function isListItemLine(line) {
  return /^[ \t]*(?:[-*]|\d+\.)\s+/.test(line);
}

function createTableSlotName({
  cellIndex,
  rowIndex,
  state,
  tableIndex,
  tableKind,
}) {
  const fileName = path.posix
    .basename(toPosix(state.currentSourcePath))
    .replace(/\.(md|mdx)$/i, '');
  return slugifySlotName(
    `${fileName}-${tableKind}-${tableIndex}-${rowIndex}-${cellIndex}`,
  );
}

function slugifySlotName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function padTableRow(row, columnCount) {
  return Array.from({ length: columnCount }, (_, index) => ({
    raw: row[index]?.raw ?? '',
    value: row[index]?.value ?? '',
  }));
}

function renderMarkdownTableRow(row, indent = '') {
  return `${indent}| ${row.map((cell) => cell.value).join(' | ')} |`;
}

function transformHtmlLists(value) {
  return replaceStandaloneHtmlListItems(replaceHtmlLists(value))
    .replace(/^[ \t]*<li>([\s\S]*?)<\/li>[ \t]*$/gim, (_, item) => {
      return `- ${collapseInline(transformInlineHtml(item))}`;
    })
    .replace(/^[ \t]*<\/?(?:ul|ol)>[ \t]*$/gim, '');
}

function replaceStandaloneHtmlListItems(value) {
  let output = value;
  let previous = null;

  while (previous !== output) {
    previous = output;
    output = output.replace(
      /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
      (_match, item) => {
        const normalized = transformInlineHtml(item).trim();
        if (!normalized) return '';
        const [first, ...rest] = normalized.split('\n');
        const continuation = rest
          .map((line) => (line.trim() ? `  ${line.trimStart()}` : ''))
          .join('\n');
        return `\n- ${first.trim()}${continuation ? `\n${continuation}` : ''}\n`;
      },
    );
  }

  return output;
}

function replaceHtmlLists(value, depth = 0) {
  let output = '';
  let cursor = 0;
  const listTagPattern = /<(ul|ol)\b[^>]*>/gi;

  while (true) {
    listTagPattern.lastIndex = cursor;
    const match = listTagPattern.exec(value);

    if (!match) {
      output += value.slice(cursor);
      break;
    }

    const list = findMatchingList(value, match.index);

    if (!list) {
      output += value.slice(cursor);
      break;
    }

    output += value.slice(cursor, match.index);
    output = output.replace(/[ \t]+$/g, '');
    if (output && !/\n$/.test(output)) {
      output += '\n';
    }
    output += renderHtmlList(list.inner, {
      depth,
      ordered: list.tagName === 'ol',
    });
    cursor = list.closeEnd;
  }

  return output;
}

function findMatchingList(value, openStart) {
  const openPattern = /<(ul|ol)\b[^>]*>/iy;
  openPattern.lastIndex = openStart;
  const open = openPattern.exec(value);

  if (!open) {
    return null;
  }

  const tagPattern = /<\/?(ul|ol)\b[^>]*>/gi;
  tagPattern.lastIndex = openPattern.lastIndex;
  let depth = 1;
  let match = tagPattern.exec(value);

  while (match) {
    const isClose = match[0].startsWith('</');

    if (isClose) {
      depth -= 1;
      if (depth === 0) {
        return {
          closeEnd: tagPattern.lastIndex,
          inner: value.slice(openPattern.lastIndex, match.index),
          tagName: open[1].toLowerCase(),
        };
      }
    } else {
      depth += 1;
    }

    match = tagPattern.exec(value);
  }

  return null;
}

function renderHtmlList(inner, { depth, ordered }) {
  const itemNodes = extractHtmlListItemNodes(inner);
  const items = itemNodes.map((item) => item.content);
  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);

  const renderedItems = items
    .map((item, index) => {
      const marker = ordered ? `${index + 1}.` : '-';
      const markerPrefix = `${indent}${marker} `;
      const continuationIndent = ' '.repeat(markerPrefix.length);
      const body = transformInlineHtml(
        replaceHtmlLists(item, depth + 1),
      ).trim();
      const lines = body
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line.trim());

      if (lines.length === 0) {
        return '';
      }

      const [first, ...rest] = lines;
      const continuationLines = rest.map((line) => {
        const normalizedLine = line.startsWith(childIndent)
          ? line.slice(childIndent.length)
          : line.trimStart();
        return {
          isNestedList: /^(\d+\.|[-*+])\s+/.test(normalizedLine),
          value: `${continuationIndent}${normalizedLine}`,
        };
      });
      const nested = continuationLines.map((line) => line.value).join('\n');
      const nestedSeparator = continuationLines[0]?.isNestedList
        ? '\n\n'
        : '\n';

      return `${markerPrefix}${first.trim()}${
        nested ? `${nestedSeparator}${nested}` : ''
      }`;
    })
    .filter(Boolean)
    .join('\n');
  const remainder = extractHtmlListRemainder(inner, itemNodes);
  const renderedRemainder = trimCommonIndent(
    transformInlineHtml(replaceHtmlLists(remainder, depth)),
  ).trim();

  return [renderedItems, renderedRemainder].filter(Boolean).join('\n\n');
}

function transformInlineHtml(value) {
  return value
    .replace(/<Glossary>([\s\S]*?)<\/Glossary>/g, '$1')
    .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
    .replace(/<b>([\s\S]*?)<\/b>/g, '**$1**')
    .replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/g, '*$1*')
    .replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, '$1')
    .replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, '$1')
    .replace(/<sub\b[^>]*>([\s\S]*?)<\/sub>/gi, '$1')
    .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

function normalizeInlineHtmlAttributes(value, state) {
  return replaceOutsideCode(value, (text) =>
    text.replace(/<(code|span)\b([^>]*)>/gi, (match, tagName, attrs) => {
      let normalized = attrs.replace(/\bclass=/g, 'className=');
      normalized = normalized.replace(
        /\b([A-Za-z_$][\w:.$-]*)=([A-Za-z_$][\w:.$-]*)(?=\s|$)/g,
        (_attribute, name, attributeValue) =>
          `${name}=${JSON.stringify(attributeValue)}`,
      );
      if (normalized === attrs) return match;
      state.issues.push('normalized-inline-html-attributes');
      return `<${tagName}${normalized}>`;
    }),
  );
}

function transformHtmlComponent(value, state) {
  const selfClosing = new RegExp(`<HTML\\b(${JSX_ATTRS_PATTERN})\\s*\\/>`, 'g');
  const paired = new RegExp(
    `<HTML\\b(${JSX_ATTRS_PATTERN})>[\\s\\S]*?<\\/HTML\\s*>`,
    'g',
  );
  const replaceHtml = (match, attrs) =>
    readHtmlComponentValue(attrs, state) ?? match;

  return value.replace(selfClosing, replaceHtml).replace(paired, replaceHtml);
}

function readHtmlComponentValue(attrs, state) {
  const expression = readExpressionAttribute(attrs, 'html');
  if (expression?.startsWith('props.')) {
    if (!state.props) {
      return null;
    }

    return state.props.get(expression.slice('props.'.length)) ?? '';
  }

  return readAttribute(attrs, 'html') ?? '';
}

function transformHiddenIndexSpans(value, state) {
  return value.replace(
    /<span\b([^>]*)>([\s\S]*?)<\/span>/g,
    (match, attrs, body) => {
      const className = readAttribute(attrs, 'className');
      if (!className?.split(/\s+/).some((item) => item.startsWith('index-'))) {
        return match;
      }

      if (!/display\s*:\s*['"]?none['"]?/.test(attrs)) {
        return match;
      }

      state.issues.push('dropped-hidden-index-span');
      return body.trim() ? `\n${collapseInline(body)}\n` : '';
    },
  );
}

function transformAngleBracketLiterals(value, state) {
  const examples = state.componentMap?.angleBracketLiterals ?? [];
  const candidates = examples.filter(
    (example) => example.includes('<') && example.includes('>'),
  );

  if (candidates.length === 0) {
    return value;
  }

  return replaceOutsideCode(value, (line) => {
    let output = line;

    for (const example of candidates) {
      const pattern = new RegExp(escapeRegExp(example), 'g');
      output = output.replace(pattern, (match) => {
        addSignalUsage(state.falsePositiveUsage, 'angleBracketLiterals', {
          status:
            state.componentMap.falsePositivePatterns.get('angleBracketLiterals')
              ?.status ?? 'automated-with-review',
          target:
            state.componentMap.falsePositivePatterns.get('angleBracketLiterals')
              ?.target ?? 'escape-or-code-span',
        });
        state.issues.push(`escaped-angle-bracket-literal:${match}`);
        return `\`${match}\``;
      });
    }

    return output;
  });
}

function transformGenericTypeLiterals(value, state) {
  return replaceOutsideCode(value, (text) =>
    text
      .replace(
        /\{\s*(['"])([A-Z][A-Za-z0-9_.$]*\s*<[^'"}\n]+>)\1\s*\}/g,
        (_match, _quote, typeName) => {
          state.issues.push(`escaped-generic-type-literal:${typeName}`);
          return `\`${typeName.replace(/\s+/g, ' ')}\``;
        },
      )
      .replace(
        /\b([A-Z][A-Za-z0-9_.$]*(?:\s*<\s*[A-Z][A-Za-z0-9_.$]*(?:\s*,\s*[A-Z][A-Za-z0-9_.$]*)*\s*>)+)(?=[\s,.;:，。；：）)'"}]|$)/g,
        (match) => {
        state.issues.push(`escaped-generic-type-literal:${match}`);
        return `\`${match.replace(/\s+/g, ' ')}\``;
        },
      ),
  );
}

function escapeMdxQuotedTextLiterals(value, state) {
  const replacements = new Map([
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['{', '&#123;'],
    ['}', '&#125;'],
  ]);

  return replaceOutsideCode(value, (text) =>
    text.replace(/(["'])([<>{}])\1/g, (_match, quote, literal) => {
      state.issues.push(`escaped-mdx-quoted-literal:${literal}`);
      return `${quote}${replacements.get(literal)}${quote}`;
    }),
  );
}

function escapeMdxTextOperators(value, state) {
  return replaceOutsideCode(value, (text) =>
    text.replace(/(?<=\S)(<<|>>)(?=\S)/g, (operator) => {
      state.issues.push(`escaped-mdx-text-operator:${operator}`);
      return operator === '<<' ? '&lt;&lt;' : '&gt;&gt;';
    }),
  );
}

function escapeMdxTextBraces(value, state) {
  return replaceOutsideCode(value, (text) =>
    text.replace(/\{(\s*)\}/g, (_match, spacing) => {
      state.issues.push('escaped-mdx-text-brace-pair');
      return `&#123;${spacing}&#125;`;
    }),
  );
}

function rewriteMarkdownLinks(value, state) {
  return value.replace(
    /\[([^\]]+)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (raw, label, href) => {
      if (isExternalHref(href) || href.startsWith('#')) {
        return raw;
      }

      const mapped = resolveMarkdownHref(href, state);
      return mapped ? `[${label}](${mapped})` : raw;
    },
  );
}

function resolveMarkdownHref(href, state) {
  const parsed = splitHref(href);

  if (parsed.path.startsWith('/doc/')) {
    return mapLegacyDocHref(href, state);
  }

  if (parsed.path.startsWith('/')) {
    return href;
  }

  const sourceDir = path.posix.dirname(toPosix(state.currentSourcePath));
  const sourceStem = toPosix(
    path.posix.normalize(path.posix.join(sourceDir, parsed.path)),
  ).replace(/\.(md|mdx)$/i, '');
  const mapped = findMappedRoute({
    pathMap: state.pathMap,
    platform: state.context.platform,
    sourceStem,
  });

  return mapped ? `${mapped}${parsed.search}${parsed.hash}` : null;
}

function findMappedRoute({ pathMap, platform, sourceStem }) {
  const direct = findPathMapEntry(pathMap, sourceStem);
  if (direct) {
    return routeFromTargetPath(
      expandPlatformTargetPath({
        platform,
        sourcePath: direct.sourcePath,
        targetPath: direct.targetPath,
      }),
    );
  }

  const candidates = [...pathMap.values()].filter((entry) => {
    const entryStem = entry.sourcePath.replace(/\.(md|mdx)$/i, '');
    return entryStem === sourceStem || entryStem.startsWith(`${sourceStem}.`);
  });

  if (candidates.length === 0) {
    return null;
  }

  const platformCandidate = platform
    ? candidates.find((entry) => entry.sourcePath.split('.').includes(platform))
    : null;
  const selected = platformCandidate ?? candidates[0];
  return routeFromTargetPath(
    expandPlatformTargetPath({
      platform,
      sourcePath: selected.sourcePath,
      targetPath: selected.targetPath,
    }),
  );
}

function findPathMapEntry(pathMap, sourceStem) {
  return (
    pathMap.get(sourceStem) ??
    pathMap.get(`${sourceStem}.mdx`) ??
    pathMap.get(`${sourceStem}.md`) ??
    null
  );
}

function routeFromTargetPath(targetPath) {
  if (!targetPath?.startsWith('content/docs/')) {
    return null;
  }

  const withoutPrefix = targetPath.slice('content/docs'.length);
  return withoutPrefix.replace(/\.(md|mdx)$/i, '').replace(/\/index$/i, '');
}

function extractHtmlListItemNodes(items) {
  const output = [];
  const tagPattern = /<\/?li\b[^>]*>/gi;
  let depth = 0;
  let itemOpenStart = -1;
  let itemStart = -1;
  let match = tagPattern.exec(items);

  while (match) {
    const isClose = match[0].startsWith('</');

    if (!isClose) {
      if (depth === 0) {
        itemOpenStart = match.index;
        itemStart = tagPattern.lastIndex;
      }
      depth += 1;
      match = tagPattern.exec(items);
      continue;
    }

    depth -= 1;
    if (depth === 0 && itemStart >= 0) {
      output.push({
        content: items.slice(itemStart, match.index).trim(),
        end: tagPattern.lastIndex,
        start: itemOpenStart,
      });
      itemOpenStart = -1;
      itemStart = -1;
    }

    match = tagPattern.exec(items);
  }

  return output;
}

function extractHtmlListRemainder(inner, itemNodes) {
  if (itemNodes.length === 0) {
    return inner;
  }

  let output = '';
  let cursor = 0;

  for (const item of itemNodes) {
    output += inner.slice(cursor, item.start);
    cursor = item.end;
  }

  output += inner.slice(cursor);
  return output.trim();
}

function mapAdmonitionType(type) {
  if (type === 'caution' || type === 'warn') {
    return 'warning';
  }
  if (type === 'danger') {
    return 'error';
  }
  if (type === 'ok' || type === 'success') {
    return 'tip';
  }
  if (type === 'note') {
    return 'note';
  }
  if (type === 'tip' || type === 'warning' || type === 'error') {
    return type;
  }
  return 'info';
}

function readAttribute(attrs, name) {
  const pattern = new RegExp(
    `\\b${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*\`([^\`]*)\`\\s*\\}|\\{\\s*"([^"]*)"\\s*\\}|\\{\\s*'([^']*)'\\s*\\})`,
  );
  const match = attrs.match(pattern);
  return (
    match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4] ?? match?.[5] ?? null
  );
}

function readNumericAttribute(attrs, name) {
  const value = Number(readAttribute(attrs, name) ?? 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function readExpressionAttribute(attrs, name) {
  const pattern = new RegExp(
    `\\b${escapeRegExp(name)}\\s*=\\s*\\{\\s*([A-Za-z0-9_.$]+)\\s*\\}`,
  );
  return attrs.match(pattern)?.[1] ?? null;
}

function readListLikeAttribute(attrs, name) {
  const pattern = new RegExp(
    `\\b${escapeRegExp(name)}\\s*=\\s*(?:\\{\\s*\\[([^\\]]*)\\]\\s*\\}|\\[([^\\]]*)\\]|"([^"]*)"|'([^']*)')`,
  );
  const match = attrs.match(pattern);
  const raw =
    match?.[1] ??
    match?.[2] ??
    match?.[3] ??
    match?.[4] ??
    readBalancedExpressionAttribute(attrs, name) ??
    '';
  return raw
    .split(',')
    .map((item) => item.replace(/[[\]{}'"\s]/g, ''))
    .filter(Boolean);
}

function readObjectArrayAttribute(attrs, name, state) {
  const expression = readBalancedExpressionAttribute(attrs, name);
  if (!expression) {
    return [];
  }

  return [...expression.matchAll(/\{([^{}]*)\}/g)]
    .map((match) => parseObjectLiteralProperties(match[1], state))
    .filter((item) => Object.keys(item).length > 0);
}

function readBalancedExpressionAttribute(attrs, name) {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*\\{`, 'g');
  const match = pattern.exec(attrs);
  if (!match) {
    return null;
  }

  const start = pattern.lastIndex - 1;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < attrs.length; index += 1) {
    const char = attrs[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return attrs.slice(start + 1, index);
      }
    }
  }

  return null;
}

function parseObjectLiteralProperties(raw, state) {
  const props = {};
  const pattern =
    /\b([A-Za-z0-9_]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([A-Za-z0-9_./:#?&=%-]+))/g;
  let match = pattern.exec(raw);

  while (match) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    props[key] =
      key === 'href' && value ? normalizeHref(value, state) : value;
    match = pattern.exec(raw);
  }

  return props;
}

export async function loadComponentMap(componentMapPath) {
  try {
    const raw = await fs.readFile(componentMapPath, 'utf8');
    return normalizeComponentMap(parseSimpleYaml(raw), componentMapPath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        ...EMPTY_COMPONENT_MAP,
        path: componentMapPath,
      };
    }

    throw error;
  }
}

function normalizeComponentMap(config, componentMapPath) {
  const components = new Map();
  const syntaxPatterns = new Map();
  const falsePositivePatterns = new Map();

  for (const [name, entry] of Object.entries(config.components ?? {})) {
    components.set(name, normalizeMapEntry(entry));
  }

  for (const [familyName, family] of Object.entries(config.families ?? {})) {
    for (const component of asArray(family.components)) {
      components.set(
        component,
        normalizeMapEntry({
          ...family,
          family: familyName,
        }),
      );
    }
  }

  for (const [name, entry] of Object.entries(config.syntaxPatterns ?? {})) {
    syntaxPatterns.set(name, normalizeMapEntry(entry));
  }

  for (const [name, entry] of Object.entries(
    config.falsePositivePatterns ?? {},
  )) {
    falsePositivePatterns.set(name, normalizeMapEntry(entry));
  }

  return {
    angleBracketLiterals: asArray(
      falsePositivePatterns.get('angleBracketLiterals')?.examples,
    ),
    components,
    falsePositivePatterns,
    path: componentMapPath,
    syntaxPatterns,
  };
}

function normalizeMapEntry(entry = {}) {
  return {
    ...entry,
    components: asArray(entry.components),
    examples: asArray(entry.examples),
    match: asArray(entry.match),
    reviewFlags: asArray(entry.reviewFlags),
  };
}

function parseSimpleYaml(raw) {
  const root = {};
  const lines = raw.split(/\r?\n/);
  const stack = [
    {
      container: root,
      indent: -1,
    },
  ];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) {
      continue;
    }

    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = rawLine.trim();

    while (stack.at(-1).indent >= indent) {
      stack.pop();
    }

    const parent = stack.at(-1).container;

    if (trimmed.startsWith('- ')) {
      if (!Array.isArray(parent)) {
        throw new Error(`Unsupported YAML list item: ${rawLine}`);
      }
      parent.push(parseYamlScalar(trimmed.slice(2)));
      continue;
    }

    const separatorIndex = findYamlKeySeparator(trimmed);
    if (separatorIndex < 0) {
      throw new Error(`Unsupported YAML line: ${rawLine}`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rest = trimmed.slice(separatorIndex + 1).trim();
    const blockScalar = rest.match(/^[>|][+-]?$/);
    const value = blockScalar
      ? parseYamlBlockScalar({
          folded: rest.startsWith('>'),
          lines,
          parentIndent: indent,
          startIndex: index + 1,
        })
      : rest === ''
        ? nextYamlValueContainer(lines, index + 1, indent)
        : parseYamlScalar(rest);

    if (blockScalar) {
      index = value.endIndex;
    }

    parent[key] = blockScalar ? value.value : value;

    if (!blockScalar && value && typeof value === 'object') {
      stack.push({
        container: value,
        indent,
      });
    }
  }

  return root;
}

function parseYamlBlockScalar({ folded, lines, parentIndent, startIndex }) {
  const blockLines = [];
  let blockIndent = null;
  let index = startIndex;

  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const indent = line.match(/^\s*/)?.[0].length ?? 0;

    if (trimmed && indent <= parentIndent) {
      break;
    }

    if (trimmed && blockIndent === null) {
      blockIndent = indent;
    }

    blockLines.push(line.slice(Math.min(blockIndent ?? indent, indent)));
  }

  const normalized = folded
    ? blockLines.join('\n').replace(/\n+/g, ' ').trim()
    : blockLines.join('\n').trimEnd();

  return {
    endIndex: index - 1,
    value: normalized,
  };
}

function nextYamlValueContainer(lines, startIndex, parentIndent) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent <= parentIndent) {
      return {};
    }

    return line.trim().startsWith('- ') ? [] : {};
  }

  return {};
}

function findYamlKeySeparator(value) {
  let quote = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== '\\') {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ':') {
      return index;
    }
  }

  return -1;
}

function parseYamlScalar(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return splitYamlInlineArray(trimmed.slice(1, -1)).map(parseYamlScalar);
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed;
}

function splitYamlInlineArray(value) {
  const items = [];
  let item = '';
  let quote = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (quote) {
      item += char;
      if (char === quote && value[index - 1] !== '\\') {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      item += char;
      continue;
    }

    if (char === ',') {
      items.push(item.trim());
      item = '';
      continue;
    }

    item += char;
  }

  if (item.trim()) {
    items.push(item.trim());
  }

  return items;
}

function recordMigrationSignals({ body, frontmatter, sourcePath, state }) {
  const componentMap = state.componentMap ?? EMPTY_COMPONENT_MAP;
  if (
    componentMap.components.size === 0 &&
    componentMap.syntaxPatterns.size === 0
  ) {
    return;
  }

  const scanValue = stripMarkdownCode(body);
  const syntaxScanValue = stripCodeFences(body);

  for (const tag of scanValue.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)) {
    const mapped = componentMap.components.get(tag[1]);
    if (mapped) {
      addSignalUsage(state.componentUsage, tag[1], mapped);
    }
  }

  recordSyntaxPatternUsage({
    body,
    frontmatter,
    scanValue: syntaxScanValue,
    sourcePath,
    state,
  });
  recordFalsePositiveUsage({
    scanValue,
    state,
  });
}

function recordSyntaxPatternUsage({
  body,
  frontmatter,
  scanValue,
  sourcePath,
  state,
}) {
  const detectors = {
    anchors: () => /<a\s+(?:name|id)=|<H[23]\b[^>]*\bid=/.test(scanValue),
    docusaurusImports: () => /@theme\/(?:Tabs|TabItem)/.test(body),
    generatedHtmlApi: () => sourcePath.startsWith('html-docs/'),
    hiddenIndexSpans: () =>
      /<span\b[^>]*className=["'][^"']*\bindex-/.test(scanValue),
    legacyFrontmatter: () =>
      [
        'displayed_sidebar',
        'ag_product',
        'ag_platform',
        'ag_product_label',
        'ag_usecase',
        'ag_file_path',
      ].some((key) => Object.hasOwn(frontmatter, key)),
    legacyMetadata: () =>
      /(?:^|\/)_(?:sidebar|platforms|products|usecase)_\.meta\.js$/.test(
        sourcePath,
      ),
    rawHtml: () => /<(?:img|br|li|code|a)\b/i.test(scanValue),
    restfulOpenapiRenderers: () =>
      /<\/?(?:RestfulRender|OpenapiRender)\b/.test(scanValue),
    runtimeVariables: () => /\bfrontMatter\.|\bprops\./.test(scanValue),
    sharedImports: () =>
      /^import\s+[\s\S]*?from\s+['"]@(?:shared|doc-shared|api-shared|docs\/shared)\//m.test(
        body,
      ),
    tableHeaderExport: () =>
      /export\s+const\s+TableHeader[A-Za-z0-9_]*\s*=/.test(body) &&
      /<Table\b[^>]*\bheader=/.test(scanValue),
  };

  for (const [name, mapped] of state.componentMap.syntaxPatterns) {
    if (detectors[name]?.()) {
      addSignalUsage(state.syntaxPatternUsage, name, mapped);
    }
  }
}

function recordFalsePositiveUsage({ scanValue, state }) {
  const mapped = state.componentMap.falsePositivePatterns.get(
    'angleBracketLiterals',
  );
  if (!mapped) {
    return;
  }

  if (asArray(mapped.examples).some((example) => scanValue.includes(example))) {
    addSignalUsage(state.falsePositiveUsage, 'angleBracketLiterals', mapped);
  }
}

function addSignalUsage(map, name, metadata = {}) {
  const current = map.get(name);
  if (current) {
    current.count += 1;
    return;
  }

  map.set(name, {
    count: 1,
    family: metadata.family ?? '',
    name,
    status: metadata.status ?? '',
    target: metadata.target ?? '',
  });
}

function summarizeSignalMap(map) {
  return [...map.values()].sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
}

export async function loadPathMap(pathMapPath) {
  const table = await readControlTable(pathMapPath);
  const pathMap = new Map();

  for (const row of table.rows) {
    const sourcePath = row.source_path;
    if (!sourcePath) {
      continue;
    }
    const isRedirectContent = isRedirectContentRow(row);
    const existing = pathMap.get(sourcePath);
    if (existing) {
      if (
        isRedirectContent &&
        row.target_path &&
        !existing.targetPaths.includes(row.target_path)
      ) {
        existing.targetPaths.push(row.target_path);
      }
      continue;
    }

    pathMap.set(sourcePath, {
      auditProgress: row.audit_progress ?? '',
      auditResult: row.audit_result ?? '',
      batchable: row.batchable ?? '',
      blockedReason: row.blocked_reason ?? '',
      decisionRefs: row.decision_refs ?? '',
      lastAuditReport: row.last_audit_report ?? '',
      lastMigrationReport: row.last_migration_report ?? '',
      migrationAction: row.migration_action ?? '',
      migrationProgress: row.migration_progress ?? '',
      nextStep: row.next_step ?? '',
      risk: row.risk ?? '',
      redirectStatus: row.redirect_status ?? '',
      sourcePath,
      sourceType: row.source_type ?? '',
      status: row.status ?? '',
      isRedirectContent,
      targetPath: isRedirectContent ? (row.target_path ?? '') : '',
      targetPaths: isRedirectContent && row.target_path ? [row.target_path] : [],
    });
  }

  return pathMap;
}

async function loadPagesFile(pagesFilePath) {
  const raw = await fs.readFile(pagesFilePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

async function selectPages({
  includePages,
  pathMap,
  sampleCount,
  sampleSeed,
  sourceRoot,
}) {
  const pages = new Set(includePages.map(toPosix));
  if (sampleCount <= 0) {
    return [...pages];
  }

  const rtcPages = [...pathMap.keys()].filter(
    (sourcePath) =>
      sourcePath.startsWith('docs/rtc/') &&
      /\.(md|mdx)$/i.test(sourcePath) &&
      !pages.has(sourcePath),
  );
  const existing = [];

  for (const sourcePath of rtcPages) {
    try {
      await fs.access(path.join(sourceRoot, sourcePath));
      existing.push(sourcePath);
    } catch {
      // Ignore ledger rows that are absent in the checked-out legacy repo.
    }
  }

  const selectedSamples = existing
    .sort(
      (left, right) =>
        stableHash(`${sampleSeed}:${left}`) -
        stableHash(`${sampleSeed}:${right}`),
    )
    .slice(0, sampleCount);

  for (const sourcePath of selectedSamples) {
    pages.add(sourcePath);
  }

  return [...pages];
}

function createReport({
  componentMap,
  componentMapPath,
  outDir,
  pathMapPath,
  results,
  sourceRoot,
}) {
  const counts = results.reduce((accumulator, result) => {
    accumulator[result.status] = (accumulator[result.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    componentMapPath,
    componentUsage: summarizeResultSignalUsage(results, 'componentUsage'),
    counts,
    falsePositiveUsage: summarizeResultSignalUsage(
      results,
      'falsePositiveUsage',
    ),
    generatedAt: new Date().toISOString(),
    knownComponentCount: componentMap.components.size,
    outDir,
    pathMapPath,
    results,
    sourceRoot,
    syntaxPatternUsage: summarizeResultSignalUsage(
      results,
      'syntaxPatternUsage',
    ),
  };
}

function reportToMarkdown(report) {
  const lines = [
    '# Legacy Docs Migration Sample Report',
    '',
    `- Source root: \`${report.sourceRoot}\``,
    `- Output: \`${report.outDir}\``,
    `- Path map: \`${report.pathMapPath}\``,
    `- Component map: \`${report.componentMapPath}\` (${report.knownComponentCount} known components)`,
    '',
    '## Counts',
    '',
    '| Status | Count |',
    '| --- | ---: |',
    ...Object.entries(report.counts).map(
      ([status, count]) => `| ${status} | ${count} |`,
    ),
    '',
    ...signalUsageSection('Component Usage', report.componentUsage, [
      'Name',
      'Family',
      'Target',
      'Status',
      'Count',
    ]),
    ...signalUsageSection('Syntax Pattern Usage', report.syntaxPatternUsage, [
      'Name',
      'Target',
      'Status',
      'Count',
    ]),
    ...signalUsageSection(
      'False Positive Protections',
      report.falsePositiveUsage,
      ['Name', 'Target', 'Status', 'Count'],
    ),
    ...referenceReviewSection(report.results),
    '## Files',
    '',
    '| Source | Platform | Target | Status | Issues | Components | Syntax patterns | Shared dependencies |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...report.results.map((result) => {
      const cells = [
        `\`${result.sourcePath}\``,
        result.platform ? `\`${result.platform}\`` : '',
        result.targetPath ? `\`${result.targetPath}\`` : '',
        result.status,
        result.issues.length
          ? result.issues.map((issue) => `\`${issue}\``).join('<br />')
          : '',
        result.componentUsage.length
          ? result.componentUsage
              .map((item) => `\`${item.name} (${item.count})\``)
              .join('<br />')
          : '',
        result.syntaxPatternUsage.length
          ? result.syntaxPatternUsage
              .map((item) => `\`${item.name} (${item.count})\``)
              .join('<br />')
          : '',
        result.sharedDependencies.length
          ? result.sharedDependencies
              .map((dependency) => `\`${dependency}\``)
              .join('<br />')
          : '',
      ];
      return `| ${cells.join(' | ')} |`;
    }),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

function referenceReviewSection(results) {
  const rows = results.filter((result) =>
    hasReferenceReview(result.referenceReview),
  );

  if (rows.length === 0) {
    return [];
  }

  return [
    '## 引用检查',
    '',
    '| 文档 | 内容 |',
    '| --- | --- |',
    ...rows.map((result) => {
      return `| \`${result.sourcePath}\` | ${renderReferenceReview(result.referenceReview)} |`;
    }),
    '',
  ];
}

function renderReferenceReview(referenceReview) {
  const parts = [];

  if (referenceReview.brokenLinks.length > 0) {
    parts.push(
      `断链 ${referenceReview.brokenLinks.length}: ${formatReferenceList(
        referenceReview.brokenLinks,
      )}`,
    );
  }

  if (referenceReview.images.length > 0) {
    parts.push(
      `图片 ${referenceReview.images.length}: ${formatReferenceList(
        referenceReview.images,
      )}`,
    );
  }

  return parts.join('<br />');
}

function formatReferenceList(items, limit = 3) {
  const shown = items.slice(0, limit).map((item) => `\`${item}\``);
  const remaining = items.length - shown.length;
  return remaining > 0
    ? `${shown.join(', ')} 等 ${remaining} 项`
    : shown.join(', ');
}

function summarizeResultSignalUsage(results, key) {
  const usage = new Map();

  for (const result of results) {
    for (const item of result[key] ?? []) {
      const current = usage.get(item.name);
      if (current) {
        current.count += item.count;
      } else {
        usage.set(item.name, { ...item });
      }
    }
  }

  return summarizeSignalMap(usage);
}

function signalUsageSection(title, usage, headers) {
  if (!usage.length) {
    return [];
  }

  const hasFamily = headers.includes('Family');
  const rows = [
    `## ${title}`,
    '',
    `| ${headers.join(' | ')} |`,
    `| ${headers
      .map((header) => (header === 'Count' ? '---:' : '---'))
      .join(' | ')} |`,
    ...usage.map((item) => {
      const cells = [
        `\`${item.name}\``,
        ...(hasFamily ? [item.family ? `\`${item.family}\`` : ''] : []),
        item.target ? `\`${item.target}\`` : '',
        item.status ? `\`${item.status}\`` : '',
        String(item.count),
      ];
      return `| ${cells.join(' | ')} |`;
    }),
    '',
  ];

  return rows;
}

function normalizeWhitespace(value) {
  return normalizeListBlockSpacing(
    normalizeCodeFenceSpacing(
      normalizeMarkdownTableIndentation(
        value.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n'),
      ),
    ),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeMarkdownTableIndentation(value) {
  const lines = value.split('\n');
  let inCodeFence = false;
  let index = 0;

  while (index < lines.length) {
    if (/^[ \t]*```/.test(lines[index])) {
      inCodeFence = !inCodeFence;
      index += 1;
      continue;
    }
    if (inCodeFence || !isMarkdownTableRow(lines[index])) {
      index += 1;
      continue;
    }
    const start = index;
    while (index < lines.length && isMarkdownTableRow(lines[index])) {
      index += 1;
    }
    const indent = Math.min(
      ...lines.slice(start, index).map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0),
    );
    for (let cursor = start; cursor < index; cursor += 1) {
      lines[cursor] = `${' '.repeat(indent)}${lines[cursor].trimStart()}`;
    }
  }
  return lines.join('\n');
}

function normalizeListBlockSpacing(value) {
  const output = [];
  let inCodeFence = false;

  for (const line of value.split('\n')) {
    if (/^[ \t]*```/.test(line)) {
      inCodeFence = !inCodeFence;
      output.push(line);
      continue;
    }

    if (
      !inCodeFence &&
      isListItemLine(line) &&
      shouldInsertBlankLineBeforeList(output.at(-1))
    ) {
      output.push('');
    }

    output.push(line);
  }

  return output.join('\n');
}

function shouldInsertBlankLineBeforeList(previousLine) {
  if (!previousLine?.trim()) {
    return false;
  }

  const trimmed = previousLine.trim();
  return (
    !isListItemLine(previousLine) &&
    !isMarkdownTableRow(previousLine) &&
    !/^(?:```|:::+|<\/?[A-Z][A-Za-z0-9]*(?:\s|>|$))/.test(trimmed)
  );
}

function normalizeCodeFenceSpacing(value) {
  const output = [];
  let inCodeFence = false;
  let justClosedCodeFence = false;

  for (const line of value.split('\n')) {
    if (/^[ \t]*```/.test(line)) {
      if (!inCodeFence && output.length > 0 && output.at(-1)?.trim()) {
        output.push('');
      }

      output.push(line);
      justClosedCodeFence = inCodeFence;
      inCodeFence = !inCodeFence;
      continue;
    }

    if (
      justClosedCodeFence &&
      line.trim() &&
      output.length > 0 &&
      output.at(-1)?.trim()
    ) {
      output.push('');
    }

    justClosedCodeFence = false;
    output.push(line);
  }

  return output.join('\n');
}

function trimCommonIndent(value) {
  const lines = value.replace(/^\n+|\n+$/g, '').split('\n');
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
  const trimBy = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(trimBy)).join('\n');
}

function indentBlock(value, spaces) {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

function collapseInline(value) {
  return transformInlineHtml(value)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?，。；：！？])/g, '$1')
    .trim();
}

function splitHref(href) {
  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    hash: match?.[3] ?? '',
    path: match?.[1] ?? href,
    search: match?.[2] ?? '',
  };
}

function isExternalHref(href) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}

function stripCodeFences(value) {
  return value.replace(/```[\s\S]*?```/g, '');
}

function stripMarkdownCode(value) {
  return stripInlineCode(stripCodeFences(value));
}

function stripInlineCode(value) {
  return value.replace(/`[^`\n]*`/g, '');
}

function replaceOutsideCode(value, replacer) {
  const lines = value.split('\n');
  let inCodeFence = false;

  return lines
    .map((line) => {
      if (/^[ \t]*```/.test(line)) {
        inCodeFence = !inCodeFence;
        return line;
      }

      if (inCodeFence) {
        return line;
      }

      return replaceOutsideInlineCode(line, replacer);
    })
    .join('\n');
}

function replaceOutsideInlineCode(line, replacer) {
  let output = '';
  let cursor = 0;

  while (cursor < line.length) {
    const codeStart = line.indexOf('`', cursor);
    if (codeStart < 0) {
      output += replacer(line.slice(cursor));
      break;
    }

    output += replacer(line.slice(cursor, codeStart));
    const codeEnd = line.indexOf('`', codeStart + 1);
    if (codeEnd < 0) {
      output += line.slice(codeStart);
      break;
    }

    output += line.slice(codeStart, codeEnd + 1);
    cursor = codeEnd + 1;
  }

  return output;
}

function stripWrappingQuotes(value) {
  return String(value ?? '').replace(/^['"]|['"]$/g, '');
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
}

function unique(values) {
  return [...new Set(values)];
}

function toPosix(value) {
  return String(value).split(path.sep).join('/');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function countSquareBrackets(value) {
  let count = 0;
  for (const char of value) {
    if (char === '[') {
      count += 1;
    } else if (char === ']') {
      count -= 1;
    }
  }
  return count;
}

function countCurlyBraces(value) {
  let count = 0;
  for (const char of value) {
    if (char === '{') {
      count += 1;
    } else if (char === '}') {
      count -= 1;
    }
  }
  return count;
}

async function resolveSourceRoot(sourceRoot) {
  if (sourceRoot) {
    return path.resolve(sourceRoot);
  }

  for (const candidate of DEFAULT_SOURCE_ROOTS) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) {
        return candidate;
      }
    } catch {
      // Try the next source root hint.
    }
  }

  throw new Error(
    `Cannot find legacy source root. Pass --source-root or set LEGACY_DOC_SOURCE_ROOT.`,
  );
}

function parseArgs(argv) {
  const options = {
    pages: [],
    updatePathMap: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--page') {
      options.pages.push(argv[++index]);
      continue;
    }

    if (arg.startsWith('--page=')) {
      options.pages.push(arg.slice('--page='.length));
      continue;
    }

    if (arg === '--source-root') {
      options.sourceRoot = argv[++index];
      continue;
    }

    if (arg.startsWith('--source-root=')) {
      options.sourceRoot = arg.slice('--source-root='.length);
      continue;
    }

    if (arg === '--out') {
      options.outDir = argv[++index];
      continue;
    }

    if (arg.startsWith('--out=')) {
      options.outDir = arg.slice('--out='.length);
      continue;
    }

    if (arg === '--path-map') {
      options.pathMap = argv[++index];
      continue;
    }

    if (arg.startsWith('--path-map=')) {
      options.pathMap = arg.slice('--path-map='.length);
      continue;
    }

    if (arg === '--pages-file') {
      options.pagesFile = argv[++index];
      continue;
    }

    if (arg.startsWith('--pages-file=')) {
      options.pagesFile = arg.slice('--pages-file='.length);
      continue;
    }

    if (arg === '--component-map') {
      options.componentMap = argv[++index];
      continue;
    }

    if (arg.startsWith('--component-map=')) {
      options.componentMap = arg.slice('--component-map='.length);
      continue;
    }

    if (arg === '--no-path-map-update') {
      options.updatePathMap = false;
      continue;
    }

    if (arg === '--sample-count') {
      options.sampleCount = Number(argv[++index]);
      continue;
    }

    if (arg.startsWith('--sample-count=')) {
      options.sampleCount = Number(arg.slice('--sample-count='.length));
      continue;
    }

    if (arg === '--sample-seed') {
      options.sampleSeed = argv[++index];
      continue;
    }

    if (arg.startsWith('--sample-seed=')) {
      options.sampleSeed = arg.slice('--sample-seed='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.pages.length === 0) {
    delete options.pages;
  }

  return options;
}

function isMainModule() {
  return (
    process.argv[1] &&
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  );
}

if (isMainModule()) {
  migrateLegacyBatch(parseArgs(process.argv.slice(2)))
    .then((report) => {
      console.log(
        `Migrated ${report.results.length} legacy docs into ${report.outDir}`,
      );
      console.log(JSON.stringify(report.counts));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
