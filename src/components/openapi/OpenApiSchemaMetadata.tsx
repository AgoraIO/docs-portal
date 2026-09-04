import type { ReactNode } from 'react';

export type OpenApiSchemaMetadataItem = {
  label: string;
  value: ReactNode;
};

export function OpenApiSchemaMetadata({
  items,
}: {
  items: OpenApiSchemaMetadataItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="openapi-schema-metadata">
      {items.map(({ label, value }, index) => (
        <div className="openapi-schema-metadata-row" key={`${label}:${index}`}>
          <div className="openapi-schema-metadata-label">{label}</div>
          <div className="openapi-schema-metadata-value break-words">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
