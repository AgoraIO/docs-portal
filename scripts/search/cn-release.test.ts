import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type ReleaseCommand, releaseCnSearch } from './cn-release';

const revision = 'a'.repeat(40);
const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cn-search-release-'));
  temporaryDirectories.push(root);
  const save = async (filename: string, value: unknown) => {
    const file = path.join(root, filename);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(
      file,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  };
  const records = [
    {
      id: 'android',
      url: '/api-reference/rtc/android/channel#joinchannel',
      version: '4.7.2',
    },
    {
      id: 'ios',
      url: '/api-reference/rtc/ios/channel#joinchannel',
      version: '4.7.0',
    },
  ];
  for (const [platform, version] of [
    ['android', '4.7.2'],
    ['ios', '4.7.0'],
  ])
    await save(`content/docs/zh-CN/api-reference/rtc/${platform}/meta.json`, {
      navScope: {
        defaultVersion: 'current',
        versions: [
          { id: 'current', label: `v${version}`, path: '(current)' },
          {
            id: '4.6.0',
            label: 'v4.6.0',
            path: '4.6.0',
            href: 'https://archive.example/4.6.0',
          },
        ],
      },
    });
  await save(
    'dist/client/introduction/index.html',
    '<h1>Candidate release</h1>',
  );
  await save('.output/server/index.mjs', 'console.log("candidate service")');
  const exportRecords = async () => {
    await save('dist/search/cn-records.json', records);
    await save('dist/search/cn-coverage-audit.json', {
      snapshot: {
        sha256: createHash('sha256')
          .update(JSON.stringify(records))
          .digest('hex'),
      },
    });
  };
  await exportRecords();
  const calls: string[][] = [];
  const environments: (Record<string, string> | undefined)[] = [];
  const command = vi.fn<ReleaseCommand>(async (args, env) => {
    calls.push(args);
    environments.push(env);
    if (args.join(' ') === 'git rev-parse HEAD') return revision;
    if (args[0] === 'git') return '';
    if (args.includes('search:export:cn')) await exportRecords();
    if (args.includes('prepare'))
      await save('dist/search/cn-release.json', {
        format: 1,
        revision,
        count: records.length,
        release: 'candidate',
        indexUid: 'docs_cn',
        stagedUid: 'docs_cn__candidate',
        checksum: 'engine-checksum',
      });
    return '';
  });
  const request = vi.fn<typeof fetch>(async () =>
    Response.json({ status: 'ok', revision }),
  );
  const run = (
    mode: 'bundle' | 'prepare' | 'promote',
    origin = 'https://docs.example',
  ) => releaseCnSearch(mode, { root, revision, origin }, command, request);
  return { root, save, records, command, calls, environments, request, run };
}

