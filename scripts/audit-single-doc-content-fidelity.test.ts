import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  auditCompletedMigrationRows,
  auditSingleDocContentFidelity,
  compareRecords,
  createContentFidelityRecords,
  detectLegacyResidue,
  renderMarkdownReport,
} from './audit-single-doc-fidelity.mjs';
import { parseCsv } from './migration-control-table.mjs';

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

  it('detects legacy component residue and keeps the markdown report concise', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');

    await writeDoc(oldPath, ['# Intro', '', 'Important note.'].join('\n'));
    await writeDoc(
      newPath,
      [
        '# Intro',
        '',
        '<Admonition type="info">',
        'Important note.',
        '</Admonition>',
        '',
        "import Shared from '@shared/common/foo.mdx';",
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({ oldPath, newPath });
    const markdown = renderMarkdownReport(report);

    expect(report.summary.legacyResidue).toBe(3);
    expect(report.findings.legacyResidue.examples).toEqual([
      'legacy-component:Admonition',
      'legacy-shared-import',
    ]);
    expect(markdown).toContain('Legacy residue: 3 issue(s); examples:');
    expect(markdown).not.toContain('## Legacy residue');
  });

  it('ignores approved target MDX components and code examples in residue checks', () => {
    const residue = detectLegacyResidue(
      [
        '<Tabs defaultValue="js">',
        '<TabsContent value="js">Content</TabsContent>',
        '</Tabs>',
        '',
        '```mdx',
        '<Admonition type="info">Example only</Admonition>',
        '```',
        '',
        '`<PlatformFilter>` is mentioned as text.',
      ].join('\n'),
    );

    expect(residue.total).toBe(0);
  });

  it('audits only completed migration rows and writes audit progress back', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-batch-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const completedSourcePath = 'docs/rtc/get-started/quick-start.ios.mdx';
    const completedTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.ios.mdx';
    const pendingSourcePath = 'docs/rtc/get-started/run-demo.ios.mdx';
    const pendingTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.ios.mdx';

    await writeDoc(
      path.join(sourceRoot, completedSourcePath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, completedTargetPath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(sourceRoot, pendingSourcePath),
      ['# 跑通示例', '', '运行项目。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, pendingTargetPath),
      ['# 跑通示例', '', '运行项目。'].join('\n'),
    );
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${completedSourcePath},${completedTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
        `${pendingSourcePath},${pendingTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,not_started,not_started,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });

    expect(report.summary).toMatchObject({
      auditedRows: 1,
      eligibleRows: 1,
      passed: 1,
    });

    const rows = parseCsv(await readFile(pathMapPath, 'utf8'));
    const headers = rows[0];
    const completedValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[1][index]]),
    );
    const pendingValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[2][index]]),
    );

    expect(completedValues.audit_progress).toBe('completed');
    expect(completedValues.audit_result).toBe('pass');
    expect(completedValues.last_audit_report).toContain('audit/');
    expect(pendingValues.audit_progress).toBe('not_started');
    expect(pendingValues.audit_result).toBe('');
  });

  it('writes legacy component residue results back during batch audit', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-batch-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const sourcePath = 'docs/rtc/get-started/quick-start.ios.mdx';
    const targetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.ios.mdx';

    await writeDoc(
      path.join(sourceRoot, sourcePath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, targetPath),
      [
        '# 快速开始',
        '',
        '<Admonition type="info">',
        '加入频道。',
        '</Admonition>',
      ].join('\n'),
    );
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${sourcePath},${targetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });
    const rows = parseCsv(await readFile(pathMapPath, 'utf8'));
    const headers = rows[0];
    const values = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[1][index]]),
    );

    expect(report.summary.legacyResidue).toBe(1);
    expect(values.audit_progress).toBe('completed');
    expect(values.audit_result).toBe('legacy-residue:2');
    expect(values.next_step).toBe(
      'Remove legacy component residue and rerun the audit script.',
    );
  });
});

async function writeDoc(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}
