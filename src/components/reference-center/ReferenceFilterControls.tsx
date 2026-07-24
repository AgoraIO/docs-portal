import { SearchIcon } from 'lucide-react';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/cn';

export type ReferenceFilterOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export function ReferenceFilterSelect<TValue extends string>({
  className,
  label,
  onChange,
  options,
  selectClassName,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: TValue) => void;
  options: readonly ReferenceFilterOption<TValue>[];
  selectClassName?: string;
  value: TValue;
}) {
  const id = useId();

  return (
    <label
      className={cn(
        'flex min-w-0 flex-col items-start gap-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
      htmlFor={id}
    >
      <span className="h-4 leading-4">{label}</span>
      <NativeSelect
        className={cn('min-w-40', selectClassName)}
        id={id}
        onChange={(event) => onChange(event.target.value as TValue)}
        value={value}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

export function ReferenceFilterToggleGroup<TValue extends string>({
  className,
  label,
  onChange,
  options,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: TValue) => void;
  options: readonly ReferenceFilterOption<TValue>[];
  value: TValue;
}) {
  const labelId = useId();

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col items-start gap-1.5 text-xs font-medium text-muted-foreground sm:w-auto',
        className,
      )}
    >
      <span className="h-4 leading-4" id={labelId}>
        {label}
      </span>
      <ToggleGroup
        aria-labelledby={labelId}
        className="grid w-full grid-cols-2 sm:flex sm:w-fit"
        onValueChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue as TValue);
          }
        }}
        spacing={1}
        type="single"
        value={value}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            className="w-full sm:w-auto"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function ReferenceSearchInput({
  className,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const id = useId();

  return (
    <label className={cn('relative block', className)} htmlFor={id}>
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 pl-9"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
