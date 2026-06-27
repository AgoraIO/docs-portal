import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const marketplaceDocsRoot = resolve(
  process.cwd(),
  'content/docs/en/realtime-media/marketplace',
);

const codeTokenTargets = [
  'content/docs/en/realtime-media/marketplace/build/add-video-and-ar-effects/metakit.mdx',
  'content/docs/en/realtime-media/marketplace/build/add-video-and-ar-effects/virtual-background.mdx',
];

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function listMarkdownFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function shouldResetOrderedListRun(line: string) {
  return (
    /^#{1,6}\s/.test(line) ||
    /^<\/?[A-Z][^>]*>\s*$/.test(line) ||
    /^\s*[-*]\s+\S/.test(line) ||
    (/^\S/.test(line) && !/^\d+\.\s+\S/.test(line))
  );
}

function findRepeatedOneMarkerRuns(source: string) {
  const runs: Array<{ indent: number; lines: number[] }> = [];
  const currentRuns = new Map<number, number[]>();
  let inFence = false;

  source.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      return;
    }

    if (shouldResetOrderedListRun(line)) {
      currentRuns.clear();
      return;
    }

    const marker = line.match(/^(\s*)(\d+)\.\s+\S/);

    if (!marker) {
      return;
    }

    const indent = marker[1].length;
    const value = Number(marker[2]);

    if (value !== 1) {
      currentRuns.delete(indent);
      return;
    }

    const run = currentRuns.get(indent) ?? [];
    run.push(index + 1);
    currentRuns.set(indent, run);

    if (run.length === 2) {
      runs.push({ indent, lines: [...run] });
    }
  });

  return runs;
}

function removeInlineCode(line: string) {
  return line.replace(/`[^`]*`/g, '');
}

function findBareTokenOutsideCode(source: string, pattern: RegExp) {
  const matches: number[] = [];
  let inFence = false;

  source.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      return;
    }

    if (pattern.test(removeInlineCode(line))) {
      matches.push(index + 1);
    }
  });

  return matches;
}

describe('marketplace audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    const repeatedRuns = [];

    for (const file of listMarkdownFiles(marketplaceDocsRoot)) {
      for (const run of findRepeatedOneMarkerRuns(readFileSync(file, 'utf8'))) {
        repeatedRuns.push({ path: relative(process.cwd(), file), ...run });
      }
    }

    expect(repeatedRuns).toEqual([]);
  });

  it('keeps null tokens inside code fences or inline code', () => {
    const visibleTokens = [];

    for (const path of codeTokenTargets) {
      for (const line of findBareTokenOutsideCode(
        readContent(path),
        /\bnull\b/,
      )) {
        visibleTokens.push({ path, line });
      }
    }

    expect(visibleTokens).toEqual([]);
  });

  it('keeps legacy inline HTML wrappers out of visible prose', () => {
    const visibleTokens = [];

    for (const file of listMarkdownFiles(marketplaceDocsRoot)) {
      for (const line of findBareTokenOutsideCode(
        readFileSync(file, 'utf8'),
        /<\/?strong>/,
      )) {
        visibleTokens.push({ path: relative(process.cwd(), file), line });
      }
    }

    expect(visibleTokens).toEqual([]);
  });
});
