import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  analyzeMdxBuildSyntax,
  auditMdxBuildSyntax,
  formatMdxBuildSyntaxReport,
} from './audit-mdx-build-syntax.mjs';

const tempDirs: string[] = [];

describe('auditMdxBuildSyntax', () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });

  it('flags migration patterns that currently block the MDX build', () => {
    const issues = analyzeMdxBuildSyntax(
      'zh-CN/example/page.mdx',
      [
        '| Event | Description |',
        '| --- | --- |',
        '| Event | <code id=onMessageEvent>onMessageEvent</code> |',
        '',
        '1. Add the IP allowlist.',
        '   - **IP 白名单**：按步骤配置。',
        '',
        '    <Accordions>',
        '    <Accordion title="Allowlist">',
        '    Body',
        '    </Accordion>',
        '    </Accordions>',
        '',
        '<Slot for="table-cell-extra">',
        '- Nested detail',
        '</Slot>',
        '',
        '<Slot for="legacy-list">',
        '- first</li><li>second',
        '</Slot>',
        '',
        'Use " {" as text.',
        'Make sure `width` <= 1.',
        '',
        '为增加查询的灵活性，并通过 <PlatformInline platform="android">',
        'onAlarmInfoQueryDone 回调',
        '</PlatformInline>获取查询结果。',
        '',
        '1. Nested table:',
        '',
        '      | Name | Description |',
        '| --- | --- |',
        '| App ID | <Slot name="bad-table-slot" /> |',
        '',
        '<Tabs groupId="package-manager">',
        '',
        '#### GitHub',
        '',
        '</TabsContent>',
      ].join('\n'),
    );

    expect(issues.map((issue) => issue.ruleId)).toEqual(
      expect.arrayContaining([
        'jsx-unquoted-attribute',
        'list-item-block-jsx',
        'slot-outside-table',
        'raw-html-list-tag',
        'tabs-content-without-open',
        'unescaped-mdx-brace',
        'unescaped-mdx-angle',
        'inline-platform-block',
        'table-indentation-mismatch',
      ]),
    );
  });

  it('does not flag allowed top-level structures or code examples', () => {
    const issues = analyzeMdxBuildSyntax(
      'zh-CN/example/valid.mdx',
      [
        '<Tabs groupId="install-os">',
        '<TabsList>',
        '  <TabsTrigger value="macos">macOS</TabsTrigger>',
        '</TabsList>',
        '',
        '<TabsContent value="macos">',
        '',
        'Install from Terminal.',
        '',
        '</TabsContent>',
        '</Tabs>',
        '',
        '| Name | Description | Extra |',
        '| --- | --- | --- |',
        '| Image | <Slot name="image-detail" /> | <Slot name="image-extra" /> |',
        '',
        '<Slot for="image-detail">',
        '',
        'A table-cell detail.',
        '',
        '</Slot>',
        '',
        '<Slot for="image-extra">',
        '',
        'A second table-cell detail.',
        '',
        '</Slot>',
        '',
        '```mdx',
        '<code id=onMessageEvent>literal example</code>',
        '</TabsContent>',
        '<li>literal</li>',
        '```',
      ].join('\n'),
    );

    expect(issues).toEqual([]);
  });

  it('scans a docs tree and formats a concise report', () => {
    const docsRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'docs-mdx-build-syntax-'),
    );
    tempDirs.push(docsRoot);

    writeFile(
      path.join(docsRoot, 'zh-CN', 'bad.mdx'),
      '<code id=onMessageEvent>onMessageEvent</code>',
    );
    writeFile(path.join(docsRoot, 'en', 'ok.mdx'), '# OK');

    const report = auditMdxBuildSyntax({ docsRoot });

    expect(report.summary.filesScanned).toBe(2);
    expect(report.summary.affectedFiles).toBe(1);
    expect(report.summary.issueCount).toBe(1);
    expect(report.summary.ruleCounts['jsx-unquoted-attribute']).toBe(1);
    expect(report.issues[0]).toMatchObject({
      filePath: 'zh-CN/bad.mdx',
      line: 1,
      ruleId: 'jsx-unquoted-attribute',
    });
    expect(formatMdxBuildSyntaxReport(report)).toContain(
      'Found 1 potential MDX build syntax issue',
    );
  });
});

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}
