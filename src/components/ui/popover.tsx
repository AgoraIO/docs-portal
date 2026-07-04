'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  align = 'end',
  className,
  container,
  sideOffset = 10,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  container?: HTMLElement | null;
}) {
  return (
    <PopoverPrimitive.Portal container={container ?? undefined}>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          'z-50 w-72 rounded-[1.35rem] border border-border bg-popover/96 p-2 text-popover-foreground shadow-[0_24px_80px_-38px_rgba(15,23,42,0.38)] outline-none backdrop-blur',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
