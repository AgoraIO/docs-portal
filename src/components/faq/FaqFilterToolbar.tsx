import { ReferenceFilterSelect } from '@/components/reference-center/ReferenceFilterControls';
import { Button } from '@/components/ui/button';
import { faqPlatforms, faqProducts } from './faq-data';

function FilterSelect({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <ReferenceFilterSelect
      label={label}
      onChange={onSelect}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
  );
}

export function FaqFilterToolbar({
  clearLabel = 'Clear',
  hasActiveFilters,
  onClear,
  onPlatformChange,
  onProductChange,
  platform,
  platformLabel = 'Platform',
  platforms = faqPlatforms,
  product,
  productLabel = 'Product',
  products = faqProducts,
}: {
  clearLabel?: string;
  hasActiveFilters: boolean;
  onClear: () => void;
  onPlatformChange: (platform: string) => void;
  onProductChange: (product: string) => void;
  platform: string;
  platformLabel?: string;
  platforms?: string[];
  product: string;
  productLabel?: string;
  products?: string[];
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        label={productLabel}
        onSelect={onProductChange}
        options={products}
        value={product}
      />
      <FilterSelect
        label={platformLabel}
        onSelect={onPlatformChange}
        options={platforms}
        value={platform}
      />
      {hasActiveFilters ? (
        <Button onClick={onClear} type="button" variant="ghost">
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}
