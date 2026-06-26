import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

describe('device kit quickstart list numbering', () => {
  function expectMarkersToStayInSameOrderedList(
    compiled: string,
    markers: string[],
  ) {
    const markerIndexes = markers.map((marker) => {
      const markerIndex = compiled.indexOf(marker);
      expect(markerIndex).toBeGreaterThanOrEqual(0);

      return markerIndex;
    });
    const listRanges: Array<{ start: number; end: number }> = [];
    const openListIndexes: number[] = [];

    for (const match of compiled.matchAll(/<\/?_components\.ol>/g)) {
      const token = match[0];
      const index = match.index ?? 0;

      if (token === '<_components.ol>') {
        openListIndexes.push(index);
      } else {
        const start = openListIndexes.pop();

        if (start !== undefined) {
          listRanges.push({ start, end: index });
        }
      }
    }

    const containingList = listRanges.find(({ start, end }) => {
      return markerIndexes.every((markerIndex) => {
        return markerIndex > start && markerIndex < end;
      });
    });

    expect(containingList).toBeDefined();
  }

  it('keeps network configuration steps in a continuous ordered list', async () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/ai/device-kit/start-here/quickstart.md',
      ),
      'utf8',
    );

    const compiled = String(
      await compile(source, {
        jsx: true,
      }),
    );

    expectMarkersToStayInSameOrderedList(compiled, [
      'Left button',
      'The device is now in network configuration mode',
      'On your smartphone, open the Convo AI app',
      'Wait 3-5 seconds for the',
    ]);
  });
});
