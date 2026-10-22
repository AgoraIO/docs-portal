export type CodeSource = {
  source: string;
  highlighted: Set<number>;
  added: Set<number>;
  removed: Set<number>;
};

/** Presentation directives are never part of a copied command or payload. */
export function prepareCodeSource(value: string): CodeSource {
  const result: CodeSource = {
    source: '',
    highlighted: new Set(),
    added: new Set(),
    removed: new Set(),
  };
  const lines: string[] = [];
  let legacyHighlight = false;
  const pending = { highlight: 0, '++': 0, '--': 0 };
  for (const raw of value.split('\n')) {
    const legacy = /^\s*\/\/\s*highlight-(start|end|next-line)\s*$/.exec(raw);
    if (legacy) {
      if (legacy[1] === 'next-line') pending.highlight = 1;
      else legacyHighlight = legacy[1] === 'start';
      continue;
    }
    const notation =
      /(?:^|\s)(?:\/\/|#)\s*\[!code (highlight|\+\+|--)(?::(\d+))?\]\s*$/.exec(
        raw,
      );
    let line = raw;
    if (notation) {
      const kind = notation[1] as keyof typeof pending;
      const count = Math.min(Number(notation[2] ?? 1), 100_000);
      line = raw.slice(0, notation.index).trimEnd();
      pending[kind] = count;
      if (!line.trim()) continue;
    }
    lines.push(line);
    const number = lines.length;
    if (legacyHighlight || pending.highlight > 0)
      result.highlighted.add(number);
    if (pending['++'] > 0) result.added.add(number);
    if (pending['--'] > 0) result.removed.add(number);
    for (const kind of ['highlight', '++', '--'] as const) {
      pending[kind] = Math.max(0, pending[kind] - 1);
    }
  }
  result.source = lines.join('\n');
  return result;
}

export function readCodeText(root: HTMLElement): string {
  const code = root.querySelector('pre code') ?? root.querySelector('pre');
  if (!code) return '';
  const clone = code.cloneNode(true) as HTMLElement;
  for (const decoration of clone.querySelectorAll(
    '.nd-copy-ignore, [data-copy-ignore], .line-number',
  ))
    decoration.remove();
  return prepareCodeSource(clone.textContent ?? '').source;
}

export function splitCodeLines(source: string) {
  const occurrences = new Map<string, number>();
  return source
    .replace(/\n$/, '')
    .split('\n')
    .map((text, index) => {
      const occurrence = (occurrences.get(text) ?? 0) + 1;
      occurrences.set(text, occurrence);
      return { text, number: index + 1, key: `${text}\u0000${occurrence}` };
    });
}
