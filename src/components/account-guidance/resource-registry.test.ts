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

  it.each([
    ['zh-CN/reference/demo/agora-lab.mdx', 'https://www.pgyer.com/zwbL'],
    [
      'zh-CN/reference/demo/shengdong-entertainment.mdx',
      'https://apps.apple.com/cn/app/%E5%A3%B0%E5%8A%A8%E4%BA%92%E5%A8%B1-%E5%A3%B0%E7%BD%91%E6%B3%9B%E5%A8%B1%E4%B9%90%E5%85%A8%E5%9C%BA%E6%99%AF/id1537528920',
    ],
    [
      'zh-CN/reference/demo/shengdong-entertainment.mdx',
      'https://www.pgyer.com/Grizis',
    ],
    ['zh-CN/reference/demo/fastboard.mdx', 'https://demo.whiteboard.agora.io/'],
    [
      'zh-CN/reference/demo/rtc-sdk-api-example.mdx',
      'https://webdemo.agora.io',
    ],
  ])('registers %s %s', (contentPath, href) => {
    expect(getChineseAccountGuidanceResource(contentPath, href)).not.toBeNull();
  });
});
