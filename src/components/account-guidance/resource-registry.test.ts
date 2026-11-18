import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getChineseAccountGuidanceResource } from './resource-registry';

describe('Chinese account guidance resource registry', () => {
  it('maps demo content paths to stable resources without accepting arbitrary URLs', () => {
    expect(
      getChineseAccountGuidanceResource(
        'zh-CN/reference/demo/agora-lab.mdx',
        'https://testflight.apple.com/join/MgzoWZvV',
      ),
    ).toEqual({
      resourceId: 'agora-lab',
      label: '声网实验室',
      target: 'home',
    });

    expect(
      getChineseAccountGuidanceResource(
        'zh-CN/reference/demo/agora-lab.mdx',
        'https://example.com/unknown',
      ),
    ).toBeNull();
  });

  const demoDirectory = 'content/docs/zh-CN/reference/demo';
  const demoLinks = readdirSync(demoDirectory)
    .filter((file) => file.endsWith('.mdx'))
    .flatMap((file) => {
      const source = readFileSync(`${demoDirectory}/${file}`, 'utf8');
      return [...source.matchAll(/<Card title="立即体验" href="([^"]+)"/g)].map(
        (match) => [`zh-CN/reference/demo/${file}`, match[1]],
      );
    });

  it('finds the six existing demo experience entry points', () => {
    expect(demoLinks).toHaveLength(6);
  });

  it.each(demoLinks)(
    'registers the actual document link %s %s',
    (contentPath, href) => {
      expect(
        getChineseAccountGuidanceResource(contentPath, href),
      ).not.toBeNull();
    },
  );
});
