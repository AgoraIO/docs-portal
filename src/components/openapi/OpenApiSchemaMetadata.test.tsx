import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  OpenApiSchemaAllowedValues,
  OpenApiSchemaMetadata,
} from './OpenApiSchemaMetadata';

describe('OpenApiSchemaMetadata', () => {
  it('renders metadata as aligned label and value rows', () => {
    render(
      <OpenApiSchemaMetadata
        items={[
          { key: 'format', label: 'Format', value: <code>slug</code> },
          { key: 'range', label: 'Range', value: '1 <= value <= 120' },
          {
            key: 'default',
            label: 'Default',
            value: <pre>{'{\n  "mode": "managed"\n}'}</pre>,
          },
        ]}
      />,
    );

    const metadata = document.querySelector('.openapi-schema-metadata');
    expect(metadata).toBeInTheDocument();

    const rows = metadata?.querySelectorAll('.openapi-schema-metadata-row');
    expect(rows).toHaveLength(3);

    expect(within(rows?.[0] as HTMLElement).getByText('Format:')).toHaveClass(
      'openapi-schema-metadata-label',
    );
    expect(
      within(rows?.[0] as HTMLElement)
        .getByText('slug')
        .closest('.openapi-schema-metadata-value'),
    ).toBeInTheDocument();
    expect(screen.getByText(/"mode": "managed"/)).toBeInTheDocument();
    expect(
      screen
        .getByText(/"mode": "managed"/)
        .closest('.openapi-schema-metadata-value'),
    ).toBeInTheDocument();

    const values = Array.from(
      metadata?.querySelectorAll('.openapi-schema-metadata-value') ?? [],
    );
    expect(values).toHaveLength(3);

    expect(
      Array.from(
        metadata?.querySelectorAll('.openapi-schema-metadata-label') ?? [],
      ).map((element) => element.textContent),
    ).toEqual(['Format:', 'Range:', 'Default:']);

    for (const value of values) {
      expect(value.firstElementChild).toHaveClass(
        'openapi-schema-value-container',
      );
    }
  });

  it('groups allowed values into one comma-separated value container', () => {
    render(
      <OpenApiSchemaMetadata
        items={[
          {
            key: 'allowed-values',
            label: 'Allowed values',
            value: (
              <OpenApiSchemaAllowedValues
                values={['GLOBAL', 'NORTH_AMERICA', 'EUROPE']}
              />
            ),
          },
        ]}
      />,
    );

    const container = document.querySelector('.openapi-schema-value-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('GLOBAL, NORTH_AMERICA, EUROPE');
    expect(container?.querySelectorAll('code')).toHaveLength(0);
    expect(
      container?.querySelectorAll('.openapi-schema-value-container'),
    ).toHaveLength(1);
  });

  it('returns no markup when there are no metadata items', () => {
    const { container } = render(<OpenApiSchemaMetadata items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
