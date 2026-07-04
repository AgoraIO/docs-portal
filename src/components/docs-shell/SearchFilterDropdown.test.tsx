import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchFilterDropdown } from './SearchFilterDropdown';

const groups = [
  {
    label: 'Realtime Media',
    options: [
      {
        description: 'Real-time voice.',
        label: 'Voice Calling',
        value: 'product:voice',
      },
      {
        description: 'Multi-party video.',
        label: 'Video Calling',
        value: 'product:video',
      },
    ],
  },
];

describe('SearchFilterDropdown', () => {
  it('shows the all-label when nothing is selected', () => {
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={vi.fn()}
        searchPlaceholder="Filter products…"
        value={null}
      />,
    );
    expect(
      screen.getByRole('combobox', { name: 'All products' }),
    ).toHaveTextContent('All products');
  });

  it('shows the selected label and clears it without opening', () => {
    const onChange = vi.fn();
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={onChange}
        searchPlaceholder="Filter products…"
        value="product:video"
      />,
    );
    expect(
      screen.getByRole('combobox', { name: /All products/ }),
    ).toHaveTextContent('Video Calling');
    fireEvent.click(screen.getByTestId('search-filter-clear'));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(
      screen.queryByPlaceholderText('Filter products…'),
    ).not.toBeInTheDocument();
  });

  it('still selects an option when rendered outside any dialog (container defaults to body)', async () => {
    const onChange = vi.fn();
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={onChange}
        searchPlaceholder="Filter products…"
        value={null}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'All products' }));
    fireEvent.click(await screen.findByText('Video Calling'));
    expect(onChange).toHaveBeenCalledWith('product:video');
  });

  it('selects an option from the open dropdown', async () => {
    const onChange = vi.fn();
    render(
      <SearchFilterDropdown
        allLabel="All products"
        groups={groups}
        onChange={onChange}
        searchPlaceholder="Filter products…"
        value={null}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'All products' }));
    fireEvent.click(await screen.findByText('Voice Calling'));
    expect(onChange).toHaveBeenCalledWith('product:voice');
  });
});
