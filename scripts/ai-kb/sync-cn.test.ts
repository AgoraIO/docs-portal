// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { createKbDocument } from '../../src/lib/ai-kb/corpus';
import { openSyncStore } from '../../src/lib/ai-kb/sync-state.server';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});
async function fixture() {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'kb-cli-')));
  roots.push(directory);
  const config = join(directory, 'target.json'),
    corpus = join(directory, 'corpus.json'),
    receipt = join(directory, 'receipt.json'),
    state = join(directory, 'state');
  const target = {
    schema: 1 as const,
    environment: 'local-demo' as const,
    region: 'cn-beijing' as const,
    workspaceId: 'llm-test',
    categoryId: 'cat',
    name: 'demo',
    origin: 'https://doc.shengwang.cn',
    scope: 'test',
  };
  await writeFile(config, JSON.stringify(target));
  await writeFile(
    corpus,
    JSON.stringify({
      schema: 1,
      scope: 'test',
      revision: 'rev',
      complete: true,
      documents: [
        createKbDocument({
          content: 'Hello',
          metadata: {
            url: '/zh-CN/ai/a',
            canonicalUrl: '/zh-CN/ai/a',
            title: 'A',
            locale: 'zh-CN',
            products: [],
            platforms: [],
            docType: 'docs',
            sections: [],
          },
        }),
      ],
    }),
  );
  return { directory, config, corpus, receipt, state, target };
}
function run(
  f: Awaited<ReturnType<typeof fixture>>,
  extra: string[] = [],
  env: Record<string, string> = {},
) {
  return spawnSync(
    'bun',
    [
      'scripts/ai-kb/sync-cn.ts',
      '--config',
      f.config,
      '--corpus',
      f.corpus,
      '--state-dir',
      f.state,
      '--receipt',
      f.receipt,
      ...extra,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, BAILIAN_API_KEY: '', ...env },
      encoding: 'utf8',
      timeout: 10000,
    },
  );
}
it('previews in a real Bun subprocess without credentials or cloud writes', async () => {
  const f = await fixture();
  const r = run(f);
  expect(r.status, r.stderr).toBe(0);
  expect(JSON.parse(await readFile(f.receipt, 'utf8'))).toMatchObject({
    status: 'preview',
    remoteWrites: 0,
    counts: { create: 1, update: 0, delete: 0, skip: 0 },
  });
});
it('requires credentials and explicit new-demo initialization without echoing sensitive inputs', async () => {
  const f = await fixture();
  expect(run(f, ['--apply', '--new-demo']).status).not.toBe(0);
  const r = run(f, ['--apply'], { BAILIAN_API_KEY: 'secret-do-not-echo' });
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).not.toContain('secret-do-not-echo');
});
it('rejects scope mismatch and concurrent writers', async () => {
  const f = await fixture();
  await writeFile(f.config, JSON.stringify({ ...f.target, scope: 'wrong' }));
  expect(run(f).status).not.toBe(0);
  await writeFile(f.config, JSON.stringify(f.target));
  const s = await openSyncStore({ directory: f.state, target: f.target });
  try {
    expect(run(f).status).not.toBe(0);
  } finally {
    await s.close();
  }
});
it('cannot overwrite corpus, config or the state tree with a receipt', async () => {
  const f = await fixture();
  const before = await readFile(f.corpus, 'utf8');
  for (const path of [f.config, f.corpus, join(f.state, 'state.json')])
    expect(run({ ...f, receipt: path }).status).not.toBe(0);
  expect(await readFile(f.corpus, 'utf8')).toBe(before);
});
it('preflight fails before network calls when the API Key is missing', async () => {
  const f = await fixture();
  const r = spawnSync(
    'bun',
    ['scripts/ai-kb/preflight-cn.ts', '--config', f.config],
    { env: { ...process.env, BAILIAN_API_KEY: '' }, encoding: 'utf8' },
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain('MISSING_API_KEY');
});
it('marks an interrupted apply as applying rather than a zero-write preview', async () => {
  const { spawn } = await import('node:child_process');
  const f = await fixture();
  const preload = join(f.directory, 'stall.ts');
  const marker = join(f.directory, 'request-started');
  await writeFile(
    preload,
    `import {writeFile} from 'node:fs/promises'; setInterval(()=>{},1000); globalThis.fetch = async () => { await writeFile(${JSON.stringify(marker)}, 'sent'); return new Promise(() => {}); };`,
  );
  const r = spawn(
    'bun',
    [
      '--preload',
      preload,
      'scripts/ai-kb/sync-cn.ts',
      '--config',
      f.config,
      '--corpus',
      f.corpus,
      '--state-dir',
      f.state,
      '--receipt',
      f.receipt,
      '--apply',
      '--new-demo',
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, BAILIAN_API_KEY: 'test-invalid-only' },
      stdio: 'ignore',
    },
  );
  let observed: Record<string, unknown> | undefined;
  const deadline = Date.now() + 2500;
  while (Date.now() < deadline) {
    try {
      await readFile(marker);
      observed = JSON.parse(await readFile(f.receipt, 'utf8'));
      if (observed) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  r.kill('SIGKILL');
  await new Promise<void>((resolve) => {
    if (r.exitCode !== null || r.signalCode !== null) resolve();
    else r.once('exit', () => resolve());
  });
  expect(await readFile(marker, 'utf8')).toBe('sent');
  expect(
    JSON.parse(await readFile(join(f.state, 'state.json'), 'utf8')).pending[0]
      .intent,
  ).toBe('lease');
  expect(observed?.status).toBe('applying');
  expect(observed?.remoteWrites).toBeNull();
});
