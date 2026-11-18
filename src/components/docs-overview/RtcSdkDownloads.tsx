import { getPlatformIconSrc } from './platform-icon-src';
import { getRtcDownloadCardEntries } from './rtc-download-card-entries';
import { zhCNRtcSdkDownloadPlatforms } from './rtc-sdk-downloads-data.zh-cn';
import { SdkDownloadCard } from './SdkDownloadCard';
import type { SdkDownloadVersion } from './sdk-downloads-data';
import { zhCNSdkDownloadPlatforms } from './sdk-downloads-data.zh-cn';

type RtcProduct = 'video' | 'voice';

export function RtcSdkDownloads({
  platform,
  product,
  variant,
}: {
  platform: string;
  product: RtcProduct;
  variant?: 'standard' | 'uniontech';
}) {
  const platformData =
    zhCNRtcSdkDownloadPlatforms.find((item) => item.id === platform) ??
    zhCNSdkDownloadPlatforms.find((item) => item.id === platform);
  const sdk = platformData?.core.find(
    (item) => item.id === `${product}-sdk-${platform}`,
  );
  if (!platformData || !sdk) return null;

  const cards = getRtcDownloadCardEntries(
    platform,
    platformData.label,
    product,
    sdk,
  ).filter((card) => {
    if (platform !== 'electron' || !variant) return true;
    const isUnionTech = card.version.id.endsWith('-electron-uniontech');
    return variant === 'uniontech' ? isUnionTech : !isUnionTech;
  });

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
              title={getResourceTitle(
                platform,
                platformData.label,
                product,
                card.version,
              )}
              version={
                platform === 'macos'
                  ? { ...card.version, packageName: undefined }
                  : platform === 'unity'
                    ? {
                        ...card.version,
                        label: card.version.label.replace(/-build\.\d+/, ''),
                      }
                    : card.version
              }
              versionSuffix={card.versionSuffix}
              packageSizeContent={getPackageSizeContent(
                platform,
                product,
                card.version,
              )}
            />
          );
        })}
      </div>
    </section>
  );
}

// Resource pages preserve the source's card labels; catalog labels remain
// descriptive when the video/audio tab context is absent.
function getResourceTitle(
  platform: string,
  label: string,
  product: RtcProduct,
  version: SdkDownloadVersion,
) {
  if (platform === 'electron' && version.id.endsWith('-electron-uniontech'))
    return 'Electron for 统信 OS';
  if (platform === 'mini-program') return '微信/QQ 小程序';
  if (platform === 'unreal-engine') return 'Unreal';
  if (platform === 'harmonyos')
    return `HarmonyOS NEXT ${product === 'voice' ? 'Audio' : 'Full'}`;
  if (platform === 'android' || platform === 'ios') {
    if (/\bLite\b/i.test(version.label)) return `${label} Lite`;
    if (/\bFull\b/i.test(version.label)) return `${label} Full`;
    if (platform === 'ios' && product === 'voice') return 'iOS Audio';
  }
  return label;
}

function getPackageSizeContent(
  platform: string,
  product: RtcProduct,
  version: SdkDownloadVersion,
) {
  if (!version.packageSize || !['android', 'ios'].includes(platform))
    return undefined;
  const lite = /\bLite\b/i.test(version.label);
  const library =
    platform === 'ios'
      ? 'RtcBasic'
      : product === 'voice'
        ? 'voice-rtc-basic'
        : 'full-rtc-basic';
  const prefix = lite
    ? '集成 SDK 后增加的包体积'
    : `集成基础库 (${library}) SDK 后增加的包体积`;
  if (platform === 'ios') return `${prefix}为 ${version.packageSize}`;
  return (
    <>
      {prefix} (MB) 数据如下：
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {version.packageSize.split('；').map((entry) => (
          <li key={entry}>{entry.replace(/ (\S+) MB$/, '：$1')}</li>
        ))}
      </ul>
    </>
  );
}
