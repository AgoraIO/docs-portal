import { readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readPublishedKbInputs } from './artifacts';
import { createPublishedFixture, fixtureUrl } from './fixtures.test-utils';

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(
    cleanup.splice(0).map((p) => rm(p, { recursive: true, force: true })),
  );
});
async function fixture() {
  const f = await createPublishedFixture();
  cleanup.push(f.base);
  return f;
}
describe('published KB artifact reader', () => {
  it('uses HTML-verified sections and original Markdown from the same read', async () => {
    const f = await fixture();
    const input = await readPublishedKbInputs(f.root);
    expect(input.sections.map((s) => s.url)).toContain(`${fixtureUrl}#example`);
    await writeFile(
      path.join(f.root, `.${fixtureUrl}.md`),
      'changed after validation',
    );
    expect(await input.readMarkdown(`${fixtureUrl}.md`)).toContain(
      '```ts\n  foo();',
    );
  });
  it('rejects missing Markdown and unresolved HTML anchors', async () => {
    const f = await fixture();
    await writeFile(
      path.join(f.root, `.${fixtureUrl}/index.html`),
      '<article/>',
    );
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow(/anchor/i);
    await rm(path.join(f.root, `.${fixtureUrl}.md`));
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow();
  });
  it('rejects traversal and symlink escape', async () => {
    const f = await fixture();
    const manifest = path.join(f.root, '__static/docs-routes.json');
    await writeFile(
      manifest,
      JSON.stringify([
        {
          canonicalPath: fixtureUrl,
          url: fixtureUrl,
          markdownPath: '/../outside.md',
        },
      ]),
    );
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow();
    await writeFile(
      manifest,
      JSON.stringify([
        {
          canonicalPath: fixtureUrl,
          url: fixtureUrl,
          markdownPath: `${fixtureUrl}.md`,
        },
      ]),
    );
    const outside = path.join(f.base, 'outside.md');
    await writeFile(outside, '# Secret\n\nsecret');
    await rm(path.join(f.root, `.${fixtureUrl}.md`));
    await symlink(outside, path.join(f.root, `.${fixtureUrl}.md`));
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow(
      /outside|escape/i,
    );
  });
  it('does not silently mark a stale manifest complete', async () => {
    const f = await fixture();
    await writeFile(path.join(f.root, '__static/docs-routes.json'), '[]');
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow();
  });
  it('rejects malformed search input and duplicated routes', async () => {
    const f = await fixture();
    const file = path.join(f.root, '__static/docs-routes.json');
    const route = JSON.parse(await readFile(file, 'utf8'))[0];
    await writeFile(file, JSON.stringify([route, route]));
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow(/duplicate/i);
    await writeFile(file, JSON.stringify([route]));
    await writeFile(
      path.join(f.root, '__static/docs-search/zh-CN.json'),
      JSON.stringify([{ url: fixtureUrl }]),
    );
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow();
  });
});
