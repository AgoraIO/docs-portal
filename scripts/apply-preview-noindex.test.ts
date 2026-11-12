import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  addNoindexRoute,
  applyPreviewNoindex,
  NOINDEX_ROUTE,
  PREVIEW_ROBOTS_TXT,
} from './apply-preview-noindex.mjs';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe('addNoindexRoute', () => {
  it('prepends a continue route that sets X-Robots-Tag', () => {
    const redirect = {
      src: '^/old$',
      headers: { Location: '/new' },
      status: 301,
    };
    const result = addNoindexRoute({ routes: [redirect] });

    expect(result.routes).toEqual([NOINDEX_ROUTE, redirect]);
  });

  it('creates routes when the config has none', () => {
    expect(addNoindexRoute({}).routes).toEqual([NOINDEX_ROUTE]);
  });

  it('is idempotent', () => {
    const once = addNoindexRoute({ routes: [] });
    expect(addNoindexRoute(once).routes).toHaveLength(1);
  });
});

describe('applyPreviewNoindex', () => {
  it('rewrites vercel.json and robots.txt in place', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'preview-noindex-'));
    tempDirs.push(root);
    await mkdir(path.join(root, 'public'));
    await writeFile(
      path.join(root, 'vercel.json'),
      JSON.stringify({ outputDirectory: 'dist/client', routes: [] }),
    );
    await writeFile(path.join(root, 'public', 'robots.txt'), 'Allow: /\n');

    applyPreviewNoindex(root);

    const config = JSON.parse(
      await readFile(path.join(root, 'vercel.json'), 'utf8'),
    );
    expect(config.outputDirectory).toBe('dist/client');
    expect(config.routes[0]).toEqual(NOINDEX_ROUTE);
    expect(
      await readFile(path.join(root, 'public', 'robots.txt'), 'utf8'),
    ).toBe(PREVIEW_ROBOTS_TXT);
  });
});
