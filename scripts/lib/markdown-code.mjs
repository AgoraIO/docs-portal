function maskLine(line) {
  return line.replace(/[^\r\n]/g, ' ');
}

function transformFencedCode(
  source,
  { transformFencedLine, transformOutside },
) {
  let openFence = null;
  let outside = '';
  let output = '';

  for (const line of String(source).match(/[^\n]*(?:\n|$)/g) ?? []) {
    if (!line) continue;
    const scannableLine = line.replace(/\r?\n$/, '');

    if (!openFence) {
      const opening = scannableLine.match(/^[ \t]*(`{3,}|~{3,})[^\n]*$/);

      if (!opening) {
        outside += line;
        continue;
      }

      output += transformOutside(outside);
      outside = '';
      openFence = {
        character: opening[1][0],
        length: opening[1].length,
      };
      output += transformFencedLine(line);
      continue;
    }

    const closing = scannableLine.match(/^[ \t]*(`{3,}|~{3,})[ \t]*$/);
    output += transformFencedLine(line);

    if (
      closing &&
      closing[1][0] === openFence.character &&
      closing[1].length >= openFence.length
    ) {
      openFence = null;
    }
  }

  return output + transformOutside(outside);
}

export function mapOutsideFencedCode(source, transform) {
  return transformFencedCode(source, {
    transformFencedLine: (line) => line,
    transformOutside: transform,
  });
}

export function maskFencedCode(source) {
  return transformFencedCode(source, {
    transformFencedLine: maskLine,
    transformOutside: (segment) => segment,
  });
}
