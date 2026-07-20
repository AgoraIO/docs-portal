import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readPublishedDocsRoutes } from './published-docs-routes.server';

const tempPaths: string[] = [];

afterEach(() => {
  for (const tempPath of tempPaths.splice(0)) {
    rmSync(dirname(tempPath), { force: true, recursive: true });
  }
});

describe('published docs routes manifest', () => {
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
  });
});
