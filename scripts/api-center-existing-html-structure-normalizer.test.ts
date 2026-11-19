import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { normalizeExistingHtmlStructure } from './lib/api-center/existing-html-structure-normalizer.mjs';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe('API Center existing HTML structure normalizer', () => {
  it('restores source-backed detail headings and remains idempotent', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-existing-html-structure-'),
    );
    const oldRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'api-center-existing-html-source-'),
    );
    roots.push(repoRoot, oldRoot);
    const sourceDir = 'html-docs/flexible-classroom/Android/API';
    const targetDir =
      'content/docs/zh-CN/api-reference/flexible-classroom/android/api-reference/edu-context';
    const sourcePath = path.join(sourceDir, 'class_roomcontext.html');
    const targetPath = path.join(targetDir, 'class-roomcontext.mdx');
    await fs.mkdir(path.dirname(path.join(oldRoot, sourcePath)), {
      recursive: true,
    });
    await fs.mkdir(path.dirname(path.join(repoRoot, targetPath)), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(oldRoot, sourcePath),
      `<main><article>
        <section id="api_update__detailed_desc"><p>Detailed guidance.</p></section>
        <section data-deliveryTarget="details" data-otherprops="no-title" id="api_internal__detailed_desc"><p>Internal note.</p></section>
      </article></main>`,
    );
    await fs.writeFile(
      path.join(repoRoot, targetPath),
      `---\ntitle: RoomContext\n---\n\n<a id="api_update__detailed_desc"></a>\n\nDetailed guidance.\n\n<a id="api_internal__detailed_desc"></a>\n\nInternal note.\n`,
    );

    const options = {
      repoRoot,
      oldRoot,
      sourceTargetRoots: [{ sourceDir, targetDir }],
    };
    await expect(
      normalizeExistingHtmlStructure({ ...options, mode: 'check' }),
    ).rejects.toThrow('1 existing HTML-derived MDX target');

    const result = await normalizeExistingHtmlStructure(options);
    const output = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');
    expect(output).toContain(
      '<a id="api_update__detailed_desc"></a>\n\n### 详情\n\nDetailed guidance.',
    );
    expect(output).toContain(
      '<a id="api_internal__detailed_desc"></a>\n\nInternal note.',
    );
    expect(output).not.toContain('### 详情\n\nInternal note.');
    expect(result.changedFiles).toEqual([targetPath]);
    expect(result.report.counts).toEqual({
      errors: 0,
      normalizedDetailHeadings: 1,
      sourceFiles: 1,
      sourceSectionsSuppressedByNoTitle: 1,
      sourceSectionsWithExplicitHeadings: 0,
      sourceSectionsWithImplicitDetailTitles: 1,
      targetFiles: 1,
    });
    expect(
      await fs.readFile(
        path.join(
          repoRoot,
          'docs/migration/api-center-existing-html-structure.md',
        ),
        'utf8',
      ),
    ).toContain('`implicit-detail-heading`: 1');

    const second = await normalizeExistingHtmlStructure(options);
    expect(second.changedFiles).toEqual([]);
    expect(await fs.readFile(path.join(repoRoot, targetPath), 'utf8')).toBe(
      output,
    );
    await expect(
      normalizeExistingHtmlStructure({ ...options, mode: 'check' }),
    ).resolves.toMatchObject({ changedFiles: [] });
  });
});
