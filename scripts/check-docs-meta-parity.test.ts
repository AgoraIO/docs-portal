import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { compareDocsMetaParity } from './check-docs-meta-parity.mjs';

const tempDirs: string[] = [];

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

describe('compareDocsMetaParity', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
  });

  it('reports missing paths, extra paths, and page mismatches', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'docs-meta-parity-'));
    tempDirs.push(rootDir);

    const englishRoot = path.join(rootDir, 'en');
    const chineseRoot = path.join(rootDir, 'zh-CN');

    await writeJson(path.join(englishRoot, 'meta.json'), { pages: ['intro', 'guide', 'api'] });
    await writeJson(path.join(englishRoot, 'guide', 'meta.json'), {
      navScope: { sharedSidebar: true },
      pages: ['index', 'advanced'],
    });
    await writeJson(path.join(englishRoot, 'api', 'meta.json'), { pages: ['index'] });

    await writeJson(path.join(chineseRoot, 'meta.json'), { pages: ['intro', 'api', 'guide'] });
    await writeJson(path.join(chineseRoot, 'legacy', 'meta.json'), { pages: ['index'] });
    await writeJson(path.join(chineseRoot, 'guide', 'meta.json'), { pages: ['advanced', 'index'] });

    const result = await compareDocsMetaParity({
      baselineRoot: englishRoot,
      targetRoot: chineseRoot,
    });

    expect(result).toEqual({
      extraInTarget: ['legacy/meta.json'],
      missingInTarget: ['api/meta.json'],
      pageMismatches: [
        {
          expectedPages: ['index', 'advanced'],
          metaPath: 'guide/meta.json',
          targetPages: ['advanced', 'index'],
        },
        {
          expectedPages: ['intro', 'guide', 'api'],
          metaPath: 'meta.json',
          targetPages: ['intro', 'api', 'guide'],
        },
      ],
      structuralMismatches: [
        {
          expectedConfig: { icon: undefined, navScope: { sharedSidebar: true }, root: undefined },
          metaPath: 'guide/meta.json',
          targetConfig: { icon: undefined, navScope: undefined, root: undefined },
        },
      ],
    });
  });

  it('returns empty differences when paths and pages match', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'docs-meta-parity-'));
    tempDirs.push(rootDir);

    const englishRoot = path.join(rootDir, 'en');
    const chineseRoot = path.join(rootDir, 'zh-CN');

    await writeJson(path.join(englishRoot, 'meta.json'), { pages: ['intro', 'guide'] });
    await writeJson(path.join(englishRoot, 'guide', 'meta.json'), { pages: ['index', 'faq'] });

    await writeJson(path.join(chineseRoot, 'meta.json'), { pages: ['intro', 'guide'] });
    await writeJson(path.join(chineseRoot, 'guide', 'meta.json'), { pages: ['index', 'faq'] });

    const result = await compareDocsMetaParity({
      baselineRoot: englishRoot,
      targetRoot: chineseRoot,
    });

    expect(result).toEqual({
      extraInTarget: [],
      missingInTarget: [],
      pageMismatches: [],
      structuralMismatches: [],
    });
  });
});
