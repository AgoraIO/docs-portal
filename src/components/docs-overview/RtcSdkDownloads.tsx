import { getPlatformIconSrc } from './platform-icon-src';
import { SdkDownloadCard } from './SdkDownloadCard';
import type { SdkDownloadVersion } from './sdk-downloads-data';
import { zhCNSdkDownloadPlatforms } from './sdk-downloads-data.zh-cn';

type RtcProduct = 'video' | 'voice';

const rtcPlatformIconIds: Record<string, string> = {
  'react-js': 'web',
  'unreal-engine': 'unreal-cpp',
};

function variantName(version: SdkDownloadVersion, product: RtcProduct) {
  if (/\bLite\b/i.test(version.label)) return 'Lite';
  if (/\bFull\b/i.test(version.label)) return 'Full';
  return product === 'video' ? '视频 SDK' : '音频 SDK';
}

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

  const platformIconSrc = getPlatformIconSrc(
    rtcPlatformIconIds[platform] ?? platform,
  );
  const unionTechVersion =
    platform === 'electron'
      ? sdk.versions.find((version) =>
          version.id.endsWith('-electron-uniontech'),
        )
      : undefined;
  const displayed = sdk.versions.length
    ? [
        sdk.versions[0],
        ...sdk.versions
          .slice(1)
          .filter(
            (version) => version.latestVariant || version === unionTechVersion,
          ),
      ]
    : [];

  return (
    <section
      aria-label={`${platformData.label} ${product === 'video' ? '视频' : '音频'} SDK 下载`}
      className="not-prose my-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {displayed.map((version) => {
          const isUnionTech = version === unionTechVersion;
          const title = isUnionTech
            ? 'Electron for 统信 OS'
            : `${platformData.label} ${variantName(version, product)}`;
          return (
            <SdkDownloadCard
              iconSrc={platformIconSrc}
              key={version.id}
              title={title}
              version={version}
              versionSuffix={isUnionTech ? '统信 OS 专版' : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
