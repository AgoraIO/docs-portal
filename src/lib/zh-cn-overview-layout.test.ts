import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const introductionPath = path.join(
  process.cwd(),
  'content/docs/zh-CN/introduction/index.mdx',
);

describe('zh-CN introduction overview layout', () => {
  it('uses responsive columns for the popular scenarios grid', () => {
    const content = readFileSync(introductionPath, 'utf8');

    expect(content).toContain(
      'grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
    );
    expect(content).not.toContain(
      "gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'",
    );
  });
});
