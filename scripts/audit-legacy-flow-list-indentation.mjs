#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkDirective from 'remark-directive';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import {
  compareSlot,
  listContentKey,
} from './audit-legacy-list-indentation.mjs';
import { transformAdmonitions } from './migrate-legacy-docs.mjs';
import { controlTableFromRows, parseCsv } from './migration-control-table.mjs';

const parser = unified().use(remarkParse).use(remarkDirective);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const stripFrontmatter = (text) =>
  text.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\s|$)/, (m) =>
    m.replace(/[^\n]/g, ' '),
  );
const inRange = (offset, ranges) =>
  ranges.some(([start, end]) => start <= offset && offset < end);
const rangesFor = (text, pattern) =>
  [...text.matchAll(pattern)].map((m) => [m.index, m.index + m[0].length]);
const dedent = (text) => {
  const lines = text.split('\n');
  const spaces = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^[ \t]*/)[0].length),
  );
  return lines
    .map((line) => (line.trim() ? line.slice(spaces) : line))
    .join('\n');
};

// Preserve the enclosing list as one unit, including any real child lists or
// callouts. Never reinterpret a table Slot or a fenced example as page flow.
export function flowLists(text) {
  const tree = parser.parse(stripFrontmatter(text));
  const slots = rangesFor(
    text,
    /^[ \t]*<Slot for="[^"]+">[\s\S]*?^[ \t]*<\/Slot>/gm,
  );
  const output = [];
  function walk(node, parent) {
    if (node.type === 'list') {
      const start = text.lastIndexOf('\n', node.position.start.offset - 1) + 1;
      const end = node.position.end.offset;
      const raw = text.slice(start, end);
      if (
        !inRange(start, slots) &&
        /(^|\n)[ \t]*[-*+]\s/.test(raw) &&
        !/(^|\n)[ \t]*(?:`{3,}|~{3,})/.test(raw)
      ) {
        output.push({
          start,
          end,
          line: node.position.start.line,
          raw,
          kind: parent?.type === 'containerDirective' ? 'callout' : 'prose',
        });
      }
      return;
    }
    for (const child of node.children ?? []) walk(child, node);
  }
  walk(tree, null);
  return output;
}

function files(root) {
  return execFileSync(
    'rg',
    [
      '--files',
      '--hidden',
      '-g',
      '*.md',
      '-g',
      '*.mdx',
      '-g',
      '!**/.git/**',
      '-g',
      '!**/node_modules/**',
      root,
    ],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  )
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort();
}

export function auditFlow({
  sourceRoot,
  repoRoot = process.cwd(),
  apply = false,
}) {
  const sourceFiles = files(sourceRoot);
  const index = new Map();
  const sourceErrors = [];
  const add = (e) => {
    const key = `${e.kind}\n${listContentKey(e.expected)}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(e);
  };
  let sourceBlocks = 0;
  for (const absolute of sourceFiles) {
    const raw = fs.readFileSync(absolute, 'utf8').replace(/\r\n?/g, '\n');
    const sourcePath = path.relative(sourceRoot, absolute);
    try {
      const codeRanges = [];
      function collect(node) {
        if (node.type === 'code')
          codeRanges.push([
            node.position.start.offset,
            node.position.end.offset,
          ]);
        for (const child of node.children ?? []) collect(child);
      }
      collect(parser.parse(stripFrontmatter(raw)));
      const admonitions = [
        ...raw.matchAll(/<Admonition\b[^>]*>[\s\S]*?<\/Admonition>/g),
      ].filter((m) => !inRange(m.index, codeRanges));
      const containers = [
        ...admonitions.map((m) => [m.index, m.index + m[0].length]),
        ...rangesFor(raw, /<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi),
      ];
      for (const match of admonitions) {
        const converted = transformAdmonitions(match[0]);
        for (const block of flowLists(converted)) {
          sourceBlocks++;
          add({
            kind: 'callout',
            sourcePath,
            line: raw.slice(0, match.index).split('\n').length,
            sourceHash: hash(match[0]),
            raw: match[0],
            expected: dedent(block.raw),
            previous: '',
            expanded: true,
          });
        }
      }
      for (const block of flowLists(raw)) {
        if (inRange(block.start, containers)) continue;
        sourceBlocks++;
        add({
          ...block,
          sourcePath,
          sourceHash: hash(block.raw),
          expected: dedent(block.raw),
          previous: '',
          expanded: true,
        });
      }
    } catch (error) {
      sourceErrors.push({ sourcePath, error: String(error) });
    }
  }

  const controlPath = path.join(repoRoot, 'docs/migration/path-map.csv');
  const rows = fs.existsSync(controlPath)
    ? controlTableFromRows(parseCsv(fs.readFileSync(controlPath, 'utf8'))).rows
    : [];
  const targets = files(path.join(repoRoot, 'content/docs/zh-CN'));
  const entries = [],
    changes = [];
  let targetBlocks = 0;
  for (const absolute of targets) {
    const file = path.relative(repoRoot, absolute);
    const before = fs.readFileSync(absolute, 'utf8');
    const parts = file.split('/');
    const product = ['api-reference', 'realtime-media', 'solutions'].includes(
      parts[3],
    )
      ? parts[4]
      : parts[3];
    const families = new Set([product]);
    const aliases = {
      ai: 'convoai',
      rtm: 'rtm2',
      'local-server-recording': 'recording',
      'ppt-transcoding': 'conversion-ppt',
    };
    if (aliases[product]) families.add(aliases[product]);
    const origins = [...before.matchAll(/^\s+sourcePath:\s*(.+)$/gm)].map((m) =>
      m[1].replace(/^['"]|['"]$/g, ''),
    );
    for (const row of rows.filter((row) => row.target_path === file))
      origins.push(row.source_path);
    for (const origin of origins) families.add(origin.split('/')[1]);
    let after = before;
    for (const block of flowLists(before).reverse()) {
      targetBlocks++;
      const candidates = (
        index.get(`${block.kind}\n${listContentKey(block.raw)}`) ?? []
      ).filter((e) => families.has(e.sourcePath.split('/')[1]));
      const prefix = block.raw.match(/^[ \t]*/)[0];
      const evidence = candidates.map((e) => ({
        ...e,
        expected: e.expected
          .split('\n')
          .map((line) => (line.trim() ? prefix + line : line))
          .join('\n'),
      }));
      let result = compareSlot(block.raw, evidence);
      // Preserve prose continuation columns. This pass repairs list markers;
      // it must not turn already-valid wrapped prose into lazy continuations.
      if (result.status === 'repair') {
        const beforeLines = block.raw.split('\n');
        const afterLines = result.after.split('\n');
        if (
          beforeLines.some(
            (line, i) =>
              line !== afterLines[i] && !/^[ \t]*(?:[-*+]|\d+\.)\s/.test(line),
          )
        ) {
          result = {
            status: 'unresolved',
            reason: 'non-list-line-indentation-change',
            sources: result.sources,
          };
        }
      }
      const { sources = [], after: replacement, ...verdict } = result;
      entries.push({
        file,
        line: block.line,
        kind: block.kind,
        ...verdict,
        before: block.raw,
        ...(replacement ? { after: replacement } : {}),
        sources: sources.map(
          ({ sourcePath, line, sourceHash, raw, expected }) => ({
            sourcePath,
            line,
            sourceHash,
            raw,
            expected,
          }),
        ),
      });
      if (result.status === 'repair')
        after =
          after.slice(0, block.start) + replacement + after.slice(block.end);
    }
    if (after !== before) {
      if (
        before
          .split('\n')
          .map((s) => s.trimStart())
          .join('\n') !==
        after
          .split('\n')
          .map((s) => s.trimStart())
          .join('\n')
      )
        throw Error(`Non-indentation change: ${file}`);
      changes.push({ file, beforeHash: hash(before), afterHash: hash(after) });
      if (apply) fs.writeFileSync(absolute, after);
    }
  }
  const counts = Object.fromEntries(
    ['repair', 'verified-unchanged', 'unresolved'].map((status) => [
      status,
      entries.filter((e) => e.status === status).length,
    ]),
  );
  return {
    sourceFiles: sourceFiles.length,
    sourceBlocks,
    sourceErrors,
    targetFiles: targets.length,
    targetBlocks,
    counts,
    changedFiles: changes.length,
    changes,
    entries,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const sourceRoot = process.argv
    .find((arg) => arg.startsWith('--source='))
    ?.slice(9);
  if (!sourceRoot)
    throw Error('Pass --source=/absolute/path/to/shengwang-doc-source');
  const apply = process.argv.includes('--apply');
  const report = auditFlow({ sourceRoot, apply });
  const output = path.resolve(
    '.agent/artifacts/list-indentation',
    apply ? 'flow-applied.json' : 'flow-audit.json',
  );
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  const { entries, changes, ...summary } = report;
  console.log(JSON.stringify({ ...summary, report: output }, null, 2));
}
