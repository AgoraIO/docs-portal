import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type OpenApiFieldLabels, OpenApiFieldRow } from './OpenApiFieldRow';

const labels: OpenApiFieldLabels = {
  collapse: 'Collapse',
  copyLink: 'Copy link to',
  deprecated: 'Deprecated',
  expand: 'Expand',
  optional: 'Optional',
  properties: 'properties',
  required: 'Required',
};

const chineseLabels: OpenApiFieldLabels = {
  collapse: '折叠',
  copyLink: '复制链接',
  deprecated: '已弃用',
  expand: '展开',
  optional: '可选',
  properties: '属性',
  required: '必需',
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
        requiredState="optional"
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

  it('uses localized labels and collapses an expanded container', () => {
    const onExpandedChange = vi.fn();
    render(
      <OpenApiFieldRow
        anchorId="profile-cn"
        expandable
        expanded
        labels={chineseLabels}
        name="profile"
        onExpandedChange={onExpandedChange}
        type="object"
      />,
    );
    const button = screen.getByRole('button', { name: '折叠 profile 属性' });
    fireEvent.click(button);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('keeps the same control gutter for leaf and container rows', () => {
    const { unmount } = render(
      <OpenApiFieldRow
        anchorId="leaf"
        details={<p>Leaf details</p>}
        labels={labels}
        name="leaf"
        type="string"
      />,
    );
    const leafGutter = document.querySelector('.openapi-field-control-gutter');
    expect(leafGutter).toBeInTheDocument();
    expect(leafGutter).toHaveAttribute('class', expect.stringContaining('w-3'));
    expect(leafGutter).toHaveProperty('childElementCount', 0);
    expect(
      screen.queryByRole('button', { name: /Expand/ }),
    ).not.toBeInTheDocument();
    unmount();

    render(
      <OpenApiFieldRow
        anchorId="container"
        expandable
        expanded={false}
        labels={labels}
        name="container"
        onExpandedChange={vi.fn()}
        type="object"
      />,
    );
    expect(
      document.querySelector('.openapi-field-control-gutter'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('.openapi-field-control-gutter'),
    ).toHaveAttribute('class', expect.stringContaining('w-3'));
    expect(
      document.querySelector('.openapi-field-control-gutter'),
    ).not.toHaveProperty('childElementCount', 0);
  });

  it('uses aligned name wrappers and details padding for both field kinds', () => {
    const { unmount } = render(
      <OpenApiFieldRow
        anchorId="leaf-align"
        details={<p>Details</p>}
        labels={labels}
        name="leaf"
        type="string"
      />,
    );
    const leafNameWrapper = document.querySelector(
      '.openapi-field-main > div > div',
    );
    expect(leafNameWrapper).toHaveAttribute(
      'class',
      expect.stringContaining('gap-2'),
    );
    expect(document.querySelector('.openapi-field-details')).toHaveAttribute(
      'class',
      expect.stringContaining('ps-5'),
    );
    unmount();

    render(
      <OpenApiFieldRow
        anchorId="container-align"
        expandable
        expanded={false}
        labels={labels}
        name="container"
        onExpandedChange={vi.fn()}
        type="object"
      />,
    );
    const containerNameWrapper = document.querySelector(
      '.openapi-field-main > div > div',
    );
    expect(containerNameWrapper).toHaveAttribute(
      'class',
      expect.stringContaining('gap-2'),
    );
  });

  it('marks only expandable fields as containers', () => {
    const { container, unmount } = render(
      <OpenApiFieldRow
        anchorId="leaf-button-details"
        details={<button type="button">Nested action</button>}
        labels={labels}
        name="leaf"
        type="string"
      />,
    );
    expect(container.firstElementChild).not.toHaveClass(
      'openapi-field-row-container',
    );
    unmount();

    render(
      <OpenApiFieldRow
        anchorId="actual-container"
        expandable
        expanded={false}
        labels={labels}
        name="container"
        onExpandedChange={vi.fn()}
        type="object"
      />,
    );
    expect(document.querySelector('.openapi-field-row')).toHaveClass(
      'openapi-field-row-container',
    );
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
        expanded={false}
        labels={labels}
        name="settings"
        onExpandedChange={vi.fn()}
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

  it('allows long field names to wrap anywhere', () => {
    render(
      <OpenApiFieldRow
        anchorId="long-name"
        labels={labels}
        name="an_extremely_long_openapi_field_name_that_must_wrap"
        type="string"
      />,
    );
    expect(screen.getByText(/an_extremely_long_openapi/)).toHaveClass(
      'break-words',
      '[overflow-wrap:anywhere]',
    );
  });
});
