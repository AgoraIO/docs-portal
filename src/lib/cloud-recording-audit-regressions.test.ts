import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx',
  'content/docs/en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx',
  'content/docs/en/realtime-media/cloud-recording/build/process-recorded-files/manage-files.mdx',
  'content/docs/en/realtime-media/cloud-recording/build/set-up-authentication/authentication-workflow.mdx',
  'content/docs/en/realtime-media/cloud-recording/build/set-up-authentication/integrate-token-generation.mdx',
  'content/docs/en/realtime-media/cloud-recording/manage-agora-account.mdx',
  'content/docs/en/realtime-media/cloud-recording/middleware-quickstart.mdx',
];

const tokenTargets = [
  'content/docs/en/realtime-media/cloud-recording/build/customize-the-recording/webpage-load-timeout.mdx',
  'content/docs/en/realtime-media/cloud-recording/build/set-up-authentication/authentication-workflow.mdx',
  'content/docs/en/realtime-media/cloud-recording/core-concepts.mdx',
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

function tableRowsBetween(source: string, start: string, end: string) {
  return source
    .slice(source.indexOf(start), source.indexOf(end))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
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

describe('cloud recording audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    const repeatedRuns = [];

    for (const path of orderedListTargets) {
      for (const run of findRepeatedOneMarkerRuns(readContent(path))) {
        repeatedRuns.push({ path, ...run });
      }
    }

    expect(repeatedRuns).toEqual([]);
  });

  it('keeps the audited security table rectangular', () => {
    const tableLines = tableRowsBetween(
      readContent(
        'content/docs/en/realtime-media/cloud-recording/reference/security.mdx',
      ),
      'Data classification categories',
      '### Data security',
    );
    expect(tableLines.length).toBeGreaterThan(0);

    const expectedCells = splitMarkdownRow(tableLines[0]).length;

    for (const row of tableLines.slice(2)) {
      expect(splitMarkdownRow(row), row).toHaveLength(expectedCells);
    }
  });

  it('keeps null and undefined tokens in code-only contexts', () => {
    const visibleTokens = [];

    for (const path of tokenTargets) {
      for (const line of findBareTokenOutsideCode(
        readContent(path),
        /\b(null|undefined)\b/,
      )) {
        visibleTokens.push({ path, line });
      }
    }

    expect(visibleTokens).toEqual([]);
  });
});
