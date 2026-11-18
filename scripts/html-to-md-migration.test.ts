import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SCRIPT = path.resolve(__dirname, 'html-to-md-migration.mjs');
const SOURCE_DIR =
  '/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/rtc/Android';
const hasSource = existsSync(SOURCE_DIR);

describe('html-to-md-migration', () => {
  it('should show help text', () => {
    const output = execSync(`node ${SCRIPT} --help`, { encoding: 'utf8' });
    expect(output).toContain('Unified HTML-to-Markdown Migration Tool');
    expect(output).toContain('--source');
    expect(output).toContain('--output');
  });

  it.skipIf(!hasSource)('should perform dry run', async () => {
    const output = execSync(
      `node ${SCRIPT} --source ${SOURCE_DIR} --output /tmp/test-migration --product rtc --platform android --dry-run`,
      { encoding: 'utf8' },
    );
    expect(output).toContain('Would process');
    expect(output).toContain('files:');
  });

  it.skipIf(!hasSource)('should generate markdown files', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'migration-test-'));

    try {
      execSync(
        `node ${SCRIPT} --source ${SOURCE_DIR} --output ${tmpDir} --product rtc --platform android`,
        { encoding: 'utf8' },
      );

      // Check that files were created
      const files = await fs.readdir(tmpDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files).toContain('index.mdx');
      expect(files).toContain('meta.json');

      // Check a generated file has proper frontmatter
      const mdxFiles = files.filter((f) => f.endsWith('.mdx'));
      if (mdxFiles.length > 0) {
        const content = await fs.readFile(
          path.join(tmpDir, mdxFiles[0]),
          'utf8',
        );
        expect(content).toMatch(/^---\n/);
        expect(content).toContain('title:');
      }
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
