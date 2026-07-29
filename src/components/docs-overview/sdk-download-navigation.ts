import {
  getZhCNSdkDownloadProductCopy,
  SDK_DOWNLOAD_PRODUCT_GROUP_ORDER,
} from './sdk-download-products';
import type {
  SdkDownloadPlatform,
  SdkDownloadProduct,
} from './sdk-downloads-data';

export const SDK_DOWNLOAD_CATALOG_SELECTOR = '[data-sdk-download-catalog]';
export const SDK_DOWNLOAD_PRODUCT_ID_ATTRIBUTE = 'data-sdk-download-product-id';
export const SDK_DOWNLOAD_PRODUCT_SECTION_SELECTOR =
  '[data-sdk-download-product-id]';

export function buildSdkDownloadProductNavItems(
  platforms: readonly SdkDownloadPlatform[],
  locale: 'en' | 'zh-CN' = 'en',
) {
  const productById = new Map<string, { id: string; label: string }>();

  for (const platform of platforms) {
    for (const kind of ['core', 'addOns'] as const) {
      for (const product of platform[kind] ?? []) {
        const id = getSdkDownloadProductCatalogId(product);

        if (!productById.has(id)) {
          const localizedCopy =
            locale === 'zh-CN' ? getZhCNSdkDownloadProductCopy(id) : undefined;

          productById.set(id, {
            id,
            label: localizedCopy?.label ?? product.label,
          });
        }
      }
    }
  }

  return [...productById.values()].sort(
    (a, b) =>
      getSdkDownloadProductGroupRank(a.id) -
      getSdkDownloadProductGroupRank(b.id),
  );
}

export function getSdkDownloadProductCatalogId(product: SdkDownloadProduct) {
  const normalizedId = product.id.toLowerCase();

  if (normalizedId.includes('agents-sdk')) {
    return 'agents';
  }
  if (normalizedId.includes('voice-sdk')) {
    return 'voice';
  }
  if (normalizedId.includes('video-sdk')) {
    return 'video';
  }
  if (
    normalizedId.includes('signaling-sdk') ||
    normalizedId.includes('rtm-sdk')
  ) {
    return 'signaling';
  }
  if (normalizedId.includes('chat-sdk')) {
    return 'chat';
  }
  if (normalizedId.includes('meeting-sdk')) {
    return 'meeting';
  }
  if (normalizedId.includes('mediaplayer-kit')) {
    return 'mediaplayer-kit';
  }
  if (normalizedId.includes('proctor-sdk')) {
    return 'proctor';
  }
  if (normalizedId.includes('cloud-scene-sdk')) {
    return 'cloud-scene';
  }
  if (
    normalizedId.includes('flexible-classroom-sdk') ||
    normalizedId.includes('classroom-sdk')
  ) {
    return 'flexible-classroom';
  }
  if (normalizedId.includes('iot-sdk')) {
    return 'iot';
  }
  if (
    normalizedId.includes('fastboard') ||
    normalizedId.includes('interactive-whiteboard-fastboard')
  ) {
    return 'fastboard';
  }
  if (normalizedId.includes('interactive-whiteboard')) {
    return 'whiteboard';
  }
  if (normalizedId.includes('server-gateway')) {
    return 'server-gateway';
  }
  if (normalizedId.includes('on-premise-recording')) {
    return 'on-premise-recording';
  }

  return normalizedId.replace(/-(android|ios|web|macos|windows|linux)$/, '');
}

export function getSdkDownloadProductSectionId(productId: string) {
  return `sdk-download-product-${productId}`;
}

export function getSdkDownloadProductGroupRank(productId: string) {
  const index = (SDK_DOWNLOAD_PRODUCT_GROUP_ORDER as readonly string[]).indexOf(
    productId,
  );
  return index === -1 ? SDK_DOWNLOAD_PRODUCT_GROUP_ORDER.length : index;
}
