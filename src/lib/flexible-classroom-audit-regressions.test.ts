import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/customize-ui-scene-sdk.mdx',
  'content/docs/en/realtime-media/flexible-classroom/build/enable-teaching-features/record-a-class.mdx',
  'content/docs/en/realtime-media/flexible-classroom/build/enable-teaching-features/supply-course-materials.mdx',
  'content/docs/en/realtime-media/flexible-classroom/build/manage-agora-account.mdx',
  'content/docs/en/realtime-media/flexible-classroom/build/set-up-your-account-and-authentication/authentication-workflow.mdx',
  'content/docs/en/realtime-media/flexible-classroom/build/set-up-your-account-and-authentication/enable-flexible-classroom.mdx',
  'content/docs/en/realtime-media/flexible-classroom/quickstart.mdx',
];

const codeTokenTargets = [
  'content/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/embed-custom-plugin.mdx',
  'content/docs/en/realtime-media/flexible-classroom/reference/plugin-technology-principles.mdx',
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

function findTokenOutsideCodeFence(source: string, pattern: RegExp) {
  const matches: number[] = [];
  let inFence = false;

  source.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (!inFence && pattern.test(line)) {
      matches.push(index + 1);
    }
  });

  return matches;
}

describe('flexible classroom audit regressions', () => {
  it('keeps ordered procedures source-numbered after the first step', () => {
    const repeatedRuns = [];

    for (const path of orderedListTargets) {
      for (const run of findRepeatedOneMarkerRuns(readContent(path))) {
        repeatedRuns.push({ path, ...run });
      }
    }

    expect(repeatedRuns).toEqual([]);
  });

  it('keeps TypeScript undefined tokens inside code fences', () => {
    const visibleTokens = [];

    for (const path of codeTokenTargets) {
      for (const line of findTokenOutsideCodeFence(
        readContent(path),
        /\bundefined\b/,
      )) {
        visibleTokens.push({ path, line });
      }
    }

    expect(visibleTokens).toEqual([]);
  });
});
