import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/media-pull/build/integration-best-practices.md',
  'content/docs/en/realtime-media/media-pull/build/manage-agora-account.mdx',
  'content/docs/en/realtime-media/media-pull/build/receive-notifications.md',
  'content/docs/en/realtime-media/media-pull/get-started/enable-media-pull.mdx',
];

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
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

    if (/^#{1,6}\s/.test(line)) {
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

    if (run.length === 3) {
      runs.push({ indent, lines: [...run] });
    }
  });

  return runs;
}

function splitMarkdownRow(row: string) {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
}

describe('media pull audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    const repeatedRuns = [];

    for (const path of orderedListTargets) {
      for (const run of findRepeatedOneMarkerRuns(readContent(path))) {
        repeatedRuns.push({ path, ...run });
      }
    }

    expect(repeatedRuns).toEqual([]);
  });

  it('keeps the security data-classification table rectangular', () => {
    const source = readContent(
      'content/docs/en/realtime-media/media-pull/reference/security.md',
    );
    const tableLines = source
      .slice(
        source.indexOf('Data classification categories'),
        source.indexOf('### Data security'),
      )
      .split(/\r?\n/)
      .filter((line) => line.startsWith('|'));
    expect(tableLines.length).toBeGreaterThan(0);

    const expectedCells = splitMarkdownRow(tableLines[0]).length;

    for (const row of tableLines.slice(2)) {
      expect(splitMarkdownRow(row), row).toHaveLength(expectedCells);
    }
  });
});
