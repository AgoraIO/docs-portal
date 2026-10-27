import { spawnSync } from 'node:child_process';
import {
  link,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createPublishedFixture, fixtureUrl } from './fixtures.test-utils';

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(
    cleanup.splice(0).map((p) => rm(p, { recursive: true, force: true })),
  );
});
const run = (name: string, args: string[]) =>
  spawnSync('bun', [fileURLToPath(new URL(name, import.meta.url)), ...args], {
    encoding: 'utf8',
    timeout: 20000,
  });
async function fixture() {
  const f = await createPublishedFixture();
  cleanup.push(f.base);
  return f;
}
async function setup() {
  const f = await fixture();
  const corpus = path.join(f.base, 'corpus.json'),
    state = path.join(f.base, 'state.json');
  const args = [
    '--public',
    f.root,
    '--out',
    corpus,
    '--scope',
    'cn-demo',
    '--revision',
    'r1',
  ];
  const result = run('export-cn.ts', args);
  expect(result.status, result.stderr).toBe(0);
  const stateBody = JSON.stringify({
    schema: 1,
    scope: 'cn-demo',
    generation: 0,
    entries: [],
  });
  await writeFile(state, stateBody);
  return { ...f, corpus, state, stateBody, args };
}
describe('KB offline CLI', () => {
  it('writes an offline preview without modifying corpus and refuses an output alias', async () => {
    const f = await setup();
    const before = await readFile(f.corpus, 'utf8');
    const out = path.join(f.base, 'preview.json');
    const result = run('preview-cn.ts', ['--corpus', f.corpus, '--out', out]);
    expect(result.status, result.stderr).toBe(0);
    const preview = JSON.parse(await readFile(out, 'utf8'));
    expect(preview.cloudVerified).toBe(false);
    expect(
      preview.chunks.map((x: { content: string }) => x.content).join(''),
    ).toBe(JSON.parse(before).documents[0].content);
    expect(await readFile(f.corpus, 'utf8')).toBe(before);
    expect(
      run('preview-cn.ts', ['--corpus', f.corpus, '--out', f.corpus]).status,
    ).not.toBe(0);
    expect(await readFile(f.corpus, 'utf8')).toBe(before);
  });
  it('checks content completeness within the selected scope while full export still rejects empty pages', async () => {
    const f = await fixture();
    const emptyUrl = '/zh-CN/realtime-media/rtc/empty';
    const routesPath = path.join(f.root, '__static/docs-routes.json');
    const pagesPath = path.join(f.root, '__static/docs-search/zh-CN.json');
    const routes = JSON.parse(await readFile(routesPath, 'utf8'));
    const pages = JSON.parse(await readFile(pagesPath, 'utf8'));
    routes.push({
      url: emptyUrl,
      canonicalPath: emptyUrl,
      markdownPath: `${emptyUrl}.md`,
    });
    pages.push({ url: emptyUrl, title: 'Empty', objectType: 'docs' });
    await writeFile(routesPath, JSON.stringify(routes));
    await writeFile(pagesPath, JSON.stringify(pages));
    const sitemapPath = path.join(f.root, 'sitemap.xml');
    await writeFile(
      sitemapPath,
      (await readFile(sitemapPath, 'utf8')).replace(
        '</urlset>',
        `<url><loc>https://docs.example.test${emptyUrl}</loc></url></urlset>`,
      ),
    );
    await mkdir(path.join(f.root, `.${emptyUrl}`), { recursive: true });
    await writeFile(path.join(f.root, `.${emptyUrl}.md`), '# Empty\n');
    await writeFile(
      path.join(f.root, `.${emptyUrl}/index.html`),
      '<article><h1>Empty</h1></article>',
    );
    const output = path.join(f.base, 'sample.json');
    const selection = path.join(f.base, 'selection.json');
    const args = [
      '--public',
      f.root,
      '--out',
      output,
      '--scope',
      'sample',
      '--revision',
      'r1',
    ];
    expect(run('export-cn.ts', args).stderr).toMatch(/incomplete/i);
    await writeFile(selection, JSON.stringify([fixtureUrl]));
    const result = run('export-cn.ts', [...args, '--select', selection]);
    expect(result.status, result.stderr).toBe(0);
    const corpus = JSON.parse(await readFile(output, 'utf8'));
    expect(corpus.complete).toBe(true);
    expect(corpus.selection).toEqual([fixtureUrl]);
    expect(
      corpus.documents.map((d: { sourceId: string }) => d.sourceId),
    ).toEqual([fixtureUrl]);
    for (const ids of [[emptyUrl], [fixtureUrl, emptyUrl]]) {
      await writeFile(selection, JSON.stringify(ids));
      expect(
        run('export-cn.ts', [...args, '--select', selection]).stderr,
      ).toMatch(/incomplete|no published/i);
    }
  });
  it('exports deterministic Markdown and plans without mutating successful state', async () => {
    const f = await setup();
    const before = await readFile(f.corpus, 'utf8');
    expect(run('export-cn.ts', f.args).status).toBe(0);
    expect(await readFile(f.corpus, 'utf8')).toBe(before);
    const out = path.join(f.base, 'plan.json');
    const r = run('plan-cn.ts', [
      '--corpus',
      f.corpus,
      '--state',
      f.state,
      '--out',
      out,
    ]);
    expect(r.status, r.stderr).toBe(0);
    const plan = JSON.parse(await readFile(out, 'utf8'));
    expect(plan.create).toHaveLength(1);
    expect(plan.delete).toEqual([]);
    expect(plan.create[0].content).toContain('```ts\n  foo();');
    expect(await readFile(f.state, 'utf8')).toBe(f.stateBody);
  });
  it('rejects output aliases to either input, including symlinks and hardlinks', async () => {
    const f = await setup();
    const alias = path.join(f.base, 'alias.json');
    await symlink(f.state, alias);
    const hard = path.join(f.base, 'hard.json');
    await link(f.state, hard);
    for (const out of [f.state, f.corpus, alias, hard]) {
      const r = run('plan-cn.ts', [
        '--corpus',
        f.corpus,
        '--state',
        f.state,
        '--out',
        out,
      ]);
      expect(r.status).not.toBe(0);
    }
    expect(await readFile(f.state, 'utf8')).toBe(f.stateBody);
  });
  it('rejects missing/invalid inputs rather than assuming an empty state', async () => {
    const f = await setup();
    const out = path.join(f.base, 'plan.json');
    await writeFile(f.state, '{}');
    expect(
      run('plan-cn.ts', [
        '--corpus',
        f.corpus,
        '--state',
        f.state,
        '--out',
        out,
      ]).status,
    ).not.toBe(0);
    await rm(f.state);
    expect(
      run('plan-cn.ts', [
        '--corpus',
        f.corpus,
        '--state',
        f.state,
        '--out',
        out,
      ]).status,
    ).not.toBe(0);
    expect(run('export-cn.ts', ['--unknown', 'x']).status).not.toBe(0);
  });
  it('rejects incomplete export and a sample selection with missing identity', async () => {
    const f = await fixture();
    const out = path.join(f.base, 'out.json');
    const selection = path.join(f.base, 'selection.json');
    await writeFile(
      selection,
      JSON.stringify([fixtureUrl, '/zh-CN/ai/not-published']),
    );
    expect(
      run('export-cn.ts', [
        '--public',
        f.root,
        '--out',
        out,
        '--scope',
        'sample',
        '--revision',
        'r',
        '--select',
        selection,
      ]).status,
    ).not.toBe(0);
    await rm(path.join(f.root, `.${fixtureUrl}.md`));
    expect(
      run('export-cn.ts', [
        '--public',
        f.root,
        '--out',
        out,
        '--scope',
        'cn',
        '--revision',
        'r',
      ]).status,
    ).not.toBe(0);
  });
  it('refuses export into the published input tree', async () => {
    const f = await fixture();
    expect(
      run('export-cn.ts', [
        '--public',
        f.root,
        '--out',
        path.join(f.root, '__static/docs-routes.json'),
        '--scope',
        'cn',
        '--revision',
        'r',
      ]).status,
    ).not.toBe(0);
  });
});
