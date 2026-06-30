import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md',
  'content/docs/en/realtime-media/speech-to-text/build/process-transcription-data/record-captions.md',
  'content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md',
  'content/docs/en/realtime-media/speech-to-text/reference/manage-agora-account.mdx',
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
    .filter((line) => line.startsWith('|'));
}

function expectRectangularTable(source: string, start: string, end: string) {
  const tableLines = tableRowsBetween(source, start, end);
  expect(tableLines.length).toBeGreaterThan(0);

  const expectedCells = splitMarkdownRow(tableLines[0]).length;

  for (const row of tableLines.slice(2)) {
    expect(splitMarkdownRow(row), row).toHaveLength(expectedCells);
  }
}

describe('speech-to-text audit regressions', () => {
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
    expectRectangularTable(
      readContent(
        'content/docs/en/realtime-media/speech-to-text/reference/security.md',
      ),
      'Data classification categories',
      '### Data security',
    );
  });

  it('uses concrete timestamps in REST quickstart JSON response examples', () => {
    const source = readContent(
      'content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md',
    );

    expect(source).not.toContain('"create_ts": null');
    expect(source).toContain('"create_ts": 1730974708');
  });

  it('keeps the quickstart flow diagram as an image instead of an indented code block', () => {
    const source = readContent(
      'content/docs/en/realtime-media/speech-to-text/get-started/quickstart.md',
    );

    expect(source).not.toContain(
      '    ![real-time-stt-flow](https://assets-docs.agora.io/images/real-time-stt/real-time-stt-flow.png)',
    );
    expect(source).toContain(
      '![real-time-stt-flow](https://assets-docs.agora.io/images/real-time-stt/real-time-stt-flow.png)',
    );
  });

  it('keeps auto-assigned UID guidance explicit instead of a bare null token', () => {
    const source = readContent(
      'content/docs/en/realtime-media/speech-to-text/reference/core-concepts.md',
    );

    expect(source).not.toContain('pass `0` or `null`');
    expect(source).toContain('pass `0` or the JSON `null` value');
  });
});
