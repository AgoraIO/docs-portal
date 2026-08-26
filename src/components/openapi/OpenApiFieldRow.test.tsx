import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type OpenApiFieldLabels, OpenApiFieldRow } from './OpenApiFieldRow';

const labels: OpenApiFieldLabels = {
  collapse: 'Collapse',
  copyLink: 'Copy link to',
  deprecated: 'Deprecated',
  expand: 'Expand',
  optional: 'Optional',
  required: 'Required',
};

describe('OpenApiFieldRow', () => {
  it('renders leaf details inside the aligned wrapper and required badge', () => {
    render(
      <OpenApiFieldRow
        anchorId="user-id"
        details={<p>Identifier</p>}
        labels={labels}
        name="id"
        requiredState="required"
        type="string"
      />,
    );

    const main = document.querySelector('.openapi-field-main');
    expect(main).toBeInTheDocument();
    expect(main?.querySelector('.openapi-field-details')).toBeInTheDocument();
    expect(
      within(main as HTMLElement).getByText('Identifier'),
    ).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('puts container chevron and name in an expandable button', () => {
    const onExpandedChange = vi.fn();
    render(
      <OpenApiFieldRow
        anchorId="profile"
        expandable
        expanded={false}
        labels={labels}
        name="profile"
        onExpandedChange={onExpandedChange}
        type="object"
      />,
    );

    const button = screen.getByRole('button', {
      name: 'Expand profile properties',
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(within(button).getByText('profile')).toBeInTheDocument();
    fireEvent.click(button);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it('keeps the same control gutter for leaf and container rows', () => {
    const { unmount } = render(
      <OpenApiFieldRow
        anchorId="leaf"
        labels={labels}
        name="leaf"
        type="string"
      />,
    );
    const leafGutter = document.querySelector('.openapi-field-control-gutter');
    expect(leafGutter).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Expand/ }),
    ).not.toBeInTheDocument();
    unmount();

    render(
      <OpenApiFieldRow
        anchorId="container"
        expandable
        labels={labels}
        name="container"
        type="object"
      />,
    );
    expect(
      document.querySelector('.openapi-field-control-gutter'),
    ).toBeInTheDocument();
  });

  it('does not render a requiredness badge when state is omitted', () => {
    render(
      <OpenApiFieldRow
        anchorId="header"
        labels={labels}
        name="x-request-id"
        type="string"
      />,
    );
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
    expect(screen.queryByText('Optional')).not.toBeInTheDocument();
  });

  it('does not add child count or item object text', () => {
    render(
      <OpenApiFieldRow
        anchorId="settings"
        expandable
        labels={labels}
        name="settings"
        type="object"
      />,
    );
    expect(screen.queryByText(/fields|item object/i)).not.toBeInTheDocument();
  });

  it('always renders a link anchor with stable accessible attributes', () => {
    render(
      <OpenApiFieldRow
        anchorId="query-limit"
        labels={labels}
        name="limit"
        type="integer"
      />,
    );
    const anchor = document.querySelector('.openapi-field-anchor');
    expect(anchor).toHaveAttribute('href', '#query-limit');
    expect(anchor).toHaveAttribute('aria-label', 'Copy link to query-limit');
  });
});
