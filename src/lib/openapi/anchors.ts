function hashOpenApiAnchorSegment(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function slugOpenApiAnchorSegment(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[.[\]]+/g, '-')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function buildOpenApiAnchorId(prefix: string, value: string) {
  return `${prefix}-${slugOpenApiAnchorSegment(value)}`;
}

export function buildUniqueOpenApiAnchorIds(prefix: string, values: string[]) {
  const baseIds = values.map((value) => buildOpenApiAnchorId(prefix, value));
  const duplicateBaseIds = new Set(
    baseIds.filter((baseId, index) => baseIds.indexOf(baseId) !== index),
  );
  const seen = new Map<string, number>();

  return values.map((value, index) => {
    const baseId = baseIds[index];

    if (!duplicateBaseIds.has(baseId)) {
      return baseId;
    }

    const occurrence = seen.get(baseId) ?? 0;
    seen.set(baseId, occurrence + 1);

    return `${baseId}-${hashOpenApiAnchorSegment(value)}${
      occurrence > 0 ? `-${occurrence + 1}` : ''
    }`;
  });
}
