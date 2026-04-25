import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border bg-background/70 text-muted-foreground',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
