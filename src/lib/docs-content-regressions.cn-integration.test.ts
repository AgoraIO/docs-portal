import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const allDocsRoot = resolve(process.cwd(), 'content/docs');

describe('docs content regressions', () => {
  it('keeps RTC repository card names unchanged with inline platform icons', async () => {
    const source = readFileSync(
      resolve(allDocsRoot, 'zh-CN/realtime-media/rtc/get-started/run-demo.mdx'),
      'utf8',
    );
    const cards = [...source.matchAll(/<Card\b[^\n]+/g)];
    expect(cards).toHaveLength(23);
    for (const [card] of cards) {
      const href = card.match(/href="([^"]+)"/)?.[1];
      const provider = new URL(href ?? '').hostname.split('.')[0];
      expect(card).toContain(
        `title={<RepositoryCardTitle provider="${provider}">`,
      );
      expect(card).not.toMatch(/ · (Gitee|GitHub)/);
      expect(card).not.toContain('icon=');
    }
    await expect(compile(source)).resolves.toBeDefined();
  });
});
