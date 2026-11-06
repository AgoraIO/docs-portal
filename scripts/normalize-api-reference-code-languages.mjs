#!/usr/bin/env bun
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { normalizeApiPrototypeLanguages } from './lib/api-center/code-language.mjs';

const args = process.argv.slice(2);
if (
  args.some((arg) => !['--check', '--write'].includes(arg)) ||
  (args.includes('--check') && args.includes('--write'))
)
  throw new Error(
    'Usage: bun scripts/normalize-api-reference-code-languages.mjs [--check | --write]',
  );
const write = args.includes('--write');
const files = execFileSync(
  'git',
  [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    'content/docs',
  ],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter((file) => file.endsWith('.mdx'));
let pages = 0,
  fences = 0;
for (const file of files) {
  const before = await readFile(file, 'utf8');
  const result = normalizeApiPrototypeLanguages(before);
  if (!result.changes.length) continue;
  pages++;
  fences += result.changes.length;
  if (write) await writeFile(file, result.source);
}
console.log(JSON.stringify({ mode: write ? 'write' : 'check', pages, fences }));
if (!write && pages) process.exitCode = 1;
