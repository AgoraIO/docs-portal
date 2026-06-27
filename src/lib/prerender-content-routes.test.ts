import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getContentDocsPrerenderPaths } from './prerender-content-routes';

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe('getContentDocsPrerenderPaths', () => {
  it('maps content docs files to canonical route paths', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/introduction/index.mdx');
    writeDoc(root, 'en/introduction/about-agora.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/(current)/overview.mdx');
    writeDoc(root, 'zh-CN/ai/domain-overview.md');

    expect(getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android/overview',
      '/en/introduction',
      '/en/introduction/about-agora',
      '/zh-CN/ai/domain-overview',
    ]);
  });

  it('excludes implicit platform panel files from prerender paths', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(
      root,
      'en/ai/get-started/platform-split/index.mdx',
      `---
layout: platform-group
platforms:
  - ios
  - android
---

# Split platform page
`,
    );
    writeDoc(root, 'en/ai/get-started/platform-split/ios.mdx');
    writeDoc(root, 'en/ai/get-started/platform-split/android.mdx');
    writeDoc(root, 'en/ai/get-started/platform-split/notes.mdx');

    expect(getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/get-started/platform-split',
      '/en/ai/get-started/platform-split/notes',
    ]);
  });
});

function writeDoc(root: string, relativePath: string, content = '# Test\n') {
  const filePath = join(root, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}
