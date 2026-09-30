import { DownloadResourceCards } from './DownloadResourceCards';

const demoResources = [
  {
    href: 'https://apps.apple.com/cn/app/声动互娱-声网泛娱乐全场景应用/id1537528920',
    platform: 'ios',
    qrAlt: '声动 iOS',
    qrSrc: 'https://web-cdn.agora.io/docs-files/1685428598975',
    title: '声动互娱',
  },
  {
    platform: 'ios',
    qrAlt: 'AUIKaraoke iOS',
    qrSrc: 'https://web-cdn.agora.io/docs-files/1697098066239',
    title: 'AUIKaraoke',
  },
  {
    href: 'https://www.pgyer.com/Grizis',
    platform: 'android',
    qrAlt: '声动 Android',
    qrSrc: 'https://web-cdn.agora.io/docs-files/1688623597225',
    title: '声动互娱',
  },
  {
    platform: 'android',
    qrAlt: 'AUIKaraoke Android',
    qrSrc: 'https://web-cdn.agora.io/docs-files/1697098108357',
    title: 'AUIKaraoke',
  },
] as const;

export function KtvDownloadResources({
  platform,
}: {
  platform: 'android' | 'ios';
}) {
  return (
    <DownloadResourceCards
      items={demoResources.filter((resource) => resource.platform === platform)}
    />
  );
}
