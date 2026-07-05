import fs, { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  ensureControlProgressColumns,
  readControlTable,
  selectRowsReadyForAudit,
  updateAuditProgressInPathMap,
} from './migration-control-table.mjs';

const DEFAULT_VARIABLES = {
  Vg: {
    COMPANY: 'Agora',
    CONSOLE: 'Agora Console',
    CP: 'Cloud Proxy',
    VSDK: 'Video SDK',
  },
  Vpd: {
    NAME: 'Video Calling',
    SDK: 'Video SDK',
  },
  Vpl: {
    CLIENT: 'app',
  },
};

const MARKDOWN_FILE_PATTERN = /\.(md|mdx)$/i;
const ALLOWED_TARGET_MDX_COMPONENTS = new Set([
  'Accordion',
  'Accordions',
  'Card',
  'Cards',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'Link',
  'PlatformInline',
  'PlatformStructured',
  'Slot',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
]);
const AUDIT_CARD_COMPONENT_NAMES =
  'Card|LinkBlock|LinkCardV2|LinkCard|DocLinkCard|HotArticleCard|RecommendCard|QuickStartCard|InstantExperienceCard|SDKDownloadCard|PlatformGuideCard|LinkCardA|LinkCardB|LinkCardC|DownloadCard';
const CODE_LANG_ALIASES = new Map([
  ['http', 'text'],
  ['js', 'javascript'],
  ['objectivec', 'objc'],
  ['obj-c', 'objc'],
  ['shell', 'bash'],
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
  ['mini-program', '小程序'],
  ['macos', 'macOS'],
  ['react', 'React'],
  ['react-native', 'React Native'],
  ['restful', 'RESTful'],
  ['rn', 'React Native'],
  ['unity', 'Unity'],
  ['unreal', 'Unreal'],
  ['unreal-blueprint', 'Unreal Blueprint'],
  ['unreal-cpp', 'Unreal C++'],
  ['web', 'Web'],
  ['wechat', '微信小程序'],
  ['windows', 'Windows'],
]);
const PLATFORM_PROJECTION_ALIASES = new Map([
  ['javascript', 'web'],
  ['react-js', 'web'],
  ['rn', 'react-native'],
  ['unreal-cpp', 'unreal'],
  ['unreal-blueprint', 'blueprint'],
  ['wechat', 'mini-program'],
]);
const JSX_ATTRS_PATTERN = String.raw`(?:[^"'>{}]|"[^"]*"|'[^']*'|\{[^}]*\})*`;
const KNOWN_STRUCTURAL_COMPONENTS = new Set([
  'Accordion',
  'Accordions',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'Image',
  'Link',
  'PlatformInline',
  'PlatformStructured',
  'Slot',
  'ProductWrapper',
  'Tab',
  'TabItem',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
]);

/**
 * @param {{
 *   oldPath: string;
 *   newPath: string;
 *   oldUrl?: string | null;
 *   newUrl?: string | null;
 *   platform?: string | null;
 *   product?: string | null;
 *   sourceRoot?: string | null;
 * }} options
 */
export function auditSingleDocContentFidelity({
  oldPath,
  newPath,
  oldUrl,
  newUrl,
  platform,
  product,
  sourceRoot,
}) {
  const resolvedOldPath = path.resolve(oldPath);
  const resolvedNewPath = path.resolve(newPath);
  const resolvedPortalPath = resolveMarkdownFile(resolvedNewPath);
  if (!resolvedPortalPath) {
    throw new Error(`Unable to resolve portal source file: ${resolvedNewPath}`);
  }
  const projection = {
    dropSharedOutsidePlatformBlocks: shouldDropSharedOutsidePlatformBlocks({
      platform,
      sourcePath: resolvedOldPath,
      targetPath: resolvedNewPath,
    }),
    platform: platform ?? null,
    product: product ?? null,
  };
  const targetRawContent = stripFrontmatter(
    fs.readFileSync(resolvedPortalPath, 'utf8'),
  );
  const legacyResidue = detectLegacyResidue(targetRawContent);
  const oldContent = loadLegacyContent({
    currentFile: resolvedOldPath,
    projection,
    seen: new Set(),
    sourceRoot: sourceRoot
      ? path.resolve(sourceRoot)
      : path.dirname(resolvedOldPath),
    variables: DEFAULT_VARIABLES,
  });
  const newContent = loadPortalContent({
    currentFile: resolvedPortalPath,
    projection,
    seen: new Set(),
  });

  const sourceRecords = createContentFidelityRecords({
    content: oldContent,
    location: resolvedOldPath,
    side: 'old',
  });
  const targetRecords = createContentFidelityRecords({
    content: newContent,
    location: resolvedNewPath,
    side: 'new',
  });
  const comparison = compareRecords({ sourceRecords, targetRecords });
  const contentDifferences =
    comparison.findings.changed.length +
    comparison.findings.extra.length +
    comparison.findings.missing.length +
    comparison.findings.moved.length +
    comparison.findings.unsupported.length;
  const report = {
    generatedAt: new Date().toISOString(),
    page: {
      oldPath: resolvedOldPath,
      oldUrl: oldUrl ?? null,
      newPath: resolvedNewPath,
      newUrl: newUrl ?? null,
      projection,
    },
    summary: {
      changed: comparison.findings.changed.length,
      exactMatches: comparison.matches.exact,
      extra: comparison.findings.extra.length,
      missing: comparison.findings.missing.length,
      moved: comparison.findings.moved.length,
      sourceRecords: sourceRecords.length,
      targetRecords: targetRecords.length,
      legacyResidue: legacyResidue.total,
      unresolvedDifferences: contentDifferences + legacyResidue.total,
      unsupported: comparison.findings.unsupported.length,
    },
    findings: {
      ...comparison.findings,
      legacyResidue,
    },
  };

  return report;
}

export function detectLegacyResidue(content) {
  const stripped = stripMarkdownCode(content);
  const residue = new Map();

  for (const match of stripped.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b[^>]*>/g)) {
    const componentName = match[1];
    if (ALLOWED_TARGET_MDX_COMPONENTS.has(componentName)) {
      continue;
    }
    addResidue(residue, `legacy-component:${componentName}`);
  }

  if (
    /^import\s+[\s\S]*?from\s+['"]@(?:shared|doc-shared|api-shared|docs\/shared)\//m.test(
      stripped,
    )
  ) {
    addResidue(residue, 'legacy-shared-import');
  }

  if (/\bfrontMatter\.|\bprops\./.test(stripped)) {
    addResidue(residue, 'legacy-runtime-variable');
  }

  const details = [...residue.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([kind, count]) => ({ count, kind }));

  return {
    details,
    examples: details.slice(0, 5).map((item) => item.kind),
    total: details.reduce((sum, item) => sum + item.count, 0),
  };
}

export function loadLegacyContent({
  currentFile,
  projection,
  seen,
  sourceRoot,
  variables = DEFAULT_VARIABLES,
}) {
  const resolvedCurrentFile = resolveMarkdownFile(currentFile);

  if (!resolvedCurrentFile) {
    throw new Error(`Unable to resolve legacy source file: ${currentFile}`);
  }

  if (seen.has(resolvedCurrentFile)) {
    return '';
  }

  seen.add(resolvedCurrentFile);
  const raw = fs.readFileSync(resolvedCurrentFile, 'utf8');
  const withoutFrontmatter = stripFrontmatter(raw);
  const { content, imports } = removeImports(withoutFrontmatter);
  let expanded = expandIncludeTags({
    content,
    currentFile: resolvedCurrentFile,
    loader: (includePath) =>
      loadLegacyContent({
        currentFile: includePath,
        projection,
        seen,
        sourceRoot,
        variables,
      }),
  });

  for (const importEntry of imports) {
    if (!importEntry.localName) {
      continue;
    }

    const importedPath = resolveImportSource({
      currentFile: resolvedCurrentFile,
      source: importEntry.source,
      sourceRoot,
    });

    if (!importedPath) {
      continue;
    }

    if (importEntry.namespace) {
      expanded = replaceNamespaceLookups(
        expanded,
        importEntry.localName,
        parseExportedObjectMaps(fs.readFileSync(importedPath, 'utf8')),
        projection,
      );
      continue;
    }

    if (!/^[A-Z]/.test(importEntry.localName)) {
      continue;
    }

    const importedContent = loadLegacyContent({
      currentFile: importedPath,
      projection,
      seen,
      sourceRoot,
      variables,
    });

    expanded = replaceComponentUsage(
      expanded,
      importEntry.localName,
      importedContent,
      projection,
    );
  }

  expanded = filterOrStripWrapper(expanded, 'PlatformWrapper', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });
  expanded = filterOrStripWrapper(expanded, 'PlatformFilter', {
    attrName: 'platformList',
    projectionValue: projection.platform,
  });
  expanded = filterOrStripWrapper(expanded, 'ProductWrapper', {
    attrName: 'product',
    projectionValue: projection.product,
  });

  return expandVariables(
    expandRuntimeVariablesForAudit(expanded, projection),
    variables,
  );
}

function expandRuntimeVariablesForAudit(content, projection) {
  const product = projection.product ?? '';
  const platform = projection.platform ?? '';
  const productLabel = getProductLabel(product);
  const platformLabel = getPlatformLabel(platform);

  return content
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
    .replace(/\bfrontMatter\.ag_platform\b/g, platform)
    .replace(/\bfrontMatter\.ag_platform_label\b/g, platformLabel)
    .replace(/\bfrontMatter\.ag_product_label\b/g, productLabel)
    .replace(/\bfrontMatter\.ag_product\b/g, product);
}

function getProductLabel(product) {
  return PRODUCT_LABELS.get(product) ?? product;
}

function getPlatformLabel(platform) {
  return PLATFORM_LABELS.get(platform) ?? platform;
}

export function loadPortalContent({ currentFile, projection, seen }) {
  const resolvedCurrentFile = resolveMarkdownFile(currentFile);

  if (!resolvedCurrentFile) {
    throw new Error(`Unable to resolve portal source file: ${currentFile}`);
  }

  if (seen.has(resolvedCurrentFile)) {
    return '';
  }

  seen.add(resolvedCurrentFile);
  const raw = fs.readFileSync(resolvedCurrentFile, 'utf8');
  let content = stripFrontmatter(raw);

  content = expandIncludeTags({
    content,
    currentFile: resolvedCurrentFile,
    loader: (includePath) =>
      loadPortalContent({
        currentFile: includePath,
        projection,
        seen,
      }),
  });
  content = filterOrStripWrapper(content, 'PlatformStructured', {
    attrName: 'platform',
    dropOutsideWhenMatched: projection.dropSharedOutsidePlatformBlocks,
    keepWithoutProjection: false,
    projectionValue: projection.platform,
  });
  content = filterOrStripWrapper(content, 'PlatformInline', {
    attrName: 'platform',
    dropOutsideWhenMatched: projection.dropSharedOutsidePlatformBlocks,
    keepWithoutProjection: false,
    projectionValue: projection.platform,
  });
  content = inlineSlotDefinitions(content);

  return content;
}

