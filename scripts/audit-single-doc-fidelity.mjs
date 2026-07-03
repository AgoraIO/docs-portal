import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

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
const KNOWN_STRUCTURAL_COMPONENTS = new Set([
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'Image',
  'Link',
  'PlatformInline',
  'PlatformStructured',
  'ProductWrapper',
  'Tab',
  'TabItem',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
]);

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
  const projection = {
    platform: platform ?? null,
    product: product ?? null,
  };
  const oldContent = loadLegacyContent({
    currentFile: resolvedOldPath,
    projection,
    seen: new Set(),
    sourceRoot: sourceRoot ? path.resolve(sourceRoot) : path.dirname(resolvedOldPath),
    variables: DEFAULT_VARIABLES,
  });
  const newContent = loadPortalContent({
    currentFile: resolvedNewPath,
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
      unresolvedDifferences:
        comparison.findings.changed.length +
        comparison.findings.extra.length +
        comparison.findings.missing.length +
        comparison.findings.moved.length +
        comparison.findings.unsupported.length,
      unsupported: comparison.findings.unsupported.length,
    },
    findings: comparison.findings,
  };

  return report;
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
    if (!importEntry.localName || !/^[A-Z]/.test(importEntry.localName)) {
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
    );
  }

  expanded = filterOrStripWrapper(expanded, 'PlatformWrapper', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });
  expanded = filterOrStripWrapper(expanded, 'ProductWrapper', {
    attrName: 'product',
    projectionValue: projection.product,
  });

  return expandVariables(expanded, variables);
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
    projectionValue: projection.platform,
  });
  content = filterOrStripWrapper(content, 'PlatformInline', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });

  return content;
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
  const withoutImports = content.replace(
    /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
    (_match, importClause, source) => {
      imports.push({
        localName: getDefaultImportName(importClause.trim()),
        source,
      });
      return '';
    },
  );

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

function resolveImportSource({ currentFile, source, sourceRoot }) {
  if (source.startsWith('@docs/shared/')) {
    return resolveMarkdownFile(
      path.join(sourceRoot, 'shared', source.slice('@docs/shared/'.length)),
    );
  }

  if (source.startsWith('@shared/')) {
    return resolveMarkdownFile(
      path.join(sourceRoot, 'shared', source.slice('@shared/'.length)),
    );
  }

  if (source.startsWith('.')) {
    return resolveMarkdownFile(path.resolve(path.dirname(currentFile), source));
  }

  return null;
}

function resolveMarkdownFile(candidatePath) {
  const candidates = [
    candidatePath,
    `${candidatePath}.mdx`,
    `${candidatePath}.md`,
    path.join(candidatePath, 'index.mdx'),
    path.join(candidatePath, 'index.md'),
  ];

  return candidates.find(
    (filePath) =>
      MARKDOWN_FILE_PATTERN.test(filePath) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile(),
  );
}

function replaceComponentUsage(content, componentName, replacement) {
  const escaped = escapeRegExp(componentName);
  const selfClosing = new RegExp(`<${escaped}\\s*\\/?>`, 'g');
  const paired = new RegExp(`<${escaped}\\b[^>]*>\\s*<\\/${escaped}>`, 'g');

  return content.replace(paired, replacement).replace(selfClosing, replacement);
}

