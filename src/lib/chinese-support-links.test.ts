import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Chinese support links', () => {
  it.each([
    ['content/docs/zh-CN', /\.mdx?$/],
    ['content/openapi', /\.zh-CN\.(?:ya?ml|json)$/],
  ])('does not use legacy ticket portals in %s', (directory, filePattern) => {
    const root = path.join(process.cwd(), directory);
    const legacyLinks = readdirSync(root, { recursive: true })
      .filter((file): file is string => typeof file === 'string')
      .filter((file) => filePattern.test(file))
      .flatMap((file) => {
        const content = readFileSync(path.join(root, file), 'utf8');
        return [
          ...content.matchAll(
            /https?:\/\/(?:agoraio\.zendesk\.com|agora-ticket\.agora\.io|tickets\.shengwang\.cn)(?=[/\s)"']|$)/gi,
          ),
        ].map(([href]) => ({ file: path.join(directory, file), href }));
      });

    expect(legacyLinks).toEqual([]);
  });
});
