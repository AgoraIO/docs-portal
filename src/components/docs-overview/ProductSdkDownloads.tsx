import { getPlatformIconSrc } from './platform-icon-src';
import { zhCNRtsaSdkDownloadPlatform } from './rtsa-sdk-downloads-data.zh-cn';
import { SdkDownloadCard } from './SdkDownloadCard';
import { getSdkDownloadProductCatalogId } from './sdk-download-navigation';
import {
  getZhCNSdkDownloadProductCopy,
  getZhCNSdkDownloadTarget,
} from './sdk-download-products';
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
  versionIds,
  versionIdPrefixes,
}: {
  platform: string;
  product: string;
  versionIds?: string[];
  versionIdPrefixes?: string[];
}) {
  const productId = product === 'whiteboard-sdk' ? 'whiteboard' : product;
  const sourceIds =
    productId === 'signaling' && platform === 'cpp'
      ? ['windows', 'linux']
      : [productId === 'signaling' && platform === 'swift' ? 'ios' : platform];
  const platformData =
    product === 'rtsa' && platform === 'c'
      ? zhCNRtsaSdkDownloadPlatform
      : zhCNSdkDownloadPlatforms.find((item) => item.id === sourceIds[0]);
  const matchingProducts = sourceIds.flatMap((id) => {
    const data =
      id === platformData?.id
        ? platformData
        : zhCNSdkDownloadPlatforms.find((item) => item.id === id);
    return [...(data?.core ?? []), ...(data?.addOns ?? [])].filter(
      (item) => getSdkDownloadProductCatalogId(item) === productId,
    );
  });
  const versions = matchingProducts.flatMap((item) => {
    // A solution can require a specific release rather than the catalog latest.
    // Merge duplicate catalog records so pinned cards retain download metadata.
    if (versionIds) {
      return versionIds.flatMap((id) => {
        const records = item.versions.filter((version) => version.id === id);
        if (!records.length) {
          throw new Error(
            `Unknown SDK download version: ${product}/${platform}/${id}`,
          );
        }
        return [
          {
            item,
            version: records.reduce(
              (merged, record) => Object.assign(merged, record),
              { ...records[0] },
            ),
          },
        ];
      });
    }
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

  const target = getZhCNSdkDownloadTarget(productId, platform);
  const platformLabel = target?.label ?? platformData.label;
  const iconSrc = getPlatformIconSrc(target?.iconPlatformId ?? platform);
  const label =
    getZhCNSdkDownloadProductCopy(productId)?.label ??
    matchingProducts[0]?.label;

  return (
    <section
      aria-label={`${platformLabel} ${label} 下载`}
      className="not-prose my-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {versions.map(({ item, version }) => {
          const versionDetail = variant(version);
          const detail =
            productId === 'signaling' && versionDetail === 'C++'
              ? ''
              : versionDetail;
          const title =
            productId === 'signaling' && platform === 'cpp'
              ? `${version.id.includes('linux') ? 'Linux' : 'Windows'} C++ ${label}`
              : `${platformLabel} ${label}${detail ? ` ${detail}` : ''}`;
          const language = version.id
            .split('-')
            .find((part) => ['java', 'cpp', 'python', 'go'].includes(part));
          const cardIconSrc =
            platform === 'linux' && productId !== 'signaling' && language
              ? getPlatformIconSrc(language)
              : iconSrc;
          return (
            <SdkDownloadCard
              iconSrc={cardIconSrc}
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
