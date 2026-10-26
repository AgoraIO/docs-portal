import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

it('rewrites every legacy FAQ URL shape to the current Reference route and is idempotent', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'faq-link-rewrite-'));
  try {
    const contentDir = path.join(root, 'content/docs/zh-CN');
    const mappingDir = path.join(
      root,
      'docs/migration/generated/zh-cn-faq-migration',
    );
    await mkdir(contentDir, { recursive: true });
    await mkdir(mappingDir, { recursive: true });
    await writeFile(
      path.join(mappingDir, 'mapping.json'),
      JSON.stringify({
        rows: [
          {
            sourceSlug: 'string-uid',
            targetPath:
              'content/docs/zh-CN/api-reference/faq/integration/string_uid.mdx',
          },
        ],
      }),
    );
    const input = [
      '[Shengwang](https://doc.shengwang.cn/faq/integration-issues/string-uid#limits)',
      '[Agora](https://docs.agora.io/cn/Video/faq/string-uid)',
      '[Relative](/faq/integration-issues/string-uid)',
      '[Previous portal](/zh-CN/api-reference/faq/integration/string_uid)',
    ].join('\n');
    const file = path.join(contentDir, 'test.mdx');
    await writeFile(file, input);
    const script = path.resolve('scripts/update-zh-cn-faq-links.mjs');
    const run = () => execFileSync(process.execPath, [script], { cwd: root });
    run();
    const expected = [
      '[Shengwang](/zh-CN/reference/faq/integration/string_uid#limits)',
      '[Agora](/zh-CN/reference/faq/integration/string_uid)',
      '[Relative](/zh-CN/reference/faq/integration/string_uid)',
      '[Previous portal](/zh-CN/reference/faq/integration/string_uid)',
    ].join('\n');
    expect(await readFile(file, 'utf8')).toBe(expected);
    run();
    expect(await readFile(file, 'utf8')).toBe(expected);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
