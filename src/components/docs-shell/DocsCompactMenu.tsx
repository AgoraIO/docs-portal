'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export function DocsCompactMenu({
  align = 'start',
  ariaLabel,
  button,
  children,
  className,
  panelClassName,
}: {
  align?: 'start' | 'end';
  ariaLabel: string;
  button: (props: {
    'aria-controls': string;
    'aria-expanded': boolean;
    onClick: () => void;
  }) => React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target;

      if (!(target instanceof Node) || !root || root.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      {button({
        'aria-controls': panelId,
        'aria-expanded': open,
        onClick: () => setOpen((value) => !value),
      })}
      <div
        aria-label={ariaLabel}
        className={cn(
          'absolute top-full z-50 mt-2 min-w-[12rem] rounded-lg border bg-popover text-popover-foreground shadow-md',
          align === 'end' ? 'right-0' : 'left-0',
          open ? 'block' : 'hidden',
          panelClassName,
        )}
        id={panelId}
      >
        {children}
      </div>
    </div>
  );
}
