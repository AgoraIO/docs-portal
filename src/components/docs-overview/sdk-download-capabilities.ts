import { API_REFERENCE_CAPABILITY_GROUPS } from '@/lib/api-reference-navigation';
import { getSdkDownloadProductCatalogId } from './sdk-download-navigation';
import type { SdkDownloadPlatform } from './sdk-downloads-data';

export type SdkCapabilityProduct = {
  productId: string;
};

export type SdkCapabilityGroup = {
  id: (typeof API_REFERENCE_CAPABILITY_GROUPS)[number]['id'];
  label: string;
  products: SdkCapabilityProduct[];
};

const SDK_PRODUCT_CAPABILITY: Record<
  string,
  SdkCapabilityGroup['id']
> = {
  agents: 'conversational-ai',
  voice: 'realtime-core',
  video: 'realtime-core',
  signaling: 'realtime-core',
  chat: 'realtime-core',
  meeting: 'meeting-collaboration',
  whiteboard: 'extensions-ecosystem',
  fastboard: 'extensions-ecosystem',
  'mediaplayer-kit': 'extensions-ecosystem',
  'server-gateway': 'extensions-ecosystem',
  'on-premise-recording': 'extensions-ecosystem',
  'flexible-classroom': 'education',
  'cloud-scene': 'education',
  proctor: 'education',
  iot: 'smart-hardware',
};

export function buildSdkCapabilityGroups(
  platforms: readonly SdkDownloadPlatform[],
): SdkCapabilityGroup[] {
  const productsByCapability = new Map<string, SdkCapabilityProduct[]>();

  for (const platform of platforms) {
    const products = [...platform.core, ...(platform.addOns ?? [])];

    for (const product of products) {
      const productId = getSdkDownloadProductCatalogId(product);
      const capabilityId = SDK_PRODUCT_CAPABILITY[productId];

      if (!capabilityId) {
        continue;
      }

      const capabilityProducts =
        productsByCapability.get(capabilityId) ?? [];

      if (
        !capabilityProducts.some(
          (capabilityProduct) => capabilityProduct.productId === productId,
        )
      ) {
        capabilityProducts.push({ productId });
      }

      productsByCapability.set(capabilityId, capabilityProducts);
    }
  }

  return API_REFERENCE_CAPABILITY_GROUPS.flatMap((capability) => {
    const products = productsByCapability.get(capability.id);

    return products?.length
      ? [{ id: capability.id, label: capability.label, products }]
      : [];
  });
}
