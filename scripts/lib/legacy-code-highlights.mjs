/** Convert Docusaurus highlight ranges inside fenced code to Shiki notation. */
export function normalizeLegacyCodeHighlights(source) {
  return source.replace(
    /^([ \t]*)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1\2[ \t]*(?=\n|$)/gm,
    (block, indent, fence, info, code) => {
      if (!/^[ \t]*\/\/[ \t]*highlight-(?:start|end)[ \t]*$/m.test(code)) {
        return block;
      }
      const language = info.trim().split(/\s+/, 1)[0];
      const comment = ['bash', 'sh', 'shell'].includes(language) ? '#' : '//';
      const converted = code.replace(
        /^([ \t]*)\/\/[ \t]*highlight-start[ \t]*\n([\s\S]*?)^[ \t]*\/\/[ \t]*highlight-end[ \t]*(?:\n|$)/gm,
        (_range, padding, body) => {
          const count = body.replace(/\n$/, '').split('\n').length;
          return `${padding}${comment} [!code highlight:${count}]\n${body}`;
        },
      );
      if (/^[ \t]*\/\/[ \t]*highlight-(?:start|end)[ \t]*$/m.test(converted)) {
        throw new Error('Unbalanced legacy code highlight range');
      }
      return `${indent}${fence}${info}\n${converted}${indent}${fence}`;
    },
  );
}
