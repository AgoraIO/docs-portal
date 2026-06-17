import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceConfig = readFileSync(
  path.resolve(import.meta.dirname, 'source.config.ts'),
  'utf8',
);

describe('source.config highlight languages', () => {
  it('keeps the MDX highlighter trimmed to the audited language set', () => {
    const langsMatch = sourceConfig.match(/langs:\s*\[([\s\S]*?)\],\s*langAlias:/);

    expect(langsMatch).not.toBeNull();

    const langs =
      langsMatch?.[1]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith("'"))
        .map((line) => line.replace(/[',]/g, '')) ?? [];

    expect(langs).toEqual([
      'bash',
      'c',
      'csharp',
      'go',
      'java',
      'javascript',
      'json',
      'kotlin',
      'markdown',
      'objc',
      'php',
      'powershell',
      'python',
      'shellscript',
      'swift',
      'toml',
      'tsx',
      'typescript',
    ]);
  });
});
