// Component props can span blank lines and contain `>` inside expressions.
// Mask them before parsing prose, keeping offsets aligned with indexed sections.
export function stripSearchComponentTags(value: string, keepOffsets = false) {
  const tags = /<\/?[A-Z_][\w.-]*(?=[\s/>]|$)/g;
  let output = '';
  let cursor = 0;
  for (let match = tags.exec(value); match; match = tags.exec(value)) {
    let quote = '';
    let braces = 0;
    let end = tags.lastIndex;
    for (; end < value.length; end++) {
      const char = value[end];
      if (quote) {
        if (char === '\\') end++;
        else if (char === quote) quote = '';
      } else if (char === '"' || char === "'" || char === '`') quote = char;
      else if (char === '{') braces++;
      else if (char === '}') braces = Math.max(0, braces - 1);
      else if (char === '>' && braces === 0) {
        end++;
        break;
      }
    }
    end = Math.min(end, value.length);
    const removed = value.slice(match.index, end);
    output +=
      value.slice(cursor, match.index) +
      (keepOffsets ? removed.replace(/[^\r\n]/g, ' ') : ' ');
    cursor = end;
    tags.lastIndex = end;
  }
  return output + value.slice(cursor);
}

export function stripSearchProseMarkers(value: string) {
  return value
    .replace(/:{3,}(?:[a-z][\w-]*(?:\[[^\]\r\n]*\])?)?/gi, ' ')
    .replace(/\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, ' ')
    .replace(
      /\b(?:[\w-]+-(?:markdown|html)(?:-\d+){1,}|table-list-(?:cn|en)-\d+)\s+details/gi,
      ' ',
    );
}
