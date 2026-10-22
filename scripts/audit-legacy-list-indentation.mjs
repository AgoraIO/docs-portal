#!/usr/bin/env node

// Read every legacy Markdown source, compare actual table-cell list structure,
// and change only leading whitespace when both text and old conversion match.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import {
  inferContextFromSourcePath,
  migrateLegacyPage,
  transformLegacyMdx,
} from './migrate-legacy-docs.mjs';
import { controlTableFromRows, parseCsv } from './migration-control-table.mjs';

// Only page-level definitions. Slots inside list items retain their enclosing
// content-column indentation, which must not be mistaken for JSX padding.
const slotPattern = () => /^<Slot for="([^"]+)">\n([\s\S]*?)\n<\/Slot>/gm;
const canonical = (body) =>
  body
    .split('\n')
    .map((s) =>
      s
        .trim()
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/\\([<>{}])/g, '$1')
        .replace(/\]\([^\n]*?\)/g, ']'),
    )
    .filter(Boolean)
    .join('\n');
export const listContentKey = canonical;
const structure = (body) =>
  body
    .split('\n')
    .filter((s) => s.trim())
    .map((s) => s.match(/^[ \t]*/)[0])
    .join('|');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const listLines = (body) =>
  body.split('\n').filter((s) => /^[ \t]*[-*+]\s/.test(s));
const listKey = (body) => canonical(listLines(body).join('\n'));
const parser = unified().use(remarkParse);
export function listLayout(body) {
  const blocks = new Set([
    'root',
    'list',
    'listItem',
    'paragraph',
    'code',
    'blockquote',
    'html',
  ]);
  const shape = (node) => ({
    type: node.type,
    ...(node.type === 'list' ? { ordered: node.ordered } : {}),
    ...(node.children
      ? {
          children: node.children
            .filter((child) => blocks.has(child.type))
            .map(shape),
        }
      : {}),
  });
  return JSON.stringify(shape(parser.parse(body)));
}

function dedent(body) {
  const lines = body.replace(/^\n+|\n+$/g, '').split('\n');
  const widths = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)[0].length);
  const width = widths.length ? Math.min(...widths) : 0;
  return lines.map((line) => line.slice(width)).join('\n');
}

