import { spawnSync } from 'node:child_process';
import { link, readFile, rm, symlink, writeFile } from 'node:fs/promises';
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
