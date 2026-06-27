#!/usr/bin/env bun
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createProcessor } from '@mdx-js/mdx';
import { VFile } from 'vfile';
import { docs } from '../source.config.ts';

const DOCS_ROOT = path.resolve('content/docs');
const CONFIDENCE_ORDER = new Map([
  ['low', 0],
  ['medium', 1],
  ['high', 2],
]);
const PLATFORM_COMPONENTS = new Set(['PlatformInline', 'PlatformStructured']);
const ADMONITION_DIRECTIVES = new Set([
  'caution',
  'danger',
  'error',
  'info',
  'note',
  'ok',
  'success',
  'tip',
  'warn',
  'warning',
]);
const FLOW_CONTAINER_TYPES = new Set(['root', 'listItem', 'mdxJsxFlowElement']);

class StopAfterAuditCapture extends Error {
  constructor() {
    super('STOP_AFTER_AUDIT_CAPTURE');
  }
}

function parseArgs(argv) {
  const options = {
    format: 'text',
    minConfidence: 'medium',
    root: DOCS_ROOT,
  };

  for (const arg of argv) {
    if (arg === '--json') {
      options.format = 'json';
    } else if (arg === '--jsonl') {
      options.format = 'jsonl';
    } else if (arg === '--text') {
      options.format = 'text';
    } else if (arg.startsWith('--format=')) {
      options.format = arg.slice('--format='.length);
    } else if (arg.startsWith('--min-confidence=')) {
      options.minConfidence = arg.slice('--min-confidence='.length);
    } else if (arg.startsWith('--root=')) {
      options.root = path.resolve(arg.slice('--root='.length));
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['text', 'json', 'jsonl'].includes(options.format)) {
    throw new Error('--format must be one of: text, json, jsonl');
  }

  if (!CONFIDENCE_ORDER.has(options.minConfidence)) {
    throw new Error('--min-confidence must be one of: low, medium, high');
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  bun scripts/audit-mdx-indentation.mjs [--format=text|json|jsonl] [--min-confidence=low|medium|high]

The audit parses content with the repository's configured Fumadocs MDX parser
and remark syntax extensions, then captures the mdast before mutating
validation plugins rewrite or throw. It reports indentation-sensitive nodes
with their AST ancestor chain.
`);
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const mdxOptions = await docs.docs.mdxOptions('bundler');
const processorCache = new Map();

function auditCapturePlugin() {
  return (tree, file) => {
    file.data.auditTree = tree;
    throw new StopAfterAuditCapture();
  };
}

function getProcessor(format) {
  const cached = processorCache.get(format);
  if (cached) return cached;

  const processor = createProcessor({
    ...mdxOptions,
    format,
    // Keep the configured plugins present so their parser extensions
    // (GFM tables, directives, MDX syntax) are registered, but capture before
    // project-specific validation/transforms mutate the tree or throw.
    remarkPlugins: [auditCapturePlugin, ...(mdxOptions.remarkPlugins ?? [])],
  });

  processorCache.set(format, processor);
  return processor;
}

const files = await collectDocFiles(options.root);
const issues = [];

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8');
  const format = filePath.endsWith('.mdx') ? 'mdx' : 'md';
  const fileIssues = await auditFile({ filePath, format, source });
  issues.push(...fileIssues);
}

const minRank = CONFIDENCE_ORDER.get(options.minConfidence);
const filteredIssues = issues
  .filter((issue) => CONFIDENCE_ORDER.get(issue.confidence) >= minRank)
  .sort(compareIssues);

emitReport(filteredIssues, {
  allCount: issues.length,
  filesScanned: files.length,
  minConfidence: options.minConfidence,
});

if (filteredIssues.some((issue) => issue.confidence === 'high')) {
  process.exitCode = 1;
}

async function collectDocFiles(root) {
  const out = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        out.push(absolute);
      }
    }
  }

  await walk(root);
  return out.sort();
}

async function auditFile({ filePath, format, source }) {
  const relativePath = path.relative(process.cwd(), filePath);
  const sourceLines = source.split(/\r?\n/);
  const file = new VFile({
    path: filePath,
    value: source,
    data: {
      frontmatter: {},
    },
  });

  let tree;

  try {
    const processor = getProcessor(format);
    tree = processor.parse(file);

    try {
      await processor.run(tree, file);
    } catch (error) {
      if (!(error instanceof StopAfterAuditCapture)) {
        return [
          createIssue({
            filePath: relativePath,
            line: error.line ?? error.position?.start?.line ?? 1,
            column: error.column ?? error.position?.start?.column ?? 1,
            nodeType: 'parseError',
            ancestorChain: 'root',
            ruleId: 'parse-error',
            reason: `The configured MDX parser failed before an AST could be audited: ${
              error instanceof Error ? error.message : String(error)
            }`,
            suggestion:
              'Fix the MDX parse error first, then rerun this indentation audit.',
            confidence: 'high',
            sourceLine: sourceLines[(error.line ?? 1) - 1] ?? '',
          }),
        ];
      }
    }
  } catch (error) {
    return [
      createIssue({
        filePath: relativePath,
        line: error.line ?? error.position?.start?.line ?? 1,
        column: error.column ?? error.position?.start?.column ?? 1,
        nodeType: 'parseError',
        ancestorChain: 'root',
        ruleId: 'parse-error',
        reason: `The configured MDX parser failed before an AST could be audited: ${
          error instanceof Error ? error.message : String(error)
        }`,
        suggestion:
          'Fix the MDX parse error first, then rerun this indentation audit.',
        confidence: 'high',
        sourceLine: sourceLines[(error.line ?? 1) - 1] ?? '',
      }),
    ];
  }

  tree = file.data.auditTree ?? tree;

  const context = {
    filePath: relativePath,
    format,
    sourceLines,
    issues: [],
  };

  walk(tree, [], null, null, context);
  auditListContinuations(tree, context);
  auditTables(tree, context);

  return dedupeIssues(context.issues);
}

function walk(node, ancestors, parent, index, context) {
  auditNode(node, ancestors, parent, index, context);

  if (!Array.isArray(node.children)) {
    return;
  }

  node.children.forEach((child, childIndex) => {
    walk(child, [...ancestors, node], node, childIndex, context);
  });
}

function auditNode(node, ancestors, parent, index, context) {
  if (isPlatformMdxNode(node)) {
    auditPlatformMdxNode(node, ancestors, parent, context);
  }

  if (context.format === 'md' && node.type === 'html') {
    auditRawHtmlNode(node, ancestors, parent, context);
  }

  if (isAdmonitionDirective(node)) {
    auditAdmonitionDirective(node, ancestors, parent, context);
  }

  if (isSlotDefinition(node)) {
    auditSlotDefinition(node, ancestors, parent, index, context);
  }

  if (isSlotPlaceholder(node) && !hasAncestorType(ancestors, 'tableCell')) {
    addIssue(context, node, ancestors, {
      ruleId: 'slot-placeholder-outside-table',
      reason:
        '<Slot name="..."> parsed outside a table cell. remarkTableSlots only supports inline table placeholders.',
      suggestion:
        'Move this placeholder into a table cell, or change it to a block <Slot for="..."> definition after the table.',
      confidence: 'high',
    });
  }

  if (node.type === 'code' && !node.lang) {
    auditIndentedCode(node, ancestors, context);
  }

  if (
    parent?.type === 'root' &&
    isFlowRiskNode(node) &&
    node.position?.start?.column > 1
  ) {
    addIssue(context, node, ancestors, {
      ruleId: 'indented-root-flow',
      reason:
        'This flow node is a root child but starts indented. The current MDX parser accepts it, but the indentation obscures whether it is top-level or nested.',
      suggestion:
        'Dedent the block opener to column 1 when the node is meant to be part of the top-level page flow.',
      confidence: isPlatformMdxNode(node) || isSlotDefinition(node)
        ? 'medium'
        : 'low',
    });
  }
}

function auditPlatformMdxNode(node, ancestors, parent, context) {
  if (parent?.type !== 'root') {
    addIssue(context, node, ancestors, {
      ruleId: 'platform-not-root',
      reason:
        `${node.name} parsed under ${describeNode(parent)}. remarkPlatformContent throws unless PlatformInline/PlatformStructured are root-level page-flow children.`,
      suggestion:
        `Dedent <${node.name}> so it is a root flow sibling, or move it out of the enclosing list, blockquote, or JSX container.`,
      confidence: 'high',
    });
  }
}

function auditRawHtmlNode(node, ancestors, parent, context) {
  const value = String(node.value ?? '');
  const platformMatch = value.match(/<\s*(PlatformInline|PlatformStructured)\b/);

  if (platformMatch) {
    addIssue(context, node, ancestors, {
      ruleId: 'platform-raw-html-in-md',
      reason:
        `${platformMatch[1]} parsed as raw HTML in a .md file, not as an MDX JSX node. The platform grouping plugin will not process it.`,
      suggestion:
        'Use .mdx for PlatformInline/PlatformStructured content and keep the component as a root-level flow block.',
      confidence: parent?.type === 'root' ? 'medium' : 'high',
    });
  }

  const slotForMatch = value.match(/<\s*Slot\b[^>]*\bfor\s*=/);
  if (slotForMatch && !isFlowContainer(parent)) {
    addIssue(context, node, ancestors, {
      ruleId: 'slot-definition-not-flow-sibling',
      reason:
        '<Slot for="..."> parsed as raw HTML outside a supported flow container. remarkTableSlots requires it as a flow sibling after the table.',
      suggestion:
        'Place the Slot definition immediately after its table, at the same indentation level as that table.',
      confidence: 'high',
    });
  }
}

function auditAdmonitionDirective(node, ancestors, parent, context) {
  if (parent?.type === 'root') {
    return;
  }

  const riskyAncestor = ancestors
    .slice(1)
    .find((ancestor) =>
      ['list', 'listItem', 'blockquote', 'mdxJsxFlowElement'].includes(
        ancestor.type,
      ),
    );

  if (!riskyAncestor) {
    return;
  }

  addIssue(context, node, ancestors, {
    ruleId: 'nested-container-directive',
    reason:
      `::${node.name} parsed under ${describeNode(riskyAncestor)}. remarkDirectiveAdmonition will preserve that parent when it rewrites the directive to a CalloutContainer.`,
    suggestion:
      'If the callout is meant to be top-level, dedent the opening ::: line and its body to column 1. Keep the indentation only when the callout intentionally belongs to the enclosing container.',
    confidence: riskyAncestor.type === 'blockquote' ? 'medium' : 'low',
  });
}

function auditSlotDefinition(node, ancestors, parent, index, context) {
  if (!isFlowContainer(parent)) {
    addIssue(context, node, ancestors, {
      ruleId: 'slot-definition-not-flow-sibling',
      reason:
        '<Slot for="..."> is not a child of a supported flow container. remarkTableSlots will reject it.',
      suggestion:
        'Place the Slot definition immediately after its table, at the same indentation level as that table.',
      confidence: 'high',
    });
    return;
  }

  const tableRun = findAdjacentTableRunContainingDefinition(
    parent.children,
    index,
  );

  if (!tableRun) {
    addIssue(context, node, ancestors, {
      ruleId: 'slot-definition-not-after-table',
      reason:
        '<Slot for="..."> is not in the contiguous flow-sibling Slot-definition run immediately after a table.',
      suggestion:
        'Move this Slot definition so the first <Slot for="..."> block appears directly after the table that contains the matching <Slot name="..." /> placeholder.',
      confidence: 'high',
    });
  }

  if (parent.type !== 'root') {
    addIssue(context, node, ancestors, {
      ruleId: 'slot-definition-nested-container',
      reason:
        `<Slot for="..."> parsed inside ${describeNode(parent)}. The table-slot plugin will scope it to that container rather than the root page flow.`,
      suggestion:
        'If the table is meant to be top-level, dedent both the table and its Slot definitions to the same root indentation.',
      confidence: hasAncestorType(ancestors, 'listItem') ? 'medium' : 'low',
    });
  }
}

function auditIndentedCode(node, ancestors, context) {
  const firstContentLine = String(node.value ?? '')
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0);
  const looksLikeLostStructure =
    firstContentLine &&
    /^(::+|<\s*(?:[A-Z][\w.:-]*|Slot\b)|\|)/.test(firstContentLine.trim());

  addIssue(context, node, ancestors, {
    ruleId: 'indented-code',
    reason: looksLikeLostStructure
      ? 'Four-space indentation caused content that looks structural to parse as an indented code block.'
      : 'Four-space indentation parsed as an indented code block. In this docs repo, fenced code is safer and less ambiguous.',
    suggestion: looksLikeLostStructure
      ? 'Dedent the structural block to the intended flow level, or fence it if it is meant to be literal code.'
      : 'Use a fenced code block when code is intended, or dedent if this content was meant to remain prose/MDX flow.',
    confidence: looksLikeLostStructure
      ? 'high'
      : hasAncestorType(ancestors, 'listItem')
        ? 'low'
        : 'medium',
  });
}

function auditListContinuations(tree, context) {
  walkContainers(tree, (node, ancestors) => {
    if (node.type !== 'listItem' || !Array.isArray(node.children)) {
      return;
    }

    for (let index = 1; index < node.children.length; index += 1) {
      const child = node.children[index];
      const previous = node.children[index - 1];

      if (!child.position?.start || !previous.position?.end) {
        continue;
      }

      const blankLineBetween = hasBlankLineBetween(
        context.sourceLines,
        previous.position.end.line,
        child.position.start.line,
      );

      if (!blankLineBetween || child.position.start.column <= 1) {
        continue;
      }

      const childAncestors = [...ancestors, node];
      const confidence = continuationConfidence(child, node.children, index);

      addIssue(context, child, childAncestors, {
        ruleId: 'blank-line-list-continuation',
        reason:
          `A blank line appears before this indented ${describeNode(child)}, but the AST still attaches it to the previous list item.`,
        suggestion:
          'Dedent this block to column 1 if it is meant to leave the list. Keep the indentation only when the continuation is intentional.',
        confidence,
      });
    }
  });
}

function auditTables(tree, context) {
  walkContainers(tree, (node, ancestors) => {
    if (!Array.isArray(node.children)) {
      return;
    }

    node.children.forEach((child, index) => {
      if (child.type !== 'table') {
        return;
      }

      const placeholders = collectTableSlotPlaceholders(child);
      if (placeholders.length === 0) {
        return;
      }

      const adjacentDefinitions = collectAdjacentSlotDefinitions(
        node.children,
        index + 1,
      );
      const placeholderNames = new Set(
        placeholders.map((placeholder) => placeholder.name),
      );
      const definitionNames = new Set(
        adjacentDefinitions.map((definition) => definition.name),
      );
      const missing = [...placeholderNames].filter(
        (name) => !definitionNames.has(name),
      );
      const extra = [...definitionNames].filter(
        (name) => !placeholderNames.has(name),
      );

      if (adjacentDefinitions.length === 0) {
        addIssue(context, child, [...ancestors, node], {
          ruleId: 'table-slot-missing-adjacent-definitions',
          reason:
            'This table contains <Slot name="..."> placeholders, but no adjacent <Slot for="..."> definitions were found in the same flow container.',
          suggestion:
            'Place matching <Slot for="..."> definitions immediately after this table, at the same indentation level.',
          confidence: 'high',
        });
      } else if (missing.length > 0 || extra.length > 0) {
        addIssue(context, child, [...ancestors, node], {
          ruleId: 'table-slot-definition-mismatch',
          reason:
            `Adjacent Slot definitions do not match table placeholders. Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}.`,
          suggestion:
            'Keep only matching <Slot for="..."> definitions immediately after the table, with names identical to the <Slot name="..."> placeholders.',
          confidence: 'high',
        });
      }

      if (node.type !== 'root') {
        addIssue(context, child, [...ancestors, node], {
          ruleId: 'table-slot-nested-container',
          reason:
            `A table with Slot placeholders parsed inside ${describeNode(node)}. Adjacent Slot definitions will be scoped to that container.`,
          suggestion:
            'If the table is meant to be top-level, dedent the table and all matching Slot definitions to root flow.',
          confidence: node.type === 'listItem' ? 'medium' : 'low',
        });
      }
    });
  });
}

function walkContainers(node, visitor, ancestors = []) {
  visitor(node, ancestors);

  if (!Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    walkContainers(child, visitor, [...ancestors, node]);
  }
}

function collectTableSlotPlaceholders(table) {
  const placeholders = [];

  for (const row of table.children ?? []) {
    for (const cell of row.children ?? []) {
      for (const child of cell.children ?? []) {
        if (!isSlotPlaceholder(child)) {
          continue;
        }

        placeholders.push({
          name: getSlotAttribute(child, 'name') ?? '(unknown)',
          node: child,
        });
      }
    }
  }

  return placeholders;
}

function collectAdjacentSlotDefinitions(children, startIndex) {
  const definitions = [];

  for (let index = startIndex; index < children.length; ) {
    const definition = readSlotDefinitionAt(children, index);

    if (!definition) {
      break;
    }

    definitions.push(definition);
    index = definition.endIndex;
  }

  return definitions;
}

function readSlotDefinitionAt(children, index) {
  const node = children[index];

  if (!isSlotDefinition(node)) {
    return null;
  }

  const name = getSlotAttribute(node, 'for') ?? '(unknown)';

  if (node.type === 'mdxJsxFlowElement') {
    return {
      endIndex: index + 1,
      name,
      node,
      startIndex: index,
    };
  }

  let cursor = index + 1;

  while (cursor < children.length && !isSlotHtmlClosingNode(children[cursor])) {
    if (isSlotDefinition(children[cursor])) {
      return {
        endIndex: cursor,
        malformed: true,
        name,
        node,
        startIndex: index,
      };
    }

    cursor += 1;
  }

  return {
    endIndex: Math.min(cursor + 1, children.length),
    malformed: cursor >= children.length,
    name,
    node,
    startIndex: index,
  };
}

function findAdjacentTableRunContainingDefinition(children, slotIndex) {
  for (let index = 0; index < children.length; index += 1) {
    const candidate = children[index];

    if (candidate.type !== 'table') {
      continue;
    }

    const definitions = collectAdjacentSlotDefinitions(children, index + 1);
    const match = definitions.find(
      (definition) => definition.startIndex === slotIndex,
    );

    if (match) {
      return {
        definition: match,
        table: candidate,
        tableIndex: index,
      };
    }
  }

  return null;
}

function continuationConfidence(node, siblings = [], index = -1) {
  if (isPlatformMdxNode(node) || isSlotDefinition(node)) {
    if (
      isSlotDefinition(node) &&
      index >= 0 &&
      findAdjacentTableRunContainingDefinition(siblings, index)
    ) {
      return 'medium';
    }

    return 'high';
  }

  if (
    node.type === 'containerDirective' ||
    node.type === 'table' ||
    node.type === 'mdxJsxFlowElement' ||
    node.type === 'html' ||
    node.type === 'code'
  ) {
    return 'medium';
  }

  return 'low';
}

function hasBlankLineBetween(lines, previousEndLine, nextStartLine) {
  for (let line = previousEndLine + 1; line < nextStartLine; line += 1) {
    if ((lines[line - 1] ?? '').trim() === '') {
      return true;
    }
  }

  return false;
}

function isPlatformMdxNode(node) {
  return (
    node.type === 'mdxJsxFlowElement' &&
    typeof node.name === 'string' &&
    PLATFORM_COMPONENTS.has(node.name)
  );
}

function isAdmonitionDirective(node) {
  return (
    node.type === 'containerDirective' &&
    typeof node.name === 'string' &&
    ADMONITION_DIRECTIVES.has(node.name)
  );
}

function isSlotDefinition(node) {
  return (
    (node.type === 'mdxJsxFlowElement' &&
      node.name === 'Slot' &&
      getSlotAttribute(node, 'for') !== null) ||
    isSlotHtmlOpeningNode(node)
  );
}

function isSlotPlaceholder(node) {
  return (
    ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') &&
      node.name === 'Slot' &&
      getSlotAttribute(node, 'name') !== null) ||
    isSlotHtmlSelfClosingNode(node)
  );
}

function isSlotHtmlOpeningNode(node) {
  const parsed = parseSlotHtml(node);
  return parsed?.kind === 'opening' && parsed.target !== null;
}

function isSlotHtmlClosingNode(node) {
  const parsed = parseSlotHtml(node);
  return parsed?.kind === 'closing';
}

function isSlotHtmlSelfClosingNode(node) {
  const parsed = parseSlotHtml(node);
  return parsed?.kind === 'selfClosing' && parsed.name !== null;
}

function parseSlotHtml(node) {
  if (node.type !== 'html' || typeof node.value !== 'string') {
    return null;
  }

  const value = node.value.trim();

  if (/^<\/Slot\s*>$/.test(value)) {
    return {
      kind: 'closing',
      name: null,
      target: null,
    };
  }

  const match = /^<Slot\b([\s\S]*?)(\/?)>$/.exec(value);

  if (!match) {
    return null;
  }

  return {
    kind: match[2] === '/' ? 'selfClosing' : 'opening',
    name: getHtmlStringAttribute(match[1], 'name'),
    target: getHtmlStringAttribute(match[1], 'for'),
  };
}

function getSlotAttribute(node, name) {
  if (
    node.type === 'mdxJsxFlowElement' ||
    node.type === 'mdxJsxTextElement'
  ) {
    return getMdxStringAttribute(node, name);
  }

  const parsed = parseSlotHtml(node);
  if (!parsed) {
    return null;
  }

  return name === 'name' ? parsed.name : parsed.target;
}

function getMdxStringAttribute(node, name) {
  for (const attribute of node.attributes ?? []) {
    if (
      attribute?.type === 'mdxJsxAttribute' &&
      attribute.name === name &&
      typeof attribute.value === 'string'
    ) {
      return attribute.value;
    }
  }

  return null;
}

function getHtmlStringAttribute(attributes, name) {
  const match = new RegExp(
    String.raw`(?:^|\s)${name}\s*=\s*(["'])(.*?)\1`,
  ).exec(attributes);

  return match?.[2] ?? null;
}

function isFlowContainer(node) {
  return Boolean(node && FLOW_CONTAINER_TYPES.has(node.type));
}

function isFlowRiskNode(node) {
  return (
    isPlatformMdxNode(node) ||
    isSlotDefinition(node) ||
    isAdmonitionDirective(node) ||
    node.type === 'mdxJsxFlowElement' ||
    node.type === 'containerDirective' ||
    node.type === 'table' ||
    node.type === 'blockquote'
  );
}

function hasAncestorType(ancestors, type) {
  return ancestors.some((ancestor) => ancestor.type === type);
}

function addIssue(context, node, ancestors, issue) {
  const start = node.position?.start ?? { line: 1, column: 1 };
  context.issues.push(
    createIssue({
      filePath: context.filePath,
      line: start.line,
      column: start.column,
      nodeType: describeNode(node),
      ancestorChain: [...ancestors, node].map(describeNode).join(' > '),
      sourceLine: context.sourceLines[start.line - 1] ?? '',
      ...issue,
    }),
  );
}

function createIssue(issue) {
  return {
    path: issue.filePath,
    line: issue.line,
    column: issue.column,
    nodeType: issue.nodeType,
    ancestorChain: issue.ancestorChain,
    ruleId: issue.ruleId,
    reason: issue.reason,
    suggestion: issue.suggestion,
    confidence: issue.confidence,
    sourceLine: issue.sourceLine.trimEnd(),
  };
}

function describeNode(node) {
  if (!node) {
    return 'unknown';
  }

  if ('name' in node && typeof node.name === 'string' && node.name.length > 0) {
    return `${node.type}<${node.name}>`;
  }

  if (node.type === 'containerDirective' && node.name) {
    return `${node.type}<${node.name}>`;
  }

  return node.type;
}

function dedupeIssues(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = [
      item.path,
      item.line,
      item.column,
      item.ruleId,
      item.nodeType,
    ].join('\0');

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push(item);
  }

  return out;
}

function compareIssues(a, b) {
  return (
    a.path.localeCompare(b.path) ||
    a.line - b.line ||
    a.column - b.column ||
    b.confidence.localeCompare(a.confidence) ||
    a.ruleId.localeCompare(b.ruleId)
  );
}

function emitReport(items, summary) {
  if (options.format === 'json') {
    console.log(
      JSON.stringify(
        {
          summary: {
            filesScanned: summary.filesScanned,
            issuesShown: items.length,
            issuesAllConfidence: summary.allCount,
            minConfidence: summary.minConfidence,
          },
          issues: items,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (options.format === 'jsonl') {
    for (const item of items) {
      console.log(JSON.stringify(item));
    }
    return;
  }

  console.log(
    `Scanned ${summary.filesScanned} docs files. Showing ${items.length}/${summary.allCount} issues with confidence >= ${summary.minConfidence}.`,
  );

  for (const item of items) {
    console.log('');
    console.log(`${item.path}:${item.line}:${item.column}`);
    console.log(`  confidence: ${item.confidence}`);
    console.log(`  rule: ${item.ruleId}`);
    console.log(`  node: ${item.nodeType}`);
    console.log(`  ancestors: ${item.ancestorChain}`);
    console.log(`  reason: ${item.reason}`);
    console.log(`  suggestion: ${item.suggestion}`);
    if (item.sourceLine) {
      console.log(`  source: ${item.sourceLine.trim()}`);
    }
  }
}
