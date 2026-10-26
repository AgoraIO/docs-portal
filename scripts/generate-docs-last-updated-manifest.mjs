import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const GIT_LOG_DATE_MARKER = '@@';
const GIT_METADATA_ROOTS = ['content/docs', 'content/openapi'];
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx', '.json', '.yaml', '.yml']);
const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/generated/docs-last-updated-manifest.ts',
);

async function main() {
  const contentHash = await getContentHash();
  const existingSource = await fs.readFile(OUTPUT_PATH, 'utf8').catch(() => '');
  const hasGitHistory = await isGitHistoryAvailable();
  const incompleteHistory = !hasGitHistory || (await isGitHistoryIncomplete());
  const dirtyPaths = hasGitHistory ? await getDirtyContentPaths() : new Set();

  if (
    incompleteHistory &&
    dirtyPaths.size === 0 &&
    existingSource.includes(
      `export const DOCS_LAST_UPDATED_CONTENT_HASH = '${contentHash}';`,
    )
  ) {
    console.warn(
      '[docs-last-updated] Git history is incomplete; keeping the verified content snapshot',
    );
    return;
  }

  if (incompleteHistory) {
    console.warn(
      '[docs-last-updated] No matching content snapshot; update times without readable Git history will be unavailable',
    );
  }

  const manifest = hasGitHistory
    ? await loadGitLastUpdatedIndex(incompleteHistory)
    : new Map();

  if (!manifest) {
    throw new Error(
      'Unable to generate docs last-updated manifest from Git history',
    );
  }

  // A content hash may include local edits, but their previous commit dates
  // cannot describe that edited content in a later Git-free build.
  for (const filePath of dirtyPaths) manifest.delete(filePath);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    renderManifest(manifest, contentHash),
    'utf8',
  );

  console.log(
    `[docs-last-updated] generated ${manifest.size} entries at ${path.relative(process.cwd(), OUTPUT_PATH)}`,
  );
}

async function loadGitLastUpdatedIndex(incompleteHistory) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      [
        'log',
        // The shallow boundary looks like an initial commit containing every
        // file, but it cannot tell us when those files actually changed.
        ...(incompleteHistory ? ['--min-parents=1'] : []),
        `--format=${GIT_LOG_DATE_MARKER}%cI`,
        '--name-only',
        '--',
        ...GIT_METADATA_ROOTS,
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      },
    );

    return parseGitLastUpdatedIndex(stdout);
  } catch (error) {
    console.warn('[docs-last-updated] failed to read Git history', error);
    return null;
  }
}

async function isGitHistoryAvailable() {
  try {
    await execFileAsync('git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    return true;
  } catch {
    return false;
  }
}

async function isGitHistoryIncomplete() {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['rev-parse', '--is-shallow-repository'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    );

    return stdout.trim() === 'true';
  } catch {
    return true;
  }
}

async function getDirtyContentPaths() {
  const results = await Promise.all(
    [
      ['diff', '--name-only', '--no-renames', '-z', 'HEAD'],
      ['ls-files', '--others', '--exclude-standard', '-z'],
    ].map((args) =>
      execFileAsync('git', [...args, '--', ...GIT_METADATA_ROOTS], {
        cwd: process.cwd(),
        encoding: 'utf8',
      }),
    ),
  );
  return new Set(
    results.flatMap(({ stdout }) => stdout.split('\0').filter(Boolean)),
  );
}

async function getContentHash() {
  const files = [];
  async function collect(directory) {
    const entries = await fs
      .readdir(directory, { withFileTypes: true })
      .catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) await collect(filePath);
      else if (
        entry.isFile() &&
        CONTENT_EXTENSIONS.has(path.extname(entry.name))
      ) {
        files.push(filePath);
      }
    }
  }
  for (const root of GIT_METADATA_ROOTS) await collect(root);
  const hash = createHash('sha256');
  for (const filePath of files.sort()) {
    hash.update(filePath.split(path.sep).join('/')).update('\0');
    hash.update(await fs.readFile(filePath)).update('\0');
  }
  return hash.digest('hex');
}

function parseGitLastUpdatedIndex(stdout) {
  const index = new Map();
  let currentIso;

  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith(GIT_LOG_DATE_MARKER)) {
      currentIso = line.slice(GIT_LOG_DATE_MARKER.length).trim();
      continue;
    }

    if (currentIso && !index.has(line)) {
      index.set(line, currentIso);
    }
  }

  return new Map(
    [...index.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
}

function renderManifest(manifest, contentHash) {
  const entries = [...manifest.entries()]
    .map(([metadataPath, iso]) => renderManifestEntry(metadataPath, iso))
    .join('\n');

  return `// Generated by scripts/generate-docs-last-updated-manifest.mjs. Do not edit manually.\nexport const DOCS_LAST_UPDATED_CONTENT_HASH = '${contentHash}';\nexport const DOCS_LAST_UPDATED_BY_PATH: Record<string, string> = {\n${entries}\n};\n`;
}

function renderManifestEntry(metadataPath, iso) {
  const key = quoteString(metadataPath);
  const value = quoteString(new Date(iso).toISOString());
  const inlineEntry = `  ${key}: ${value},`;

  if (inlineEntry.length <= 80) {
    return inlineEntry;
  }

  return `  ${key}:\n    ${value},`;
}

function quoteString(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
