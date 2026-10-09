import type {
  SdkDownloadProduct,
  SdkDownloadVersion,
} from './sdk-downloads-data';

export type RtcDownloadCardEntry = {
  iconPlatformId: string;
  title: string;
  version: SdkDownloadVersion;
  versionSuffix?: string;
};

export function getRtcDownloadCardEntries(
  platformId: string,
  platformLabel: string,
  product: 'video' | 'voice',
  sdk: SdkDownloadProduct,
): RtcDownloadCardEntry[] {
  const unionTechVersion =
    platformId === 'electron'
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

  return displayed.map((version) => {
    const isUnionTech = version === unionTechVersion;

    return {
      iconPlatformId:
        platformId === 'react-js'
          ? 'web'
          : platformId === 'unreal-engine'
            ? 'unreal-cpp'
            : platformId,
      title: isUnionTech
        ? 'Electron for 统信 OS'
        : `${platformLabel} ${variantName(version, product)}`,
      version,
      versionSuffix: isUnionTech ? '统信 OS 专版' : undefined,
    };
  });
}

function variantName(version: SdkDownloadVersion, product: 'video' | 'voice') {
  if (/\bLite\b/i.test(version.label)) return 'Lite';
  if (/\bFull\b/i.test(version.label)) return 'Full';
  return product === 'video' ? '视频 SDK' : '音频 SDK';
}
