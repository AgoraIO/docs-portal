#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const pageExtensions = ['.mdx', '.md'];

const args = parseArgs(process.argv.slice(2));
const rootDir = path.resolve(args.root ?? 'content/docs/zh-CN');
const write = Boolean(args.write);
const reportPath = args.report ? path.resolve(args.report) : null;

if (args.help) {
  printHelp();
  process.exit(0);
}

const changes = collectChanges(rootDir);

if (write) {
  writeChanges(changes);
}

const report = {
  generatedAt: new Date().toISOString(),
  root: path.relative(process.cwd(), rootDir),
  mode: write ? 'write' : 'check',
  count: changes.length,
  changes,
};

if (reportPath) {
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (changes.length === 0) {
  console.log('No singleton sidebar folders found.');
} else {
  console.log(
    `${write ? 'Flattened' : 'Found'} ${changes.length} singleton sidebar folder${changes.length === 1 ? '' : 's'}.`,
  );
  for (const change of changes) {
    console.log(`${change.metaPath}: ${change.from} -> ${change.to}`);
  }
}

function collectChanges(root) {
  const metaFiles = listMetaFiles(root);
  const changesByMeta = [];

  for (const metaFile of metaFiles) {
    if (path.resolve(metaFile) === path.join(root, 'meta.json')) {
      continue;
    }

    const meta = readJson(metaFile);
    if (!meta || !Array.isArray(meta.pages) || meta.root) {
      continue;
    }

    const metaDir = path.dirname(metaFile);
    const replacements = new Map();

    for (const entry of meta.pages) {
      if (!isVisibleLocalStringEntry(entry)) {
        continue;
      }

      const entryPath = path.join(metaDir, ...entry.split('/').filter(Boolean));
      if (pageExists(entryPath)) {
        continue;
      }

      const childMeta = readJson(path.join(entryPath, 'meta.json'));
      if (
        !childMeta ||
        childMeta.navScope ||
        childMeta.root ||
        folderHasIndex(entryPath)
      ) {
        continue;
      }

      const resolved = resolveEntry(metaDir, entry, new Set());
      if (
        resolved.eligible &&
        resolved.leaves.length === 1 &&
        resolved.leaves[0] !== entry
      ) {
        replacements.set(entry, {
          childTitle: childMeta.title ?? '',
          to: resolved.leaves[0],
        });
      }
    }

    if (replacements.size === 0) {
      continue;
    }

    const metaPath = path.relative(process.cwd(), metaFile);
    for (const [from, replacement] of replacements) {
      changesByMeta.push({
        childTitle: replacement.childTitle,
        from,
        metaPath,
        title: readPageTitle(path.join(metaDir, ...replacement.to.split('/'))),
        to: replacement.to,
      });
    }
  }

  return changesByMeta;
}

function writeChanges(changesToWrite) {
  const byFile = new Map();

  for (const change of changesToWrite) {
    if (!byFile.has(change.metaPath)) {
      byFile.set(change.metaPath, []);
    }
    byFile.get(change.metaPath).push(change);
  }

  for (const [relativeMetaPath, fileChanges] of byFile) {
    const file = path.resolve(relativeMetaPath);
    const meta = readJson(file);
    const replacementByFrom = new Map(
      fileChanges.map((change) => [change.from, change.to]),
    );

    meta.pages = meta.pages.map((entry) =>
      typeof entry === 'string' && replacementByFrom.has(entry)
        ? replacementByFrom.get(entry)
        : entry,
    );

    writeFileSync(file, `${JSON.stringify(meta, null, 2)}\n`);
  }
}

function resolveEntry(metaDir, entry, seen) {
  if (!isVisibleLocalStringEntry(entry)) {
    return { eligible: false, leaves: [] };
  }

  const entryPath = path.join(metaDir, ...entry.split('/').filter(Boolean));
  if (pageExists(entryPath)) {
    return { eligible: true, leaves: [entry] };
  }

  if (!existsSync(entryPath) || !statSync(entryPath).isDirectory()) {
    return { eligible: false, leaves: [] };
  }

  return resolveFolder(entryPath, entry, seen);
}

function resolveFolder(folderPath, relativePrefix, seen) {
  const meta = readJson(path.join(folderPath, 'meta.json'));
  if (
    !meta ||
    meta.navScope ||
    meta.root ||
    folderHasIndex(folderPath) ||
    seen.has(folderPath)
  ) {
    return { eligible: false, leaves: [] };
  }

  if (!Array.isArray(meta.pages) || meta.pages.length === 0) {
    return { eligible: false, leaves: [] };
  }

  seen.add(folderPath);

  const leaves = [];
  for (const page of meta.pages) {
    if (isHiddenStringEntry(page)) {
      continue;
    }

    if (typeof page !== 'string') {
      return { eligible: false, leaves: [] };
    }

    const result = resolveEntry(folderPath, page, new Set(seen));
    if (!result.eligible) {
      return { eligible: false, leaves: [] };
    }

    for (const leaf of result.leaves) {
      leaves.push(path.posix.join(relativePrefix, leaf));
    }

    if (leaves.length > 1) {
      return { eligible: true, leaves };
    }
  }

  return { eligible: leaves.length > 0, leaves };
}

function listMetaFiles(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMetaFiles(entryPath));
    } else if (entry.isFile() && entry.name === 'meta.json') {
      files.push(entryPath);
    }
  }

  return files;
}

function pageExists(basePath) {
  return pageExtensions.some((extension) =>
    existsSync(`${basePath}${extension}`),
  );
}

function folderHasIndex(folderPath) {
  return pageExists(path.join(folderPath, 'index'));
}

function readJson(file) {
  if (!existsSync(file)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readPageTitle(basePath) {
  for (const extension of pageExtensions) {
    const file = `${basePath}${extension}`;
    if (!existsSync(file)) {
      continue;
    }

    const match = readFileSync(file, 'utf8').match(
      /^---\s*\n[\s\S]*?\ntitle:\s*['"]?([^'"\n]+)['"]?\s*\n[\s\S]*?\n---/m,
    );
    return match?.[1] ?? '';
  }

  return '';
}

function isVisibleLocalStringEntry(entry) {
  return (
    typeof entry === 'string' &&
    entry.length > 0 &&
    !isHiddenStringEntry(entry) &&
    !entry.startsWith('[') &&
    !entry.startsWith('---') &&
    !entry.startsWith('external:') &&
    !entry.includes('://')
  );
}

function isHiddenStringEntry(entry) {
  return typeof entry === 'string' && entry.startsWith('!');
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--write') {
      parsed.write = true;
    } else if (arg === '--root') {
      parsed.root = argv[++index];
    } else if (arg === '--report') {
      parsed.report = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/flatten-singleton-sidebar-folders.mjs [options]

Find zh-CN Fumadocs sidebar folders that expand to exactly one local page and
optionally replace the folder entry with a direct leaf page path in meta.json.

Options:
  --root <dir>      Content root to scan. Defaults to content/docs/zh-CN.
  --report <file>  Write a JSON report with detected or applied changes.
  --write          Apply changes. Without this flag, the script is read-only.
  -h, --help       Show this help.
`);
}
