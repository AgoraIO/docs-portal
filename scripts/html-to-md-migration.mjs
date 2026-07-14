#!/usr/bin/env node

/**
 * HTML-to-Markdown API Reference Migration Tool
 *
 * Converts generated HTML API reference docs to pure markdown files suitable
 * for the docs-portal project.
 *
 * This is not an arbitrary website scraper. The supported inputs are common
 * generated API reference structures with stable index files and symbol pages.
 *
 * Usage:
 *   node scripts/html-to-md-migration.mjs --source <dir> --output <dir> --product <name> --platform <name> [options]
 *
 * Examples:
 *   # RTC Android
 *   node scripts/html-to-md-migration.mjs \
 *     --source /path/to/html-docs/rtc/Android \
 *     --output content/docs/zh-CN/api-reference/rtc/android \
 *     --product rtc --platform android
 *
 *   # Signaling iOS
 *   node scripts/html-to-md-migration.mjs \
 *     --source /path/to/html-docs/signaling/iOS \
 *     --output content/docs/zh-CN/api-reference/signaling/ios \
 *     --product signaling --platform ios
 *
 *   # Dry run to preview
 *   node scripts/html-to-md-migration.mjs \
 *     --source /path/to/html-docs/rtc/Android \
 *     --output content/docs/zh-CN/api-reference/rtc/android \
 *     --product rtc --platform android --dry-run
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import {
  getSourceLane,
  SOURCE_LANE_IDS,
} from './html-migration/lanes/index.mjs';

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    source: null,
    output: null,
    product: null,
    platform: null,
    locale: 'zh-CN',
    navigation: 'generated',
    navigationManifest: null,
    routeBasePath: '/api-reference',
    targetBasePath: null,
    dryRun: false,
    verbose: false,
    versionDir: null, // e.g., '4.6.0' or '(current)'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
      case '-s':
        opts.source = args[++i];
        break;
      case '--output':
      case '-o':
        opts.output = args[++i];
        break;
      case '--product':
      case '-p':
        opts.product = args[++i];
        break;
      case '--platform':
      case '-P':
        opts.platform = args[++i];
        break;
      case '--locale':
      case '-l':
        opts.locale = args[++i];
        break;
      case '--route-base-path':
      case '-r':
        opts.routeBasePath = args[++i];
        break;
      case '--target-base-path':
        opts.targetBasePath = args[++i];
        break;
      case '--navigation':
        opts.navigation = args[++i];
        break;
      case '--navigation-manifest':
        opts.navigationManifest = args[++i];
        break;
      case '--version-dir':
      case '-V':
        opts.versionDir = args[++i];
        break;
      case '--dry-run':
      case '-d':
        opts.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        opts.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  if (!opts.source || !opts.output || !opts.product || !opts.platform) {
    console.error(
      'Error: --source, --output, --product, and --platform are required.\n',
    );
    printHelp();
    process.exit(1);
  }
  if (!['generated', 'public-index'].includes(opts.navigation)) {
    console.error('Error: --navigation must be generated or public-index.\n');
    printHelp();
    process.exit(1);
  }

  return opts;
}

function printHelp() {
  console.log(`
HTML-to-Markdown API Reference Migration Tool

This is not a generic HTML converter. It supports generated API reference HTML
from DITA-OT/Oxygen, TypeDoc, Doxygen/Javadoc, iOS doc-generator/Jazzy/appledoc,
and Dartdoc. RESTful/OpenAPI or other source layouts still exit with migration
guidance.

Usage:
  node scripts/html-to-md-migration.mjs --source <dir> --output <dir> --product <name> --platform <name> [options]

Required:
  --source, -s      Source directory containing generated HTML API docs
  --output, -o      Output directory for markdown files
  --product, -p     Product name (e.g., rtc, signaling, cloud-recording)
  --platform, -P    Platform name (e.g., android, ios, web, RESTful)

Options:
  --locale, -l          Locale for output (default: zh-CN)
  --route-base-path, -r Base path for links (default: /api-reference)
  --target-base-path   Exact output route for links; overrides the derived product/platform route
  --navigation         Sidebar source: generated or public-index (default: generated)
  --navigation-manifest JSON array of public { label, source } entries for legacy IA fidelity
  --version-dir, -V     Version directory name (e.g., '4.6.0' or '(current)')
  --dry-run, -d         Print detected type, file count, and planned paths without writing
  --verbose, -v         Show detailed processing information
  --help, -h            Show this help message

Supported lanes:
  - DITA-OT/Oxygen HTML API reference: <source>/API/*.html
  - TypeDoc HTML API reference
  - Doxygen/Javadoc HTML API reference
  - iOS doc-generator/Jazzy/appledoc HTML API reference
  - Dartdoc HTML API reference

Unsupported lanes detected with actionable errors:
  - RESTful/OpenAPI or other source layouts
  `);
}

// ============================================================================
// Utility Functions
// ============================================================================

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, ' ').trim();
}

function decodeHtml(value) {
  return value
    .replace(/ /g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeInlineText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function escapeYaml(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function stripHtml(name) {
  return name.replace(/\.html$/, '');
}

function normalizeSourcePath(value) {
  return value.split(path.sep).join('/').replace(/^\.\//, '');
}

function toKebab(value) {
  return value
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function isInlineElement(element) {
  return element.is(
    'a, span, code, strong, b, em, i, br, sub, sup, small, mark, s, u',
  );
}

function isExternalHref(href) {
  return (
    href.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(href) ||
    href.startsWith('/')
  );
}

function inlineText(node) {
  return escapeInlineText(normalizeInline(decodeHtml(node.text())));
}

function renderInlineTextValue(value, sourceToRoute, targetBasePath) {
  const text = normalizeText(value);
  const parts = [];
  const linkPattern =
    /\{@(?:link|linkplain|linkcode)\s+([^\s}|]+)(?:\s*\|\s*|\s+)?([^}]*)\}/g;
  let cursor = 0;

  for (const match of text.matchAll(linkPattern)) {
    parts.push(escapeInlineText(text.slice(cursor, match.index)));
    const target = match[1];
    const label = match[2].trim() || target;
    const href =
      sourceToRoute.typeDocSymbolHrefs?.get(target) ??
      sourceToRoute.typeDocSymbolHrefs?.get(target.toLowerCase());
    const rendered = href
      ? renderHref(label, href, sourceToRoute, targetBasePath)
      : escapeInlineText(label);
    parts.push(rendered);
    cursor = match.index + match[0].length;
  }

  parts.push(escapeInlineText(text.slice(cursor)));
  return parts.join('');
}

function normalizeInline(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeInlineFlow(value) {
  return normalizeInline(value)
    .replace(/\s+([，。！？：；、,.!?;:)\]}>])/g, '$1')
    .replace(/([([{<【（《])\s+/g, '$1')
    .replace(/` ([，。！？：；、,.!?;:])/g, '`$1')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)\s+([，。！？：；、,.!?;:])/g,
      '[$1]($2)$3',
    )
    .replace(/([。！？；：])\[/g, '$1 [')
    .replace(/([A-Za-z0-9`）】》])\[/g, '$1 [')
    .replace(/`([^`]+)`\s+([A-Za-z0-9_]+)/g, '`$1` $2');
}

function headingDepth(level) {
  return level.length;
}

// ============================================================================
// Source Structure Detection
// ============================================================================

const SOURCE_TYPES = {
  DARTDOC: {
    id: SOURCE_LANE_IDS.DARTDOC,
    label: 'Dartdoc HTML reference',
  },
  DITA_OT_API: {
    id: SOURCE_LANE_IDS.DITA_OT_API,
    label: 'DITA-OT/Oxygen API reference (API/ directory)',
  },
  DOXYGEN_JAVADOC: {
    id: SOURCE_LANE_IDS.DOXYGEN_JAVADOC,
    label: 'Doxygen/Javadoc HTML reference',
  },
  IOS_DOC_GENERATOR: {
    id: SOURCE_LANE_IDS.IOS_DOC_GENERATOR,
    label: 'iOS-doc-generator HTML reference',
  },
  RESTFUL_OR_OTHER: {
    action:
      'Use the OpenAPI/Fumadocs REST API lane for RESTful references, or build a source-specific converter before running migration.',
    label: 'RESTful/OpenAPI or other unsupported source layout',
  },
  TYPEDOC: {
    id: SOURCE_LANE_IDS.TYPEDOC,
    label: 'TypeDoc HTML reference',
  },
};

class SourceStructureError extends Error {
  constructor(structure) {
    super(formatUnsupportedSourceError(structure));
    this.name = 'SourceStructureError';
  }
}

class OutputPathError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OutputPathError';
  }
}

class SourceIdentityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SourceIdentityError';
  }
}

function validateSourceIdentity(opts, sourceStructure, pageTitleBySource) {
  if (opts.platform !== 'react-sdk' || !sourceStructure.rootIndexSource) return;
  const sourceTitle =
    pageTitleBySource.get(sourceStructure.rootIndexSource) ?? '';
  if (/\bWeb SDK\b/i.test(sourceTitle)) {
    throw new SourceIdentityError(
      'Source identity mismatch: react-sdk cannot publish Web SDK API reference content.',
    );
  }
}

async function detectSourceStructure(sourceDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const hasDir = (name) =>
    entries.some((entry) => entry.name === name && entry.isDirectory());
  const hasFile = (name) =>
    entries.some((entry) => entry.name === name && entry.isFile());

  if (hasDir('API')) {
    const apiDir = path.join(sourceDir, 'API');
    const fileNames = (await fs.readdir(apiDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => entry.name)
      .sort();

    if (fileNames.length > 0) {
      return {
        fileNames,
        id: 'dita-ot-api',
        indexSourceNames: ['../index.html'],
        label: SOURCE_TYPES.DITA_OT_API.label,
        markers: ['API/', `${fileNames.length} API/*.html files`],
        rootIndexSource: null,
        sourceDir: apiDir,
        supported: true,
      };
    }

    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.RESTFUL_OR_OTHER,
      ['API/ exists but contains no .html files'],
    );
  }

  const rootHtmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
  const detectionText = await readDetectionText(sourceDir, rootHtmlFiles);
  const lowerDetectionText = detectionText.toLowerCase();

  const explicitRestMarkers = collectMarkers([
    [hasFile('openapi.json'), 'openapi.json'],
    [hasFile('openapi.yaml'), 'openapi.yaml'],
    [hasFile('openapi.yml'), 'openapi.yml'],
    [hasFile('swagger.json'), 'swagger.json'],
    [hasFile('swagger.yaml'), 'swagger.yaml'],
    [hasFile('swagger.yml'), 'swagger.yml'],
    [hasDir('endpoint'), 'endpoint/'],
    [hasDir('endpoints'), 'endpoints/'],
  ]);
  if (explicitRestMarkers.length > 0) {
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.RESTFUL_OR_OTHER,
      explicitRestMarkers,
    );
  }

  const iosDocGeneratorMarkers = collectMarkers([
    [hasDir('Classes'), 'Classes/'],
    [hasDir('Protocols'), 'Protocols/'],
    [hasDir('Categories'), 'Categories/'],
    [hasDir('Constants'), 'Constants/'],
    [hasDir('Blocks'), 'Blocks/'],
    [hasDir('Enums'), 'Enums/'],
    [hasFile('Classes.html'), 'Classes.html'],
    [hasFile('Protocols.html'), 'Protocols.html'],
    [hasFile('hierarchy.html'), 'hierarchy.html'],
    [
      lowerDetectionText.includes('ios-doc-generator'),
      'iOS-doc-generator page marker',
    ],
    [lowerDetectionText.includes('appledoc'), 'appledoc page marker'],
    [lowerDetectionText.includes('jazzy'), 'Jazzy page marker'],
  ]);
  const hasStrongIosDocGeneratorMarker = iosDocGeneratorMarkers.some(
    (marker) => marker !== 'hierarchy.html',
  );
  if (hasStrongIosDocGeneratorMarker) {
    return supportedGeneratedHtmlStructure(
      sourceDir,
      SOURCE_TYPES.IOS_DOC_GENERATOR,
      iosDocGeneratorMarkers,
      ['index.html', 'hierarchy.html', 'Classes.html', 'Protocols.html'],
    );
  }

  const typedocMarkers = collectMarkers([
    [hasFile('modules.html'), 'modules.html'],
    [hasDir('classes'), 'classes/'],
    [hasDir('interfaces'), 'interfaces/'],
    [hasDir('enums'), 'enums/'],
    [
      hasDir('assets') && lowerDetectionText.includes('typedoc'),
      'assets/ with TypeDoc page marker',
    ],
    [
      lowerDetectionText.includes('generated by typedoc'),
      'Generated by TypeDoc page text',
    ],
  ]);
  if (typedocMarkers.length > 0) {
    return supportedGeneratedHtmlStructure(
      sourceDir,
      SOURCE_TYPES.TYPEDOC,
      typedocMarkers,
      ['index.html', 'modules.html'],
    );
  }

  const doxygenJavadocMarkers = collectMarkers([
    [hasFile('annotated.html'), 'annotated.html'],
    [hasFile('classes.html'), 'classes.html'],
    [hasFile('doxygen.css'), 'doxygen.css'],
    [
      hasDir('search') &&
        (await fileExists(path.join(sourceDir, 'search', 'searchdata.js'))),
      'search/searchdata.js',
    ],
    [hasFile('allclasses-index.html'), 'allclasses-index.html'],
    [hasFile('allpackages-index.html'), 'allpackages-index.html'],
    [hasFile('package-summary.html'), 'package-summary.html'],
    [hasFile('element-list'), 'element-list'],
    [hasFile('member-search-index.js'), 'member-search-index.js'],
    [
      lowerDetectionText.includes('generated by doxygen'),
      'Generated by Doxygen page text',
    ],
    [lowerDetectionText.includes('javadoc'), 'Javadoc page marker'],
  ]);
  if (doxygenJavadocMarkers.length > 0) {
    return supportedGeneratedHtmlStructure(
      sourceDir,
      SOURCE_TYPES.DOXYGEN_JAVADOC,
      doxygenJavadocMarkers,
      [
        'index.html',
        'annotated.html',
        'classes.html',
        'allclasses-index.html',
        'allpackages-index.html',
        'package-summary.html',
      ],
    );
  }

  const dartdocMarkers = collectMarkers([
    [hasFile('index.json'), 'index.json'],
    [hasFile('categories.json'), 'categories.json'],
    [hasFile('library-index.html'), 'library-index.html'],
    [hasDir('static-assets'), 'static-assets/'],
    [lowerDetectionText.includes('dartdoc'), 'Dartdoc page marker'],
  ]);
  if (dartdocMarkers.length > 0) {
    return supportedGeneratedHtmlStructure(
      sourceDir,
      SOURCE_TYPES.DARTDOC,
      dartdocMarkers,
      ['index.html', 'library-index.html'],
    );
  }

  const restOrOtherMarkers = collectMarkers([
    [
      rootHtmlFiles.length > 0,
      `${rootHtmlFiles.length} root-level HTML file(s), but no API/`,
    ],
    [
      rootHtmlFiles.length === 0,
      'no API/ directory and no root-level HTML files',
    ],
  ]);

  return unsupportedSourceStructure(
    sourceDir,
    SOURCE_TYPES.RESTFUL_OR_OTHER,
    restOrOtherMarkers,
  );
}

async function supportedGeneratedHtmlStructure(
  sourceDir,
  sourceType,
  markers,
  indexSourceNames,
) {
  const allHtmlFileNames = await collectHtmlFileNames(sourceDir);
  const fileNames = allHtmlFileNames.filter((name) => name !== 'index.html');
  const rootIndexSource = allHtmlFileNames.includes('index.html')
    ? 'index.html'
    : null;

  if (fileNames.length === 0) {
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.RESTFUL_OR_OTHER,
      [...markers, 'detected generator markers but no migratable .html pages'],
    );
  }

  return {
    fileNames,
    id: sourceType.id,
    indexSourceNames,
    label: sourceType.label,
    markers,
    rootIndexSource,
    sourceDir,
    supported: true,
  };
}

async function collectHtmlFileNames(sourceDir) {
  const fileNames = [];
  const skipDirs = new Set([
    '.git',
    'assets',
    'fonts',
    'images',
    'img',
    'scripts',
    'search',
    'static-assets',
    'styles',
  ]);

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) await visit(absolutePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      fileNames.push(
        normalizeSourcePath(path.relative(sourceDir, absolutePath)),
      );
    }
  }

  await visit(sourceDir);
  return fileNames.sort((a, b) => a.localeCompare(b));
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function collectMarkers(candidates) {
  return candidates.filter(([matched]) => matched).map(([, marker]) => marker);
}

async function readDetectionText(sourceDir, rootHtmlFiles) {
  const candidates = ['index.html', ...rootHtmlFiles.slice(0, 3)].filter(
    (name, index, names) => names.indexOf(name) === index,
  );
  const chunks = [];

  for (const name of candidates) {
    try {
      chunks.push(await fs.readFile(path.join(sourceDir, name), 'utf8'));
    } catch {
      // Optional marker files are best-effort detection inputs.
    }
  }

  return chunks.join('\n');
}

function unsupportedSourceStructure(sourceDir, sourceType, markers) {
  return {
    action: sourceType.action,
    id: 'unsupported',
    label: sourceType.label,
    markers,
    sourceDir,
    supported: false,
  };
}

function formatUnsupportedSourceError(structure) {
  const markers =
    structure.markers.length > 0
      ? structure.markers.map((marker) => `  - ${marker}`).join('\n')
      : '  - none';

  return [
    `Error: Unsupported source structure: ${structure.label}.`,
    `Source: ${structure.sourceDir}`,
    'Detected markers:',
    markers,
    '',
    'This script is not a generic HTML-to-Markdown converter.',
    'Supported lanes: DITA-OT/Oxygen, TypeDoc, Doxygen/Javadoc, iOS doc-generator/Jazzy/appledoc, and Dartdoc generated HTML API references.',
    `Action: ${structure.action}`,
    'Expected source shape: point --source at the product/platform directory that contains generated HTML API reference files.',
  ].join('\n');
}

function assertSafeOutputPath(targetRoot, opts, sourceStructure) {
  const resolvedTarget = path.resolve(targetRoot);
  const resolvedSource = path.resolve(opts.source);
  const resolvedApiSource = path.resolve(sourceStructure.sourceDir);
  const resolvedCwd = process.cwd();
  const protectedPaths = [
    path.parse(resolvedTarget).root,
    resolvedCwd,
    path.resolve(resolvedCwd, 'content'),
    path.resolve(resolvedCwd, 'content/docs'),
    path.resolve('/tmp'),
    path.resolve('/private/tmp'),
    resolvedSource,
    resolvedApiSource,
  ];
  const homeDir = process.env.HOME ? path.resolve(process.env.HOME) : null;
  if (homeDir) {
    protectedPaths.push(homeDir);
    const relativeToHome = path.relative(homeDir, resolvedTarget);
    if (
      relativeToHome &&
      !relativeToHome.startsWith('..') &&
      !path.isAbsolute(relativeToHome) &&
      relativeToHome.split(path.sep).filter(Boolean).length === 1
    ) {
      throw new OutputPathError(
        `Refusing to delete broad home-directory child path: ${resolvedTarget}. ` +
          'Choose a dedicated product/platform output directory, preferably under /tmp or content/docs/<locale>/<tab>/<product>/<platform>.',
      );
    }
  }

  const matchingProtectedPath = protectedPaths.find(
    (protectedPath) => resolvedTarget === protectedPath,
  );
  if (matchingProtectedPath) {
    throw new OutputPathError(
      `Refusing to delete protected output path: ${matchingProtectedPath}. ` +
        'Choose a product/platform-specific output directory.',
    );
  }

  const contentDocsRoot = path.resolve(resolvedCwd, 'content/docs');
  if (isSameOrParent(contentDocsRoot, resolvedTarget)) {
    const contentDocsSegments = path
      .relative(contentDocsRoot, resolvedTarget)
      .split(path.sep)
      .filter(Boolean);
    if (contentDocsSegments.length < 4) {
      throw new OutputPathError(
        `Refusing to delete broad docs output path: ${resolvedTarget}. ` +
          'Use a locale/tab/product/platform leaf directory, for example content/docs/zh-CN/api-reference/rtc/android.',
      );
    }
  }

  if (isSameOrParent(resolvedTarget, resolvedCwd)) {
    throw new OutputPathError(
      `Refusing to use broad output path ${resolvedTarget}; it contains the repository root ${resolvedCwd}.`,
    );
  }

  if (isSameOrParent(resolvedTarget, resolvedSource)) {
    throw new OutputPathError(
      `Refusing to use broad output path ${resolvedTarget}; it contains the source directory ${resolvedSource}.`,
    );
  }

  if (isSameOrParent(resolvedSource, resolvedTarget)) {
    throw new OutputPathError(
      `Refusing to write output inside the source directory: ${resolvedTarget}.`,
    );
  }

  return resolvedTarget;
}

function inferTargetBasePathFromOutput(outputPath, locale) {
  const segments = path.resolve(outputPath).split(path.sep).filter(Boolean);

  for (let index = segments.length - 3; index >= 0; index -= 1) {
    if (
      segments[index] !== 'content' ||
      segments[index + 1] !== 'docs' ||
      segments[index + 2] !== locale
    ) {
      continue;
    }

    const routeSegments = segments.slice(index + 2);
    if (routeSegments.length >= 4) {
      return `/${routeSegments.join('/')}`;
    }
  }

  return null;
}

function isSameOrParent(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

// ============================================================================
// HTML Rendering Functions
// ============================================================================

function readTitle($) {
  const selectors = [
    'main > article > h1',
    'main > article article > h1',
    'main > article article > h2',
    '.tsd-page-title h1',
    '.page-title h1',
    'main h1',
    'article h1',
    '.contents > .title',
    '.header .title',
    '.title',
    'h1',
    'title',
  ];

  for (const selector of selectors) {
    const title = normalizeText($(selector).first().text());
    if (title) return title;
  }

  return '';
}

function readCanonicalTitle($, sourceTypeId) {
  const title = readTitle($);
  if (sourceTypeId !== SOURCE_TYPES.TYPEDOC.id) return title;
  return normalizeTypeDocTitle(title);
}

function normalizeTypeDocTitle(title) {
  return title
    .replace(
      /^(Class|Interface|Enumeration|Enum|Namespace|Module|Function|Variable|Type Alias)\s+/i,
      '',
    )
    .replace(/^"(.+)"$/, '$1')
    .trim();
}

function readDescription($) {
  const desc = $('main > article > .body > .shortdesc').first().text().trim();
  if (desc) return normalizeText(desc);
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) return normalizeText(metaDesc);
  const fallbackDesc = $(
    [
      '.shortdesc',
      '.brief',
      '.abstract',
      '.docblock > p',
      '.description > p',
      'main p',
      'article p',
      '.contents p',
    ].join(', '),
  )
    .filter(
      (_, element) =>
        $(element).closest('footer, .footer-copyright, address.footer')
          .length === 0,
    )
    .first()
    .text();
  return fallbackDesc ? normalizeText(fallbackDesc) : '';
}

const TYPE_DOC_ZH_LABELS = new Map([
  ['Accessors', '访问器'],
  ['Agora Core Methods', 'Agora 核心方法'],
  ['Channel Media Relay Methods', '跨频道媒体流转发方法'],
  ['Classes', '类'],
  ['Constructors', '构造函数'],
  ['Description', '描述'],
  ['Enumeration members', '枚举成员'],
  ['Enumerations', '枚举'],
  ['Enums', '枚举'],
  ['Events', '事件'],
  ['Functions', '函数'],
  ['Hierarchy', '继承关系'],
  ['Index', '索引'],
  ['Interfaces', '接口'],
  ['Global Callback Properties', '全局回调属性'],
  ['Dual Stream Methods', '双流方法'],
  ['Live Streaming Methods', '直播方法'],
  ['Local Track Methods', '本地轨道方法'],
  ['Logger Methods', '日志方法'],
  ['Media Devices Methods', '媒体设备方法'],
  ['Methods', '方法'],
  ['Modules', '模块'],
  ['Name', '名称'],
  ['Other Methods', '其他方法'],
  ['Other Properties', '其他属性'],
  ['Parameters', '参数'],
  ['Properties', '属性'],
  ['Proxy Methods', '代理方法'],
  ['References', '引用'],
  ['Returns', '返回值'],
  ['Type aliases', '类型别名'],
  ['Type declaration', '类型声明'],
  ['Variables', '变量'],
]);

function typeDocLabel(label, locale) {
  return locale === 'zh-CN' ? (TYPE_DOC_ZH_LABELS.get(label) ?? label) : label;
}

function typeDocDescription(description, title, locale) {
  if (locale !== 'zh-CN') return description;
  if (!description || /^Documentation for\b/i.test(description)) {
    return `${title} API 参考。`;
  }
  return description;
}

function selectContentRoot($) {
  $(
    'script, style, link, iframe, form, nav:not(.related-links), header, footer, aside, hr.footer, address.footer',
  ).remove();
  const selectors = [
    'main > article',
    'main article',
    'article',
    'main',
    '.col-content',
    '.main-content',
    '.contents',
    '.content',
    '#content',
    'body',
  ];

  for (const selector of selectors) {
    const root = $(selector).first();
    if (root.length > 0 && normalizeText(root.text())) return root;
  }

  return $('body').first();
}

function hasMeaningfulSourceBody($, sourceTypeId) {
  if (sourceTypeId === SOURCE_TYPES.DITA_OT_API.id) {
    const article = $('main article, article').first().clone();
    article.find('h1, nav:not(.related-links)').remove();
    return normalizeText(article.text()).length > 0;
  }
  if (sourceTypeId === SOURCE_TYPES.TYPEDOC.id) {
    const content = $('.col-content').first();
    if (content.length > 0) return normalizeText(content.text()).length > 0;
    const main = $('main').first().clone();
    main.find('nav, header, footer, aside').remove();
    return normalizeText(main.text()).length > 0;
  }
  return true;
}

async function filterSourcesWithoutMeaningfulBody(sourceStructure) {
  if (
    ![SOURCE_TYPES.DITA_OT_API.id, SOURCE_TYPES.TYPEDOC.id].includes(
      sourceStructure.id,
    )
  ) {
    return;
  }

  const meaningful = [];
  for (const sourceName of sourceStructure.fileNames) {
    const html = await fs.readFile(
      path.join(sourceStructure.sourceDir, sourceName),
      'utf8',
    );
    if (hasMeaningfulSourceBody(cheerio.load(html), sourceStructure.id)) {
      meaningful.push(sourceName);
    }
  }
  sourceStructure.fileNames = meaningful;
}

function headingElementDepth(heading, fallbackDepth = 2) {
  const match = heading.get(0)?.tagName?.match(/^h([1-6])$/i);
  return match ? Number(match[1]) : fallbackDepth;
}

function markdownHeadingDepth(depth) {
  return Math.min(6, Math.max(1, depth));
}

function renderHeading(_$, heading) {
  const title = inlineText(heading);
  if (!title) return '';
  const parts = [];
  const anchor = heading.find('a[id], a[name]').first();
  const id = heading.attr('id') ?? anchor.attr('id') ?? anchor.attr('name');
  if (id) parts.push(`<a id="${id}"></a>`);
  parts.push(
    `${'#'.repeat(markdownHeadingDepth(headingElementDepth(heading)))} ${title}`,
  );
  return parts.join('\n\n');
}

function renderCodeBlock(pre) {
  if (!pre || pre.length === 0) return '';
  const classAttr = pre.attr('class') ?? '';
  const lang =
    classAttr.match(/language-([a-z0-9+-]+)/i)?.[1]?.toLowerCase() ?? 'text';
  const code = decodeHtml(pre.text()).trimEnd();
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

function renderTable(
  $,
  table,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const rows = table.find('> thead > tr, > tbody > tr, > tr').toArray();
  if (rows.length === 0) return '';

  const matrix = rows.map((row) =>
    $(row)
      .find('> th, > td')
      .toArray()
      .map((cell) =>
        inlineChildren(
          $,
          $(cell),
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        )
          .replace(/\n+/g, '<br />')
          .replace(/\|/g, '\\|')
          .trim(),
      ),
  );

  const width = Math.max(...matrix.map((row) => row.length));
  const normalized = matrix.map((row) => {
    const cells = [...row];
    while (cells.length < width) cells.push('');
    return cells;
  });

  const header = normalized[0];
  const divider = new Array(width).fill('---');
  const lines = [`| ${header.join(' | ')} |`, `| ${divider.join(' | ')} |`];

  for (const row of normalized.slice(1)) {
    lines.push(`| ${row.join(' | ')} |`);
  }

  return lines.join('\n');
}

function renderNote($, note, pageTitleBySource, sourceToRoute, targetBasePath) {
  const className = note.attr('class') ?? '';
  const type = className.includes('attention')
    ? 'warning'
    : className.includes('caution')
      ? 'warning'
      : className.includes('danger')
        ? 'error'
        : 'info';
  const title = note
    .find('> .note__title')
    .first()
    .text()
    .trim()
    .replace(/：$/, '');
  const bodyParts = [];
  let inlineParts = [];

  const flushInline = () => {
    if (inlineParts.length === 0) return;
    bodyParts.push(normalizeInlineFlow(inlineParts.join(' ')));
    inlineParts = [];
  };

  for (const child of note.contents().toArray()) {
    const element = $(child);
    if (element.is('.note__title')) continue;
    if (child.type === 'text') {
      const text = normalizeText($(child).text());
      if (text) inlineParts.push(text);
      continue;
    }
    if (isInlineElement(element)) {
      const rendered = renderInlineElement(
        $,
        element,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
      if (rendered) inlineParts.push(rendered);
      continue;
    }
    flushInline();
    const rendered = renderElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) bodyParts.push(rendered);
  }
  flushInline();

  const label = title || undefined;
  return `:::${type}${label ? `[${label}]` : ''}\n${bodyParts.join('\n\n')}\n:::`;
}

function renderList(
  $,
  list,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  ordered,
  options = {},
) {
  const items = [];
  let index = 1;
  for (const li of list.find('> li').toArray()) {
    if (options.preferInlineOnly) {
      const inlineParts = [];
      const nestedParts = [];
      for (const child of $(li).contents().toArray()) {
        const element = $(child);
        if (child.type === 'text') {
          const text = renderInlineTextValue(
            $(child).text(),
            sourceToRoute,
            targetBasePath,
          );
          if (text) inlineParts.push(text);
          continue;
        }
        if (element.is('ul, ol')) {
          const nested = renderList(
            $,
            element,
            pageTitleBySource,
            sourceToRoute,
            targetBasePath,
            element.is('ol'),
            options,
          );
          if (nested) nestedParts.push(nested);
          continue;
        }
        const rendered = element.is('a')
          ? renderAnchor(
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
            )
          : inlineChildren(
              $,
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
            );
        if (rendered) inlineParts.push(rendered);
      }

      const inlineContent = normalizeInlineFlow(inlineParts.join(' '));
      if (!inlineContent && nestedParts.length === 0) continue;
      const marker = ordered ? `${index}.` : '-';
      const nested = nestedParts
        .map((part) => indentListContinuation(part, marker))
        .join('\n');
      items.push(
        [`${marker} ${inlineContent}`.trim(), nested]
          .filter(Boolean)
          .join('\n\n'),
      );
      index += 1;
      continue;
    }

    const inlineParts = [];
    const contentParts = [];
    const flushInline = () => {
      if (inlineParts.length === 0) return;
      contentParts.push(normalizeInlineFlow(inlineParts.join(' ')));
      inlineParts.length = 0;
    };

    for (const child of $(li).contents().toArray()) {
      const element = $(child);
      if (child.type === 'text') {
        const text = renderInlineTextValue(
          $(child).text(),
          sourceToRoute,
          targetBasePath,
        );
        if (text) inlineParts.push(text);
        continue;
      }
      if (isInlineElement(element)) {
        const rendered = renderInlineElement(
          $,
          element,
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        );
        if (rendered) inlineParts.push(rendered);
        continue;
      }

      flushInline();
      const rendered = element.is('ul, ol')
        ? renderList(
            $,
            element,
            pageTitleBySource,
            sourceToRoute,
            targetBasePath,
            element.is('ol'),
            options,
          )
        : renderElement(
            $,
            element,
            pageTitleBySource,
            sourceToRoute,
            targetBasePath,
          );
      if (rendered) contentParts.push(rendered);
    }
    flushInline();
    if (contentParts.length === 0) continue;

    const marker = ordered ? `${index}.` : '-';
    const [firstPart, ...remainingParts] = contentParts;
    const nested = remainingParts.map((part) =>
      indentListContinuation(part, marker),
    );
    items.push([`${marker} ${firstPart}`, ...nested].join('\n\n'));
    index += 1;
  }
  return items.join('\n');
}

function indentListContinuation(content, marker) {
  const indentation = ' '.repeat(marker.length + 1);
  return content
    .split('\n')
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n');
}

function renderDefinitionList(
  $,
  dl,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 3,
) {
  const rows = [];
  const children = dl.children().toArray();
  let currentTerm = '';
  let currentTermAnchor = '';
  let currentTermIsAlphabetic = false;

  for (const child of children) {
    const node = $(child);
    if (node.is('dt')) {
      currentTermIsAlphabetic = node.is('.alphachar');
      if (currentTermIsAlphabetic) {
        const anchor = node.children('a[id], a[name]').first();
        const anchorId = anchor.attr('id') ?? anchor.attr('name');
        currentTerm = normalizeText(anchor.text() || node.text());
        currentTermAnchor = anchorId ? `<a id="${anchorId}"></a>` : '';
      } else {
        currentTerm = inlineChildren(
          $,
          node,
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        );
        currentTermAnchor = '';
      }
      continue;
    }
    if (node.is('dd')) {
      const value = renderChildren(
        $,
        node,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
        depth + 1,
      );
      if (currentTerm) {
        if (currentTermAnchor) rows.push(currentTermAnchor);
        rows.push(
          currentTermIsAlphabetic
            ? `${'#'.repeat(markdownHeadingDepth(depth))} ${currentTerm}`
            : `${'#'.repeat(markdownHeadingDepth(depth))} \`${currentTerm}\``,
        );
        if (value) rows.push(value);
      } else if (value) {
        rows.push(value);
      }
      currentTerm = '';
      currentTermAnchor = '';
      currentTermIsAlphabetic = false;
    }
  }

  return rows.join('\n\n');
}

function renderAnchor(
  anchor,
  _pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const href = anchor.attr('href')?.trim() ?? '';
  const id = anchor.attr('id') ?? anchor.attr('name');
  const label = inlineText(anchor) || href;
  if (!href && id) return `<a id="${id}"></a>`;
  if (!href) return label;

  return renderHref(label, href, sourceToRoute, targetBasePath);
}

function renderHref(label, href, sourceToRoute, targetBasePath) {
  if (isExternalHref(href)) {
    return `[${label}](${href})`;
  }

  const hashIndex = href.indexOf('#');
  const filePart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? '' : href.slice(hashIndex + 1);
  if (!filePart) return `[${label}](#${hashPart})`;

  const routeTarget = resolveRouteTargetForHref(
    filePart,
    sourceToRoute.currentSource,
    sourceToRoute,
  );
  if (!routeTarget) {
    const sourceName = filePart.split('?')[0];
    if (isFilteredHelperHtmlSource(sourceName)) return '';
    return sourceName.endsWith('.html') ? label : `[${label}](${href})`;
  }
  if (
    sourceToRoute.sourceTypeId === SOURCE_TYPES.DITA_OT_API.id &&
    hashPart &&
    sourceToRoute.currentSource &&
    routeTarget.sourceName === normalizeSourcePath(sourceToRoute.currentSource)
  ) {
    return `[${label}](#${hashPart})`;
  }

  return `[${label}](${routeSegmentsToDocPath(
    routeTarget.routeSegments,
    targetBasePath,
  )}${hashPart ? `#${hashPart}` : ''})`;
}

function isFilteredHelperHtmlSource(sourceName) {
  const basename = sourceName.split('/').at(-1) ?? sourceName;
  if (basename.endsWith('-members.html')) return true;
  if (basename.endsWith('_source.html')) return true;
  if (/^functions(?:[_-].*)?\.html$/i.test(basename)) return true;
  if (/^namespacemembers(?:[_-].*)?\.html$/i.test(basename)) return true;
  if (/^globals(?:[_-].*)?\.html$/i.test(basename)) return true;
  return false;
}

function resolveRouteTargetForHref(filePart, currentSource, sourceToRoute) {
  const withoutQuery = filePart.split('?')[0];
  if (!withoutQuery.endsWith('.html')) return null;

  const candidates = [];
  if (currentSource) {
    candidates.push(
      normalizeSourcePath(
        path.posix.normalize(
          path.posix.join(path.posix.dirname(currentSource), withoutQuery),
        ),
      ),
    );
  }
  candidates.push(normalizeSourcePath(withoutQuery));
  candidates.push(path.posix.basename(withoutQuery));

  for (const candidate of candidates) {
    const routeSegments = sourceToRoute.get(candidate);
    if (routeSegments) return { routeSegments, sourceName: candidate };
  }
  return null;
}

function sourceRelativeHref(href, currentSource) {
  if (isExternalHref(href)) return null;
  const hashIndex = href.indexOf('#');
  const filePart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? '' : href.slice(hashIndex + 1);
  const sourceName = filePart
    ? normalizeSourcePath(
        path.posix.normalize(
          path.posix.join(path.posix.dirname(currentSource), filePart),
        ),
      )
    : currentSource;
  if (!sourceName.endsWith('.html')) return null;
  return `${sourceName}${hashPart ? `#${hashPart}` : ''}`;
}

function routeSegmentsToDocPath(routeSegments, targetBasePath) {
  const clean = [...routeSegments];
  if (clean.at(-1) === 'index') clean.pop();
  return clean.length === 0
    ? targetBasePath
    : `${targetBasePath}/${clean.join('/')}`;
}

function renderInlineElement(
  $,
  element,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (element.is('a'))
    return renderAnchor(
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  if (element.is('code')) return `\`${decodeHtml(element.text()).trim()}\``;
  if (element.is('strong, b')) {
    const text = inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    return text ? `**${text}**` : '';
  }
  if (element.is('em, i')) {
    const text = inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    return text ? `*${text}*` : '';
  }
  if (element.is('br')) return '<br />';
  return inlineChildren(
    $,
    element,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
}

function inlineChildren(
  $,
  node,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const parts = [];
  for (const child of node.contents().toArray()) {
    if (child.type === 'text') {
      const text = renderInlineTextValue(
        $(child).text(),
        sourceToRoute,
        targetBasePath,
      );
      if (text) parts.push(text);
      continue;
    }
    const element = $(child);
    const text = renderInlineElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (text) parts.push(text);
  }
  return normalizeInlineFlow(parts.join(' '));
}

function renderElement(
  $,
  element,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  // div.note must be checked BEFORE the generic div-with-block-children check,
  // because a note containing <ul> would otherwise match the generic rule.
  if (element.is('div.note'))
    return renderNote(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  if (element.is('div.codeblock'))
    return renderCodeBlock(element.find('pre').first());
  if (
    element.is('div, dd') &&
    element.find(
      '> h1, > h2, > h3, > h4, > h5, > h6, > ul, > ol, > table, > dl, > pre, > div.note, > section',
    ).length > 0
  ) {
    return renderChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth,
    );
  }
  if (element.is('a') && !element.attr('href')) {
    const id = element.attr('id') ?? element.attr('name');
    return id ? `<a id="${id}"></a>` : '';
  }
  if (element.is('h1, h2, h3, h4, h5, h6')) return renderHeading($, element);
  if (element.is('p'))
    return inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  if (element.is('ul'))
    return renderList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      false,
    );
  if (element.is('ol'))
    return renderList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      true,
    );
  if (element.is('section')) {
    const heading = element.find('> h1, > h2, > h3, > h4, > h5, > h6').first();
    const childDepth = headingElementDepth(heading);
    return renderSection(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      Math.max(depth, childDepth),
    );
  }
  if (element.is('pre')) return renderCodeBlock(element);
  if (element.is('table'))
    return renderTable(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  if (element.is('dl'))
    return renderDefinitionList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth + 1,
    );
  if (element.is('article'))
    return renderNestedArticle(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  if (element.is('nav.related-links'))
    return renderRelatedLinks(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  return (
    inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    ) || ''
  );
}

function renderChildren(
  $,
  parent,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  const parts = [];
  let inlineParts = [];

  const flushInline = () => {
    if (inlineParts.length === 0) return;
    parts.push(normalizeInlineFlow(inlineParts.join(' ')));
    inlineParts = [];
  };

  for (const node of parent.contents().toArray()) {
    if (node.type === 'text') {
      const text = renderInlineTextValue(
        $(node).text(),
        sourceToRoute,
        targetBasePath,
      );
      if (text) inlineParts.push(text);
      continue;
    }

    const element = $(node);
    if (element.is('.shortdesc') || element.is('nav.related-links')) continue;
    if (element.is('h1')) continue;
    if (
      parent.is('section') &&
      element.is('h2, h3, h4, h5, h6') &&
      parent.find('> h2, > h3, > h4, > h5, > h6').first().get(0) ===
        element.get(0)
    )
      continue;

    const wrappedHeading = element.is('a[href^="#"]')
      ? element.children('h1, h2, h3, h4, h5, h6').first()
      : null;
    if (wrappedHeading?.length) {
      flushInline();
      const rendered = renderHeading($, wrappedHeading);
      if (rendered) parts.push(rendered);
      continue;
    }

    if (isInlineElement(element)) {
      const rendered = renderInlineElement(
        $,
        element,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
      if (rendered) inlineParts.push(rendered);
      continue;
    }

    flushInline();
    const rendered = renderElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth,
    );
    if (rendered) parts.push(rendered);
  }

  flushInline();
  return parts.join('\n\n').trim();
}

function renderSection(
  $,
  section,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  const id = section.attr('id');
  const heading = section.find('> h1, > h2, > h3, > h4, > h5, > h6').first();
  const title = inlineText(heading);
  const directList = section.find('> ul').first();
  let renderedContent = '';
  if (
    directList.length > 0 &&
    directList.find('> li > a').length > 0 &&
    directList.siblings().filter('ul').length === 0
  ) {
    renderedContent = renderList(
      $,
      directList,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      false,
      { preferInlineOnly: true },
    );
  } else {
    renderedContent = renderChildren(
      $,
      section,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth,
    );
  }
  if (!renderedContent) return '';

  const parts = [];
  if (id) parts.push(`<a id="${id}"></a>`);
  if (title)
    parts.push(
      `${'#'.repeat(
        markdownHeadingDepth(Math.max(depth, headingElementDepth(heading))),
      )} ${title}`,
    );
  parts.push(renderedContent);

  return parts.join('\n\n').trim();
}

function renderNestedArticle(
  $,
  article,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const id = article.attr('id');
  const heading = article.find('> h1, > h2, > h3, > h4, > h5, > h6').first();
  const level = '#'.repeat(
    markdownHeadingDepth(Math.max(2, headingElementDepth(heading))),
  );
  const title = inlineText(heading);
  const content = [];

  if (id) content.push(`<a id="${id}"></a>`);
  if (title) content.push(`${level} ${title}`);

  const shortdesc = article.find('> .body > .shortdesc').first().text().trim();
  if (shortdesc) content.push(shortdesc);

  for (const node of article.find('> .body > *').toArray()) {
    if ($(node).is('.shortdesc')) continue;
    const rendered = renderElement(
      $,
      $(node),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      headingDepth(level) + 1,
    );
    if (rendered) content.push(rendered);
  }

  for (const nested of article.find('> article').toArray()) {
    const rendered = renderNestedArticle(
      $,
      $(nested),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) content.push(rendered);
  }

  const related = renderRelatedLinks(
    $,
    article.find('> nav.related-links').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (related) content.push(related);

  return content.join('\n\n').trim();
}

function renderRelatedLinks(
  $,
  nav,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!nav || nav.length === 0) return '';
  const title = nav.children('strong').first().text().trim();
  const items = nav.find('li > a, li > strong > a').toArray();
  if (items.length === 0) return '';

  const lines = title ? [`### ${title}`] : [];
  for (const anchor of items) {
    const link = renderAnchor(
      $(anchor),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (link) lines.push(`- ${link}`);
  }
  return lines.join('\n');
}

function renderPage({
  $,
  currentSource,
  lane,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  targetBasePath,
}) {
  if (lane?.id === SOURCE_TYPES.TYPEDOC.id) {
    const typedocPage = renderTypeDocPage({
      $,
      currentSource,
      pageDescriptionBySource,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    });
    if (typedocPage) return typedocPage;
    if (sourceToRoute.locale === 'zh-CN') {
      $('h1, h2, h3, h4, h5, h6').each((_, heading) => {
        const element = $(heading);
        const label = normalizeText(element.text());
        const localized = typeDocLabel(label, sourceToRoute.locale);
        if (localized !== label) element.text(localized);
      });
    }
  }
  if (lane?.id === SOURCE_TYPES.DOXYGEN_JAVADOC.id) {
    const doxygenPage = renderDoxygenPage({
      $,
      currentSource,
      pageDescriptionBySource,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    });
    if (doxygenPage) return doxygenPage;
  }

  const previousCurrentSource = sourceToRoute.currentSource;
  sourceToRoute.currentSource = currentSource;

  const pageTitle =
    pageTitleBySource.get(currentSource) ?? stripHtml(currentSource);
  const description = pageDescriptionBySource.get(currentSource);
  const body = selectContentRoot($);
  const topTitle = body.find('> h1').first();
  const sections = [];

  const topDesc = body.find('> .body > .shortdesc').first().text().trim();
  if (topDesc && topDesc !== description) sections.push(topDesc);

  const directSections = body.find('> .body > section').toArray();
  for (const section of directSections) {
    const rendered = renderSection(
      $,
      $(section),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) sections.push(rendered);
  }

  const nestedArticles = body.find('> article').toArray();
  for (const article of nestedArticles) {
    const rendered = renderNestedArticle(
      $,
      $(article),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) sections.push(rendered);
  }

  const related = renderRelatedLinks(
    $,
    body.find('> nav.related-links').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (related) sections.push(related);

  if (sections.length === 0) {
    const shortDescription = body
      .find('> .shortdesc, > .body > .shortdesc')
      .first()
      .text()
      .trim();
    if (shortDescription) sections.push(shortDescription);
  }

  if (sections.length === 0) {
    const fallbackRoot = body.find('> .body').first();
    const fallback = renderChildren(
      $,
      fallbackRoot.length > 0 ? fallbackRoot : body,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (fallback) sections.push(fallback);
  }

  const frontmatter = [
    '---',
    `title: ${escapeYaml(pageTitle)}`,
    description
      ? `description: ${escapeYaml(description)}`
      : `description: ${escapeYaml(`${pageTitle} API reference.`)}`,
    '---',
    '',
  ];

  if (topTitle.attr('id') && topTitle.attr('id') !== 'ariaid-title1') {
    sections.unshift(`<a id="${topTitle.attr('id')}"></a>`);
  }

  const rendered = `${frontmatter.join('\n')}${sections.filter(Boolean).join('\n\n')}\n`;
  sourceToRoute.currentSource = previousCurrentSource;
  return rendered;
}

function renderDoxygenPage({
  $,
  currentSource,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  targetBasePath,
}) {
  const contents = $('.contents').first();
  if (
    contents.length === 0 ||
    contents.find('h2.memtitle, .memitem .memproto, table.memberdecls')
      .length === 0
  ) {
    return null;
  }

  const previousCurrentSource = sourceToRoute.currentSource;
  sourceToRoute.currentSource = currentSource;

  const pageTitle =
    pageTitleBySource.get(currentSource) ?? stripHtml(currentSource);
  const description = pageDescriptionBySource.get(currentSource);
  const sections = [];

  const details = renderDoxygenDetails(
    $,
    contents,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (details) sections.push(details);

  for (const group of collectDoxygenMemberGroups($, contents)) {
    const renderedGroup = renderDoxygenMemberGroup(
      $,
      group,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (renderedGroup) sections.push(renderedGroup);
  }

  sourceToRoute.currentSource = previousCurrentSource;
  if (sections.length === 0) return null;

  return [
    '---',
    `title: ${escapeYaml(pageTitle)}`,
    description
      ? `description: ${escapeYaml(description)}`
      : `description: ${escapeYaml(`${pageTitle} API reference.`)}`,
    '---',
    '',
    `${sections.join('\n\n')}\n`,
  ].join('\n');
}

function renderDoxygenDetails(
  $,
  contents,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const detailsHeader = contents
    .children('h2.groupheader')
    .filter((_, header) =>
      /详细描述|Detailed Description/i.test(normalizeText($(header).text())),
    )
    .first();
  if (detailsHeader.length === 0) return '';

  const parts = [];
  let cursor = detailsHeader.next();
  while (cursor.length > 0 && !cursor.is('h2.groupheader, h2.memtitle')) {
    if (cursor.is('.textblock, p, div, dl, table, ul, ol')) {
      const rendered = renderElement(
        $,
        cursor,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
        2,
      );
      if (rendered) parts.push(rendered);
    }
    cursor = cursor.next();
  }
  return parts.join('\n\n');
}

function collectDoxygenMemberGroups($, contents) {
  const groups = [];
  let currentGroup = null;

  for (const child of contents.children().toArray()) {
    const node = $(child);
    if (node.is('h2.groupheader')) {
      const title = normalizeText(node.text());
      if (title && !/详细描述|Detailed Description/i.test(title)) {
        currentGroup = { members: [], title };
        groups.push(currentGroup);
      } else {
        currentGroup = null;
      }
      continue;
    }

    if (!node.is('h2.memtitle')) continue;
    const item = node.nextAll('.memitem').first();
    if (item.length === 0) continue;
    if (!currentGroup) {
      currentGroup = { members: [], title: 'Members' };
      groups.push(currentGroup);
    }
    currentGroup.members.push({ item, titleNode: node });
  }

  return groups.filter((group) => group.members.length > 0);
}

function renderDoxygenMemberGroup(
  $,
  group,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const parts = [`## ${escapeInlineText(group.title)}`];
  for (const member of group.members) {
    const rendered = renderDoxygenMember(
      $,
      member,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) parts.push(rendered);
  }
  return parts.join('\n\n');
}

function renderDoxygenMember(
  $,
  member,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const title = normalizeDoxygenMemberTitle(member.titleNode.text());
  if (!title) return '';

  const id =
    member.titleNode.prev('a[id], a[name]').attr('id') ??
    member.titleNode.prev('a[id], a[name]').attr('name');
  const parts = [];
  if (id) parts.push(`<a id="${id}"></a>`);
  parts.push(`### ${escapeInlineText(title)}`);

  const signature = normalizeDoxygenSignature(
    member.item.find('.memproto').first().text(),
  );
  if (signature) parts.push(`\`\`\`cpp\n${signature}\n\`\`\``);

  const memdoc = member.item.find('.memdoc').first().clone();
  const parameters = renderDoxygenParameters(
    $,
    memdoc.find('dl.params').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  const returns = renderDoxygenReturns(
    $,
    memdoc.find('dl.return, dl.section.return').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  const enumTable = renderDoxygenEnumTable(
    $,
    memdoc.find('table.fieldtable').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  memdoc
    .find('dl.params, dl.return, dl.section.return, table.fieldtable')
    .remove();

  const description = renderChildren(
    $,
    memdoc,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
    4,
  );
  if (description) parts.push(description);
  if (parameters) parts.push(parameters);
  if (returns) parts.push(returns);
  if (enumTable) parts.push(enumTable);

  return parts.join('\n\n');
}

function normalizeDoxygenMemberTitle(value) {
  return normalizeText(value)
    .replace(/^◆\s*/, '')
    .replace(/\s*◆\s*/g, '');
}

