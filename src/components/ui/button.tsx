import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-[0_12px_32px_-20px_color-mix(in_srgb,var(--primary)_54%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary)_58%,white)]',
  outline:
    'border border-border bg-background/88 text-foreground hover:bg-accent hover:text-accent-foreground',
  ghost:
    'text-muted-foreground hover:bg-[color-mix(in_srgb,var(--accent)_72%,transparent)] hover:text-accent-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3.5 py-2 text-xs',
  lg: 'h-11 px-5 py-2.5',
  icon: 'size-10',
};

export function buttonVariants({
  className,
  size = 'default',
  variant = 'default',
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  size = 'default',
  type = 'button',
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ className, size, variant })}
      type={type}
      {...props}
    />
  );
}
