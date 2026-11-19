export function readImageAttribute(attrs, name) {
  const match = attrs.match(
    new RegExp(
      `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*(?:"([^"]*)"|'([^']*)'|(\\d+(?:\\.\\d+)?))\\s*\\})`,
    ),
  );
  return match?.slice(1).find((value) => value !== undefined);
}

function cssSize(value) {
  if (!value || !/^\d+(?:\.\d+)?(?:px|%|rem|em|vw|vh)?$/.test(value.trim()))
    return undefined;
  const size = value.trim();
  return /^\d+(?:\.\d+)?$/.test(size) ? `${size}px` : size;
}

export function readLegacyImageSizing(attrs) {
  return {
    src: readImageAttribute(attrs, 'src'),
    alt: readImageAttribute(attrs, 'alt') ?? '',
    width: cssSize(readImageAttribute(attrs, 'width')),
    height: cssSize(readImageAttribute(attrs, 'height')),
    inline: /\binline(?:\s*=\s*\{true\})?(?=\s|$|\/)/.test(attrs),
  };
}

export function renderMigratedImage({ src, alt, width, height, inline }) {
  const attributes = [
    `alt=${JSON.stringify(alt)}`,
    `src=${JSON.stringify(src)}`,
  ];
  if (inline && (width || height)) {
    for (const [name, value] of [
      ['width', width],
      ['height', height],
    ]) {
      if (value)
        attributes.push(
          /^\d+(?:\.\d+)?px$/.test(value)
            ? `${name}={${Number.parseFloat(value)}}`
            : `${name}=${JSON.stringify(value)}`,
        );
    }
    return `<InlineImage ${attributes.join(' ')} />`;
  }
  if ((width || height) && !(width === '100%' && !height)) {
    if (width) attributes.push(`displayWidth=${JSON.stringify(width)}`);
    if (height) attributes.push(`displayHeight=${JSON.stringify(height)}`);
    return `<DocsImage ${attributes.join(' ')} />`;
  }
  return `![${alt}](${src})`;
}
