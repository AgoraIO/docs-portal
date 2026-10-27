'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getCnSearchProductGroups } from '@/lib/search/cn-product-labels';
import { getCnSearchPlatformLabel } from '@/lib/search/cn-search-context';
import type { SearchPageState } from '@/lib/search/search-page-state';

const COLLAPSED_PLATFORMS = 6;
const leadingPlatforms = [
  'android',
  'ios',
  'macos',
  'web',
  'windows',
  'harmonyos',
];

export function SearchBrowseFilters({
  state,
  platforms,
  onChange,
}: {
  state: Pick<SearchPageState, 'product' | 'platform'>;
  platforms: string[];
  onChange: (patch: Partial<SearchPageState>) => void;
}) {
  const groups = getCnSearchProductGroups();
  const selectedProduct = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === state.product);
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const available = [
    ...new Set([
      ...leadingPlatforms.filter((platform) => platforms.includes(platform)),
      ...platforms,
      ...(state.platform ? [state.platform] : []),
    ]),
  ];
  const leading = available.slice(0, COLLAPSED_PLATFORMS);
  const visible = expanded
    ? available
    : [...new Set([...leading, ...(state.platform ? [state.platform] : [])])];

  return (
    <div className="search-page-browse-filters">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="search-page-product-trigger" variant="outline">
            <span>{selectedProduct?.label ?? '全部产品'}</span>
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="search-page-product-menu"
          collisionPadding={16}
        >
          <DropdownMenuRadioGroup
            aria-label="产品筛选"
            value={state.product ?? 'all'}
            onValueChange={(product) =>
              onChange({
                product: product === 'all' ? undefined : product,
                version: undefined,
              })
            }
          >
            <DropdownMenuGroup>
              <DropdownMenuRadioItem value="all">
                全部产品
              </DropdownMenuRadioItem>
            </DropdownMenuGroup>
            <div className="search-page-product-groups">
              {groups.map((group) => (
                <DropdownMenuGroup key={group.label} aria-label={group.label}>
                  <DropdownMenuLabel className="search-page-product-group-label">
                    {group.label}
                  </DropdownMenuLabel>
                  <div className="search-page-product-options">
                    {group.options.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </div>
                </DropdownMenuGroup>
              ))}
            </div>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="search-page-platform-filters">
        {available.length > COLLAPSED_PLATFORMS && (
          <Button
            className="search-page-platform-expand"
            aria-controls={listId}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
          >
            {expanded ? '折叠' : '展开'}
            {expanded ? (
              <ChevronUpIcon data-icon="inline-end" />
            ) : (
              <ChevronDownIcon data-icon="inline-end" />
            )}
          </Button>
        )}
        <ToggleGroup
          aria-label="平台"
          className="search-page-platform-options"
          id={listId}
          onValueChange={(platform) => {
            if (platform)
              onChange({
                platform: platform === 'all' ? undefined : platform,
                version: undefined,
              });
          }}
          spacing={1}
          type="single"
          value={state.platform ?? 'all'}
          variant="outline"
        >
          <ToggleGroupItem value="all">全部平台</ToggleGroupItem>
          {visible.map((platform) => (
            <ToggleGroupItem key={platform} value={platform}>
              {getCnSearchPlatformLabel(platform)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
