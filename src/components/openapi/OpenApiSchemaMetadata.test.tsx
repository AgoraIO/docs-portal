import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenApiSchemaMetadata } from './OpenApiSchemaMetadata';

describe('OpenApiSchemaMetadata', () => {
  it('renders metadata as aligned label and value rows', () => {
    render(
      <OpenApiSchemaMetadata
        items={[
          { label: 'Format', value: <code>slug</code> },
          { label: 'Range', value: '1 <= value <= 120' },
          {
            label: 'Default',
            value: <pre>{'{\n  "mode": "managed"\n}'}</pre>,
          },
        ]}
      />,
    );

    const metadata = document.querySelector('.openapi-schema-metadata');
    expect(metadata).toBeInTheDocument();

    const rows = metadata?.querySelectorAll(
      '.openapi-schema-metadata-row',
    );
    expect(rows).toHaveLength(3);

    expect(within(rows?.[0] as HTMLElement).getByText('Format')).toHaveClass(
      'openapi-schema-metadata-label',
    );
    expect(
      within(rows?.[0] as HTMLElement)
        .getByText('slug')
        .closest('.openapi-schema-metadata-value'),
    ).toBeInTheDocument();
    expect(screen.getByText(/"mode": "managed"/)).toBeInTheDocument();
    expect(
      screen.getByText(/"mode": "managed"/).closest(
        '.openapi-schema-metadata-value',
      ),
    ).toBeInTheDocument();
  });

  it('returns no markup when there are no metadata items', () => {
    const { container } = render(<OpenApiSchemaMetadata items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
