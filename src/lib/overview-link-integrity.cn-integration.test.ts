import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const docsRoot = path.join(process.cwd(), 'content', 'docs');
function readDoc(sourceFile: string) {
  return readFileSync(path.join(docsRoot, sourceFile), 'utf8');
}

describe('overview entry links', () => {
  it.each([
    ['zh-CN', 'https://ticket.shengwang.cn/'],
    ['en', 'https://agoraio.zendesk.com/hc/en-us'],
  ])(
    'uses the regional ticket portal for the %s introduction',
    (locale, href) => {
      const ticketCard = readDoc(`${locale}/introduction/index.mdx`).match(
        /\{[^{}]*\bicon:\s*"ticket"[^{}]*\}/,
      )?.[0];

      expect(ticketCard).toBeDefined();
      expect(ticketCard).toContain(`href: "${href}"`);
    },
  );
});
