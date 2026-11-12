import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

const source = readFileSync(
  'content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx',
  'utf8',
);

describe('RTC audio quickstart callout list parity', () => {
  it.each([
    ['ios', '下表中列出的权限为必需权限', 3],
    ['windows', '调用 `release` 后', 2],
  ] as const)(
    'keeps %s callout items at the same level',
    async (platform, marker, count) => {
      const body = source
        .split(`<PlatformStructured platform="${platform}">`)[1]
        .split('</PlatformStructured>')[0];
      const callout = [
        ...body.matchAll(/^([ ]*):::\w+\[[^\]]+\]\n[\s\S]*?^\1:::/gm),
      ].find((match) => match[0].includes(marker));
      expect(callout).toBeDefined();
      if (!callout) throw new Error(`Missing ${platform} callout`);
      const markdown = callout[0]
        .split('\n')
        .map((line) => line.slice(callout[1].length))
        .join('\n');
      const { container } = await renderDocsMdx(markdown);
      const list = container.querySelector('ul');
      expect(list?.children).toHaveLength(count);
      expect(list?.querySelector('li ul')).toBeNull();
    },
  );
});
