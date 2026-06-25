import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  analyzeFile,
  auditDocsRenderingPatterns,
} from './audit-doc-rendering-patterns.mjs';

const tempDirs: string[] = [];

describe('auditDocsRenderingPatterns', () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  });

  it('flags approved MDX components inside .md files', () => {
    const result = analyzeFile(
      'en/realtime-media/rtm/build/channels/stream-channel.md',
      [
        '---',
        'title: Stream channels',
        '---',
        '',
        '<CodeBlockTabs defaultValue="java">',
        '<CodeBlockTab value="java">',
        '```java',
        'example();',
        '```',
        '</CodeBlockTab>',
        '</CodeBlockTabs>',
      ].join('\n'),
    );

    expect(result.statuses).toContain('needs-mdx-extension');
    expect(result.matches['md-with-mdx-jsx:CodeBlockTabs']).toBe(2);
    expect(result.matches['md-with-mdx-jsx:CodeBlockTab']).toBe(2);
  });

  it('flags legacy table, anchor, and frontmatter patterns', () => {
    const result = analyzeFile(
      'en/example/page.mdx',
      [
        '---',
        'title: Example',
        'displayed_sidebar: old',
        '---',
        '',
        '### <a name="legacy"></a>Legacy anchor',
        '<a id="legacy-id" />',
        '',
        '<Table>',
        '<Tr><Td>Value</Td></Tr>',
        '</Table>',
        '',
        '<table><tr><td>HTML</td></tr></table>',
      ].join('\n'),
    );

    expect(result.statuses).toContain('needs-frontmatter-cleanup');
    expect(result.statuses).toContain('needs-anchor-normalization');
    expect(result.statuses).toContain('needs-table-normalization');
    expect(result.matches['legacy-frontmatter:displayed_sidebar']).toBe(1);
    expect(result.matches['legacy-anchor-id']).toBe(1);
    expect(result.matches['legacy-table-component:Table']).toBe(2);
    expect(result.matches['native-html-table']).toBeGreaterThan(0);
  });

  it('does not flag registered components in .mdx files', () => {
    const result = analyzeFile(
      'en/realtime-media/video/build/page.mdx',
      [
        '<Tabs defaultValue="android">',
        '<Tab value="android">Android</Tab>',
        '</Tabs>',
        '<PlatformStructured platform="android">',
        'Android body',
        '</PlatformStructured>',
        '<CardGrid>',
        '<FeatureCard title="Feature">Feature body</FeatureCard>',
        '</CardGrid>',
        '<Callout title="Note">Body</Callout>',
        '<CommandBlock code="bun run dev" />',
      ].join('\n'),
    );

    expect(result.statuses).toEqual([]);
    expect(result.matches).toEqual({});
  });

  it('ignores JSX-looking syntax inside Markdown code spans and fenced code', () => {
    const result = analyzeFile(
      'en/realtime-media/video/build/example.mdx',
      [
        'Use `AddComponent<VideoSurface>()` in Unity.',
        '',
        '```tsx',
        '<div>',
        '  <UnknownWidget />',
        '  client.join("<TOKEN>", "<CHANNEL>");',
        '</div>',
        '```',
      ].join('\n'),
    );

    expect(result.statuses).toEqual([]);
    expect(result.matches).toEqual({});
  });

  it('flags nested raw HTML structures outside code blocks', () => {
    const result = analyzeFile(
      'en/example/nested-html.mdx',
      [
        '| Event | Description |',
        '| --- | --- |',
        '| history | <ul><li>Messages</li><li>Timestamps</li></ul> |',
      ].join('\n'),
    );

    expect(result.statuses).toContain('manual-html-review');
    expect(result.matches['raw-html:ul']).toBe(2);
    expect(result.matches['raw-html:li']).toBe(4);
  });

  it('scans both language trees and summarizes affected files', () => {
    const docsRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'docs-rendering-audit-'),
    );
    tempDirs.push(docsRoot);

    writeFile(
      path.join(docsRoot, 'en', 'valid.mdx'),
      '<Tabs defaultValue="web"><Tab value="web">Web</Tab></Tabs>',
    );
    writeFile(
      path.join(docsRoot, 'en', 'legacy.mdx'),
      '<Image src="/a.png" />',
    );
    writeFile(
      path.join(docsRoot, 'zh-CN', 'legacy.md'),
      '<CodeBlockTabs defaultValue="java"></CodeBlockTabs>',
    );

    const report = auditDocsRenderingPatterns({ docsRoot });

    expect(report.summary.markdownFiles).toBe(3);
    expect(report.summary.affectedFiles).toBe(2);
    expect(report.summary.filesByLocale).toEqual({ en: 1, 'zh-CN': 1 });
    expect(report.summary.statusCounts['needs-image-standard']).toBe(1);
    expect(report.summary.statusCounts['needs-mdx-extension']).toBe(1);
    expect(report.filesByStatus['needs-image-standard']).toEqual([
      'en/legacy.mdx',
    ]);
    expect(report.filesByStatus['needs-mdx-extension']).toEqual([
      'zh-CN/legacy.md',
    ]);
  });
});

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}
