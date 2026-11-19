import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readPublishedDocVersion } from './published-doc-version';

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('published document version lookup', () => {
  it.each([
    ['v4.6.2', '4.6.2'],
    ['当前版本', undefined],
  ])(
    'reads the current version label %s from a parent navigation scope',
    async (label, expected) => {
      const docsRoot = join(
        import.meta.dirname,
        `../../tmp/published-version-${crypto.randomUUID()}`,
      );
      tempRoots.push(docsRoot);
      const route = '/zh-CN/api-reference/rtc/android/rtc-api-overview';
      const metaPath = join(
        docsRoot,
        'zh-CN/api-reference/rtc/android/meta.json',
      );
      await mkdir(join(docsRoot, 'zh-CN/api-reference/rtc/android'), {
        recursive: true,
      });
      await writeFile(
        metaPath,
        JSON.stringify({
          navScope: {
            versions: [{ id: 'current', label, path: '(current)' }],
          },
        }),
      );

      await expect(readPublishedDocVersion(docsRoot, route)).resolves.toBe(
        expected,
      );
    },
  );

  it('reads an explicit version from the published URL', async () => {
    const docsRoot = join(
      import.meta.dirname,
      `../../tmp/published-version-${crypto.randomUUID()}`,
    );
    tempRoots.push(docsRoot);

    await expect(
      readPublishedDocVersion(
        docsRoot,
        '/zh-CN/api-reference/rtc/android/4.6.0/overview',
      ),
    ).resolves.toBe('4.6.0');
  });
});
