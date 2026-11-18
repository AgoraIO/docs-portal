import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterLinks } from './lib/api-center/link-audit.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center scoped link audit', () => {
  it('combines ownership ledgers, migration types, warnings, paths, and anchors', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-links-'),
    );
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

  it('audits reused manifest targets and ignores provenance URLs in frontmatter', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-links-'),
    );
    roots.push(repoRoot);
    const target =
      'content/docs/zh-CN/solutions/art-class/reference/correction.mdx';
    await fs.mkdir(path.dirname(path.join(repoRoot, target)), {
      recursive: true,
    });
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, target),
      '---\ntitle: 在线美术教学 API\n_migration:\n  sourceUrl: https://doc.shengwang.cn/doc/art-class/android/api/correction\n---\n\n你可以参考 [RTC API](/api-ref/rtc/android/API/rtc_api_overview)。\n',
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
      JSON.stringify({
        pageEvidence: [
          {
            requestedUrl:
              'https://doc.shengwang.cn/doc/art-class/android/api/correction',
            sourceResolution: { targetExists: true, targetPath: target },
          },
        ],
      }),
    );
    const ownershipPaths = ['one.json', 'two.json', 'three.json'];
    for (const ownershipPath of ownershipPaths) {
      await fs.writeFile(
        path.join(repoRoot, ownershipPath),
        JSON.stringify({ files: [] }),
      );
    }

    const result = await auditApiCenterLinks({ repoRoot, ownershipPaths });

    expect(result.report.counts).toMatchObject({
      errors: 1,
      legacyOldSiteBodyLinks: 1,
      ownedMdxPages: 0,
      preservedMdxPages: 1,
      visibleMdxPages: 1,
    });
    expect(result.report.issues).toContainEqual(
      expect.objectContaining({
        href: '/api-ref/rtc/android/API/rtc_api_overview',
        reason: 'old-site-body-link',
      }),
    );
  });
});
