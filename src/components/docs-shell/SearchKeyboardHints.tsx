import type { ReactNode } from 'react';

function Hint({ children, keys }: { children: ReactNode; keys: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((key) => (
        <kbd
          className="rounded border border-border bg-muted/60 px-1 py-px text-[0.65rem] leading-none"
          key={key}
        >
          {key}
        </kbd>
      ))}
      {children}
    </span>
  );
}

export function SearchKeyboardHints({
  closeLabel,
  navigateLabel,
  selectLabel,
}: {
  closeLabel: string;
  navigateLabel: string;
  selectLabel: string;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-end gap-3 border-t px-4 py-1.5 text-[0.7rem] text-muted-foreground"
      data-testid="search-keyboard-hints"
    >
      <Hint keys={['↑', '↓']}>{navigateLabel}</Hint>
      <Hint keys={['↵']}>{selectLabel}</Hint>
      <Hint keys={['esc']}>{closeLabel}</Hint>
    </div>
  );
}
