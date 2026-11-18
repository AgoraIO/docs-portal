import type { ThemedToken } from 'shiki';

/** Shiki's Bash grammar classifies options differently on continued lines. */
export function normalizeShellOptions(
  lines: ThemedToken[][],
  optionStyle: ThemedToken['htmlStyle'],
) {
  if (!optionStyle) return lines;
  return lines.map((tokens) => {
    const text = tokens.map((token) => token.content).join('');
    const eligible = new Uint8Array(text.length);
    let position = 0;
    for (const token of tokens) {
      let offset = 0;
      for (const part of token.explanation ?? []) {
        // Shiki may merge surrounding whitespace into a token after lexing.
        const from = token.content.indexOf(part.content, offset);
        if (from < 0) continue;
        const scopes = part.scopes.map((scope) => scope.scopeName);
        const command = scopes.includes('meta.statement.command.shell');
        const literal = scopes.some((scope) =>
          /^(comment|(?:string\.(?:quoted|unquoted\.heredoc))|constant\.character\.escape)/.test(
            scope,
          ),
        );
        if (command && !literal)
          eligible.fill(
            1,
            position + from,
            position + from + part.content.length,
          );
        offset = from + part.content.length;
      }
      position += token.content.length;
    }
    const ranges = [
      ...text.matchAll(/(?:^|[\t ])(--?[a-zA-Z][\w-]*)(?=$|[\s=])/g),
    ]
      .map((match) => {
        const start = match.index + match[0].length - match[1].length;
        return { start, end: start + match[1].length };
      })
      .filter(({ start, end }) => eligible.subarray(start, end).every(Boolean));
    if (!ranges.length) return tokens;

    position = 0;
    return tokens.flatMap((token) => {
      const start = position;
      position += token.content.length;
      const overlaps = ranges.filter(
        (range) => range.start < position && range.end > start,
      );
      if (!overlaps.length) return [token];
      const cuts = [
        ...new Set([
          start,
          position,
          ...overlaps.flatMap((range) => [
            Math.max(start, range.start),
            Math.min(position, range.end),
          ]),
        ]),
      ].sort((a, b) => a - b);
      return cuts.slice(0, -1).map((from, index) => {
        const option = overlaps.some(
          (range) => from >= range.start && from < range.end,
        );
        return {
          ...token,
          content: token.content.slice(from - start, cuts[index + 1] - start),
          offset: token.offset + from - start,
          explanation: undefined,
          htmlStyle: option
            ? {
                ...token.htmlStyle,
                ...optionStyle,
              }
            : token.htmlStyle,
        };
      });
    });
  });
}
