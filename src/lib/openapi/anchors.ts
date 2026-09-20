function encodeOpenApiAnchorIdentity(value: string) {
  return Array.from(value)
    .map((character) => character.codePointAt(0)?.toString(16) ?? '')
    .join('_');
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

    const candidate = duplicateBaseIds.has(baseId)
      ? `${baseId}--${encodeOpenApiAnchorIdentity(value)}`
      : baseId;

    const occurrence = seen.get(candidate) ?? 0;
    seen.set(candidate, occurrence + 1);

    return occurrence > 0 ? `${candidate}--${occurrence + 1}` : candidate;
  });
}

export function buildOpenApiResponseSchemaAnchorId(
  status: string,
  mediaType: string,
  mediaTypes: string[],
) {
  const index = mediaTypes.indexOf(mediaType);
  return buildUniqueOpenApiAnchorIds(
    `response-${slugOpenApiAnchorSegment(status)}`,
    mediaTypes,
  )[index];
}
