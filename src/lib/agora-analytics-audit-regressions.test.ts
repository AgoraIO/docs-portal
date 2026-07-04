import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/agora-analytics/build/explore-and-analyze-data/data-insight-plus.md',
  'content/docs/en/realtime-media/agora-analytics/build/integrate-and-embed/datadog-integration.md',
  'content/docs/en/realtime-media/agora-analytics/build/manage-agora-account.md',
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

function tableSection(source: string, title: string, endMarker: string) {
  const legacyTitle = `**${title}**`;
  const accordionTitle = `<Accordion title="${title}">`;
  const start = Math.max(
    source.indexOf(legacyTitle),
    source.indexOf(accordionTitle),
  );

  expect(start).toBeGreaterThanOrEqual(0);

  return source.slice(start, source.indexOf(endMarker));
}

describe('agora analytics audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    for (const path of orderedListTargets) {
      expect(findRepeatedOneMarkerRuns(readContent(path)), path).toEqual([]);
    }
  });

  it('keeps the security data-classification table rectangular', () => {
    const source = readContent(
      'content/docs/en/realtime-media/agora-analytics/reference/security.md',
    );
    const tableLines = tableSection(
      source,
      'Data classification categories',
      '### Data security',
    )
      .split(/\r?\n/)
      .filter((line) => line.startsWith('|'));
    const expectedCells = splitMarkdownRow(tableLines[0]).length;

    for (const row of tableLines.slice(2)) {
      expect(splitMarkdownRow(row), row).toHaveLength(expectedCells);
    }
  });
});
