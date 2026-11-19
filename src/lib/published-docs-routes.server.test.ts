import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  readDocsPrerenderPaths,
  readPublishedDocsRoutes,
  writeStaticDocsRouteManifests,
} from './published-docs-routes.server';

const tempPaths: string[] = [];

afterEach(() => {
  for (const tempPath of tempPaths.splice(0)) {
    rmSync(dirname(tempPath), { force: true, recursive: true });
  }
});

describe('published docs routes manifest', () => {
  it('publishes only readable Markdown routes while keeping redirect aliases prerendered', async () => {
    const directory = join(
      import.meta.dirname,
      `../../tmp/published-docs-routes-${randomUUID()}`,
    );
    tempPaths.push(join(directory, 'docs-routes.json'));
    const endpoint = {
      canonicalPath: '/zh-CN/api-reference/api-ref/cloud-recording/acquire',
      markdownPath: '/zh-CN/api-reference/api-ref/cloud-recording/acquire.md',
      url: '/zh-CN/api-reference/api-ref/cloud-recording/acquire',
    };
    const alias = {
      canonicalPath: '/zh-CN/api-reference/api-ref/cloud-recording',
      markdownPath: '/zh-CN/api-reference/api-ref/cloud-recording.md',
      url: '/zh-CN/api-reference/api-ref/cloud-recording',
    };
    await writeStaticDocsRouteManifests({
      directory,
      machineReadableRoutes: [endpoint],
      prerenderRoutes: [alias, endpoint],
    });
    expect(
      readPublishedDocsRoutes(join(directory, 'docs-routes.json')),
    ).toEqual([endpoint]);
    expect(
      readDocsPrerenderPaths(join(directory, 'docs-prerender-paths.json')),
    ).toEqual([
      '/zh-CN/api-reference/api-ref/cloud-recording',
      '/zh-CN/api-reference/api-ref/cloud-recording/acquire',
    ]);
  });
  it('reads generated render paths for the static Vite build', () => {
    const manifestPath = join(
      import.meta.dirname,
      `../../tmp/published-docs-routes-${randomUUID()}/docs-routes.json`,
    );
    tempPaths.push(manifestPath);
    mkdirSync(dirname(manifestPath), { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify([
        {
          canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
          markdownPath: '/en/api-reference/api-ref/uikit-sdk/ios.md',
          platform: 'ios',
          url: '/en/api-reference/api-ref/uikit-sdk/ios',
        },
      ]),
    );

    expect(readPublishedDocsRoutes(manifestPath)).toEqual([
      {
        canonicalPath: '/en/api-reference/api-ref/uikit-sdk',
        markdownPath: '/en/api-reference/api-ref/uikit-sdk/ios.md',
        platform: 'ios',
        url: '/en/api-reference/api-ref/uikit-sdk/ios',
      },
    ]);
  });

  it('fails clearly when the required static-build manifest is missing', () => {
    const manifestPath = join(
      import.meta.dirname,
      `../../tmp/published-docs-routes-${randomUUID()}/missing.json`,
    );

    expect(() => readPublishedDocsRoutes(manifestPath)).toThrow(
      'Run docs:static-payload before the static app build',
    );
    expect(() => readDocsPrerenderPaths(manifestPath)).toThrow(
      'Run docs:static-payload before the static app build',
    );
  });

  it('rejects a document manifest passed as prerender paths', () => {
    const manifestPath = join(
      import.meta.dirname,
      `../../tmp/published-docs-routes-${randomUUID()}/paths.json`,
    );
    tempPaths.push(manifestPath);
    mkdirSync(dirname(manifestPath), { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify([{ url: '/zh-CN/introduction' }]),
    );
    expect(() => readDocsPrerenderPaths(manifestPath)).toThrow(
      'Invalid docs prerender paths manifest',
    );
  });
});
