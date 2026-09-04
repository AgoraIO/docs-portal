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
          <code
            className="me-1 inline-block max-w-full break-words rounded border border-border px-1.5 py-0.5 font-mono text-xs [overflow-wrap:anywhere]"
            data-openapi-allowed-value-key={key}
            key={key}
          >
            {formatAllowedValue(value)}
          </code>
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
          <div className="openapi-schema-metadata-label">{label}</div>
          <div className="openapi-schema-metadata-value break-words">
            {value}
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
