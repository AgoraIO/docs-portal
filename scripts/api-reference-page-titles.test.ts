import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

const root = 'content/docs/zh-CN/api-reference';
const version = /\bv?\d+\.\d+(?:\.\d+)*(?:-[\w.-]+)?\b/i;

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

describe('Chinese API Reference titles', () => {
  it('leaves SDK versions to the version switcher across all page and folder titles', () => {
    const violations: string[] = [];
    for (const file of files(root)) {
      let title: string | undefined;
      if (/\.mdx?$/.test(file)) {
        const frontmatter = readFileSync(file, 'utf8').match(
          /^---\r?\n([\s\S]*?)\r?\n---/,
        );
        title = (load(frontmatter?.[1] ?? '') as { title?: string })?.title;
      } else if (path.basename(file) === 'meta.json') {
        title = JSON.parse(readFileSync(file, 'utf8')).title;
      }
      if (title && version.test(title)) violations.push(`${file}: ${title}`);
    }
    expect(violations).toEqual([]);
  }, 30_000);
});