describe('CN release entry point', () => {
  it('builds and audits one release then verifies deployed artifacts before promotion', async () => {
    const f = await fixture();
    await f.run('bundle');
    const manifest = JSON.parse(
      await readFile(
        path.join(f.root, 'dist/search/cn-publication.json'),
        'utf8',
      ),
    );
    expect(manifest).toMatchObject({ format: 1, revision, count: 2 });
    expect(
      f.calls
        .filter((args) => args[0] !== 'git')
        .map((args) => args.slice(0, 3).join(' ')),
    ).toEqual([
      'bun run build:static',
      'bun run build:service',
      'bun run search:export:cn',
      'node scripts/search/audit-cn-coverage.mjs --records=dist/search/cn-records.json',
    ]);
    expect(
      f.environments
        .filter(Boolean)
        .every((env) => env?.VITE_DOCS_REGION === 'cn'),
    ).toBe(true);
    await f.run('prepare');
    await f.run('promote');
    const verification = f.calls.findIndex((args) =>
      args.includes('search:verify:urls:cn'),
    );
    const promotion = f.calls.findIndex((args) => args.includes('promote'));
    expect(verification).toBeGreaterThan(0);
    expect(promotion).toBeGreaterThan(verification);
    expect(f.request).toHaveBeenCalledTimes(1);
  });

  it('does not seal a bundle or prepare an index when the coverage gate fails', async () => {
    const f = await fixture();
    await f.run('bundle');
    const run = f.command.getMockImplementation();
    if (!run) throw new Error('Missing fixture command');
    f.command.mockImplementation(async (args, env) => {
      if (args.includes('scripts/search/audit-cn-coverage.mjs'))
        throw new Error('20 missing TOC sections');
      return run(args, env);
    });
    await expect(f.run('bundle')).rejects.toThrow('20 missing TOC');
    await expect(
      readFile(path.join(f.root, 'dist/search/cn-publication.json')),
    ).rejects.toThrow();
    expect(f.calls.some((args) => args.includes('prepare'))).toBe(false);
  });

  it('accepts a transported bundle when empty directories were not preserved', async () => {
    const f = await fixture();
    const empty = path.join(f.root, '.output/unused');
    await mkdir(empty);
    await f.run('bundle');
    // File-only artifact stores preserve all deployment files but omit empty directories.
    await rm(empty, { recursive: true });
    await expect(f.run('prepare')).resolves.toBeUndefined();
    expect(f.calls.some((args) => args.includes('prepare'))).toBe(true);
  });

  it('rejects symbolic links instead of depending on files outside the bundle', async () => {
    const f = await fixture();
    await symlink(
      'server/index.mjs',
      path.join(f.root, '.output/service-link'),
    );
    await expect(f.run('bundle')).rejects.toThrow('artifact is a symlink');
    expect(f.calls.some((args) => args.includes('prepare'))).toBe(false);
  });

  it.each([
    [
      'historical path',
      '/api-reference/rtc/android/4.7.0/channel#joinchannel',
      '4.7.0',
      'Historical SDK',
    ],
    [
      'stale version',
      '/api-reference/rtc/android/channel#joinchannel',
      '4.7.0',
      'SDK version',
    ],
  ])(
    'rejects %s while the other platform remains on its own current version',
    async (_, url, version, error) => {
      const f = await fixture();
      f.records[0] = { ...f.records[0], url, version };
      await expect(f.run('bundle')).rejects.toThrow(error);
    },
  );

  it.each([
    'dist/client/introduction/index.html',
    '.output/server/index.mjs',
    'dist/search/cn-records.json',
  ])('rejects changed %s before any indexing command', async (filename) => {
    const f = await fixture();
    await f.run('bundle');
    await f.save(
      filename,
      filename.endsWith('.json')
        ? [...f.records, { ...f.records[0], id: 'injected' }]
        : 'different release',
    );
    await expect(f.run('prepare')).rejects.toThrow(
      /Release artifacts|Coverage audit/,
    );
    expect(f.calls.some((args) => args.includes('prepare'))).toBe(false);
  });

  it('refuses a receipt from a different bundle before probing or promoting', async () => {
    const f = await fixture();
    await f.run('bundle');
    await f.run('prepare');
    const receipt = JSON.parse(
      await readFile(path.join(f.root, 'dist/search/cn-release.json'), 'utf8'),
    );
    await f.save('dist/search/cn-release.json', {
      ...receipt,
      bundleSha256: 'different-bundle',
    });
    await expect(f.run('promote')).rejects.toThrow('different release bundle');
    expect(f.request).not.toHaveBeenCalled();
    expect(f.calls.some((args) => args.includes('promote'))).toBe(false);
  });

  it.each([undefined, 'b'.repeat(40)])(
    'blocks a deployed API with revision %s',
    async (apiRevision) => {
      const f = await fixture();
      await f.run('bundle');
      await f.run('prepare');
      f.request.mockResolvedValue(
        Response.json({ status: 'ok', revision: apiRevision }),
      );
      await expect(f.run('promote')).rejects.toThrow('Deployed API');
      expect(f.calls.some((args) => args.includes('promote'))).toBe(false);
    },
  );

  it('never swaps the index when deployed HTML verification fails', async () => {
    const f = await fixture();
    await f.run('bundle');
    await f.run('prepare');
    const run = f.command.getMockImplementation();
    if (!run) throw new Error('Missing fixture command');
    f.command.mockImplementation(async (args, env) => {
      if (args.includes('search:verify:urls:cn'))
        throw new Error('Public HTML belongs to old release');
      return run(args, env);
    });
    await expect(f.run('promote')).rejects.toThrow('old release');
    expect(f.calls.some((args) => args.includes('promote'))).toBe(false);
  });

  it('rejects a dirty checkout and a requested SHA different from HEAD', async () => {
    const f = await fixture();
    f.command.mockResolvedValue('b'.repeat(40));
    await expect(f.run('bundle')).rejects.toThrow('Checkout must match');
    f.command.mockImplementation(async (args) =>
      args.includes('rev-parse')
        ? revision
        : ' M content/docs/zh-CN/example.mdx\n',
    );
    await expect(f.run('bundle')).rejects.toThrow('clean release checkout');
    expect(f.calls.some((args) => args.includes('build:static'))).toBe(false);
  });
});
