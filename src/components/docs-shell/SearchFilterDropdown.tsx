'use client';

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cn';

export type FilterOption = {
  description?: string;
  label: string;
  value: string;
};

export type FilterGroup = {
  label?: string;
  options: FilterOption[];
};

export function SearchFilterDropdown({
  allLabel,
  groups,
  onChange,
  searchPlaceholder,
  value,
}: {
  allLabel: string;
  groups: FilterGroup[];
  onChange: (value: string | null) => void;
  searchPlaceholder: string;
  value: string | null;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const selected = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);

  return (
    <Popover
      onOpenChange={(next) => {
        if (next) {
          // Portal into the enclosing modal dialog (if any) so react-remove-scroll
          // allows the dropdown list to wheel-scroll. Falls back to body otherwise.
          setContainer(
            triggerRef.current?.closest<HTMLElement>(
              '[data-slot="dialog-content"]',
            ) ?? null,
          );
        }
        setOpen(next);
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={selected ? `${allLabel}: ${selected.label}` : allLabel}
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          ref={triggerRef}
          role="combobox"
          size="sm"
          variant={selected ? 'secondary' : 'ghost'}
        >
          <span className="max-w-[12rem] truncate">
            {selected ? selected.label : allLabel}
          </span>
          {selected ? (
            <XIcon
              className="pointer-events-auto size-3 shrink-0"
              data-testid="search-filter-clear"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
            />
          ) : (
            <ChevronsUpDownIcon className="size-3 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 overflow-hidden p-0"
        container={container}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 overflow-y-auto">
            <CommandEmpty>No results</CommandEmpty>
            <CommandItem
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
              value={allLabel}
            >
              <CheckIcon
                className={cn(
                  'size-4 shrink-0',
                  value === null ? 'opacity-100' : 'opacity-0',
                )}
              />
              {allLabel}
            </CommandItem>
            {groups.map((group, index) => (
              <CommandGroup
                heading={group.label}
                key={group.label ?? `group-${index}`}
              >
                {group.options.map((option) => (
                  <CommandItem
                    className="items-start"
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value === value ? null : option.value);
                      setOpen(false);
                    }}
                    value={`${option.label} ${option.value}`}
                  >
                    <CheckIcon
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span>{option.label}</span>
                      {option.description ? (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
