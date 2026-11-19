import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { normalizeLegacyCodeHighlights } from './lib/legacy-code-highlights.mjs';
import { migrateLegacyPage } from './migrate-legacy-docs.mjs';

it.each(['ruby', 'python'])(
  'regenerates hash highlight ranges in %s',
  (language) => {
    const result = normalizeLegacyCodeHighlights(
      `\`\`\`${language}\n# ordinary comment\n# highlight-start\nvalue = "# highlight-start"\n# highlight-end\n\`\`\``,
    );
    expect(result).toContain('# [!code highlight:1]');
    expect(result).toContain('# ordinary comment');
    expect(result).toContain('value = "# highlight-start"');
    expect(result).not.toMatch(/^# highlight-(?:start|end)$/m);
    expect(normalizeLegacyCodeHighlights(result)).toBe(result);
  },
);

it('converts ranges only inside fences, retaining blank highlighted lines and code', () => {
  const input = [
    '// highlight-start',
    '```shell',
    '//highlight-start',
    'curl example \\',
    '',
    "--data '{}'",
    '// highlight-end',
    '```',
  ].join('\n');
  const result = normalizeLegacyCodeHighlights(input);
  expect(result).toBe(
    [
      '// highlight-start',
      '```shell',
      '# [!code highlight:3]',
      'curl example \\',
      '',
      "--data '{}'",
      '```',
    ].join('\n'),
  );
  expect(normalizeLegacyCodeHighlights(result)).toBe(result);
});

it('rejects an unbalanced range instead of losing business code', () => {
  expect(() =>
    normalizeLegacyCodeHighlights('```json\n// highlight-start\n{}\n```'),
  ).toThrow('Unbalanced legacy code highlight range');
});

it('keeps the converted notation when regenerating a migrated page', async () => {
  const sourceRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'cloud-highlight-'),
  );
  try {
    await fs.writeFile(
      path.join(sourceRoot, 'example.mdx'),
      '---\ntitle: Example\n---\n\n```json\n{\n// highlight-start\n"uid": "123"\n// highlight-end\n}\n```\n',
    );
    const result = await migrateLegacyPage({
      sourceRoot,
      sourcePath: 'example.mdx',
      pathMap: new Map(),
      targetPath:
        'content/docs/zh-CN/realtime-media/cloud-recording/example.mdx',
    });
    expect(result.content).toContain('// [!code highlight:1]');
    expect(result.content).not.toMatch(/highlight-(?:start|end)/);
    expect(result.content).toContain('"uid": "123"');
  } finally {
    await fs.rm(sourceRoot, { recursive: true, force: true });
  }
});
