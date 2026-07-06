#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const DEFAULT_DOCS_ROOT = path.resolve('content/docs');
const DEFAULT_MAX_SAMPLES = 200;
const MARKDOWN_FILE_PATTERN = /\.(md|mdx)$/i;
const BLOCK_JSX_COMPONENTS = new Set([
  'Accordion',
  'Accordions',
  'PlatformInline',
  'PlatformStructured',
  'Slot',
  'Tabs',
  'TabsContent',
]);

const RULES = {
  'jsx-unquoted-attribute': {
    severity: 'high',
    suggestion:
      'Quote JSX/HTML attribute values, for example id="onMessageEvent".',
  },
  'list-item-block-jsx': {
    severity: 'high',
    suggestion:
      'Move block MDX components out of list items, or align the whole block to a valid list continuation column.',
  },
  'raw-html-list-tag': {
    severity: 'high',
    suggestion:
      'Replace raw <li> HTML with Markdown list syntax inside the surrounding block or table Slot.',
  },
  'slot-outside-table': {
    severity: 'high',
    suggestion:
      'Place <Slot for="..."> immediately after the table containing the matching <Slot name="..." /> placeholder.',
  },
  'tabs-content-without-open': {
    severity: 'high',
    suggestion:
      'Wrap each tab pane in a matching <TabsContent value="..."> block inside <Tabs>.',
  },
  'tabs-left-open': {
    severity: 'high',
    suggestion: 'Close every opened <Tabs> and <TabsContent> block.',
  },
  'unescaped-mdx-brace': {
    severity: 'high',
    suggestion:
      'Escape literal braces as HTML entities or wrap the containing text in a code span/fence.',
  },
  'unescaped-mdx-angle': {
    severity: 'high',
    suggestion:
      'Escape literal comparison operators as &lt; or keep the full expression inside code formatting.',
  },
  'inline-platform-block': {
    severity: 'high',
    suggestion:
      'Put <PlatformInline> on its own block, or replace it with plain platform-specific prose.',
  },
  'table-indentation-mismatch': {
    severity: 'high',
    suggestion:
      'Use one consistent indentation level for every line in a Markdown table and its adjacent Slot definitions.',
  },
};

