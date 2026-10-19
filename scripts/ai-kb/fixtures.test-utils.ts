import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
export const fixtureUrl = '/zh-CN/realtime-media/rtc/demo';
export async function createPublishedFixture() {
  const base = await mkdtemp(path.join(tmpdir(), 'docs-kb-test-'));
  const root = path.join(base, 'public');
  await mkdir(path.join(root, '__static/docs-search'), { recursive: true });
  await mkdir(path.join(root, `.${fixtureUrl}`), { recursive: true });
  await writeFile(
    path.join(root, 'sitemap.xml'),
    `<urlset><url><loc>https://docs.example.test${fixtureUrl}</loc></url></urlset>`,
  );
  await writeFile(
    path.join(root, '__static/docs-routes.json'),
    JSON.stringify([
      {
        canonicalPath: fixtureUrl,
        url: fixtureUrl,
        markdownPath: `${fixtureUrl}.md`,
      },
    ]),
  );
  await writeFile(
    path.join(root, '__static/docs-search/zh-CN.json'),
    JSON.stringify([{ url: fixtureUrl, title: 'Demo', objectType: 'docs' }]),
  );
  await writeFile(
    path.join(root, `.${fixtureUrl}.md`),
    '# Demo\n\n## Example\n```ts\n  foo();\n```\n',
  );
  await writeFile(
    path.join(root, `.${fixtureUrl}/index.html`),
    '<article><h2 id="example">Example</h2><pre>  foo();</pre></article>',
  );
  return { base, root };
}
