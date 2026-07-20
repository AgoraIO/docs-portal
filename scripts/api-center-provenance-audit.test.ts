import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditApiCenterProvenance } from './lib/api-center/provenance-audit.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

describe('API Center provenance audit', () => {
  it('proves source copy, local placement, deployed entry evidence, and the requirement boundary', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-audit-'),
    );
    const oldRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-source-'),
    );
    roots.push(repoRoot, oldRoot);
    const sourcePath = 'html-docs/example/page.html';
    const targetPath =
      'content/docs/zh-CN/api-reference/example/(current)/page.mdx';
    const overviewPath = 'content/docs/zh-CN/api-reference/overview.mdx';
    const page = `---
title: Page
description: Source summary.
_migration:
  type: generated-html
  status: migrated
  sourceUrl: https://doc.shengwang.cn/api-ref/example/page
  sourcePath: ${sourcePath}
  generator: typedoc
  warnings: []
---

Source body.
`;
    const overview = `---
title: API 中心
description: 查看 API。
_migration:
  type: navigation
  status: migrated
  sourceUrl: https://doc.shengwang.cn/api-center
  sourcePath: docs/migration/api-center-html-manifest.json
  warnings: []
---

查看 API。
`;
    await fs.mkdir(path.join(oldRoot, path.dirname(sourcePath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(oldRoot, sourcePath),
      '<div class="col-content"><div class="tsd-page-title"><h1>Page</h1></div><p class="tsd-comment-shortform">Source summary.</p><p>Source body.</p></div>',
    );
    for (const [filePath, contents] of [
      [targetPath, page],
      [overviewPath, overview],
    ]) {
      await fs.mkdir(path.join(repoRoot, path.dirname(filePath)), {
        recursive: true,
      });
      await fs.writeFile(path.join(repoRoot, filePath), contents);
    }
    await fs.mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    const manifest = {
      source: { repository: 'fixture', commit: 'fixture' },
      live: {
        finalUrl: 'https://doc.shengwang.cn/api-center',
        capturedAt: '2026-07-16T00:00:00.000Z',
        heroTitle: 'API 中心',
        heroDescription: '查看 API。',
      },
      entries: [
        {
          product: 'Example',
          label: 'Web',
          legacyPath: '/api-ref/example/page',
          legacyUrl: 'https://doc.shengwang.cn/api-ref/example/page',
          urlFamily: 'api-ref',
        },
      ],
      pageEvidence: [
        {
          requestedUrl: 'https://doc.shengwang.cn/api-ref/example/page',
          sourceResolution: {
            status: 'resolved',
            type: 'generated-html',
            generator: 'typedoc',
            sourcePath,
            targetPath,
            targetRoute: '/zh-CN/api-reference/example/page',
          },
        },
      ],
    };
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
      JSON.stringify(manifest),
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-navigation-parity.json'),
      JSON.stringify({
        counts: { errors: 0, collapsedRootDuplicates: 0, overviewActions: 1 },
      }),
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-link-audit.json'),
      JSON.stringify({ counts: { errors: 0, invalidLinks: 0, links: 1 } }),
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-openapi-audit.json'),
      JSON.stringify({ counts: { errors: 0, reachableOperations: 0 } }),
    );
    await fs.writeFile(
      path.join(
        repoRoot,
        'docs/migration/api-center-openapi-normalized-descriptions.json',
      ),
      JSON.stringify({ operations: [] }),
    );
    const ledgers = [
      {
        path: 'docs/migration/api-center-generated-files.json',
        files: [
          {
            contentHash: hash(page),
            sourcePath,
            sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
            targetPath,
            type: 'generated-html',
          },
        ],
      },
      {
        path: 'docs/migration/api-center-manual-generated-files.json',
        files: [],
      },
      {
        path: 'docs/migration/api-center-navigation-generated-files.json',
        files: [
          {
            contentHash: hash(overview),
            sourcePath: 'docs/migration/api-center-html-manifest.json',
            sourceUrl: 'https://doc.shengwang.cn/api-center',
            targetPath: overviewPath,
            type: 'navigation',
          },
        ],
      },
    ];
    for (const ledger of ledgers) {
      await fs.writeFile(
        path.join(repoRoot, ledger.path),
        JSON.stringify({ files: ledger.files }),
      );
    }
    for (const generatorPath of [
      'scripts/lib/api-center/generator-runner.mjs',
      'scripts/lib/api-center/html-to-mdx.mjs',
      'scripts/lib/api-center/manual-mdx-runner.mjs',
      'scripts/lib/api-center/navigation-runner.mjs',
      'scripts/migrate-legacy-docs.mjs',
    ]) {
      await fs.mkdir(path.join(repoRoot, path.dirname(generatorPath)), {
        recursive: true,
      });
      await fs.writeFile(path.join(repoRoot, generatorPath), '// fixture');
    }

    const { report, markdown } = await auditApiCenterProvenance({
      repoRoot,
      oldRoot,
      liveBundleUrl: 'https://doc.shengwang.cn/assets/js/main.fixture.js',
      liveBundleText: 'const link = "/api-ref/example/page";',
    });

    expect(report.status).toBe('passed');
    expect(report.counts).toMatchObject({
      errors: 0,
      sourceProvenanceErrors: 0,
      placementErrors: 0,
      unapprovedRequirementAssumptions: 0,
      generatedHtmlDescriptionsChecked: 1,
      generatedHtmlDescriptionsPresent: 1,
      generatedHtmlDescriptionViolations: 0,
    });
    expect(report.liveEvidence.matchedEntries).toBe(1);
    expect(report.liveEvidence.bundleMatchedEntries).toBe(1);
    expect(report.technicalDecisions).toContainEqual(
      expect.objectContaining({ id: 'current-directory-elision' }),
    );
    expect(markdown).toContain(
      'Technical decisions (not recorded as user requirements)',
    );

    const fabricated = page.replace(
      'description: Source summary.',
      'description: Fabricated summary.',
    );
    await fs.writeFile(path.join(repoRoot, targetPath), fabricated);
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-generated-files.json'),
      JSON.stringify({
        files: [
          {
            contentHash: hash(fabricated),
            sourcePath,
            sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
            targetPath,
            type: 'generated-html',
          },
        ],
      }),
    );

    const { report: fabricatedReport } = await auditApiCenterProvenance({
      repoRoot,
      oldRoot,
      liveBundleUrl: 'https://doc.shengwang.cn/assets/js/main.fixture.js',
      liveBundleText: 'const link = "/api-ref/example/page";',
    });
    expect(fabricatedReport.counts).toMatchObject({
      generatedHtmlDescriptionsChecked: 1,
      generatedHtmlDescriptionsPresent: 1,
      generatedHtmlDescriptionViolations: 1,
    });
    expect(fabricatedReport.errors).toContainEqual(
      expect.objectContaining({
        code: 'generated-html-description-source-drift',
        expectedDescription: 'Source summary.',
        actualDescription: 'Fabricated summary.',
      }),
    );
  });
});
