import { CheckCircle2Icon, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { faqPlatforms, faqProducts } from './faq-data';

function FilterDropdown({
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-9 justify-between gap-2 px-3 text-sm font-normal"
          type="button"
          variant="outline"
        >
          <span className="truncate">
            <span className="text-muted-foreground">{label}:</span> {value}
          </span>
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-64 overflow-auto"
      >
        {options.map((option) => (
          <DropdownMenuItem
            className="justify-between"
            key={option}
            onSelect={() => onSelect(option)}
          >
            {option}
            {option === value ? <CheckCircle2Icon /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown
        label={productLabel}
        onSelect={onProductChange}
        options={products}
        value={product}
      />
      <FilterDropdown
        label={platformLabel}
        onSelect={onPlatformChange}
        options={platforms}
        value={platform}
      />
      {hasActiveFilters ? (
        <Button onClick={onClear} size="sm" type="button" variant="ghost">
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}
