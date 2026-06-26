import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/transcoding/build/availability.md',
  'content/docs/en/realtime-media/transcoding/build/manage-agora-account.md',
  'content/docs/en/realtime-media/transcoding/build/receive-ncs-events.md',
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

describe('cloud transcoding audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    for (const path of orderedListTargets) {
      expect(findRepeatedOneMarkerRuns(readContent(path)), path).toEqual([]);
    }
  });
});
