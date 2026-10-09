import { getPlatformIconSrc } from './platform-icon-src';
import { getRtcDownloadCardEntries } from './rtc-download-card-entries';
import { SdkDownloadCard } from './SdkDownloadCard';
import { zhCNSdkDownloadPlatforms } from './sdk-downloads-data.zh-cn';

type RtcProduct = 'video' | 'voice';

export function RtcSdkDownloads({
  platform,
  product,
}: {
  platform: string;
  product: RtcProduct;
}) {
  const platformData = zhCNSdkDownloadPlatforms.find(
    (item) => item.id === platform,
  );
  const sdk = platformData?.core.find(
    (item) => item.id === `${product}-sdk-${platform}`,
  );
  if (!platformData || !sdk) return null;

  const cards = getRtcDownloadCardEntries(
    platform,
    platformData.label,
    product,
    sdk,
  );

  return (
    <section
      aria-label={`${platformData.label} ${product === 'video' ? '视频' : '音频'} SDK 下载`}
      className="not-prose my-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          return (
            <SdkDownloadCard
              iconSrc={getPlatformIconSrc(card.iconPlatformId)}
              key={card.version.id}
              title={card.title}
              version={card.version}
              versionSuffix={card.versionSuffix}
            />
          );
        })}
      </div>
    </section>
  );
}
