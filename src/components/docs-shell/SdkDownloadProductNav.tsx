'use client';

import { PackageIcon } from 'lucide-react';
import {
  buildSdkDownloadProductNavItems,
  getSdkDownloadProductSectionId,
  SDK_DOWNLOAD_CATALOG_SELECTOR,
  SDK_DOWNLOAD_PRODUCT_ID_ATTRIBUTE,
  SDK_DOWNLOAD_PRODUCT_SECTION_SELECTOR,
} from '@/components/docs-overview/sdk-download-navigation';
import { zhCNSdkDownloadPlatforms } from '@/components/docs-overview/sdk-downloads-data.zh-cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/cn';
import { useCatalogSectionNavigation } from './useCatalogSectionNavigation';

const sdkProductItems = buildSdkDownloadProductNavItems(
  zhCNSdkDownloadPlatforms,
);

export function SdkDownloadProductNav() {
  const { activeId, availableItems, setLinkRef } = useCatalogSectionNavigation({
    idAttribute: SDK_DOWNLOAD_PRODUCT_ID_ATTRIBUTE,
    items: sdkProductItems,
    rootSelector: SDK_DOWNLOAD_CATALOG_SELECTOR,
    sectionSelector: SDK_DOWNLOAD_PRODUCT_SECTION_SELECTOR,
  });

  return (
    <section
      aria-label="SDK 产品目录"
      className="flex min-h-0 flex-1 flex-col"
      data-testid="sdk-download-product-nav"
    >
      <ScrollArea
        className="min-h-0 flex-1"
        data-testid="sdk-download-product-scroll"
        type="always"
      >
        <nav aria-label="SDK 产品" className="pr-3 pb-6">
          <h2 className="sticky top-0 z-10 flex min-h-8 items-center gap-2 bg-background/95 px-2 text-[13px] font-semibold text-foreground backdrop-blur-sm">
            <PackageIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            SDK 产品
          </h2>
          <div className="ml-4 flex flex-col border-border/70 border-l pl-3">
            {availableItems.map((product) => {
              const isActive = activeId === product.id;

              return (
                <a
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative min-h-8 w-full rounded-md px-2 py-1.5 text-left text-[13px] leading-5 text-muted-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    isActive
                      ? 'bg-[color:var(--accent-brand-soft)] font-semibold text-[color:var(--accent-brand)] before:absolute before:top-1/2 before:-left-[13px] before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[color:var(--accent-brand)]'
                      : 'hover:bg-accent hover:text-foreground',
                  )}
                  href={`#${getSdkDownloadProductSectionId(product.id)}`}
                  key={product.id}
                  ref={(element) => setLinkRef(product.id, element)}
                >
                  {product.label}
                </a>
              );
            })}
          </div>
        </nav>
      </ScrollArea>
    </section>
  );
}
