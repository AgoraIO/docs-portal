import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

function listRanges(compiled: string) {
  const ranges: Array<{ start: number; end: number }> = [];
  const openListIndexes: number[] = [];

  for (const match of compiled.matchAll(/<\/?_components\.ol>/g)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (token === '<_components.ol>') {
      openListIndexes.push(index);
      continue;
    }

    const start = openListIndexes.pop();

    if (start !== undefined) {
      ranges.push({ start, end: index });
    }
  }

  return ranges;
}

function expectMarkersInSameOrderedList(compiled: string, markers: string[]) {
  const markerIndexes = markers.map((marker) => {
    const markerIndex = compiled.indexOf(marker);
    expect(markerIndex).toBeGreaterThanOrEqual(0);

    return markerIndex;
  });

  const containingList = listRanges(compiled).find(({ start, end }) => {
    return markerIndexes.every((markerIndex) => {
      return markerIndex > start && markerIndex < end;
    });
  });

  expect(containingList).toBeDefined();
}

function splitMarkdownRow(row: string) {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
}

describe('server gateway audit regressions', () => {
  it('keeps account-management procedures in continuous ordered lists', async () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/realtime-media/rtc-server-sdk/build/manage-agora-account.md',
      ),
      'utf8',
    );
    const compiled = String(await compile(source, { jsx: true }));

    expectMarkersInSameOrderedList(compiled, [
      'signup page',
      'Fill in the required fields',
      'verification code',
    ]);
    expectMarkersInSameOrderedList(compiled, [
      'Create New',
      'Secured mode: APP ID + Token',
      'configure_project',
      'Submit',
    ]);
    expectMarkersInSameOrderedList(compiled, [
      'token builder',
      'details of your project',
      'Token Builder',
      'Copy the token',
    ]);
  });

  it('keeps the security data-classification table rectangular', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/realtime-media/rtc-server-sdk/reference/security.md',
      ),
      'utf8',
    );
    const tableLines = source
      .slice(
        source.indexOf('**Data classification categories**'),
        source.indexOf('### Data security'),
      )
      .split(/\r?\n/)
      .filter((line) => line.startsWith('|'));
    const expectedCells = splitMarkdownRow(tableLines[0]).length;

    for (const row of tableLines.slice(2)) {
      expect(splitMarkdownRow(row), row).toHaveLength(expectedCells);
    }
  });
});
