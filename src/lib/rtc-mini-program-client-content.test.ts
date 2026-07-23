import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const clientPagePath = resolve(
  process.cwd(),
  'content/docs/zh-CN/api-reference/rtc/mini-program/classes/client.mdx',
);

function loadClientPage() {
  return readFileSync(clientPagePath, 'utf8');
}

describe('RTC mini-program Client reference', () => {
  it('starts with the constructor reference instead of TypeDoc indexes', () => {
    const content = loadClientPage();
    const body = content.slice(content.indexOf('\n---\n', 4) + 5).trimStart();

    expect(body).toMatch(/^## Constructors\n/);
    expect(body).not.toContain('### Hierarchy');
    expect(body).not.toContain('## Index');
  });

  it('keeps each on overload with its own documentation', () => {
    const content = loadClientPage();
    const onSection = content.slice(
      content.indexOf('<a id="on"></a>'),
      content.indexOf('<a id="publish"></a>'),
    );
    const overloadTitles = [
      'on(event: &quot;client-banned&quot;): void',
      'on(event: &quot;error&quot;, callback: function): void',
      'on(event: &quot;stream-added&quot;, callback: function): void',
      'on(event: &quot;stream-removed&quot;, callback: function): void',
      'on(event: &quot;update-url&quot;, callback: function): void',
      'on(event: &quot;video-rotation&quot;, callback: function): void',
      'on(event: &quot;token-privilege-did-expire&quot;): void',
      'on(event: &quot;token-privilege-will-expire&quot;): void',
      'on(event: &quot;mute-audio&quot;, callback: function): void',
      'on(event: &quot;mute-video&quot;, callback: function): void',
      'on(event: &quot;unmute-audio&quot;, callback: function): void',
      'on(event: &quot;unmute-video&quot;, callback: function): void',
      'on(event: &quot;channel-media-relay-event&quot;, callback: function): void',
      'on(event: &quot;channel-media-relay-state&quot;, callback: function): void',
    ];

    expect(onSection).toContain('### on');
    expect(onSection).not.toContain('<Accordion title="on"');
    expect(onSection).toContain('<Accordions defaultValue="on-client-banned">');

    const titleIndexes = overloadTitles.map((title) => {
      const marker = `<Accordion title="${title}"`;
      const index = onSection.indexOf(marker);
      expect(index).toBeGreaterThanOrEqual(0);
      return index;
    });
    expect(titleIndexes).toEqual([...titleIndexes].sort((a, b) => a - b));

    const firstOverload = onSection.slice(titleIndexes[0], titleIndexes[1]);
    expect(
      firstOverload.indexOf('on(event: "client-banned"): void'),
    ).toBeLessThan(firstOverload.indexOf('用户被服务器禁止。'));

    const errorOverload = onSection.slice(titleIndexes[1], titleIndexes[2]);
    expect(
      errorOverload.indexOf('on(event: "error", callback: function): void'),
    ).toBeLessThan(errorOverload.indexOf('通知应用程序发生错误。'));
  });

  it('uses the legacy-style table layout for every parameter and return block', () => {
    const content = loadClientPage();
    const parameterLists = content.match(/<ParameterList(?:\s[^>]*)?>/g) ?? [];
    const returnBlocks = content.match(/<ApiReturns(?:\s[^>]*)?>/g) ?? [];

    expect(parameterLists.length).toBeGreaterThan(0);
    expect(parameterLists.every((tag) => tag.includes('variant="table"'))).toBe(
      true,
    );
    expect(content).not.toContain('title="Parameters"');

    expect(returnBlocks.length).toBeGreaterThan(0);
    expect(returnBlocks.every((tag) => tag.includes('title="返回值"'))).toBe(
      true,
    );
  });
});
