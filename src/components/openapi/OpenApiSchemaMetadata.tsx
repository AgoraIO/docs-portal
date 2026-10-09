import type { ReactNode } from 'react';

export type OpenApiSchemaMetadataItem = {
  key?: string;
  label: string;
  value: ReactNode;
};

export function OpenApiSchemaAllowedValues({ values }: { values: unknown[] }) {
  return (
    <span className="openapi-schema-allowed-values">
      {values.map((value, index) => {
        const key = getAllowedValueKey(value, index);

        return (
          <span data-openapi-allowed-value-key={key} key={key}>
            {index > 0 ? ', ' : null}
            {formatAllowedValue(value)}
          </span>
        );
      })}
    </span>
  );
}

export function OpenApiSchemaMetadata({
  items,
}: {
  items: OpenApiSchemaMetadataItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="openapi-schema-metadata">
      {items.map(({ key, label, value }) => (
        <div className="openapi-schema-metadata-row" key={key ?? label}>
          <span className="openapi-schema-metadata-label">{label}:</span>
          <div className="openapi-schema-metadata-value">
            <div className="openapi-schema-value-container min-w-0 max-w-full [overflow-wrap:anywhere]">
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatAllowedValue(value: unknown) {
  if (typeof value === 'string') return value;
  return serializeAllowedValue(value);
}

function getAllowedValueKey(value: unknown, index: number) {
  return `${typeof value}:${serializeAllowedValue(value)}:${index}`;
}

function serializeAllowedValue(value: unknown) {
  if (value === undefined) return 'undefined';

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
