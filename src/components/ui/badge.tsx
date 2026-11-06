import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'preview';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border bg-background/70 text-muted-foreground',
  preview:
    'bg-[color-mix(in_srgb,var(--docs-info)_12%,transparent)] text-[color:color-mix(in_srgb,var(--docs-info)_85%,var(--foreground))]',
};

export function Badge({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
  size?: 'default' | 'sm';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        size === 'sm'
          ? 'shrink-0 gap-1 px-2 py-0.5 text-[11px] leading-4'
          : 'px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
