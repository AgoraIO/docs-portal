import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditFlow, flowLists } from './audit-legacy-flow-list-indentation.mjs';

describe('source-backed callout and prose list repair', () => {
  it('keeps enclosing lists together and excludes slots and fenced examples', () => {
    const blocks = flowLists(
      [
        '---',
        'title: Example',
        '---',
        '',
        ':::note',
        '- Parent',
        '  - Child',
        '- Peer',
        ':::',
        '',
        '<Slot for="table-cell">',
        '',
        '- Table item',
        '  - Table child',
        '',
        '</Slot>',
        '',
        '```md',
        ':::note',
        '- Example',
        '  - Example child',
        ':::',
        '```',
        '',
        '1. Step',
        '',
        '   :::info',
        '   - First',
        '   - Second',
        '   :::',
      ].join('\n'),
    );
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      kind: 'callout',
      raw: '- Parent\n  - Child\n- Peer',
    });
    expect(blocks[1].kind).toBe('prose');
    expect(blocks[1].raw).toContain('   :::info');
  });

  it('repairs proven callout peers, preserves real nesting and supports repeat checks', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'flow-list-test-'));
    try {
      const sourceRoot = path.join(dir, 'legacy');
      const repoRoot = path.join(dir, 'portal');
      await mkdir(path.join(sourceRoot, 'docs/convoai'), { recursive: true });
      await mkdir(path.join(repoRoot, 'content/docs/zh-CN/ai'), {
        recursive: true,
      });
      await writeFile(
        path.join(sourceRoot, 'docs/convoai/example.mdx'),
        '<Admonition type="info">\n  - First\n  - Second\n  - Third\n</Admonition>\n\n<Admonition type="info">\n  - Parent\n    - Child\n  - Peer\n</Admonition>',
      );
      const file = path.join(repoRoot, 'content/docs/zh-CN/ai/example.mdx');
      const before =
        ':::info\n- First\n  - Second\n  - Third\n:::\n\n:::info\n- Parent\n  - Child\n- Peer\n:::\n';
      await writeFile(file, before);
      expect(auditFlow({ sourceRoot, repoRoot }).counts.repair).toBe(1);
      expect(await readFile(file, 'utf8')).toBe(before);
      expect(
        auditFlow({ sourceRoot, repoRoot, apply: true }).changedFiles,
      ).toBe(1);
      expect(await readFile(file, 'utf8')).toBe(
        before
          .replace('  - Second', '- Second')
          .replace('  - Third', '- Third'),
      );
      expect(auditFlow({ sourceRoot, repoRoot }).counts.repair).toBe(0);

      // Identical words with conflicting source hierarchies are not evidence
      // for flattening a target list.
      await writeFile(
        path.join(sourceRoot, 'docs/convoai/conflict.mdx'),
        '<Admonition type="info">\n  - First\n    - Second\n    - Third\n</Admonition>',
      );
      await writeFile(file, before);
      expect(
        auditFlow({ sourceRoot, repoRoot, apply: true }).changedFiles,
      ).toBe(0);
      expect(await readFile(file, 'utf8')).toBe(before);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
