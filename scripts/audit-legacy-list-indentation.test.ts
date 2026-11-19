import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  audit,
  cellEvidence,
  compareReviewedSlot,
  compareSlot,
} from './audit-legacy-list-indentation.mjs';

describe('source-backed list indentation repair', () => {
  it('repairs only the indentation reproduced by the old conversion', () => {
    const source = cellEvidence(
      '\n      - SD: 100\n      - HD: 50\n      - FHD: 30\n',
      'shared/cloud-recording/pcw.mdx',
      34,
    );
    expect(source).not.toBeNull();
    const result = compareSlot(
      '\n- SD: 100\n      - HD: 50\n      - FHD: 30\n',
      [source],
    );
    expect(result.status).toBe('repair');
    expect(result.after).toBe('\n- SD: 100\n- HD: 50\n- FHD: 30\n');
    expect(compareSlot(result.after, [source]).status).toBe(
      'verified-unchanged',
    );
  });

  it('preserves a real multilevel list and removes only its JSX container indentation', () => {
    const source = cellEvidence(
      '\n    - Parent\n      - Child\n        1. Grandchild\n    - Sibling\n',
      'docs/example.mdx',
      1,
    );
    if (!source) throw new Error('Expected a source list');
    const result = compareSlot(source.previous, [source]);
    expect(result.status).toBe('repair');
    expect(result.after).toBe(
      '- Parent\n  - Child\n    1. Grandchild\n- Sibling',
    );
    expect(compareSlot(result.after, [source]).status).toBe(
      'verified-unchanged',
    );
  });

  it('rejects different source hierarchies with identical wording', () => {
    const flat = cellEvidence('\n    - Parent\n    - Child\n', 'docs/a.mdx', 1);
    const nested = cellEvidence('- Parent\n  - Child', 'docs/b.mdx', 1);
    expect(compareSlot('- Parent\n    - Child', [flat, nested])).toMatchObject({
      status: 'unresolved',
      reason: 'conflicting-source-hierarchies',
    });
  });

  it('leaves harmless root indentation and non-indentation rendering differences unchanged', () => {
    const source = cellEvidence(
      '\n    - First\n    - Second\n',
      'docs/a.mdx',
      1,
    );
    expect(compareSlot(' - First\n - Second', [source]).status).toBe(
      'verified-unchanged',
    );
    const greater = cellEvidence(
      '\n    - First\n    - &gt; `0`\n',
      'docs/a.mdx',
      1,
    );
    expect(compareSlot('- First\n- > `0`', [greater]).status).toBe(
      'verified-unchanged',
    );
  });

  it('does not overwrite subsequent text or link edits or guess unmatched indentation', () => {
    const source = cellEvidence(
      '\n    - First\n    - Second\n',
      'docs/a.mdx',
      1,
    );
    expect(compareSlot('- First\n    - Changed', [source]).status).toBe(
      'unresolved',
    );
    expect(compareSlot('- First\n  - Second', [source])).toMatchObject({
      status: 'unresolved',
      reason: 'target-does-not-match-old-conversion',
    });
    const linkedSource = cellEvidence(
      '\n    - First\n    - [Second](/old-link)\n',
      'docs/a.mdx',
      1,
    );
    expect(
      compareSlot('- First\n    - [Second](https://example.com)', [
        linkedSource,
      ]).after,
    ).toBe('- First\n- [Second](https://example.com)');
  });

  it('requires frozen source and target hashes for reviewed editorial exceptions', () => {
    const source = cellEvidence(
      '\n    - Old name\n    - Second\n',
      'docs/a.mdx',
      1,
    );
    if (!source) throw new Error('Expected a source list');
    const before = '- New name\n    - Second';
    const after = '- New name\n- Second';
    const hash = (text: string) =>
      createHash('sha256').update(text).digest('hex');
    const review = {
      sourcePath: source.sourcePath,
      sourceLine: source.line,
      sourceHash: source.sourceHash,
      beforeHash: hash(before),
      afterHash: hash(after),
      note: 'Reviewed name update',
    };
    expect(compareReviewedSlot(before, review, [source])?.after).toBe(after);
    expect(compareReviewedSlot(after, review, [source])?.status).toBe(
      'verified-unchanged',
    );
    expect(compareReviewedSlot(`${before}!`, review, [source])).toBeNull();
    expect(
      compareReviewedSlot(before, review, [
        { ...source, sourceHash: 'changed' },
      ]),
    ).toBeNull();
  });

  it('audits before writing, preserves literal replacement tokens and is idempotent', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'list-indent-test-'));
    try {
      const sourceRoot = path.join(dir, 'legacy');
      const repoRoot = path.join(dir, 'portal');
      await mkdir(path.join(sourceRoot, 'docs'), { recursive: true });
      await mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
      await mkdir(path.join(repoRoot, 'content/docs/zh-CN'), {
        recursive: true,
      });
      await writeFile(
        path.join(sourceRoot, 'docs/example.mdx'),
        '<table><tr><th>Value</th></tr><tr><td>\n    - $&\n    - Second\n</td></tr></table>',
      );
      await writeFile(
        path.join(repoRoot, 'docs/migration/path-map.csv'),
        'source_path,target_path\ndocs/example.mdx,content/docs/zh-CN/example.mdx\n',
      );
      const target = path.join(repoRoot, 'content/docs/zh-CN/example.mdx');
      const before =
        'Untouched prose.\n\n<Slot for="example-html-0-1-0">\n\n- $&\n    - Second\n\n</Slot>\n';
      await writeFile(target, before);
      expect((await audit({ sourceRoot, repoRoot })).counts.repair).toBe(1);
      expect(await readFile(target, 'utf8')).toBe(before);
      expect(
        (await audit({ sourceRoot, repoRoot, apply: true })).changedFiles,
      ).toBe(1);
      expect(await readFile(target, 'utf8')).toBe(
        before.replace('    - Second', '- Second'),
      );
      expect((await audit({ sourceRoot, repoRoot })).changedFiles).toBe(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
