/** Convert Docusaurus highlight ranges inside fenced code to Shiki notation. */
export function normalizeLegacyCodeHighlights(source) {
  return source.replace(
    /^([ \t]*)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1\2[ \t]*(?=\n|$)/gm,
    (block, indent, fence, info, code) => {
      const language = info.trim().split(/\s+/, 1)[0];
      const hashComment =
        /^(bash|sh|shell|shellscript|curl|python|py|ruby|rb|yaml|yml|toml|powershell|ps1|r)$/.test(
          language,
        );
      const markerComment = hashComment ? '(?:\\/\\/|#)' : '\\/\\/';
      const marker = new RegExp(
        `^[ \\t]*${markerComment}[ \\t]*highlight-(?:start|end)[ \\t]*$`,
        'm',
      );
      if (!marker.test(code)) {
        return block;
      }
      const comment = hashComment ? '#' : '//';
      const converted = code.replace(
        new RegExp(
          `^([ \\t]*)${markerComment}[ \\t]*highlight-start[ \\t]*\\n([\\s\\S]*?)^[ \\t]*${markerComment}[ \\t]*highlight-end[ \\t]*(?:\\n|$)`,
          'gm',
        ),
        (_range, padding, body) => {
          const count = body.replace(/\n$/, '').split('\n').length;
          return `${padding}${comment} [!code highlight:${count}]\n${body}`;
        },
      );
      if (marker.test(converted)) {
        throw new Error('Unbalanced legacy code highlight range');
      }
      return `${indent}${fence}${info}\n${converted}${indent}${fence}`;
    },
  );
}
