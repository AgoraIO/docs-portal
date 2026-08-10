import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/ai/studio/build/integrations.md',
  'content/docs/en/ai/studio/build/test-agent.md',
  'content/docs/en/ai/studio/deploy/campaign.mdx',
  'content/docs/en/ai/studio/deploy/deploy-agent.md',
  'content/docs/en/ai/studio/deploy/import.md',
  'content/docs/en/ai/studio/deploy/inbound.md',
  'content/docs/en/ai/studio/deploy/sip-trunk.mdx',
  'content/docs/en/ai/studio/observe/analytics.md',
  'content/docs/en/ai/studio/observe/call-history.md',
  'content/docs/en/ai/studio/quickstart.md',
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

describe('agent studio audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    const repeatedRuns = [];

    for (const path of orderedListTargets) {
      for (const run of findRepeatedOneMarkerRuns(readContent(path))) {
        repeatedRuns.push({ path, ...run });
      }
    }

    expect(repeatedRuns).toEqual([]);
  });
});
