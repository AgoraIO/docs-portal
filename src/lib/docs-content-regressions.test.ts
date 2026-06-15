import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

describe('docs content regressions', () => {
  it('compiles the realtime video quickstart without MDX tag nesting errors', async () => {
    const source = readFileSync(
      resolve(process.cwd(), 'content/docs/en/realtime-media/video/index.mdx'),
      'utf8',
    );

    await expect(
      compile(source, {
        jsx: true,
      }),
    ).resolves.toBeDefined();
  });
});
