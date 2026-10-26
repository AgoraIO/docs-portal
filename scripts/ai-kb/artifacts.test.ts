import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildKbCorpus } from '../../src/lib/ai-kb/corpus.server';
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
async function platformFixture() {
  const f = await fixture();
  const routes = [
    {
      url: fixtureUrl,
      canonicalPath: fixtureUrl,
      markdownPath: `${fixtureUrl}.md`,
      defaultPlatform: 'web',
    },
    ...['web', 'ios'].map((platform) => ({
      url: `${fixtureUrl}/${platform}`,
      canonicalPath: fixtureUrl,
      markdownPath: `${fixtureUrl}/${platform}.md`,
      platform,
      defaultPlatform: 'web',
    })),
  ];
  await writeFile(
    path.join(f.root, '__static/docs-routes.json'),
    JSON.stringify(routes),
  );
  await writeFile(
    path.join(f.root, 'sitemap.xml'),
    `<urlset>${routes.map((r) => `<url><loc>https://docs.example.test${r.url}</loc></url>`).join('')}</urlset>`,
  );
  for (const platform of ['web', 'ios']) {
    await mkdir(path.join(f.root, `.${fixtureUrl}/${platform}`), {
      recursive: true,
    });
    await writeFile(
      path.join(f.root, `.${fixtureUrl}/${platform}.md`),
      '# Demo\n\n## Example\nbody\n',
    );
    await writeFile(
      path.join(f.root, `.${fixtureUrl}/${platform}/index.html`),
      '<article><h2 id="example">Example</h2></article>',
    );
  }
  return { ...f, routes };
}
describe('published KB artifact reader', () => {
  it('validates all platform variants without requiring superseded canonical content', async () => {
    const f = await platformFixture();
    await writeFile(path.join(f.root, `.${fixtureUrl}.md`), '# Demo\n');
    const input = await readPublishedKbInputs(f.root);
    expect(new Set(input.sections.map((s) => s.url.split('#')[0]))).toEqual(
      new Set([`${fixtureUrl}/web`, `${fixtureUrl}/ios`]),
    );
  });
  it('rejects a platform variant with no validated content', async () => {
    const f = await platformFixture();
    await writeFile(path.join(f.root, `.${fixtureUrl}/ios.md`), '# Demo\n');
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow(
      /incomplete.*ios/i,
    );
  });
  it('rejects a published platform variant missing from the route manifest', async () => {
    const f = await platformFixture();
    await writeFile(
      path.join(f.root, '__static/docs-routes.json'),
      JSON.stringify(f.routes.filter((r) => r.url !== `${fixtureUrl}/ios`)),
    );
    await expect(readPublishedKbInputs(f.root)).rejects.toThrow(
      /incomplete.*ios/i,
    );
  });
  it('uses HTML-verified sections and original Markdown from the same read', async () => {
    const f = await fixture();
    const input = await readPublishedKbInputs(f.root);
    expect(input.sections.map((s) => s.url)).toContain(`${fixtureUrl}#example`);
    const corpus = await buildKbCorpus({
      ...input,
      scope: 'cn-demo',
      revision: 'test-revision',
      selectedSourceIds: [fixtureUrl],
    });
    expect(corpus.documents[0].sourceId).toBe(fixtureUrl);
    expect(corpus.documents[0].metadata.canonicalUrl).toBe(fixtureUrl);
    expect(corpus.documents[0].metadata.sections.map((s) => s.url)).toContain(
      `${fixtureUrl}#example`,
    );
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
