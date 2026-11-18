import { resolveZhCnApiReferenceEntry } from '@/lib/api-reference-breadcrumb';
import { isKnownPlatform } from '@/lib/platforms/registry';
import { normalizeCnProduct } from '@/lib/search/cn-products';

/** Follow the published CN route/card metadata, including nested REST products. */
export function measurementContentContext(path: string) {
  const entry = resolveZhCnApiReferenceEntry(path);
  const [, tab, first, second] = path.split('/').filter(Boolean);
  const product =
    entry?.productId ??
    (tab === 'ai'
      ? 'conversational-ai'
      : tab === 'api-reference' && first === 'api-ref'
        ? second
        : ['realtime-media', 'solutions', 'api-reference'].includes(tab) &&
            first !== 'api'
          ? first
          : undefined);
  return {
    product: product ? normalizeCnProduct(product) : 'unknown',
    platform:
      entry?.platformId && isKnownPlatform(entry.platformId)
        ? entry.platformId
        : path.split('/').find(isKnownPlatform),
  };
}
