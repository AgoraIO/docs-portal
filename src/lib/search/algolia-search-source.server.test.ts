import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it, vi } from 'vitest';
import { getAlgoliaSearchNavigation } from './algolia-search-source.server';

it('builds English navigation without parsing unpublished Chinese metadata', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'algolia-navigation-'));
  const docs = path.join(root, 'content/docs');
  try {
    await mkdir(path.join(docs, 'en/guide'), { recursive: true });
    await mkdir(path.join(docs, 'zh-CN'), { recursive: true });
    await writeFile(
      path.join(docs, 'en/guide/hello.md'),
      '---\ntitle: Hello\n---\nHello.',
    );
    await writeFile(
      path.join(docs, 'zh-CN/meta.json'),
      '{"title":"one","title":"two"}',
    );
    using cwd = vi.spyOn(process, 'cwd').mockReturnValue(root);
    const navigation = await getAlgoliaSearchNavigation(['en']);
    expect([...navigation.keys()]).toEqual(['en']);
    expect(navigation.get('en')?.has('/en/guide/hello')).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
