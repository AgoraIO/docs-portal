import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterMigration } from './lib/api-center/migration-audit.mjs';

const roots: string[] = [];

async function fixture(body: string, overrides: Record<string, unknown> = {}) {
  const root = await fs.mkdtemp(path.join('/tmp', 'api-center-output-audit-'));
  roots.push(root);
  const targetPath = 'content/docs/zh-CN/api-reference/rtc/web/example.mdx';
  const sourceUrl = 'https://doc.shengwang.cn/api-ref/rtc/web/example';
  const sourcePath = 'html-docs/rtc/web/example.html';
  const content = `---\ntitle: Example\n_migration:\n  type: generated-html\n  status: migrated\n  sourceUrl: ${sourceUrl}\n  sourcePath: ${sourcePath}\n  generator: typedoc\n  warnings: []\n---\n\n${body}\n`;
  await fs.mkdir(path.join(root, path.dirname(targetPath)), { recursive: true });
  await fs.writeFile(path.join(root, targetPath), content);
  const record = {
    targetPath,
    contentHash: createHash('sha256').update(content).digest('hex'),
    sourceUrl,
    sourcePath,
    type: 'generated-html',
    ...overrides,
  };
  await fs.mkdir(path.join(root, 'docs/migration'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'docs/migration/api-center-generated-files.json'),
    `${JSON.stringify({ schemaVersion: 1, files: [record] })}\n`,
  );
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

describe('API Center generated output audit', () => {
  it('accepts a local generated MDX page with matching provenance', async () => {
    const root = await fixture('# Heading\n\nLocal API content.');
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.counts).toMatchObject({ mdxFiles: 1, errors: 0 });
  });

  it('rejects old-site body links, iframe, and placeholders but permits sourceUrl provenance', async () => {
    const root = await fixture(
      '[Legacy](https://doc.shengwang.cn/api-ref/rtc/web/old)\n\n<iframe src="old" />\n\nTODO: migrate this page.',
    );
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.issues.map((item: { code: string }) => item.code)).toEqual(
      expect.arrayContaining(['legacy-body-link', 'iframe', 'placeholder']),
    );
  });

  it('rejects legacy anchors that would render as visible escaped text', async () => {
    const root = await fixture(
      '| &lt;a id="pub-methods"&gt;&lt;/a&gt; Public methods | |\n| --- | --- |',
    );
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'escaped-anchor-text' }),
      ]),
    );
  });

  it('rejects Markdown links wrapped in inline code outside fenced examples', async () => {
    const root = await fixture(
      '### `[join](/zh-CN/api-reference/rtc/web/join)`',
    );
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'literal-markdown-link' }),
      ]),
    );
  });

  it('rejects links nested inside auto-linked Fumadocs headings', async () => {
    const root = await fixture(
      '## [◆](/zh-CN/api-reference/example#member)member',
    );
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'heading-link' })]),
    );
  });

  it('ignores HTML examples inside fenced code', async () => {
    const root = await fixture('```tsx\n<img src="https://example.com/icon.png" />\n```');
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.counts.errors).toBe(0);
  });

  it('accepts valid JSX object and array expression attributes', async () => {
    const root = await fixture(
      '<SolutionCard actions={[{"label":"Android","href":"/android"}]} />',
    );
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.counts.errors).toBe(0);
  });

  it('rejects ownership hash drift', async () => {
    const root = await fixture('Content.', { contentHash: 'not-the-hash' });
    const { report } = await auditApiCenterMigration({ repoRoot: root });
    expect(report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'owned-hash-mismatch' })]),
    );
  });

  it('audits generated navigation meta as JSON instead of MDX', async () => {
    const root = await fs.mkdtemp(path.join('/tmp', 'api-center-meta-audit-'));
    roots.push(root);
    const targetPath = 'content/docs/zh-CN/api-reference/rtc/web/meta.json';
    const content = '{"title":"Web","pages":["overview"]}\n';
    await fs.mkdir(path.join(root, path.dirname(targetPath)), { recursive: true });
    await fs.writeFile(path.join(root, targetPath), content);
    await fs.mkdir(path.join(root, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(root, 'docs/migration/api-center-generated-files.json'),
      `${JSON.stringify({
        schemaVersion: 1,
        files: [
          {
            targetPath,
            contentHash: createHash('sha256').update(content).digest('hex'),
            sourceUrl: 'https://doc.shengwang.cn/api-center',
            sourcePath: 'api-center-manifest.json',
            type: 'navigation-meta',
          },
        ],
      })}\n`,
    );

    const { report } = await auditApiCenterMigration({ repoRoot: root });

    expect(report.counts).toMatchObject({
      mdxFiles: 0,
      metaFiles: 1,
      errors: 0,
    });
  });
});
