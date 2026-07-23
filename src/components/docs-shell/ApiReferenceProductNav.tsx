'use client';

import {
  BoxIcon,
  ChevronDownIcon,
  Layers3Icon,
  LayoutGridIcon,
  type LucideIcon,
  WorkflowIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zhCNApiReferenceCards } from '@/lib/api-reference-cards-data.zh-cn';
import {
  readApiReferenceFilter,
  replaceApiReferenceFilters,
  subscribeToApiReferenceFilters,
} from '@/lib/api-reference-filters.client';
import { cn } from '@/lib/cn';

type ProductGroup = {
  icon: LucideIcon;
  id: string;
  label: string;
  productIds: string[];
};

const productGroups: ProductGroup[] = [
  {
    icon: BoxIcon,
    id: 'core',
    label: '实时互动基础能力',
    productIds: ['conversational-ai', 'rtc', 'rtm', 'im', 'fusion-cdn', 'rtsa'],
  },
  {
    icon: WorkflowIcon,
    id: 'extensions',
    label: '实时互动扩展能力',
    productIds: [
      'whiteboard',
      'voip-callkit',
      'analytics',
      'speech-to-text',
      'cloud-recording',
      'local-server-recording',
      'media-push',
      'media-pull',
      'cloud-transcoding',
      'rtmp-gateway',
      'rtc-server-sdk',
      'ppt-conversion-service',
      'console',
    ],
  },
  {
    icon: LayoutGridIcon,
    id: 'solutions',
    label: '场景化解决方案',
    productIds: [
      'meeting',
      'online-ktv',
      'private-room',
      'online-art-teaching',
      'online-music-teaching',
      'teleoperation',
      'flexible-classroom',
    ],
  },
];

const productOptions = uniqueOptions('product');
const platformOptions = uniqueOptions('platform');
const productById = new Map(
  productOptions.map((product) => [product.id, product]),
);
const productIds = new Set(productOptions.map((product) => product.id));
const platformIds = new Set(platformOptions.map((platform) => platform.id));

export function ApiReferenceProductNav() {
  const [productId, setProductId] = useState('all');
  const [platformId, setPlatformId] = useState('all');

  useEffect(() => {
    const syncFilters = () => {
      setProductId(readValidFilter('product', productIds));
      setPlatformId(readValidFilter('platform', platformIds));
    };

    syncFilters();
    return subscribeToApiReferenceFilters(syncFilters);
  }, []);

  const selectProduct = (nextProductId: string) => {
    setProductId(nextProductId);
    replaceApiReferenceFilters({ product: nextProductId });
  };

  const selectPlatform = (nextPlatformId: string) => {
    setPlatformId(nextPlatformId);
    replaceApiReferenceFilters({ platform: nextPlatformId });
  };

  return (
    <section
      aria-label="API 参考筛选"
      className="flex min-h-0 flex-1 flex-col border-border/70 border-t pt-3"
      data-testid="api-reference-product-nav"
    >
      <label className="relative mx-2 block shrink-0">
        <span className="sr-only">平台/语言</span>
        <Layers3Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <select
          aria-label="平台/语言"
          className="h-9 w-full appearance-none rounded-md border border-border bg-background py-1 pr-8 pl-8 text-[13px] font-medium text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          onChange={(event) => selectPlatform(event.target.value)}
          value={platformId}
        >
          <option value="all">全部平台</option>
          {platformOptions.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </label>

      <ScrollArea
        className="mt-3 min-h-0 flex-1"
        data-testid="api-reference-product-scroll"
        type="always"
      >
        <nav aria-label="API 参考产品" className="pr-3 pb-6">
          <button
            aria-pressed={productId === 'all'}
            className={cn(
              'relative mb-3 flex min-h-8 w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors',
              productId === 'all'
                ? 'bg-accent font-semibold text-foreground before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary'
                : 'font-medium text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            onClick={() => selectProduct('all')}
            type="button"
          >
            <Layers3Icon aria-hidden="true" className="size-4 shrink-0" />
            全部产品
          </button>

          {productGroups.map((group) => (
            <ProductNavGroup
              activeProductId={productId}
              group={group}
              key={group.id}
              onSelectProduct={selectProduct}
            />
          ))}
        </nav>
      </ScrollArea>
    </section>
  );
}

function ProductNavGroup({
  activeProductId,
  group,
  onSelectProduct,
}: {
  activeProductId: string;
  group: ProductGroup;
  onSelectProduct: (productId: string) => void;
}) {
  const Icon = group.icon;

  return (
    <section className="mb-4 last:mb-0">
      <h2 className="flex min-h-8 items-center gap-2 px-2 text-[13px] font-semibold text-foreground">
        <Icon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        {group.label}
      </h2>
      <div className="ml-4 flex flex-col border-border/70 border-l pl-3">
        {group.productIds.map((productId) => {
          const product = productById.get(productId);
          const isActive = activeProductId === productId;

          if (!product) {
            return null;
          }

          return (
            <button
              aria-pressed={isActive}
              className={cn(
                'relative min-h-8 w-full rounded-md px-2 py-1.5 text-left text-[13px] leading-5 text-muted-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                isActive
                  ? 'bg-accent font-semibold text-foreground before:absolute before:top-1/2 before:-left-[13px] before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary'
                  : 'hover:bg-accent hover:text-foreground',
              )}
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              type="button"
            >
              {product.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function readValidFilter(
  name: 'platform' | 'product',
  validValues: Set<string>,
) {
  const value = readApiReferenceFilter(name);

  return validValues.has(value) ? value : 'all';
}

function uniqueOptions(kind: 'platform' | 'product') {
  const options = new Map<string, string>();

  for (const entry of zhCNApiReferenceCards.all) {
    const id = kind === 'product' ? entry.productId : entry.platformId;
    const label = kind === 'product' ? entry.product : entry.platform;

    if (!options.has(id)) {
      options.set(id, label);
    }
  }

  return Array.from(options, ([id, label]) => ({ id, label }));
}
