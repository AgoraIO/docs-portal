import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { normalizeExistingApiCenterLinks } from './lib/api-center/existing-link-normalizer.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center existing-target link normalizer', () => {
  it('rewrites reused MDX body links while preserving provenance frontmatter', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-existing-links-'),
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
      `---
title: 在线美术教学 API
_migration:
  sourceUrl: https://doc.shengwang.cn/doc/art-class/android/api/correction
---

你可以参考 [RTC API](/api-ref/rtc/android/API/rtc_api_overview) 文档。

[旧录制说明](https://docs.agora.io/cn/Recording/token_server)

<a id="empty-prototype"></a>

\`\`\`arkts

\`\`\`
`,
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      'old_url,new_url\n',
    );
    await fs.writeFile(
      path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
      JSON.stringify({
        pageEvidence: [
          {
            requestedUrl:
              'https://doc.shengwang.cn/doc/art-class/android/api/correction',
            sourceResolution: {
              targetExists: true,
              targetPath: target,
              targetRoute: '/zh-CN/solutions/art-class/reference/correction',
            },
          },
          {
            requestedUrl:
              'https://doc.shengwang.cn/api-ref/rtc/android/API/rtc_api_overview',
            sourceResolution: {
              targetExists: false,
              targetPath:
                'content/docs/zh-CN/api-reference/rtc/android/rtc-api-overview.mdx',
              targetRoute: '/zh-CN/api-reference/rtc/android/rtc-api-overview',
            },
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

    const result = await normalizeExistingApiCenterLinks({
      repoRoot,
      ownershipPaths,
    });
    const output = await fs.readFile(path.join(repoRoot, target), 'utf8');

    expect(output).toContain(
      'sourceUrl: https://doc.shengwang.cn/doc/art-class/android/api/correction',
    );
    expect(output).toContain(
      '[RTC API](/zh-CN/api-reference/rtc/android/rtc-api-overview)',
    );
    expect(output).toContain('\n旧录制说明\n');
    expect(output).not.toContain('https://docs.agora.io');
    expect(output).not.toMatch(/```arkts\n\s*```/);
    expect(output).toContain('<a id="empty-prototype"></a>');
    expect(output).toContain('code: empty-source-code');
    expect(output).toContain('status: warning');
    expect(result.report.counts).toMatchObject({
      emptyCodeFencesRemoved: 1,
      emptyCodeFilesNormalized: 1,
      errors: 0,
      remainingEmptyCodeFences: 0,
      remainingLegacyBodyLinks: 0,
      renderedAsText: 1,
      rewrittenLocal: 1,
    });
    await expect(
      normalizeExistingApiCenterLinks({
        repoRoot,
        ownershipPaths,
        mode: 'check',
      }),
    ).resolves.toMatchObject({ changedFiles: [] });
  });
});
