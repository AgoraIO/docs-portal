const tokenPattern = /\uE000(\d+)\uE001/g;

function backtickRunLength(text, start) {
  let end = start;
  while (text[end] === '`') end += 1;
  return end - start;
}

function findExactBacktickRun(text, from, length) {
  let cursor = from;
  while (cursor < text.length) {
    const start = text.indexOf('`', cursor);
    if (start === -1) return -1;
    const runLength = backtickRunLength(text, start);
    if (runLength === length) return start;
    cursor = start + runLength;
  }
  return -1;
}

export function protectMarkdownCode(markdown) {
  const protectedSegments = [];
  const protect = (value) => {
    const token = `\uE000${protectedSegments.length}\uE001`;
    protectedSegments.push(value);
    return token;
  };

  const parts = markdown.split(/(\r?\n)/);
  const output = [];
  let absoluteOffset = 0;
  let codeSpanLength = null;
  let fence = null;

  for (const part of parts) {
    if (/^\r?\n$/.test(part)) {
      output.push(part);
      absoluteOffset += part.length;
      continue;
    }

    if (codeSpanLength === null) {
      const fenceMatch = part.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        if (fence === null) {
          fence = { character: marker[0], length: marker.length };
        } else if (
          marker[0] === fence.character &&
          marker.length >= fence.length &&
          fenceMatch[2].trim() === ''
        ) {
          fence = null;
        }
        output.push(protect(part));
        absoluteOffset += part.length;
        continue;
      }
    }

    if (fence !== null) {
      output.push(protect(part));
      absoluteOffset += part.length;
      continue;
    }

    const lineOutput = [];
    let cursor = 0;
    while (cursor < part.length) {
      if (codeSpanLength !== null) {
        const closing = findExactBacktickRun(part, cursor, codeSpanLength);
        if (closing === -1) {
          lineOutput.push(protect(part.slice(cursor)));
          cursor = part.length;
          continue;
        }
        const end = closing + codeSpanLength;
        lineOutput.push(protect(part.slice(cursor, end)));
        cursor = end;
        codeSpanLength = null;
        continue;
      }

      const opening = part.indexOf('`', cursor);
      if (opening === -1) {
        lineOutput.push(part.slice(cursor));
        break;
      }
      lineOutput.push(part.slice(cursor, opening));
      const runLength = backtickRunLength(part, opening);
      const openingEnd = opening + runLength;
      const closing = findExactBacktickRun(
        markdown,
        absoluteOffset + openingEnd,
        runLength,
      );
      if (closing === -1) {
        lineOutput.push(part.slice(opening, openingEnd));
        cursor = openingEnd;
        continue;
      }
      const closingEnd = closing + runLength;
      const partEnd = absoluteOffset + part.length;
      if (closingEnd <= partEnd) {
        const localEnd = closingEnd - absoluteOffset;
        lineOutput.push(protect(part.slice(opening, localEnd)));
        cursor = localEnd;
        continue;
      }
      lineOutput.push(protect(part.slice(opening)));
      codeSpanLength = runLength;
      cursor = part.length;
    }

    output.push(lineOutput.join(''));
    absoluteOffset += part.length;
  }

  return {
    restore(value) {
      return value.replace(
        tokenPattern,
        (_, index) => protectedSegments[index],
      );
    },
    text: output.join(''),
  };
}
