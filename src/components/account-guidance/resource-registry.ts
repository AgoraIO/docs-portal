import type { ConsoleTarget } from '@/lib/auth/contracts';

export type GuidanceResource = {
  resourceId: string;
  label: string;
  target: ConsoleTarget;
};

type DemoResource = GuidanceResource & { href: string };

const demoResources: Record<string, DemoResource[]> = {
  'zh-CN/reference/demo/agora-lab.mdx': [
    {
      href: 'https://testflight.apple.com/join/MgzoWZvV',
      resourceId: 'agora-lab',
      label: '声网实验室',
      target: 'home',
    },
    {
      href: 'https://www.pgyer.com/zwbL',
      resourceId: 'agora-lab',
      label: '声网实验室',
      target: 'home',
    },
  ],
  'zh-CN/reference/demo/shengdong-entertainment.mdx': [
    {
      href: 'https://apps.apple.com/cn/app/%E5%A3%B0%E5%8A%A8%E4%BA%92%E5%A8%B1-%E5%A3%B0%E7%BD%91%E6%B3%9B%E5%A8%B1%E4%B9%90%E5%85%A8%E5%9C%BA%E6%99%AF/id1537528920',
      resourceId: 'shengdong-entertainment',
      label: '声动互娱',
      target: 'home',
    },
    {
      href: 'https://www.pgyer.com/Grizis',
      resourceId: 'shengdong-entertainment',
      label: '声动互娱',
      target: 'home',
    },
  ],
  'zh-CN/reference/demo/fastboard.mdx': [
    {
      href: 'https://demo.whiteboard.agora.io/',
      resourceId: 'fastboard',
      label: 'Fastboard',
      target: 'home',
    },
  ],
  'zh-CN/reference/demo/rtc-sdk-api-example.mdx': [
    {
      href: 'https://webdemo.agora.io',
      resourceId: 'rtc-sdk-api-example',
      label: 'RTC SDK API 示例',
      target: 'home',
    },
  ],
};

export function getChineseAccountGuidanceResource(
  contentPath: string | undefined,
  href: string | undefined,
): GuidanceResource | null {
  if (!contentPath || !href) return null;
  const resource = demoResources[contentPath]?.find(
    (candidate) => candidate.href === href,
  );
  if (!resource) return null;
  const { href: _href, ...guidanceResource } = resource;
  return guidanceResource;
}

export function getSdkAccountGuidanceTarget(productId: string): ConsoleTarget {
  if (productId === 'signaling') return 'rtm';
  if (productId === 'client-toolkit') return 'conversational-ai';
  return 'home';
}