export function auditMdxBuildSyntax({ docsRoot = DEFAULT_DOCS_ROOT } = {}) {
  const files = collectMarkdownFiles(path.resolve(docsRoot));
  const issues = [];

  for (const filePath of files) {
    const relativePath = path.relative(path.resolve(docsRoot), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    issues.push(...analyzeMdxBuildSyntax(relativePath, content));
  }

  issues.sort(compareIssues);

  const affectedFiles = new Set(issues.map((issue) => issue.filePath));
  const ruleCounts = {};

  for (const issue of issues) {
    ruleCounts[issue.ruleId] = (ruleCounts[issue.ruleId] ?? 0) + 1;
  }

  return {
    issues,
    summary: {
      affectedFiles: affectedFiles.size,
      filesScanned: files.length,
      issueCount: issues.length,
      ruleCounts,
    },
  };
}

export function analyzeMdxBuildSyntax(filePath, content) {
  const lines = content.split(/\r?\n/);
  const ignoredLines = findFencedCodeLines(lines);
  const issues = [];

  auditLines({ filePath, ignoredLines, issues, lines });
  auditTableIndentation({ filePath, ignoredLines, issues, lines });
  auditTableSlots({ filePath, ignoredLines, issues, lines });
  auditTabs({ filePath, ignoredLines, issues, lines });

  return dedupeIssues(issues).sort(compareIssues);
}

export function formatMdxBuildSyntaxReport(
  report,
  { maxSamples = DEFAULT_MAX_SAMPLES } = {},
) {
  const { summary, issues } = report;
  const issueWord = summary.issueCount === 1 ? 'issue' : 'issues';
  const lines = [
    `Found ${summary.issueCount} potential MDX build syntax ${issueWord} in ${summary.affectedFiles} of ${summary.filesScanned} files.`,
  ];

  if (summary.issueCount === 0) {
    return `${lines[0]}\n`;
  }

  lines.push('');

  for (const [ruleId, count] of Object.entries(summary.ruleCounts).sort()) {
    lines.push(`- ${ruleId}: ${count}`);
  }

  lines.push('');

  for (const issue of issues.slice(0, maxSamples)) {
    const columnSuffix = issue.column ? `:${issue.column}` : '';
    lines.push(
      `${issue.filePath}:${issue.line}${columnSuffix} [${issue.ruleId}] ${issue.message}`,
    );
    lines.push(`  ${issue.suggestion}`);
  }

  if (issues.length > maxSamples) {
    lines.push('');
    lines.push(`... ${issues.length - maxSamples} more issues not shown.`);
    lines.push('Use --format=json for the full machine-readable report.');
  }

  return `${lines.join('\n')}\n`;
}

function auditLines({ filePath, ignoredLines, issues, lines }) {
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (ignoredLines.has(lineNumber)) {
      return;
    }

    const scanLine = removeInlineCode(line);

    for (const match of scanLine.matchAll(
      /<[^>\n]*?\s([A-Za-z_$][\w:$.-]*)=([A-Za-z_$][\w:.$-]*)/g,
    )) {
      addIssue(issues, {
        column: match.index + match[0].lastIndexOf(match[1]) + 1,
        filePath,
        line: lineNumber,
        message: `Attribute "${match[1]}" has an unquoted value "${match[2]}".`,
        ruleId: 'jsx-unquoted-attribute',
        source: line,
      });
    }

    if (/<\/?li(?:\s|>|\/)/i.test(scanLine)) {
      addIssue(issues, {
        column: scanLine.search(/<\/?li(?:\s|>|\/)/i) + 1,
        filePath,
        line: lineNumber,
        message: 'Raw HTML list item tag found outside a code fence.',
        ruleId: 'raw-html-list-tag',
        source: line,
      });
    }

    if (hasSuspiciousLiteralBrace(scanLine)) {
      addIssue(issues, {
        column: scanLine.search(/\{/) + 1,
        filePath,
        line: lineNumber,
        message: 'Literal "{" text found outside code formatting.',
        ruleId: 'unescaped-mdx-brace',
        source: line,
      });
    }

    if (hasSuspiciousLiteralAngle(scanLine)) {
      addIssue(issues, {
        column: scanLine.search(/<=|<\s*=/) + 1,
        filePath,
        line: lineNumber,
        message:
          'Literal comparison operator may be parsed as an invalid MDX tag.',
        ruleId: 'unescaped-mdx-angle',
        source: line,
      });
    }

    if (hasInlinePlatformBlock(scanLine)) {
      addIssue(issues, {
        column: scanLine.indexOf('<PlatformInline') + 1,
        filePath,
        line: lineNumber,
        message:
          '<PlatformInline> starts inside a paragraph instead of as a standalone block.',
        ruleId: 'inline-platform-block',
        source: line,
      });
    }

    const blockComponent = getIndentedBlockComponent(scanLine);
    if (blockComponent) {
      addIssue(issues, {
        column: scanLine.search(/\S/) + 1,
        filePath,
        line: lineNumber,
        message: `<${blockComponent}> is indented as nested content; this often parses as an invalid list-item MDX block.`,
        ruleId: 'list-item-block-jsx',
        source: line,
      });
    }
  });
}

function auditTableIndentation({ filePath, ignoredLines, issues, lines }) {
  let index = 0;

  while (index < lines.length) {
    const lineNumber = index + 1;

    if (ignoredLines.has(lineNumber) || !isMarkdownTableLine(lines[index])) {
      index += 1;
      continue;
    }

    const tableStart = index;
    const indents = new Set();

    while (
      index < lines.length &&
      !ignoredLines.has(index + 1) &&
      isMarkdownTableLine(lines[index])
    ) {
      indents.add(getIndent(lines[index]));
      index += 1;
    }

    if (indents.size > 1) {
      addIssue(issues, {
        column: getIndent(lines[tableStart]) + 1,
        filePath,
        line: tableStart + 1,
        message: 'Markdown table lines use inconsistent indentation.',
        ruleId: 'table-indentation-mismatch',
        source: lines[tableStart],
      });
    }
  }
}

