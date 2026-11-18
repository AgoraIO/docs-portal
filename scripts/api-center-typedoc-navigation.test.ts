import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve('content/docs/zh-CN');
const pages = readdirSync(root, { recursive: true })
  .filter(
    (name): name is string => typeof name === 'string' && /\.mdx?$/.test(name),
  )
  .map((name) => ({ name, content: readFileSync(resolve(root, name), 'utf8') }))
  .filter(({ content }) => /^ {2}generator: typedoc$/m.test(content));

describe('published Chinese TypeDoc references', () => {
  it('omits generated hierarchy and member indexes across every product', () => {
    expect(pages.length).toBeGreaterThan(100);
    const remnants = pages
      .filter(({ content }) => /^#{1,6} (Hierarchy|Index)\s*$/m.test(content))
      .map(({ name }) => name);
    expect(remnants).toEqual([]);
  });

  it('keeps overview navigation and stable API member details', () => {
    for (const name of [
      'api-reference/rtc/web/globals.mdx',
      'api-reference/rtc/mini-program/globals.mdx',
      'api-reference/whiteboard/whiteboard-sdk/web/(current)/globals.mdx',
    ]) {
      const content = readFileSync(resolve(root, name), 'utf8');
      expect(content).toContain('## Enumerations');
      expect(content).toContain('## Interfaces');
      expect(content).toMatch(
        /\]\(\/zh-CN\/api-reference\/[^)]+\/interfaces\//,
      );
    }
    const track = readFileSync(
      resolve(root, 'api-reference/rtc/web/interfaces/ilocaltrack.mdx'),
      'utf8',
    );
    expect(track).toContain('<a id="removealllisteners"></a>');
    expect(track).toContain('removeAllListeners(event?: string): void');
    expect(track.match(/^## Events$/gm)).toHaveLength(1);
    expect(track.match(/^## Properties$/gm)).toHaveLength(1);
    expect(track.match(/^## Methods$/gm)).toHaveLength(1);
  });
});
