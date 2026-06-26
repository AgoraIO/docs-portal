import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyPlatformGroupMigration,
  planPlatformGroupMigration,
} from './migrate-platform-group.mjs';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe('migrate-platform-group helpers', () => {
  it('plans a conservative split-file platform group migration', () => {
    expect(
      planPlatformGroupMigration(
        'content/docs/en/ai/get-started/quickstart.mdx',
        `---
title: Quickstart
description: Build an app.
---

<PlatformStructured platform="ios">
## iOS

Use Swift.
</PlatformStructured>

<PlatformStructured platform="android">
## Android

Use Kotlin.
</PlatformStructured>
`,
        { skipExisting: false },
      ),
    ).toEqual({
      filePath: 'content/docs/en/ai/get-started/quickstart.mdx',
      platforms: ['ios', 'android'],
      status: 'ready',
      targetDir: 'content/docs/en/ai/get-started/quickstart',
      targetFiles: [
        {
          content: `---
title: Quickstart
description: Build an app.
layout: platform-group
platforms:
  - ios
  - android
defaultPlatform: ios
---
`,
          path: 'content/docs/en/ai/get-started/quickstart/index.mdx',
        },
        {
          content: `## iOS

Use Swift.
`,
          path: 'content/docs/en/ai/get-started/quickstart/ios.mdx',
        },
        {
          content: `## Android

Use Kotlin.
`,
          path: 'content/docs/en/ai/get-started/quickstart/android.mdx',
        },
      ],
    });
  });

  it('normalizes platform aliases in the generated target files', () => {
    expect(
      planPlatformGroupMigration(
        'content/docs/en/demo.mdx',
        `<PlatformStructured platform="react-js">
Web content
</PlatformStructured>

<PlatformStructured platform="ios">
iOS content
</PlatformStructured>
`,
        { skipExisting: false },
      ),
    ).toMatchObject({
      platforms: ['javascript', 'ios'],
      status: 'ready',
      targetFiles: [
        expect.any(Object),
        {
          path: 'content/docs/en/demo/javascript.mdx',
        },
        {
          path: 'content/docs/en/demo/ios.mdx',
        },
      ],
    });
  });

  it('skips mixed shared content in phase one', () => {
    expect(
      planPlatformGroupMigration(
        'content/docs/en/ai/get-started/quickstart.mdx',
        `Intro.

<PlatformStructured platform="ios">
iOS
</PlatformStructured>

<PlatformStructured platform="android">
Android
</PlatformStructured>
`,
      ),
    ).toMatchObject({
      reason:
        'only files made of consecutive top-level PlatformStructured blocks are supported',
      status: 'skipped',
    });
  });

  it('skips duplicate platforms instead of guessing a lossy split', () => {
    expect(
      planPlatformGroupMigration(
        'content/docs/en/duplicate.mdx',
        `<PlatformStructured platform="ios">
First
</PlatformStructured>

<PlatformStructured platform="ios">
Second
</PlatformStructured>
`,
      ),
    ).toMatchObject({
      reason: 'duplicate platform: ios',
      status: 'skipped',
    });
  });

  it('writes split files and removes the source file on apply', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'platform-group-migration-'));
    tempDirs.push(tempDir);
    const sourcePath = join(tempDir, 'quickstart.mdx');

    writeFileSync(
      sourcePath,
      `<PlatformStructured platform="ios">
iOS content
</PlatformStructured>

<PlatformStructured platform="android">
Android content
</PlatformStructured>
`,
    );

    const plan = planPlatformGroupMigration(
      sourcePath,
      readFileSync(sourcePath, 'utf8'),
    );
    applyPlatformGroupMigration(plan);

    expect(() => readFileSync(sourcePath, 'utf8')).toThrow();
    expect(
      readFileSync(join(tempDir, 'quickstart/index.mdx'), 'utf8'),
    ).toContain('layout: platform-group');
    expect(readFileSync(join(tempDir, 'quickstart/ios.mdx'), 'utf8')).toContain(
      'iOS content',
    );
  });
});