function auditTableSlots({ filePath, ignoredLines, issues, lines }) {
  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;

    if (ignoredLines.has(lineNumber)) {
      continue;
    }

    const line = removeInlineCode(lines[index]);
    const slotFor = getSlotAttribute(line, 'for');

    if (!slotFor) {
      continue;
    }

    const previousTablePlaceholders = getAdjacentPreviousTableSlotNames({
      ignoredLines,
      lines,
      startIndex: index,
    });

    if (!previousTablePlaceholders.has(slotFor)) {
      addIssue(issues, {
        column: line.indexOf('<Slot') + 1,
        filePath,
        line: lineNumber,
        message: `<Slot for="${slotFor}"> does not immediately follow a table with a matching placeholder.`,
        ruleId: 'slot-outside-table',
        source: lines[index],
      });
    }
  }
}

function auditTabs({ filePath, ignoredLines, issues, lines }) {
  const stack = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (ignoredLines.has(lineNumber)) {
      return;
    }

    const scanLine = removeInlineCode(line);

    for (const tag of scanLine.matchAll(/<\/?(Tabs|TabsContent)\b[^>]*>/g)) {
      const rawTag = tag[0];
      const tagName = tag[1];
      const isClosing = rawTag.startsWith('</');
      const isSelfClosing = rawTag.endsWith('/>');

      if (isSelfClosing) {
        continue;
      }

      if (!isClosing) {
        stack.push({
          column: tag.index + 1,
          line: lineNumber,
          tagName,
        });
        continue;
      }

      const current = stack.at(-1);

      if (!current || current.tagName !== tagName) {
        addIssue(issues, {
          column: tag.index + 1,
          filePath,
          line: lineNumber,
          message: `Closing </${tagName}> does not match the currently open ${current ? `<${current.tagName}>` : 'tab block'}.`,
          ruleId: 'tabs-content-without-open',
          source: line,
        });
        return;
      }

      stack.pop();
    }
  });

  for (const openTag of stack) {
    addIssue(issues, {
      column: openTag.column,
      filePath,
      line: openTag.line,
      message: `<${openTag.tagName}> is not closed.`,
      ruleId: 'tabs-left-open',
      source: lines[openTag.line - 1],
    });
  }
}

function collectMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) {
        files.push(absolute);
      }
    }
  }

  walk(root);
  return files.sort();
}