function filterOrStripWrapper(content, componentName, options) {
  const openPattern = new RegExp(`<${escapeRegExp(componentName)}\\b[^>]*>`, 'g');
  let result = '';
  let cursor = 0;

  for (const match of content.matchAll(openPattern)) {
    const openTag = match[0];
    const openIndex = match.index ?? 0;
    const close = findMatchingComponentClose({
      componentName,
      content,
      fromIndex: openIndex,
    });

    if (!close) {
      continue;
    }

    result += content.slice(cursor, openIndex);
    const inner = content.slice(openIndex + openTag.length, close.start);
    const shouldKeep =
      !options.projectionValue ||
      shouldKeepProjectionTag(openTag, {
        attrName: options.attrName,
        projectionValue: options.projectionValue,
      });

    if (shouldKeep) {
      result += inner;
    }

    cursor = close.end;
  }

  result += content.slice(cursor);
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
    return parseListAttribute(allowedValue).includes(projectionValue);
  }

  if (notAllowedValue) {
    return !parseListAttribute(notAllowedValue).includes(projectionValue);
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

    if (value) {
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

    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})([A-Za-z0-9_-]*)/);
    if (fenceMatch) {
      flushParagraph(lineNumber);
      inCode = true;
      codeFence = fenceMatch[1];
      codeLanguage = fenceMatch[2] || 'text';
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

    if (/^\|.+\|$/.test(trimmed)) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'table-row',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          section: currentSection(),
          side,
          value: normalizeTableRow(trimmed),
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
  normalized = normalized.replace(/<Admonition\b([^>]*)>/g, (_match, attrs) => {
    const type = readAttribute(`<Admonition ${attrs}>`, 'type') ?? 'note';
    const title = readAttribute(`<Admonition ${attrs}>`, 'title');
    return title
      ? `:::${mapAdmonitionType(type)}[${title}]`
      : `:::${mapAdmonitionType(type)}`;
  });
  normalized = normalized.replace(/<\/Admonition>/g, ':::');
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
  normalized = normalized.replace(/<\/?(Tabs|TabsList|TabsContent)\b[^>]*>/g, '');
  normalized = normalized.replace(
    /<\/?(CodeBlockTabs|CodeBlockTabsList)\b[^>]*>/g,
    '',
  );
  normalized = normalized.replace(/<summary>([\s\S]*?)<\/summary>/g, (_match, body) => {
    return `**${normalizePlainText(body).trim()}**`;
  });
  normalized = normalized.replace(/<\/?details>/g, '');
  normalized = normalized.replace(/^export\s+const\s+.+$/gm, '');
  normalized = normalized.replace(/<\/?(PlatformStructured|PlatformInline)\b[^>]*>/g, '');
  normalized = normalized.replace(/<\/?(ProductWrapper|PlatformWrapper)\b[^>]*>/g, '');

  return normalized;
}

function mapAdmonitionType(type) {
  if (type === 'caution') {
    return 'warning';
  }

  if (type === 'danger') {
    return 'error';
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
  const unmatchedSource = [];
  const matchedTargetIds = new Set();

  for (const sourceRecord of sourceRecords) {
    const bucket = targetBuckets.get(recordKey(sourceRecord)) ?? [];
    const targetRecord = bucket.shift();

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

  const unmatchedTarget = targetRecords.filter(
    (record) => !matchedTargetIds.has(recordId(record)),
  );
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
  const moved = detectMovedRecords(exactMatches).map((match) => ({
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

function normalizeTableRow(row) {
  return row
    .split('|')
    .map((cell) => normalizeText(cell))
    .filter(Boolean)
    .join(' | ');
}

function normalizeText(value) {
  return normalizePlainText(value).replace(/\s+/g, ' ').trim();
}

function normalizePlainText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_{}[\]]/g, '')
    .replace(/&nbsp;/g, ' ');
}

function normalizeCalloutValue(type, title) {
  const normalizedType = type === 'info' ? 'note' : (type ?? 'note');
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
  return `${record.kind}\0${record.value}`;
}

function recordId(record) {
  return `${record.side}\0${record.location}\0${record.order}\0${record.kind}\0${record.hash}`;
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
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

function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function parseArgs(args) {
  const options = {
    failOnDifferences: false,
    newPath: null,
    newUrl: null,
    oldPath: null,
    oldUrl: null,
    out: null,
    platform: null,
    product: null,
    sourceRoot: null,
  };

  for (const arg of args) {
    if (arg === '--fail-on-differences') {
      options.failOnDifferences = true;
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

    throw new Error(`Unknown argument: ${arg}`);
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
