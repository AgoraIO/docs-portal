import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  auditSingleDocContentFidelity,
  compareRecords,
  createContentFidelityRecords,
} from './audit-single-doc-fidelity.mjs';

const tempDirs: string[] = [];

describe('auditSingleDocContentFidelity', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => rm(dir, { force: true, recursive: true })),
    );
  });

  it('compares visible content without treating href changes as content drift', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');

    await writeDoc(
      oldPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '# Intro',
        '',
        '- [SDK quickstart](../../video-calling/get-started/get-started-sdk)',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '# Intro',
        '',
        '- [SDK quickstart](../index.mdx)',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
    expect(report.summary.exactMatches).toBeGreaterThan(0);
  });

  it('expands legacy shared imports and applies platform projection', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const sharedPath = path.join(docsRoot, 'shared', 'snippet.mdx');
    const oldPath = path.join(docsRoot, 'legacy', 'page.mdx');
    const newPath = path.join(docsRoot, 'portal', 'page.mdx');

    await writeDoc(sharedPath, 'Shared body');
    await writeDoc(
      oldPath,
      [
        "import SharedBlock from '@shared/snippet';",
        '',
        '# Title',
        '',
        '<PlatformWrapper platform="android">',
        'Android only line',
        '</PlatformWrapper>',
        '',
        '<SharedBlock />',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '# Title',
        '',
        '<PlatformStructured platform="android">',
        'Android only line',
        '</PlatformStructured>',
        '',
        '<include>./snippet.mdx</include>',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'portal', 'snippet.mdx'), 'Shared body');

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      platform: 'android',
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('keeps tab labels and flags removed content blocks', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<Tabs defaultValue="android">',
        '<TabsList>',
        '<TabsTrigger value="android">Android</TabsTrigger>',
        '</TabsList>',
        '<TabsContent value="android">',
        '```ts',
        'join();',
        '```',
        '</TabsContent>',
        '</Tabs>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: ['```ts', 'joinLater();', '```'].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const tabRecord = sourceRecords.find((record) => record.kind === 'tab');
    expect(tabRecord?.value).toBe('Android');

    const comparison = compareRecords({
      sourceRecords,
      targetRecords,
    });

    expect(comparison.findings.changed).toEqual([
      expect.objectContaining({
        source: expect.objectContaining({ kind: 'code:ts' }),
        target: expect.objectContaining({ kind: 'code:ts' }),
      }),
    ]);
    expect(comparison.matches.exact).toBe(0);
  });
});

async function writeDoc(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}
