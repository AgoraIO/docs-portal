import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const excludedGuideRoots = new Set([
  'platform',
  'studio',
  'device-kit',
  'ten-agent',
]);

function readMeta(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Follow explicit sidebar membership. A deferred file on disk is never enough
// to enroll a topic. The source tree has optional, absent folder index pages.
function guidePages(root, relative = '') {
  const folder = join(root, relative);
  return readMeta(join(folder, 'meta.json')).pages.flatMap((entry) => {
    if (
      entry.startsWith('[') ||
      entry.startsWith('---') ||
      entry.startsWith('!')
    )
      return [];
    if (!relative && excludedGuideRoots.has(entry)) return [];
    if (entry === 'index') {
      return ['md', 'mdx'].some((ext) =>
        existsSync(join(folder, `index.${ext}`)),
      )
        ? [relative]
        : [];
    }
    const path = relative ? `${relative}/${entry}` : entry;
    if (existsSync(join(root, path, 'meta.json')))
      return guidePages(root, path);
    if (
      !['md', 'mdx'].some((ext) => existsSync(join(root, `${path}.${ext}`)))
    ) {
      throw new Error(`Sidebar topic has no page: ${join(root, path)}`);
    }
    return [path];
  });
}

function apiPages(root) {
  return readMeta(join(root, 'meta.json'))
    .pages.filter(
      (entry) =>
        !entry.startsWith('---') &&
        !entry.startsWith('[') &&
        !existsSync(join(root, entry, 'meta.json')),
    )
    .map((entry) => (entry === 'index' ? '' : entry));
}

const guideRoot = join(repoRoot, 'content/docs/en/ai');
const apiRoot = join(
  repoRoot,
  'content/docs/en/api-reference/api-ref/conversational-ai',
);
const content = [
  '// Generated from the ConvoAI sidebars. Run: node scripts/generate-convoai-doc-pages.mjs',
  '// Do not enroll deferred files merely because they exist on disk.',
  `export const CONVOAI_GUIDE_PAGES = ${JSON.stringify({ voice: guidePages(guideRoot), platform: guidePages(join(guideRoot, 'platform')) }, null, 2)} as const;`,
  `export const CONVOAI_API_PAGES = ${JSON.stringify({ voice: apiPages(apiRoot), platform: apiPages(join(apiRoot, 'platform')) }, null, 2)} as const;`,
  '',
].join('\n');
const output = join(repoRoot, 'src/generated/convoai-doc-pages.ts');
const formatted = spawnSync(
  join(repoRoot, 'node_modules/.bin/biome'),
  ['format', '--stdin-file-path=src/generated/convoai-doc-pages.ts'],
  { input: content, encoding: 'utf8', cwd: repoRoot },
);
if (formatted.status !== 0)
  throw new Error(
    formatted.stderr || 'Unable to format ConvoAI page manifest.',
  );
const result = formatted.stdout;
if (process.argv.includes('--check')) {
  if (!existsSync(output) || readFileSync(output, 'utf8') !== result) {
    throw new Error(
      'ConvoAI sidebar membership changed. Run node scripts/generate-convoai-doc-pages.mjs and review the mapping.',
    );
  }
} else {
  writeFileSync(output, result);
}
