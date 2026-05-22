export type OpenApiJsonValue =
  | OpenApiJsonValue[]
  | boolean
  | null
  | number
  | OpenApiJsonObject
  | string;

export type OpenApiJsonObject = {
  [key: string]: OpenApiJsonValue;
};

export function toOpenApiJsonValue(value: unknown): OpenApiJsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toOpenApiJsonValue);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        toOpenApiJsonValue(nested),
      ]),
    );
  }

  return null;
}
