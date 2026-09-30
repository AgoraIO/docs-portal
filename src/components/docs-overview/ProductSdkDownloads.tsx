import { getPlatformIconSrc } from './platform-icon-src';
import { SdkDownloadCard } from './SdkDownloadCard';
import { getSdkDownloadProductCatalogId } from './sdk-download-navigation';
import { getZhCNSdkDownloadProductCopy } from './sdk-download-products';
import type { SdkDownloadVersion } from './sdk-downloads-data';
import { zhCNSdkDownloadPlatforms } from './sdk-downloads-data.zh-cn';

function variant(version: SdkDownloadVersion) {
  const details = version.label
    .replace(/^(?:版本|Version)\s+[^\s（(]+/i, '')
    .replace(/[（(]\s*最新\s*[）)]/g, '')
    .trim();
  return details || '';
}

export function ProductSdkDownloads({
  platform,
  product,
  versionIdPrefixes,
}: {
  platform: string;
  product: string;
  versionIdPrefixes?: string[];
}) {
  const platformData = zhCNSdkDownloadPlatforms.find(
    (item) => item.id === platform,
  );
  const productId = product === 'whiteboard-sdk' ? 'whiteboard' : product;
  const matchingProducts = [
    ...(platformData?.core ?? []),
    ...(platformData?.addOns ?? []),
  ].filter((item) => getSdkDownloadProductCatalogId(item) === productId);
  const versions = matchingProducts.flatMap((item) => {
    const candidates = versionIdPrefixes?.length
      ? item.versions.filter((version) =>
          versionIdPrefixes.some((prefix) => version.id.includes(prefix)),
        )
      : item.versions;
    const [latest, ...older] = candidates;
    return latest
      ? [
          { item, version: latest },
          ...older
            .filter((version) => version.latestVariant)
            .map((version) => ({ item, version })),
        ]
      : [];
  });

  if (!platformData || versions.length === 0) return null;

  const iconSrc = getPlatformIconSrc(platform);
  const label =
    getZhCNSdkDownloadProductCopy(productId)?.label ??
    matchingProducts[0]?.label;

  return (
    <section
      aria-label={`${platformData.label} ${label} 下载`}
      className="not-prose my-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {versions.map(({ item, version }) => {
          const detail = variant(version);
          const title = `${platformData.label} ${label}${detail ? ` ${detail}` : ''}`;
          return (
            <SdkDownloadCard
              iconSrc={iconSrc}
              key={`${item.id}-${version.id}`}
              title={title}
              version={version}
            />
          );
        })}
      </div>
    </section>
  );
}
