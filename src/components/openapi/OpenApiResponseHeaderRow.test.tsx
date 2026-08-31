import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenApiResponseHeaderRow } from './OpenApiResponseHeaderRow';

describe('OpenApiResponseHeaderRow', () => {
  it('renders a compact separator row without request requiredness', () => {
    render(
      <OpenApiResponseHeaderRow
        anchorId="response-headers-200-x-request-id"
        copyLinkLabel="Copy link to"
        deprecated
        deprecatedLabel="Deprecated"
        details={<p>Correlation identifier.</p>}
        name="X-Request-ID"
        type="string"
      />,
    );

    const row = screen.getByText('X-Request-ID').closest('div.border-t');
    expect(row).toHaveAttribute('id', 'response-headers-200-x-request-id');
    expect(row).toHaveTextContent('string');
    expect(row).toHaveTextContent('Deprecated');
    expect(row).not.toHaveTextContent('required');
    expect(row).not.toHaveTextContent('optional');
    expect(
      screen.getByRole('link', {
        name: 'Copy link to response-headers-200-x-request-id',
      }),
    ).toHaveAttribute('href', '#response-headers-200-x-request-id');
  });
});
