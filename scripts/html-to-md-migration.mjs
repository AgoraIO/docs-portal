#!/usr/bin/env node

/**
 * DITA-OT HTML-to-Markdown Migration Tool
 *
 * Converts DITA-OT (Oxygen XML) generated HTML API reference docs
 * to pure markdown files suitable for the docs-portal project.
 *
 * This is not a generic HTML converter. The supported input is a product or
 * platform source directory that contains a DITA-OT API/ subdirectory.
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
    routeBasePath: '/api-reference',
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

  return opts;
}

function printHelp() {
  console.log(`
DITA-OT HTML-to-Markdown Migration Tool

This is not a generic HTML converter. It only supports DITA-OT/Oxygen
generated API reference HTML where --source contains an API/ directory with
HTML files. It detects TypeDoc, Doxygen/Javadoc, iOS-doc-generator, Dartdoc,
and RESTful/OpenAPI or other source layouts and exits with migration guidance.

Usage:
  node scripts/html-to-md-migration.mjs --source <dir> --output <dir> --product <name> --platform <name> [options]

Required:
  --source, -s      Source directory containing DITA-OT API/ HTML docs
  --output, -o      Output directory for markdown files
  --product, -p     Product name (e.g., rtc, signaling, cloud-recording)
  --platform, -P    Platform name (e.g., android, ios, web, RESTful)

Options:
  --locale, -l          Locale for output (default: zh-CN)
  --route-base-path, -r Base path for links (default: /api-reference)
  --version-dir, -V     Version directory name (e.g., '4.6.0' or '(current)')
  --dry-run, -d         Print detected type, file count, and planned paths without writing
  --verbose, -v         Show detailed processing information
  --help, -h            Show this help message

Supported lane:
  - DITA-OT/Oxygen HTML API reference: <source>/API/*.html

Unsupported lanes detected with actionable errors:
  - TypeDoc
  - Doxygen/Javadoc
  - iOS-doc-generator
  - Dartdoc
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

function inlineText(node) {
  return escapeInlineText(normalizeInline(decodeHtml(node.text())));
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
    action:
      'Use or add a Dartdoc-specific migration lane; this DITA-OT converter cannot preserve Dart library navigation.',
    label: 'Dartdoc HTML reference',
  },
  DITA_OT_API: {
    label: 'DITA-OT/Oxygen API reference (API/ directory)',
  },
  DOXYGEN_JAVADOC: {
    action:
      'Use or add a Doxygen/Javadoc-specific migration lane; this DITA-OT converter cannot preserve generated class/package indexes.',
    label: 'Doxygen/Javadoc HTML reference',
  },
  IOS_DOC_GENERATOR: {
    action:
      'Use or add an iOS-doc-generator-specific migration lane; this DITA-OT converter cannot preserve Objective-C/Swift symbol navigation.',
    label: 'iOS-doc-generator HTML reference',
  },
  RESTFUL_OR_OTHER: {
    action:
      'Use the OpenAPI/Fumadocs REST API lane for RESTful references, or build a source-specific converter before running migration.',
    label: 'RESTful/OpenAPI or other unsupported source layout',
  },
  TYPEDOC: {
    action:
      'Use or add a TypeDoc-specific migration lane; this DITA-OT converter cannot preserve TypeScript symbol navigation.',
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
        label: SOURCE_TYPES.DITA_OT_API.label,
        markers: ['API/', `${fileNames.length} API/*.html files`],
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
  if (iosDocGeneratorMarkers.length > 0) {
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.IOS_DOC_GENERATOR,
      iosDocGeneratorMarkers,
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
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.TYPEDOC,
      typedocMarkers,
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
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.DOXYGEN_JAVADOC,
      doxygenJavadocMarkers,
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
    return unsupportedSourceStructure(
      sourceDir,
      SOURCE_TYPES.DARTDOC,
      dartdocMarkers,
    );
  }

  const restOrOtherMarkers = collectMarkers([
    [hasFile('openapi.json'), 'openapi.json'],
    [hasFile('openapi.yaml'), 'openapi.yaml'],
    [hasFile('openapi.yml'), 'openapi.yml'],
    [hasFile('swagger.json'), 'swagger.json'],
    [hasFile('swagger.yaml'), 'swagger.yaml'],
    [hasFile('swagger.yml'), 'swagger.yml'],
    [hasDir('endpoint'), 'endpoint/'],
    [hasDir('endpoints'), 'endpoints/'],
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
    'Supported lane: DITA-OT/Oxygen HTML API reference with <source>/API/*.html.',
    `Action: ${structure.action}`,
    'Expected source shape: point --source at the product/platform directory that contains API/.',
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
    resolvedSource,
    resolvedApiSource,
  ];
  const homeDir = process.env.HOME ? path.resolve(process.env.HOME) : null;
  if (homeDir) {
    protectedPaths.push(homeDir);
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
  return normalizeText(
    $(
      'main > article > h1, main > article article > h1, main > article article > h2',
    )
      .first()
      .text(),
  );
}

function readDescription($) {
  const desc = $('main > article > .body > .shortdesc').first().text().trim();
  if (desc) return normalizeText(desc);
  const metaDesc = $('meta[name="description"]').attr('content');
  return metaDesc ? normalizeText(metaDesc) : '';
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
    const inlineParts = [];
    const blockParts = [];
    for (const child of $(li).contents().toArray()) {
      const element = $(child);
      if (child.type === 'text') {
        const text = escapeInlineText(normalizeText($(child).text()));
        if (text) inlineParts.push(text);
        continue;
      }
      let rendered = '';
      if (options.preferInlineOnly && !element.is('ul, ol')) {
        rendered = element.is('a')
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
      } else {
        rendered = element.is('ul, ol')
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
      }
      if (rendered) {
        if (element.is('ul, ol')) blockParts.push(rendered);
        else inlineParts.push(rendered);
      }
    }
    const inlineContent = normalizeInlineFlow(inlineParts.join(' '));
    if (!inlineContent && blockParts.length === 0) continue;
    const marker = ordered ? `${index}.` : '-';
    if (blockParts.length === 0) {
      items.push(`${marker} ${inlineContent}`);
    } else {
      const nested = blockParts
        .map((part) =>
          part
            .split('\n')
            .map((line) => (line ? `  ${line}` : line))
            .join('\n'),
        )
        .join('\n');
      items.push([`${marker} ${inlineContent}`.trim(), nested].join('\n'));
    }
    index += 1;
  }
  return items.join('\n');
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

  for (const child of children) {
    const node = $(child);
    if (node.is('dt')) {
      currentTerm = inlineChildren(
        $,
        node,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
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
        rows.push(`${'#'.repeat(depth)} \`${currentTerm}\``);
        if (value) rows.push(value);
      } else if (value) {
        rows.push(value);
      }
      currentTerm = '';
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
  const label = inlineText(anchor) || href;
  if (!href) return label;

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return `[${label}](${href})`;
  }

  const [filePart, hashPart] = href.split('#');
  if (!filePart) return `[${label}](#${hashPart})`;

  const sourceName = path.basename(filePart);
  const routeSegments = sourceToRoute.get(sourceName);
  if (!routeSegments) return `[${label}](${href})`;

  return `[${label}](${routeSegmentsToDocPath(routeSegments, targetBasePath)}${
    hashPart ? `#${hashPart}` : ''
  })`;
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
      const text = escapeInlineText(normalizeText($(child).text()));
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
    element.find('> ul, > ol, > table, > dl, > pre, > div.note, > section')
      .length > 0
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
    const heading = element.find('> h2, > h3, > h4').first();
    const childDepth = heading.is('h4') ? 4 : heading.is('h3') ? 3 : 2;
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
      const text = escapeInlineText(normalizeText($(node).text()));
      if (text) inlineParts.push(text);
      continue;
    }

    const element = $(node);
    if (
      element.is('h1, h2, h3, h4, h5, h6') ||
      element.is('.shortdesc') ||
      element.is('nav.related-links')
    )
      continue;

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
  const heading = section.find('> h2, > h3, > h4').first();
  const title = inlineText(heading);
  const parts = [];

  if (id) parts.push(`<a id="${id}"></a>`);
  if (title) parts.push(`${'#'.repeat(depth)} ${title}`);

  const directList = section.find('> ul').first();
  if (
    directList.length > 0 &&
    directList.find('> li > a').length > 0 &&
    directList.siblings().filter('ul').length === 0
  ) {
    const renderedList = renderList(
      $,
      directList,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      false,
      { preferInlineOnly: true },
    );
    if (renderedList) parts.push(renderedList);
    return parts.join('\n\n').trim();
  }

  const rendered = renderChildren(
    $,
    section,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
    depth,
  );
  if (rendered) parts.push(rendered);

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
  const heading = article.find('> h2, > h3, > h4').first();
  const level = heading.is('h2') ? '##' : heading.is('h3') ? '###' : '####';
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
  const title = nav.find('strong').first().text().trim();
  const items = nav.find('li > a').toArray();
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
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  targetBasePath,
}) {
  const pageTitle =
    pageTitleBySource.get(currentSource) ?? stripHtml(currentSource);
  const description = pageDescriptionBySource.get(currentSource);
  const body = $('main > article');
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

  if (sections.length === 0) {
    const fallback = renderChildren(
      $,
      body.find('> .body').first(),
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

  return `${frontmatter.join('\n')}${sections.filter(Boolean).join('\n\n')}\n`;
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
    const slug = toKebab(stripHtml(node.sourceName).replace(/^toc_/, ''));

    node.slug = slug;
    node.routeSegments = isFolder
      ? [...parentSegments, slug, 'index']
      : [...parentSegments, slug];

    if (node.sourceName) sourceToRoute.set(node.sourceName, node.routeSegments);
    if (isFolder)
      assignRoutes(node.children, [...parentSegments, slug], sourceToRoute);
  }
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
    await writeJson(path.join(dir, 'meta.json'), {
      title: pageTitleBySource.get(node.sourceName) ?? node.title,
      pages: ['index', ...node.children.map((child) => child.slug)],
    });
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
        pageDescriptionBySource,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath: output.targetBasePath,
      }),
    );

    for (const child of node.children) {
      await writeNode(
        output,
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
      pageDescriptionBySource,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath: output.targetBasePath,
    }),
  );
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

  const sourceDir = opts.source;
  const apiSourceDir = sourceStructure.sourceDir;
  const targetRoot = opts.dryRun
    ? path.resolve(opts.output)
    : assertSafeOutputPath(opts.output, opts, sourceStructure);
  const targetBasePath = `${opts.routeBasePath}/${opts.product}/${opts.platform}`;

  // Read TOC
  const tocPath = path.join(sourceDir, 'index.html');
  let tocNodes = [];
  try {
    const tocHtml = await fs.readFile(tocPath, 'utf8');
    const toc$ = cheerio.load(tocHtml);
    tocNodes = parseTocTree(toc$);
  } catch {
    console.log(
      `⚠️  No index.html found, will process all HTML files in directory`,
    );
  }

  // Get all HTML files
  const fileNames = sourceStructure.fileNames;

  // If no TOC, create a flat structure
  if (tocNodes.length === 0) {
    tocNodes = fileNames.map((name) => ({
      children: [],
      sourceName: name,
      title: stripHtml(name),
      type: 'page',
    }));
  }

  // Assign routes
  const sourceToRoute = new Map();
  assignRoutes(tocNodes, [], sourceToRoute);

  // Read page titles and descriptions
  const pageTitleBySource = new Map();
  const pageDescriptionBySource = new Map();

  for (const name of fileNames) {
    const html = await fs.readFile(path.join(apiSourceDir, name), 'utf8');
    const $ = cheerio.load(html);
    const title = readTitle($) || stripHtml(name);
    const description = readDescription($);
    pageTitleBySource.set(name, title);
    if (description) pageDescriptionBySource.set(name, description);
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
  await writeFile(
    path.join(targetRoot, 'index.mdx'),
    `---
title: ${escapeYaml(`${opts.platform.toUpperCase()} API Reference`)}
description: ${escapeYaml(`${opts.product} ${opts.platform} API reference.`)}
---

This directory contains the migrated ${opts.product} ${opts.platform} API reference.`,
  );

  // Write meta.json
  await writeJson(path.join(targetRoot, 'meta.json'), {
    title: `${opts.platform.toUpperCase()} API Reference`,
    pages: ['index', ...tocNodes.map((node) => node.slug)],
  });

  // Write all pages
  let writtenCount = 0;
  for (const node of tocNodes) {
    await writeNode(
      output,
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

main().catch((error) => {
  if (
    error instanceof SourceStructureError ||
    error instanceof OutputPathError
  ) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