function inlineSlotDefinitions(content) {
  const slots = new Map();
  const slotPattern =
    /<Slot\b[^>]*\bfor=(['"])(?<name>[\s\S]*?)\1[^>]*>(?<body>[\s\S]*?)<\/Slot>/g;

  for (const match of content.matchAll(slotPattern)) {
    slots.set(match.groups.name, match.groups.body);
  }

  return content
    .replace(
      /<Slot\b[^>]*\bname=(['"])(?<name>[\s\S]*?)\1[^>]*\/>/g,
      (_match, _quote, _name, _offset, _source, groups) => {
        const body = slots.get(groups.name);
        return body ? ` ${normalizeText(body).replace(/\|/g, '\\|')} ` : '';
      },
    )
    .replace(slotPattern, '');
}

function expandIncludeTags({ content, currentFile, loader }) {
  return content.replace(
    /<include>\s*([\s\S]*?)\s*<\/include>/g,
    (_match, includeTarget) => {
      const resolvedInclude = resolveMarkdownFile(
        path.resolve(path.dirname(currentFile), includeTarget.trim()),
      );

      if (!resolvedInclude) {
        return '';
      }

      return loader(resolvedInclude);
    },
  );
}

function removeImports(content) {
  const imports = [];
  const lines = content.split('\n');
  let inCodeFence = false;
  const withoutImports = lines
    .map((line) => {
      if (/^ {0,3}(`{3,}|~{3,})/.test(line)) {
        inCodeFence = !inCodeFence;
        return line;
      }

      if (inCodeFence) {
        return line;
      }

      const importMatch = line.match(
        /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/,
      );

      if (!importMatch) {
        return line;
      }

      const normalizedImportClause = importMatch[1].trim();
      const namespaceMatch = normalizedImportClause.match(
        /^\*\s+as\s+([A-Za-z0-9_]+)$/,
      );
      imports.push({
        localName:
          namespaceMatch?.[1] ?? getDefaultImportName(normalizedImportClause),
        namespace: Boolean(namespaceMatch),
        source: importMatch[2],
      });
      return '';
    })
    .join('\n');

  return {
    content: withoutImports,
    imports,
  };
}

function getDefaultImportName(importClause) {
  if (importClause.startsWith('*') || importClause.startsWith('{')) {
    return null;
  }

  return importClause.split(',')[0]?.trim() || null;
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

function replaceNamespaceLookups(content, namespaceName, maps, projection) {
  if (maps.size === 0) {
    return content;
  }

  const escaped = escapeRegExp(namespaceName);
  const platform = projection.platform ?? '';
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

      return exportMap.get(platform) ?? '';
    },
  );
}

function resolveImportSource({ currentFile, source, sourceRoot }) {
  if (source.startsWith('@docs/shared/')) {
    const relativePath = source.slice('@docs/shared/'.length);
    return (
      resolveMarkdownFile(path.join(sourceRoot, 'docs/shared', relativePath)) ??
      resolveMarkdownFile(path.join(sourceRoot, 'shared', relativePath))
    );
  }

  if (source.startsWith('@shared/')) {
    return resolveMarkdownFile(
      path.join(sourceRoot, 'shared', source.slice('@shared/'.length)),
    );
  }

  if (source.startsWith('@doc-shared/')) {
    const relativePath = source.slice('@doc-shared/'.length);
    return (
      resolveMarkdownFile(path.join(sourceRoot, 'docs/shared', relativePath)) ??
      resolveMarkdownFile(path.join(sourceRoot, 'shared', relativePath))
    );
  }

  if (source.startsWith('@api-shared/')) {
    return resolveMarkdownFile(
      path.join(
        sourceRoot,
        'docs-api-reference',
        'shared',
        source.slice('@api-shared/'.length),
      ),
    );
  }

  if (source.startsWith('.')) {
    return resolveMarkdownFile(path.resolve(path.dirname(currentFile), source));
  }

  return null;
}

function resolveMarkdownFile(candidatePath) {
  const extension = path.extname(candidatePath).toLowerCase();
  const withoutExtension = extension
    ? candidatePath.slice(0, -extension.length)
    : candidatePath;
  const candidates = [
    candidatePath,
    extension === '.md' ? `${withoutExtension}.mdx` : null,
    extension === '.mdx' ? `${withoutExtension}.md` : null,
    `${candidatePath}.mdx`,
    `${candidatePath}.md`,
    path.join(candidatePath, 'index.mdx'),
    path.join(candidatePath, 'index.md'),
  ].filter(Boolean);

  return candidates.find(
    (filePath) =>
      MARKDOWN_FILE_PATTERN.test(filePath) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile(),
  );
}

function replaceComponentUsage(content, componentName, replacement, projection) {
  const escaped = escapeRegExp(componentName);
  const paired = new RegExp(
    `<${escaped}\\b(?<attrs>${JSX_ATTRS_PATTERN})>[\\s\\S]*?<\\/${escaped}\\s*>`,
    'g',
  );
  const selfClosing = new RegExp(
    `<${escaped}\\b(?<attrs>${JSX_ATTRS_PATTERN})\\s*\\/>`,
    'g',
  );
  const bare = new RegExp(`<${escaped}\\s*>`, 'g');
  const renderReplacement = (...args) => {
    const groups = args.at(-1);
    return applyComponentProps(
      replacement,
      parseStaticProps(groups?.attrs ?? '', projection),
    );
  };

  return content
    .replace(paired, renderReplacement)
    .replace(selfClosing, renderReplacement)
    .replace(bare, () => replacement);
}

function parseStaticProps(attrs, projection) {
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
    props.set(
      expressionMatch[1],
      getRuntimePropValueForAudit(expressionMatch[2], projection) ?? '',
    );
    expressionMatch = expressionPattern.exec(attrs);
  }

  return props;
}

function applyComponentProps(replacement, props) {
  return evaluateStaticPropConditionalsForAudit(
    renderHtmlProps(replacement, props),
    props,
  ).replace(
    /\{?props\.([A-Za-z0-9_]+)\}?/g,
    (_, name) => props.get(name) ?? '',
  );
}

function evaluateStaticPropConditionalsForAudit(value, props) {
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

function getRuntimePropValueForAudit(name, projection) {
  if (name === 'ag_platform') {
    return projection.platform ?? '';
  }

  if (name === 'ag_platform_label') {
    return getPlatformLabel(projection.platform ?? '');
  }

  if (name === 'ag_product') {
    return projection.product ?? '';
  }

  if (name === 'ag_product_label') {
    return getProductLabel(projection.product ?? '');
  }

  return '';
}

function renderHtmlProps(content, props) {
  const selfClosing = new RegExp(
    `<HTML\\b(?<attrs>${JSX_ATTRS_PATTERN})\\s*\\/>`,
    'g',
  );
  const paired = new RegExp(
    `<HTML\\b(?<attrs>${JSX_ATTRS_PATTERN})>[\\s\\S]*?<\\/HTML\\s*>`,
    'g',
  );
  const replaceHtml = (...args) => {
    const groups = args.at(-1);
    return readHtmlPropValue(groups?.attrs ?? '', props) ?? '';
  };

  return content.replace(selfClosing, replaceHtml).replace(paired, replaceHtml);
}

function readHtmlPropValue(attrs, props) {
  const propsExpression = /\bhtml\s*=\s*\{\s*props\.([A-Za-z0-9_]+)\s*}/.exec(
    attrs,
  );
  if (propsExpression) {
    return props.get(propsExpression[1]) ?? '';
  }

  return readAttribute(`<HTML ${attrs}>`, 'html');
}

function filterOrStripWrapper(content, componentName, options) {
  const openPattern = new RegExp(
    `<${escapeRegExp(componentName)}\\b[^>]*>`,
    'g',
  );
  let result = '';
  let cursor = 0;
  let matched = false;

  for (const match of content.matchAll(openPattern)) {
    const openTag = match[0];
    const openIndex = match.index ?? 0;
    if (openIndex < cursor) {
      continue;
    }

    const close = findMatchingComponentClose({
      componentName,
      content,
      fromIndex: openIndex,
    });

    if (!close) {
      continue;
    }

    matched = true;

    if (!options.dropOutsideWhenMatched) {
      result += content.slice(cursor, openIndex);
    }
    const inner = filterOrStripWrapper(
      content.slice(openIndex + openTag.length, close.start),
      componentName,
      options,
    );
    const shouldKeep = options.projectionValue
      ? shouldKeepProjectionTag(openTag, {
          attrName: options.attrName,
          projectionValue: options.projectionValue,
        })
      : (options.keepWithoutProjection ?? true);

    if (shouldKeep) {
      result += inner;
    }

    cursor = close.end;
  }

  if (!matched) {
    return content;
  }

  if (!options.dropOutsideWhenMatched) {
    result += content.slice(cursor);
  }

  const selfClosingPattern = new RegExp(
    `<${escapeRegExp(componentName)}\\b[^>]*/>`,
    'g',
  );
  return result.replace(selfClosingPattern, '');
}

function findMatchingComponentClose({ componentName, content, fromIndex }) {
  const tagPattern = new RegExp(
    `<\\/?${escapeRegExp(componentName)}\\b[^>]*\\/?>`,
    'g',
  );
  tagPattern.lastIndex = fromIndex;
  let depth = 0;

  for (const match of content.matchAll(tagPattern)) {
    const tag = match[0];
    const start = match.index ?? 0;
    const end = start + tag.length;

    if (tag.startsWith(`</${componentName}`)) {
      depth -= 1;
      if (depth === 0) {
        return { end, start };
      }
      continue;
    }

    if (!tag.endsWith('/>')) {
      depth += 1;
    }
  }

  return null;
}

function shouldKeepProjectionTag(tag, { attrName, projectionValue }) {
  const allowedValue = readAttribute(tag, attrName);
  const notAllowedValue = readAttribute(tag, 'notAllowed');

  if (allowedValue) {
    const normalizedProjection = normalizePlatformProjection(projectionValue);
    return parseListAttribute(allowedValue)
      .map(normalizePlatformProjection)
      .includes(normalizedProjection);
  }

  if (notAllowedValue) {
    const normalizedProjection = normalizePlatformProjection(projectionValue);
    return !parseListAttribute(notAllowedValue)
      .map(normalizePlatformProjection)
      .includes(normalizedProjection);
  }

  return true;
}

function readAttribute(tag, attrName) {
  const quoted = new RegExp(
    `${escapeRegExp(attrName)}\\s*=\\s*(['"])([\\s\\S]*?)\\1`,
  ).exec(tag);

  if (quoted) {
    return quoted[2];
  }

  const expression = new RegExp(
    `${escapeRegExp(attrName)}\\s*=\\s*\\{([\\s\\S]*?)\\}`,
  ).exec(tag);

  return expression?.[1] ?? null;
}

function parseListAttribute(raw) {
  return raw
    .replace(/[[\]{}'"]/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlatformProjection(platform) {
  const value = String(platform ?? '').trim();
  return PLATFORM_PROJECTION_ALIASES.get(value) ?? value;
}

function readObjectArrayAttribute(attrs, name) {
  const expression = readBalancedExpressionAttribute(attrs, name);
  if (!expression) {
    return [];
  }

  return [...expression.matchAll(/\{([^{}]*)\}/g)]
    .map((match) => parseObjectLiteralProperties(match[1]))
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

function parseObjectLiteralProperties(raw) {
  const props = {};
  const pattern =
    /\b([A-Za-z0-9_]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([A-Za-z0-9_./:#?&=%-]+))/g;
  let match = pattern.exec(raw);

  while (match) {
    props[match[1]] = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    match = pattern.exec(raw);
  }

  return props;
}

function expandVariables(content, variables) {
  return content.replace(
    /<(?<component>Vg|Vpd|Vpl)\b(?<attrs>[^>]*)\/>/g,
    (match, _component, _attrs, _offset, _source, groups) => {
      const key = readAttribute(match, 'k');
      const value = key ? variables[groups.component]?.[key] : null;
      return value ?? `[unsupported:${groups.component}.${key ?? 'unknown'}]`;
    },
  );
}

export function createContentFidelityRecords({ content, location, side }) {
  const normalizedContent = normalizeMdxSyntax(stripFrontmatter(content));
  const records = [];
  const paragraphLines = [];
  let paragraphStartLine = 1;
  let inCode = false;
  let codeFence = '';
  let codeLanguage = '';
  let codeLines = [];
  let codeStartLine = 1;
  const headingStack = [];
  const lines = normalizedContent.split('\n');

  function currentSection() {
    return headingStack.length > 0 ? headingStack.join(' > ') : '(root)';
  }

  function flushParagraph(currentLine) {
    if (paragraphLines.length === 0) {
      return;
    }

    const raw = paragraphLines.join(' ');
    const value = normalizeText(raw);

    if (value && !isIgnorableParagraphValue(value)) {
      records.push(
        createRecord({
          kind: 'paragraph',
          line: paragraphStartLine,
          location,
          raw,
          records,
          section: currentSection(),
          side,
          value,
        }),
      );
    }

    paragraphLines.length = 0;
    paragraphStartLine = currentLine;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const trimmed = line.trim();

    if (inCode) {
      if (trimmed.startsWith(codeFence)) {
        records.push(
          createRecord({
            kind: `code:${codeLanguage || 'text'}`,
            line: codeStartLine,
            location,
            raw: codeLines.join('\n'),
            records,
            section: currentSection(),
            side,
            value: normalizeCode(codeLines.join('\n')),
          }),
        );
        inCode = false;
        codeFence = '';
        codeLanguage = '';
        codeLines = [];
        continue;
      }

      codeLines.push(line);
      continue;
    }

    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})([^\n]*)/);
    if (fenceMatch) {
      flushParagraph(lineNumber);
      const fenceInfo = parseCodeFenceInfo(fenceMatch[2] ?? '');
      if (
        fenceInfo.tab &&
        !isFenceTabDuplicatedByFirstCodeComment({
          fence: fenceMatch[1],
          lines,
          startIndex: index + 1,
          tab: fenceInfo.tab,
        })
      ) {
        records.push(
          createRecord({
            kind: 'tab',
            line: lineNumber,
            location,
            raw: line,
            records,
            section: currentSection(),
            side,
            value: normalizeText(fenceInfo.tab),
          }),
        );
      }
      inCode = true;
      codeFence = fenceMatch[1];
      codeLanguage = normalizeCodeLanguage(fenceInfo.language || 'text');
      codeStartLine = lineNumber;
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph(lineNumber);
      continue;
    }

    const tabMatch = trimmed.match(/^@@TAB:(.+)$/);
    if (tabMatch) {
      flushParagraph(lineNumber);
      if (
        !isFollowingCodeFenceTabDuplicatedByComment({
          lines,
          startIndex: index + 1,
          tab: tabMatch[1],
        })
      ) {
        records.push(
          createRecord({
            kind: 'tab',
            line: lineNumber,
            location,
            raw: trimmed,
            records,
            section: currentSection(),
            side,
            value: normalizeText(tabMatch[1]),
          }),
        );
      }
      continue;
    }

    const calloutMatch = trimmed.match(
      /^:{3,}\s*([A-Za-z0-9_-]+)?(?:\[(.*?)\])?/,
    );
    if (calloutMatch) {
      flushParagraph(lineNumber);
      if (trimmed !== ':::') {
        records.push(
          createRecord({
            kind: 'callout',
            line: lineNumber,
            location,
            raw: trimmed,
            records,
            section: currentSection(),
            side,
            value: normalizeCalloutValue(calloutMatch[1], calloutMatch[2]),
          }),
        );
        const inlineBody = trimmed
          .slice(calloutMatch[0].length)
          .replace(/:{3,}\s*$/, '')
          .trim();
        const inlineValue = normalizeText(inlineBody);
        if (inlineValue) {
          records.push(
            createRecord({
              kind: 'paragraph',
              line: lineNumber,
              location,
              raw: inlineBody,
              records,
              section: currentSection(),
              side,
              value: inlineValue,
            }),
          );
        }
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(lineNumber);
      const level = headingMatch[1].length;
      headingStack.length = Math.max(0, level - 1);
      headingStack[level - 1] = normalizeText(headingMatch[2]);
      records.push(
        createRecord({
          kind: `heading:${level}`,
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          section: currentSection(),
          side,
          value: normalizeText(headingMatch[2]),
        }),
      );
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'image',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          section: currentSection(),
          side,
          value: normalizeText(imageMatch[1] || '[image]'),
        }),
      );
      continue;
    }

    if (isMarkdownTableRow(trimmed)) {
      if (isMarkdownTableSeparator(trimmed)) {
        continue;
      }

      const collected = collectMarkdownTableRow(lines, index);
      index = collected.nextIndex - 1;
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'table-row',
          line: lineNumber,
          location,
          raw: collected.row,
          records,
          section: currentSection(),
          side,
          value: normalizeTableRow(collected.row, { side }),
        }),
      );
      continue;
    }

    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'list-item',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          section: currentSection(),
          side,
          value: normalizeText(listMatch[2]),
        }),
      );
      continue;
    }

    if (isJsxOnlyLine(trimmed)) {
      flushParagraph(lineNumber);
      const unsupported = collectUnsupportedComponents(trimmed);

      for (const component of unsupported) {
        records.push(
          createRecord({
            kind: 'unsupported',
            line: lineNumber,
            location,
            raw: trimmed,
            records,
            section: currentSection(),
            side,
            value: component,
          }),
        );
      }
      continue;
    }

    if (paragraphLines.length === 0) {
      paragraphStartLine = lineNumber;
    }

    paragraphLines.push(line);
  }

  flushParagraph(lines.length + 1);
  return records;
}

function normalizeMdxSyntax(content) {
  let normalized = content.replace(/\r\n?/g, '\n');
  normalized = normalized.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const tableHeaders = parseExportedTableHeaders(normalized);
  normalized = normalizeMalformedLegacyTags(normalized);
  normalized = stripHiddenIndexSpansForAudit(normalized);
  normalized = normalizeLegacyHeadingComponents(normalized);
  normalized = normalizeLegacyInlineComponents(normalized);
  normalized = normalizeLegacyLandingComponents(normalized);
  normalized = normalizeLegacyTableCellCards(normalized);
  normalized = normalizeLegacyCardComponents(normalized);

  normalized = normalized.replace(
    /<Link\b([^>]*)>([\s\S]*?)<\/Link>/g,
    (_match, attrs, body) => {
      const href =
        readAttribute(`<Link ${attrs}>`, 'to') ??
        readAttribute(`<Link ${attrs}>`, 'href') ??
        '#';
      return `[${normalizePlainText(body).trim()}](${href})`;
    },
  );
  normalized = normalized.replace(/<Image\b([^>]*)\/>/g, (_match, attrs) => {
    const alt = readAttribute(`<Image ${attrs}>`, 'alt') ?? '';
    const src = readAttribute(`<Image ${attrs}>`, 'src') ?? '#';
    return `![${alt}](${src})`;
  });
  normalized = normalized.replace(
    /<Image\b([^>]*)>\s*<\/Image>/g,
    (_match, attrs) => {
      const alt = readAttribute(`<Image ${attrs}>`, 'alt') ?? '';
      const src = readAttribute(`<Image ${attrs}>`, 'src') ?? '#';
      return `![${alt}](${src})`;
    },
  );
  normalized = normalized.replace(/<img\b([^>]*)\/?>/gi, (_match, attrs) => {
    const alt = readAttribute(`<img ${attrs}>`, 'alt') ?? '';
    const src = readAttribute(`<img ${attrs}>`, 'src') ?? '#';
    return `![${alt}](${src})`;
  });
  normalized = normalized.replace(
    /<HTML\b[^>]*>([\s\S]*?)<\/HTML>/g,
    (_match, body) => body,
  );
  normalized = normalized.replace(/<HTML\b[^>]*\/>/g, '');
  normalized = normalized.replace(/<Admonition\b([^>]*)>/g, (_match, attrs) => {
    const type = readAttribute(`<Admonition ${attrs}>`, 'type') ?? 'note';
    const title = readAttribute(`<Admonition ${attrs}>`, 'title');
    return title
      ? `:::${mapAdmonitionType(type)}[${title}]`
      : `:::${mapAdmonitionType(type)}`;
  });
  normalized = normalized.replace(/<\/Admonition>/g, ':::');
  normalized = normalizeLegacyJsxTables(normalized, tableHeaders);
  normalized = normalizeLegacyHtmlTables(normalized);
  normalized = normalizeCategorizedApiMarkdownTables(normalized);
  normalized = normalized.replace(
    /<CodeBlock\b([^>]*)>\s*\{`([\s\S]*?)`}\s*<\/CodeBlock>/g,
    (_match, attrs, code) => {
      const language = readAttribute(`<CodeBlock ${attrs}>`, 'language') ?? '';
      return [`\`\`\`${language}`, decodeTemplateCode(code), '```'].join('\n');
    },
  );
  normalized = normalized.replace(
    /<TabItem\b([^>]*)>/g,
    (_match, attrs) =>
      `@@TAB:${readAttribute(`<TabItem ${attrs}>`, 'label') ?? readAttribute(`<TabItem ${attrs}>`, 'value') ?? 'tab'}`,
  );
  normalized = normalized.replace(/<\/TabItem>/g, '');
  normalized = normalized.replace(
    /<CodeBlockTab\b([^>]*)>/g,
    (_match, attrs) =>
      `@@TAB:${readAttribute(`<CodeBlockTab ${attrs}>`, 'value') ?? 'tab'}`,
  );
  normalized = normalized.replace(/<\/CodeBlockTab>/g, '');
  normalized = normalized.replace(
    /<CodeBlockTabsTrigger\b[^>]*>([\s\S]*?)<\/CodeBlockTabsTrigger>/g,
    (_match, body) => `@@TAB:${normalizePlainText(body).trim() || 'tab'}`,
  );
  normalized = normalized.replace(
    /<TabsTrigger\b[^>]*>([\s\S]*?)<\/TabsTrigger>/g,
    (_match, body) => `@@TAB:${normalizePlainText(body).trim() || 'tab'}`,
  );
  normalized = normalized.replace(
    /<Tab\b[^>]*>([\s\S]*?)<\/Tab>/g,
    (_match, body) => `@@TAB:${normalizePlainText(body).trim() || 'tab'}`,
  );
  normalized = normalized.replace(
    /<\/?(Tabs|TabsList|TabsContent)\b[^>]*>/g,
    '',
  );
  normalized = normalized.replace(
    /<\/?(CodeBlockTabs|CodeBlockTabsList)\b[^>]*>/g,
    '',
  );
  normalized = normalized.replace(/<\/?(Accordions|Accordion)\b[^>]*>/g, '');
  normalized = normalized.replace(/<Slot\b[^>]*\/>/g, '');
  normalized = normalized.replace(/<\/?Slot\b[^>]*>/g, '');
  normalized = normalized.replace(
    /<summary>([\s\S]*?)<\/summary>/g,
    (_match, body) => {
      return `**${normalizePlainText(body).trim()}**`;
    },
  );
  normalized = normalized.replace(/<\/?details>/g, '');
  normalized = stripExportConstBlocks(normalized);
  normalized = normalized.replace(/^export\s+const\s+.+$/gm, '');
  normalized = normalized.replace(
    /<\/?(PlatformStructured|PlatformInline)\b[^>]*>/g,
    '',
  );
  normalized = normalized.replace(
    /<\/?(ProductWrapper|PlatformWrapper)\b[^>]*>/g,
    '',
  );
  normalized = normalizeIndentedCodeFences(normalized);

  return normalized;
}

function isIgnorableParagraphValue(value) {
  return (
    value === '-' ||
    value === ';' ||
    value === '--- ---' ||
    /^export const TableHeader[A-Za-z0-9_]*\s*=/.test(value) ||
    /^\d+\.$/.test(value)
  );
}

function normalizeIndentedCodeFences(content) {
  const lines = content.split('\n');
  const output = [];
  let inFence = false;
  let fenceMarker = '';
  let fenceIndent = '';

  for (const line of lines) {
    if (!inFence) {
      const open = line.match(/^([ \t]{4,})(`{3,}|~{3,})(.*)$/);
      if (open) {
        inFence = true;
        fenceIndent = open[1];
        fenceMarker = open[2];
        output.push(`${open[2]}${open[3]}`);
        continue;
      }

      output.push(line);
      continue;
    }

    const unindented = line.startsWith(fenceIndent)
      ? line.slice(fenceIndent.length)
      : line.replace(/^[ \t]{1,4}/, '');
    output.push(unindented);

    if (unindented.trimStart().startsWith(fenceMarker)) {
      inFence = false;
      fenceMarker = '';
      fenceIndent = '';
    }
  }

  return output.join('\n');
}

function normalizeMalformedLegacyTags(content) {
  return content
    .replace(/<\s+(\/?)\s*(Table|Tr|Td|Th)\b/gi, '<$1$2')
    .replace(/<\/\s+(Table|Tr|Td|Th)\s*>/gi, '</$1>')
    .replace(/<\s*(\/?)\s*(Table|Tr|Td|Th)\s+>/gi, '<$1$2>');
}

function stripHiddenIndexSpansForAudit(content) {
  return content.replace(
    /<span\b([^>]*)>([\s\S]*?)<\/span>/g,
    (match, attrs) => {
      const className =
        readAttribute(`<x ${attrs}>`, 'className') ??
        readAttribute(`<x ${attrs}>`, 'class');
      if (!className?.split(/\s+/).some((item) => item.startsWith('index-'))) {
        return match;
      }

      return /display\s*:\s*['"]?none['"]?/.test(attrs) ? '' : match;
    },
  );
}

function normalizeLegacyHeadingComponents(content) {
  return content
    .replace(
      /^([ \t]*)<H([1-6])\b[^>]*>([^\n]*?)<\/H\2>([^\n]*)$/gm,
      (_match, indent, level, body, suffix) =>
        `${indent}${'#'.repeat(Number(level))} ${normalizeText(`${body}${suffix ?? ''}`)}`,
    )
    .replace(
      /^([ \t]*)<h([1-6])\b[^>]*>([^\n]*?)<\/h\2>([^\n]*)$/gm,
      (_match, indent, level, body, suffix) =>
        `${indent}${'#'.repeat(Number(level))} ${normalizeText(`${body}${suffix ?? ''}`)}`,
    );
}

function normalizeLegacyInlineComponents(content) {
  return content
    .replace(/<Text\b[^>]*>([\s\S]*?)<\/Text>/g, '$1')
    .replace(/<String\b[^>]*>([\s\S]*?)<\/String>/g, '$1')
    .replace(/<Object\b[^>]*>([\s\S]*?)<\/Object>/g, '$1');
}

function normalizeLegacyLandingComponents(content) {
  let normalized = content;

  normalized = normalized.replace(
    /<(?<name>ListPanelAV2|ListPanel)\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/\k<name>>/g,
    (_match, _name, _attrs, _body, _offset, _source, groups) =>
      renderLegacyPanelForAudit(groups.attrs, groups.body),
  );

  normalized = normalized.replace(
    /<LinkList\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/LinkList>/g,
    (_match, _attrs, _body, _offset, _source, groups) =>
      renderLegacyLinkListForAudit(groups.attrs, groups.body),
  );

  normalized = normalized.replace(
    /<QuickGuide\b(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/QuickGuide>/g,
    (_match, _attrs, _body, _offset, _source, groups) =>
      renderLegacyQuickGuideForAudit(groups.attrs, groups.body),
  );

  normalized = normalized.replace(
    /<QuickGuide\b(?<attrs>[^>]*)\/>/g,
    (_match, _attrs, _offset, _source, groups) =>
      renderLegacyQuickGuideForAudit(groups.attrs, ''),
  );

  normalized = normalized.replace(
    /<ImageGallery\b(?<attrs>[\s\S]*?)\/>/g,
    (_match, _attrs, _offset, _source, groups) =>
      renderImageGalleryForAudit(readObjectArrayAttribute(groups.attrs, 'list')),
  );

  return normalized.replace(
    /^[ \t]*<ListItem\b[^>]*>([\s\S]*?)<\/ListItem>[ \t]*$/gm,
    (_match, body) => `- ${normalizeText(body)}`,
  );
}

function normalizeLegacyCardComponents(content) {
  let normalized = content;

  normalized = normalized.replace(
    /<VersionSection\b([^>]*)>([\s\S]*?)<\/VersionSection>/g,
    (_match, attrs, body) => {
      const version = readAttribute(`<x ${attrs}>`, 'version') ?? normalizeText(body);
      return `\n## ${version}\n\n${body.trim()}\n`;
    },
  );
  normalized = normalized.replace(
    /<VersionTitle\b[^>]*>([\s\S]*?)<\/VersionTitle>/g,
    (_match, body) => `\n### ${normalizeText(body)}\n`,
  );
  normalized = normalized.replace(
    /<ListTitle\b[^>]*>([\s\S]*?)<\/ListTitle>/g,
    (_match, body) => `\n#### ${normalizeText(body)}\n`,
  );
  normalized = normalized.replace(
    /<ProductOverview\b[^>]*>([\s\S]*?)<\/ProductOverview>/g,
    (_match, body) => `\n${body.trim()}\n`,
  );
  normalized = normalized.replace(
    new RegExp(`<(?<name>${AUDIT_CARD_COMPONENT_NAMES})\\b(?<attrs>[\\s\\S]*?)>(?<body>[\\s\\S]*?)<\\/\\k<name>>`, 'g'),
    (_match, _name, _attrs, _body, _offset, _source, groups) =>
      renderCardForAudit(groups.attrs, groups.body),
  );
  normalized = normalized.replace(
    new RegExp(`<(?<name>${AUDIT_CARD_COMPONENT_NAMES})\\b(?<attrs>[\\s\\S]*?)\\/>`, 'g'),
    (_match, _name, _attrs, _offset, _source, groups) =>
      renderCardForAudit(groups.attrs, ''),
  );

  return normalized
    .replace(/<\/?(?:Row|Col|Cards|Detail)\b[^>]*>/g, '')
    .replace(/<\/ProductOverview>/g, '');
}

function normalizeLegacyTableCellCards(content) {
  const selfClosingPattern = new RegExp(
    `<(${AUDIT_CARD_COMPONENT_NAMES})\\b([^>]*)\\/>`,
    'g',
  );
  const pairedPattern = new RegExp(
    `<(${AUDIT_CARD_COMPONENT_NAMES})\\b([^>]*)>(.*?)<\\/\\1>`,
    'g',
  );

  return content
    .split('\n')
    .map((line) => {
      if (!isMarkdownTableRow(line) || !/<[A-Z][A-Za-z0-9]*\b/.test(line)) {
        return line;
      }

      return line
        .replace(pairedPattern, (_match, _name, attrs, body) =>
          renderInlineCardForAudit(attrs, body),
        )
        .replace(selfClosingPattern, (_match, _name, attrs) =>
          renderInlineCardForAudit(attrs),
        );
    })
    .join('\n');
}

function renderCardForAudit(attrs, body = '') {
  const { href, title } = readAuditCard(attrs, body);

  return href ? `\n- [${title}](${href})\n` : `\n- ${title}\n`;
}

function renderInlineCardForAudit(attrs, body = '') {
  const { href, title } = readAuditCard(attrs, body);

  return href ? `[${title}](${href})` : title;
}

function readAuditCard(attrs, body = '') {
  const title =
    readAttribute(`<x ${attrs}>`, 'title') ||
    readAttribute(`<x ${attrs}>`, 'text') ||
    readAttribute(`<x ${attrs}>`, 'fileName') ||
    normalizeText(body) ||
    readAttribute(`<x ${attrs}>`, 'href') ||
    readAttribute(`<x ${attrs}>`, 'fileLink') ||
    readAttribute(`<x ${attrs}>`, 'link') ||
    '#';
  const href =
    readAttribute(`<x ${attrs}>`, 'href') ??
    readAttribute(`<x ${attrs}>`, 'fileLink') ??
    readAttribute(`<x ${attrs}>`, 'link');

  return { href, title };
}

function renderLegacyPanelForAudit(attrs, body) {
  const title = readAttribute(`<x ${attrs}>`, 'title') ?? '';
  const description =
    readAttribute(`<x ${attrs}>`, 'desc') ??
    readAttribute(`<x ${attrs}>`, 'description');
  const image =
    readAttribute(`<x ${attrs}>`, 'img') ?? readAttribute(`<x ${attrs}>`, 'image');
  const links = readObjectArrayAttribute(attrs, 'links').length
    ? readObjectArrayAttribute(attrs, 'links')
    : readObjectArrayAttribute(attrs, 'href');
  const items = [...body.matchAll(/<ListItem\b[^>]*>([\s\S]*?)<\/ListItem>/g)]
    .map((match) => normalizeText(match[1]))
    .filter(Boolean);
  const lines = [];

  if (image) {
    lines.push(`![${title || 'image'}](${image})`, '');
  }

  if (title && description) {
    lines.push(`- **${title}**：${description}`);
  } else if (title || description) {
    lines.push(`- ${title || description}`);
  }

  lines.push(...items.map((item) => `  - ${item}`));
  lines.push(...links.map((link) => `  - [${link.title ?? link.href}](${link.href ?? '#'})`));

  return `\n${lines.join('\n')}\n`;
}

function renderLegacyLinkListForAudit(attrs, body) {
  const title = readAttribute(`<x ${attrs}>`, 'title') ?? '';
  const links = readObjectArrayAttribute(attrs, 'href').length
    ? readObjectArrayAttribute(attrs, 'href')
    : readObjectArrayAttribute(attrs, 'links');
  return [
    title ? `### ${title}` : '',
    body.trim(),
    ...links.map((link) => `- [${link.title ?? link.href}](${link.href ?? '#'})`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

function renderLegacyQuickGuideForAudit(attrs, body) {
  const image =
    readAttribute(`<x ${attrs}>`, 'img') ?? readAttribute(`<x ${attrs}>`, 'image');
  const title = readAttribute(`<x ${attrs}>`, 'title') ?? '';
  const links = readObjectArrayAttribute(attrs, 'href').length
    ? readObjectArrayAttribute(attrs, 'href')
    : readObjectArrayAttribute(attrs, 'links');
  return [
    image ? `![${title || 'guide'}](${image})` : '',
    body.trim(),
    ...links.map((link) => `- [${link.title ?? link.href}](${link.href ?? '#'})`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

function renderImageGalleryForAudit(items) {
  return items
    .map((item) => {
      const title = item.text ?? item.title ?? item.alt ?? 'image';
      const image = item.img ?? item.src ?? item.image;
      return image ? `![${title}](${image})\n\n- ${title}` : `- ${title}`;
    })
    .join('\n\n');
}

function normalizeLegacyJsxTables(content, tableHeaders = new Map()) {
  return content.replace(
      /<Table\b([^>]*)>([\s\S]*?)<\/Table>/g,
      (_match, attrs, body) => {
        if (!/<(?:Tr|Td)\b/.test(body)) {
          return _match;
        }

        const headerName = readAttribute(`<Table ${attrs}>`, 'header')?.trim();
        const header = headerName ? tableHeaders.get(headerName) : null;
        const rows = [
          ...body.matchAll(/<Tr\b[^>]*>([\s\S]*?)<\/Tr>/g),
        ].map((rowMatch) => {
          const cells = [
            ...rowMatch[1].matchAll(/<Td\b[^>]*>([\s\S]*?)<\/Td>/g),
          ].map((cellMatch) => normalizeText(cellMatch[1]).replace(/\|/g, '\\|'));
          return cells.length > 0 ? `| ${cells.join(' | ')} |` : '';
        });
        return [...(header ? [`| ${header.join(' | ')} |`] : []), ...rows]
          .filter(Boolean)
          .join('\n');
      },
    );
}

function normalizeLegacyHtmlTables(content) {
  return content.replace(/<(?:Table|table)\b[^>]*>([\s\S]*?)<\/(?:Table|table)>/g, (match, body) => {
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
    const rows = expandHtmlTableSpans(rawRows).filter((row) => row.length > 0);

    if (rows.length === 0) {
      return match;
    }

    if (
      !rows.some((row) => row.some((cell) => cell.kind === 'h')) &&
      isAuditImageOnlyHtmlTable(rows)
    ) {
      return rows
        .flatMap((row) => row.map((cell) => stripOptionalParagraphWrapper(cell.raw).trim()))
        .filter(Boolean)
        .join('\n\n');
    }

    return rows
      .map((row) => {
        const cells = row.map((cell) =>
          normalizeText(cell.raw).replace(/\|/g, '\\|'),
        );
        return `| ${cells.join(' | ')} |`;
      })
      .join('\n');
  });
}

function isAuditImageOnlyHtmlTable(rows) {
  return rows.every((row) =>
    row.every((cell) => {
      const raw = stripOptionalParagraphWrapper(cell.raw).trim();
      return /^!\[[^\]]*]\([^)]+\)$/.test(raw);
    }),
  );
}

function stripOptionalParagraphWrapper(value = '') {
  return value
    .trim()
    .replace(/^<p>\s*/i, '')
    .replace(/\s*<\/p>$/i, '');
}

function normalizeCategorizedApiMarkdownTables(content) {
  const lines = content.split('\n');
  const output = [];
  let index = 0;
  let inCodeFence = false;

  while (index < lines.length) {
    const line = lines[index];

    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) {
      inCodeFence = !inCodeFence;
      output.push(line);
      index += 1;
      continue;
    }

    if (
      !inCodeFence &&
      isMarkdownTableRow(line) &&
      isMarkdownTableSeparator(lines[index + 1] ?? '')
    ) {
      const tableLines = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        const collected = collectMarkdownTableRow(lines, index);
        tableLines.push(collected.row);
        index = collected.nextIndex;
      }

      const rendered = renderCategorizedApiTableForAudit(tableLines);
      output.push(rendered ?? tableLines.join('\n'));
      continue;
    }

    output.push(line);
    index += 1;
  }

  return output.join('\n');
}

function renderCategorizedApiTableForAudit(lines) {
  const header = splitMarkdownTableRow(lines[0]);
  const bodyRows = lines.slice(2).map((line) => splitMarkdownTableRow(line));

  if (
    header.length !== 2 ||
    bodyRows.some((row) => row.length > 2) ||
    !isApiListHeader(header[0]) ||
    !isCategoryHeader(header[1]) ||
    !bodyRows.some((row) => hasHtmlList(row[0] ?? '')) ||
    bodyRows.some((row) => hasHtmlList(row[1] ?? ''))
  ) {
    return null;
  }

  const items = [];

  for (const row of bodyRows) {
    const apiCell = row[0] ?? '';
    const category = normalizeText(row[1] ?? '');

    if (!apiCell.trim() || !category) {
      return null;
    }

    const apiListItems = extractInlineHtmlListItems(apiCell);
    if (apiListItems.length > 0) {
      items.push(
        [`- ${category}：`, ...apiListItems.map((item) => `  - ${item}`)].join(
          '\n',
        ),
      );
      continue;
    }

    const api = normalizeText(apiCell);
    if (!api) {
      return null;
    }
    items.push(`- ${category}：${api}`);
  }

  return items.join('\n');
}

function isApiListHeader(value = '') {
  return /^(?:api|apis|接口|方法|函数)$/.test(normalizeText(value).toLowerCase());
}

function isCategoryHeader(value = '') {
  return /(?:类型|分类|类别|type|category|kind)/.test(
    normalizeText(value).toLowerCase(),
  );
}

function hasHtmlList(value = '') {
  return /<\s*(?:ul|ol|li)\b/i.test(value);
}

function extractInlineHtmlListItems(value = '') {
  return [...value.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => normalizeText(match[1]))
    .filter(Boolean);
}

function readNumericAttribute(attrs, attrName) {
  const value = readAttribute(`<x ${attrs}>`, attrName);
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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

function parseExportedTableHeaders(content) {
  const tableHeaders = new Map();
  const exportPattern =
    /^[ \t]*export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)^[ \t]*]\s*;?\s*$/gm;
  const inlineExportPattern =
    /^[ \t]*export\s+const\s+([A-Za-z0-9_]+)\s*=\s*(\[[^\n]*])\s*;?\s*$/gm;
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

  exportMatch = inlineExportPattern.exec(content);

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

    exportMatch = inlineExportPattern.exec(content);
  }

  return tableHeaders;
}

function stripExportConstBlocks(content) {
  return content
    .replace(
      /^[ \t]*export\s+const\s+[A-Za-z0-9_]+\s*=\s*\[[^\n]*]\s*;?\s*$/gm,
      '',
    )
    .replace(
      /^[ \t]*export\s+const\s+[A-Za-z0-9_]+\s*=\s*\[[\s\S]*?^[ \t]*]\s*;?\s*$/gm,
      '',
    )
    .replace(
      /^[ \t]*export\s+const\s+[A-Za-z0-9_]+\s*=\s*\{[\s\S]*?^[ \t]*}\s*;?\s*$/gm,
      '',
    );
}

function isMarkdownTableSeparator(row) {
  return splitMarkdownTableRow(row)
    .filter(Boolean)
    .every((cell) => /^:?-+:?$/.test(cell));
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

  if (!trimmed) {
    return /^[-*+]\s+|\d+\.\s+/.test(nextLine.trim());
  }

  return (
    /^[-*+]\s+|\d+\.\s+/.test(trimmed) ||
    /^<\/?(?:ul|ol|li|p|Admonition|Detail|Tabs|TabItem|Table|table|Slot)\b/i.test(
      trimmed,
    ) ||
    /^:::+/.test(trimmed) ||
    /^ {2,}\S/.test(line) ||
    (trimmed.endsWith('|') && !isMarkdownTableRow(line))
  );
}

function mapAdmonitionType(type) {
  if (type === 'caution') {
    return 'warning';
  }

  if (type === 'danger') {
    return 'error';
  }

  if (type === 'deprecated') {
    return 'note';
  }

  return type || 'note';
}

function decodeTemplateCode(code) {
  return code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
}

function createRecord({
  kind,
  line,
  location,
  raw,
  records,
  section,
  side,
  value,
}) {
  return {
    hash: hashString(`${kind}\0${value}`),
    kind,
    line,
    location,
    order: records.length,
    raw,
    section,
    side,
    value,
  };
}

export function compareRecords({ sourceRecords, targetRecords }) {
  const targetBuckets = new Map();

  for (const record of targetRecords) {
    const key = recordKey(record);
    targetBuckets.set(key, [...(targetBuckets.get(key) ?? []), record]);
  }

  const exactMatches = [];
  let unmatchedSource = [];
  const matchedTargetIds = new Set();

  for (const sourceRecord of sourceRecords) {
    const bucket = targetBuckets.get(recordKey(sourceRecord)) ?? [];
    const targetRecord = takeExactTarget({
      bucket,
      matchedTargetIds,
      sourceRecord,
      targetRecords,
    });

    if (targetRecord) {
      exactMatches.push({
        source: sourceRecord,
        target: targetRecord,
      });
      matchedTargetIds.add(recordId(targetRecord));
      continue;
    }

    unmatchedSource.push(sourceRecord);
  }

  let unmatchedTarget = targetRecords.filter(
    (record) => !matchedTargetIds.has(recordId(record)),
  );
  const aggregatedListMatches = detectAggregatedListMatches({
    sourceRecords: unmatchedSource,
    targetRecords: unmatchedTarget,
  });
  const aggregatedSourceIds = new Set();

  for (const match of aggregatedListMatches) {
    exactMatches.push({
      source: match.source,
      target: match.targets[0],
    });
    aggregatedSourceIds.add(recordId(match.source));
    for (const target of match.targets) {
      matchedTargetIds.add(recordId(target));
    }
  }

  if (aggregatedListMatches.length > 0) {
    unmatchedSource = unmatchedSource.filter(
      (record) => !aggregatedSourceIds.has(recordId(record)),
    );
    unmatchedTarget = unmatchedTarget.filter(
      (record) => !matchedTargetIds.has(recordId(record)),
    );
  }

  const equivalentTextKindMatches = detectEquivalentTextKindMatches({
    sourceRecords: unmatchedSource,
    targetRecords: unmatchedTarget,
  });
  const equivalentSourceIds = new Set();

  for (const match of equivalentTextKindMatches) {
    exactMatches.push(match);
    equivalentSourceIds.add(recordId(match.source));
    matchedTargetIds.add(recordId(match.target));
  }

  if (equivalentTextKindMatches.length > 0) {
    unmatchedSource = unmatchedSource.filter(
      (record) => !equivalentSourceIds.has(recordId(record)),
    );
    unmatchedTarget = unmatchedTarget.filter(
      (record) => !matchedTargetIds.has(recordId(record)),
    );
  }

  const equivalentLabelMatches = detectEquivalentStructuralLabelMatches({
    sourceRecords: unmatchedSource,
    targetRecords: unmatchedTarget,
  });
  const equivalentLabelSourceIds = new Set();

  for (const match of equivalentLabelMatches) {
    exactMatches.push(match);
    equivalentLabelSourceIds.add(recordId(match.source));
    matchedTargetIds.add(recordId(match.target));
  }

  if (equivalentLabelMatches.length > 0) {
    unmatchedSource = unmatchedSource.filter(
      (record) => !equivalentLabelSourceIds.has(recordId(record)),
    );
    unmatchedTarget = unmatchedTarget.filter(
      (record) => !matchedTargetIds.has(recordId(record)),
    );
  }

  const changed = [];
  const changedSourceIds = new Set();
  const changedTargetIds = new Set();

  for (const sourceRecord of unmatchedSource) {
    const candidate = findBestChangedCandidate({
      sourceRecord,
      targetRecords: unmatchedTarget.filter(
        (record) => !changedTargetIds.has(recordId(record)),
      ),
    });

    if (!candidate) {
      continue;
    }

    changed.push({
      similarity: candidate.similarity,
      source: summarizeRecord(sourceRecord),
      target: summarizeRecord(candidate.record),
    });
    changedSourceIds.add(recordId(sourceRecord));
    changedTargetIds.add(recordId(candidate.record));
  }

  const unresolvedSource = unmatchedSource.filter(
    (record) => !changedSourceIds.has(recordId(record)),
  );
  const unresolvedTarget = unmatchedTarget.filter(
    (record) => !changedTargetIds.has(recordId(record)),
  );
  const unsupported = [...unresolvedSource, ...unresolvedTarget]
    .filter((record) => record.kind === 'unsupported')
    .map(summarizeRecord);
  const missing = unresolvedSource
    .filter((record) => record.kind !== 'unsupported')
    .map(summarizeRecord);
  const extra = unresolvedTarget
    .filter((record) => record.kind !== 'unsupported')
    .map(summarizeRecord);
  const moved = detectMovedRecords(
    exactMatches
      .filter(
        (match) =>
          match.source.kind !== 'tab' &&
          match.target.kind !== 'tab' &&
          !isSyntheticTextKindMatch(match),
      )
      .sort(
        (left, right) =>
          left.source.order - right.source.order ||
          left.target.order - right.target.order,
      ),
  ).map((match) => ({
    source: summarizeRecord(match.source),
    target: summarizeRecord(match.target),
  }));

  return {
    findings: {
      changed,
      extra,
      missing,
      moved,
      unsupported,
    },
    matches: {
      exact: exactMatches.length,
    },
  };
}

function detectEquivalentTextKindMatches({ sourceRecords, targetRecords }) {
  const matches = [];
  const usedTargetIds = new Set();
  const targetBuckets = new Map();

  for (const target of targetRecords) {
    if (!isTextEquivalentKind(target.kind)) {
      continue;
    }

    const key = textEquivalentKey(target);
    targetBuckets.set(key, [...(targetBuckets.get(key) ?? []), target]);
  }

  for (const source of sourceRecords) {
    if (!isTextEquivalentKind(source.kind)) {
      continue;
    }

    const bucket = targetBuckets.get(textEquivalentKey(source)) ?? [];
    const target = bucket.find(
      (candidate) =>
        candidate.kind !== source.kind &&
        !usedTargetIds.has(recordId(candidate)),
    );

    if (!target) {
      continue;
    }

    matches.push({ source, target });
    usedTargetIds.add(recordId(target));
  }

  return matches;
}

function isSyntheticTextKindMatch(match) {
  return (
    match.source.kind !== match.target.kind &&
    isTextEquivalentKind(match.source.kind) &&
    isTextEquivalentKind(match.target.kind) &&
    match.source.section === match.target.section &&
    comparableRecordValue(match.source.value) ===
      comparableRecordValue(match.target.value)
  );
}

function takeExactTarget({
  bucket,
  matchedTargetIds,
  sourceRecord,
  targetRecords,
}) {
  const sameSectionIndex = bucket.findIndex(
    (target) =>
      target.section === sourceRecord.section &&
      !matchedTargetIds.has(recordId(target)),
  );

  if (sameSectionIndex !== -1) {
    return bucket.splice(sameSectionIndex, 1)[0];
  }

  if (
    hasSameSectionTextEquivalentCandidate({
      matchedTargetIds,
      sourceRecord,
      targetRecords,
    })
  ) {
    return null;
  }

  while (bucket.length > 0) {
    const target = bucket.shift();
    if (!matchedTargetIds.has(recordId(target))) {
      return target;
    }
  }

  return null;
}

function hasSameSectionTextEquivalentCandidate({
  matchedTargetIds,
  sourceRecord,
  targetRecords,
}) {
  if (!isTextEquivalentKind(sourceRecord.kind)) {
    return false;
  }

  return targetRecords.some(
    (target) =>
      !matchedTargetIds.has(recordId(target)) &&
      target.section === sourceRecord.section &&
      comparableRecordValue(target.value) ===
        comparableRecordValue(sourceRecord.value) &&
      target.kind !== sourceRecord.kind &&
      isTextEquivalentKind(target.kind),
  );
}

function isTextEquivalentKind(kind) {
  return kind === 'paragraph' || kind === 'list-item';
}

function textEquivalentKey(record) {
  return `${record.section}\0${comparableRecordValue(record.value)}`;
}

function detectEquivalentStructuralLabelMatches({ sourceRecords, targetRecords }) {
  const matches = [];
  const usedTargetIds = new Set();

  for (const source of sourceRecords) {
    if (!isStructuralLabelKind(source.kind)) {
      continue;
    }

    const target = targetRecords.find(
      (candidate) =>
        isEquivalentStructuralLabelPair(source, candidate) &&
        !usedTargetIds.has(recordId(candidate)),
    );

    if (!target) {
      continue;
    }

    matches.push({ source, target });
    usedTargetIds.add(recordId(target));
  }

  return matches;
}

function isEquivalentStructuralLabelPair(left, right) {
  if (!isStructuralLabelKind(right.kind) || left.value !== right.value) {
    return false;
  }

  if (left.kind === right.kind) {
    return false;
  }

  return (
    structuralLabelParentSection(left) === structuralLabelParentSection(right)
  );
}

function isStructuralLabelKind(kind) {
  return kind === 'tab' || kind.startsWith('heading:');
}

function structuralLabelParentSection(record) {
  const suffix = ` > ${record.value}`;
  return record.section.endsWith(suffix)
    ? record.section.slice(0, -suffix.length)
    : record.section;
}

function detectAggregatedListMatches({ sourceRecords, targetRecords }) {
  const matches = [];
  const usedTargetIds = new Set();

  for (const source of sourceRecords) {
    if (!isAggregatableSourceRecord(source)) {
      continue;
    }

    const match = findAggregatedListMatch({
      source,
      targetRecords,
      usedTargetIds,
    });

    if (!match) {
      continue;
    }

    matches.push(match);
    for (const target of match.targets) {
      usedTargetIds.add(recordId(target));
    }
  }

  return matches;
}

function isHtmlListParagraph(record) {
  return /<\/?(?:ul|ol|li)\b/i.test(record.raw);
}

function isAggregatableParagraph(record) {
  return isHtmlListParagraph(record) || /<br\s*\/?>/i.test(record.raw);
}

function isAggregatableSourceRecord(record) {
  return (
    (record.kind === 'paragraph' && isAggregatableParagraph(record)) ||
    record.kind === 'list-item'
  );
}

function findAggregatedListMatch({ source, targetRecords, usedTargetIds }) {
  const requiresListItem =
    source.kind === 'list-item' || isHtmlListParagraph(source);

  for (let startIndex = 0; startIndex < targetRecords.length; startIndex += 1) {
    const first = targetRecords[startIndex];
    if (
      !isAggregateTextKind(first.kind) ||
      first.section !== source.section ||
      usedTargetIds.has(recordId(first))
    ) {
      continue;
    }

    const targets = [];
    let hasListItem = false;
    for (let index = startIndex; index < targetRecords.length; index += 1) {
      const target = targetRecords[index];
      if (
        !isAggregateTextKind(target.kind) ||
        target.section !== source.section ||
        usedTargetIds.has(recordId(target))
      ) {
        break;
      }

      targets.push(target);
      hasListItem = hasListItem || target.kind === 'list-item';
      const aggregate = normalizeText(
        targets.map((record) => record.value).join(' '),
      );

      if (
        targets.length > 1 &&
        (!requiresListItem || hasListItem) &&
        aggregate === source.value
      ) {
        return {
          source,
          targets: [...targets],
        };
      }

      if (aggregate.length > source.value.length + 20) {
        break;
      }
    }
  }

  return null;
}

function isAggregateTextKind(kind) {
  return kind === 'paragraph' || kind === 'list-item';
}

function findBestChangedCandidate({ sourceRecord, targetRecords }) {
  let best = null;

  for (const targetRecord of targetRecords) {
    if (targetRecord.kind !== sourceRecord.kind) {
      continue;
    }

    const similarity = recordSimilarity(sourceRecord, targetRecord);
    const adjustedSimilarity = boostStructuredSimilarity({
      similarity,
      sourceRecord,
      targetRecord,
    });

    if (adjustedSimilarity < 0.55) {
      continue;
    }

    if (!best || adjustedSimilarity > best.similarity) {
      best = {
        record: targetRecord,
        similarity: adjustedSimilarity,
      };
    }
  }

  return best;
}

function boostStructuredSimilarity({ similarity, sourceRecord, targetRecord }) {
  if (
    sourceRecord.kind.startsWith('code:') &&
    sourceRecord.kind === targetRecord.kind &&
    sourceRecord.section === targetRecord.section
  ) {
    return Math.max(similarity, 0.7);
  }

  return similarity;
}

function recordSimilarity(left, right) {
  if (left.value === right.value) {
    return 1;
  }

  const leftTokens = new Set(tokenizeForSimilarity(left.value));
  const rightTokens = new Set(tokenizeForSimilarity(right.value));
  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );
  const union = new Set([...leftTokens, ...rightTokens]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.length / union.size;
}

function tokenizeForSimilarity(value) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((token) => token.length > 1);
}

function detectMovedRecords(matches) {
  const targetOrders = matches.map((match) => match.target.order);
  const keepIndexes = new Set(
    longestIncreasingSubsequenceIndexes(targetOrders),
  );

  return matches.filter((_match, index) => !keepIndexes.has(index));
}

function longestIncreasingSubsequenceIndexes(values) {
  const piles = [];
  const predecessors = new Array(values.length).fill(-1);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    let low = 0;
    let high = piles.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);

      if (values[piles[mid]] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    if (low > 0) {
      predecessors[index] = piles[low - 1];
    }

    piles[low] = index;
  }

  const result = [];
  let current = piles[piles.length - 1];

  while (current !== undefined && current !== -1) {
    result.push(current);
    current = predecessors[current];
  }

  return result.reverse();
}

function normalizeTableRow(row, { side } = {}) {
  const cells = splitMarkdownTableRow(row)
    .map((cell) => normalizeTableCellText(cell))
    .filter(Boolean);
  const visibleCells =
    side === 'new' && cells.some((cell) => !isSyntheticColumnPlaceholder(cell))
      ? cells.filter((cell) => !isSyntheticColumnPlaceholder(cell))
      : cells;

  return visibleCells.join(' | ');
}

function isSyntheticColumnPlaceholder(cell) {
  return /^Column\s+\d+$/i.test(cell);
}

function normalizeTableCellText(cell) {
  const withoutListMarkers = normalizeText(cell)
    .replace(/(^|[\s:：。；，])[-*+]\s+(?=\S)/g, '$1')
    .replace(/(^|[\s:：。；，])[-*+](?=[:：])/g, '$1')
    .replace(/(^|[\s:：。；，])\d+\.\s*(?=\S)/g, '$1')
    .replace(/包括[-*+]\s*/g, '包括')
    .replace(/:::info/g, ':::note')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizeCjkSpacing(withoutListMarkers);
}

function splitMarkdownTableRow(row) {
  const trimmed = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cell = '';
  let escaped = false;
  let inCodeSpan = false;

  for (const char of trimmed) {
    if (escaped) {
      cell += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      cell += char;
      continue;
    }

    if (char === '`') {
      inCodeSpan = !inCodeSpan;
      cell += char;
      continue;
    }

    if (char === '|') {
      if (inCodeSpan) {
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

function normalizeCodeLanguage(language) {
  const normalized = String(language || 'text').toLowerCase();
  return CODE_LANG_ALIASES.get(normalized) ?? normalized;
}

function parseCodeFenceInfo(info) {
  const trimmed = info.trim();
  const language = trimmed.split(/\s+/)[0] ?? '';
  const tab =
    /\btab\s*=\s*(['"])(.*?)\1/.exec(trimmed)?.[2] ??
    /\btab\s*=\s*([^\s"']+)/.exec(trimmed)?.[1] ??
    null;

  return { language, tab };
}

function isFenceTabDuplicatedByFirstCodeComment({
  fence,
  lines,
  startIndex,
  tab,
}) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();

    if (trimmed.startsWith(fence)) {
      return false;
    }

    if (!trimmed) {
      continue;
    }

    const commentLabel = readLeadingCommentLabel(trimmed);
    if (!commentLabel) {
      continue;
    }

    const normalizedComment = normalizeText(commentLabel);
    const normalizedTab = normalizeText(tab);
    if (
      normalizedComment === normalizedTab ||
      normalizedComment.endsWith(normalizedTab)
    ) {
      return true;
    }
  }

  return false;
}

function isFollowingCodeFenceTabDuplicatedByComment({ lines, startIndex, tab }) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      continue;
    }

    const fenceMatch = lines[index].match(/^ {0,3}(`{3,}|~{3,})([^\n]*)/);
    if (!fenceMatch) {
      return false;
    }

    return isFenceTabDuplicatedByFirstCodeComment({
      fence: fenceMatch[1],
      lines,
      startIndex: index + 1,
      tab,
    });
  }

  return false;
}

function readLeadingCommentLabel(line) {
  return (
    /^\/\/\s*(.+)$/.exec(line)?.[1] ??
    /^#\s*(.+)$/.exec(line)?.[1] ??
    /^--\s*(.+)$/.exec(line)?.[1] ??
    /^\/\*\s*(.*?)\s*\*\/$/.exec(line)?.[1] ??
    /^<!--\s*(.*?)\s*-->$/.exec(line)?.[1] ??
    null
  );
}

function normalizeText(value) {
  return normalizeCjkSpacing(normalizePlainText(value).replace(/\s+/g, ' '))
    .replace(/包括[-*+]\s*/g, '包括')
    .replace(/包括：/g, '包括');
}

function normalizePlainText(value) {
  const bitshiftLeft = '\uE000';
  const bitshiftRight = '\uE001';
  const withEntities = value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*123;|&lcub;/gi, '{')
    .replace(/&#0*125;|&rcub;/gi, '}')
    .replace(/&#0*124;/g, '|')
    .replace(/<sup\b[^>]*>\s*([\s\S]*?)\s*<\/sup>/gi, '$1')
    .replace(/<</g, bitshiftLeft)
    .replace(/>>/g, bitshiftRight);
  const withSplitGenericCode = withEntities.replace(
    /([A-Za-z][A-Za-z0-9_]*)`<([^<>\n]+)>`/g,
    '$1<$2>',
  );
  const genericSafe = withSplitGenericCode.replace(
    /\b([A-Z][A-Za-z0-9_.$]*)<([A-Z][^<>\n/]*)>/g,
    (_match, name, params) => `${name}‹${params}›`,
  );

  return stripMarkdownLinks(
    genericSafe
    .replace(/<[^>]+>/g, ' ')
      .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1'),
  )
    .replace(/\\\|/g, '|')
    .replace(/\s*:::\s*/g, ':::')
    .replace(/[`*_{}[\]]/g, '')
    .replace(new RegExp(bitshiftLeft, 'g'), '<<')
    .replace(new RegExp(bitshiftRight, 'g'), '>>')
    .replace(/‹/g, '<')
    .replace(/›/g, '>');
}

function stripMarkdownLinks(value) {
  let output = '';
  let index = 0;

  while (index < value.length) {
    if (value[index] !== '[' || value[index - 1] === '!') {
      output += value[index] ?? '';
      index += 1;
      continue;
    }

    const closeBracket = findClosingMarkdownBracket(value, index);
    if (closeBracket === -1 || value[closeBracket + 1] !== '(') {
      output += value[index];
      index += 1;
      continue;
    }

    const closeParen = findClosingMarkdownDestination(value, closeBracket + 1);
    if (closeParen === -1) {
      output += value[index];
      index += 1;
      continue;
    }

    output += stripMarkdownLinks(value.slice(index + 1, closeBracket));
    index = closeParen + 1;
  }

  return output;
}

function findClosingMarkdownBracket(value, openIndex) {
  let depth = 0;
  let escaped = false;

  for (let index = openIndex; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '[') {
      depth += 1;
      continue;
    }

    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function findClosingMarkdownDestination(value, openIndex) {
  let depth = 0;
  let escaped = false;

  for (let index = openIndex; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '(') {
      depth += 1;
      continue;
    }

    if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function normalizeCjkSpacing(value) {
  return value
    .trim()
    .replace(/,\s+(?=\.[A-Za-z_])/g, ',')
    .replace(
      /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\s+([\p{Script=Han}])/gu,
      '$1$2',
    )
    .replace(/([A-Za-z0-9_.$>)\]/])\s+([\p{Script=Han}])/gu, '$1$2')
    .replace(/([\p{Script=Han}])\s+([A-Za-z0-9_.$(<\[])/gu, '$1$2')
    .replace(/([\p{Script=Han}])\s+([\p{Script=Han}])/gu, '$1$2')
    .replace(/([\p{Script=Han}])\s+([①-⑳])/gu, '$1$2')
    .replace(/\s+([:：])/gu, '$1')
    .replace(/([:：])\s+/gu, '$1')
    .replace(/（\s*\|\s*）/gu, '（|）')
    .replace(
      /([\p{Script=Han}])\s+([a-z0-9]+(?:-[a-z0-9]+)+)/gu,
      '$1$2',
    )
    .replace(
      /([a-z0-9]+(?:-[a-z0-9]+)+)\s+([\p{Script=Han}])/gu,
      '$1$2',
    )
    .replace(/\s+([，。！？；：、）】》])/gu, '$1')
    .replace(/\s+([（【《])/gu, '$1')
    .replace(/([）】》])\s+([\p{Script=Han}A-Za-z0-9])/gu, '$1$2')
    .replace(/([，。！？；：、])\s+([\p{Script=Han}A-Za-z0-9（【《])/gu, '$1$2')
    .replace(/([（【《])\s+/gu, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+([A-Za-z0-9_.#-]+)\s+\)/gu, '($1)')
    .replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s+(\d+\/\d+)\b/gu, '$1$2')
    .replace(/([A-Za-z0-9])\s+([，。！？；：、])/gu, '$1$2')
    .replace(/\s+[-*+]$/gu, '');
}

function normalizeCalloutValue(type, title) {
  const normalizedType =
    type === 'info' || type === 'tips' ? 'note' : (type ?? 'note');
  const normalizedTitle = normalizeText(title ?? '');

  if (
    !normalizedTitle ||
    normalizedTitle.toLowerCase() === normalizedType.toLowerCase() ||
    normalizedTitle.toLowerCase() === 'information'
  ) {
    return normalizedType;
  }

  return `${normalizedType} ${normalizedTitle}`;
}

function normalizeCode(value) {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const trimmedLines = trimBlankEdges(lines).map((line) => line.trimEnd());
  const commonIndent = getCommonIndent(trimmedLines);

  return trimmedLines
    .map((line) => line.slice(Math.min(commonIndent, leadingSpaces(line))))
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function trimBlankEdges(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && !lines[start].trim()) {
    start += 1;
  }

  while (end > start && !lines[end - 1].trim()) {
    end -= 1;
  }

  return lines.slice(start, end);
}

function getCommonIndent(lines) {
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => leadingSpaces(line));

  return indents.length > 0 ? Math.min(...indents) : 0;
}

function leadingSpaces(line) {
  return line.match(/^ */)?.[0].length ?? 0;
}

function isJsxOnlyLine(trimmed) {
  return /^<\/?[A-Z][^>]*>$/.test(trimmed);
}

function collectUnsupportedComponents(line) {
  return [...line.matchAll(/<\/?([A-Z][A-Za-z0-9_.]*)\b/g)]
    .map((match) => match[1].split('.')[0])
    .filter((component) => !KNOWN_STRUCTURAL_COMPONENTS.has(component));
}

function summarizeRecord(record) {
  return {
    excerpt: record.value.slice(0, 180),
    hash: record.hash,
    kind: record.kind,
    line: record.line,
    location: record.location,
    order: record.order,
    section: record.section,
    side: record.side,
  };
}

function recordKey(record) {
  return `${record.kind}\0${comparableRecordValue(record.value, record.kind)}`;
}

function comparableRecordValue(value, kind) {
  if (kind === 'code:text' && looksLikeMarkdownDocumentCode(value)) {
    return normalizeText(value);
  }

  const normalized = value
    .replace(/[。.]$/u, '')
    .replace(/^(?:---\s+)+/, '')
    .replace(/^js\s+\/\//, 'javascript //')
    .replace(/\\\|/g, '|')
    .replace(/\s*\((?:Gitee|GitHub)(?:,\s*(?:Gitee|GitHub))*\)/g, '')
    .replace(/\b([a-z0-9_]+)\s+([A-Za-z][A-Za-z0-9_]*[A-Z][A-Za-z0-9_]*)\b/g, '$1$2')
    .replace(/['"]([A-Za-z0-9_./<>-]+)['"]/g, '$1');

  return normalizeCjkSpacing(normalized);
}

function looksLikeMarkdownDocumentCode(value) {
  return (
    /^#{1,6}\s+/m.test(value) ||
    /^\s*[-*]\s+\[[^\]]+\]\([^)]+\)/m.test(value) ||
    /<a\s+id=/i.test(value)
  );
}

function recordId(record) {
  return `${record.side}\0${record.location}\0${record.order}\0${record.kind}\0${record.hash}`;
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function stripMarkdownCode(content) {
  const withoutFences = [];
  let inFence = false;

  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (!inFence) {
      withoutFences.push(line);
    }
  }

  return withoutFences.join('\n').replace(/`[^`\n]*`/g, '');
}

function addResidue(residue, kind) {
  residue.set(kind, (residue.get(kind) ?? 0) + 1);
}

function hashString(value) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderMarkdownReport(report) {
  const lines = [
    '# Single Document Content Fidelity Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Old source: \`${report.page.oldPath}\``,
    `New source: \`${report.page.newPath}\``,
    `Old URL: ${report.page.oldUrl ?? '(not provided)'}`,
    `New URL: ${report.page.newUrl ?? '(not provided)'}`,
    `Projection: product=\`${report.page.projection.product ?? 'all'}\`, platform=\`${report.page.projection.platform ?? 'all'}\``,
    '',
    '## Summary',
    '',
    `- Source records: ${report.summary.sourceRecords}`,
    `- Target records: ${report.summary.targetRecords}`,
    `- Exact matches: ${report.summary.exactMatches}`,
    `- Missing: ${report.summary.missing}`,
    `- Extra: ${report.summary.extra}`,
    `- Changed: ${report.summary.changed}`,
    `- Moved: ${report.summary.moved}`,
    `- Unsupported: ${report.summary.unsupported}`,
    `- Legacy residue: ${formatLegacyResidueSummary(report.findings.legacyResidue)}`,
    `- Unresolved differences: ${report.summary.unresolvedDifferences}`,
    '',
  ];

  for (const key of ['missing', 'extra', 'changed', 'moved', 'unsupported']) {
    renderFindingSection(lines, key, report.findings[key]);
  }

  while (lines.at(-1) === '') {
    lines.pop();
  }

  return `${lines.join('\n')}\n`;
}

/**
 * @param {{
 *   includeAudited?: boolean;
 *   limit?: number;
 *   outDir?: string;
 *   pathMap?: string;
 *   repoRoot?: string;
 *   sourceRoot?: string;
 *   targetRoot?: string;
 * }} [options]
 */
export async function auditCompletedMigrationRows({
  includeAudited = false,
  limit = 0,
  outDir = 'docs/migration/generated/completed-audit',
  pathMap = 'docs/migration/path-map.csv',
  repoRoot = process.cwd(),
  sourceRoot,
  targetRoot = process.cwd(),
} = {}) {
  if (!sourceRoot) {
    throw new Error('--source-root is required when auditing from --path-map.');
  }

  const pathMapPath = path.resolve(repoRoot, pathMap);
  const table = ensureControlProgressColumns(
    await readControlTable(pathMapPath),
  );
  const rowsReadyForAudit = selectRowsReadyForAudit(table, {
    includeAudited,
  }).filter((row) => row.source_path && row.target_path);
  const selectedRows =
    limit > 0 ? rowsReadyForAudit.slice(0, limit) : rowsReadyForAudit;
  const resolvedOutDir = path.resolve(repoRoot, outDir);
  const results = [];

  await fsPromises.mkdir(resolvedOutDir, { recursive: true });

  for (const row of selectedRows) {
    const sourcePath = row.source_path;
    const targetPath = row.target_path;
    const reportPrefix = path.join(
      resolvedOutDir,
      safeReportStem(
        `${sourcePath}__${row.old_platform || 'all'}__${hashString(row.old_url ?? '')}__to__${targetPath}`,
      ),
    );

    try {
      const report = auditSingleDocContentFidelity({
        oldPath: path.resolve(sourceRoot, sourcePath),
        newPath: path.resolve(targetRoot, targetPath),
        platform:
          row.old_platform || inferPlatformForAudit({ sourcePath, targetPath }),
        product: inferProductFromSourcePath(sourcePath),
        sourceRoot,
      });
      const paths = writeReport(report, reportPrefix);

      results.push({
        auditProgress: 'completed',
        auditResult: getAuditResult(report),
        jsonPath: paths.jsonPath,
        legacyResidue: report.summary.legacyResidue,
        markdownPath: paths.markdownPath,
        oldPlatform: row.old_platform || null,
        oldUrl: row.old_url || null,
        sourcePath,
        summary: report.summary,
        targetPath,
      });
    } catch (error) {
      const paths = await writeAuditErrorReport({
        error,
        reportPrefix,
        sourcePath,
        targetPath,
      });

      results.push({
        auditProgress: 'failed',
        auditResult: `error:${error.message}`,
        jsonPath: paths.jsonPath,
        markdownPath: paths.markdownPath,
        oldPlatform: row.old_platform || null,
        oldUrl: row.old_url || null,
        sourcePath,
        targetPath,
      });
    }
  }

  const report = createBatchAuditReport({
    outDir: resolvedOutDir,
    pathMapPath,
    results,
    rowsReadyForAudit,
    sourceRoot,
    targetRoot,
  });
  const aggregateJsonPath = path.join(resolvedOutDir, 'report.json');
  const aggregateMarkdownPath = path.join(resolvedOutDir, 'report.md');
  await fsPromises.writeFile(
    aggregateJsonPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
  await fsPromises.writeFile(
    aggregateMarkdownPath,
    renderBatchAuditMarkdownReport(report),
    'utf8',
  );

  await updateAuditProgressInPathMap({
    pathMapPath,
    repoRoot,
    results,
  });

  return report;
}

function renderFindingSection(lines, key, findings) {
  lines.push(`## ${titleCase(key)} (${findings.length})`, '');

  if (findings.length === 0) {
    lines.push('- None', '');
    return;
  }

  for (const finding of findings) {
    if (finding.source && finding.target) {
      lines.push(
        `- ${formatRecordSummary(finding.source)}`,
        `  - target: ${formatRecordSummary(finding.target)}`,
        finding.similarity
          ? `  - similarity: ${finding.similarity.toFixed(2)}`
          : null,
      );
      continue;
    }

    lines.push(`- ${formatRecordSummary(finding)}`);
  }

  lines.push('');
}

function formatRecordSummary(record) {
  return `\`${record.side}:${record.kind}\` ${record.section} @ ${record.line} ${JSON.stringify(record.excerpt)}`;
}

function formatLegacyResidueSummary(legacyResidue) {
  if (!legacyResidue?.total) {
    return 'none';
  }

  return `${legacyResidue.total} issue(s); examples: ${legacyResidue.examples
    .map((example) => `\`${example}\``)
    .join(', ')}`;
}

function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function getAuditResult(report) {
  if (report.summary.legacyResidue > 0) {
    return `legacy-residue:${report.summary.legacyResidue}`;
  }

  if (report.summary.unresolvedDifferences > 0) {
    return `differences:${report.summary.unresolvedDifferences}`;
  }

  return 'pass';
}

function createBatchAuditReport({
  outDir,
  pathMapPath,
  results,
  rowsReadyForAudit,
  sourceRoot,
  targetRoot,
}) {
  const passed = results.filter(
    (result) => result.auditResult === 'pass',
  ).length;
  const failed = results.filter(
    (result) => result.auditProgress === 'failed',
  ).length;
  const differences = results.filter((result) =>
    result.auditResult?.startsWith('differences:'),
  ).length;
  const legacyResidue = results.filter((result) =>
    result.auditResult?.startsWith('legacy-residue:'),
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    outDir,
    pathMapPath,
    results,
    sourceRoot,
    summary: {
      auditedRows: results.length,
      differences,
      eligibleRows: rowsReadyForAudit.length,
      failed,
      legacyResidue,
      passed,
    },
    targetRoot,
  };
}

function renderBatchAuditMarkdownReport(report) {
  const lines = [
    '# Completed Migration Audit Report',
    '',
    `Generated: ${report.generatedAt}`,
    `Path map: \`${report.pathMapPath}\``,
    `Source root: \`${report.sourceRoot}\``,
    `Target root: \`${report.targetRoot}\``,
    '',
    '## Summary',
    '',
    `- Eligible rows: ${report.summary.eligibleRows}`,
    `- Audited rows: ${report.summary.auditedRows}`,
    `- Passed: ${report.summary.passed}`,
    `- Differences: ${report.summary.differences}`,
    `- Legacy residue: ${report.summary.legacyResidue}`,
    `- Failed: ${report.summary.failed}`,
    '',
    '## Rows',
    '',
    '| Source | Target | Progress | Result | Report |',
    '| --- | --- | --- | --- | --- |',
    ...report.results
      .map((result) =>
        [
          `\`${result.sourcePath}\``,
          `\`${result.targetPath}\``,
          result.auditProgress,
          result.auditResult,
          result.markdownPath ? `\`${result.markdownPath}\`` : '',
        ].join(' | '),
      )
      .map((row) => `| ${row} |`),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

async function writeAuditErrorReport({
  error,
  reportPrefix,
  sourcePath,
  targetPath,
}) {
  const jsonPath = `${reportPrefix}.json`;
  const markdownPath = `${reportPrefix}.md`;
  const payload = {
    error: error.message,
    generatedAt: new Date().toISOString(),
    sourcePath,
    stack: error.stack,
    targetPath,
  };
  await fsPromises.writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  await fsPromises.writeFile(
    markdownPath,
    [
      '# Single Document Content Fidelity Audit',
      '',
      `Source: \`${sourcePath}\``,
      `Target: \`${targetPath}\``,
      '',
      '## Error',
      '',
      error.message,
      '',
    ].join('\n'),
  );
  return { jsonPath, markdownPath };
}

function safeReportStem(sourcePath) {
  return sourcePath
    .replace(/\.(md|mdx)$/i, '')
    .replace(/[^A-Za-z0-9._-]+/g, '__')
    .slice(0, 180);
}

function inferProductFromSourcePath(sourcePath) {
  const parts = sourcePath.split('/');
  const docsIndex = parts.indexOf('docs');
  return docsIndex >= 0 ? parts[docsIndex + 1] : (parts[0] ?? null);
}

function inferPlatformFromSourcePath(sourcePath) {
  const fileName = path.basename(sourcePath).replace(/\.(md|mdx)$/i, '');
  const suffixes = fileName.split('.').slice(1);
  return suffixes.find((suffix) => !/^\d/.test(suffix)) ?? null;
}

function inferPlatformForAudit({ sourcePath, targetPath }) {
  const sourcePlatforms = inferPlatformsFromPath(sourcePath);
  const targetPlatforms = inferPlatformsFromPath(targetPath);
  return (
    targetPlatforms.find((platform) => sourcePlatforms.includes(platform)) ??
    sourcePlatforms[0] ??
    null
  );
}

function shouldDropSharedOutsidePlatformBlocks({
  platform,
  sourcePath,
  targetPath,
}) {
  if (!platform) {
    return false;
  }

  const sourcePlatforms = inferPlatformsFromPath(sourcePath);
  const targetPlatforms = inferPlatformsFromPath(targetPath);

  return sourcePlatforms.length === 1 && targetPlatforms.length === 0;
}

function inferPlatformsFromPath(filePath) {
  const fileName = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
  return fileName
    .split('.')
    .slice(1)
    .filter((suffix) => !/^\d/.test(suffix));
}

function parseArgs(args) {
  const options = {
    failOnDifferences: false,
    includeAudited: false,
    limit: 0,
    newPath: null,
    newUrl: null,
    oldPath: null,
    oldUrl: null,
    out: null,
    outDir: null,
    pathMap: null,
    platform: null,
    product: null,
    sourceRoot: null,
    targetRoot: null,
  };

  for (const arg of args) {
    if (arg === '--fail-on-differences') {
      options.failOnDifferences = true;
      continue;
    }

    if (arg === '--include-audited') {
      options.includeAudited = true;
      continue;
    }

    if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length));
      continue;
    }

    if (arg.startsWith('--path-map=')) {
      options.pathMap = arg.slice('--path-map='.length);
      continue;
    }

    if (arg.startsWith('--old=')) {
      options.oldPath = arg.slice('--old='.length);
      continue;
    }

    if (arg.startsWith('--new=')) {
      options.newPath = arg.slice('--new='.length);
      continue;
    }

    if (arg.startsWith('--old-url=')) {
      options.oldUrl = arg.slice('--old-url='.length);
      continue;
    }

    if (arg.startsWith('--new-url=')) {
      options.newUrl = arg.slice('--new-url='.length);
      continue;
    }

    if (arg.startsWith('--source-root=')) {
      options.sourceRoot = arg.slice('--source-root='.length);
      continue;
    }

    if (arg.startsWith('--target-root=')) {
      options.targetRoot = arg.slice('--target-root='.length);
      continue;
    }

    if (arg.startsWith('--product=')) {
      options.product = arg.slice('--product='.length);
      continue;
    }

    if (arg.startsWith('--platform=')) {
      options.platform = arg.slice('--platform='.length);
      continue;
    }

    if (arg.startsWith('--out=')) {
      options.out = arg.slice('--out='.length);
      continue;
    }

    if (arg.startsWith('--out-dir=')) {
      options.outDir = arg.slice('--out-dir='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.pathMap) {
    if (!options.sourceRoot) {
      throw new Error('--source-root is required with --path-map.');
    }
    return options;
  }

  if (!options.oldPath || !options.newPath) {
    throw new Error('Both --old and --new are required.');
  }

  return options;
}

function writeReport(report, outPrefix) {
  const resolvedOutPrefix = path.resolve(outPrefix);
  const outDir = path.dirname(resolvedOutPrefix);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = `${resolvedOutPrefix}.json`;
  const markdownPath = `${resolvedOutPrefix}.md`;
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdownReport(report));
  return { jsonPath, markdownPath };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.pathMap) {
    const report = await auditCompletedMigrationRows({
      includeAudited: options.includeAudited,
      limit: options.limit,
      outDir: options.outDir ?? undefined,
      pathMap: options.pathMap,
      sourceRoot: options.sourceRoot,
      targetRoot: options.targetRoot ?? process.cwd(),
    });

    console.log(
      `Audited ${report.summary.auditedRows} completed migration rows.`,
    );
    console.log(`Wrote ${path.join(report.outDir, 'report.json')}`);
    console.log(`Wrote ${path.join(report.outDir, 'report.md')}`);

    if (
      options.failOnDifferences &&
      (report.summary.differences > 0 || report.summary.failed > 0)
    ) {
      process.exitCode = 1;
    }
    return;
  }

  const report = auditSingleDocContentFidelity({
    oldPath: options.oldPath,
    oldUrl: options.oldUrl,
    newPath: options.newPath,
    newUrl: options.newUrl,
    platform: options.platform,
    product: options.product,
    sourceRoot: options.sourceRoot,
  });

  if (options.out) {
    const paths = writeReport(report, options.out);
    console.log(`Wrote ${paths.jsonPath}`);
    console.log(`Wrote ${paths.markdownPath}`);
  } else {
    process.stdout.write(renderMarkdownReport(report));
  }

  if (options.failOnDifferences && report.summary.unresolvedDifferences > 0) {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