function findFencedCodeLines(lines) {
  const ignored = new Set();
  let fence = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const match = /^(\s*)(`{3,}|~{3,})/.exec(line);

    if (fence) {
      ignored.add(lineNumber);

      if (
        match &&
        match[2][0] === fence.marker &&
        match[2].length >= fence.size
      ) {
        fence = null;
      }

      return;
    }

    if (match) {
      ignored.add(lineNumber);
      fence = {
        marker: match[2][0],
        size: match[2].length,
      };
    }
  });

  return ignored;
}

function removeInlineCode(line) {
  return line.replace(/`[^`]*`/g, (match) => ' '.repeat(match.length));
}

function getIndentedBlockComponent(line) {
  if (!/^\s+</.test(line) || line.startsWith('<')) {
    return null;
  }

  const match = /^\s+<\/?([A-Z][\w.-]*)\b/.exec(line);

  if (!match || !BLOCK_JSX_COMPONENTS.has(match[1])) {
    return null;
  }

  if (
    !['Accordion', 'Accordions'].includes(match[1]) &&
    !/^(?:\s{3,}|\t+)/.test(line)
  ) {
    return null;
  }

  return match[1];
}

function hasSuspiciousLiteralBrace(line) {
  return /(^|[^\\])\{(?:\s|["'])/.test(line);
}

function hasSuspiciousLiteralAngle(line) {
  return /(^|[^<])<=\s*\d/.test(line) || /<\s*=/.test(line);
}

function hasInlinePlatformBlock(line) {
  const index = line.indexOf('<PlatformInline');

  if (index < 0) {
    return false;
  }

  return line.slice(0, index).trim().length > 0;
}

function getSlotAttribute(line, attributeName) {
  const match = new RegExp(
    `<Slot\\b[^>]*\\b${attributeName}=["']([^"']+)["']`,
  ).exec(line);
  return match?.[1] ?? null;
}

function getAdjacentPreviousTableSlotNames({
  ignoredLines,
  lines,
  startIndex,
}) {
  const names = new Set();
  let cursor = startIndex - 1;

  while (cursor >= 0 && lines[cursor].trim() === '') {
    cursor -= 1;
  }

  while (cursor >= 0 && /^<\/Slot\s*>$/.test(lines[cursor].trim())) {
    cursor = findSlotDefinitionStartBefore(lines, cursor - 1);

    if (cursor < 0) {
      return names;
    }

    cursor -= 1;

    while (cursor >= 0 && lines[cursor].trim() === '') {
      cursor -= 1;
    }
  }

  while (cursor >= 0) {
    const lineNumber = cursor + 1;
    const line = lines[cursor];

    if (ignoredLines.has(lineNumber) || !isMarkdownTableLine(line)) {
      break;
    }

    for (const match of line.matchAll(
      /<Slot\b[^>]*\bname=["']([^"']+)["'][^>]*\/?>/g,
    )) {
      names.add(match[1]);
    }

    cursor -= 1;
  }

  return names;
}

function findSlotDefinitionStartBefore(lines, startIndex) {
  for (let cursor = startIndex; cursor >= 0; cursor -= 1) {
    if (/<Slot\b[^>]*\bfor=["'][^"']+["']/.test(lines[cursor])) {
      return cursor;
    }
  }

  return -1;
}

function isMarkdownTableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

function getIndent(line) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function addIssue(issues, issue) {
  const rule = RULES[issue.ruleId];
  issues.push({
    column: issue.column,
    filePath: issue.filePath,
    line: issue.line,
    message: issue.message,
    ruleId: issue.ruleId,
    severity: rule.severity,
    source: issue.source,
    suggestion: rule.suggestion,
  });
}

function dedupeIssues(issues) {
  const seen = new Set();
  const deduped = [];

  for (const issue of issues) {
    const key = `${issue.filePath}:${issue.line}:${issue.column}:${issue.ruleId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(issue);
  }

  return deduped;
}

function compareIssues(a, b) {
  return (
    a.filePath.localeCompare(b.filePath) ||
    a.line - b.line ||
    a.column - b.column ||
    a.ruleId.localeCompare(b.ruleId)
  );
}

function parseArgs(argv) {
  const options = {
    docsRoot: DEFAULT_DOCS_ROOT,
    format: 'text',
    maxSamples: DEFAULT_MAX_SAMPLES,
  };

  for (const arg of argv) {
    if (arg === '--json') {
      options.format = 'json';
    } else if (arg === '--text') {
      options.format = 'text';
    } else if (arg.startsWith('--format=')) {
      options.format = arg.slice('--format='.length);
    } else if (arg.startsWith('--root=')) {
      options.docsRoot = path.resolve(arg.slice('--root='.length));
    } else if (arg.startsWith('--max-samples=')) {
      options.maxSamples = Number.parseInt(
        arg.slice('--max-samples='.length),
        10,
      );
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['json', 'text'].includes(options.format)) {
    throw new Error('--format must be one of: json, text');
  }

  if (!Number.isInteger(options.maxSamples) || options.maxSamples < 0) {
    throw new Error('--max-samples must be a non-negative integer');
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  bun scripts/audit-mdx-build-syntax.mjs [--format=text|json] [--root=content/docs] [--max-samples=200]

Fast static audit for migration patterns that commonly block the Fumadocs MDX
build. This is a preflight check; run bun run build for final validation.
`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
      process.exit(0);
    }

    const report = auditMdxBuildSyntax({ docsRoot: options.docsRoot });

    if (options.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      process.stdout.write(
        formatMdxBuildSyntaxReport(report, {
          maxSamples: options.maxSamples,
        }),
      );
    }

    if (report.summary.issueCount > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