function fenceMask(text) {
  let fence = null;
  return text
    .split('\n')
    .map((line) => {
      const m = line.match(/^[ \t]*(`{3,}|~{3,})/);
      const hidden = !!fence || !!m;
      if (m) {
        if (!fence) fence = m[1];
        else if (m[1][0] === fence[0] && m[1].length >= fence.length)
          fence = null;
      }
      return hidden ? line.replace(/./g, ' ') : line;
    })
    .join('\n');
}

function state(sourcePath) {
  return {
    context: inferContextFromSourcePath(sourcePath),
    currentSourcePath: sourcePath,
    issues: [],
    linkLists: new Map(),
    pathMap: new Map(),
    sharedDependencies: new Set(),
    sourceRoot: '/legacy',
    tableHeaders: new Map(),
  };
}

export function cellEvidence(raw, sourcePath, line) {
  const render = (body) => {
    const converted = transformLegacyMdx(
      `<table><tr><th>audit</th></tr><tr><td>${body}</td></tr></table>`,
      state(sourcePath),
    );
    return [...converted.matchAll(slotPattern())][0]?.[2]?.trim() ?? '';
  };
  const expected = render(dedent(raw));
  const previous = render(raw.trim());
  if (!expected || !/(^|\n)[ \t]*[-*+]\s/.test(expected)) return null;
  return { sourcePath, line, sourceHash: hash(raw), raw, expected, previous };
}

export function compareSlot(body, evidence) {
  const matches = evidence.filter(
    (e) => canonical(e.expected) === canonical(body),
  );
  if (!matches.length && !/(^|\n)[ \t]*(?:`{3,}|~{3,})/.test(body)) {
    // A later editorial change to the introduction does not change list
    // relationships. Require every list line to match, and do not touch prose.
    const lines = body.trim().split('\n');
    const first = lines.findIndex((s) => /^[ \t]*[-*+]\s/.test(s));
    if (
      first >= 0 &&
      lines.every(
        (s) => !s.trim() || /^[ \t]*[-*+]\s/.test(s) || !/^[ \t]/.test(s),
      )
    ) {
      const candidates = evidence.filter(
        (e) => listKey(e.expected) === listKey(body),
      );
      const shapes = new Set(
        candidates.map((e) => structure(listLines(e.expected).join('\n'))),
      );
      if (candidates.length && shapes.size === 1) {
        const expected = listLines(candidates[0].expected);
        const current = listLines(body);
        if (
          structure(expected.join('\n')) === structure(current.join('\n')) ||
          listLayout(expected.join('\n')) === listLayout(current.join('\n'))
        )
          return {
            status: 'verified-unchanged',
            sources: candidates,
            comparison: 'list-lines',
          };
        if (
          candidates.some(
            (e) =>
              e.expanded ||
              structure(listLines(e.previous).join('\n')) ===
                structure(current.join('\n')),
          )
        ) {
          let i = 0;
          const after = body
            .split('\n')
            .map((s) =>
              /^[ \t]*[-*+]\s/.test(s)
                ? expected[i++].match(/^[ \t]*/)[0] + s.trimStart()
                : s,
            )
            .join('\n');
          return {
            status: 'repair',
            after,
            sources: candidates,
            comparison: 'list-lines',
          };
        }
      }
    }
  }
  if (!matches.length)
    return { status: 'unresolved', reason: 'no-exact-source-text-match' };
  const expectedShapes = new Set(matches.map((e) => structure(e.expected)));
  if (expectedShapes.size !== 1)
    return {
      status: 'unresolved',
      reason: 'conflicting-source-hierarchies',
      sources: matches,
    };
  const expected = matches[0].expected;
  if (
    structure(body) === structure(expected) ||
    listLayout(body) === listLayout(expected)
  )
    return { status: 'verified-unchanged', sources: matches };
  if (
    !matches.some(
      (e) => e.expanded || structure(e.previous) === structure(body),
    )
  ) {
    return {
      status: 'unresolved',
      reason: 'target-does-not-match-old-conversion',
      sources: matches,
    };
  }
  // No target words, URLs, numbers, ordering, blank lines or trailing spaces
  // are taken from the source: only the verified leading whitespace changes.
  const indents = expected
    .split('\n')
    .filter((s) => s.trim())
    .map((s) => s.match(/^[ \t]*/)[0]);
  let i = 0;
  const after = body
    .split('\n')
    .map((s) => (s.trim() ? indents[i++] + s.trimStart() : s))
    .join('\n');
  if (canonical(body) !== canonical(after))
    throw new Error('Content preservation failed');
  return { status: 'repair', after, sources: matches };
}

export function compareReviewedSlot(body, review, evidence) {
  const source = evidence.find(
    (e) =>
      e.sourcePath === review.sourcePath &&
      e.line === review.sourceLine &&
      e.sourceHash === review.sourceHash,
  );
  if (!source || listLines(source.expected).some((s) => /^[ \t]+/.test(s)))
    return null;
  if (hash(body) === review.afterHash)
    return {
      status: 'verified-unchanged',
      comparison: 'reviewed-source',
      review: review.note,
      sources: [source],
    };
  if (hash(body) !== review.beforeHash) return null;
  const after = body
    .split('\n')
    .map((s) => (/^[ \t]*[-*+]\s/.test(s) ? s.trimStart() : s))
    .join('\n');
  if (hash(after) !== review.afterHash)
    throw new Error('Reviewed repair hash mismatch');
  return {
    status: 'repair',
    after,
    comparison: 'reviewed-source',
    review: review.note,
    sources: [source],
  };
}

function markdownCells(text) {
  const cells = [];
  // Multiline GFM cells used by the old renderer. Protect inline-code pipes.
  const rows = text.matchAll(/^\|[^\n]*(?:\n(?!\|)[^\n]*)*/gm);
  for (const row of rows) {
    const value = row[0];
    if (!value.includes('\n') || !/(^|\n)[ \t]*[-*+]\s/.test(value)) continue;
    const end = value.lastIndexOf('|');
    if (end <= 0) continue;
    const body = value.slice(1, end);
    let cursor = 0,
      ticks = false;
    for (let i = 0; i <= body.length; i++) {
      if (body[i] === '`') ticks = !ticks;
      if (
        i === body.length ||
        (body[i] === '|' && !ticks && body[i - 1] !== '\\')
      ) {
        cells.push({
          raw: body.slice(cursor, i),
          index: row.index + cursor + 1,
        });
        cursor = i + 1;
      }
    }
  }
  return cells;
}

export async function audit({
  sourceRoot,
  repoRoot = process.cwd(),
  apply = false,
}) {
  const sourceFiles = execFileSync(
    'rg',
    [
      '--files',
      '--hidden',
      '-g',
      '*.mdx',
      '-g',
      '*.md',
      '-g',
      '!**/node_modules/**',
      '-g',
      '!**/.git/**',
      sourceRoot,
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .sort();
  const byText = new Map();
  const byList = new Map();
  const allEvidence = [];
  const reviews = JSON.parse(
    fs.readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'fixtures/legacy-list-indentation-reviews.json',
      ),
      'utf8',
    ),
  );
  const sourceTexts = new Map();
  const sourceErrors = [];
  let sourceCells = 0;
  for (const file of sourceFiles) {
    const text = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
    const sourcePath = path.relative(sourceRoot, file);
    sourceTexts.set(sourcePath, text);
    const mask = fenceMask(text);
    const cells = [...text.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .filter((m) => mask[m.index] === '<')
      .map((m) => ({ raw: m[1], index: m.index }));
    cells.push(...markdownCells(text));
    for (const cell of cells) {
      if (!/(^|\n)[ \t]*[-*+]\s|<li\b/i.test(cell.raw)) continue;
      sourceCells++;
      try {
        const e = cellEvidence(
          cell.raw,
          sourcePath,
          text.slice(0, cell.index).split('\n').length,
        );
        if (!e) continue;
        allEvidence.push(e);
        const key = canonical(e.expected);
        if (!byText.has(key)) byText.set(key, []);
        byText.get(key).push(e);
        const list = listKey(e.expected);
        if (!byList.has(list)) byList.set(list, []);
        byList.get(list).push(e);
      } catch (error) {
        sourceErrors.push({
          sourcePath,
          line: text.slice(0, cell.index).split('\n').length,
          error: String(error),
        });
      }
    }
  }
  const sourceForTarget = new Map();
  const familyForTarget = new Map();
  const familyKey = (file) => {
    const parts = file.split('/');
    return parts
      .slice(
        0,
        ['api-reference', 'realtime-media', 'solutions'].includes(parts[3])
          ? 5
          : 4,
      )
      .join('/');
  };
  const control = controlTableFromRows(
    parseCsv(
      fs.readFileSync(
        path.join(repoRoot, 'docs/migration/path-map.csv'),
        'utf8',
      ),
    ),
  );
  for (const row of control.rows) {
    if (!row.target_path) continue;
    if (!sourceForTarget.has(row.target_path))
      sourceForTarget.set(row.target_path, new Set());
    sourceForTarget.get(row.target_path).add(row.source_path);
    const key = familyKey(row.target_path);
    if (!familyForTarget.has(key)) familyForTarget.set(key, new Set());
    familyForTarget.get(key).add(row.source_path.split('/')[1]);
  }
  const dependencyCache = new Map();
  function dependencies(sourcePath, seen = new Set()) {
    if (seen.has(sourcePath)) return seen;
    seen.add(sourcePath);
    const text = sourceTexts.get(sourcePath) ?? '';
    for (const m of text.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      const aliases = {
        '@shared/': 'shared/',
        '@doc-shared/': 'docs/shared/',
        '@docs/shared/': 'docs/shared/',
        '@api-shared/': 'docs-api-reference/shared/',
      };
      const alias = Object.keys(aliases).find((prefix) =>
        spec.startsWith(prefix),
      );
      const base = alias
        ? aliases[alias] + spec.slice(alias.length)
        : spec.startsWith('.')
          ? path.posix.join(path.posix.dirname(sourcePath), spec)
          : null;
      if (!base) continue;
      const dep = [base, `${base}.mdx`, `${base}.md`].find((p) =>
        sourceTexts.has(p),
      );
      if (dep) dependencies(dep, seen);
    }
    return seen;
  }
  const targetFiles = execFileSync(
    'rg',
    ['--files', 'content/docs/zh-CN', '-g', '*.mdx', '-g', '*.md'],
    { cwd: repoRoot, encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .sort();
  const targetTexts = new Map(
    targetFiles.map((file) => [
      file,
      fs.readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
  const mirrorOrigins = new Map();
  for (const [file, text] of targetTexts) {
    const origin = text
      .match(/^\s+sourcePath:\s*(.+)$/m)?.[1]
      ?.replace(/^['"]|['"]$/g, '');
    const mapped = origin
      ? new Set([origin])
      : (sourceForTarget.get(file) ?? new Set());
    for (const m of text.matchAll(slotPattern())) {
      const key = `${m[1]}\n${canonical(m[2])}`;
      if (!mirrorOrigins.has(key)) mirrorOrigins.set(key, []);
      for (const source of mapped)
        mirrorOrigins.get(key).push({ file, source });
    }
  }
  const entries = [],
    changes = [];
  const expandedCache = new Map();
  const expansionErrors = [];
  let scannedSlots = 0;
  for (const file of targetFiles) {
    const absolute = path.join(repoRoot, file);
    const before = targetTexts.get(file);
    const mask = fenceMask(before);
    const origin = before
      .match(/^\s+sourcePath:\s*(.+)$/m)?.[1]
      ?.replace(/^['"]|['"]$/g, '');
    const mapped = origin
      ? new Set([origin])
      : (sourceForTarget.get(file) ?? new Set());
    const allowedSources = new Set();
    for (const source of mapped) {
      if (!dependencyCache.has(source))
        dependencyCache.set(source, dependencies(source));
      for (const dep of dependencyCache.get(source)) allowedSources.add(dep);
    }
    const expandedEvidence = [];
    // Expand old shared imports and platform dictionaries through the actual
    // migration entry point for cells that cannot be compared as raw text.
    const pageRoots = new Set(mapped);
    for (const match of before.matchAll(slotPattern())) {
      if (!/(^|\n)[ \t]*[-*+]\s/.test(match[2])) continue;
      const slug = match[1].match(/^(.*)-(?:html|markdown)-\d/)?.[1];
      for (const source of sourceTexts.keys()) {
        if (
          slug &&
          path
            .basename(source)
            .replace(/\.(md|mdx)$/i, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') === slug
        ) {
          // The later per-slot provenance filter still restricts the family.
          pageRoots.add(source);
        }
      }
      for (const mirror of mirrorOrigins.get(
        `${match[1]}\n${canonical(match[2])}`,
      ) ?? [])
        pageRoots.add(mirror.source);
    }
    for (const sourcePath of pageRoots) {
      if (!sourceTexts.has(sourcePath)) continue;
      if (
        /^(?:shared\/|docs\/shared\/|docs-api-reference\/shared\/)/.test(
          sourcePath,
        )
      )
        continue;
      if (!expandedCache.has(sourcePath)) {
        try {
          const result = await migrateLegacyPage({
            sourcePath,
            sourceRoot,
            pathMap: new Map(),
          });
          const evidence = [...result.content.matchAll(slotPattern())].map(
            (m) => ({
              sourcePath,
              line: 1,
              sourceHash: hash(sourceTexts.get(sourcePath)),
              raw: '',
              expected: m[2].trim(),
              previous: '',
              expanded: true,
              dependencies: result.sharedDependencies.map((p) => ({
                path: p,
                hash: sourceTexts.has(p) ? hash(sourceTexts.get(p)) : null,
              })),
            }),
          );
          expandedCache.set(sourcePath, evidence);
        } catch (error) {
          expansionErrors.push({ sourcePath, error: String(error) });
          expandedCache.set(sourcePath, []);
        }
      }
      expandedEvidence.push(...expandedCache.get(sourcePath));
    }
    const after = before.replace(slotPattern(), (full, slot, body, offset) => {
      if (mask[offset] !== '<') return full;
      scannedSlots++;
      if (!/(^|\n)[ \t]*[-*+]\s/.test(body)) return full;
      const candidates = byText.get(canonical(body)) ?? [];
      const mirrors = mirrorOrigins.get(`${slot}\n${canonical(body)}`) ?? [];
      const slotSources = new Set(allowedSources);
      // Some pages moved after path-map creation or combine platform variants.
      // Recover the original filename encoded by createTableSlotName, bounded
      // to product families established by the repository's path map.
      const slug = slot.match(/^(.*)-(?:html|markdown)-\d/)?.[1];
      const families = new Set(familyForTarget.get(familyKey(file)) ?? []);
      const product = ['api-reference', 'realtime-media', 'solutions'].includes(
        file.split('/')[3],
      )
        ? file.split('/')[4]
        : file.split('/')[3];
      families.add(product);
      if (
        file.startsWith('content/docs/zh-CN/api-reference/api-ref/signaling/')
      )
        families.add('rtm2');
      const renamedProducts = {
        'local-server-recording': 'recording',
        rtm: 'rtm2',
        ai: 'convoai',
        'ppt-transcoding': 'conversion-ppt',
      };
      if (renamedProducts[product]) families.add(renamedProducts[product]);
      const inferredSources = slug
        ? [...sourceTexts.keys()].filter(
            (p) =>
              families.has(p.split('/')[1]) &&
              path
                .basename(p)
                .replace(/\.(md|mdx)$/i, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') === slug,
          )
        : [];
      for (const source of inferredSources) {
        if (!dependencyCache.has(source))
          dependencyCache.set(source, dependencies(source));
        for (const dep of dependencyCache.get(source)) slotSources.add(dep);
      }
      for (const { source } of mirrors) {
        if (!dependencyCache.has(source))
          dependencyCache.set(source, dependencies(source));
        for (const dep of dependencyCache.get(source)) slotSources.add(dep);
      }
      const related = [
        ...new Set([...candidates, ...(byList.get(listKey(body)) ?? [])]),
      ].filter((e) => slotSources.has(e.sourcePath));
      let result = compareSlot(body, related);
      if (result.status === 'unresolved') {
        const generated = expandedEvidence.filter((e) =>
          slotSources.has(e.sourcePath),
        );
        const fromExpanded = compareSlot(body, generated);
        if (fromExpanded.status !== 'unresolved')
          result = { ...fromExpanded, comparison: 'expanded-source' };
      }
      if (result.status === 'unresolved') {
        for (const review of reviews.filter(
          (r) => r.file === file && r.slot === slot,
        )) {
          const reviewed = compareReviewedSlot(body, review, allEvidence);
          if (reviewed) {
            result = reviewed;
            break;
          }
        }
      }
      if (
        result.status === 'repair' &&
        /(^|\n)[ \t]*(?:`{3,}|~{3,})/.test(body)
      ) {
        result.status = 'unresolved';
        result.reason = 'code-containing-cell-needs-review';
        delete result.after;
      }
      if (result.status === 'unresolved' && !related.length) {
        result.reason =
          !mapped.size && !inferredSources.length && !mirrors.length
            ? 'missing-page-source-mapping'
            : candidates.length
              ? 'only-unrelated-source-matches'
              : 'no-exact-source-text-match';
      }
      const { sources = [], after: replacement, ...verdict } = result;
      entries.push({
        file,
        slot,
        line: before.slice(0, offset).split('\n').length,
        mappedSources: [...mapped],
        inferredSources,
        mirrors,
        ...verdict,
        before: body,
        ...(replacement ? { after: replacement } : {}),
        sources: sources.map(
          ({
            sourcePath,
            line,
            sourceHash,
            raw,
            expected,
            previous,
            expanded,
            dependencies,
          }) => ({
            sourcePath,
            line,
            sourceHash,
            raw,
            expected,
            previous,
            expanded,
            dependencies,
          }),
        ),
      });
      return result.status === 'repair'
        ? full.replace(body, () => replacement)
        : full;
    });
    if (before !== after) {
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
        throw new Error(`Non-indentation change in ${file}`);
      changes.push({ file, beforeHash: hash(before), afterHash: hash(after) });
      if (apply) fs.writeFileSync(absolute, after);
    }
  }
  const counts = Object.fromEntries(
    ['repair', 'verified-unchanged', 'unresolved'].map((s) => [
      s,
      entries.filter((e) => e.status === s).length,
    ]),
  );
  return {
    sourceRoot,
    sourceFilesRead: sourceFiles.length,
    sourceCells,
    sourceErrors,
    expandedPages: expandedCache.size,
    expansionErrors,
    targetFilesRead: targetFiles.length,
    scannedSlots,
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
    throw new Error('Pass --source=/absolute/path/to/shengwang-doc-source');
  const apply = process.argv.includes('--apply');
  const report = await audit({ sourceRoot, apply });
  const output = path.resolve(
    '.agent/artifacts/list-indentation',
    apply ? 'applied.json' : 'audit.json',
  );
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  const { entries, changes, ...summary } = report;
  console.log(JSON.stringify({ ...summary, report: output }, null, 2));
}