function normalizeDoxygenSignature(value) {
  return decodeHtml(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([(),;])/g, '$1')
    .replace(/\s+([*&])/g, '$1')
    .replace(/([(<])\s+/g, '$1')
    .trim();
}

function renderDoxygenParameters(
  $,
  params,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!params || params.length === 0) return '';

  const rows = [];
  for (const row of params.find('table.params tr').toArray()) {
    const cells = $(row).children('td');
    const name = normalizeInlineFlow(
      [
        inlineChildren(
          $,
          cells.filter('.paramdir').first(),
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        ),
        inlineChildren(
          $,
          cells.filter('.paramname').first(),
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        ),
      ]
        .filter(Boolean)
        .join(' '),
    );
    const descCell = cells.not('.paramdir, .paramname').last();
    const description = renderChildren(
      $,
      descCell,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      4,
    ).replace(/\n+/g, '<br />');
    if (name || description) rows.push([name, description]);
  }

  if (rows.length === 0) return '';
  const lines = [
    '#### Parameters',
    '',
    '| Name | Description |',
    '| --- | --- |',
  ];
  for (const [name, description] of rows) {
    lines.push(
      `| ${name.replace(/\|/g, '\\|')} | ${description.replace(/\|/g, '\\|')} |`,
    );
  }
  return lines.join('\n');
}

