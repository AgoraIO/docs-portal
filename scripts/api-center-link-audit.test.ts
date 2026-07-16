import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterLinks } from './lib/api-center/link-audit.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center scoped link audit', () => {
  it('combines ownership ledgers, migration types, warnings, paths, and anchors', async () => {
    const repoRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'api-center-links-'));
    roots.push(repoRoot);
    const docsRoot = path.join(repoRoot, 'content/docs/zh-CN/api-reference');
    await fs.mkdir(docsRoot, { recursive: true });
    const first = 'content/docs/zh-CN/api-reference/a.mdx';
    const second = 'content/docs/zh-CN/api-reference/b.mdx';
    await fs.writeFile(
      path.join(repoRoot, first),
      '---\ntitle: A\n_migration:\n  warnings:\n    - code: unresolved-fragment\n---\n\n[B](/zh-CN/api-reference/b#target)\n',
    );
    await fs.writeFile(
      path.join(repoRoot, second),
      '---\ntitle: B\n_migration:\n  warnings: []\n---\n\n<a id="target"></a>\n\n## Target\n',
    );
    const ownershipPaths = ['one.json', 'two.json', 'three.json'];
    for (const [index, ownershipPath] of ownershipPaths.entries()) {
      await fs.writeFile(
        path.join(repoRoot, ownershipPath),
        JSON.stringify({
          files:
            index === 0
              ? [{ targetPath: first, type: 'manual-mdx' }]
              : index === 1
                ? [{ targetPath: second, type: 'generated-html' }]
                : [],
        }),
      );
    }

    const result = await auditApiCenterLinks({ repoRoot, ownershipPaths });

    expect(result.report.counts).toMatchObject({
      ownedMdxPages: 2,
      links: 1,
      invalidLinks: 0,
      missingLocalPaths: 0,
      missingFragments: 0,
      errors: 0,
      warnings: 1,
    });
    expect(result.report.outputTypes).toEqual({
      'generated-html': 1,
      'manual-mdx': 1,
    });
    expect(result.markdown).toContain('`unresolved-fragment` (1, warning)');

    await fs.writeFile(
      path.join(repoRoot, first),
      '---\ntitle: A\n_migration:\n  warnings: []\n---\n\n[B](/zh-CN/api-reference/b#missing)\n',
    );
    const broken = await auditApiCenterLinks({ repoRoot, ownershipPaths });
    expect(broken.report.counts).toMatchObject({
      invalidLinks: 1,
      missingFragments: 1,
      errors: 1,
    });
  });
});