function renderDoxygenReturns(
  $,
  returns,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!returns || returns.length === 0) return '';
  const rendered = renderChildren(
    $,
    returns.children('dd').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
    4,
  );
  return rendered ? ['#### Returns', rendered].join('\n\n') : '';
}

function renderDoxygenEnumTable(
  $,
  table,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!table || table.length === 0) return '';
  const rows = [];
  for (const row of table.find('tr').toArray()) {
    const name = inlineChildren(
      $,
      $(row).find('td.fieldname').first(),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    const description = renderChildren(
      $,
      $(row).find('td.fielddoc').first(),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      4,
    ).replace(/\n+/g, '<br />');
    if (name || description) rows.push([name, description]);
  }
  if (rows.length === 0) return '';

  const lines = ['#### Values', '', '| Name | Description |', '| --- | --- |'];
  for (const [name, description] of rows) {
    lines.push(
      `| ${name.replace(/\|/g, '\\|')} | ${description.replace(/\|/g, '\\|')} |`,
    );
  }
  return lines.join('\n');
}

function renderTypeDocPage({
  $,
  currentSource,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  targetBasePath,
}) {
  const body = selectContentRoot($);
  if (
    body.find('.tsd-member-group, .tsd-signature, .tsd-comment').length === 0
  ) {
    return null;
  }

  const previousCurrentSource = sourceToRoute.currentSource;
  sourceToRoute.currentSource = currentSource;

  const pageTitle =
    pageTitleBySource.get(currentSource) ??
    normalizeTypeDocTitle(readTitle($)) ??
    stripHtml(currentSource);
  const locale = sourceToRoute.locale ?? 'zh-CN';
  const description = typeDocDescription(
    pageDescriptionBySource.get(currentSource),
    pageTitle,
    locale,
  );
  const sections = [];

  const intro = renderTypeDocIntro(
    $,
    body,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (intro) sections.push(intro);

  const hierarchy = body.find('> .tsd-hierarchy').first();
  if (hierarchy.length > 0) {
    const renderedHierarchy = renderTypeDocPanel(
      $,
      hierarchy,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (renderedHierarchy) sections.push(renderedHierarchy);
  }

  for (const group of body.find('> .tsd-member-group').toArray()) {
    const renderedGroup = renderTypeDocMemberGroup(
      $,
      $(group),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (renderedGroup) sections.push(renderedGroup);
  }

  sourceToRoute.currentSource = previousCurrentSource;
  if (sections.length === 0) return null;

  return [
    '---',
    `title: ${escapeYaml(pageTitle)}`,
    description
      ? `description: ${escapeYaml(description)}`
      : `description: ${escapeYaml(typeDocDescription('', pageTitle, locale))}`,
    '---',
    '',
    `${sections.join('\n\n')}\n`,
  ].join('\n');
}

function renderTypeDocIntro(
  $,
  body,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const panel = body.find('> .tsd-panel.tsd-comment').first();
  if (panel.length === 0) return '';
  return renderTypeDocPanel(
    $,
    panel,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
}

function renderTypeDocPanel(
  $,
  panel,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const clone = panel.clone();
  clone.find('script, style, .tsd-anchor').remove();
  return renderChildren(
    $,
    clone,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
}

function renderTypeDocMemberGroup(
  $,
  group,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const title = typeDocLabel(
    inlineText(group.children('h2').first()),
    sourceToRoute.locale,
  );
  const parts = title ? [`## ${title}`] : [];

  for (const member of group.children('section.tsd-member').toArray()) {
    const renderedMember = renderTypeDocMember(
      $,
      $(member),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (renderedMember) parts.push(renderedMember);
  }

  return parts.join('\n\n');
}

function renderTypeDocMember(
  $,
  member,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const heading = member.children('h3').first();
  const title = inlineText(heading);
  if (!title) return '';

  const anchor = member.children('a.tsd-anchor[id], a[id], a[name]').first();
  const id = anchor.attr('id') ?? anchor.attr('name');
  const parts = [];
  if (id) parts.push(`<a id="${id}"></a>`);
  parts.push(`### ${title}`);

  const signature = renderTypeDocSignatures($, member);
  if (signature) parts.push(signature);

  const comment = member.children('.tsd-comment.tsd-typography').first();
  if (comment.length > 0) {
    const renderedComment = renderChildren(
      $,
      comment,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      4,
    );
    if (renderedComment) parts.push(renderedComment);
  }

  const descriptions = member
    .children('.tsd-descriptions')
    .children('.tsd-description');
  for (const description of descriptions.toArray()) {
    const renderedDescription = renderTypeDocDescription(
      $,
      $(description),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (renderedDescription) parts.push(renderedDescription);
  }

  const typeDeclaration = renderTypeDocTypeDeclaration(
    $,
    member.children('.tsd-type-declaration').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (typeDeclaration) parts.push(typeDeclaration);

  return parts.join('\n\n');
}

function renderTypeDocTypeDeclaration(
  $,
  declaration,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!declaration || declaration.length === 0) return '';

  const title = inlineText(declaration.children('h4').first());
  const parts = [
    `#### ${typeDocLabel(title || 'Type declaration', sourceToRoute.locale)}`,
  ];
  const parameters = declaration
    .children('ul.tsd-parameters')
    .children('li.tsd-parameter');

  for (const parameter of parameters.toArray()) {
    const item = $(parameter);
    const heading = item.children('h5').first().clone();
    heading.find('.tsd-flag').remove();
    const name = normalizeText(heading.text());
    if (!name) continue;

    parts.push(`##### \`${name.replace(/`/g, '\\`')}\``);
    const comment = item.children('.tsd-comment.tsd-typography').first();
    if (comment.length === 0) continue;

    const description = renderChildren(
      $,
      comment,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      6,
    );
    if (description) parts.push(description);
  }

  return parts.length > 1 ? parts.join('\n\n') : '';
}

function renderTypeDocSignatures($, member) {
  const signatures = member
    .children('.tsd-signature, .tsd-signatures')
    .find('.tsd-signature')
    .addBack('.tsd-signature')
    .toArray()
    .map((signature) => normalizeText($(signature).text()))
    .filter(Boolean);

  if (signatures.length === 0) return '';
  return signatures
    .map((signature) => `\`\`\`ts\n${signature}\n\`\`\``)
    .join('\n\n');
}

function renderTypeDocDescription(
  $,
  description,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const parts = [];
  const comment = description.children('.tsd-comment.tsd-typography').first();
  if (comment.length > 0) {
    const renderedComment = renderChildren(
      $,
      comment,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      4,
    );
    if (renderedComment) parts.push(renderedComment);
  }

  const parameters = renderTypeDocParameters(
    $,
    description.children('.tsd-parameters').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (parameters) parts.push(parameters);

  const returns = renderTypeDocReturns(
    $,
    description,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (returns) parts.push(returns);

  return parts.join('\n\n');
}

function renderTypeDocParameters(
  $,
  parameters,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!parameters || parameters.length === 0) return '';
  const rows = [];
  for (const parameter of parameters.children('li').toArray()) {
    const item = $(parameter);
    const heading = item.children('h5').first();
    const name = inlineText(heading);
    const comment = item.children('.tsd-comment.tsd-typography').first();
    const description = comment.length
      ? renderChildren(
          $,
          comment,
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
          4,
        )
      : '';
    if (name) rows.push([name, description.replace(/\n+/g, '<br />')]);
  }
  if (rows.length === 0) return '';

  const lines = [
    `#### ${typeDocLabel('Parameters', sourceToRoute.locale)}`,
    '',
    `| ${typeDocLabel('Name', sourceToRoute.locale)} | ${typeDocLabel('Description', sourceToRoute.locale)} |`,
    '| --- | --- |',
  ];
  for (const [name, description] of rows) {
    lines.push(
      `| ${name.replace(/\|/g, '\\|')} | ${description.replace(/\|/g, '\\|')} |`,
    );
  }
  return lines.join('\n');
}

function renderTypeDocReturns(
  $,
  description,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const returnsTitle = description.children('.tsd-returns-title').first();
  if (returnsTitle.length === 0) return '';

  const title = inlineChildren(
    $,
    returnsTitle,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  ).replace(/^Returns\s*/i, '');
  const clone = description.clone();
  clone
    .children()
    .slice(0, description.children().index(returnsTitle) + 1)
    .remove();
  const details = renderChildren(
    $,
    clone,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
    4,
  );

  return [
    `#### ${typeDocLabel('Returns', sourceToRoute.locale)}`,
    title,
    details,
  ]
    .filter(Boolean)
    .join('\n\n');
}

// ============================================================================
// TOC/Sidebar Parsing
// ============================================================================

function parseTocTree($) {
  const rootList = $('nav.toc > ul > li > ul').first();
  return parseList($, rootList);
}

function parseList($, list) {
  return list
    .children('li')
    .toArray()
    .map((li) => parseItem($, $(li)))
    .filter(Boolean);
}

function parseItem($, item) {
  const anchor = item.children('a').first();
  const sourceName = anchor.length ? path.basename(anchor.attr('href')) : null;
  const title = normalizeText(
    anchor.length ? anchor.text() : item.children('span').first().text(),
  );
  const childrenList = item.children('ul').first();
  const children = childrenList.length ? parseList($, childrenList) : [];

  if (!title || !sourceName) return null;

  return { children, sourceName, title, type: 'page' };
}

function assignRoutes(nodes, parentSegments, sourceToRoute) {
  for (const node of nodes) {
    const isFolder = node.children.length > 0;
    const sourceSlug = node.sourceName
      ? toKebab(
          stripHtml(path.posix.basename(node.sourceName)).replace(/^toc_/, ''),
        )
      : '';
    const slug = node.slug ?? sourceSlug;

    node.slug = slug;
    node.routeSegments ??= isFolder
      ? [...parentSegments, slug, 'index']
      : [...parentSegments, slug];

    if (node.sourceName)
      setRouteForSource(sourceToRoute, node.sourceName, node.routeSegments);
    if (isFolder)
      assignRoutes(node.children, [...parentSegments, slug], sourceToRoute);
  }
}

function setRouteForSource(sourceToRoute, sourceName, routeSegments) {
  const normalized = normalizeSourcePath(sourceName);
  sourceToRoute.set(normalized, routeSegments);

  const basename = path.posix.basename(normalized);
  if (!sourceToRoute.has(basename)) {
    sourceToRoute.set(basename, routeSegments);
    return;
  }
  const existing = sourceToRoute.get(basename);
  if (existing && existing.join('/') !== routeSegments.join('/')) {
    sourceToRoute.set(basename, null);
  }
}

async function buildTocNodes(
  sourceStructure,
  pageTitleBySource = new Map(),
  lane,
) {
  if (sourceStructure.id === SOURCE_TYPES.DITA_OT_API.id) {
    try {
      const tocHtml = await fs.readFile(
        path.join(sourceStructure.sourceDir, '..', 'index.html'),
        'utf8',
      );
      const toc$ = cheerio.load(tocHtml);
      const knownSources = new Set(
        sourceStructure.fileNames.map(normalizeSourcePath),
      );
      const tocNodes = pruneUnavailableTocNodes(
        parseTocTree(toc$),
        knownSources,
      );
      if (tocNodes.length > 0) return tocNodes;
    } catch {
      console.log(
        `⚠️  No index.html found, will process all HTML files in directory`,
      );
    }

    return sourceStructure.fileNames.map((name) => ({
      children: [],
      sourceName: name,
      title: stripHtml(name),
      type: 'page',
    }));
  }

  const orderedSourceNames = await collectIndexedSourceOrder(sourceStructure);
  const nodes = buildTreeFromSourceNames(
    orderedSourceNames,
    sourceStructure.id,
    pageTitleBySource,
  );
  if (lane?.isNavigationSource) {
    markHiddenNavigationNodes(nodes, lane.isNavigationSource);
  }
  return nodes;
}

function markHiddenNavigationNodes(nodes, isNavigationSource) {
  for (const node of nodes) {
    if (node.sourceName && !isNavigationSource(node.sourceName)) {
      node.hidden = true;
    }
    markHiddenNavigationNodes(node.children, isNavigationSource);
  }
}

function pruneUnavailableTocNodes(nodes, knownSources) {
  const available = [];
  for (const node of nodes) {
    node.children = pruneUnavailableTocNodes(node.children, knownSources);
    if (
      node.sourceName &&
      !knownSources.has(normalizeSourcePath(node.sourceName))
    ) {
      if (node.children.length === 0) continue;
      node.slug ??= toKebab(
        stripHtml(path.posix.basename(node.sourceName)).replace(/^toc_/, ''),
      );
      node.sourceName = null;
    }
    available.push(node);
  }
  return available;
}

async function collectIndexedSourceOrder(sourceStructure) {
  const knownSources = new Set(sourceStructure.fileNames);
  const ordered = [];
  const seen = new Set();

  const push = (sourceName) => {
    if (!knownSources.has(sourceName) || seen.has(sourceName)) return;
    seen.add(sourceName);
    ordered.push(sourceName);
  };

  for (const indexSourceName of sourceStructure.indexSourceNames ?? []) {
    const sourcePath = path.join(sourceStructure.sourceDir, indexSourceName);
    let html = '';
    try {
      html = await fs.readFile(sourcePath, 'utf8');
    } catch {
      continue;
    }

    const indexDir = normalizeSourcePath(path.posix.dirname(indexSourceName));
    const $ = cheerio.load(html);
    $('a[href]').each((_, anchor) => {
      const href = $(anchor).attr('href')?.trim();
      const linkedSource = resolveLinkedSourceName(href, indexDir);
      if (linkedSource) push(linkedSource);
    });
  }

  for (const sourceName of sourceStructure.fileNames) push(sourceName);
  return ordered;
}

function resolveLinkedSourceName(href, currentDir = '.') {
  if (!href || isExternalHref(href)) return null;

  const hashIndex = href.indexOf('#');
  const withoutHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const withoutQuery = withoutHash.split('?')[0];
  if (!withoutQuery.endsWith('.html')) return null;

  const normalized = path.posix.normalize(
    path.posix.join(currentDir === '.' ? '' : currentDir, withoutQuery),
  );
  return normalized.startsWith('../') ? null : normalizeSourcePath(normalized);
}

async function buildPublicIndexMetaPages({
  navigationManifest,
  sourceStructure,
  sourceToRoute,
  targetBasePath,
  tocNodes,
}) {
  const rootSource = sourceStructure.rootIndexSource;
  if (!rootSource) return ['index', ...tocNodes.map((node) => node.slug)];

  const hiddenPages = tocNodes.map((node) => `!${node.slug}`);
  if (navigationManifest) {
    const manifest = JSON.parse(
      await fs.readFile(path.resolve(navigationManifest), 'utf8'),
    );
    if (!Array.isArray(manifest)) {
      throw new Error('TypeDoc navigation manifest must be a JSON array.');
    }
    const entries = manifest.map(({ label, source }) => {
      const sourceName = normalizeSourcePath(source ?? '');
      const routeSegments = sourceToRoute.get(sourceName);
      if (!label || !routeSegments) {
        throw new Error(
          `TypeDoc navigation manifest entry does not resolve: ${label ?? ''} -> ${source ?? ''}`,
        );
      }
      return `[${label}](${routeSegmentsToDocPath(routeSegments, targetBasePath)})`;
    });
    return ['index', ...entries, ...hiddenPages];
  }

  const html = await fs.readFile(
    path.join(sourceStructure.sourceDir, rootSource),
    'utf8',
  );
  const $ = cheerio.load(html);
  const content = $('.col-content').first();
  if (content.length === 0)
    return ['index', ...tocNodes.map((node) => node.slug)];

  const panel = content.find('.tsd-panel.tsd-typography').first();
  const root = panel.length ? panel : content;
  const entries = [];
  const seenSources = new Set();
  const indexDir = normalizeSourcePath(path.posix.dirname(rootSource));

  const addAnchor = (anchor) => {
    const href = anchor.attr('href')?.trim();
    const sourceName = resolveLinkedSourceName(href, indexDir);
    const routeSegments = sourceName ? sourceToRoute.get(sourceName) : null;
    if (!sourceName || !routeSegments || seenSources.has(sourceName)) return;

    seenSources.add(sourceName);
    const basename = path.posix.basename(sourceName);
    const rawLabel = normalizeText(anchor.text()).split('.')[0];
    const label = basename === 'globals.html' ? 'Globals' : rawLabel;
    if (!label) return;
    entries.push(
      `[${label}](${routeSegmentsToDocPath(routeSegments, targetBasePath)})`,
    );
  };

  const wrappedHeadings = root
    .children('a[href^="#"]')
    .filter(
      (_, anchor) => $(anchor).children('h1, h2, h3, h4, h5, h6').length > 0,
    )
    .toArray();

  const firstHeading = wrappedHeadings[0];
  if (firstHeading) {
    for (const sibling of root.children().toArray()) {
      if (sibling === firstHeading) break;
      $(sibling)
        .find('a[href]')
        .each((_, anchor) => addAnchor($(anchor)));
    }
  }

  for (const headingNode of wrappedHeadings) {
    let sibling = $(headingNode).next();
    while (sibling.length > 0) {
      if (
        sibling.is('a[href^="#"]') &&
        sibling.children('h1, h2, h3, h4, h5, h6').length > 0
      )
        break;
      const firstLink = sibling.is('a[href]')
        ? sibling
        : sibling.find('a[href]').first();
      if (firstLink.length > 0) {
        addAnchor(firstLink);
        break;
      }
      sibling = sibling.next();
    }
  }

  const globalsRoute = sourceToRoute.get('globals.html');
  if (globalsRoute && !seenSources.has('globals.html')) {
    entries.push(
      `[Globals](${routeSegmentsToDocPath(globalsRoute, targetBasePath)})`,
    );
  }

  if (entries.length === 0)
    return ['index', ...tocNodes.map((node) => node.slug)];
  return ['index', ...entries, ...hiddenPages];
}

function buildTreeFromSourceNames(
  sourceNames,
  sourceTypeId,
  pageTitleBySource = new Map(),
) {
  const rootNodes = [];
  const folderNodesByPath = new Map();
  const folderKeys = new Set();
  const usedPageKeys = new Set();

  for (const sourceName of sourceNames) {
    const routeSegments = routeSegmentsForSourceName(
      sourceName,
      sourceTypeId,
      pageTitleBySource,
    );
    for (let index = 1; index < routeSegments.length; index++) {
      folderKeys.add(routeSegments.slice(0, index).join('/'));
    }
  }

  const ensureFolder = (segments) => {
    let siblings = rootNodes;
    const parentSegments = [];
    let folder = null;

    for (const segment of segments) {
      parentSegments.push(segment);
      const folderKey = parentSegments.join('/');
      folder = folderNodesByPath.get(folderKey);
      if (!folder) {
        folder = {
          children: [],
          routeSegments: [...parentSegments, 'index'],
          slug: segment,
          sourceName: null,
          title: titleFromSlug(segment),
          type: 'folder',
        };
        folderNodesByPath.set(folderKey, folder);
        siblings.push(folder);
      }
      siblings = folder.children;
    }

    return folder;
  };

  for (const sourceName of sourceNames) {
    const routeSegments = routeSegmentsForSourceName(
      sourceName,
      sourceTypeId,
      pageTitleBySource,
    );
    if (routeSegments.length === 0) continue;

    const routeKey = routeSegments.join('/');
    if (folderKeys.has(routeKey)) {
      const folder = ensureFolder(routeSegments);
      if (!folder.sourceName) {
        folder.sourceName = sourceName;
        folder.title = stripHtml(path.posix.basename(sourceName));
      }
      continue;
    }

    const parentRouteSegments = routeSegments.slice(0, -1);
    const parentFolder = ensureFolder(parentRouteSegments);
    const siblings = parentFolder ? parentFolder.children : rootNodes;
    let slug = routeSegments.at(-1);
    let pageKey = [...parentRouteSegments, slug].join('/');
    let suffix = 2;
    while (usedPageKeys.has(pageKey) || folderKeys.has(pageKey)) {
      slug = `${routeSegments.at(-1)}-${suffix}`;
      pageKey = [...parentRouteSegments, slug].join('/');
      suffix += 1;
    }
    usedPageKeys.add(pageKey);

    siblings.push({
      children: [],
      routeSegments: [...parentRouteSegments, slug],
      slug,
      sourceName,
      title: stripHtml(path.posix.basename(sourceName)),
      type: 'page',
    });
  }

  return rootNodes;
}

function routeSegmentsForSourceName(
  sourceName,
  sourceTypeId,
  pageTitleBySource = new Map(),
) {
  if (sourceTypeId === SOURCE_TYPES.TYPEDOC.id) {
    const typedocSegments = typedocRouteSegmentsForSourceName(
      sourceName,
      pageTitleBySource,
    );
    if (typedocSegments) return typedocSegments;
  }

  const stripped = stripHtml(sourceName);
  const segments = stripped
    .split('/')
    .map((segment) => toKebab(segment))
    .filter(Boolean);
  return segments.at(-1) === 'index' ? segments.slice(0, -1) : segments;
}

function typedocRouteSegmentsForSourceName(sourceName, pageTitleBySource) {
  const segments = stripHtml(sourceName).split('/');
  const folder = segments[0];
  if (!['classes', 'interfaces', 'enums'].includes(folder)) return null;

  const title = normalizeTypeDocTitle(pageTitleBySource.get(sourceName) ?? '');
  if (!title) return null;
  return [folder, toKebab(title)];
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ============================================================================
// File Writing
// ============================================================================

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function writeFile(filePath, contents) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

function collectPlannedOutputPaths(targetRoot, tocNodes) {
  const planned = [
    path.join(targetRoot, 'index.mdx'),
    path.join(targetRoot, 'meta.json'),
  ];

  const visit = (node) => {
    if (node.children.length > 0) {
      const dir = path.join(targetRoot, ...node.routeSegments.slice(0, -1));
      planned.push(path.join(dir, 'index.mdx'), path.join(dir, 'meta.json'));
      for (const child of node.children) visit(child);
      return;
    }

    planned.push(path.join(targetRoot, `${node.routeSegments.join('/')}.mdx`));
  };

  for (const node of tocNodes) visit(node);
  return planned;
}

// ============================================================================
// Main Processing
// ============================================================================

async function writeNode(
  output,
  lane,
  node,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  cheerio,
) {
  if (node.children.length > 0) {
    const dir = path.join(
      output.targetRoot,
      ...node.routeSegments.slice(0, -1),
    );
    const visibleChildren = node.children.filter((child) => !child.hidden);
    await writeJson(path.join(dir, 'meta.json'), {
      title: pageTitleBySource.get(node.sourceName) ?? node.title,
      pages: ['index', ...visibleChildren.map((child) => child.slug)],
    });
    if (node.sourceName) {
      await writeFile(
        path.join(dir, 'index.mdx'),
        renderPage({
          $: cheerio.load(
            await fs.readFile(
              path.join(output.sourceDir, node.sourceName),
              'utf8',
            ),
          ),
          currentSource: node.sourceName,
          lane,
          pageDescriptionBySource,
          pageTitleBySource,
          sourceToRoute,
          targetBasePath: output.targetBasePath,
        }),
      );
    } else {
      await writeFile(
        path.join(dir, 'index.mdx'),
        renderSyntheticIndex(node.title, `${node.title} API reference.`),
      );
    }

    for (const child of node.children) {
      await writeNode(
        output,
        lane,
        child,
        pageTitleBySource,
        pageDescriptionBySource,
        sourceToRoute,
        cheerio,
      );
    }
    return;
  }

  const filePath = path.join(
    output.targetRoot,
    `${node.routeSegments.join('/')}.mdx`,
  );
  await writeFile(
    filePath,
    renderPage({
      $: cheerio.load(
        await fs.readFile(path.join(output.sourceDir, node.sourceName), 'utf8'),
      ),
      currentSource: node.sourceName,
      lane,
      pageDescriptionBySource,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath: output.targetBasePath,
    }),
  );
}

function renderSyntheticIndex(title, description) {
  return `---
title: ${escapeYaml(title)}
description: ${escapeYaml(description)}
---

This section contains migrated API reference pages.
`;
}

async function main() {
  globalThis.File ??= class File {};
  const opts = parseArgs();

  // Verify source exists
  try {
    await fs.access(opts.source);
  } catch {
    console.error(`Error: Source directory does not exist: ${opts.source}`);
    process.exit(1);
  }

  const sourceStructure = await detectSourceStructure(opts.source);
  if (!sourceStructure.supported) {
    throw new SourceStructureError(sourceStructure);
  }
  const lane = getSourceLane(sourceStructure);
  if (lane.filterSourceNames) {
    sourceStructure.fileNames = lane.filterSourceNames(
      sourceStructure.fileNames,
      sourceStructure,
    );
  }
  await filterSourcesWithoutMeaningfulBody(sourceStructure);

  console.log(`\n📄 HTML to Markdown Migration Tool`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`Source:    ${opts.source}`);
  console.log(`Output:    ${opts.output}`);
  console.log(`Detected:  ${sourceStructure.label}`);
  console.log(`Files:     ${sourceStructure.fileNames.length}`);
  console.log(`Product:   ${opts.product}`);
  console.log(`Platform:  ${opts.platform}`);
  console.log(`Locale:    ${opts.locale}`);
  console.log(`Route:     ${opts.routeBasePath}`);
  console.log(`Dry run:   ${opts.dryRun ? 'yes' : 'no'}`);
  console.log(`${'─'.repeat(50)}\n`);

  const apiSourceDir = sourceStructure.sourceDir;
  const targetRoot = opts.dryRun
    ? path.resolve(opts.output)
    : assertSafeOutputPath(opts.output, opts, sourceStructure);
  const versionRouteSegment =
    opts.versionDir && opts.versionDir !== '(current)'
      ? `/${opts.versionDir}`
      : '';
  const targetBasePath =
    opts.targetBasePath ??
    inferTargetBasePathFromOutput(targetRoot, opts.locale) ??
    `${opts.routeBasePath}/${opts.product}/${opts.platform}${versionRouteSegment}`;

  // Read page titles and descriptions
  const pageTitleBySource = new Map();
  const pageDescriptionBySource = new Map();
  const typeDocSymbolHrefs = new Map();
  const fileNames = sourceStructure.fileNames;

  const titleSourceNames = sourceStructure.rootIndexSource
    ? [sourceStructure.rootIndexSource, ...fileNames]
    : fileNames;
  for (const name of titleSourceNames) {
    const html = await fs.readFile(path.join(apiSourceDir, name), 'utf8');
    const $ = cheerio.load(html);
    const title = readCanonicalTitle($, sourceStructure.id) || stripHtml(name);
    const description =
      sourceStructure.id === SOURCE_TYPES.TYPEDOC.id
        ? typeDocDescription(readDescription($), title, opts.locale)
        : readDescription($);
    pageTitleBySource.set(name, title);
    if (description) pageDescriptionBySource.set(name, description);
    if (sourceStructure.id === SOURCE_TYPES.TYPEDOC.id) {
      for (const anchor of $('a[href]').toArray()) {
        const label = normalizeText($(anchor).text());
        if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(label)) {
          continue;
        }
        const href = sourceRelativeHref($(anchor).attr('href') ?? '', name);
        if (!href) continue;
        if (!typeDocSymbolHrefs.has(label)) typeDocSymbolHrefs.set(label, href);
        const lowerLabel = label.toLowerCase();
        if (!typeDocSymbolHrefs.has(lowerLabel)) {
          typeDocSymbolHrefs.set(lowerLabel, href);
        }
      }
    }
  }
  validateSourceIdentity(opts, sourceStructure, pageTitleBySource);

  const tocNodes = await buildTocNodes(
    sourceStructure,
    pageTitleBySource,
    lane,
  );

  // Assign routes
  const sourceToRoute = new Map();
  sourceToRoute.locale = opts.locale;
  sourceToRoute.sourceTypeId = sourceStructure.id;
  sourceToRoute.typeDocSymbolHrefs = typeDocSymbolHrefs;
  assignRoutes(tocNodes, [], sourceToRoute);
  if (sourceStructure.rootIndexSource) {
    setRouteForSource(sourceToRoute, sourceStructure.rootIndexSource, []);
  }

  if (opts.dryRun) {
    const plannedOutputPaths = collectPlannedOutputPaths(targetRoot, tocNodes);

    console.log(`\n📋 Dry run summary`);
    console.log(`Detected source type: ${sourceStructure.label}`);
    console.log(`File count: ${fileNames.length}`);
    console.log(`Target route: ${targetBasePath}`);
    console.log(`\nPlanned output paths (${plannedOutputPaths.length}):`);
    for (const outputPath of plannedOutputPaths) {
      console.log(`  - ${outputPath}`);
    }

    console.log(`\nInput files:`);
    for (const name of fileNames.slice(0, 20)) {
      console.log(`  - ${name}: ${pageTitleBySource.get(name)}`);
    }
    if (fileNames.length > 20)
      console.log(`  ... and ${fileNames.length - 20} more`);
    return;
  }

  // Write files
  const output = { sourceDir: apiSourceDir, targetRoot, targetBasePath };

  // Clean and create output directory
  await fs.rm(targetRoot, { force: true, recursive: true });
  await fs.mkdir(targetRoot, { recursive: true });

  // Write index
  if (sourceStructure.rootIndexSource) {
    await writeFile(
      path.join(targetRoot, 'index.mdx'),
      renderPage({
        $: cheerio.load(
          await fs.readFile(
            path.join(apiSourceDir, sourceStructure.rootIndexSource),
            'utf8',
          ),
        ),
        currentSource: sourceStructure.rootIndexSource,
        lane,
        pageDescriptionBySource,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      }),
    );
  } else {
    await writeFile(
      path.join(targetRoot, 'index.mdx'),
      renderSyntheticIndex(
        `${opts.platform.toUpperCase()} API Reference`,
        `${opts.product} ${opts.platform} API reference.`,
      ),
    );
  }

  const metaPages =
    opts.navigation === 'public-index' &&
    sourceStructure.id === SOURCE_TYPES.TYPEDOC.id
      ? await buildPublicIndexMetaPages({
          sourceStructure,
          sourceToRoute,
          targetBasePath,
          tocNodes,
          navigationManifest: opts.navigationManifest,
        })
      : [
          'index',
          ...tocNodes.filter((node) => !node.hidden).map((node) => node.slug),
        ];
  const scopedMetaPages =
    sourceStructure.id === SOURCE_TYPES.TYPEDOC.id
      ? replaceTypeDocGlobalsWithLabeledLink(
          metaPages,
          sourceToRoute,
          targetBasePath,
        )
      : metaPages;
  const rootTitle =
    sourceStructure.id === SOURCE_TYPES.TYPEDOC.id &&
    sourceStructure.rootIndexSource
      ? (pageTitleBySource.get(sourceStructure.rootIndexSource) ??
        `${opts.platform.toUpperCase()} API Reference`)
      : `${opts.platform.toUpperCase()} API Reference`;

  // Write meta.json
  await writeJson(path.join(targetRoot, 'meta.json'), {
    title: rootTitle,
    ...(sourceStructure.id === SOURCE_TYPES.TYPEDOC.id ||
    sourceStructure.id === SOURCE_TYPES.DOXYGEN_JAVADOC.id ||
    (opts.product === 'whiteboard' &&
      ['android', 'ios', 'web'].includes(opts.platform))
      ? { navScope: {} }
      : {}),
    pages: scopedMetaPages,
  });

  // Write all pages
  let writtenCount = 0;
  for (const node of tocNodes) {
    await writeNode(
      output,
      lane,
      node,
      pageTitleBySource,
      pageDescriptionBySource,
      sourceToRoute,
      cheerio,
    );
    writtenCount++;
    if (opts.verbose) console.log(`  ✅ ${node.slug}`);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✨ Migration complete!`);
  console.log(`   Pages written: ${writtenCount}`);
  console.log(`   Output: ${targetRoot}`);
  console.log(`${'─'.repeat(50)}\n`);
}

function replaceTypeDocGlobalsWithLabeledLink(
  metaPages,
  sourceToRoute,
  targetBasePath,
) {
  const globalsRoute = sourceToRoute.get('globals.html');
  if (!globalsRoute || !metaPages.includes('globals')) return metaPages;

  const globalsEntry = `[Globals](${routeSegmentsToDocPath(
    globalsRoute,
    targetBasePath,
  )})`;
  return metaPages.flatMap((page) =>
    page === 'globals' ? [globalsEntry, '!globals'] : [page],
  );
}

main().catch((error) => {
  if (
    error instanceof SourceStructureError ||
    error instanceof OutputPathError ||
    error instanceof SourceIdentityError
  ) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
